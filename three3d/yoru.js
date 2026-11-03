'use strict';
// node three3d/yoru.js -> Yoru in 3D: a turned sheet (dome + wall) with a
// 7-lobe wavy hem, and two flaps of the same sheet (left down, right waving).
const { run } = require('./lib');

run('yoru', `
const BASE = '#f4f1ff';
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
// flaps: tapered capsules rooted inside the body
const flap = (side, deg) => {
  const a = deg * Math.PI / 180, dx = Math.cos(a) * side, dy = -Math.sin(a);
  const g = new THREE.CapsuleGeometry(0.3, 0.5, 8, 24);
  add(g, [side * 1.68 + dx * 0.38, 1.62 + dy * 0.38, 0.1], [1, 1, 0.8], { color: BASE, rot: [0, 0, Math.atan2(dy, dx) - Math.PI / 2], outline: 0.08, solid: false });
};
flap(-1, 62); flap(1, -42);
face({ eyes: [[-0.42, 2.25], [0.42, 2.25]], blush: [[-0.78, 1.95], [0.78, 1.95]], mouth: [0, 1.9] });
`, { y: 2.15, dist: 17 });
