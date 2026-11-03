'use strict';
// Sticker candidates for one Tiny Hours mascot. Each has ONE idea that reads
// in a second, and the same 8 everyday reactions so the test is fair, plus
// one signature sticker for its idea.
const { smooth, ellipse, capsule, INK } = require('./kit');

const mirror = (pts) => pts.map(([x, y]) => [740 - x, y]);
function roundTri(A, B, C, k = 0.24, bulge = 12) {
  const P = [A, B, C], out = [];
  P.forEach((X, i) => {
    const prev = P[(i + 2) % 3], next = P[(i + 1) % 3];
    out.push([X[0] + (prev[0] - X[0]) * k, X[1] + (prev[1] - X[1]) * k], [X[0] + (next[0] - X[0]) * k, X[1] + (next[1] - X[1]) * k]);
    const m = [(X[0] + next[0]) / 2, (X[1] + next[1]) / 2]; const cx = (A[0] + B[0] + C[0]) / 3, cy = (A[1] + B[1] + C[1]) / 3; const l = Math.hypot(m[0] - cx, m[1] - cy); out.push([m[0] + (m[0] - cx) / l * bulge, m[1] + (m[1] - cy) / l * bulge]);
  });
  return smooth(out);
}
const items = {
  phone: ([x, y]) => `<g transform="rotate(-12 ${x} ${y - 40})"><rect x="${x - 26}" y="${y - 100}" width="52" height="86" rx="10" fill="#cfd6e6" stroke="${INK}" stroke-width="7"/><rect x="${x - 17}" y="${y - 90}" width="34" height="56" rx="4" fill="#bff3ff"/></g><path d="M${x - 70} ${y - 120} l -18 -16 M${x - 50} ${y - 140} l -6 -22 M${x - 86} ${y - 92} l -24 -4" stroke="#ffd84d" stroke-width="7" stroke-linecap="round"/>`,
  coffee: ([x, y]) => `<path d="M${x - 30} ${y - 92} h60 l-6 80 h-48 Z" fill="#fffdf7" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><rect x="${x - 32}" y="${y - 70}" width="64" height="24" fill="#b77a4c"/><path d="M${x - 10} ${y - 104} q 8 -12 0 -24 M${x + 12} ${y - 104} q 8 -12 0 -24" fill="none" stroke="#c9c2d6" stroke-width="6" stroke-linecap="round"/>`,
  heart: ([x, y]) => `<path transform="translate(${x} ${y - 40}) scale(1.1)" d="M0 26 C -52 -6 -24 -46 0 -16 C 24 -46 52 -6 0 26 Z" fill="#ff7a96" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`,
};

const CAST = {
  pomu: {
    name: 'Pomu', idea: 'the night-shift cat who is always sleepy',
    base: '#ffd5b0', shade: '#f0b086', items,
    signature: { caption: '5 more min...', eyes: 'sleepy', mouth: 'w', arms: ['cross', 'cross'], extras: ['zz'] },
    shape() {
      const earL = smooth([[244, 262], [252, 176], [266, 150], [292, 166], [338, 214]]);
      return {
        parts: [ellipse(370, 330, 168, 132), ellipse(370, 488, 122, 100), earL, smooth(mirror([[244, 262], [252, 176], [266, 150], [292, 166], [338, 214]])), capsule([468, 548], [540, 500], 20), capsule([540, 500], [556, 432], 18), ellipse(318, 588, 42, 24), ellipse(422, 588, 42, 24)],
        inside: `<ellipse cx="270" cy="198" rx="16" ry="28" transform="rotate(-20 270 198)" fill="#ffc0c8"/><ellipse cx="470" cy="198" rx="16" ry="28" transform="rotate(20 470 198)" fill="#ffc0c8"/><ellipse cx="434" cy="318" rx="64" ry="58" fill="#fff4e6"/><ellipse cx="370" cy="510" rx="78" ry="60" fill="#fff1e2"/><path d="M180 446 Q 370 478 560 446 L560 468 Q 370 500 180 468 Z" fill="#ff6b6b"/><g transform="rotate(-6 404 488)"><rect x="380" y="474" width="50" height="26" rx="5" fill="#fffdf7" stroke="${INK}" stroke-width="4"/><text x="405" y="492" font-family="Arial Black, Arial" font-weight="900" font-size="12" text-anchor="middle" fill="${INK}">HELLO</text></g>`,
        sockets: [[262, 478], [478, 478]], eyes: [[312, 330], [430, 330]], mouth: [370, 370], cheeks: [[280, 362], [462, 362]], top: [370, 198],
      };
    },
  },
  musubi: {
    name: 'Musubi', idea: 'a rice ball from the corner store who sticks with you',
    base: '#fffaf0', shade: '#e9dfca', items,
    signature: { caption: 'stick together!', eyes: 'happy', mouth: 'open', arms: ['cross', 'cross'], extras: ['hearts'] },
    shape() {
      return {
        parts: [roundTri([370, 168], [592, 588], [148, 588]), ellipse(300, 594, 40, 22), ellipse(440, 594, 40, 22)],
        inside: `<path d="M286 470 Q 370 458 454 470 L454 640 L286 640 Z" fill="#2f4a3a"/><path d="M300 484 Q 370 474 440 484" stroke="#5f7d68" stroke-width="5" fill="none" stroke-linecap="round"/>${[[250, 300], [470, 280], [330, 250], [420, 520], [240, 520], [500, 530]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="#f1e9d6" transform="rotate(${(x * 7) % 60 - 30} ${x} ${y})"/>`).join('')}`,
        sockets: [[226, 470], [514, 470]], eyes: [[326, 385], [414, 385]], mouth: [370, 420], cheeks: [[294, 414], [446, 414]], top: [370, 170],
      };
    },
  },
  yoru: {
    name: 'Yoru', idea: 'a little ghost doing overtime, dead inside (at work)',
    base: '#f4f1ff', shade: '#d6cdf3', items,
    signature: { caption: 'overtime again', eyes: 'flat', mouth: 'flat', arms: ['down', 'down'], hold: 'coffee', extras: ['gloom'] },
    shape() {
      const top = Array.from({ length: 13 }, (_, i) => { const a = Math.PI + (i / 12) * Math.PI; return [370 + Math.cos(a) * 182, 352 + Math.sin(a) * 178]; });
      const bottom = [[556, 430], [560, 520], [562, 574], [532, 604], [494, 580], [452, 606], [410, 582], [370, 608], [330, 582], [288, 606], [246, 580], [208, 604], [178, 574], [180, 520], [184, 430]];
      return {
        parts: [smooth([...top, ...bottom])],
        inside: `<path d="M286 418 Q 330 470 350 520 M454 418 Q 430 470 420 500" stroke="#4f7ee8" stroke-width="7" fill="none"/><rect x="398" y="496" width="48" height="58" rx="6" fill="#fffdf7" stroke="${INK}" stroke-width="5" transform="rotate(-6 422 525)"/><rect x="408" y="508" width="18" height="18" rx="3" fill="#cfd6e6" transform="rotate(-6 422 525)"/><path d="M356 434 L384 434 L378 450 L362 450 Z" fill="#33416e" stroke="${INK}" stroke-width="4"/><path d="M362 450 L378 450 L388 528 L370 544 L352 528 Z" fill="#33416e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
        sockets: [[200, 452], [540, 452]], eyes: [[318, 345], [422, 345]], mouth: [370, 390], cheeks: [[288, 380], [452, 380]], top: [370, 176],
      };
    },
  },
  lumi: {
    name: 'Lumi', idea: 'a fluffy moth who cannot resist any light (especially phone screens at 3am)',
    base: '#d9cdff', shade: '#b9a8f0', items,
    signature: { caption: 'one more video', eyes: 'heart', mouth: 'open', arms: ['down', 'ok'], hold: 'phone', extras: [] },
    shape() {
      const wing = (s) => ellipse(370 + s * 168, 470, 74, 96, s * -0.55);
      return {
        under: [{ parts: [wing(-1), wing(1)], base: '#ffe08a', inside: [-1, 1].map((s) => `<circle cx="${370 + s * 188}" cy="${452}" r="20" fill="#ff9fb0" stroke="${INK}" stroke-width="5"/><circle cx="${370 + s * 160}" cy="${520}" r="10" fill="#fffdf7"/>`).join('') }],
        parts: [ellipse(370, 392, 172, 186), ellipse(320, 586, 40, 22), ellipse(420, 586, 40, 22), ellipse(298, 152, 19, 17), ellipse(442, 152, 19, 17)],
        inside: `<ellipse cx="370" cy="500" rx="104" ry="72" fill="#efe9ff"/><path d="${smooth([...Array.from({ length: 13 }, (_, i) => [220 + i * 25, 446 + (i % 2 ? 16 : 0)]), ...Array.from({ length: 13 }, (_, i) => [520 - i * 25, 412 + (i % 2 ? -12 : 0)])])}" fill="#fffdf7"/><ellipse cx="298" cy="152" rx="19" ry="17" fill="#ffd84d"/><ellipse cx="442" cy="152" rx="19" ry="17" fill="#ffd84d"/>`,
        over: `<path d="M330 222 Q 308 190 300 168 M410 222 Q 432 190 440 168" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
        sockets: [[214, 470], [526, 470]], eyes: [[322, 345], [418, 345]], mouth: [370, 386], cheeks: [[290, 376], [450, 376]], top: [370, 212],
      };
    },
  },
};

// The same 8 everyday reactions for every candidate.
const REACTIONS = [
  { caption: 'hi!', eyes: 'dot', mouth: 'smile', arms: ['down', 'wave'], extras: ['motion'] },
  { caption: 'ok!', eyes: 'happy', mouth: 'smile', arms: ['down', 'ok'], extras: ['ok'] },
  { caption: 'thank you', eyes: 'happy', mouth: 'w', arms: ['cross', 'cross'], extras: ['hearts'] },
  { caption: 'sorry...', eyes: 'teary', mouth: 'wavy', arms: ['cross', 'cross'], extras: ['sweat'] },
  { caption: '!?', eyes: 'wide', mouth: 'o', arms: ['hug', 'hug'], extras: ['bang'] },
  { caption: 'good night', eyes: 'closed', mouth: 'tiny', arms: ['down', 'down'], extras: ['zz', 'moon'] },
  { caption: 'nope.', eyes: 'flat', mouth: 'flat', arms: ['cross', 'cross'], extras: ['gloom'] },
  { caption: 'yay!', eyes: 'happy', mouth: 'open', arms: ['up', 'up'], extras: ['sparkles'] },
];

module.exports = { CAST, REACTIONS };
