'use strict';
// node art/bodies.js -> out/corpos.png: the cast and some species in four poses (before/after check)
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { creature, traitsOf, INK } = require('./creatures');
const { CAST, who } = require('./cast');

const OUT = path.join(__dirname, '..', 'out'); fs.mkdirSync(OUT, { recursive: true });
const POSES = [['de pé', {}], ['acenando', { arms: ['down', 'wave'] }], ['segurando', { arms: ['hip', 'hold'] }], ['sentado', { sit: true, arms: ['hug', 'hug'] }]];
const defs = `<defs><filter id="bc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter><pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="14" stroke="${INK}" stroke-width="3" opacity="0.28"/></pattern></defs>`;
const svg = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${defs}<rect width="1000" height="1000" fill="#fff1d6"/><ellipse cx="500" cy="910" rx="230" ry="34" fill="#00000030"/><g filter="url(#bc)">${creature(t)}</g></svg>`;
const extras = [3, 8, 12, 9].map((s) => ({ ...traitsOf(s), hold: 'none', wear: 'none' }));
const rows = [...Object.keys(CAST).map((id) => [CAST[id].name, (p) => who(id, { pose: p, hold: p.arms && p.arms[1] === 'hold' ? (CAST[id].hold !== 'none' ? CAST[id].hold : 'onigiri') : 'none' })]), ...extras.map((t) => [`${t.species} #${t.seed}`, (p) => ({ ...t, pose: p, hold: p.arms && p.arms[1] === 'hold' ? 'can' : 'none' })])];
(async () => {
  const browser = await chromium.launch();
  const tab = await browser.newPage();
  const uri = (s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
  const cell = 230;
  const html = `<!doctype html><body style="margin:0;padding:16px;background:#16151b;color:#ece6da;font:14px Inter,Arial,sans-serif"><h1 style="font-size:22px;margin:0 0 10px">Corpos novos · 4 poses</h1><table style="border-spacing:8px"><tr><td></td>${POSES.map(([n]) => `<td style="text-align:center;color:#a9a3b3">${n}</td>`).join('')}</tr>${rows.map(([name, f]) => `<tr><td style="width:110px;font-weight:800">${name}</td>${POSES.map(([, p]) => `<td><img src="${uri(svg(f(p)))}" width="${cell}" height="${cell}" style="border-radius:10px;display:block"></td>`).join('')}</tr>`).join('')}</table>`;
  await tab.setViewportSize({ width: 150 + 4 * (cell + 8) + 40, height: 100 });
  await tab.setContent(html, { waitUntil: 'load' });
  await tab.screenshot({ path: path.join(OUT, 'corpos.png'), fullPage: true });
  await browser.close();
  console.log('corpos.png');
})().catch((e) => { console.error(e); process.exit(1); });
