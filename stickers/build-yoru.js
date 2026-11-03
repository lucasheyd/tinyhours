'use strict';
// node stickers/build-yoru.js -> out/stickers/yoru-set/01..16.png (370x320, transparent),
// main.png (240x240), tab.png (96x74) and out/stickers/yoru-set.png (sheet).
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { yoru, SET } = require('./yoru');

const OUT = path.join(__dirname, '..', 'out', 'stickers'); const DIR = path.join(OUT, 'yoru-set');
fs.mkdirSync(DIR, { recursive: true });
const uri = (s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
(async () => {
  const browser = await chromium.launch(); const tab = await browser.newPage();
  const svgs = SET.map((e) => yoru(e));
  const shot = async (svg, w, h, file, fit = false) => { await tab.setViewportSize({ width: w, height: h }); await tab.setContent(`<body style="margin:0;background:transparent;display:flex;align-items:center;justify-content:center;width:${w}px;height:${h}px"><img src="${uri(svg)}" ${fit ? `style="max-width:${w}px;max-height:${h}px"` : `width="${w}" height="${h}"`}></body>`, { waitUntil: 'load' }); await tab.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } }); };
  for (const [i, s] of svgs.entries()) await shot(s, 370, 320, path.join(DIR, `${String(i + 1).padStart(2, '0')}.png`));
  const hero = yoru({ eyes: 'dot', mouth: 'smile', flaps: ['down', 'wave'] });
  await shot(hero, 240, 240, path.join(DIR, 'main.png'), true);
  await shot(hero, 96, 74, path.join(DIR, 'tab.png'), true);
  await tab.setViewportSize({ width: 4 * 300 + 70, height: 100 });
  await tab.setContent(`<!doctype html><body style="margin:0;padding:20px;background:#fff;font-family:Inter,Arial"><h1 style="margin:0 0 4px;font-size:26px">Yoru · 16 stickers</h1><div style="color:#666;margin-bottom:12px">the little ghost doing overtime</div><div style="display:grid;grid-template-columns:repeat(4,300px);gap:10px">${svgs.map((s) => `<div style="background:#e8ecf3;border-radius:14px;padding:6px"><img src="${uri(s)}" width="288" height="249" style="display:block"></div>`).join('')}</div></body>`, { waitUntil: 'load' });
  await tab.screenshot({ path: path.join(OUT, 'yoru-set.png'), fullPage: true });
  await browser.close(); console.log(`yoru: ${svgs.length} stickers + main + tab`);
})().catch((e) => { console.error(e); process.exit(1); });
