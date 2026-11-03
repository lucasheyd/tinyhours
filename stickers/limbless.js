'use strict';
// Second round of mascot candidates, after Yoru. Rule: no limbs that the
// body would not have. Each character acts with what it really is:
//   Loaf    — a cat in loaf pose: paws always tucked in; ears and tail do the talking.
//   Futo    — someone rolled up in a blanket who won't get out of bed; peeks, hides, wiggles.
//   Burnie  — a slice of toast that is a little burnt out; smoke, crumbs, butter, the toaster.
//   Drizzle — a tiny cloud that wears its mood as weather; rain, storm, sun, rainbow.
const { smooth, ellipse, goo, eyes, mouth, blush, EXTRA, INK, W, H } = require('./kit');

const f1 = (v) => (+v).toFixed(1);
let uid = 0; const id = (p) => `l${p}${(uid += 1)}`;
const mirror = (pts) => pts.map(([x, y]) => [740 - x, y]);

/** Rounded box as a superellipse. */
function rbox(cx, cy, hw, hh, p = 3, n = 36) {
  return smooth(Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; const c = Math.cos(a), s = Math.sin(a); return [cx + Math.sign(c) * Math.abs(c) ** (2 / p) * hw, cy + Math.sign(s) * Math.abs(s) ** (2 / p) * hh]; }));
}
/** A tube along a polyline, thinner toward the end, with a round tip. */
function tube(pts, r0, r1) {
  const L = [], R = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; const r = r0 + (r1 - r0) * (i / (pts.length - 1));
    L.push([p[0] - dy / l * r, p[1] + dx / l * r]); R.push([p[0] + dy / l * r, p[1] - dx / l * r]);
  });
  const e = pts[pts.length - 1], q = pts[pts.length - 2]; const ang = Math.atan2(e[1] - q[1], e[0] - q[0]);
  const cap = Array.from({ length: 5 }, (_, i) => { const t = ang - Math.PI / 2 + ((i + 1) / 6) * Math.PI; return [e[0] + Math.cos(t) * r1, e[1] + Math.sin(t) * r1]; });
  return smooth([...L, ...cap.reverse(), ...R.reverse()]);
}
const curve = (P, n = 14) => { // quadratic bezier points through control P = [a, c, b]
  const [a, c, b] = P; return Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]; });
};

// ----------------------------------------------------------------- props and weather
const PROPS = {
  snow: () => [[200, 250], [560, 230], [240, 560], [600, 520], [520, 600], [160, 420]].map(([x, y], i) => `<g transform="translate(${x} ${y}) rotate(${i * 17})">${[0, 60, 120].map((r) => `<path d="M-14 0 H14" transform="rotate(${r})" stroke="#9fd0ff" stroke-width="6" stroke-linecap="round"/>`).join('')}</g>`).join(''),
  wind: () => [[120, 330], [100, 410], [130, 490]].map(([x, y], i) => `<path d="M${x} ${y} q 40 -${10 + i * 4} 80 0 t 40 -10" fill="none" stroke="#9aa6c4" stroke-width="7" stroke-linecap="round"/>`).join(''),
  shiver: (c) => [-1, 1].map((d) => `<path d="M${370 + d * 180} 360 l ${d * 14} 10 l ${-d * 14} 10 l ${d * 14} 10 l ${-d * 14} 10" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`).join(''),
  sign: () => `<g transform="translate(545 300) rotate(8)"><path d="M-40 -60 L0 -96 L40 -60" fill="none" stroke="${INK}" stroke-width="6"/><rect x="-82" y="-60" width="164" height="96" rx="14" fill="#fff4c9" stroke="${INK}" stroke-width="7"/><text x="0" y="-18" text-anchor="middle" font-family="Inter, Arial" font-weight="900" font-size="26" fill="${INK}">DO NOT</text><text x="0" y="16" text-anchor="middle" font-family="Inter, Arial" font-weight="900" font-size="26" fill="${INK}">DISTURB</text></g>`,
  heat: () => `<g transform="translate(560 250)">${Array.from({ length: 8 }, (_, i) => `<path d="M0 -84 l0 -26" transform="rotate(${i * 45})" stroke="#ff9f43" stroke-width="11" stroke-linecap="round"/>`).join('')}<circle r="70" fill="#ffb347" stroke="${INK}" stroke-width="7"/></g>`,
  boom: (c) => [-1, 1].map((d) => `<path transform="translate(${370 + d * 120} 572) scale(${d} 1)" d="M10 -30 L-22 14 L2 14 L-14 52 L28 -2 L2 -2 Z" fill="#ffd84d" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`).join('') + `<path transform="translate(370 590)" d="M10 -30 L-22 14 L2 14 L-14 52 L28 -2 L2 -2 Z" fill="#ffd84d" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`,
  fewDrops: () => [[300, 572], [400, 596], [470, 568]].map(([x, y]) => `<path d="M${x} ${y} l -5 18" stroke="#7cc6ff" stroke-width="8" stroke-linecap="round"/>`).join(''),
  alarm: () => `<g transform="translate(590 540) rotate(12)"><path d="M-40 -46 l-14 -14 M40 -46 l14 -14" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><circle r="48" fill="#ff8a7a" stroke="${INK}" stroke-width="7"/><circle r="34" fill="#fffdf7" stroke="${INK}" stroke-width="5"/><path d="M0 -20 V0 L14 10" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="-26" cy="-50" r="12" fill="#ffd84d" stroke="${INK}" stroke-width="5"/><circle cx="26" cy="-50" r="12" fill="#ffd84d" stroke="${INK}" stroke-width="5"/><path d="M-70 -30 l-16 -8 M70 -30 l16 -8 M-74 0 h-18 M74 0 h18" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>`,
  check: (c) => `<g transform="translate(${c.top[0] + 160} ${c.top[1] + 40})"><circle r="34" fill="#7ee0a1" stroke="${INK}" stroke-width="7"/><path d="M-14 0 l10 11 l20 -22" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  hop: (c) => `<path d="M${c.top[0] - 120} ${c.top[1] + 30} q -16 -10 -10 -28 M${c.top[0] + 120} ${c.top[1] + 30} q 16 -10 10 -28" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
  smoke: (c) => [[-30, 0], [20, -26], [64, -6]].map(([dx, dy], i) => `<path d="M${c.top[0] + dx} ${c.top[1] + dy - 10} q -16 -20 0 -40 q 16 -20 0 -40" fill="none" stroke="#9a9aa8" stroke-width="${12 - i * 2}" stroke-linecap="round" opacity="0.8"/>`).join(''),
  crumbs: () => [[180, 560], [210, 600], [560, 575], [600, 610], [530, 615]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="${14 - (i % 2) * 4}" height="${12 - (i % 2) * 3}" rx="3" fill="#d99a52" stroke="${INK}" stroke-width="4" transform="rotate(${i * 23} ${x} ${y})"/>`).join(''),
  rain: (c) => Array.from({ length: 9 }, (_, i) => { const x = 230 + i * 36, y = 560 + (i % 3) * 18; return `<path d="M${x} ${y} l -6 22" stroke="#7cc6ff" stroke-width="8" stroke-linecap="round"/>`; }).join(''),
  bolt: (c) => `<path transform="translate(${c.top[0] + 30} 560)" d="M10 -30 L-22 14 L2 14 L-14 52 L28 -2 L2 -2 Z" fill="#ffd84d" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`,
  heartsUp: (c) => [[c.top[0] - 150, c.top[1] + 30, 0.9], [c.top[0] + 160, c.top[1] + 10, 1], [c.top[0] + 200, c.top[1] - 40, 0.6]].map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 26 C -52 -6 -24 -46 0 -16 C 24 -46 52 -6 0 26 Z" fill="#ff7a96" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`).join(''),
};

// ----------------------------------------------------------------- the characters
const CHARS = {
  loaf: {
    name: 'Loaf', idea: 'a cat in loaf mode: paws tucked in, refuses to do anything',
    base: '#d9dde8', shade: '#b8bfd2',
    shape(e) {
      const ear = { up: [[262, 318], [268, 232], [282, 214], [300, 226], [338, 282]], perk: [[262, 318], [264, 214], [278, 190], [298, 206], [338, 282]], flat: [[256, 332], [222, 286], [228, 268], [262, 270], [324, 300]] }[e.ears || 'up'];
      const tails = {
        curl: [[548, 556], [560, 600], [500, 612], [420, 606], [372, 594]],
        up: [[526, 520], [586, 470], [604, 400], [586, 340], [560, 318]],
        wave: [[526, 520], [592, 466], [616, 396], [610, 336], [640, 300]],
        ok: [[526, 520], [590, 470], [604, 410], ...Array.from({ length: 11 }, (_, i) => { const a = Math.PI / 2 + (i / 10) * Math.PI * 2; return [604 + Math.cos(a) * -32 + 0, 360 + Math.sin(a) * 32]; })],
      };
      const tail = tails[e.tail || 'curl'];
      return {
        parts: [rbox(370, 494, 178, 100, 3), ellipse(370, 374, 130, 106), smooth(ear), smooth(mirror(ear)), tube(tail, 22, 17)],
        inside: `<ellipse cx="370" cy="420" rx="62" ry="42" fill="#fbfcff"/><ellipse cx="370" cy="540" rx="120" ry="44" fill="#eef0f6"/>${[-28, 0, 28].map((dx) => `<path d="M${370 + dx} 286 l 0 26" stroke="#9aa3ba" stroke-width="9" stroke-linecap="round"/>`).join('')}<path d="M362 398 h16 l-8 9 Z" fill="#ff9fb0"/><path d="${smooth(ear.map(([x, y]) => [x + (300 - x) * 0.35, y + (250 - y) * 0.35]))}" fill="#ffc6cf"/><path d="${smooth(mirror(ear).map(([x, y]) => [x + (440 - x) * 0.35, y + (250 - y) * 0.35]))}" fill="#ffc6cf"/>`,
        eyes: [[318, 366], [422, 366]], mouth: [370, 410], cheeks: [[288, 398], [452, 398]], top: [370, 214], pivot: [370, 594],
        tip: tail[tail.length - 1],
      };
    },
    set: [
      { caption: 'hi!', eyes: 'dot', mouth: 'w', tail: 'wave', extras: ['motion'], motionAt: 'tip' },
      { caption: 'ok!', eyes: 'happy', mouth: 'w', tail: 'up', extras: ['check'] },
      { caption: 'thank you', eyes: 'happy', mouth: 'w', bow: -10, extras: ['heartsUp'] },
      { caption: 'sorry...', eyes: 'teary', mouth: 'wavy', ears: 'flat', squash: 0.92, extras: ['sweat'] },
      { caption: '!?', eyes: 'wide', mouth: 'o', ears: 'perk', tail: 'up', squash: 1.08, extras: ['bang'] },
      { caption: 'good night', eyes: 'closed', mouth: 'tiny', squash: 0.94, extras: ['zz', 'moon'] },
      { caption: 'nope.', eyes: 'flat', mouth: 'flat', ears: 'flat', extras: ['gloom'] },
      { caption: 'yay!', eyes: 'happy', mouth: 'open', ears: 'perk', tail: 'up', float: 16, extras: ['sparkles', 'hop'] },
      { caption: 'not moving.', eyes: 'sleepy', mouth: 'w', extras: [] },
    ],
  },

  futo: {
    name: 'Futo', idea: 'rolled up in a blanket, will not get out of bed',
    base: '#ffbfcc', shade: '#f19bb0',
    shape(e) {
      const peek = e.peek || 'out';
      const face = peek === 'in' ? '' : `<ellipse cx="370" cy="330" rx="98" ry="86" fill="#ffd9e2"/><ellipse cx="370" cy="336" rx="86" ry="74" fill="#ffeadb"/><path d="M296 300 Q 330 262 370 276 Q 410 262 444 300 Q 400 286 370 298 Q 340 286 296 300 Z" fill="#6b4a3a"/>`;
      const cover = peek === 'half' ? `<path d="M270 336 Q 370 358 470 336 L470 420 L270 420 Z" fill="#ffbfcc"/><path d="M272 338 Q 370 360 468 338" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` : peek === 'in' ? `<path d="M300 318 Q 370 300 440 318" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" opacity="0.6"/>` : '';
      return {
        parts: [rbox(370, 420, 152, 184, 2.6)],
        inside: `${Array.from({ length: 16 }, (_, i) => `<circle cx="${236 + (i % 4) * 90 + ((i >> 2) % 2) * 45}" cy="${270 + (i >> 2) * 92}" r="9" fill="#fff4f6"/>`).join('')}<path d="M210 540 Q 330 470 540 360 L540 640 L210 640 Z" fill="#ffd2dc"/><path d="M212 540 Q 330 470 538 362" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" opacity="0.7"/>${face}${cover}`,
        noFace: peek === 'in', faceClip: peek === 'half' ? 'eyes' : 'all',
        eyes: [[336, 334], [404, 334]], mouth: [370, 372], cheeks: [[314, 360], [426, 360]], top: [370, 236], pivot: [370, 604],
      };
    },
    set: [
      { caption: 'hi!', eyes: 'dot', mouth: 'smile', bow: 8, extras: ['hop'] },
      { caption: 'ok!', eyes: 'happy', mouth: 'smile', extras: ['check'] },
      { caption: 'thank you', eyes: 'happy', mouth: 'w', bow: -12, extras: ['heartsUp'] },
      { caption: 'sorry...', eyes: 'teary', mouth: 'wavy', peek: 'half', squash: 0.94, extras: ['sweat'] },
      { caption: '!?', eyes: 'wide', mouth: 'o', squash: 1.08, extras: ['bang'] },
      { caption: 'good night', eyes: 'closed', mouth: 'tiny', peek: 'half', extras: ['zz', 'moon'] },
      { caption: 'nope.', peek: 'in', bow: -6, extras: ['gloom'] },
      { caption: 'yay!', eyes: 'happy', mouth: 'open', float: 18, extras: ['sparkles', 'hop'] },
      { caption: '5 more minutes...', eyes: 'closed', mouth: 'tiny', peek: 'half', bow: -10, extras: ['zz', 'alarm'] },
    ],
  },

  burnie: {
    name: 'Burnie', idea: 'a slice of toast, always a little burnt out',
    base: '#d99a52', shade: '#b97a3a',
    shape(e) {
      const pts = [[205, 590], [535, 590], [548, 470], [546, 330], [578, 262], [556, 196], [478, 168], [420, 182], [370, 204], [320, 182], [262, 168], [184, 196], [162, 262], [194, 330], [192, 470]];
      const inner = pts.map(([x, y]) => [370 + (x - 370) * 0.84, 392 + (y - 392) * 0.86]);
      const burnt = e.burnt || 0;
      const mix = (a, b, k) => '#' + [0, 2, 4].map((i) => Math.round(parseInt(a.slice(1 + i, 3 + i), 16) * (1 - k) + parseInt(b.slice(1 + i, 3 + i), 16) * k).toString(16).padStart(2, '0')).join('');
      const spots = burnt ? `<path d="${smooth(inner)}" fill="none" stroke="#8f552b" stroke-width="${f1(10 + burnt * 22)}" opacity="${f1(0.25 + burnt * 0.45)}"/><ellipse cx="370" cy="420" rx="130" ry="150" fill="${mix('#f8c77e', '#b9773d', burnt)}" opacity="${f1(0.5 + burnt * 0.3)}"/>` : '';
      const toaster = e.toaster ? `<g><rect x="168" y="480" width="404" height="140" rx="40" fill="#cfd6e6" stroke="${INK}" stroke-width="8"/><rect x="200" y="470" width="340" height="22" rx="10" fill="#9aa3ba" stroke="${INK}" stroke-width="6"/><rect x="560" y="520" width="34" height="18" rx="8" fill="#ff7a6b" stroke="${INK}" stroke-width="6"/><circle cx="230" cy="580" r="10" fill="#9aa3ba"/></g>` : '';
      const butter = e.butter ? `<g transform="rotate(-8 370 190)"><rect x="330" y="160" width="80" height="50" rx="10" fill="#ffe36b" stroke="${INK}" stroke-width="6"/><path d="M340 206 q 6 22 14 0 M384 206 q 6 28 14 0" fill="#ffe36b" stroke="${INK}" stroke-width="5"/></g>` : '';
      return {
        parts: [smooth(pts)],
        inside: `<path d="${smooth(inner)}" fill="#ffe2a8"/><ellipse cx="370" cy="420" rx="130" ry="150" fill="#f8c77e" opacity="0.6"/>${spots}`,
        over: butter, front: toaster,
        eyes: [[320, 384], [420, 384]], mouth: [370, 426], cheeks: [[290, 418], [450, 418]], top: [370, 168], pivot: [370, 592],
      };
    },
    set: [
      { caption: 'hi!', eyes: 'dot', mouth: 'smile', bow: 8, extras: ['hop'] },
      { caption: 'ok!', eyes: 'happy', mouth: 'smile', butter: true, extras: ['check'] },
      { caption: 'thank you', eyes: 'happy', mouth: 'w', bow: -12, butter: true, extras: ['heartsUp'] },
      { caption: 'sorry...', eyes: 'teary', mouth: 'wavy', squash: 0.92, burnt: 0.4, extras: ['sweat', 'crumbs'] },
      { caption: '!?', eyes: 'wide', mouth: 'o', squash: 1.08, extras: ['bang', 'crumbs'] },
      { caption: 'good night', eyes: 'closed', mouth: 'tiny', toaster: true, float: -40, extras: ['zz', 'moon'] },
      { caption: 'nope.', eyes: 'flat', mouth: 'flat', burnt: 0.6, extras: ['smoke'] },
      { caption: 'yay!', eyes: 'happy', mouth: 'open', toaster: true, float: 40, extras: ['sparkles'] },
      { caption: 'a little burnt out', eyes: 'flat', mouth: 'wavy', burnt: 1, extras: ['smoke'] },
    ],
  },

  drizzle: {
    name: 'Drizzle', idea: 'a tiny cloud that wears its mood as weather',
    base: '#f2f6ff', shade: '#c9d5f0',
    shape(e) {
      const storm = e.weather === 'storm';
      const behind = (e.weather === 'rainbow' ? ['#ff8a8a', '#ffc46b', '#fff27a', '#8fe39a', '#8cc8ff', '#c59cff'].map((c, i) => `<path d="M${430 + i * 16} 470 A ${200 - i * 16} ${190 - i * 16} 0 0 1 ${700 - i * 4} 626" fill="none" stroke="${c}" stroke-width="16"/>`).join('') : '')
        + (e.weather === 'sun' ? `<g transform="translate(540 270)">${Array.from({ length: 8 }, (_, i) => `<path d="M0 -70 l0 -24" transform="rotate(${i * 45})" stroke="#ffc94d" stroke-width="10" stroke-linecap="round"/>`).join('')}<circle r="58" fill="#ffd84d" stroke="${INK}" stroke-width="7"/></g>` : '');
      return {
        parts: [ellipse(250, 438, 92, 88), ellipse(340, 372, 112, 108), ellipse(452, 382, 102, 98), ellipse(524, 446, 80, 76), rbox(386, 478, 210, 64, 2.4)],
        base: storm ? '#aeb6cc' : undefined, shade: storm ? '#8d96b0' : undefined,
        inside: `<ellipse cx="320" cy="330" rx="58" ry="26" fill="#ffffff" opacity="0.8"/><ellipse cx="452" cy="336" rx="40" ry="18" fill="#ffffff" opacity="0.7"/>`,
        behind,
        eyes: [[330, 430], [432, 430]], mouth: [381, 470], cheeks: [[300, 462], [462, 462]], top: [380, 262], pivot: [386, 540],
      };
    },
    set: [
      { caption: 'hi!', eyes: 'dot', mouth: 'smile', weather: 'sun', extras: [] },
      { caption: 'ok!', eyes: 'happy', mouth: 'smile', extras: ['check'] },
      { caption: 'thank you', eyes: 'happy', mouth: 'w', bow: -8, extras: ['heartsUp'] },
      { caption: 'sorry...', eyes: 'teary', mouth: 'wavy', squash: 0.92, extras: ['rain'] },
      { caption: '!?', eyes: 'wide', mouth: 'o', weather: 'storm', extras: ['bang', 'bolt'] },
      { caption: 'good night', eyes: 'closed', mouth: 'tiny', extras: ['zz', 'moon'] },
      { caption: 'nope.', eyes: 'flat', mouth: 'flat', weather: 'storm', extras: ['rain'] },
      { caption: 'yay!', eyes: 'happy', mouth: 'open', weather: 'rainbow', extras: ['sparkles'] },
      { caption: 'not today.', eyes: 'flat', mouth: 'wavy', weather: 'storm', extras: ['rain', 'bolt'] },
    ],
  },
};

/** One sticker for a limbless character. Acting: bow (deg), squash, float (px), fade, plus the character's own options. */
function limbless(ch, e) {
  const s = ch.shape(e);
  const base = s.base || ch.base, shade = s.shade || ch.shade;
  const sil = s.parts.map((d) => `<path d="${d}"/>`).join('');
  const o = id('o'), fb = id('f'), w = id('w'), cl = id('c');
  const [px, py] = e.pivot || s.pivot; const sq = e.squash || 1, lift = e.float || 0;
  const tf = `translate(0 ${-lift}) translate(${px} ${py}) rotate(${e.bow || 0}) scale(${f1(1 / Math.sqrt(sq))} ${f1(sq)}) translate(${-px} ${-py})`;
  const faceEyes = s.noFace ? '' : eyes(e.eyes || 'dot', ...s.eyes);
  const faceRest = s.noFace || s.faceClip === 'eyes' ? '' : `${s.cheeks.map((p) => blush(p)).join('')}${mouth(e.mouth || 'smile', s.mouth)}`;
  const c = { top: s.top, cheeks: s.cheeks };
  const tip = e.motionAt === 'tip' && s.tip ? s.tip : [s.top[0] + 120, s.top[1] + 140];
  const extras = (e.extras || []).map((k) => (PROPS[k] ? PROPS[k](c) : EXTRA[k] ? EXTRA[k](c, tip) : '')).join('');
  const shadow = lift > 0 && ch !== CHARS.drizzle ? `<ellipse cx="${px}" cy="618" rx="${Math.max(60, 150 - lift)}" ry="12" fill="#00000022"/>` : '';
  const capY = 92;
  const caption = e.caption ? `<g transform="rotate(-4 370 ${capY})"><text x="370" y="${capY}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="${e.caption.length > 12 ? 50 : 62}" fill="${INK}" stroke="#fff" stroke-width="18" paint-order="stroke" stroke-linejoin="round">${e.caption}</text></g>` : '';
  // half-peek: eyes are drawn under the blanket edge, so the cover goes on top of them
  const body = `<defs>${goo(o, INK, 0.2)}${goo(fb, base, 0.5)}${goo(w, '#ffffff', 0.02, 9)}<clipPath id="${cl}">${sil}</clipPath></defs>${s.behind || ''}
<g filter="url(#${w})">${sil}</g><g filter="url(#${o})">${sil}</g><g filter="url(#${fb})">${sil}</g>
<g clip-path="url(#${cl})"><rect width="${W}" height="${H}" fill="${shade}"/><g transform="translate(-16 -14)" fill="${base}">${sil}</g>${s.inside || ''}${s.faceClip === 'eyes' ? '' : ''}</g>`;
  const faceSvg = s.faceClip === 'eyes' ? `<g clip-path="url(#${cl})">${faceEyes}</g>${(s.inside || '').includes('Q 370 358 470 336') ? `<g clip-path="url(#${cl})"><path d="M270 336 Q 370 358 470 336 L470 420 L270 420 Z" fill="${base}"/><path d="M272 338 Q 370 360 468 338" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>` : ''}` : `${faceRest}${faceEyes}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${shadow}<g transform="${tf}" opacity="${e.fade ?? 1}">${body}${s.over || ''}${faceSvg}</g>${s.front || ''}${extras}${caption}</svg>`;
}

// The approved ones get a full pack of 16: the 9 above plus 7 more of their own.
CHARS.drizzle.pack = [...CHARS.drizzle.set,
  { caption: 'brb', eyes: 'dot', mouth: 'smile', fade: 0.5, extras: ['wind'] },
  { caption: 'on my way!', eyes: 'dot', mouth: 'open', bow: 8, extras: ['wind'] },
  { caption: "it's fine.", eyes: 'happy', mouth: 'flat', extras: ['fewDrops', 'sweat'] },
  { caption: 'love it!', eyes: 'heart', mouth: 'open', weather: 'rainbow', extras: ['heartsUp'] },
  { caption: 'so tired...', eyes: 'sleepy', mouth: 'wavy', squash: 0.86, extras: ['fewDrops'] },
  { caption: 'so hot today', eyes: 'teary', mouth: 'o', squash: 0.9, extras: ['heat', 'sweat'] },
  { caption: 'brrr', eyes: 'closed', mouth: 'wavy', extras: ['snow', 'shiver'] },
];
CHARS.futo.pack = [...CHARS.futo.set,
  { caption: 'monday...', eyes: 'flat', mouth: 'flat', peek: 'half', extras: ['gloom'] },
  { caption: 'brb', peek: 'in', bow: 6, extras: ['zz'] },
  { caption: 'on my way!', eyes: 'dot', mouth: 'open', bow: 16, float: 12, extras: ['wind'] },
  { caption: "it's fine.", eyes: 'happy', mouth: 'flat', peek: 'half', extras: ['sweat'] },
  { caption: 'love you', eyes: 'heart', mouth: 'w', extras: ['heartsUp'] },
  { caption: 'cold...', eyes: 'teary', mouth: 'wavy', peek: 'half', squash: 0.94, extras: ['snow', 'shiver'] },
  { caption: 'do not disturb', peek: 'in', bow: -4, extras: ['sign'] },
];

module.exports = { CHARS, limbless };
