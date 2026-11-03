'use strict';
// Pomu dozes off at the register, the door chimes, Pomu is wide awake:
// "Welcome to Tiny Hours!" ... and slowly dozes off again. Loops.
const { frame, bubble, word, zz } = require('../frame');
const { who } = require('../../art/cast');
const { INK } = require('../../art/creatures');

const FPS = 24, SECONDS = 8;
const ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
const span = (f, a, b) => ease((f - a) / (b - a));

// the counter, in front of Pomu, with a little register
const counter = `<g>
<rect x="-20" y="735" width="1040" height="300" fill="#f2a65a" stroke="${INK}" stroke-width="9"/>
<rect x="-20" y="735" width="1040" height="34" fill="#ffd08f" stroke="${INK}" stroke-width="7"/>
<rect x="640" y="625" width="200" height="112" rx="14" fill="#cfd6e6" stroke="${INK}" stroke-width="8"/>
<rect x="662" y="645" width="110" height="46" rx="6" fill="#9fe3c6" stroke="${INK}" stroke-width="6"/>
<text x="717" y="680" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="30" text-anchor="middle" fill="${INK}">0.00</text>
<rect x="790" y="650" width="30" height="30" rx="6" fill="#ff5a5f" stroke="${INK}" stroke-width="5"/>
<rect x="120" y="680" width="120" height="58" rx="10" fill="#fffdf7" stroke="${INK}" stroke-width="7"/>
<text x="180" y="720" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="26" text-anchor="middle" fill="${INK}">BELL</text>
<rect x="60" y="800" width="380" height="150" rx="16" fill="#ffd08f" stroke="${INK}" stroke-width="7"/>
<text x="250" y="895" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="64" text-anchor="middle" fill="${INK}">24H</text>
</g>`;

module.exports = {
  id: '01-pomu-night-shift',
  fps: FPS,
  frames: FPS * SECONDS,
  post: '3:07 am at Tiny Hours. Pomu is on the night shift. 🌙\n#tinyhours #cute #nightshift',
  draw(f) {
    const boil = Math.floor(f / 2) % 3;
    // beats (frames)
    const doze = span(f, 0, 70), ding = f >= 72 && f < 120 ? (f - 72) / 10 : 0, jump = span(f, 80, 92), settle = span(f, 92, 104), back = span(f, 160, 192);
    let eyes = 'sleepy', mouth = 'cat', dy = 0, squash = 1;
    if (f < 76) { eyes = doze > 0.45 ? 'closed' : 'sleepy'; dy = doze * 34; }
    else if (f < 104) { eyes = 'wide'; mouth = 'o'; dy = 34 - jump * 90 + settle * 56; squash = f < 86 ? 0.9 : f < 96 ? 1.1 : 1; }
    else if (f < 160) { eyes = 'sparkle'; mouth = 'open'; }
    else { eyes = back > 0.6 ? 'closed' : 'sleepy'; dy = back * 20; }
    const t = who('pomu', { eyes, mouth });
    const over = [
      f < 76 && doze > 0.3 ? `<g transform="translate(0 389)">${zz(720, 400, (f % 48) / 48)}</g>` : '',
      ding ? word('DING!', 780, 560, ding) : '',
      f >= 100 && f < 166 ? bubble('WELCOME TO TINY HOURS!', 520, 440, 560, 640, span(f, 100, 108)) : '',
    ].join('');
    return frame({ sceneId: 'shelves', seed: 6, top: '#fff1d6', bottom: '#e9dcc3', boil, cast: [{ t, y: 10, s: 1.12, dy, squash }], front: counter, over, cap: '3:07 am. night shift at tiny hours' });
  },
};
