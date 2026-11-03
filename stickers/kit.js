'use strict';
// Tiny Hours — sticker style. Simpler than the video art, on purpose: the
// characters that sell as chat stickers (LINE, Telegram) read at thumbnail
// size, so: one round silhouette, small dot eyes, a tiny mouth, flat pastel
// fill with one soft shade, a single clean line, a white die-cut border and
// a short caption. Body parts are merged into one silhouette with soft joints
// (blur + threshold), as in art/body.js.
// A sticker is drawn in a 740x640 box (LINE's 370x320 at 2x).

const INK = '#3a2b33';
const W = 740, H = 640;
let uid = 0;
const id = (p) => `${p}${(uid += 1)}`;
const f1 = (v) => (+v).toFixed(1);

/** Smooth closed path through points (Catmull-Rom). */
function smooth(p, closed = true) {
  const n = p.length; const at = (i) => p[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${f1(p[0][0])} ${f1(p[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i += 1) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}
const ellipse = (cx, cy, rx, ry, rot = 0, n = 20) => smooth(Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; }));
/** A capsule (limb) from A to B with radius r. */
function capsule(A, B, r) {
  const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1; const nx = -dy / l * r, ny = dx / l * r; const ux = dx / l * r, uy = dy / l * r;
  return smooth([[A[0] + nx, A[1] + ny], [(A[0] + B[0]) / 2 + nx * 1.04, (A[1] + B[1]) / 2 + ny * 1.04], [B[0] + nx, B[1] + ny], [B[0] + ux * 0.9 + nx * 0.5, B[1] + uy * 0.9 + ny * 0.5], [B[0] + ux, B[1] + uy], [B[0] + ux * 0.9 - nx * 0.5, B[1] + uy * 0.9 - ny * 0.5], [B[0] - nx, B[1] - ny], [(A[0] + B[0]) / 2 - nx * 1.04, (A[1] + B[1]) / 2 - ny * 1.04], [A[0] - nx, A[1] - ny], [A[0] - ux, A[1] - uy]]);
}

/** Blur + threshold over a group's alpha: the merged silhouette, grown when t < 0.5. */
const goo = (fid, color, t, sigma = 7) => `<filter id="${fid}" filterUnits="userSpaceOnUse" x="-60" y="-60" width="${W + 120}" height="${H + 120}" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${sigma}" result="b"/><feComponentTransfer in="b" result="m"><feFuncA type="linear" slope="30" intercept="${(0.5 - 30 * t).toFixed(3)}"/></feComponentTransfer><feFlood flood-color="${color}" result="c"/><feComposite in="c" in2="m" operator="in"/></filter>`;
const ringF = (fid, color, t0, t1, sigma = 5) => `<filter id="${fid}" filterUnits="userSpaceOnUse" x="-60" y="-60" width="${W + 120}" height="${H + 120}" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${sigma}" result="b"/><feComponentTransfer in="b" result="o"><feFuncA type="linear" slope="30" intercept="${(0.5 - 30 * t0).toFixed(3)}"/></feComponentTransfer><feComponentTransfer in="b" result="i"><feFuncA type="linear" slope="30" intercept="${(0.5 - 30 * t1).toFixed(3)}"/></feComponentTransfer><feComposite in="o" in2="i" operator="out" result="r"/><feFlood flood-color="${color}" result="c"/><feComposite in="c" in2="r" operator="in"/></filter>`;

// ----------------------------------------------------------------- faces
/** Eyes: small dots by default — the selling sticker characters keep them tiny. */
function eyes(kind, L, R) {
  const pair = [L, R];
  const dot = ([x, y], s = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${12 * s}" ry="${16 * s}" fill="${INK}"/><circle cx="${f1(x - 4 * s)}" cy="${f1(y - 6 * s)}" r="${4.2 * s}" fill="#fff"/>`;
  const line = (d, w = 8) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (kind === 'dot') return pair.map((p) => dot(p)).join('');
  if (kind === 'wide') return pair.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="21" fill="#fff" stroke="${INK}" stroke-width="7"/><circle cx="${x}" cy="${y + 2}" r="8" fill="${INK}"/>`).join('');
  if (kind === 'happy') return pair.map(([x, y]) => line(`M${x - 17} ${y + 6} Q ${x} ${y - 16} ${x + 17} ${y + 6}`)).join('');
  if (kind === 'closed') return pair.map(([x, y]) => line(`M${x - 17} ${y - 2} Q ${x} ${y + 14} ${x + 17} ${y - 2}`)).join('');
  if (kind === 'sleepy') return pair.map(([x, y]) => line(`M${x - 18} ${y} L${x + 18} ${y}`) + `<path d="M${x - 14} ${y} Q ${x} ${y + 14} ${x + 14} ${y} Z" fill="${INK}"/>`).join('');
  if (kind === 'flat') return pair.map(([x, y]) => line(`M${x - 18} ${y + 2} L${x + 18} ${y + 2}`, 9)).join('');
  if (kind === 'teary') return pair.map(([x, y]) => dot([x, y], 1.05) + `<path d="M${x - 15} ${y + 10} q 15 10 30 0" fill="none" stroke="#7cc6ff" stroke-width="6" stroke-linecap="round"/>`).join('');
  if (kind === 'heart') return pair.map(([x, y]) => `<path transform="translate(${x} ${y}) scale(0.62)" d="M0 26 C -52 -6 -24 -46 0 -16 C 24 -46 52 -6 0 26 Z" fill="#ff6f8f" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`).join('');
  return pair.map((p) => dot(p)).join('');
}
function mouth(kind, [x, y]) {
  const line = (d, w = 7) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (kind === 'w') return line(`M${x - 16} ${y} q 8 9 16 0 q 8 9 16 0`);
  if (kind === 'smile') return line(`M${x - 12} ${y} q 12 11 24 0`);
  if (kind === 'o') return `<ellipse cx="${x}" cy="${y + 4}" rx="9" ry="11" fill="#8c3550" stroke="${INK}" stroke-width="6"/>`;
  if (kind === 'open') return `<path d="M${x - 18} ${y - 2} Q ${x} ${y + 2} ${x + 18} ${y - 2} Q ${x + 14} ${y + 24} ${x} ${y + 25} Q ${x - 14} ${y + 24} ${x - 18} ${y - 2} Z" fill="#8c3550" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><ellipse cx="${x + 2}" cy="${y + 18}" rx="9" ry="5" fill="#ff8fa3"/>`;
  if (kind === 'wavy') return line(`M${x - 18} ${y + 4} q 6 -8 12 0 q 6 8 12 0 q 6 -8 12 0`);
  if (kind === 'flat') return line(`M${x - 12} ${y + 2} L${x + 12} ${y + 2}`);
  if (kind === 'tiny') return line(`M${x - 5} ${y + 2} q 5 4 10 0`, 6);
  return line(`M${x - 12} ${y} q 12 11 24 0`);
}
const blush = ([x, y], k = 1) => `<ellipse cx="${x}" cy="${y}" rx="${24 * k}" ry="${13 * k}" fill="#ff8fab" opacity="0.5"/>`;

// ----------------------------------------------------------------- extras
const EXTRA = {
  hearts: (c) => [[c.top[0] + 150, c.top[1] + 40, 1], [c.top[0] + 190, c.top[1] - 20, 0.7], [c.top[0] - 160, c.top[1] + 10, 0.8]].map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 26 C -52 -6 -24 -46 0 -16 C 24 -46 52 -6 0 26 Z" fill="#ff7a96" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`).join(''),
  sparkles: (c) => [[c.top[0] - 170, c.top[1] + 30, 1], [c.top[0] + 175, c.top[1] + 70, 0.8], [c.top[0] + 120, c.top[1] - 40, 0.6]].map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -30 Q 5 -5 30 0 Q 5 5 0 30 Q -5 5 -30 0 Q -5 -5 0 -30 Z" fill="#ffd84d" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`).join(''),
  zz: (c) => [['Z', 150, 10, 54], ['z', 196, -36, 40], ['z', 230, -70, 30]].map(([t, dx, dy, s]) => `<text x="${c.top[0] + dx}" y="${c.top[1] + dy}" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="${s}" fill="#9db7ff" stroke="${INK}" stroke-width="6" paint-order="stroke">${t}</text>`).join(''),
  bang: (c) => [[-150, -10, -12], [-118, -40, 8]].map(([dx, dy, r]) => `<g transform="translate(${c.top[0] + dx} ${c.top[1] + dy}) rotate(${r})"><rect x="-9" y="-40" width="18" height="46" rx="9" fill="#ff5a5f" stroke="${INK}" stroke-width="6"/><circle cx="0" cy="22" r="10" fill="#ff5a5f" stroke="${INK}" stroke-width="6"/></g>`).join(''),
  sweat: (c) => `<path transform="translate(${c.top[0] + 140} ${c.top[1] + 70})" d="M0 -26 C 14 -6 18 6 0 16 C -18 6 -14 -6 0 -26 Z" fill="#9fdcff" stroke="${INK}" stroke-width="6"/>`,
  gloom: (c) => [-40, 0, 40].map((dx) => `<path d="M${c.top[0] + dx} ${c.top[1] - 20} l 0 -44" stroke="#8a87a8" stroke-width="7" stroke-linecap="round" stroke-dasharray="10 12"/>`).join(''),
  moon: (c) => `<path transform="translate(${c.top[0] - 170} ${c.top[1] + 10})" d="M10 -36 A 36 36 0 1 0 36 10 A 28 28 0 1 1 10 -36 Z" fill="#ffe28a" stroke="${INK}" stroke-width="6"/>`,
  motion: (c, P) => P ? [0, 1, 2].map((i) => `<path d="M${P[0] + 40 + i * 4} ${P[1] - 30 + i * 22} q 14 -6 18 -20" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`).join('') : '',
  ok: (c, P) => P ? `<path transform="translate(${P[0] + 48} ${P[1] - 40}) scale(0.7)" d="M0 -30 Q 5 -5 30 0 Q 5 5 0 30 Q -5 5 -30 0 Q -5 -5 0 -30 Z" fill="#ffd84d" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` : '',
};

// ----------------------------------------------------------------- sticker
/** Paw position for an arm pose, from the socket S on side s (-1 left, +1 right). */
function paw(kind, S, s, c) {
  if (kind === 'wave') return [S[0] + s * 74, S[1] - 108];
  if (kind === 'up') return [S[0] + s * 52, S[1] - 128];
  if (kind === 'ok') return [S[0] - s * 14, S[1] - 54];
  if (kind === 'cross') return [370 + s * 34, S[1] + 58]; // paws together, low on the belly
  if (kind === 'hug') return [c.cheeks[s > 0 ? 1 : 0][0] + s * 6, c.cheeks[0][1] + 6];
  return [S[0] + s * 18, S[1] + 62]; // down
}
const FRONT = new Set(['ok', 'cross', 'hug']);

/**
 * A sticker: character `ch` (see stickers/cast.js) with an expression
 * { caption, eyes, mouth, arms: [l, r], extras: [...], hold }.
 */
function sticker(ch, e, { border = true } = {}) {
  const c = ch.shape();
  const arms = [-1, 1].map((s, i) => { const S = c.sockets[i]; const k = (e.arms || ['down', 'down'])[i]; const P = paw(k, S, s, c); return { s, S, P, k, d: capsule(S, P, ch.armR || 27), p: ellipse(P[0], P[1], (ch.pawR || 31) * 1.05, ch.pawR || 31, Math.atan2(P[1] - S[1], P[0] - S[0])) }; });
  const back = arms.filter((a) => !FRONT.has(a.k));
  const front = arms.filter((a) => FRONT.has(a.k));
  const sil = [...c.parts, ...back.flatMap((a) => [a.d, a.p])].map((d) => `<path d="${d}"/>`).join('');
  const fo = id('o'), ff = id('f'), fw = id('w'), cl = id('c');
  const shadeIn = `<g transform="translate(-16 -14)" fill="${ch.base}">${sil}</g>`;
  const frontArm = (a) => { const r = id('r'), m = id('m'); return `<defs>${ringF(r, INK, 0.1, 0.5, 4)}<radialGradient id="${m}g" gradientUnits="userSpaceOnUse" cx="${f1(a.S[0])}" cy="${f1(a.S[1])}" r="70"><stop offset="0.3" stop-color="#000"/><stop offset="0.8" stop-color="#fff"/></radialGradient><mask id="${m}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#${m}g)"/></mask></defs><g fill="${ch.base}"><path d="${a.d}"/><path d="${a.p}"/></g><g mask="url(#${m})"><g filter="url(#${r})"><path d="${a.d}"/><path d="${a.p}"/></g></g>`; };
  const face = `${(c.cheeks || []).map((p) => blush(p)).join('')}${eyes(e.eyes || 'dot', ...c.eyes)}${mouth(e.mouth || 'smile', c.mouth)}`;
  const extras = (e.extras || []).map((k) => EXTRA[k] ? EXTRA[k](c, (arms.find((a) => a.k === 'wave' || a.k === 'ok') || {}).P) : '').join('');
  const held = e.hold && ch.items && ch.items[e.hold] ? ch.items[e.hold](arms[1].P) : '';
  const capY = e.captionAt === 'bottom' ? 612 : 92;
  const caption = e.caption ? `<g transform="rotate(-4 370 ${capY})"><text x="${e.captionX || 370}" y="${capY}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="${e.caption.length > 12 ? 52 : 62}" fill="${ch.ink || INK}" stroke="#fff" stroke-width="18" paint-order="stroke" stroke-linejoin="round">${e.caption}</text></g>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${goo(fo, INK, 0.2)}${goo(ff, ch.base, 0.5)}${goo(fw, '#ffffff', 0.02, 9)}<clipPath id="${cl}">${sil}</clipPath></defs>
${(c.under || []).map((u) => { const a = id('ua'), b = id('ub'), w2 = id('uw'); const us = u.parts.map((d) => `<path d="${d}"/>`).join(''); return `<defs>${goo(a, INK, 0.2)}${goo(b, u.base, 0.5)}${goo(w2, '#ffffff', 0.02, 9)}</defs>${border ? `<g filter="url(#${w2})">${us}</g>` : ''}<g filter="url(#${a})">${us}</g><g filter="url(#${b})">${us}</g>${u.inside || ''}`; }).join('')}
${border ? `<g filter="url(#${fw})">${sil}</g>` : ''}<g filter="url(#${fo})">${sil}</g><g filter="url(#${ff})">${sil}</g>
<g clip-path="url(#${cl})"><rect width="${W}" height="${H}" fill="${ch.shade}"/>${shadeIn}${c.inside || ''}</g>
${c.over || ''}${face}${held}${front.map(frontArm).join('')}${extras}${caption}</svg>`;
}

module.exports = { sticker, smooth, ellipse, capsule, INK, W, H };
