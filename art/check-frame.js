'use strict';
// node art/check-frame.js -> fails if any creature, in any pose, touches the edge of its 1000x1000 box.
// Rule: no body part may leave the frame (ears, antennae, tails, wings, held things).
const path = require('path'), fs = require('fs'), os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { creature, traitsOf, INK } = require('./creatures');
const { CAST, who } = require('./cast');

const POSES = [{}, { arms: ['down', 'wave'] }, { arms: ['up', 'up'] }, { arms: ['hip', 'hold'] }, { sit: true, arms: ['hug', 'hug'] }];
const defs = `<defs><filter id="bc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter><pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="14" stroke="${INK}" stroke-width="3" opacity="0.28"/></pattern></defs>`;
const list = [];
for (const id of Object.keys(CAST)) for (const p of POSES) list.push([`${id}`, who(id, { pose: p })]);
for (let s = 1; s <= 60; s += 1) for (const p of POSES) list.push([`seed ${s}`, { ...traitsOf(s), pose: p }]);
const MARGIN = 12; // px of empty space required at every edge (in the 1000 box)
(async () => {
  const browser = await chromium.launch();
  const tab = await browser.newPage({ viewport: { width: 500, height: 500 } });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'frame-'));
  const bad = [];
  for (const [i, [name, t]] of list.entries()) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="500" height="500">${defs}<g filter="url(#bc)">${creature(t)}</g></svg>`;
    await tab.setContent(`<body style="margin:0;background:transparent">${svg}</body>`);
    const f = path.join(dir, `${i}.png`);
    await tab.screenshot({ path: f, omitBackground: true });
    const out = execFileSync('python3', ['-c', `
import sys
from PIL import Image
a=Image.open(sys.argv[1]).getchannel('A'); w,h=a.size; m=int(${MARGIN}*w/1000)
px=a.load()
hit=[n for n,(x0,y0,x1,y1) in {'top':(0,0,w,m),'bottom':(0,h-m,w,h),'left':(0,0,m,h),'right':(w-m,0,w,h)}.items() if any(px[x,y]>8 for y in range(y0,y1) for x in range(x0,x1,2))]
print(','.join(hit))`, f]).toString().trim();
    if (out) bad.push(`${name} ${JSON.stringify(t.pose)}: ${out}`);
  }
  await browser.close();
  fs.rmSync(dir, { recursive: true, force: true });
  if (bad.length) { console.log(`FAIL: ${bad.length} of ${list.length} touch the frame\n${bad.join('\n')}`); process.exit(1); }
  console.log(`ok: ${list.length} creature/pose combinations stay inside the frame`);
})().catch((e) => { console.error(e); process.exit(1); });
