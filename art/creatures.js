'use strict';
// Tiny Hours — the creatures and their world, drawn as SVG: a hand-inked line
// (heavier on the shadow side, a little wobble), cel shading with hatching, a
// curated palette and a 24h corner store at night.

const W = 1000;
const BODY = require('./body')({ smooth: (...a) => smooth(...a), inked: (...a) => inked(...a), line: (...a) => line(...a), dot: (...a) => dot(...a), INK: '#2b1d3a' });
/** A lighter tint of a colour (for bellies). */
function lighten(hex, k = 0.45) { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * k)); return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`; }

// ----------------------------------------------------------------- random
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (r, list) => list[Math.floor(r() * list.length)];
const between = (r, a, b) => a + (b - a) * r();

// ----------------------------------------------------------------- geometry
/** A closed smooth path through points (Catmull-Rom as cubic Beziers). */
function smooth(p, closed = true) {
  const n = p.length; const at = (i) => p[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < (closed ? n : n - 1); i += 1) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return closed ? `${d} Z` : d;
}
/** A blob: superellipse with a little hand wobble. */
function blob(r, cx, cy, rx, ry, { n = 28, power = 2.3, wobble = 0.018, pear = 0, rot = 0 } = {}) {
  const ph = r() * 6.28, ph2 = r() * 6.28;
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2; const c = Math.cos(t), s = Math.sin(t);
    const k = 1 + Math.sin(t * 3 + ph) * wobble + Math.sin(t * 5 + ph2) * wobble * 0.6;
    let x = Math.sign(c) * Math.abs(c) ** (2 / power) * rx * k, y = Math.sign(s) * Math.abs(s) ** (2 / power) * ry * k;
    x *= 1 + pear * (y / ry); // wider at the bottom when pear > 0
    return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
  });
}
const pts = (list) => list.map(([x, y]) => [x, y]);

// ----------------------------------------------------------------- inking
const INK = '#2b1d3a';
let uid = 0;
/**
 * An inked, cel-shaded shape: a heavier ink edge on the lower right (drawn
 * under the fill, shifted), the fill, a shadow crescent and the outline.
 */
function inked(d, fill, shade, { w = 9, light = [-1, -1], depth = 26, heavy = 4, extra = '' } = {}) {
  const id = `s${uid += 1}`;
  const [lx, ly] = light;
  return `<g>
<path d="${d}" fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" transform="translate(${-lx * heavy} ${-ly * heavy})"/>
<clipPath id="${id}"><path d="${d}"/></clipPath>
<path d="${d}" fill="${shade}"/>
<g clip-path="url(#${id})"><rect x="0" y="0" width="1000" height="1000" fill="url(#hatch)"/><path d="${d}" fill="${fill}" transform="translate(${lx * depth} ${ly * depth})"/>${extra}</g>
<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>
</g>`;
}
const line = (d, w = 8, color = INK) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = (x, y, rr, color = INK) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr}" fill="${color}"/>`;
const ellipse = (x, y, rx, ry, fill, stroke = INK, w = 7) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;

// ----------------------------------------------------------------- palette
const COATS = [
  ['mint', '#9fe3c6', '#5fae95'], ['coral', '#ff9f8c', '#d9675c'], ['lilac', '#cbb8ff', '#937bd9'], ['butter', '#ffe189', '#dcae4b'],
  ['sky', '#a3d5ff', '#5f9fd8'], ['peach', '#ffc8a6', '#e1916c'], ['lime', '#d1f07c', '#93bd43'], ['cream', '#f6ecd8', '#cdbd9c'],
  ['tomato', '#ff6f5e', '#c84437'], ['slate', '#a9b4d6', '#717da3'], ['bubble', '#ffb8dc', '#de7fb2'], ['toast', '#e8b07e', '#b77a4c'],
];
const ACCENT = ['#ff5a5f', '#ffd23f', '#3ec1ff', '#7b5cff', '#2ecc8f', '#ff8a3d'];

// ----------------------------------------------------------------- the creature
const SPECIES = ['pup', 'bun', 'bear', 'imp', 'bird', 'moth', 'slime', 'cat'];
const EYES = ['sparkle', 'sparkle', 'pie', 'sleepy', 'happy', 'star', 'dizzy', 'side'];
const MOUTHS = ['cat', 'open', 'fang', 'o', 'grin', 'smile', 'tongue'];
const WEARS = ['none', 'none', 'vest', 'vest', 'beanie', 'cap', 'scarf', 'bandaid', 'glasses', 'flower'];
const HOLDS = ['none', 'onigiri', 'can', 'phone', 'icecream', 'coffee', 'none'];

function traitsOf(seed) {
  const r = rng(seed * 7919 + 13);
  const coat = pick(r, COATS); let coat2 = pick(r, COATS); if (coat2 === coat) coat2 = COATS[(COATS.indexOf(coat) + 5) % COATS.length];
  return { seed, species: pick(r, SPECIES), coat, coat2, eyes: pick(r, EYES), mouth: pick(r, MOUTHS), wear: pick(r, WEARS), hold: pick(r, HOLDS), marking: pick(r, ['none', 'patch', 'belly', 'stripes', 'freckles', 'none']), accent: pick(r, ACCENT), scene: pick(r, SCENES_IDS), r };
}

function creature(t) {
  const r = rng(t.seed * 31 + 7);
  const [, base, shade] = t.coat; const [, base2, shade2] = t.coat2;
  const hx = 500, hy = 420 + between(r, -10, 10);
  const hrx = between(r, 205, 240), hry = between(r, 175, 205);
  const back = [], front = [], face = [];
  // body, feet, tail (behind the head)
  const by = hy + hry + 95;
  if (t.species !== 'slime') {
    if (t.species === 'pup' || t.species === 'cat' || t.species === 'imp') {
      const tp = []; for (let i = 0; i <= 10; i += 1) { const k = i / 10; tp.push([hx + 120 + k * 150, by + 80 - k * 170 - Math.sin(k * 3) * 40 * (t.species === 'cat' ? 1.6 : 1)]); }
      const wd = (k) => (t.species === 'imp' ? 16 * (1 - k) + 6 : 26 - k * 6);
      back.push(inked(smooth([...tp.map(([x, y], i) => [x - wd(i / 10), y - wd(i / 10) * 0.6]), ...tp.map(([x, y], i) => [x + wd(i / 10), y + wd(i / 10) * 0.6]).reverse()]), base, shade, { depth: 10 }));
      if (t.species === 'imp') back.push(inked(smooth([[tp[10][0] - 26, tp[10][1] + 4], [tp[10][0] + 10, tp[10][1] - 40], [tp[10][0] + 34, tp[10][1] + 6]]), t.accent, '#00000030', { depth: 6, w: 7 }));
    }
    if (t.species === 'bun' || t.species === 'bear') back.push(inked(smooth(blob(r, hx + 140, by + 70, 42, 40, { wobble: 0.08 })), t.species === 'bun' ? '#fffdf7' : base, t.species === 'bun' ? '#ddd3c2' : shade, { depth: 10 }));
  } else {
    back.push(inked(smooth(blob(r, hx, by - 20, 230, 150, { power: 2.4, pear: 0.25, wobble: 0.04 })), base, shade, { depth: 34 }));
  }
  // ears and the like (behind the head)
  const top = hy - hry;
  if (t.species === 'pup' || t.species === 'cat') {
    for (const d of [-1, 1]) {
      const bx = hx + d * hrx * 0.62; const tip = [hx + d * (hrx * (t.species === 'cat' ? 0.85 : 1.05)), top - (t.species === 'cat' ? 95 : 70)];
      const ear = [[bx - d * 70, top + 60], [bx - d * 30, top + 5], tip, [bx + d * 70, top + 70], [bx + d * 20, top + 90]];
      back.push(inked(smooth(ear), base, shade, { depth: 16, extra: `<path d="${smooth([[bx - d * 30, top + 50], [bx - d * 8, top + 20], [tip[0] - d * 18, tip[1] + 38], [bx + d * 38, top + 70]])}" fill="${base2}"/>` }));
    }
  }
  if (t.species === 'bun') for (const d of [-1, 1]) back.push(inked(smooth(blob(r, hx + d * 95, top - 95, 52, 150, { rot: d * 0.22, power: 2 })), base, shade, { depth: 16, extra: `<ellipse cx="${hx + d * 95}" cy="${top - 85}" rx="24" ry="105" transform="rotate(${d * 12.6} ${hx + d * 95} ${top - 85})" fill="${base2}"/>` }));
  if (t.species === 'bear') for (const d of [-1, 1]) back.push(inked(smooth(blob(r, hx + d * hrx * 0.72, top + 30, 72, 68)), base, shade, { depth: 14, extra: `<circle cx="${hx + d * hrx * 0.72}" cy="${top + 34}" r="36" fill="${base2}"/>` }));
  if (t.species === 'imp') for (const d of [-1, 1]) {
    const hp = []; for (let i = 0; i <= 8; i += 1) { const k = i / 8; hp.push([hx + d * (hrx * 0.45 + k * 120 - k * k * 40), top + 40 - k * 170 + k * k * 30]); }
    const left = hp.map(([x, y], i) => [x - d * 34 * (1 - i / 8), y]), right = hp.map(([x, y], i) => [x + d * 10 * (1 - i / 8), y + 30 * (1 - i / 8)]).reverse();
    back.push(inked(smooth([...left, ...right]), '#fff4dc', '#d8c3a0', { depth: 12 }));
  }
  if (t.species === 'bird') for (let i = -1; i <= 1; i += 1) back.push(inked(smooth(blob(r, hx + i * 46, top - 40 - (i === 0 ? 20 : 0), 30, 72, { rot: i * 0.4, power: 1.9 })), t.accent, '#00000033', { depth: 10 }));
  if (t.species === 'moth') for (const d of [-1, 1]) {
    // little wings behind the body; t.flap (0..1) folds them for animation
    const fl = 1 - (t.flap || 0) * 0.45; const wx = hx + d * 210, wy = hy + hry + 60;
    back.push(`<g transform="translate(${wx} ${wy}) scale(${(d * fl).toFixed(3)} 1) translate(${-wx} ${-wy})">${inked(smooth(blob(r, hx + d * 210, hy + hry + 40, 120, 95, { rot: d * -0.5, power: 2 })), base2, shade2, { depth: 14, extra: `<circle cx="${hx + d * 235}" cy="${hy + hry + 30}" r="30" fill="${t.accent}" stroke="${INK}" stroke-width="6"/><circle cx="${hx + d * 180}" cy="${hy + hry + 95}" r="16" fill="#fffdf7"/>` })}</g>`);
  }
  if (t.species === 'moth') for (const d of [-1, 1]) { back.push(line(`M${hx + d * 60} ${top + 30} Q ${hx + d * 110} ${top - 120} ${hx + d * 190} ${top - 110}`, 8)); back.push(inked(smooth(blob(r, hx + d * 200, top - 112, 34, 30)), base2, shade2, { depth: 10 })); }
  // the head
  let headExtra = '';
  if (t.marking === 'patch') headExtra += `<path d="${smooth(blob(r, hx + 95, hy - 10, 115, 105, { wobble: 0.05 }))}" fill="${base2}"/>`;
  if (t.marking === 'stripes') for (let i = -1; i <= 1; i += 1) headExtra += `<path d="M${hx + i * 48 - 14} ${top - 10} L${hx + i * 48 + 14} ${top - 10} L${hx + i * 40} ${top + 70} Z" fill="${shade}"/>`;
  front.push(inked(smooth(blob(r, hx, hy, hrx, hry, { power: t.species === 'slime' ? 2 : 2.25, pear: t.species === 'bird' ? -0.05 : 0.07 })), base, shade, { w: 10, depth: 34, extra: headExtra }));
  if (t.species === 'moth') back.push(inked(smooth(Array.from({ length: 26 }, (_, i) => { const a = (i / 26) * Math.PI * 2; const rr = i % 2 ? 1 : 1.16; return [hx + Math.cos(a) * 175 * rr, hy + hry + 30 + Math.sin(a) * 62 * rr]; })), '#fff4dc', '#d8c3a0', { depth: 10 }));
  if (t.species === 'slime') { front.push(`<path d="${smooth(blob(r, hx - hrx * 0.45, hy - hry * 0.5, 44, 26, { rot: -0.5 }))}" fill="#ffffffcc"/>`); for (const k of [-0.5, 0.15, 0.6]) front.push(inked(smooth(blob(r, hx + k * hrx, hy + hry * 0.92 + 30, 18, 38, { power: 1.8 })), base, shade, { depth: 6, w: 8 })); }

  // face
  const ex = between(r, 72, 92), ey = hy + between(r, -5, 20), erx = between(r, 44, 54), ery = erx * between(r, 1.1, 1.3);
  const gaze = between(r, -8, 8);
  for (const d of [-1, 1]) {
    const x = hx + d * ex;
    if (t.eyes === 'sparkle' || t.eyes === 'star' || t.eyes === 'side') {
      const gx = t.eyes === 'side' ? 14 : gaze;
      face.push(ellipse(x, ey, erx, ery, '#fffdf7', INK, 7));
      face.push(`<ellipse cx="${x + gx}" cy="${ey + 6}" rx="${erx * 0.72}" ry="${ery * 0.76}" fill="${INK}"/>`);
      face.push(`<ellipse cx="${x + gx}" cy="${ey + ery * 0.42}" rx="${erx * 0.5}" ry="${ery * 0.26}" fill="${t.accent}" opacity="0.85"/>`);
      if (t.eyes === 'star') face.push(`<path d="${star(x + gx - 8, ey - 8, 15, 6)}" fill="#fff"/>`);
      else face.push(dot(x + gx - erx * 0.28, ey - ery * 0.3, erx * 0.24, '#fff'));
      face.push(dot(x + gx + erx * 0.25, ey + ery * 0.12, erx * 0.1, '#fff'));
    }
    if (t.eyes === 'pie') { face.push(`<ellipse cx="${x}" cy="${ey}" rx="${erx * 0.62}" ry="${ery * 0.9}" fill="${INK}"/>`); face.push(`<path d="M${x + 6} ${ey - 10} L${x + erx * 0.55} ${ey - ery * 0.7} A ${erx} ${ery} 0 0 1 ${x + erx * 0.62} ${ey - ery * 0.2} Z" fill="#fff"/>`); }
    if (t.eyes === 'sleepy') { face.push(ellipse(x, ey, erx, ery * 0.9, '#fffdf7', INK, 7)); face.push(`<ellipse cx="${x}" cy="${ey + 12}" rx="${erx * 0.66}" ry="${ery * 0.6}" fill="${INK}"/>`); face.push(`<path d="M${x - erx - 6} ${ey + 2} Q ${x} ${ey - ery * 1.3} ${x + erx + 6} ${ey + 2} Z" fill="${base}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`); face.push(dot(x - 12, ey + 14, 7, '#fff')); }
    if (t.eyes === 'closed') face.push(line(`M${x - 36} ${ey + 4} Q ${x} ${ey + 30} ${x + 36} ${ey + 4}`, 10));
    if (t.eyes === 'wide') { face.push(ellipse(x, ey - 4, erx * 1.12, ery * 1.12, '#fffdf7', INK, 7)); face.push(dot(x + gaze * 0.4, ey - 2, erx * 0.3)); face.push(dot(x + gaze * 0.4 - 5, ey - 8, erx * 0.1, '#fff')); }
    if (t.eyes === 'heart') face.push(`<path d="M${x} ${ey + 34} C ${x - 70} ${ey - 10} ${x - 30} ${ey - 60} ${x} ${ey - 22} C ${x + 30} ${ey - 60} ${x + 70} ${ey - 10} ${x} ${ey + 34} Z" fill="#ff5a7a" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` + dot(x - 18, ey - 18, 7, '#fff'));
    if (t.eyes === 'happy') face.push(line(`M${x - 34} ${ey + 10} Q ${x} ${ey - 40} ${x + 34} ${ey + 10}`, 11));
    if (t.eyes === 'dizzy') { let s = ''; for (let i = 0; i <= 40; i += 1) { const a = i * 0.42, rr = 2 + i * 1.05; s += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(ey + Math.sin(a) * rr).toFixed(1)} `; } face.push(ellipse(x, ey, erx, ery, '#fffdf7', INK, 7)); face.push(line(s, 6)); }
    // cheeks
    face.push(`<ellipse cx="${x + d * 38}" cy="${ey + ery + 18}" rx="30" ry="16" fill="#ff6f91" opacity="0.45"/>`);
    face.push(line(`M${x + d * 28} ${ey + ery + 12} l-8 12 M${x + d * 42} ${ey + ery + 12} l-8 12`, 4, '#c8406a'));
  }
  // mouth
  const my = ey + ery + 40, mx = hx + gaze * 0.5;
  if (t.species === 'bird') face.push(inked(smooth([[mx - 34, my - 22], [mx + 34, my - 22], [mx + 6, my + 26], [mx - 6, my + 26]]), '#ffb43d', '#e07e1f', { depth: 8, w: 8 }));
  else {
    if (['pup', 'bear', 'cat'].includes(t.species)) face.push(`<path d="M${mx - 16} ${my - 28} Q ${mx} ${my - 34} ${mx + 16} ${my - 28} Q ${mx} ${my - 8} ${mx - 16} ${my - 28} Z" fill="${INK}"/>`);
    if (t.mouth === 'cat') face.push(line(`M${mx - 34} ${my} Q ${mx - 17} ${my + 22} ${mx} ${my} Q ${mx + 17} ${my + 22} ${mx + 34} ${my}`, 8));
    if (t.mouth === 'smile') face.push(line(`M${mx - 36} ${my} Q ${mx} ${my + 34} ${mx + 36} ${my}`, 8));
    if (t.mouth === 'o') face.push(ellipse(mx, my + 10, 16, 20, '#7a2840', INK, 7));
    if (t.mouth === 'fang') { face.push(line(`M${mx - 34} ${my} Q ${mx} ${my + 26} ${mx + 34} ${my}`, 8)); face.push(`<path d="M${mx + 8} ${my + 10} L${mx + 22} ${my + 8} L${mx + 16} ${my + 26} Z" fill="#fff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`); }
    if (t.mouth === 'open' || t.mouth === 'tongue' || t.mouth === 'grin') {
      const md = t.mouth === 'grin' ? `M${mx - 52} ${my - 4} Q ${mx} ${my + 4} ${mx + 52} ${my - 4} Q ${mx + 40} ${my + 54} ${mx} ${my + 56} Q ${mx - 40} ${my + 54} ${mx - 52} ${my - 4} Z` : `M${mx - 38} ${my - 2} Q ${mx} ${my + 6} ${mx + 38} ${my - 2} Q ${mx + 30} ${my + 52} ${mx} ${my + 54} Q ${mx - 30} ${my + 52} ${mx - 38} ${my - 2} Z`;
      const id = `m${uid += 1}`;
      face.push(`<clipPath id="${id}"><path d="${md}"/></clipPath><path d="${md}" fill="#7a2840"/><g clip-path="url(#${id})"><ellipse cx="${mx + 6}" cy="${my + 52}" rx="30" ry="22" fill="#ff7a8a"/>${t.mouth === 'grin' ? `<rect x="${mx - 60}" y="${my - 10}" width="120" height="18" fill="#fff"/>` : ''}</g><path d="${md}" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`);
      if (t.mouth === 'tongue') face.push(inked(smooth(blob(r, mx + 4, my + 52, 20, 24, { power: 2 })), '#ff7a8a', '#e0566a', { depth: 6, w: 6 }));
    }
  }
  if (t.marking === 'freckles') for (const d of [-1, 1]) for (const [fx, fy] of [[0, 0], [16, 8], [-12, 12]]) face.push(dot(hx + d * (ex + 30) + fx, ey + ery + 40 + fy, 4, shade));

  // what it wears
  const wear = [];
  if (t.wear === 'scarf') { wear.push(inked(smooth(blob(r, hx, by - 82, 170, 34, { power: 2.2 })), t.accent, '#00000030', { depth: 10, w: 8, extra: Array.from({ length: 8 }, (_, i) => `<rect x="${hx - 180 + i * 50}" y="${by - 130}" width="20" height="100" fill="#fffdf7" opacity="0.7" transform="skewX(-20)"/>`).join('') })); wear.push(inked(smooth([[hx + 70, by - 70], [hx + 120, by - 60], [hx + 130, by + 40], [hx + 90, by + 36]]), t.accent, '#00000030', { depth: 8, w: 8 })); }
  if (t.wear === 'beanie') wear.push(inked(smooth([...blob(r, hx, top + 40, hrx * 0.86, 110, { power: 2.2 }).filter(([, y]) => y < top + 50), [hx + hrx * 0.86, top + 70], [hx - hrx * 0.86, top + 70]]), t.accent, '#00000030', { depth: 14, w: 9, extra: Array.from({ length: 9 }, (_, i) => `<rect x="${hx - hrx + i * 50}" y="${top + 30}" width="10" height="60" fill="#00000022"/>`).join('') }) + inked(smooth(blob(r, hx, top - 72, 34, 30, { wobble: 0.08 })), '#fffdf7', '#ddd3c2', { depth: 8, w: 8 }));
  if (t.wear === 'cap') wear.push(inked(smooth([...blob(r, hx - 10, top + 50, hrx * 0.82, 100, { power: 2.4 }).filter(([, y]) => y < top + 55), [hx + hrx * 0.7, top + 64], [hx + hrx * 1.25, top + 72], [hx + hrx * 1.2, top + 92], [hx - hrx * 0.8, top + 70]]), t.accent, '#00000030', { depth: 14, w: 9, extra: `<circle cx="${hx - 10}" cy="${top - 40}" r="10" fill="#00000030"/>` }));
  if (t.wear === 'bandaid') wear.push(`<g transform="rotate(-25 ${hx - ex - 20} ${ey + ery + 30})"><rect x="${hx - ex - 70}" y="${ey + ery + 16}" width="100" height="30" rx="14" fill="#ffd9b0" stroke="${INK}" stroke-width="6"/><rect x="${hx - ex - 38}" y="${ey + ery + 16}" width="36" height="30" fill="#f0bb8a"/></g>`);
  if (t.wear === 'glasses') { for (const d of [-1, 1]) wear.push(`<circle cx="${hx + d * ex}" cy="${ey}" r="${erx + 14}" fill="#bfe8ff33" stroke="${INK}" stroke-width="8"/>`); wear.push(line(`M${hx - ex + erx + 14} ${ey - 6} Q ${hx} ${ey - 26} ${hx + ex - erx - 14} ${ey - 6}`, 8)); }
  if (t.wear === 'flower') { const fx = hx - hrx * 0.6, fy = top + 40; for (let i = 0; i < 5; i += 1) { const a = (i / 5) * Math.PI * 2; wear.push(inked(smooth(blob(r, fx + Math.cos(a) * 26, fy + Math.sin(a) * 26, 22, 22)), '#fffdf7', '#e8dccc', { depth: 6, w: 6 })); } wear.push(dot(fx, fy, 16, '#ffd23f') + `<circle cx="${fx}" cy="${fy}" r="16" fill="none" stroke="${INK}" stroke-width="6"/>`); }

  // the body (art/body.js): torso, feet, arms; held things sit under the paw
  const B = BODY.body(t, { hx, hy, hrx, hry, base, shade, belly: t.marking === 'belly' ? base2 : lighten(base), accent: t.accent }, t.pose || {});
  const hold = t.species === 'slime' ? 'none' : t.hold;
  const things = [];
  const hand = B.arms[1];
  if (hold !== 'none') {
    const [px, py] = hand.P; const x = px + 6, y = py + 14;
    if (hold === 'onigiri') things.push(inked(smooth([[x, y - 110], [x + 66, y + 10], [x - 66, y + 10]]), '#fffdf7', '#ddd3c2', { depth: 10, extra: `<rect x="${x - 34}" y="${y - 40}" width="68" height="50" fill="#2b3a2e"/>` }));
    if (hold === 'can') things.push(inked(`M${x - 34} ${y - 120} h68 v124 h-68 Z`, t.accent, '#00000030', { depth: 10, extra: `<rect x="${x - 34}" y="${y - 84}" width="68" height="30" fill="#fffdf7"/>` }));
    if (hold === 'phone') things.push(inked(`M${x - 30} ${y - 140} h60 v140 h-60 Z`, '#cfd6e6', '#98a2bd', { depth: 10, extra: `<rect x="${x - 20}" y="${y - 128}" width="40" height="44" fill="#9fe3c6"/><rect x="${x - 22}" y="${y - 70}" width="44" height="6" fill="${INK}"/>` }));
    if (hold === 'icecream') things.push(inked(smooth([[x - 38, y - 70], [x + 38, y - 70], [x, y + 20]]), '#e8b07e', '#b77a4c', { depth: 8 }) + inked(smooth(blob(r, x, y - 92, 44, 38, { wobble: 0.06 })), '#ffb8dc', '#de7fb2', { depth: 12 }));
    if (hold === 'coffee') things.push(inked(`M${x - 38} ${y - 110} h76 l-8 110 h-60 Z`, '#fffdf7', '#ddd3c2', { depth: 10, extra: `<rect x="${x - 38}" y="${y - 75}" width="80" height="32" fill="#b77a4c"/>` }) + line(`M${x - 18} ${y - 130} q 10 -16 0 -30 M${x + 12} ${y - 130} q 10 -16 0 -30`, 6, '#fffdf7'));
  }
  const arms = B.arms.map((a) => B.armSvg(a));
  const torso = t.species === 'slime' ? '' : B.behind + B.torso;
  return [...back, torso, ...front, ...face, ...wear, B.front, ...things, ...arms].join('\n');
}

function star(cx, cy, R, rr, n = 4) {
  const p = []; for (let i = 0; i < n * 2; i += 1) { const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2; const k = i % 2 ? rr : R; p.push(`${(cx + Math.cos(a) * k).toFixed(1)},${(cy + Math.sin(a) * k).toFixed(1)}`); }
  return `M${p.join(' L')} Z`;
}

// ----------------------------------------------------------------- scenes (the 24h corner store)
const SCENES_IDS = ['vending', 'shelves', 'crosswalk', 'fridge', 'rain'];
function scene(id, t) {
  const r = rng(t.seed * 101 + 3);
  const thin = (d, w = 5, c = INK) => line(d, w, c);
  if (id === 'vending') {
    let s = `<rect width="${W}" height="${W}" fill="#232a4d"/><rect y="760" width="${W}" height="240" fill="#1a1f3a"/>`;
    for (let i = 0; i < 40; i += 1) s += dot(r() * W, r() * 600, r() * 3 + 1, '#ffffff99');
    s += `<circle cx="820" cy="150" r="60" fill="#fff4c9"/><circle cx="845" cy="135" r="55" fill="#232a4d"/>`;
    s += `<rect x="40" y="170" width="250" height="620" rx="16" fill="#e94f5b" stroke="${INK}" stroke-width="7"/><rect x="66" y="200" width="198" height="330" fill="#bfefff" stroke="${INK}" stroke-width="6"/>`;
    for (let row = 0; row < 4; row += 1) for (let c = 0; c < 4; c += 1) s += `<rect x="${78 + c * 47}" y="${215 + row * 80}" width="32" height="56" rx="6" fill="${pick(r, ACCENT)}" stroke="${INK}" stroke-width="4"/>`;
    s += `<rect x="66" y="560" width="198" height="60" fill="${INK}"/><rect x="100" y="680" width="130" height="50" rx="8" fill="${INK}"/>`;
    s += `<ellipse cx="170" cy="790" rx="220" ry="40" fill="#bfefff22"/>`;
    return s;
  }
  if (id === 'shelves') {
    let s = `<rect width="${W}" height="${W}" fill="#fff1d6"/>`;
    for (let row = 0; row < 3; row += 1) {
      const y = 120 + row * 230; s += `<rect x="0" y="${y + 150}" width="${W}" height="22" fill="#c9b08a" stroke="${INK}" stroke-width="5"/>`;
      let x = 10; while (x < W) { const w = between(r, 50, 100), h = between(r, 70, 140); s += `<rect x="${x}" y="${y + 150 - h}" width="${w}" height="${h}" rx="6" fill="${pick(r, ['#ffcf6b', '#9fd8ff', '#ff9f8c', '#b7e48f', '#d9c7ff', '#fffdf7'])}" stroke="${INK}" stroke-width="4"/><rect x="${x + 8}" y="${y + 150 - h * 0.6}" width="${w - 16}" height="${h * 0.22}" fill="#ffffff99"/>`; x += w + 8; }
    }
    s += `<rect y="820" width="${W}" height="180" fill="#e9dcc3"/>`;
    for (let i = 0; i < 12; i += 1) s += `<rect x="${i * 90}" y="820" width="45" height="180" fill="#ddcca9"/>`;
    return `${s}<rect width="${W}" height="${W}" fill="#fff1d6" opacity="0.35"/>`;
  }
  if (id === 'crosswalk') {
    let s = `<defs><linearGradient id="dusk${t.seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb07a"/><stop offset="0.6" stop-color="#ff7aa2"/><stop offset="1" stop-color="#7a5cc9"/></linearGradient></defs><rect width="${W}" height="${W}" fill="url(#dusk${t.seed})"/>`;
    let x = 0; while (x < W) { const w = between(r, 90, 170), h = between(r, 180, 460); s += `<rect x="${x}" y="${760 - h}" width="${w}" height="${h}" fill="#4a3a7a"/>`; for (let wy = 760 - h + 20; wy < 740; wy += 40) for (let wx = x + 14; wx < x + w - 20; wx += 32) if (r() < 0.45) s += `<rect x="${wx}" y="${wy}" width="16" height="20" fill="#ffd77a"/>`; x += w + 6; }
    s += `<rect y="760" width="${W}" height="240" fill="#3b3550"/>`;
    for (let i = 0; i < 9; i += 1) s += `<path d="M${i * 120 - 20} 1000 L${i * 120 + 50} 800 L${i * 120 + 100} 800 L${i * 120 + 50} 1000 Z" fill="#fffdf7" opacity="0.85"/>`;
    return s;
  }
  if (id === 'fridge') {
    let s = `<rect width="${W}" height="${W}" fill="#16324a"/>`;
    for (let c = 0; c < 4; c += 1) {
      const x = 20 + c * 245; s += `<rect x="${x}" y="40" width="225" height="760" rx="8" fill="#bff3ff" stroke="${INK}" stroke-width="7"/>`;
      for (let row = 0; row < 5; row += 1) { s += thin(`M${x} ${180 + row * 140} h225`, 5); for (let k = 0; k < 5; k += 1) s += `<rect x="${x + 12 + k * 42}" y="${100 + row * 140}" width="30" height="74" rx="8" fill="${pick(r, ['#ff9f8c', '#ffe189', '#9fe3c6', '#cbb8ff', '#ffffff'])}" stroke="${INK}" stroke-width="3"/>`; }
      s += `<rect x="${x + 180}" y="360" width="14" height="100" rx="6" fill="#fffdf7" stroke="${INK}" stroke-width="4"/>`;
    }
    s += `<rect width="${W}" height="${W}" fill="#16324a" opacity="0.28"/><rect y="800" width="${W}" height="200" fill="#0f2233"/>`;
    return s;
  }
  // rain
  let s = `<rect width="${W}" height="${W}" fill="#2d3b63"/><rect y="760" width="${W}" height="240" fill="#22304f"/>`;
  for (let i = 0; i < 120; i += 1) { const x = r() * W, y = r() * 760; s += thin(`M${x} ${y} l-10 34`, 4, '#a9c4ff88'); }
  for (let i = 0; i < 8; i += 1) s += `<ellipse cx="${r() * W}" cy="${800 + r() * 180}" rx="${between(r, 40, 110)}" ry="10" fill="#a9c4ff44"/>`;
  s += `<rect x="760" y="120" width="180" height="70" rx="10" fill="#ff5a5f" stroke="${INK}" stroke-width="6"/><text x="850" y="168" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" text-anchor="middle" fill="#fffdf7">24H</text>`;
  return s;
}

/** The whole picture. `finish` 'color' (default) or 'duo' (two-ink print). */
function draw(seed, { finish = 'color', scene: forceScene } = {}) {
  uid = seed * 1000;
  const t = traitsOf(seed);
  const sc = forceScene || t.scene;
  const shadow = `<ellipse cx="500" cy="${900}" rx="230" ry="34" fill="#00000040"/>`;
  const grain = `<filter id="grain${seed}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}"/><feColorMatrix values="0 0 0 0 0.17  0 0 0 0 0.11  0 0 0 0 0.23  0 0 0 0.09 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
  const duo = `<filter id="duo${seed}"><feColorMatrix type="matrix" values="0.33 0.5 0.17 0 0  0.33 0.5 0.17 0 0  0.33 0.5 0.17 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="discrete" tableValues="0.17 0.17 0.95 0.99 1"/><feFuncG type="discrete" tableValues="0.11 0.11 0.42 0.94 0.99"/><feFuncB type="discrete" tableValues="0.23 0.23 0.37 0.86 0.97"/></feComponentTransfer></filter>`;
  const boil = (id, f, k) => `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="${f}" numOctaves="2" seed="${seed + k}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${k ? 6 : 8}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  const defs = `${boil(`b${seed}`, 0.03, 0)}${boil(`bs${seed}`, 0.02, 1)}<pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="14" height="14" fill="none"/><line x1="0" y1="0" x2="0" y2="14" stroke="${INK}" stroke-width="3" opacity="0.28"/></pattern>`;
  const body = `<defs>${defs}</defs><g filter="url(#bs${seed})"><g transform="translate(500 500) scale(1.025) translate(-500 -500)">${scene(sc, t)}</g></g>${shadow}<g filter="url(#b${seed})">${creature(t)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}"><defs>${grain}${duo}</defs><g ${finish === 'duo' ? `filter="url(#duo${seed})"` : ''}>${body}</g><rect width="${W}" height="${W}" filter="url(#grain${seed})" fill="#fff"/></svg>`;
}

module.exports = { draw, traitsOf, creature, scene, star, smooth, blob, inked, line, dot, rng, INK, W, COATS, ACCENT, SPECIES, SCENES_IDS };
