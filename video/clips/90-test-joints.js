'use strict';
// TEST, not a post: Pomu and Hop going through the arm poses with eased
// in-betweens, to judge the joints and the motion up close.
const { frame, armTrack } = require('../frame');
const { who } = require('../../art/cast');

const FPS = 24, SECONDS = 8;
const KEYS = [[0, 'down'], [24, 'wave'], [84, 'up'], [118, 'hug'], [150, 'hip'], [176, 'down']];
module.exports = {
  id: '90-test-joints',
  fps: FPS,
  frames: FPS * SECONDS,
  cover: 60,
  post: 'TESTE de juntas e movimento. Não postar.',
  draw(f) {
    const boil = Math.floor(f / 2) % 3;
    const right = armTrack(f, KEYS, 10), left = armTrack(f, [[0, 'down'], [84, 'up'], [118, 'hug'], [150, 'down']], 10);
    const pose = { arms: [left, right], phase: f / 3.2, breath: (Math.sin(f / 9) + 1) / 2 };
    return frame({ sceneId: 'shelves', seed: 6, top: '#fff1d6', bottom: '#e9dcc3', boil, cast: [{ t: who('pomu', { eyes: 'sparkle', mouth: 'open', pose }), x: -210, y: 60, s: 0.9 }, { t: who('hop', { hold: 'none', pose }), x: 220, y: 60, s: 0.9 }], cap: 'teste: juntas e movimento' });
  },
};
