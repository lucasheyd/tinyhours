'use strict';
// Hop dashes in through the rain, skids to a stop: "ON TIME!" Loops.
const { frame, bubble, word, armTrack } = require('../frame');
const { who } = require('../../art/cast');
const { INK } = require('../../art/creatures');

const FPS = 24, SECONDS = 7;
const ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : 1 - (1 - k) ** 3);
module.exports = {
  id: '03-hop-on-time',
  fps: FPS,
  frames: FPS * SECONDS,
  cover: 90,
  post: 'Hop has never been late. Almost. ☔️📦\n#tinyhours #cute #delivery',
  draw(f) {
    const boil = Math.floor(f / 2) % 3;
    const run = ease(f / 26); // dash in
    const x = -900 + run * 900;
    const skid = f >= 22 && f < 34;
    const squash = skid ? 0.86 : f >= 34 && f < 40 ? 1.08 : 1;
    const tilt = f < 26 ? -10 : 0;
    const t = who('hop', { eyes: f < 30 ? 'wide' : 'sparkle', mouth: f < 30 ? 'o' : 'grin', pose: { arms: [armTrack(f, [[0, 'out'], [34, 'hip']], 8), armTrack(f, [[0, 'out'], [40, 'wave']], 9)], phase: f < 34 ? f / 1.2 : f / 3.2 } });
    const lines = f < 30 ? [0, 1, 2, 3, 4].map((i) => `<path d="M${x + 150 - i * 30} ${520 + i * 70} h${-160 - i * 40}" stroke="#fffdf7" stroke-width="12" stroke-linecap="round" opacity="0.8"/>`).join('') : '';
    const dust = skid ? [0, 1, 2].map((i) => `<circle cx="${x + 330 + i * 40}" cy="${900 - i * 18}" r="${26 - i * 6}" fill="#c9d6ff" stroke="${INK}" stroke-width="6"/>`).join('') : '';
    const over = [
      f >= 34 && f < 70 ? word('SKRRT!', 300, 760, (f - 34) / 8, '#ff8a3d', -10) : '',
      f >= 60 ? bubble('ON TIME!', 60, 470, 330, 650, (f - 60) / 8) : '',
    ].join('');
    return frame({ sceneId: 'rain', seed: 4, top: '#2d3b63', bottom: '#22304f', boil, back: '', cast: [{ t, x, y: 30, s: 1.05, squash }], front: `<g transform="rotate(${tilt} 500 900)">${lines}</g>${dust}`, over, cap: 'hop is never late. almost.' });
  },
};
