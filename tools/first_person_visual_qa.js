const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'tools', 'qa-artifacts');
const URL = process.env.GUVERTE_QA_URL || 'http://127.0.0.1:4173/';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

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
    return { min, max, mean: Number(mean.toFixed(2)), variance: Number(variance.toFixed(2)), nonBlank: max - min > 24 && variance > 80 };
  } catch (error) {
    return { nonBlank: buffer.length > 20000, bytes: buffer.length, fallback: String(error.message || error) };
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
    return {
      viewport: { width: innerWidth, height: innerHeight },
      ready: Boolean(runtime?.ready && runtime?.renderer && runtime?.scene),
      area: runtime?.area,
      objects: runtime?.scene?.children?.length || 0,
      interactions: runtime?.interactions?.length || 0,
      visibleMarkers: document.querySelectorAll('.fp3d-marker.visible').length,
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
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction(() => window.__guverteAppReady === true, null, { timeout: 20000 });
  await page.evaluate(() => window.openFirstPersonMode());
  await page.waitForFunction(() => window.__GUVERTE_FP3D?.state?.ready === true, null, { timeout: 30000 });
  await page.waitForTimeout(900);
}

async function runDesktop(browser, report) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error.message || error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await openWorld(page);
  const before = await page.evaluate(() => ({ ...window.__GUVERTE_FP3D.state.player }));
  await page.keyboard.down('w');
  await page.waitForTimeout(850);
  await page.keyboard.up('w');
  await page.waitForTimeout(120);
  const after = await page.evaluate(() => ({ ...window.__GUVERTE_FP3D.state.player }));
  const desktopBuffer = await page.screenshot({ path: path.join(OUT, 'first-person-desktop.png'), fullPage: false });
  report.desktop = await inspectLayout(page);
  report.desktop.movement = {
    before,
    after,
    distance: Number(Math.hypot(after.x - before.x, after.z - before.z).toFixed(3)),
    passed: Math.hypot(after.x - before.x, after.z - before.z) > 0.15
  };
  report.desktop.image = await imageStats(desktopBuffer);
  await page.evaluate(() => window.__GUVERTE_FP3D.setArea('deck'));
  await page.waitForFunction(() => window.__GUVERTE_FP3D.state.area === 'deck', null, { timeout: 5000 });
  await page.waitForTimeout(900);
  const deckBuffer = await page.screenshot({ path: path.join(OUT, 'first-person-deck.png'), fullPage: false });
  report.deck = await inspectLayout(page);
  report.deck.image = await imageStats(deckBuffer);
  report.desktop.errors = errors;
  await context.close();
}

async function runMobile(browser, report) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error.message || error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
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
    report.desktop?.image?.nonBlank &&
    report.deck?.image?.nonBlank &&
    report.mobile?.ready &&
    report.mobile?.webgl &&
    report.mobile?.image?.nonBlank &&
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
