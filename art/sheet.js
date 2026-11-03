'use strict';
// node art/sheet.js -> out/cast.png (the four regulars) and out/avatar.png (Pomu, for profile pictures)
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { creature, scene, INK } = require('./creatures');
const { CAST } = require('./cast');

const OUT = path.join(__dirname, '..', 'out'); fs.mkdirSync(OUT, { recursive: true });
const SCENE = { pomu: 'shelves', lumi: 'fridge', gloop: 'vending', hop: 'rain' };
const defs = (seed) => `<defs><filter id="bc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="bs" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="${seed + 1}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter><pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="14" stroke="${INK}" stroke-width="3" opacity="0.28"/></pattern></defs>`;

function card(id) {
  const t = CAST[id];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${defs(t.seed)}<g filter="url(#bs)"><g transform="translate(500 500) scale(1.025) translate(-500 -500)">${scene(SCENE[id], { seed: t.seed })}</g></g><ellipse cx="500" cy="900" rx="230" ry="34" fill="#00000040"/><g filter="url(#bc)">${creature(t)}</g></svg>`;
}
function avatar(id, bg = '#ffcf6b') {
  const t = CAST[id];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="190 90 620 620">${defs(t.seed)}<rect x="0" y="0" width="1000" height="1000" fill="${bg}"/><circle cx="500" cy="400" r="290" fill="#fff1d6"/><g filter="url(#bc)">${creature({ ...t, eyes: 'sparkle', mouth: 'open' })}</g></svg>`;
}

(async () => {
  const browser = await chromium.launch();
  const tab = await browser.newPage();
  const uri = (s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
  const ids = Object.keys(CAST);
  await tab.setViewportSize({ width: 4 * 420 + 5 * 20, height: 100 });
  await tab.setContent(`<!doctype html><body style="margin:0;padding:20px;background:#16151b;font-family:Inter,Arial,sans-serif;color:#ece6da"><h1 style="margin:0 0 14px;font-size:28px;font-weight:900">TINY HOURS · the regulars</h1><div style="display:flex;gap:20px">${ids.map((id) => `<figure style="margin:0;width:420px"><img src="${uri(card(id))}" width="420" height="420" style="border-radius:14px;display:block"><figcaption style="margin-top:10px"><b style="font-size:24px">${CAST[id].name}</b><div style="color:#a9a3b3;font-size:16px;margin-top:4px">${CAST[id].role}</div></figcaption></figure>`).join('')}</div>`, { waitUntil: 'load' });
  await tab.screenshot({ path: path.join(OUT, 'cast.png'), fullPage: true });
  await tab.setViewportSize({ width: 1000, height: 1000 });
  await tab.setContent(`<body style="margin:0"><img src="${uri(avatar('pomu'))}" width="1000" height="1000">`, { waitUntil: 'load' });
  await tab.screenshot({ path: path.join(OUT, 'avatar.png') });
  await browser.close();
  console.log('cast.png, avatar.png');
})().catch((e) => { console.error(e); process.exit(1); });
