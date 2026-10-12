const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const URL = process.env.GUVERTE_QA_URL || 'http://127.0.0.1:5173/';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = path.join(__dirname, 'qa-artifacts');

function minNpcDistance(npcs) {
  let min = Infinity;
  for (let i = 0; i < npcs.length; i += 1) {
    for (let j = i + 1; j < npcs.length; j += 1) {
      const dx = npcs[i].x - npcs[j].x;
      const dz = npcs[i].z - npcs[j].z;
      min = Math.min(min, Math.hypot(dx, dz));
    }
  }
  return Number.isFinite(min) ? Number(min.toFixed(2)) : null;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: EDGE,
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const errors = [];
  page.on('pageerror', err => errors.push(String(err.message || err)));
  page.on('console', msg => {
    if (msg.type() === 'error' && !/ERR_ABORTED|ERR_NETWORK_IO_SUSPENDED/.test(msg.text())) {
      errors.push(msg.text());
    }
  });

  try {
    fs.mkdirSync(OUT, { recursive: true });
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => window.__guverteAppReady === true && window.__GUVERTE_FP3D, null, { timeout: 20000 });
    await page.evaluate(async () => {
      try { localStorage.removeItem('guverte-first-person-world-v2'); } catch (_err) {}
      await window.openFirstPersonMode();
      await new Promise(resolve => setTimeout(resolve, 650));
      await window.__GUVERTE_FP3D.changeCompartment('deck');
      await new Promise(resolve => setTimeout(resolve, 1200));
    });
    await page.waitForFunction(() => window.__GUVERTE_FP3D?.state?.area === 'deck' && window.__GUVERTE_FP3D?.state?.ready, null, { timeout: 10000 });

    const metrics = await page.evaluate(() => {
      const runtime = window.__GUVERTE_FP3D?.state;
      const npcs = (runtime?.npcs || []).map(item => ({
        id: item.id,
        x: item.object?.position?.x || 0,
        z: item.object?.position?.z || 0,
        y: item.object?.position?.y || 0,
        grounded: item.anim?.groundContactFooting === true || item.anim?.professionalFootGroundLock === true,
        solid: item.anim?.root?.userData?.professionalCrewSolidMaterials === true
      }));
      const visibleMarkers = Array.from(document.querySelectorAll('.fp3d-marker.visible'));
      const textMarkers = visibleMarkers.filter(node => {
        return Array.from(node.querySelectorAll('b,small,em')).some(child => {
          const style = getComputedStyle(child);
          const rect = child.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 2 && rect.height > 2 && (child.textContent || '').trim().length > 0;
        });
      }).length;
      const hiddenPanels = [
        '.fp3d-world-status',
        '.fp3d-ship-telemetry',
        '.fp3d-ship-systems',
        '.fp3d-room-passport',
        '.fp3d-sensory-strip',
        '.fp3d-risk-meter',
        '.fp3d-duty-chain',
        '.fp3d-field-log',
        '.fp3d-scene-report',
        '.fp3d-mission-dock',
        '.fp3d-jump-dock',
        '.fp3d-action-dock'
      ]
        .filter(sel => getComputedStyle(document.querySelector(sel)).display === 'none').length;
      const shipParts = [];
      const motionCues = [];
      runtime?.scene?.traverse?.(obj => {
        if (obj?.userData?.deckVisibleShip) shipParts.push(obj.name || 'deck-visible-ship');
        if (obj?.userData?.deckMotionCue) motionCues.push(obj.name || 'deck-motion-cue');
      });
      const canvas = document.querySelector('#fp3d-canvas');
      return {
        area: runtime?.area,
        ready: !!runtime?.ready,
        canvas: { width: canvas?.width || 0, height: canvas?.height || 0 },
        shipParts,
        motionCues,
        npcCount: npcs.length,
        npcs,
        visibleMarkers: visibleMarkers.length,
        textMarkers,
        hiddenPanels,
        errors: []
      };
    });
    metrics.minNpcDistance = minNpcDistance(metrics.npcs);
    metrics.screenshot = path.join(OUT, 'deck-smoke.png');
    await page.screenshot({ path: metrics.screenshot, fullPage: false });
    metrics.errors = errors;
    metrics.passed = Boolean(
      metrics.area === 'deck' &&
      metrics.ready &&
      metrics.canvas.width > 600 &&
      metrics.canvas.height > 360 &&
      metrics.shipParts.length >= 7 &&
      metrics.motionCues.length >= 8 &&
      metrics.npcCount >= 2 &&
      metrics.npcs.every(npc => npc.solid) &&
      metrics.minNpcDistance >= 1.05 &&
      metrics.textMarkers === 0 &&
      metrics.hiddenPanels >= 12 &&
      metrics.errors.length === 0
    );
    console.log(JSON.stringify(metrics, null, 2));
    if (!metrics.passed) process.exit(1);
  } finally {
    await browser.close();
  }
})();
