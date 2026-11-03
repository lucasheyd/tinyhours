'use strict';
// node three3d/yoru.js -> Yoru in 3D: a turned sheet (dome + wall) with a
// 7-lobe wavy hem, and two flaps of the same sheet (left down, right waving).
// Office look: navy suit jacket and sleeves, white shirt, red tie (overtime ghost).
const { run } = require('./lib');

run('yoru', `
const BASE = '#f4f1ff', SUIT = '#3f4b6e', TIE = '#e0525a';
const prof = [];
for (let i = 0; i <= 12; i += 1) { const a = (i / 12) * Math.PI / 2; prof.push(new THREE.Vector2(Math.max(0.001, 1.82 * Math.sin(a)), 2.48 + 1.78 * Math.cos(a))); }
prof.push(new THREE.Vector2(1.86, 1.6), new THREE.Vector2(1.92, 0.5), new THREE.Vector2(1.92, 0.22), new THREE.Vector2(1.6, 0.04), new THREE.Vector2(0.001, 0.06));
const sheet = new THREE.LatheGeometry(prof.reverse(), 84);
const p = sheet.attributes.position;
for (let i = 0; i < p.count; i += 1) {
  const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
  if (y < 0.7) { const t = Math.atan2(z, x); p.setY(i, y - 0.2 * (0.5 + 0.5 * Math.cos(7 * t + Math.PI / 2)) * (1 - y / 0.7)); }
}
sheet.computeVertexNormals();
add(sheet, [0, 0.1, 0], [1, 1, 0.8], { color: BASE, outline: 0.04 });
// suit jacket: a turned band over the lower sheet, leaving the wavy hem out
const jacket = new THREE.LatheGeometry([[1.84, 0.4], [1.99, 0.5], [2.01, 1.28], [1.86, 1.54]].map(([x, y]) => new THREE.Vector2(x, y)), 84);
add(jacket, [0, 0.1, 0], [1, 1, 0.8], { color: SUIT, outline: 0.03 });
// shirt V, collar and tie on the front of the jacket
const tri = (pts, color, x, y, lift) => { const sh = new THREE.Shape(pts.map(([a, b]) => new THREE.Vector2(a, b))); return stick(new THREE.Mesh(new THREE.ShapeGeometry(sh), flat(color)), x, y, lift); };
tri([[-0.42, 0.36], [0.42, 0.36], [0, -0.42]], '#ffffff', 0, 1.28, 0.05);
tri([[-0.42, 0.36], [-0.04, 0.3], [-0.26, 0.08]], '#e8e6f2', 0, 1.28, 0.06);
tri([[0.42, 0.36], [0.04, 0.3], [0.26, 0.08]], '#e8e6f2', 0, 1.28, 0.06);
tri([[-0.08, 0.3], [0.08, 0.3], [0.06, 0.18], [-0.06, 0.18]], TIE, 0, 1.28, 0.07);
tri([[-0.06, 0.18], [0.06, 0.18], [0.11, -0.22], [0, -0.34], [-0.11, -0.22]], TIE, 0, 1.28, 0.07);
// flaps: tapered capsules rooted inside the body
const flap = (side, deg) => {
  const a = deg * Math.PI / 180, dx = Math.cos(a) * side, dy = -Math.sin(a);
  const g = new THREE.CapsuleGeometry(0.3, 0.5, 8, 24);
  add(g, [side * 1.68 + dx * 0.38, 1.62 + dy * 0.38, 0.1], [1, 1, 0.8], { color: SUIT, rot: [0, 0, Math.atan2(dy, dx) - Math.PI / 2], outline: 0.08, solid: false });
  add(new THREE.SphereGeometry(0.26, 24, 16), [side * 1.68 + dx * 0.86, 1.62 + dy * 0.86, 0.1], [1, 1, 0.85], { color: BASE, outline: 0.06, solid: false });
};
flap(-1, 62); flap(1, -42);
face({ eyes: [[-0.42, 2.25], [0.42, 2.25]], blush: [[-0.78, 1.95], [0.78, 1.95]], mouth: [0, 1.9] });
`, { y: 2.15, dist: 17 });
