'use strict';
// node stickers/build.js -> out/stickers/<name>/01..09.png (370x320, transparent, LINE size),
// out/stickers/<name>.png (sheet) and out/stickers/candidatos.png (one signature each).
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { sticker } = require('./kit');
const { CAST, REACTIONS } = require('./cast');

const OUT = path.join(__dirname, '..', 'out', 'stickers');
fs.mkdirSync(OUT, { recursive: true });
const uri = (s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
(async () => {
  const browser = await chromium.launch();
  const tab = await browser.newPage();
  const overview = [];
  for (const [key, ch] of Object.entries(CAST)) {
    const set = [...REACTIONS, ch.signature].map((e) => sticker(ch, e));
    const dir = path.join(OUT, key); fs.mkdirSync(dir, { recursive: true });
    await tab.setViewportSize({ width: 370, height: 320 });
    for (const [i, s] of set.entries()) {
      await tab.setContent(`<body style="margin:0;background:transparent"><img src="${uri(s)}" width="370" height="320"></body>`, { waitUntil: 'load' });
      await tab.screenshot({ path: path.join(dir, `${String(i + 1).padStart(2, '0')}.png`), omitBackground: true, clip: { x: 0, y: 0, width: 370, height: 320 } });
    }
    const cell = (s) => `<div style="background:#e8ecf3;border-radius:14px;padding:6px"><img src="${uri(s)}" width="333" height="288" style="display:block"></div>`;
    await tab.setViewportSize({ width: 3 * 345 + 60, height: 100 });
    await tab.setContent(`<!doctype html><body style="margin:0;padding:20px;background:#fff;font-family:Inter,Arial"><h1 style="margin:0 0 4px;font-size:26px">${ch.name}</h1><div style="color:#666;margin-bottom:12px">${ch.idea}</div><div style="display:grid;grid-template-columns:repeat(3,345px);gap:10px">${set.map(cell).join('')}</div></body>`, { waitUntil: 'load' });
    await tab.screenshot({ path: path.join(OUT, `${key}.png`), fullPage: true });
    overview.push(`<figure style="margin:0;text-align:center"><div style="background:#e8ecf3;border-radius:16px;padding:8px">${`<img src="${uri(set[8])}" width="370" height="320" style="display:block">`}</div><figcaption style="margin-top:8px"><b style="font-size:22px">${ch.name}</b><div style="color:#666;font-size:15px;max-width:370px">${ch.idea}</div></figcaption></figure>`);
    console.log(`${key}: ${set.length} stickers`);
  }
  await tab.setViewportSize({ width: 4 * 386 + 70, height: 100 });
  await tab.setContent(`<!doctype html><body style="margin:0;padding:20px;background:#fff;font-family:Inter,Arial"><h1 style="margin:0 0 14px;font-size:26px">Tiny Hours · candidatos a mascote</h1><div style="display:flex;gap:16px">${overview.join('')}</div></body>`, { waitUntil: 'load' });
  await tab.screenshot({ path: path.join(OUT, 'candidatos.png'), fullPage: true });
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
