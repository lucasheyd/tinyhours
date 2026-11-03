'use strict';
// Yoru — the little ghost doing overtime. Drawn the way a ghost is built:
// no tube arms stuck on. The arms are flaps of the sheet itself, part of one
// silhouette, and the acting uses what a ghost can do: bow, droop, stretch,
// float, and fade out ("ghosting").
const { smooth, goo, eyes, mouth, blush, EXTRA, INK, W, H } = require('./kit');

const BASE = '#f4f1ff', SHADE = '#d6cdf3';
const f1 = (v) => (+v).toFixed(1);
let uid = 0; const id = (p) => `y${p}${(uid += 1)}`;

/** The sheet: a dome and a wavy hem; `wob` (0..1) ripples the hem for life. */
function sheet(wob = 0) {
  const top = Array.from({ length: 13 }, (_, i) => { const a = Math.PI + (i / 12) * Math.PI; return [370 + Math.cos(a) * 182, 352 + Math.sin(a) * 178]; });
  const hem = [[556, 430], [560, 520], [562, 574], [532, 604], [494, 580], [452, 606], [410, 582], [370, 608], [330, 582], [288, 606], [246, 580], [208, 604], [178, 574], [180, 520], [184, 430]]
    .map(([x, y], i) => [x, y + (y > 570 ? Math.sin(i * 1.7 + wob * 6.28) * 5 : 0)]);
  return smooth([...top, ...hem]);
}

/**
 * A flap of the sheet: thick where it leaves the body, rounded at the tip.
 * `deg` is the direction for the right flap (0 = right, 90 = down); the left one mirrors it.
 */
function flap(side, deg, len = 84) {
  const a = (side > 0 ? deg : 180 - deg) * Math.PI / 180;
  const B = [370 + side * 168, 448];
  const T = [B[0] + Math.cos(a) * len, B[1] + Math.sin(a) * len];
  const pts = []; const n = 8;
  for (let i = 0; i <= n; i += 1) { const s = i / n; const w = 36 * (1 - s) + 23 * s; const x = B[0] + (T[0] - B[0]) * s, y = B[1] + (T[1] - B[1]) * s; pts.push([x - Math.sin(a) * w, y + Math.cos(a) * w]); }
  const tip = Array.from({ length: 7 }, (_, i) => { const t = a - Math.PI / 2 + (i / 6) * Math.PI; return [T[0] + Math.cos(t) * 23, T[1] + Math.sin(t) * 23]; });
  const back = []; for (let i = n; i >= 0; i -= 1) { const s = i / n; const w = 36 * (1 - s) + 23 * s; const x = B[0] + (T[0] - B[0]) * s, y = B[1] + (T[1] - B[1]) * s; back.push([x + Math.sin(a) * w, y - Math.cos(a) * w]); }
  // the root goes well inside the body, so blur + threshold merges it softly
  return { d: smooth([[B[0] - side * 40, B[1] + 30], ...pts, ...tip.reverse(), ...back, [B[0] - side * 40, B[1] - 30]]), T };
}
const FLAP = { down: 62, droop: 80, out: 12, wave: -42, up: -66, back: 150, in: 104 };

const items = {
  coffee: ([x, y]) => `<g transform="translate(${x + 4} ${y + 6})"><path d="M-30 -92 h60 l-6 80 h-48 Z" fill="#fffdf7" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><rect x="-32" y="-70" width="64" height="24" fill="#b77a4c"/><path d="M-10 -104 q 8 -12 0 -24 M12 -104 q 8 -12 0 -24" fill="none" stroke="#c9c2d6" stroke-width="6" stroke-linecap="round"/></g>`,
  laptop: ([x, y]) => `<g transform="translate(${x - 20} ${y - 6})"><rect x="-50" y="-70" width="100" height="62" rx="8" fill="#cfd6e6" stroke="${INK}" stroke-width="7"/><rect x="-40" y="-60" width="80" height="42" rx="4" fill="#bff3ff"/><rect x="-64" y="-8" width="128" height="14" rx="6" fill="#aab4cc" stroke="${INK}" stroke-width="6"/></g>`,
  badge: ([x, y]) => `<g transform="translate(${x} ${y - 30}) rotate(-10)"><rect x="-30" y="-38" width="60" height="74" rx="8" fill="#fffdf7" stroke="${INK}" stroke-width="6"/><rect x="-18" y="-24" width="24" height="24" rx="4" fill="#cfd6e6"/><path d="M-18 12 h36 M-18 22 h24" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>`,
};

/**
 * One Yoru sticker. e: { caption, eyes, mouth, flaps: [l, r] (FLAP names or degrees),
 * extras, hold, bow (deg), squash (<1 droop, >1 stretch), float (px), fade (0..1), wob }.
 */
function yoru(e) {
  const deg = (k) => (typeof k === 'number' ? k : FLAP[k] ?? FLAP.down);
  const fl = [-1, 1].map((s, i) => flap(s, deg((e.flaps || ['down', 'down'])[i])));
  const body = sheet(e.wob || 0);
  const sil = `<path d="${body}"/>${fl.map((f) => `<path d="${f.d}"/>`).join('')}`;
  const o = id('o'), fb = id('f'), w = id('w'), cl = id('c');
  const c = { top: [370, 176], cheeks: [[288, 380], [452, 380]] };
  const inside = `<path d="M286 418 Q 330 470 350 520 M454 418 Q 430 470 420 500" stroke="#4f7ee8" stroke-width="7" fill="none"/><rect x="398" y="496" width="48" height="58" rx="6" fill="#fffdf7" stroke="${INK}" stroke-width="5" transform="rotate(-6 422 525)"/><rect x="408" y="508" width="18" height="18" rx="3" fill="#cfd6e6" transform="rotate(-6 422 525)"/><path d="M356 434 L384 434 L378 450 L362 450 Z" fill="#33416e" stroke="${INK}" stroke-width="4"/><path d="M362 450 L378 450 L388 528 L370 544 L352 528 Z" fill="#33416e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  const face = `${c.cheeks.map((p) => blush(p)).join('')}${eyes(e.eyes || 'dot', [318, 345], [422, 345])}${mouth(e.mouth || 'smile', [370, 390])}`;
  const tip = fl[1].T;
  const held = e.hold && items[e.hold] ? items[e.hold](tip) : '';
  const sq = e.squash || 1, lift = e.float || 0;
  const tf = `translate(0 ${-lift}) translate(370 600) rotate(${e.bow || 0}) scale(${f1(1 / Math.sqrt(sq))} ${f1(sq)}) translate(-370 -600)`;
  const extras = (e.extras || []).map((k) => (EXTRA[k] ? EXTRA[k](c, tip) : '')).join('');
  const shadow = lift ? `<ellipse cx="370" cy="618" rx="${150 - lift}" ry="12" fill="#00000022"/>` : '';
  const capY = 92;
  const caption = e.caption ? `<g transform="rotate(-4 370 ${capY})"><text x="370" y="${capY}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="${e.caption.length > 12 ? 52 : 62}" fill="${INK}" stroke="#fff" stroke-width="18" paint-order="stroke" stroke-linejoin="round">${e.caption}</text></g>` : '';
  const ghost = `<g transform="${tf}" opacity="${e.fade ?? 1}"><defs>${goo(o, INK, 0.2)}${goo(fb, BASE, 0.5)}${goo(w, '#ffffff', 0.02, 9)}<clipPath id="${cl}">${sil}</clipPath></defs>
<g filter="url(#${w})">${sil}</g><g filter="url(#${o})">${sil}</g><g filter="url(#${fb})">${sil}</g>
<g clip-path="url(#${cl})"><rect width="${W}" height="${H}" fill="${SHADE}"/><g transform="translate(-16 -14)" fill="${BASE}">${sil}</g>${inside}</g>${face}${held}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${shadow}${ghost}${extras}${caption}</svg>`;
}

// 16 stickers: everyday reactions, plus office and ghost jokes.
const SET = [
  { caption: 'hi!', eyes: 'dot', mouth: 'smile', flaps: ['down', 'wave'], extras: ['motion'] },
  { caption: 'ok!', eyes: 'happy', mouth: 'smile', flaps: ['down', 'up'], extras: ['ok'] },
  { caption: 'thank you', eyes: 'happy', mouth: 'w', flaps: ['in', 'in'], bow: -12, extras: ['hearts'] },
  { caption: 'sorry...', eyes: 'teary', mouth: 'wavy', flaps: ['droop', 'droop'], squash: 0.9, extras: ['sweat'] },
  { caption: '!?', eyes: 'wide', mouth: 'o', flaps: ['up', 'up'], squash: 1.1, wob: 0.5, extras: ['bang'] },
  { caption: 'good night', eyes: 'closed', mouth: 'tiny', flaps: ['in', 'in'], float: 14, extras: ['zz', 'moon'] },
  { caption: 'nope.', eyes: 'flat', mouth: 'flat', flaps: ['down', 'down'], fade: 0.45 },
  { caption: 'yay!', eyes: 'happy', mouth: 'open', flaps: ['up', 'up'], float: 18, wob: 0.3, extras: ['sparkles'] },
  { caption: 'overtime again', eyes: 'flat', mouth: 'flat', flaps: ['down', 'in'], hold: 'coffee', extras: ['gloom'] },
  { caption: 'boo!', eyes: 'wink', mouth: 'open', flaps: ['out', 'up'], wob: 0.7, extras: [] },
  { caption: 'brb', eyes: 'dot', mouth: 'smile', flaps: ['back', 'back'], float: 12, fade: 0.7, extras: ['motion'] },
  { caption: "i'm dead lol", eyes: 'x', mouth: 'open', flaps: ['droop', 'droop'], extras: [] },
  { caption: 'on my way!', eyes: 'dot', mouth: 'smile', flaps: ['back', 'back'], bow: 10, float: 16, extras: ['motion'] },
  { caption: 'meeting again?', eyes: 'teary', mouth: 'wavy', flaps: ['down', 'in'], hold: 'laptop', extras: ['sweat'] },
  { caption: "it's fine.", eyes: 'happy', mouth: 'flat', flaps: ['down', 'down'], extras: ['sweat', 'gloom'] },
  { caption: 'clocked out!', eyes: 'happy', mouth: 'open', flaps: ['wave', 'up'], float: 20, hold: 'badge', extras: ['sparkles'] },
];

module.exports = { yoru, SET };
