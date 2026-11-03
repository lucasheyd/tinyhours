'use strict';
// node video/render.js [clip-id ...]   -> out/<id>.mp4 (1080x1920, 24 fps) and out/<id>.png (cover)
//   --still N   only frame N, to out/<id>-fN.png (for checking a pose)
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'out'); fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const still = args.includes('--still') ? Number(args[args.indexOf('--still') + 1]) : null;
const ids = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--still');
const clips = fs.readdirSync(path.join(__dirname, 'clips')).filter((f) => f.endsWith('.js')).map((f) => require(path.join(__dirname, 'clips', f))).filter((c) => !ids.length || ids.some((x) => c.id.startsWith(x)));

(async () => {
  const browser = await chromium.launch();
  const tab = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const shot = async (svg, file) => { await tab.setContent(`<!doctype html><body style="margin:0;background:#000">${svg}</body>`, { waitUntil: 'load' }); await tab.screenshot({ path: file, clip: { x: 0, y: 0, width: 1080, height: 1920 } }); };
  for (const c of clips) {
    if (still !== null) { await shot(c.draw(still), path.join(OUT, `${c.id}-f${still}.png`)); console.log(`${c.id}-f${still}.png`); continue; }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tinyhours-'));
    for (let f = 0; f < c.frames; f += 1) await shot(c.draw(f), path.join(dir, `${String(f).padStart(4, '0')}.png`));
    fs.copyFileSync(path.join(dir, `${String(c.cover ?? Math.floor(c.frames * 0.6)).padStart(4, '0')}.png`), path.join(OUT, `${c.id}.png`));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(c.fps), '-i', path.join(dir, '%04d.png'), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, `${c.id}.mp4`)]);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.writeFileSync(path.join(OUT, `${c.id}.txt`), `${c.post}\n`);
    console.log(`${c.id}.mp4 (${(c.frames / c.fps).toFixed(1)} s)`);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
