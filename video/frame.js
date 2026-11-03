'use strict';
// Tiny Hours — one vertical frame (9:16, 1080x1920 when rendered). The square
// scene sits in the middle; the bands above and below continue its colours and
// carry the caption and the little logo. Lines "boil" (redrawn on twos), like
// hand-drawn animation.

const { creature, scene, INK, star } = require('../art/creatures');

const VW = 1000, VH = 1778, TOP = 389; // the square scene spans TOP..TOP+1000

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Words wrapped to lines of at most `n` characters. */
function lines(str, n) {
  const out = []; let cur = '';
  for (const w of String(str).split(' ')) { if (cur && (cur + ' ' + w).length > n) { out.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w; }
  if (cur) out.push(cur);
  return out;
}

/** Caption on top: white rounded box with ink text, TikTok style. */
function caption(str, y = 120) {
  const ls = lines(str, 26); const lh = 64;
  const w = Math.max(...ls.map((l) => l.length)) * 31 + 70, h = ls.length * lh + 44;
  return `<g><rect x="${(VW - w) / 2}" y="${y}" width="${w}" height="${h}" rx="26" fill="#fffdf7" stroke="${INK}" stroke-width="7"/>${ls.map((l, i) => `<text x="${VW / 2}" y="${y + 66 + i * lh}" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="50" text-anchor="middle" fill="${INK}">${esc(l)}</text>`).join('')}</g>`;
}

/** A speech bubble with a tail toward (tx, ty); `k` 0..1 pops it in. */
function bubble(str, x, y, tx, ty, k = 1) {
  if (k <= 0) return '';
  const ls = lines(str, 14); const lh = 54;
  const w = Math.max(...ls.map((l) => l.length)) * 27 + 60, h = ls.length * lh + 40;
  const s = k < 1 ? 0.6 + 0.4 * k + Math.sin(k * Math.PI) * 0.12 : 1;
  return `<g transform="translate(${x + w / 2} ${y + h / 2}) scale(${s.toFixed(3)}) translate(${-x - w / 2} ${-y - h / 2})"><path d="M${tx} ${ty} L${x + w * 0.35} ${y + h - 4} L${x + w * 0.55} ${y + h - 4} Z" fill="#fffdf7" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="#fffdf7" stroke="${INK}" stroke-width="7"/><rect x="${x + w * 0.33}" y="${y + h - 12}" width="${w * 0.24}" height="12" fill="#fffdf7"/>${ls.map((l, i) => `<text x="${x + w / 2}" y="${y + 56 + i * lh}" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="44" text-anchor="middle" fill="${INK}">${esc(l)}</text>`).join('')}</g>`;
}

/** Big comic word (DING!, POP!) with sparks. */
function word(str, x, y, k = 1, color = '#ffd23f', rot = -8) {
  if (k <= 0) return '';
  const s = 0.5 + Math.min(1, k) * 0.5 + Math.sin(Math.min(1, k) * Math.PI) * 0.25;
  const sparks = [0, 1, 2, 3, 4].map((i) => { const a = -2.6 + i * 0.55; return `<path d="M${(x + Math.cos(a) * 130).toFixed(0)} ${(y - 20 + Math.sin(a) * 90).toFixed(0)} L${(x + Math.cos(a) * 175).toFixed(0)} ${(y - 20 + Math.sin(a) * 125).toFixed(0)}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`; }).join('');
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s.toFixed(3)}) translate(${-x} ${-y})">${sparks}<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="120" text-anchor="middle" fill="${color}" stroke="${INK}" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${esc(str)}</text></g>`;
}

const zz = (x, y, k) => [0, 1, 2].map((i) => { const p = (k + i / 3) % 1; return `<text x="${(x + p * 70 + Math.sin(p * 6) * 14).toFixed(0)}" y="${(y - p * 230).toFixed(0)}" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="${(44 + p * 40).toFixed(0)}" fill="#fffdf7" stroke="${INK}" stroke-width="8" paint-order="stroke" opacity="${(1 - p * 0.8).toFixed(2)}">z</text>`; }).join('');
const heart = (x, y, s = 1, o = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 30 C -60 -6 -26 -52 0 -18 C 26 -52 60 -6 0 30 Z" fill="#ff5a7a" stroke="${INK}" stroke-width="7" stroke-linejoin="round" opacity="${o}"/>`;
const logo = (y = 1640) => `<g><circle cx="${VW / 2 - 215}" cy="${y - 14}" r="24" fill="#fff4c9" stroke="${INK}" stroke-width="6"/><circle cx="${VW / 2 - 205}" cy="${y - 22}" r="20" fill="${INK}" opacity="0.9"/><text x="${VW / 2 + 20}" y="${y + 4}" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="54" text-anchor="middle" fill="#fffdf7" stroke="${INK}" stroke-width="10" paint-order="stroke" letter-spacing="2">TINY HOURS</text></g>`;

/**
 * One frame. `cast`: [{ t, x, y, s, dy, squash }] placed in scene coordinates
 * (the creature is drawn in a 1000 box; x/y move that box). `back`/`front`
 * are extra SVG in scene coordinates; `over` is in frame coordinates.
 */
function frame({ sceneId, seed = 1, top = '#232a4d', bottom = '#1a1f3a', cast = [], back = '', front = '', over = '', cap = '', boil = 0, glow = 0 }) {
  const b = (id, f, k, sc) => `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="${f}" numOctaves="2" seed="${seed * 10 + boil * 3 + k}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${sc}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  const defs = `${b('bc', 0.03, 0, 8)}${b('bs', 0.02, 1, 6)}<pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="14" stroke="${INK}" stroke-width="3" opacity="0.28"/></pattern><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed + boil}"/><feColorMatrix values="0 0 0 0 0.17  0 0 0 0 0.11  0 0 0 0 0.23  0 0 0 0.08 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
  const people = cast.map((c) => {
    const s = c.s ?? 1, sq = c.squash ?? 1;
    // squash and stretch around the feet (500, 900)
    return `<g transform="translate(${c.x ?? 0} ${(c.y ?? 0) + (c.dy ?? 0)}) translate(500 900) scale(${(s / Math.sqrt(sq)).toFixed(3)} ${(s * sq).toFixed(3)}) translate(-500 -900)"><ellipse cx="500" cy="900" rx="230" ry="34" fill="#00000040"/>${creature(c.t)}</g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="1080" height="1920"><defs>${defs}</defs>
<rect width="${VW}" height="${TOP + 10}" fill="${top}"/><rect y="${TOP + 990}" width="${VW}" height="${VH - TOP - 990}" fill="${bottom}"/>
<g transform="translate(0 ${TOP})">
<g filter="url(#bs)"><g transform="translate(500 500) scale(1.025) translate(-500 -500)">${scene(sceneId, { seed })}${back}</g></g>
${glow ? `<rect width="${VW}" height="1000" fill="#dff8ff" opacity="${glow.toFixed(2)}"/>` : ''}
<g filter="url(#bc)">${people}${front}</g>
</g>
${over}${cap ? caption(cap) : ''}${logo()}
<rect width="${VW}" height="${VH}" filter="url(#grain)" fill="#fff"/></svg>`;
}

module.exports = { frame, bubble, word, zz, heart, caption, logo, VW, VH, TOP, star };
