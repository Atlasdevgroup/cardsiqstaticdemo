// Headless screenshots of the design demo using the locally installed Chrome/Edge.
// Usage: node shoot.mjs <page.html|url> <out.png> [width=1440] [height=900] [mode=1|0|tiles]
//          [--reduced] [--scroll=#selector] [--member]
//   mode 1 = full page, 0 = first viewport, tiles = viewport captures all the way down (out_v00.png …)
// Reports horizontal overflow (with culprits) and console errors so layout bugs surface without a manual look.
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const flags = process.argv.slice(2).filter(a => a.startsWith('--'));
const [target, out, w = '1440', h = '900', full = '1'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const reduced = flags.includes('--reduced') ? '1' : '0';
const scrollSel = (flags.find(f => f.startsWith('--scroll=')) || '').slice(9);
const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean);
const executablePath = candidates.find(p => fs.existsSync(p));
let url = /^https?:|^file:/.test(target) ? target : pathToFileURL(path.resolve(target)).href;
if (flags.includes('--member')) url += (url.includes('?') ? '&' : '?') + 'auth=member';

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
// A private profile keeps headless runs from handing off to an already-open browser window.
const userDataDir = path.join(os.tmpdir(), 'ciq-demo-shoot-' + process.pid);
const browser = await puppeteer.launch({ executablePath, headless: true, userDataDir, args: ['--hide-scrollbars', '--allow-file-access-from-files', '--no-first-run', '--no-default-browser-check'] });
const page = await browser.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));
page.on('requestfailed', r => { if (!r.url().includes('fonts.g')) errors.push('REQUEST FAILED ' + r.url()); });
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1, isMobile: +w < 768, hasTouch: +w < 768 });
if (reduced === '1') await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
// Reveal everything that animates in on scroll so full-page captures are complete.
await page.evaluate(async () => {
  document.documentElement.classList.add('shot');
  document.documentElement.style.scrollBehavior = 'auto';
  const step = window.innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 400));
});
if (scrollSel) {
  await page.evaluate(sel => document.querySelector(sel)?.scrollIntoView({ block: 'start' }), scrollSel);
  await new Promise(r => setTimeout(r, 1200));
}
const overflow = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width && (r.right > vw + 1 || r.left < -1)) {
      const cs = getComputedStyle(el);
      let p = el.parentElement, clipped = false;
      while (p) { const s = getComputedStyle(p); if (/(hidden|auto|scroll|clip)/.test(s.overflowX)) { clipped = true; break; } p = p.parentElement; }
      if (!clipped && cs.position !== 'fixed') offenders.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(r.right)} left=${Math.round(r.left)}`);
    }
  });
  // Root offenders regardless of clipping: elements wider than the viewport whose parent fits.
  const roots = [];
  if (document.documentElement.scrollWidth > vw) {
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      const pr = el.parentElement.getBoundingClientRect();
      if (r.width && r.right > vw + 1 && pr.right <= vw + 1) roots.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(r.right)} pos=${getComputedStyle(el).position} in=${el.parentElement.className || el.parentElement.tagName} :: ${el.textContent.trim().slice(0, 40)}`);
    });
  }
  return { docWidth: document.documentElement.scrollWidth, vw, offenders: offenders.slice(0, 12), roots: roots.slice(0, 12) };
});
if (full === 'tiles') {
  // Viewport-sized captures down the page: what a visitor actually sees, with fixed shell in place.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = +h;
  let i = 0;
  for (let y = 0; y < total; y += vh - 60) {
    await page.evaluate(yy => window.scrollTo(0, yy), y);
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: out.replace(/\.png$/, `_v${String(i).padStart(2, '0')}.png`) });
    i++;
    if (i > 40) break;
  }
  overflow.tiles = i;
} else {
  await page.screenshot({ path: out, fullPage: full === '1' && !scrollSel });
}
console.log(JSON.stringify({ url, width: +w, overflowX: overflow.docWidth > overflow.vw, ...overflow, errors }, null, 1));
await browser.close();
fs.rmSync(userDataDir, { recursive: true, force: true });
