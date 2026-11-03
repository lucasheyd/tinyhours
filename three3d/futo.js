'use strict';
// node three3d/futo.js -> Futo in 3D: a rounded blanket roll with polka dots,
// the face peeking out of the hood and the blanket's fold across the front.
const { run } = require('./lib');

run('futo', `
const BASE = '#ffbfcc';
add(new THREE.SphereGeometry(1, 64, 40), [0, 1.84, 0], [1.6, 1.84, 1.25], { color: BASE });
// the face sits in the hood opening
const rim = add(new THREE.SphereGeometry(1, 40, 24), [0, 2.4, 0.95], [1.1, 0.98, 0.36], { color: '#ff9fb4', outline: 0.04 });
add(new THREE.SphereGeometry(1, 40, 24), [0, 2.38, 1.08], [0.96, 0.84, 0.34], { color: '#ffe6d6', outline: 0 });
// blanket fold: a soft diagonal roll across the lower front
add(new THREE.CapsuleGeometry(0.32, 1.8, 10, 24), [0.05, 1.0, 1.05], [1, 1, 0.55], { color: BASE, rot: [0, 0, Math.PI / 2 - 0.42], outline: 0.06, solid: false });
// polka dots on the front, away from the face and the fold
for (let i = 0; i < 16; i += 1) {
  const x = -1.1 + (i % 4) * 0.72 + ((i >> 2) % 2) * 0.3, y = 0.55 + (i >> 2) * 0.9;
  if (Math.hypot((x) / 1.15, (y - 2.4) / 1.1) < 1 || Math.abs(y - (1.05 + (x - 0.15) * Math.tan(0.42))) < 0.42 || x > 1.25) continue;
  const d = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), flat('#fff4f6')); stick(d, x, y, 0.012);
}
face({ eyes: [[-0.36, 2.44], [0.36, 2.44]], blush: [[-0.5, 2.24], [0.5, 2.24]], mouth: [0, 2.14], size: 1.25 });
`, { y: 1.85, dist: 16 });
