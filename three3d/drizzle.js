'use strict';
// node three3d/drizzle.js -> Drizzle in 3D (three.js, toon + ink outline):
// out/3d/drizzle-front.png, drizzle-34.png (740x640, transparent) and drizzle.glb.
// Shapes and colours follow docs/APROVADOS.md (2D units / 100, pivot at the bottom).
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out', '3d');
const page = `<!doctype html><body style="margin:0;background:transparent">
<script type="importmap">{"imports":{"three":"http://local/node_modules/three/build/three.module.js","three/addons/":"http://local/node_modules/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
const INK = '#3a2b33', BASE = '#f2f6ff', SHADE = '#c9d5f0';
const grad = new THREE.DataTexture(new Uint8Array([170, 215, 255]), 3, 1, THREE.RedFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const body = new THREE.MeshToonMaterial({ color: BASE, gradientMap: grad });
const ink = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
const drizzle = new THREE.Group(); drizzle.name = 'Drizzle';
const shell = new THREE.Group(); drizzle.add(shell);
const add = (geo, pos, scale, outline = 0.05) => {
  const m = new THREE.Mesh(geo, body); m.position.set(...pos); m.scale.set(...scale); shell.add(m);
  const o = new THREE.Mesh(geo, ink); o.position.copy(m.position); o.scale.set(...scale.map((s) => s + outline)); drizzle.add(o);
  return m;
};
// four puffs and a flat rounded base (same layout as the sticker)
const ball = new THREE.SphereGeometry(1, 48, 32);
for (const [x, y, r] of [[-1.36, 1.02, 0.9], [-0.46, 1.68, 1.1], [0.66, 1.58, 1.0], [1.38, 0.94, 0.78]]) add(ball, [x, y, 0], [r, r, r * 0.82]);
const base = new THREE.CapsuleGeometry(0.64, 2.9, 16, 32); base.rotateZ(Math.PI / 2);
add(base, [0, 0.64, 0], [1, 1, 0.9]);
// soft shade on the underside
const under = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 2.8, 8, 24).rotateZ(Math.PI / 2), new THREE.MeshToonMaterial({ color: SHADE, gradientMap: grad }));
under.position.set(0, 0.6, -0.02); under.scale.set(1, 0.98, 0.86); drizzle.add(under);
// face, placed on the surface by raycasting from the front
const ray = new THREE.Raycaster(); drizzle.updateMatrixWorld(true);
const stick = (obj, x, y, lift = 0.01) => {
  ray.set(new THREE.Vector3(x, y, 5), new THREE.Vector3(0, 0, -1));
  const hit = ray.intersectObjects(shell.children)[0]; const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  obj.position.copy(hit.point).addScaledVector(n, lift); obj.lookAt(obj.position.clone().add(n)); drizzle.add(obj); return obj;
};
const flat = (c) => new THREE.MeshBasicMaterial({ color: c });
for (const x of [-0.56, 0.46]) {
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), flat(INK)); eye.scale.set(1, 1.15, 0.35); stick(eye, x, 1.1);
  const glint = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 8), flat('#ffffff')); glint.position.set(0.03, 0.05, 0.04); eye.add(glint);
}
for (const x of [-0.86, 0.76]) { const b = new THREE.Mesh(new THREE.CircleGeometry(0.15, 32), new THREE.MeshBasicMaterial({ color: '#ffb3c4', transparent: true, opacity: 0.8 })); b.scale.set(1, 0.62, 1); stick(b, x, 0.8, 0.04); }
const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.028, 10, 24, Math.PI), flat(INK)); stick(mouth, -0.05, 0.76); mouth.rotateZ(Math.PI);

const W = 740, H = 640, r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
r.setPixelRatio(2); r.setSize(W, H); r.setClearColor(0, 0); document.body.appendChild(r.domElement);
const scene = new THREE.Scene(); scene.add(drizzle);
scene.add(new THREE.AmbientLight('#ffffff', 0.9)); const sun = new THREE.DirectionalLight('#ffffff', 2.6); sun.position.set(-3, 5, 6); scene.add(sun);
const cam = new THREE.PerspectiveCamera(26, W / H, 0.1, 100); cam.position.set(0, 2.2, 13); cam.lookAt(0, 1.15, 0);
window.shot = (deg) => { drizzle.rotation.y = deg * Math.PI / 180; r.render(scene, cam); return r.domElement.toDataURL('image/png'); };
window.glb = () => new Promise((ok) => { drizzle.rotation.y = 0; new GLTFExporter().parse(drizzle, (b) => { let s = ''; new Uint8Array(b).forEach((c) => { s += String.fromCharCode(c); }); ok(btoa(s)); }, console.error, { binary: true }); });
window.ready = true;
</script>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const tab = await browser.newPage();
  await tab.route('http://local/**', (rt) => {
    const p = new URL(rt.request().url()).pathname;
    if (p === '/') return rt.fulfill({ contentType: 'text/html', body: page });
    return rt.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, p)) });
  });
  await tab.goto('http://local/'); await tab.waitForFunction('window.ready');
  const save = (b64, f) => fs.writeFileSync(path.join(OUT, f), Buffer.from(b64.split(',').pop(), 'base64'));
  save(await tab.evaluate('shot(0)'), 'drizzle-front.png');
  save(await tab.evaluate('shot(-32)'), 'drizzle-34.png');
  save(await tab.evaluate('glb()'), 'drizzle.glb');
  await browser.close(); console.log('drizzle 3d: ok');
})().catch((e) => { console.error(e); process.exit(1); });
