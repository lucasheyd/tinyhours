'use strict';
// Tiny Hours — bodies. Built from what makes plush and chibi bodies read as
// soft and alive (see docs/CORPOS.md):
// - a pear torso, heavier at the bottom, with no neck: the head sinks into it;
// - a lighter belly that follows the torso's curve, and the head's shadow on
//   the chest, which gives depth for free;
// - arms as tapered tubes with a bend (never straight sticks), starting inside
//   the torso so there is no seam, ending in a round mitten paw with a thumb;
// - stubby legs that are only feet: beans tucked under the torso, toes out;
//   sitting shows the soles with toe beans;
// - thick outer line, thinner inner lines, and asymmetry in the pose.
// `pose` (all optional): { arms: [left, right] of 'down'|'hip'|'wave'|'hold'|'up'|'hug',
//   sit, lean (deg), breath (0..1), swing (-1..1) }.

module.exports = function makeBody({ smooth, inked, line, dot, INK }) {
  let uid = 0;
  const id = (p) => `${p}${(uid += 1)}${Math.floor(Math.random() * 1e6)}`;
  const ease = (k) => Math.sin((Math.max(0, Math.min(1, k)) * Math.PI) / 2);

  /** Pear torso outline: narrow shoulders (ws), wide hips (wh), soft flat-ish bottom. */
  function torsoPoints(cx, yT, yB, ws, wh, breath = 0) {
    const pts = [], rb = (yB - yT) * 0.32, n = 9;
    const w = (s) => ws + (wh - ws) * ease(s * 1.15) + breath * 6 * Math.sin(s * Math.PI);
    for (let i = 0; i <= n; i += 1) { const s = i / n; pts.push([cx + w(s), yT + s * (yB - rb - yT)]); } // right side, down
    for (let i = 1; i < 8; i += 1) { const a = (i / 8) * Math.PI; const c = Math.cos(a), sn = Math.sin(a); pts.push([cx + Math.sign(c) * Math.abs(c) ** 0.8 * w(1), yB - rb + sn ** 0.7 * rb]); } // bottom
    for (let i = n; i >= 0; i -= 1) { const s = i / n; pts.push([cx - w(s), yT + s * (yB - rb - yT)]); } // left side, up
    for (let i = 1; i < 6; i += 1) { const a = Math.PI + (i / 6) * Math.PI; pts.push([cx + Math.cos(a) * ws, yT + Math.sin(a) * 40]); } // top (hidden)
    return pts;
  }

  /**
   * An arm: a tube along a bent path from the shoulder S to the paw P, a bit
   * thicker toward the paw, closed by a round mitten. The root is not stroked,
   * so where it sinks into the torso there is no seam.
   */
  function arm(S, P, side, { base, shade, bend = 1, r0 = 30, r1 = 35, paw = 41, palm = false, pad = '#ff9fb0' }) {
    const mx = (S[0] + P[0]) / 2, my = (S[1] + P[1]) / 2;
    const dx = P[0] - S[0], dy = P[1] - S[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len; // normal
    const C = [mx - nx * side * 28 * bend, my - ny * side * 28 * bend]; // elbow bulges outward
    const at = (s) => [(1 - s) ** 2 * S[0] + 2 * (1 - s) * s * C[0] + s * s * P[0], (1 - s) ** 2 * S[1] + 2 * (1 - s) * s * C[1] + s * s * P[1]];
    const L = [], R = [];
    for (let i = 0; i <= 8; i += 1) {
      const s = i / 8 * 0.9; const p = at(s), q = at(Math.min(1, s + 0.02));
      const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1;
      const rr = r0 + (r1 - r0) * s;
      L.push([p[0] - (ty / tl) * rr, p[1] + (tx / tl) * rr]); R.push([p[0] + (ty / tl) * rr, p[1] - (tx / tl) * rr]);
    }
    // mitten: an ellipse around P, slightly longer along the arm
    const ang = Math.atan2(P[1] - C[1], P[0] - C[0]);
    const mit = [];
    for (let i = 0; i <= 10; i += 1) { const a = ang - Math.PI / 2 + (i / 10) * Math.PI; mit.push([P[0] + Math.cos(a) * paw * 1.08, P[1] + Math.sin(a) * paw]); }
    const outline = [...L, ...mit.reverse().slice(0)].length ? [...L, ...mit.slice().reverse(), ...R.slice().reverse()] : [];
    // the open contour (no line across the root)
    const open = smooth([...L.slice(1), ...mit.slice().reverse(), ...R.slice(1).reverse()], false);
    const closed = smooth(outline);
    const cid = id('arm');
    const thumbA = ang + side * -1.1; const th = [P[0] + Math.cos(thumbA) * paw * 0.86, P[1] + Math.sin(thumbA) * paw * 0.86];
    const padSvg = palm ? `<ellipse cx="${P[0].toFixed(1)}" cy="${(P[1] + 4).toFixed(1)}" rx="${(paw * 0.46).toFixed(1)}" ry="${(paw * 0.36).toFixed(1)}" fill="${pad}"/>${[-1, 0, 1].map((k) => dot(P[0] + k * paw * 0.42, P[1] - paw * 0.5, paw * 0.13, pad)).join('')}` : '';
    return `<g><clipPath id="${cid}"><path d="${closed}"/></clipPath><path d="${closed}" fill="${shade}"/><g clip-path="url(#${cid})"><rect width="1000" height="1000" fill="url(#hatch)"/><path d="${closed}" fill="${base}" transform="translate(-9 -9)"/>${padSvg}</g>
<path d="${open}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
${inked(smooth(Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return [th[0] + Math.cos(a) * paw * 0.34, th[1] + Math.sin(a) * paw * 0.3]; })), base, shade, { depth: 4, w: 7, heavy: 2 })}</g>`;
  }

  /** A foot seen from the front: a bean, toes out, with two toe creases. */
  function foot(x, y, side, base, shade, kind) {
    if (kind === 'bird') {
      const toes = [-1, 0, 1].map((k) => `M${x} ${y - 8} l${(k * 30 + side * 8).toFixed(0)} 28`).join(' ');
      return line(toes, 21) + line(toes, 11, '#ffb43d');
    }
    const pts = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; const c = Math.cos(a), s = Math.sin(a); const bx = c * 64 * (1 + 0.12 * c * side), by = s * (s > 0 ? 34 : 40); const rot = side * 0.22; return [x + bx * Math.cos(rot) - by * Math.sin(rot), y + bx * Math.sin(rot) + by * Math.cos(rot)]; });
    const toe = (k) => { const tx = x + side * (30 + k * 16), ty = y + 18 + k * 4 * side * side; return `M${tx.toFixed(1)} ${(ty - 14).toFixed(1)} q ${side * 4} 9 0 16`; };
    return inked(smooth(pts), base, shade, { depth: 10, w: 9, extra: '' }) + line(`${toe(0)} ${toe(1)}`, 5);
  }

  /** A foot seen from below (sitting): the sole faces us, with a pad and three toe beans. */
  function sole(x, y, side, base, shade, pad) {
    const rot = side * 0.32;
    const pts = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; const bx = Math.cos(a) * 50, by = Math.sin(a) * 62 * (Math.sin(a) < 0 ? 1.06 : 1); return [x + bx * Math.cos(rot) - by * Math.sin(rot), y + bx * Math.sin(rot) + by * Math.cos(rot)]; });
    const P = (px, py) => [x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)];
    const main = P(0, 14), toes = [P(-26, -26), P(0, -38), P(26, -26)];
    return inked(smooth(pts), base, shade, { depth: 8, w: 9 })
      + `<ellipse cx="${main[0].toFixed(1)}" cy="${main[1].toFixed(1)}" rx="26" ry="22" fill="${pad}" transform="rotate(${(rot * 57.3).toFixed(1)} ${main[0].toFixed(1)} ${main[1].toFixed(1)})"/>`
      + toes.map(([tx, ty]) => `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="11" fill="${pad}"/>`).join('');
  }

  /** Paw positions for a named arm pose (relative to shoulder S, side -1 left / +1 right). */
  function pawAt(kind, S, side, cx, yB, swing = 0) {
    if (kind === 'wave') return [S[0] + side * 105, S[1] - 85 + swing * 14];
    if (kind === 'up') return [S[0] + side * 50, S[1] - 150];
    if (kind === 'hip') return [S[0] + side * 12, S[1] + 92];
    if (kind === 'hold') return [cx + side * 46, S[1] + 52];
    if (kind === 'hug') return [cx + side * 32, S[1] + 74];
    return [S[0] + side * (40 + swing * 8), S[1] + 112]; // down: short, chubby, resting by the hips
  }

  /**
   * The whole body. Returns { behind, torso, front } SVG strings: behind the
   * torso (standing feet, far parts), the torso (with belly, vest, head
   * shadow), and in front (arms, sitting feet).
   */
  function body(t, { hx, hy, hrx, hry, base, shade, belly, accent }, pose = {}) {
    const kind = t.species === 'bird' ? 'bird' : 'paw';
    const sit = !!pose.sit;
    const yT = hy + hry * 0.55, yB = hy + hry + (sit ? 205 : 235);
    const ws = hrx * 0.5, wh = hrx * (sit ? 0.86 : 0.76);
    const lean = pose.lean || 0;
    const tp = torsoPoints(hx, yT, yB, ws, wh, pose.breath || 0);
    const d = smooth(tp);
    const tid = id('torso');
    const pad = '#ff9fb0';
    const behind = [], front = [];
    // standing feet, tucked under the torso
    if (!sit && t.species !== 'slime') for (const s of [-1, 1]) behind.push(foot(hx + s * wh * 0.5, yB - 2, s, base, shade, kind));
    // torso: shade, hatch, lit base, belly, the head's shadow, clothes
    let inside = `<rect width="1000" height="1000" fill="url(#hatch)"/><path d="${d}" fill="${base}" transform="translate(-22 -20)"/>`;
    inside += `<ellipse cx="${hx + 4}" cy="${yB - (yB - yT) * 0.36}" rx="${wh * 0.6}" ry="${(yB - yT) * 0.34}" fill="${belly}"/>`;
    inside += `<path d="M${hx - wh * 0.42} ${yB - (yB - yT) * 0.62} Q ${hx} ${yB - (yB - yT) * 0.78} ${hx + wh * 0.42} ${yB - (yB - yT) * 0.62}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity="0.55"/>`;
    if (t.wear === 'vest') {
      for (const s of [-1, 1]) inside += `<path d="M${hx + s * 20} ${yT} L${hx + s * 60} ${yB - (yB - yT) * 0.35} Q ${hx + s * 70} ${yB - 30} ${hx + s * 52} ${yB + 20} L${hx + s * 260} ${yB + 20} L${hx + s * 260} ${yT} Z" fill="${accent}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M${hx + s * 70} ${yT + 70} L${hx + s * 250} ${yT + 70}" stroke="#fffdf7" stroke-width="14" opacity="0.85"/>`;
      inside += `<g transform="rotate(-6 ${hx - 100} ${yB - 90})"><rect x="${hx - 143}" y="${yB - 112}" width="86" height="44" rx="8" fill="#fffdf7" stroke="${INK}" stroke-width="6"/><text x="${hx - 100}" y="${yB - 82}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="20" text-anchor="middle" fill="${INK}">HELLO</text></g>`;
    }
    inside += `<ellipse cx="${hx}" cy="${hy + hry * 0.98}" rx="${hrx * 0.86}" ry="${hry * 0.32}" fill="${shade}" opacity="0.75"/>`; // head shadow on the chest
    const torso = `<g transform="rotate(${lean} ${hx} ${yB})"><path d="${d}" fill="${INK}" stroke="${INK}" stroke-width="10" stroke-linejoin="round" transform="translate(4 5)"/><clipPath id="${tid}"><path d="${d}"/></clipPath><path d="${d}" fill="${shade}"/><g clip-path="url(#${tid})">${inside}</g><path d="${d}" fill="none" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/></g>`;
    // sitting feet, soles to us
    if (sit && t.species !== 'slime') for (const s of [-1, 1]) front.push(sole(hx + s * wh * 0.62, yB + 6, s, base, shade, pad));
    // arms
    const holding = t.hold && t.hold !== 'none';
    const arms = pose.arms || ['down', holding ? 'hold' : 'down'];
    const armOut = [];
    for (const [i, s] of [-1, 1].entries()) {
      const S = [hx + s * ws * 1.02, yT + 96]; // at the side of the torso, just under the chin
      const k = arms[i];
      const P = pawAt(k, S, s, hx, yB, pose.swing || 0);
      armOut.push({ s, S, P, k });
    }
    return { behind: behind.join(''), torso, front: front.join(''), arms: armOut, armSvg: (a) => arm(a.S, a.P, a.s, { base, shade, palm: a.k === 'wave' || a.k === 'up', pad, bend: a.k === 'hold' || a.k === 'hug' ? -0.6 : a.k === 'hip' ? 2.4 : 1 }), yT, yB, ws, wh };
  }

  return { body, arm, foot, sole, torsoPoints };
};
