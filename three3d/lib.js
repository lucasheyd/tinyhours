'use strict';
// Shared harness for the 3D mascots: three.js in Playwright's Chromium, toon
// shading, ink outline by inverted hull, face stuck to the surface by raycast.
// run(name, buildCode, cam) writes out/3d/<name>-front.png, <name>-34.png, <name>.glb.
// buildCode is page JS that fills the group `char` with the helpers below.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out', '3d');

const page = (build, cam) => `<!doctype html><body style="margin:0;background:transparent">
<script type="importmap">{"imports":{"three":"http://local/node_modules/three/build/three.module.js","three/addons/":"http://local/node_modules/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const INK = '#3a2b33';
const grad = new THREE.DataTexture(new Uint8Array([170, 215, 255]), 3, 1, THREE.RedFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const toon = (c) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad });
const flat = (c) => new THREE.MeshBasicMaterial({ color: c });
const ink = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
const char = new THREE.Group(), shell = new THREE.Group(); char.add(shell);
/** A body part with its ink hull. o: { color, outline, rot: [x,y,z], solid: true = raycast target } */
const add = (geo, pos, scale, o = {}) => {
  const m = new THREE.Mesh(geo, toon(o.color)); m.position.set(...pos); m.scale.set(...scale);
  if (o.rot) m.rotation.set(...o.rot);
  (o.solid === false ? char : shell).add(m);
  if (o.outline !== 0) { const h = new THREE.Mesh(geo, ink); h.position.copy(m.position); h.rotation.copy(m.rotation); const k = o.outline || 0.05; h.scale.set(...scale.map((s) => s + k)); char.add(h); }
  return m;
};
const ray = new THREE.Raycaster();
/** Sticks obj onto the front surface at (x, y), facing out along the normal. */
const stick = (obj, x, y, lift = 0.01) => {
  char.updateMatrixWorld(true);
  ray.set(new THREE.Vector3(x, y, 9), new THREE.Vector3(0, 0, -1));
  const hit = ray.intersectObjects(shell.children, true)[0]; const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  obj.position.copy(hit.point).addScaledVector(n, lift); obj.lookAt(obj.position.clone().add(n)); char.add(obj); return obj;
};
/** Dot eyes with a glint, pink blush and a small smile. */
const face = ({ eyes, blush, mouth, size = 1 }) => {
  for (const [x, y] of eyes) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.1 * size, 24, 16), flat(INK)); e.scale.set(1, 1.15, 0.35); stick(e, x, y);
    const g = new THREE.Mesh(new THREE.SphereGeometry(0.032 * size, 12, 8), flat('#ffffff')); g.position.set(0.03 * size, 0.05 * size, 0.04); e.add(g);
  }
  for (const [x, y] of blush) { const b = new THREE.Mesh(new THREE.CircleGeometry(0.15 * size, 32), new THREE.MeshBasicMaterial({ color: '#ffb3c4', transparent: true, opacity: 0.8 })); b.scale.set(1, 0.62, 1); stick(b, x, y, 0.06); }
  const m = new THREE.Mesh(new THREE.TorusGeometry(0.1 * size, 0.028 * size, 10, 24, Math.PI), flat(INK)); stick(m, mouth[0], mouth[1], 0.04); m.rotateZ(Math.PI);
};
${build}
const W = 740, H = 640, r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
r.setPixelRatio(2); r.setSize(W, H); r.setClearColor(0, 0); document.body.appendChild(r.domElement);
const scene = new THREE.Scene(); scene.add(char);
scene.add(new THREE.AmbientLight('#ffffff', 0.9)); const sun = new THREE.DirectionalLight('#ffffff', 2.6); sun.position.set(-3, 5, 6); scene.add(sun);
const cam = new THREE.PerspectiveCamera(26, W / H, 0.1, 100); cam.position.set(0, ${cam.y + 1}, ${cam.dist}); cam.lookAt(0, ${cam.y}, 0);
window.shot = (deg) => { char.rotation.y = deg * Math.PI / 180; r.render(scene, cam); return r.domElement.toDataURL('image/png'); };
window.glb = () => new Promise((ok) => { char.rotation.y = 0; new GLTFExporter().parse(char, (b) => { let s = ''; new Uint8Array(b).forEach((c) => { s += String.fromCharCode(c); }); ok(btoa(s)); }, console.error, { binary: true }); });
window.ready = true;
</script>`;

async function run(name, build, cam) {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const tab = await browser.newPage(); tab.on('pageerror', (e) => console.error(e));
  await tab.route('http://local/**', (rt) => {
    const p = new URL(rt.request().url()).pathname;
    if (p === '/') return rt.fulfill({ contentType: 'text/html', body: page(build, cam) });
    return rt.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, p)) });
  });
  await tab.goto('http://local/'); await tab.waitForFunction('window.ready', null, { timeout: 20000 });
  const save = (b64, f) => fs.writeFileSync(path.join(OUT, f), Buffer.from(b64.split(',').pop(), 'base64'));
  save(await tab.evaluate('shot(0)'), `${name}-front.png`);
  save(await tab.evaluate('shot(-32)'), `${name}-34.png`);
  save(await tab.evaluate('glb()'), `${name}.glb`);
  await browser.close(); console.log(`${name} 3d: ok`);
}

module.exports = { run };
