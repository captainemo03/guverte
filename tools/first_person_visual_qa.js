const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'tools', 'qa-artifacts');
const URL = process.env.GUVERTE_QA_URL || 'http://127.0.0.1:4173/';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function ignoreBrowserNoise(text) {
  return /ERR_NETWORK_IO_SUSPENDED|ERR_ABORTED/.test(String(text || ''));
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function pngStatsFromBuffer(buffer) {
  if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47 || buffer.readUInt32BE(4) !== 0x0d0a1a0a) {
    throw new Error('not a PNG buffer');
  }
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd > buffer.length) throw new Error('truncated PNG chunk');
    if (type === 'IHDR') {
      width = buffer.readUInt32BE(dataStart);
      height = buffer.readUInt32BE(dataStart + 4);
      bitDepth = buffer[dataStart + 8];
      colorType = buffer[dataStart + 9];
    } else if (type === 'IDAT') {
      idat.push(buffer.subarray(dataStart, dataEnd));
    } else if (type === 'IEND') {
      break;
    }
    offset = dataEnd + 4;
  }
  if (!width || !height || bitDepth !== 8) throw new Error('unsupported PNG dimensions/bit depth');
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0;
  if (!channels) throw new Error('unsupported PNG color type ' + colorType);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const prev = Buffer.alloc(stride);
  const cur = Buffer.alloc(stride);
  let pos = 0;
  let min = 255;
  let max = 0;
  let sum = 0;
  let sumSq = 0;
  let samples = 0;
  const sampleEvery = Math.max(1, Math.floor((width * height) / 24000));
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    raw.copy(cur, 0, pos, pos + stride);
    pos += stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? cur[x - channels] : 0;
      const up = prev[x];
      const upLeft = x >= channels ? prev[x - channels] : 0;
      if (filter === 1) cur[x] = (cur[x] + left) & 255;
      else if (filter === 2) cur[x] = (cur[x] + up) & 255;
      else if (filter === 3) cur[x] = (cur[x] + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) cur[x] = (cur[x] + paethPredictor(left, up, upLeft)) & 255;
      else if (filter !== 0) throw new Error('unsupported PNG filter ' + filter);
    }
    for (let x = 0; x < width; x += sampleEvery) {
      const i = x * channels;
      const lum = channels === 1 ? cur[i] : Math.round(cur[i] * 0.2126 + cur[i + 1] * 0.7152 + cur[i + 2] * 0.0722);
      min = Math.min(min, lum);
      max = Math.max(max, lum);
      sum += lum;
      sumSq += lum * lum;
      samples++;
    }
    cur.copy(prev);
  }
  const mean = sum / Math.max(1, samples);
  const variance = sumSq / Math.max(1, samples) - mean * mean;
  return { width, height, samples, min, max, mean: Number(mean.toFixed(2)), variance: Number(variance.toFixed(2)), nonBlank: max - min > 24 && variance > 80, method: 'png-zlib' };
}

async function imageStats(buffer) {
  try {
    const sharp = require('sharp');
    const result = await sharp(buffer).resize(160, 100, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const data = result.data;
    let min = 255;
    let max = 0;
    let sum = 0;
    let sumSq = 0;
    for (const value of data) {
      min = Math.min(min, value);
      max = Math.max(max, value);
      sum += value;
      sumSq += value * value;
    }
    const mean = sum / data.length;
    const variance = sumSq / data.length - mean * mean;
    return { min, max, mean: Number(mean.toFixed(2)), variance: Number(variance.toFixed(2)), nonBlank: max - min > 24 && variance > 80, method: 'sharp' };
  } catch (_sharpError) {
    return pngStatsFromBuffer(buffer);
  }
}

async function inspectLayout(page) {
  return page.evaluate(() => {
    const pick = selector => {
      const node = document.querySelector(selector);
      if (!node) return { selector, missing: true };
      const rect = node.getBoundingClientRect();
      return {
        selector,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        inside: rect.left >= -1 && rect.top >= -1 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1
      };
    };
    const runtime = window.__GUVERTE_FP3D?.state;
    const fxTypes = Object.create(null);
    const liveOpsLabels = [];
    (runtime?.ambientFx || []).forEach(fx => {
      if (!fx?.type) return;
      fxTypes[fx.type] = (fxTypes[fx.type] || 0) + 1;
      if (fx.type === 'liveOpsBeacon' && fx.label) liveOpsLabels.push(String(fx.label));
    });
    const crewWorkStates = Object.create(null);
    (runtime?.npcs || []).forEach(item => {
      const key = item?.anim?.workState || 'unknown';
      crewWorkStates[key] = (crewWorkStates[key] || 0) + 1;
    });
    const npcTextMarkers = Array.from(document.querySelectorAll('.fp3d-marker.npc.visible')).filter(node => {
      return ['b', 'small', 'em'].some(selector => {
        const child = node.querySelector(selector);
        if (!child || !child.textContent.trim()) return false;
        const style = getComputedStyle(child);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
    }).length;
    const liveOpsRuntimeAudit = {
      beacons: fxTypes.liveOpsBeacon || 0,
      slides: fxTypes.liveOpsSlide || 0,
      needles: fxTypes.liveOpsNeedle || 0,
      vestibules: fxTypes.entryVestibuleSeal || 0,
      trafficFlows: fxTypes.trafficFlowArrow || 0,
      trafficSegments: fxTypes.trafficFlowSegment || 0,
      taskLines: (runtime?.npcs || []).filter(item => item?.anim?.taskLine).length,
      taskBadges: (runtime?.npcs || []).filter(item => item?.anim?.taskBadge).length,
      visibleTaskBadges: (runtime?.npcs || []).filter(item => item?.anim?.taskBadge?.visible).length,
      visibleTaskLinks: (runtime?.npcs || []).filter(item => item?.anim?.taskLine?.visible).length,
      overheadTextSprites: (runtime?.npcs || []).filter(item => item?.anim?.taskBadge?.visible || item?.anim?.plate?.visible || item?.anim?.speech?.visible).length,
      npcTextMarkers,
      crewWorkStates,
      activeCrewStates: Object.keys(crewWorkStates).filter(key => key !== 'unknown').length,
      motionSignatures: (runtime?.npcs || []).filter(item => (item?.anim?.motionSignature || 0) > 0.02).length,
      stationGazes: (runtime?.npcs || []).filter(item => item?.anim?.professionalStationGaze).length,
      meshOnlyCrew: (runtime?.npcs || []).filter(item => item?.anim?.professionalMeshOnlyCrew && item?.anim?.avatarSprite?.visible === false).length,
      groundedCrew: (runtime?.npcs || []).filter(item => item?.anim?.professionalFootGroundLock && (item?.anim?.groundContactScore || 0) >= 0.06 && Math.abs(item?.object?.position?.y || 0) < 0.03).length,
      labels: liveOpsLabels.slice(0, 8)
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      ready: Boolean(runtime?.ready && runtime?.renderer && runtime?.scene),
      area: runtime?.area,
      objects: runtime?.scene?.children?.length || 0,
      interactions: runtime?.interactions?.length || 0,
      visibleMarkers: document.querySelectorAll('.fp3d-marker.visible').length,
      areaNavVisible: (() => { const node = document.querySelector('.fp3d-area-nav'); if (!node) return false; const rect = node.getBoundingClientRect(); const style = getComputedStyle(node); return style.display !== 'none' && rect.width > 200 && rect.height > 30; })(),
      lookControl: runtime?.look || null,
      liveOpsRuntimeAudit,
      shipMotion: runtime?.shipMotion || null,
      webgl: Boolean(document.querySelector('#fp3d-canvas')?.getContext('webgl2') || document.querySelector('#fp3d-canvas')?.getContext('webgl')),
      controls: [
        pick('.fp3d-hud'),
        pick('.fp3d-minimap'),
        pick('.fp3d-stick'),
        pick('.fp3d-use'),
        pick('.fp3d-run'),
        pick('.fp3d-prompt')
      ]
    };
  });
}

async function openWorld(page) {
  await page.addInitScript(() => { try { localStorage.removeItem('guverte-first-person-world-v2'); } catch (_err) {} });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.__guverteAppReady === true, null, { timeout: 20000 });
  await page.waitForFunction(() => typeof window.__GUVERTE_FP3D?.open === 'function', null, { timeout: 20000 });
  await page.evaluate(() => window.__GUVERTE_FP3D.open());
  await page.waitForFunction(() => window.__GUVERTE_FP3D?.state?.ready === true, null, { timeout: 30000 });
  await page.waitForTimeout(900);
}


async function captureTransferAudit(page, toArea) {
  const beforeArea = await page.evaluate(() => window.__GUVERTE_FP3D?.state?.area || 'unknown');
  const transferPromise = page.evaluate(area => window.__GUVERTE_FP3D.setArea(area), toArea);
  await page.waitForFunction(() => document.querySelector('.fp3d-compartment-transfer.show') !== null, null, { timeout: 1200 });
  const visible = await page.evaluate(() => {
    const node = document.querySelector('.fp3d-compartment-transfer');
    const root = document.querySelector('.fp3d-root');
    return {
      shown: Boolean(node?.classList.contains('show')),
      from: node?.dataset?.from || '',
      to: node?.dataset?.to || '',
      locked: Boolean(root?.classList.contains('transfer-lock')),
      title: document.querySelector('#fp3d-transfer-title')?.textContent?.trim() || '',
      line: document.querySelector('#fp3d-transfer-line')?.textContent?.trim() || ''
    };
  });
  await transferPromise;
  await page.waitForFunction(area => window.__GUVERTE_FP3D.state.area === area, toArea, { timeout: 5000 });
  const hiddenAfter = await page.evaluate(() => !document.querySelector('.fp3d-compartment-transfer')?.classList.contains('show') && !document.querySelector('.fp3d-root')?.classList.contains('transfer-lock'));
  return { beforeArea, toArea, ...visible, hiddenAfter, passed: visible.shown && visible.locked && visible.from === beforeArea && visible.to === toArea && hiddenAfter };
}


async function runShipMapEntryAudit(page) {
  await page.evaluate(async () => {
    const api = window.__GUVERTE_FP3D;
    if (api?.setArea && api.state?.area !== 'bridge') {
      const result = api.setArea('bridge');
      if (result && typeof result.then === 'function') await result;
    }
  });
  await page.waitForFunction(() => window.__GUVERTE_FP3D?.state?.area === 'bridge', null, { timeout: 5000 });
  await page.waitForFunction(() => !document.querySelector('.fp3d-root')?.classList.contains('transfer-lock') && !document.querySelector('.fp3d-compartment-transfer')?.classList.contains('show'), null, { timeout: 5000 });
  await page.evaluate(() => window.openMap());
  await page.waitForFunction(() => document.querySelector('#map-panel.show.ship') && document.querySelector('#ship-map-svg .ship-map-zone'), null, { timeout: 5000 });
  await page.waitForTimeout(450);
  const before = await page.evaluate(() => {
    const zoneNodes = Array.from(document.querySelectorAll('#ship-map-svg .ship-map-zone'));
    const status = document.querySelector('#ship-map-status')?.textContent?.trim() || '';
    const panel = document.querySelector('#map-panel');
    const engineZone = zoneNodes.find(node => (node.getAttribute('aria-label') || '').toLowerCase().includes('makine'));
    return {
      shown: Boolean(panel?.classList.contains('show') && panel?.classList.contains('ship')),
      zones: zoneNodes.length,
      livePins: document.querySelectorAll('#ship-map-svg .ship-map-live-pin').length,
      entryHud: Boolean(document.querySelector('#ship-map-svg .ship-map-entry-hud')),
      intel: Boolean(document.querySelector('#ship-map-intel .ship-map-intel-card')),
      status,
      engineClickable: Boolean(engineZone?.getAttribute('onclick')?.includes('enterShipCompartmentFromMap')),
      activeArea: window.__GUVERTE_FP3D?.state?.area || ''
    };
  });
  const mapBuffer = await page.screenshot({ path: path.join(OUT, 'ship-map-overhead.png'), fullPage: false });
  const clickPoint = await page.evaluate(() => {
    const engineZone = Array.from(document.querySelectorAll('#ship-map-svg .ship-map-zone')).find(node => (node.getAttribute('aria-label') || '').toLowerCase().includes('makine'));
    if (!engineZone) throw new Error('engine ship-map zone missing');
    const rect = engineZone.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });
  let clickAttempts = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    clickAttempts = attempt + 1;
    await page.mouse.move(clickPoint.x, clickPoint.y);
    await page.mouse.down();
    await page.waitForTimeout(70);
    await page.mouse.up();
    await page.waitForTimeout(1300);
    const closed = await page.evaluate(() => !document.querySelector('#map-panel')?.classList.contains('show'));
    if (closed) break;
  }
  await page.waitForFunction(() => !document.querySelector('#map-panel')?.classList.contains('show'), null, { timeout: 7000 });
  await page.waitForFunction(() => window.__GUVERTE_FP3D?.state?.area === 'engine', null, { timeout: 9000 });
  await page.waitForFunction(() => !document.querySelector('.fp3d-root')?.classList.contains('transfer-lock') && !document.querySelector('.fp3d-compartment-transfer')?.classList.contains('show'), null, { timeout: 22000 });
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => ({
    area: window.__GUVERTE_FP3D?.state?.area || '',
    mapOpen: Boolean(document.querySelector('#map-panel')?.classList.contains('show')),
    rootReady: Boolean(window.__GUVERTE_FP3D?.state?.ready),
    transferHidden: !document.querySelector('.fp3d-compartment-transfer')?.classList.contains('show')
  }));
  return {
    ...before,
    image: await imageStats(mapBuffer),
    clickAttempts,
    mapEntryArea: after.area,
    mapClosedAfterEntry: !after.mapOpen,
    rootReadyAfterEntry: after.rootReady,
    transferHiddenAfterEntry: after.transferHidden,
    passed: before.shown && before.zones >= 8 && before.livePins >= 8 && before.entryHud && before.intel && before.engineClickable && before.status.includes('canli ustten takip') && after.area === 'engine' && !after.mapOpen && after.rootReady && after.transferHidden
  };
}

async function runDirectCompartmentUiAudit(page) {
  await page.evaluate(async () => {
    const api = window.__GUVERTE_FP3D;
    if (api?.setArea && api.state?.area !== 'bridge') {
      const result = api.setArea('bridge');
      if (result && typeof result.then === 'function') await result;
    }
  });
  await page.waitForFunction(() => window.__GUVERTE_FP3D?.state?.area === 'bridge', null, { timeout: 7000 });
  await waitForCompartmentSettled(page);
  const before = await page.evaluate(() => {
    const nav = document.querySelector('.fp3d-area-nav');
    const engine = document.querySelector('.fp3d-area-nav button[data-area="engine"]');
    const deck = document.querySelector('.fp3d-area-nav button[data-area="deck"]');
    const navRect = nav?.getBoundingClientRect();
    const engineRect = engine?.getBoundingClientRect();
    return {
      area: window.__GUVERTE_FP3D?.state?.area || '',
      navVisible: Boolean(nav && getComputedStyle(nav).display !== 'none' && navRect.width > 200 && navRect.height > 30),
      engineButtonVisible: Boolean(engine && engineRect.width > 40 && engineRect.height > 24),
      deckButtonVisible: Boolean(deck),
      navLabel: nav?.textContent?.replace(/\s+/g, ' ').trim() || ''
    };
  });
  await page.click('.fp3d-area-nav button[data-area="engine"]');
  await page.waitForFunction(() => document.querySelector('.fp3d-compartment-transfer.show') !== null, null, { timeout: 1500 });
  const duringEngine = await page.evaluate(() => ({
    shown: Boolean(document.querySelector('.fp3d-compartment-transfer')?.classList.contains('show')),
    locked: Boolean(document.querySelector('.fp3d-root')?.classList.contains('transfer-lock')),
    to: document.querySelector('.fp3d-compartment-transfer')?.dataset?.to || ''
  }));
  await page.waitForFunction(() => window.__GUVERTE_FP3D?.state?.area === 'engine', null, { timeout: 9000 });
  await waitForCompartmentSettled(page);
  const afterEngine = await page.evaluate(() => ({
    area: window.__GUVERTE_FP3D?.state?.area || '',
    navActive: document.querySelector('.fp3d-area-nav button[data-area="engine"]')?.classList.contains('active') || false,
    rootArea: document.querySelector('.fp3d-root')?.dataset?.area || ''
  }));
  await page.click('.fp3d-area-nav button[data-area="deck"]');
  await page.waitForFunction(() => window.__GUVERTE_FP3D?.state?.area === 'deck', null, { timeout: 9000 });
  await waitForCompartmentSettled(page);
  const afterDeck = await page.evaluate(() => ({
    area: window.__GUVERTE_FP3D?.state?.area || '',
    navActive: document.querySelector('.fp3d-area-nav button[data-area="deck"]')?.classList.contains('active') || false,
    rootArea: document.querySelector('.fp3d-root')?.dataset?.area || ''
  }));
  return {
    before,
    duringEngine,
    afterEngine,
    afterDeck,
    passed: before.navVisible && before.engineButtonVisible && duringEngine.shown && duringEngine.locked && duringEngine.to === 'engine' && afterEngine.area === 'engine' && afterEngine.navActive && afterDeck.area === 'deck' && afterDeck.navActive
  };
}

async function waitForCompartmentSettled(page, timeout = 12000) {
  await page.waitForFunction(() => !document.querySelector('.fp3d-root')?.classList.contains('transfer-lock') && !document.querySelector('.fp3d-compartment-transfer')?.classList.contains('show'), null, { timeout });
}

async function runAllCompartmentReachabilityAudit(page) {
  const areaIds = await page.evaluate(() => Object.keys(window.__GUVERTE_FP3D?.areas || {}));
  const results = [];
  for (const areaId of areaIds) {
    await page.evaluate(async area => {
      const result = window.__GUVERTE_FP3D.setArea(area);
      if (result && typeof result.then === 'function') await result;
    }, areaId);
    await page.waitForFunction(area => window.__GUVERTE_FP3D?.state?.area === area, areaId, { timeout: 9000 });
    await waitForCompartmentSettled(page);
    await page.waitForTimeout(420);
    results.push(await page.evaluate(area => {
      const api = window.__GUVERTE_FP3D;
      const spec = api?.areas?.[area] || {};
      const runtime = api?.state || {};
      const localItems = (runtime.interactions || []).filter(item => item?.type !== 'door' && item?.type !== 'npc');
      const doors = (runtime.interactions || []).filter(item => item?.type === 'door');
      const npcs = runtime.npcs || [];
      const passport = document.querySelector('.fp3d-room-passport');
      const code = document.querySelector('#fp3d-room-code')?.textContent?.trim() || '';
      const role = document.querySelector('#fp3d-room-role')?.textContent?.trim() || '';
      const risk = document.querySelector('#fp3d-room-risk')?.textContent?.trim() || '';
      const motion = runtime.shipMotion || null;
      const trafficFlows = (runtime.ambientFx || []).filter(fx => fx?.type === 'trafficFlowArrow').length;
      const trafficSegments = (runtime.ambientFx || []).filter(fx => fx?.type === 'trafficFlowSegment').length;
      const crewWorkStates = Object.create(null);
      npcs.forEach(item => {
        const key = item?.anim?.workState || 'unknown';
        crewWorkStates[key] = (crewWorkStates[key] || 0) + 1;
      });
      const taskBadges = npcs.filter(item => item?.anim?.taskBadge).length;
      const visibleTaskBadges = npcs.filter(item => item?.anim?.taskBadge?.visible).length;
      const visibleTaskLinks = npcs.filter(item => item?.anim?.taskLine?.visible).length;
      const overheadTextSprites = npcs.filter(item => item?.anim?.taskBadge?.visible || item?.anim?.plate?.visible || item?.anim?.speech?.visible).length;
      const npcTextMarkers = Array.from(document.querySelectorAll('.fp3d-marker.npc.visible')).filter(node => {
        return ['b', 'small', 'em'].some(selector => {
          const child = node.querySelector(selector);
          if (!child || !child.textContent.trim()) return false;
          const style = getComputedStyle(child);
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        });
      }).length;
      const activeCrewStates = Object.keys(crewWorkStates).filter(key => key !== 'unknown').length;
      const motionSignatures = npcs.filter(item => (item?.anim?.motionSignature || 0) > 0.02).length;
      const stationGazes = npcs.filter(item => item?.anim?.professionalStationGaze).length;
      const groundedCrew = npcs.filter(item => item?.anim?.professionalFootGroundLock && (item?.anim?.groundContactScore || 0) >= 0.06 && Math.abs(item?.object?.position?.y || 0) < 0.03).length;
      const signature = [spec.title || '', spec.subtitle || '', role, risk, localItems.map(item => item.label).slice(0, 4).join('|')].join(' / ');
      const passed = runtime.area === area && runtime.ready && doors.length >= 1 && localItems.length >= 2 && npcs.length >= 1 && taskBadges >= npcs.length && visibleTaskBadges === 0 && visibleTaskLinks >= 1 && overheadTextSprites === 0 && npcTextMarkers === 0 && activeCrewStates >= 1 && motionSignatures >= 1 && stationGazes >= 1 && groundedCrew >= npcs.length && trafficFlows >= 2 && trafficSegments >= 2 && code && role && passport?.dataset?.theme && motion?.openWorldShipMotion;
      return {
        area,
        title: spec.title || '',
        subtitle: spec.subtitle || '',
        theme: spec.theme || '',
        runtimeArea: runtime.area || '',
        doors: doors.length,
        stations: localItems.length,
        npcs: npcs.length,
        taskBadges,
        visibleTaskBadges,
        visibleTaskLinks,
        overheadTextSprites,
        npcTextMarkers,
        crewWorkStates,
        activeCrewStates,
        motionSignatures,
        stationGazes,
        groundedCrew,
        trafficFlows,
        trafficSegments,
        code,
        role,
        risk,
        passportTheme: passport?.dataset?.theme || '',
        shipMotion: motion,
        signature,
        passed
      };
    }, areaId));
  }
  const signatures = new Set(results.map(item => item.signature));
  const required = ['bridge','corridor','deck','engine','radio','cargo','cabin','mess','galley','infirmary'];
  return {
    total: results.length,
    requiredPresent: required.every(id => areaIds.includes(id)),
    uniqueSignatures: signatures.size,
    results,
    passed: results.length >= 10 && required.every(id => areaIds.includes(id)) && signatures.size === results.length && results.every(item => item.passed)
  };
}

async function runDesktop(browser, report) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => { const text = String(error.message || error); if (!ignoreBrowserNoise(text)) errors.push(text); });
  page.on('console', message => { if (message.type() === 'error' && !ignoreBrowserNoise(message.text())) errors.push(message.text()); });
  await openWorld(page);
  await page.evaluate(() => { window.__GUVERTE_FP3D.setArea('bridge'); window.__GUVERTE_FP3D.resetPlayer?.(); });
  await page.waitForTimeout(180);
  const movementStart = await page.evaluate(() => ({ ...window.__GUVERTE_FP3D.state.player }));
  const movementAttempts = [];
  let bestMovement = { key: '', before: movementStart, after: movementStart, distance: 0 };
  for (const key of ['w', 's', 'a', 'd']) {
    const before = await page.evaluate(() => ({ ...window.__GUVERTE_FP3D.state.player }));
    await page.keyboard.down('Shift');
    await page.keyboard.down(key);
    await page.waitForTimeout(1050);
    await page.keyboard.up(key);
    await page.keyboard.up('Shift');
    await page.waitForTimeout(140);
    const after = await page.evaluate(() => ({ ...window.__GUVERTE_FP3D.state.player }));
    const distance = Number(Math.hypot(after.x - before.x, after.z - before.z).toFixed(3));
    const attempt = { key, before, after, distance };
    movementAttempts.push(attempt);
    if (distance > bestMovement.distance) bestMovement = attempt;
    if (distance > 0.15) break;
  }
  const lookBefore = await page.evaluate(() => ({ yaw: window.__GUVERTE_FP3D.state.yaw, pitch: window.__GUVERTE_FP3D.state.pitch, delta: window.__GUVERTE_FP3D.state.look?.delta || 0 }));
  await page.evaluate(() => {
    const canvas = document.querySelector('#fp3d-canvas');
    const target = canvas || document.querySelector('.fp3d-root');
    const rect = target.getBoundingClientRect();
    const startX = rect.left + rect.width * 0.56;
    const startY = rect.top + rect.height * 0.56;
    const opts = { bubbles: true, cancelable: true, pointerId: 77, pointerType: 'mouse', isPrimary: true };
    target.dispatchEvent(new PointerEvent('pointerdown', { ...opts, clientX: startX, clientY: startY }));
    target.dispatchEvent(new PointerEvent('pointermove', { ...opts, clientX: startX + 150, clientY: startY - 46 }));
    target.dispatchEvent(new PointerEvent('pointerup', { ...opts, clientX: startX + 150, clientY: startY - 46 }));
    window.__GUVERTE_FP3D.lookBy?.(24, -8);
  });
  await page.waitForTimeout(120);
  const lookAfter = await page.evaluate(() => ({ yaw: window.__GUVERTE_FP3D.state.yaw, pitch: window.__GUVERTE_FP3D.state.pitch, delta: window.__GUVERTE_FP3D.state.look?.delta || 0, professionalLookControl: !!window.__GUVERTE_FP3D.state.look?.professionalLookControl }));
  await page.evaluate(() => document.exitPointerLock?.());
  const desktopBuffer = await page.screenshot({ path: path.join(OUT, 'first-person-desktop.png'), fullPage: false });
  report.desktop = await inspectLayout(page);
  report.desktop.movement = {
    ...bestMovement,
    movementAttempts,
    passed: bestMovement.distance > 0.15
  };
  report.desktop.look = {
    before: lookBefore,
    after: lookAfter,
    yawDelta: Number(Math.abs(lookAfter.yaw - lookBefore.yaw).toFixed(4)),
    pitchDelta: Number(Math.abs(lookAfter.pitch - lookBefore.pitch).toFixed(4)),
    passed: lookAfter.professionalLookControl && Math.abs(lookAfter.yaw - lookBefore.yaw) > 0.08
  };
  report.desktop.image = await imageStats(desktopBuffer);
  report.transfer = await captureTransferAudit(page, 'deck');
  await page.waitForTimeout(900);
  const deckBuffer = await page.screenshot({ path: path.join(OUT, 'first-person-deck.png'), fullPage: false });
  report.deck = await inspectLayout(page);
  report.deck.image = await imageStats(deckBuffer);
  report.engineTransfer = await captureTransferAudit(page, 'engine');
  await page.waitForTimeout(900);
  const engineBuffer = await page.screenshot({ path: path.join(OUT, 'first-person-engine.png'), fullPage: false });
  report.engine = await inspectLayout(page);
  report.engine.image = await imageStats(engineBuffer);
  report.shipMap = await runShipMapEntryAudit(page);
  report.directCompartmentUi = await runDirectCompartmentUiAudit(page);
  report.compartments = await runAllCompartmentReachabilityAudit(page);
  report.desktop.errors = errors;
  await context.close();
}

async function runMobile(browser, report) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => { const text = String(error.message || error); if (!ignoreBrowserNoise(text)) errors.push(text); });
  page.on('console', message => { if (message.type() === 'error' && !ignoreBrowserNoise(message.text())) errors.push(message.text()); });
  await openWorld(page);
  await page.evaluate(() => window.__GUVERTE_FP3D.setArea('corridor'));
  await page.waitForFunction(() => window.__GUVERTE_FP3D.state.area === 'corridor', null, { timeout: 5000 });
  await page.waitForTimeout(700);
  const mobileBuffer = await page.screenshot({ path: path.join(OUT, 'first-person-mobile.png'), fullPage: false });
  report.mobile = await inspectLayout(page);
  report.mobile.image = await imageStats(mobileBuffer);
  report.mobile.errors = errors;
  await context.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: EDGE,
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  const report = { generatedAt: new Date().toISOString(), url: URL };
  try {
    await runDesktop(browser, report);
    await runMobile(browser, report);
  } finally {
    await browser.close();
  }
  report.passed = Boolean(
    report.desktop?.ready &&
    report.desktop?.webgl &&
    report.desktop?.movement?.passed &&
    report.desktop?.look?.passed &&
    report.transfer?.passed &&
    report.engineTransfer?.passed &&
    report.engineTransfer?.beforeArea === 'deck' &&
    report.engineTransfer?.toArea === 'engine' &&
    report.desktop?.image?.nonBlank &&
    report.desktop?.liveOpsRuntimeAudit?.beacons >= 1 &&
    report.desktop?.liveOpsRuntimeAudit?.slides >= 1 &&
    report.desktop?.liveOpsRuntimeAudit?.needles >= 1 &&
    report.desktop?.liveOpsRuntimeAudit?.vestibules >= 1 &&
    report.desktop?.liveOpsRuntimeAudit?.trafficFlows >= 2 &&
    report.desktop?.liveOpsRuntimeAudit?.trafficSegments >= 2 &&
    report.desktop?.liveOpsRuntimeAudit?.taskLines >= 1 &&
    report.desktop?.liveOpsRuntimeAudit?.visibleTaskBadges === 0 &&
    report.desktop?.liveOpsRuntimeAudit?.visibleTaskLinks >= 1 &&
    report.desktop?.liveOpsRuntimeAudit?.overheadTextSprites === 0 &&
    report.desktop?.liveOpsRuntimeAudit?.npcTextMarkers === 0 &&
    report.desktop?.liveOpsRuntimeAudit?.activeCrewStates >= 2 &&
    report.desktop?.liveOpsRuntimeAudit?.motionSignatures >= 1 &&
    report.desktop?.liveOpsRuntimeAudit?.meshOnlyCrew >= 1 &&
    report.desktop?.liveOpsRuntimeAudit?.groundedCrew >= report.desktop?.liveOpsRuntimeAudit?.meshOnlyCrew &&
    report.desktop?.areaNavVisible &&
    report.desktop?.shipMotion?.openWorldShipMotion &&
    Math.abs(report.desktop?.shipMotion?.roll || 0) + Math.abs(report.desktop?.shipMotion?.pitch || 0) + Math.abs(report.desktop?.shipMotion?.heave || 0) > 0.001 &&
    report.deck?.image?.nonBlank &&
    report.deck?.liveOpsRuntimeAudit?.beacons >= 1 &&
    report.deck?.liveOpsRuntimeAudit?.slides >= 1 &&
    report.deck?.liveOpsRuntimeAudit?.taskLines >= 1 &&
    report.deck?.liveOpsRuntimeAudit?.trafficFlows >= 2 &&
    report.deck?.liveOpsRuntimeAudit?.trafficSegments >= 2 &&
    report.deck?.liveOpsRuntimeAudit?.visibleTaskBadges === 0 &&
    report.deck?.liveOpsRuntimeAudit?.visibleTaskLinks >= 1 &&
    report.deck?.liveOpsRuntimeAudit?.overheadTextSprites === 0 &&
    report.deck?.liveOpsRuntimeAudit?.npcTextMarkers === 0 &&
    report.deck?.liveOpsRuntimeAudit?.activeCrewStates >= 2 &&
    report.deck?.liveOpsRuntimeAudit?.groundedCrew >= report.deck?.liveOpsRuntimeAudit?.meshOnlyCrew &&
    report.deck?.shipMotion?.openWorldShipMotion &&
    report.deck?.shipMotion?.sway > 30 &&
    report.engine?.ready &&
    report.engine?.area === 'engine' &&
    report.engine?.webgl &&
    report.engine?.image?.nonBlank &&
    report.engine?.liveOpsRuntimeAudit?.beacons >= 1 &&
    report.engine?.liveOpsRuntimeAudit?.slides >= 1 &&
    report.engine?.liveOpsRuntimeAudit?.needles >= 1 &&
    report.engine?.liveOpsRuntimeAudit?.taskLines >= 1 &&
    report.engine?.liveOpsRuntimeAudit?.trafficFlows >= 2 &&
    report.engine?.liveOpsRuntimeAudit?.trafficSegments >= 2 &&
    report.engine?.liveOpsRuntimeAudit?.visibleTaskBadges === 0 &&
    report.engine?.liveOpsRuntimeAudit?.visibleTaskLinks >= 1 &&
    report.engine?.liveOpsRuntimeAudit?.overheadTextSprites === 0 &&
    report.engine?.liveOpsRuntimeAudit?.npcTextMarkers === 0 &&
    report.engine?.liveOpsRuntimeAudit?.activeCrewStates >= 2 &&
    report.engine?.liveOpsRuntimeAudit?.groundedCrew >= report.engine?.liveOpsRuntimeAudit?.meshOnlyCrew &&
    report.engine?.shipMotion?.openWorldShipMotion &&
    report.engine?.shipMotion?.speed > 5 &&
    report.shipMap?.passed &&
    report.shipMap?.mapEntryArea === 'engine' &&
    report.shipMap?.mapClosedAfterEntry &&
    report.directCompartmentUi?.passed &&
    report.directCompartmentUi?.afterEngine?.area === 'engine' &&
    report.directCompartmentUi?.afterDeck?.area === 'deck' &&
    report.compartments?.passed &&
    report.compartments?.total >= 10 &&
    report.compartments?.uniqueSignatures >= 10 &&
    report.compartments?.results?.every(item => item.visibleTaskBadges === 0 && item.visibleTaskLinks >= 1 && item.overheadTextSprites === 0 && item.npcTextMarkers === 0 && item.activeCrewStates >= 1 && item.motionSignatures >= 1 && item.stationGazes >= 1 && item.groundedCrew >= item.npcs && item.trafficFlows >= 2 && item.trafficSegments >= 2) &&
    report.mobile?.ready &&
    report.mobile?.webgl &&
    report.mobile?.image?.nonBlank &&
    report.mobile?.liveOpsRuntimeAudit?.taskLines >= 1 &&
    report.mobile?.liveOpsRuntimeAudit?.taskBadges >= 1 &&
    report.mobile?.controls?.filter(item => !item.missing && item.width > 0 && item.height > 0).every(item => item.inside) &&
    report.desktop?.errors?.length === 0 &&
    report.mobile?.errors?.length === 0
  );
  fs.writeFileSync(path.join(OUT, 'first-person-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
