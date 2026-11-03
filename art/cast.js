'use strict';
// Tiny Hours — the regulars. Fixed looks, so every post shows the same faces.
// The store itself is called Tiny Hours: open all night, staffed and visited
// by very small creatures.

const { COATS } = require('./creatures');
const coat = (id) => COATS.find((c) => c[0] === id);

const CAST = {
  pomu: {
    name: 'Pomu', role: 'the night-shift clerk. Always sleepy, always polite. Wakes up for every door chime.',
    seed: 6, species: 'pup', coat: coat('peach'), coat2: coat('cream'), eyes: 'sleepy', mouth: 'cat', wear: 'vest', hold: 'none', marking: 'patch', accent: '#ff5a5f',
  },
  lumi: {
    name: 'Lumi', role: 'a regular who cannot resist the drink fridge light. Or any light, really.',
    seed: 7, species: 'moth', coat: coat('lilac'), coat2: coat('butter'), eyes: 'sparkle', mouth: 'o', wear: 'none', hold: 'none', marking: 'none', accent: '#ffd23f',
  },
  gloop: {
    name: 'Gloop', role: 'comes in at 3am for snacks and stays to read every magazine. Slightly melty.',
    seed: 1, species: 'slime', coat: coat('lime'), coat2: coat('mint'), eyes: 'dizzy', mouth: 'cat', wear: 'glasses', hold: 'none', marking: 'none', accent: '#3ec1ff',
  },
  hop: {
    name: 'Hop', role: 'the delivery rider. Always in a hurry, always on the phone, never late (almost).',
    seed: 4, species: 'bun', coat: coat('sky'), coat2: coat('butter'), eyes: 'sparkle', mouth: 'grin', wear: 'cap', hold: 'phone', marking: 'none', accent: '#ff8a3d',
  },
};

/** A cast member's traits, with any face or pose changes. */
const who = (id, change = {}) => ({ ...CAST[id], ...change });

module.exports = { CAST, who };
