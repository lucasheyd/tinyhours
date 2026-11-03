'use strict';
// node stickers/build-packs.js -> the approved mascots as full 16-sticker packs:
// out/stickers/<name>-set/01..16.png (370x320), main.png (240x240), tab.png (96x74),
// out/stickers/<name>-set.png (sheet) and out/stickers/trio.png (the three, hi!).
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { CHARS, limbless } = require('./limbless');
const { yoru } = require('./yoru');

const OUT = path.join(__dirname, '..', 'out', 'stickers');
const uri = (s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
(async () => {
  const browser = await chromium.launch(); const tab = await browser.newPage();
  const shot = async (svg, w, h, file, fit = false) => { await tab.setViewportSize({ width: w, height: h }); await tab.setContent(`<body style="margin:0;background:transparent;display:flex;align-items:center;justify-content:center;width:${w}px;height:${h}px"><img src="${uri(svg)}" ${fit ? `style="max-width:${w}px;max-height:${h}px"` : `width="${w}" height="${h}"`}></body>`, { waitUntil: 'load' }); await tab.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } }); };
  for (const key of ['drizzle', 'futo']) {
    const ch = CHARS[key]; const dir = path.join(OUT, `${key}-set`); fs.mkdirSync(dir, { recursive: true });
    const svgs = ch.pack.map((e) => limbless(ch, e));
    for (const [i, s] of svgs.entries()) await shot(s, 370, 320, path.join(dir, `${String(i + 1).padStart(2, '0')}.png`));
    const hero = limbless(ch, { eyes: 'dot', mouth: 'smile' });
    await shot(hero, 240, 240, path.join(dir, 'main.png'), true); await shot(hero, 96, 74, path.join(dir, 'tab.png'), true);
    await tab.setViewportSize({ width: 4 * 300 + 70, height: 100 });
    await tab.setContent(`<!doctype html><body style="margin:0;padding:20px;background:#fff;font-family:Inter,Arial"><h1 style="margin:0 0 4px;font-size:26px">${ch.name} · 16 stickers</h1><div style="color:#666;margin-bottom:12px">${ch.idea}</div><div style="display:grid;grid-template-columns:repeat(4,300px);gap:10px">${svgs.map((s) => `<div style="background:#e8ecf3;border-radius:14px;padding:6px"><img src="${uri(s)}" width="288" height="249" style="display:block"></div>`).join('')}</div></body>`, { waitUntil: 'load' });
    await tab.screenshot({ path: path.join(OUT, `${key}-set.png`), fullPage: true });
    console.log(`${key}: ${svgs.length}`);
  }
  const trio = [yoru({ caption: 'hi!', eyes: 'dot', mouth: 'smile', flaps: ['down', 'wave'], extras: ['motion'] }), limbless(CHARS.drizzle, CHARS.drizzle.pack[0]), limbless(CHARS.futo, CHARS.futo.pack[0])];
  await tab.setViewportSize({ width: 3 * 390 + 60, height: 100 });
  await tab.setContent(`<!doctype html><body style="margin:0;padding:20px;background:#fff;font-family:Inter,Arial"><h1 style="margin:0 0 12px;font-size:26px">Tiny Hours · Yoru, Drizzle e Futo</h1><div style="display:flex;gap:14px">${trio.map((s) => `<div style="background:#e8ecf3;border-radius:16px;padding:8px"><img src="${uri(s)}" width="370" height="320" style="display:block"></div>`).join('')}</div></body>`, { waitUntil: 'load' });
  await tab.screenshot({ path: path.join(OUT, 'trio.png'), fullPage: true });
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
