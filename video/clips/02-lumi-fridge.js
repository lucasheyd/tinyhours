'use strict';
// Lumi and the drink fridge: the light flickers on and Lumi is gone. Loops.
const { frame, heart } = require('../frame');
const { who } = require('../../art/cast');

const FPS = 24, SECONDS = 7;
module.exports = {
  id: '02-lumi-fridge',
  fps: FPS,
  frames: FPS * SECONDS,
  cover: 110,
  post: 'Lumi when the drink fridge light turns on. 💡🦋\n#tinyhours #cute #moth',
  draw(f) {
    const boil = Math.floor(f / 2) % 3;
    const on = f >= 52 || (f >= 40 && [41, 42, 45, 48, 49].includes(f));
    const love = f >= 56 && f < 156;
    const bob = Math.sin(f / 6) * 14, flap = (Math.sin(f / 2.2) + 1) / 2;
    const t = who('lumi', { eyes: love ? 'heart' : on ? 'wide' : 'sparkle', mouth: love ? 'open' : 'o', flap: love ? flap : 0.2 });
    const hearts = love ? [0, 1, 2, 3].map((i) => { const p = ((f - 56) / 40 + i / 4) % 1; return heart([150, 290, 720, 860][i] + Math.sin(p * 9 + i) * 30, 1000 - p * 420, 0.9 + i * 0.1, (1 - p).toFixed(2)); }).join('') : '';
    const dark = on ? '' : '<rect x="-40" y="-40" width="1080" height="1080" fill="#0b1622" opacity="0.62"/>';
    return frame({ sceneId: 'fridge', seed: 7, top: '#16324a', bottom: '#0f2233', boil, glow: on ? 0.16 + Math.sin(f / 5) * 0.04 : 0, back: dark, cast: [{ t, y: 30 + (love ? bob - 20 : 0), s: 1.05 }], over: hearts, cap: 'lumi when the drink fridge light turns on' });
  },
};
