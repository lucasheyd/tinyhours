'use strict';
// node art/banners.js -> out/banner-x.png (1500x500), out/banner-youtube.png (2560x1440)
// The four regulars in a row in front of the store at night, with the name.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { creature, INK, rng } = require('./creatures');
const { CAST, who } = require('./cast');

const OUT = path.join(__dirname, '..', 'out'); fs.mkdirSync(OUT, { recursive: true });
const FACES = { pomu: { eyes: 'sparkle', mouth: 'open' }, lumi: { eyes: 'heart', mouth: 'open' }, gloop: {}, hop: {} };

/** The banner art: a W x H night street; the cast and title fit inside the box (bx, by, bw, bh). */
function banner(W, H, box) {
  const r = rng(11);
  const { x: bx, y: by, w: bw, h: bh } = box;
  let stars = ''; for (let i = 0; i < Math.round(W * H / 9000); i += 1) stars += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H * 0.6).toFixed(0)}" r="${(r() * 2.4 + 0.8).toFixed(1)}" fill="#ffffff" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`;
  const ground = by + bh * 0.86;
  // the store front behind the cast: a glowing window band and the sign
  const sx = bx + bw * 0.42, sw = bw * 0.58;
  const store = `<rect x="${sx}" y="${by + bh * 0.18}" width="${sw}" height="${ground - by - bh * 0.18}" fill="#2f2a55" stroke="${INK}" stroke-width="${bh * 0.012}"/>
<rect x="${sx + sw * 0.03}" y="${by + bh * 0.36}" width="${sw * 0.94}" height="${ground - by - bh * 0.4}" fill="#bff3ff" opacity="0.9" stroke="${INK}" stroke-width="${bh * 0.01}"/>
<rect x="${sx}" y="${by + bh * 0.18}" width="${sw}" height="${bh * 0.13}" fill="#ff5a5f" stroke="${INK}" stroke-width="${bh * 0.012}"/>
${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${sx + sw * (0.06 + i * 0.115)}" y="${by + bh * 0.44}" width="${sw * 0.07}" height="${bh * 0.16}" rx="${bh * 0.01}" fill="${['#ff9f8c', '#ffe189', '#9fe3c6', '#cbb8ff'][i % 4]}" stroke="${INK}" stroke-width="${bh * 0.006}"/>`).join('')}
<text x="${sx + sw / 2}" y="${by + bh * 0.278}" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="${bh * 0.085}" text-anchor="middle" fill="#fffdf7" letter-spacing="${bh * 0.006}">OPEN ALL NIGHT · 24H</text>`;
  const ids = ['pomu', 'lumi', 'gloop', 'hop'];
  const cs = bh * 0.00072; // creature scale (the creature lives in a 1000 box)
  const cast = ids.map((id, i) => {
    const cx = sx + sw * (0.13 + i * 0.25) - 500 * cs, cy = ground - 900 * cs;
    return `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${cs.toFixed(4)})"><ellipse cx="500" cy="900" rx="230" ry="34" fill="#00000050"/>${creature(who(id, FACES[id]))}</g>`;
  }).join('');
  const tx = bx + bw * 0.2;
  const title = `<g><circle cx="${tx - bh * 0.02}" cy="${by + bh * 0.38}" r="${bh * 0.075}" fill="#fff4c9" stroke="${INK}" stroke-width="${bh * 0.012}"/><circle cx="${tx + bh * 0.012}" cy="${by + bh * 0.355}" r="${bh * 0.065}" fill="#232a4d"/>
<text x="${tx}" y="${by + bh * 0.64}" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="${bh * 0.19}" text-anchor="middle" fill="#fffdf7" stroke="${INK}" stroke-width="${bh * 0.03}" paint-order="stroke" stroke-linejoin="round">TINY</text>
<text x="${tx}" y="${by + bh * 0.82}" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="${bh * 0.19}" text-anchor="middle" fill="#ffd23f" stroke="${INK}" stroke-width="${bh * 0.03}" paint-order="stroke" stroke-linejoin="round">HOURS</text></g>`;
  const boil = `<filter id="bc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="${(0.03 / (bh * 0.00072)).toFixed(4)}" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${(8 * bh * 0.00072).toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/></filter><pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="14" stroke="${INK}" stroke-width="3" opacity="0.28"/></pattern>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${boil}<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2142"/><stop offset="1" stop-color="#3a2d5c"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>${stars}<rect y="${ground}" width="${W}" height="${H - ground}" fill="#1a1f3a"/><line x1="0" y1="${ground}" x2="${W}" y2="${ground}" stroke="${INK}" stroke-width="${bh * 0.012}"/>
${store}<g filter="url(#bc)">${cast}</g>${title}</svg>`;
}

(async () => {
  const browser = await chromium.launch();
  const tab = await browser.newPage();
  const jobs = [
    // X header: keep clear of the profile picture at the bottom left
    ['banner-x.png', 1500, 500, { x: 60, y: 10, w: 1400, h: 480 }],
    // YouTube: everything inside the 1546x423 safe area in the middle
    ['banner-youtube.png', 2560, 1440, { x: 507, y: 509, w: 1546, h: 423 }],
  ];
  for (const [file, W, H, box] of jobs) {
    await tab.setViewportSize({ width: W, height: H });
    await tab.setContent(`<body style="margin:0">${banner(W, H, box)}</body>`, { waitUntil: 'load' });
    await tab.screenshot({ path: path.join(OUT, file), clip: { x: 0, y: 0, width: W, height: H } });
    console.log(file);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
