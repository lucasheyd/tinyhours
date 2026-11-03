'use strict';
// Gloop at the vending machine, "just looking", slowly melting. Loops.
const { frame, bubble, zz } = require('../frame');
const { who } = require('../../art/cast');

const FPS = 24, SECONDS = 8;
module.exports = {
  id: '04-gloop-just-looking',
  fps: FPS,
  frames: FPS * SECONDS,
  cover: 120,
  post: 'Gloop at 3am: "just looking." 🫠\n#tinyhours #cute #3am',
  draw(f) {
    const boil = Math.floor(f / 2) % 3;
    const k = f / (FPS * SECONDS);
    const melt = k < 0.85 ? 1 - k * 0.32 : 0.73 + ((k - 0.85) / 0.15) * 0.27; // sinks, then pops back up
    const t = who('gloop', { eyes: k > 0.5 && k < 0.85 ? 'sleepy' : 'dizzy', mouth: k > 0.85 ? 'open' : 'cat', pose: { arms: ['down', 'down'], phase: f / 6, breath: (Math.sin(f / 9) + 1) / 2 } });
    const over = [
      f >= 12 && f < 90 ? bubble('JUST LOOKING', 560, 560, 640, 760, (f - 12) / 8) : '',
      k > 0.5 && k < 0.85 ? `<g transform="translate(0 389)">${zz(720, 330, (f % 48) / 48)}</g>` : '',
    ].join('');
    return frame({ sceneId: 'vending', seed: 1, top: '#232a4d', bottom: '#1a1f3a', boil, cast: [{ t, x: 80, y: 30, s: 1.05, squash: melt }], over, cap: 'gloop at 3am: "just looking"' });
  },
};
