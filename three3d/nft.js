'use strict';
// node three3d/nft.js -> NFT prototypes in 3D: Yoru and Drizzle with traits
// (body colour, suit, tie, hat, weather, eyes). Each one renders through lib.js
// (out/3d/nft-<id>-front.png, -34.png, .glb); out/3d/nft/<id>.png is the 1:1
// token image on its background, and out/3d/nft-grid.png shows them all.
// Prototype only: trait list and rarity are not decided.
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const { run } = require('./lib');

// ---------------------------------------------------------------- shared props (page code)
const PROPS = `
const hatAt = (kind, x, y, tilt = 0) => {
  if (kind === 'crown') {
    const g = new THREE.Group(); g.position.set(x, y, 0); g.rotation.z = tilt; char.add(g);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.36, 40, 1, true), toon('#ffcc4d')); band.material.side = THREE.DoubleSide; g.add(band);
    for (let i = 0; i < 5; i += 1) { const a = (i / 5) * Math.PI * 2; const c = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.36, 16), toon('#ffcc4d')); c.position.set(Math.sin(a) * 0.6, 0.34, Math.cos(a) * 0.6); g.add(c);
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), flat(i % 2 ? '#ff7a8a' : '#7ad0ff')); gem.position.set(Math.sin(a) * 0.655, 0, Math.cos(a) * 0.655); g.add(gem); }
    const o = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.7, 0.4, 40, 1, true), ink); g.add(o);
  }
  if (kind === 'party') {
    add(new THREE.ConeGeometry(0.46, 1.05, 32), [x, y + 0.42, 0], [1, 1, 1], { color: '#8fd3ff', rot: [0, 0, tilt], outline: 0.05, solid: false });
    add(new THREE.SphereGeometry(0.15, 16, 12), [x - Math.sin(tilt) * 1.0, y + 0.98, 0], [1, 1, 1], { color: '#ff8fb1', outline: 0.04, solid: false });
  }
  if (kind === 'beanie') {
    add(new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), [x, y - 0.25, 0], [1.3, 0.8, 1.06], { color: '#ff9f6b', outline: 0.04, solid: false });
    add(new THREE.SphereGeometry(0.22, 16, 12), [x, y + 0.62, 0], [1, 1, 1], { color: '#fff4e6', outline: 0.04, solid: false });
  }
};
`;

// ---------------------------------------------------------------- Yoru
const yoru = (t) => `${PROPS}
const BASE = '${t.sheet}';
const prof = [];
for (let i = 0; i <= 12; i += 1) { const a = (i / 12) * Math.PI / 2; prof.push(new THREE.Vector2(Math.max(0.001, 1.82 * Math.sin(a)), 2.48 + 1.78 * Math.cos(a))); }
prof.push(new THREE.Vector2(1.86, 1.6), new THREE.Vector2(1.92, 0.5), new THREE.Vector2(1.92, 0.22), new THREE.Vector2(1.6, 0.04), new THREE.Vector2(0.001, 0.06));
const sheet = new THREE.LatheGeometry(prof.reverse(), 84);
const p = sheet.attributes.position;
for (let i = 0; i < p.count; i += 1) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (y < 0.7) { const a = Math.atan2(z, x); p.setY(i, y - 0.2 * (0.5 + 0.5 * Math.cos(7 * a + Math.PI / 2)) * (1 - y / 0.7)); } }
sheet.computeVertexNormals();
add(sheet, [0, 0.1, 0], [1, 1, 0.8], { color: BASE, outline: 0.04 });
const SUIT = ${t.suit ? `'${t.suit}'` : 'null'};
if (SUIT) {
  add(new THREE.LatheGeometry([[1.84, 0.4], [1.99, 0.5], [2.01, 1.28], [1.86, 1.54]].map(([x, y]) => new THREE.Vector2(x, y)), 84), [0, 0.1, 0], [1, 1, 0.8], { color: SUIT, outline: 0.03 });
  const tri = (pts, color, lift) => stick(new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts.map(([a, b]) => new THREE.Vector2(a, b)))), flat(color)), 0, 1.28, lift);
  tri([[-0.42, 0.36], [0.42, 0.36], [0, -0.42]], '#ffffff', 0.05);
  tri([[-0.42, 0.36], [-0.04, 0.3], [-0.26, 0.08]], '#e8e6f2', 0.06); tri([[0.42, 0.36], [0.04, 0.3], [0.26, 0.08]], '#e8e6f2', 0.06);
  tri([[-0.08, 0.3], [0.08, 0.3], [0.06, 0.18], [-0.06, 0.18]], '${t.tie}', 0.07);
  tri([[-0.06, 0.18], [0.06, 0.18], [0.11, -0.22], [0, -0.34], [-0.11, -0.22]], '${t.tie}', 0.07);
}
const flap = (side, deg) => {
  const a = deg * Math.PI / 180, dx = Math.cos(a) * side, dy = -Math.sin(a);
  add(new THREE.CapsuleGeometry(0.3, 0.5, 8, 24), [side * 1.68 + dx * 0.38, 1.62 + dy * 0.38, 0.1], [1, 1, 0.8], { color: SUIT || BASE, rot: [0, 0, Math.atan2(dy, dx) - Math.PI / 2], outline: 0.08, solid: false });
  if (SUIT) add(new THREE.SphereGeometry(0.26, 24, 16), [side * 1.68 + dx * 0.86, 1.62 + dy * 0.86, 0.1], [1, 1, 0.85], { color: BASE, outline: 0.06, solid: false });
};
flap(-1, 62); flap(1, ${t.flap ?? -42});
${t.hat ? `hatAt('${t.hat}', 0, 4.3, ${t.tilt || 0});` : ''}
face({ eyes: [[-0.42, 2.25], [0.42, 2.25]], blush: [[-0.78, 1.95], [0.78, 1.95]], mouth: [0, 1.9], closed: ${!!t.closed} });
`;

// ---------------------------------------------------------------- Drizzle
const drizzle = (t) => `${PROPS}
const BASE = '${t.body}';
for (const [x, y, r] of [[-1.36, 1.02, 0.9], [-0.46, 1.68, 1.1], [0.66, 1.58, 1.0], [1.38, 0.94, 0.78]]) add(new THREE.SphereGeometry(1, 48, 32), [x, y, 0], [r, r, r * 0.82], { color: BASE });
add(new THREE.CapsuleGeometry(0.64, 2.9, 16, 32).rotateZ(Math.PI / 2), [0, 0.64, 0], [1, 1, 0.9], { color: BASE });
const WX = '${t.weather || ''}';
if (WX === 'sun') {
  const s = add(new THREE.SphereGeometry(0.62, 32, 20), [1.6, 2.5, -1.2], [1, 1, 1], { color: '#ffc94d', outline: 0.05, solid: false });
  for (let i = 0; i < 8; i += 1) { const a = (i / 8) * Math.PI * 2; add(new THREE.ConeGeometry(0.12, 0.34, 12), [1.6 + Math.cos(a) * 0.92, 2.5 + Math.sin(a) * 0.92, -1.2], [1, 1, 1], { color: '#ffc94d', rot: [0, 0, a - Math.PI / 2], outline: 0, solid: false }); }
}
if (WX === 'rain' || WX === 'storm') for (const [x, d] of [[-1.2, 0], [-0.4, 0.35], [0.4, 0.1], [1.2, 0.45]]) add(new THREE.SphereGeometry(0.13, 16, 12), [x, -0.45 - d, 0.2], [1, 1.5, 1], { color: '#8cc8ff', outline: 0.04, solid: false });
if (WX === 'storm') { const sh = new THREE.Shape([[0.1, 0.5], [-0.25, -0.05], [0.0, -0.05], [-0.15, -0.6], [0.3, 0.12], [0.05, 0.12], [0.25, 0.5]].map(([a, b]) => new THREE.Vector2(a, b)));
  add(new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 }), [0.05, -0.45, 0.3], [1.2, 1.2, 1], { color: '#ffd94d', outline: 0.04, solid: false }); }
if (WX === 'rainbow') ['#ff8a8a', '#ffc46b', '#fff27a', '#8fe39a', '#8cc8ff', '#c59cff'].forEach((c, i) => add(new THREE.TorusGeometry(2.6 - i * 0.16, 0.08, 10, 64, Math.PI), [0.4, 0.2, -1.3], [1, 1, 1], { color: c, outline: 0, solid: false }));
if (WX === 'snow') for (const [x, y] of [[-1.5, -0.4], [-0.5, -0.7], [0.6, -0.45], [1.5, -0.75], [0, -0.2]]) add(new THREE.IcosahedronGeometry(0.11, 0), [x, y, 0.2], [1, 1, 1], { color: '#ffffff', outline: 0.04, solid: false });
${t.hat ? `hatAt('${t.hat}', -0.46, 2.66, 0.12);` : ''}
face({ eyes: [[-0.56, 1.1], [0.46, 1.1]], blush: [[-0.86, 0.8], [0.76, 0.8]], mouth: [-0.05, 0.76], closed: ${!!t.closed} });
`;

// ---------------------------------------------------------------- the prototypes
const SET = [
  { id: '01-yoru-office', who: 'yoru', bg: '#cfe6ff', t: { sheet: '#f4f1ff', suit: '#3f4b6e', tie: '#e0525a' } },
  { id: '02-yoru-party', who: 'yoru', bg: '#ffe0ec', t: { sheet: '#e3fff1', suit: '#d9b98c', tie: '#4f8fe0', hat: 'party', tilt: 0.18, closed: true } },
  { id: '03-yoru-gold', who: 'yoru', bg: '#2b2340', t: { sheet: '#ffe28a', suit: '#1f1b24', tie: '#ffcc4d', hat: 'crown' } },
  { id: '04-yoru-beanie', who: 'yoru', bg: '#fff1c9', t: { sheet: '#ffe1ea', hat: 'beanie', flap: -60 } },
  { id: '05-yoru-night', who: 'yoru', bg: '#20304f', t: { sheet: '#d9ccff', suit: '#5a5f6b', tie: '#ffd84d', closed: true } },
  { id: '06-drizzle-sun', who: 'drizzle', bg: '#cfeeff', t: { body: '#f2f6ff', weather: 'sun' } },
  { id: '07-drizzle-storm', who: 'drizzle', bg: '#2f3550', t: { body: '#aeb6cc', weather: 'storm' } },
  { id: '08-drizzle-rainbow', who: 'drizzle', bg: '#fff0f6', t: { body: '#ffd9e6', weather: 'rainbow', closed: true } },
  { id: '09-drizzle-gold', who: 'drizzle', bg: '#2b2340', t: { body: '#ffe28a', hat: 'crown', weather: 'snow' } },
];

(async () => {
  for (const s of SET) {
    const code = s.who === 'yoru' ? yoru(s.t) : drizzle(s.t);
    const cam = s.who === 'yoru' ? { y: 2.5, dist: 19.5 } : { y: 1.2, dist: 16 };
    await run(`nft-${s.id}`, code, cam);
  }
  fs.writeFileSync(path.join(__dirname, '..', 'out', '3d', 'nft-set.json'), JSON.stringify(SET.map(({ id, bg }) => ({ id, bg })), null, 2));
  execFileSync('python3', [path.join(__dirname, 'nft_compose.py')], { stdio: 'inherit' });
})().catch((e) => { console.error(e); process.exit(1); });
