'use strict';
// node stickers/build-round2.js -> out/stickers/round2/<name>.png (sheets), <name>/01..09.png and candidatos-2.png
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { CHARS, limbless } = require('./limbless');
const { yoru } = require('./yoru');

const OUT = path.join(__dirname, '..', 'out', 'stickers', 'round2'); fs.mkdirSync(OUT, { recursive: true });
const uri = (s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
(async () => {
  const browser = await chromium.launch(); const tab = await browser.newPage();
  const overview = [`<figure style="margin:0;text-align:center"><div style="background:#e8ecf3;border-radius:16px;padding:8px"><img src="${uri(yoru({ caption: 'overtime again', eyes: 'flat', mouth: 'flat', flaps: ['down', 'in'], hold: 'coffee', extras: ['gloom'] }))}" width="330" height="285" style="display:block"></div><figcaption style="margin-top:8px"><b style="font-size:22px">Yoru ✓</b><div style="color:#666;font-size:15px;max-width:330px">the little ghost doing overtime</div></figcaption></figure>`];
  for (const [key, ch] of Object.entries(CHARS)) {
    const svgs = ch.set.map((e) => limbless(ch, e));
    const dir = path.join(OUT, key); fs.mkdirSync(dir, { recursive: true });
    await tab.setViewportSize({ width: 370, height: 320 });
    for (const [i, s] of svgs.entries()) { await tab.setContent(`<body style="margin:0;background:transparent"><img src="${uri(s)}" width="370" height="320"></body>`, { waitUntil: 'load' }); await tab.screenshot({ path: path.join(dir, `${String(i + 1).padStart(2, '0')}.png`), omitBackground: true, clip: { x: 0, y: 0, width: 370, height: 320 } }); }
    await tab.setViewportSize({ width: 3 * 345 + 60, height: 100 });
    await tab.setContent(`<!doctype html><body style="margin:0;padding:20px;background:#fff;font-family:Inter,Arial"><h1 style="margin:0 0 4px;font-size:26px">${ch.name}</h1><div style="color:#666;margin-bottom:12px">${ch.idea}</div><div style="display:grid;grid-template-columns:repeat(3,345px);gap:10px">${svgs.map((s) => `<div style="background:#e8ecf3;border-radius:14px;padding:6px"><img src="${uri(s)}" width="333" height="288" style="display:block"></div>`).join('')}</div></body>`, { waitUntil: 'load' });
    await tab.screenshot({ path: path.join(OUT, `${key}.png`), fullPage: true });
    overview.push(`<figure style="margin:0;text-align:center"><div style="background:#e8ecf3;border-radius:16px;padding:8px"><img src="${uri(svgs[8])}" width="330" height="285" style="display:block"></div><figcaption style="margin-top:8px"><b style="font-size:22px">${ch.name}</b><div style="color:#666;font-size:15px;max-width:330px">${ch.idea}</div></figcaption></figure>`);
    console.log(key);
  }
  await tab.setViewportSize({ width: 5 * 362 + 60, height: 100 });
  await tab.setContent(`<!doctype html><body style="margin:0;padding:20px;background:#fff;font-family:Inter,Arial"><h1 style="margin:0 0 14px;font-size:26px">Tiny Hours · candidatos, rodada 2 (sem braços forçados)</h1><div style="display:flex;gap:14px">${overview.join('')}</div></body>`, { waitUntil: 'load' });
  await tab.screenshot({ path: path.join(OUT, 'candidatos-2.png'), fullPage: true });
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
