// Records one clip per demo step from the running prototype, for the demo video.
// Usage: npm run build && npx vite preview --port 4173   (in another terminal)
//        node scripts/capture.mjs [clipName ...]
// Uses the installed Chrome through puppeteer-core, and ffmpeg for the encode.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// The app's own screen size (iPhone 18 Pro points), captured at 2x.
const VIEW = { width: 402, height: 874, deviceScaleFactor: 2 };
const OUT = 'captures';

// Clip name -> demo step (1-based), as in src/data/demoScript.ts.
const CLIPS = [
  ['01_today', 2],
  ['02_flip', 4],
  ['03_onboarding', 5],
  ['04_home_drop', 6],
  ['05_checkout', 7],
  ['06_tracking', 8],
  ['07_squad', 9],
  ['08_unlock', 10],
  ['09_wrapped', 11],
];

const only = process.argv.slice(2);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });

// Warm the cache so fonts are there on the first frame of every clip.
{
  const p = await browser.newPage();
  await p.setViewport(VIEW);
  await p.goto(`${BASE}/?demo=1&layout=bare&captions=0`, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await p.close();
}

for (const [name, scene] of CLIPS) {
  if (only.length && !only.includes(name)) continue;
  const page = await browser.newPage();
  await page.setViewport(VIEW);
  const raw = `${OUT}/${name}.raw.webm`;
  const rec = await page.screencast({ path: raw });
  const t0 = Date.now();
  await page.goto(`${BASE}/?demo=1&layout=bare&captions=0&scene=${scene}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body.dataset.sceneDone === '1', { timeout: 60_000 });
  const start = Number(await page.evaluate(() => document.body.dataset.sceneStart));
  await wait(400);
  if (name === '09_wrapped') {
    const card = await page.$('[data-wrapped-card]');
    await card.screenshot({ path: `${OUT}/wrapped_card.png`, omitBackground: true });
  }
  await rec.stop();
  await page.close();
  const offset = Math.max(0, (start - t0) / 1000);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', offset.toFixed(3), '-i', raw, '-r', '30', '-an',
    '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${OUT}/${name}.mp4`]);
  fs.rmSync(raw);
  const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${OUT}/${name}.mp4`]).toString().trim();
  console.log(`${name}: step ${scene}, trimmed ${offset.toFixed(2)}s, ${Number(dur).toFixed(2)}s`);
}
await browser.close();
