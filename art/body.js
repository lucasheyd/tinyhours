'use strict';
// Tiny Hours — bodies. Built from what makes plush, chibi and rubber-hose
// bodies read as soft and alive (see docs/CORPOS.md):
// - a pear torso, heavier at the bottom, no neck: the head sinks into it;
// - a lighter belly that follows the torso, and the head's shadow on the chest;
// - ONE silhouette for torso and arms: they are merged with a soft fillet in
//   the armpit (blur + threshold, the "gooey" trick), and the outer line runs
//   around the merged shape, a little heavier where forms meet;
// - where an arm lies over the body, its edge is drawn as an inner line that
//   fades out toward the shoulder ("lost and found" edge), so the joint has no
//   seam and no hard notch;
// - arms are rubber hoses: one smooth curve through shoulder, elbow and paw,
//   about the same thickness all along, ending in a round mitten with a thumb;
//   posed by angles (upper arm, forearm, paw), so in-betweens travel on arcs;
// - motion breaks joints in order: the forearm leads and the paw follows a
//   beat later (follow-through);
// - stubby legs that are only feet: beans tucked under the torso, toes out;
//   sitting shows the soles with toe beans.
// `pose` (all optional): {
//   arms: [left, right], each a pose name ('down'|'hip'|'wave'|'up'|'hold'|'hug'|'out')
//         or { from, to, k } to blend two poses (k 0..1, eased);
//   phase (radians, drives the wave and the idle swing), sit, lean (deg), breath (0..1) }.

module.exports = function makeBody({ smooth, inked, line, dot, INK }) {
  let uid = 0;
  const id = (p) => `${p}${(uid += 1)}${Math.floor(Math.random() * 1e6)}`;
  const ease = (k) => Math.sin((Math.max(0, Math.min(1, k)) * Math.PI) / 2);
  const easeInOut = (k) => { const x = Math.max(0, Math.min(1, k)); return x * x * (3 - 2 * x); };
  const D = Math.PI / 180;
  const f1 = (v) => v.toFixed(1);

  /** Pear torso outline: narrow shoulders (ws), wide hips (wh), soft flat-ish bottom. */
  function torsoPoints(cx, yT, yB, ws, wh, breath = 0) {
    const pts = [], rb = (yB - yT) * 0.32, n = 9;
    const w = (s) => ws + (wh - ws) * ease(s * 1.15) + breath * 6 * Math.sin(s * Math.PI);
    for (let i = 0; i <= n; i += 1) { const s = i / n; pts.push([cx + w(s), yT + s * (yB - rb - yT)]); }
    for (let i = 1; i < 8; i += 1) { const a = (i / 8) * Math.PI; const c = Math.cos(a), sn = Math.sin(a); pts.push([cx + Math.sign(c) * Math.abs(c) ** 0.8 * w(1), yB - rb + sn ** 0.7 * rb]); }
    for (let i = n; i >= 0; i -= 1) { const s = i / n; pts.push([cx - w(s), yT + s * (yB - rb - yT)]); }
    for (let i = 1; i < 6; i += 1) { const a = Math.PI + (i / 6) * Math.PI; pts.push([cx + Math.cos(a) * ws, yT + Math.sin(a) * 40]); }
    return pts;
  }

  // ----------------------------------------------------------------- filters
  /** Blur + threshold: the shape's silhouette with soft fillets in concave corners. `t` < 0.5 grows it. */
  const goo = (fid, color, t, sigma = 10) => `<filter id="${fid}" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1200" height="1300" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${sigma}" result="b"/><feComponentTransfer in="b" result="m"><feFuncA type="linear" slope="30" intercept="${(0.5 - 30 * t).toFixed(3)}"/></feComponentTransfer><feFlood flood-color="${color}" result="c"/><feComposite in="c" in2="m" operator="in"/></filter>`;
  /** A thin line just outside the shape's edge (the band between thresholds t0 < t1). */
  const ring = (fid, color, t0, t1, sigma = 8) => `<filter id="${fid}" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1200" height="1300" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${sigma}" result="b"/><feComponentTransfer in="b" result="o"><feFuncA type="linear" slope="30" intercept="${(0.5 - 30 * t0).toFixed(3)}"/></feComponentTransfer><feComponentTransfer in="b" result="i"><feFuncA type="linear" slope="30" intercept="${(0.5 - 30 * t1).toFixed(3)}"/></feComponentTransfer><feComposite in="o" in2="i" operator="out" result="r"/><feFlood flood-color="${color}" result="c"/><feComposite in="c" in2="r" operator="in"/></filter>`;

  // ----------------------------------------------------------------- arms
  // Right-arm poses, in degrees: [upper arm (0 = right, 90 = down), forearm relative to it, paw tilt].
  const ARM = {
    down: [72, 22, 0], out: [25, 20, 0], hip: [38, 115, 10], wave: [-5, -40, 0], up: [-22, -46, 0], hold: [98, 92, 0], hug: [104, 84, 0],
  };
  /** Angles for one arm: blend two poses on arcs, add the pose's own motion, mirror for the left arm. */
  function armAngles(spec, side, phase = 0, push = 0) {
    const from = typeof spec === 'string' ? spec : spec.from, to = typeof spec === 'string' ? spec : spec.to;
    const k = typeof spec === 'string' ? 0 : easeInOut(spec.k);
    const A = ARM[from] || ARM.down, B = ARM[to] || ARM.down;
    let [a1, a2, tl] = A.map((v, i) => v + (B[i] - v) * k);
    const motion = (kind) => {
      // successive breaking of joints: the forearm leads, the paw follows a beat later
      if (kind === 'wave') return [Math.sin(phase) * 5, Math.sin(phase) * 24, Math.sin(phase - 1) * 22];
      if (kind === 'up') return [Math.sin(phase) * 8, Math.sin(phase - 0.6) * 10, Math.sin(phase - 1.2) * 14];
      if (kind === 'down' || kind === 'out') return [Math.sin(phase) * 5, Math.sin(phase - 0.7) * 8, Math.sin(phase - 1.4) * 8];
      return [0, 0, Math.sin(phase - 1) * 4];
    };
    const ma = motion(from), mb = motion(to);
    a1 += ma[0] * (1 - k) + mb[0] * k + push; a2 += ma[1] * (1 - k) + mb[1] * k - push * 0.7; tl += ma[2] * (1 - k) + mb[2] * k;
    return side > 0 ? [a1, a2, tl] : [180 - a1, -a2, -tl];
  }

  /**
   * The geometry of one arm: shoulder S, elbow E, paw P, and three shapes —
   * the tube (a quadratic curve through E, root buried in the torso), the
   * mitten and the thumb.
   */
  function armShape(S, angles, side, cx, { l1 = 64, l2 = 58, r0 = 33, r1 = 31, paw = 42 } = {}) {
    const [a1, a2, tl] = angles;
    const E = [S[0] + Math.cos(a1 * D) * l1, S[1] + Math.sin(a1 * D) * l1];
    const fa = (a1 + a2) * D;
    const P = [E[0] + Math.cos(fa) * l2, E[1] + Math.sin(fa) * l2];
    const Q = [2 * E[0] - (S[0] + P[0]) / 2, 2 * E[1] - (S[1] + P[1]) / 2]; // control point so the curve passes through E
    const at = (s) => [(1 - s) ** 2 * S[0] + 2 * (1 - s) * s * Q[0] + s * s * P[0], (1 - s) ** 2 * S[1] + 2 * (1 - s) * s * Q[1] + s * s * P[1]];
    const tan = (s) => { const a = at(Math.max(0, s - 0.01)), b = at(Math.min(1, s + 0.01)); const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
    const t0 = tan(0);
    const L = [], R = [];
    const n = 14;
    for (let i = -2; i <= n; i += 1) {
      const s = Math.max(0, i / n); let p = at(s);
      if (i < 0) p = [S[0] + t0[0] * i * 14, S[1] + t0[1] * i * 14]; // root, buried inside the torso
      const [tx, ty] = i < 0 ? t0 : tan(s); const rr = r0 + (r1 - r0) * s;
      L.push([p[0] - ty * rr, p[1] + tx * rr]); R.push([p[0] + ty * rr, p[1] - tx * rr]);
    }
    const tube = smooth([...L, ...R.reverse()]);
    const dir = tan(1); const ang = Math.atan2(dir[1], dir[0]) + tl * D;
    const mc = [P[0] + Math.cos(ang) * paw * 0.18, P[1] + Math.sin(ang) * paw * 0.18];
    const mitten = smooth(Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; const u = Math.cos(a) * paw * 1.06, v = Math.sin(a) * paw * 0.96; return [mc[0] + u * Math.cos(ang) - v * Math.sin(ang), mc[1] + u * Math.sin(ang) + v * Math.cos(ang)]; }));
    // the thumb sits on the side of the paw that faces the body
    let nx = -Math.sin(ang), ny = Math.cos(ang); if (nx * (cx - mc[0]) + ny * (S[1] - 40 - mc[1]) < 0) { nx = -nx; ny = -ny; }
    const tc = [mc[0] + nx * paw * 0.78 - Math.cos(ang) * paw * 0.08, mc[1] + ny * paw * 0.78 - Math.sin(ang) * paw * 0.08];
    const thumb = smooth(Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return [tc[0] + Math.cos(a) * paw * 0.36, tc[1] + Math.sin(a) * paw * 0.33]; }));
    return { S, E, P, mc, ang, tube, mitten, thumb, paw };
  }

  /**
   * One arm drawn over the torso: fill (shade, hatch, lit side, palm pad),
   * then its edge as an inner line that fades out toward the shoulder.
   * The outer outline comes from the merged silhouette (see body()).
   */
  function armSvg(g, { base, shade, palm, pad }) {
    const cid = id('ac'), mid = id('am'), rid = id('ar');
    const parts = `<path d="${g.tube}"/><path d="${g.mitten}"/><path d="${g.thumb}"/>`;
    const lit = `<g transform="translate(-9 -9)" fill="${base}">${parts}</g>`;
    const padSvg = palm ? (() => { const c = g.mc; const r = g.paw; const u = [Math.cos(g.ang), Math.sin(g.ang)]; const v = [-u[1], u[0]]; const at = (a, b) => [c[0] + u[0] * a + v[0] * b, c[1] + u[1] * a + v[1] * b]; const m = at(-r * 0.06, 0); return `<ellipse cx="${f1(m[0])}" cy="${f1(m[1])}" rx="${f1(r * 0.42)}" ry="${f1(r * 0.36)}" transform="rotate(${f1(g.ang / D)} ${f1(m[0])} ${f1(m[1])})" fill="${pad}"/>${[-1, 0, 1].map((k) => { const p = at(r * 0.58, k * r * 0.38); return dot(p[0], p[1], r * 0.13, pad); }).join('')}`; })() : '';
    return `<g><defs><clipPath id="${cid}">${parts}</clipPath>${ring(rid, INK, 0.3, 0.5, 6)}<radialGradient id="${mid}g" gradientUnits="userSpaceOnUse" cx="${f1(g.S[0])}" cy="${f1(g.S[1])}" r="120"><stop offset="0.28" stop-color="#000"/><stop offset="0.75" stop-color="#fff"/></radialGradient><mask id="${mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1100"><rect width="1000" height="1100" fill="url(#${mid}g)"/></mask></defs>
<g fill="${shade}">${parts}</g><g clip-path="url(#${cid})"><rect width="1000" height="1100" fill="url(#hatch)"/>${lit}${padSvg}</g>
<g mask="url(#${mid})"><g filter="url(#${rid})">${parts}</g></g></g>`;
  }

  /** Just the paw (mitten + thumb) with its own outline, to put on top of a held thing. */
  function pawCap(g, { base, shade }) {
    return inked(g.mitten, base, shade, { depth: 8, w: 8, heavy: 2 }) + inked(g.thumb, base, shade, { depth: 4, w: 7, heavy: 1 });
  }

  // ----------------------------------------------------------------- feet
  /** A foot seen from the front: a bean, toes out, with two toe creases. */
  function foot(x, y, side, base, shade, kind) {
    if (kind === 'bird') {
      const toes = [-1, 0, 1].map((k) => `M${x} ${y - 8} l${(k * 30 + side * 8).toFixed(0)} 28`).join(' ');
      return line(toes, 21) + line(toes, 11, '#ffb43d');
    }
    const pts = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; const c = Math.cos(a), s = Math.sin(a); const bx = c * 64 * (1 + 0.12 * c * side), by = s * (s > 0 ? 34 : 40); const rot = side * 0.22; return [x + bx * Math.cos(rot) - by * Math.sin(rot), y + bx * Math.sin(rot) + by * Math.cos(rot)]; });
    const toe = (k) => { const tx = x + side * (30 + k * 16), ty = y + 18 + k * 4; return `M${tx.toFixed(1)} ${(ty - 14).toFixed(1)} q ${side * 4} 9 0 16`; };
    return inked(smooth(pts), base, shade, { depth: 10, w: 9 }) + line(`${toe(0)} ${toe(1)}`, 5);
  }

  /** A foot seen from below (sitting): the sole faces us, with a pad and three toe beans. */
  function sole(x, y, side, base, shade, pad) {
    const rot = side * 0.32;
    const pts = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; const bx = Math.cos(a) * 50, by = Math.sin(a) * 62 * (Math.sin(a) < 0 ? 1.06 : 1); return [x + bx * Math.cos(rot) - by * Math.sin(rot), y + bx * Math.sin(rot) + by * Math.cos(rot)]; });
    const P = (px, py) => [x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)];
    const main = P(0, 14), toes = [P(-26, -26), P(0, -38), P(26, -26)];
    return inked(smooth(pts), base, shade, { depth: 8, w: 9 })
      + `<ellipse cx="${f1(main[0])}" cy="${f1(main[1])}" rx="26" ry="22" fill="${pad}" transform="rotate(${f1(rot / D)} ${f1(main[0])} ${f1(main[1])})"/>`
      + toes.map(([tx, ty]) => `<circle cx="${f1(tx)}" cy="${f1(ty)}" r="11" fill="${pad}"/>`).join('');
  }

  // ----------------------------------------------------------------- the body
  /**
   * The whole body. Returns { behind, torso, front, arms, cap } SVG strings:
   * behind (standing feet), the merged torso + arms, in front (sitting feet),
   * and the paws to redraw over held things.
   */
  function body(t, { hx, hy, hrx, hry, base, shade, belly, accent }, pose = {}) {
    const kind = t.species === 'bird' ? 'bird' : 'paw';
    const slime = t.species === 'slime';
    const sit = !!pose.sit && !slime;
    const yT = hy + hry * 0.55, yB = hy + hry + (slime ? 282 : sit ? 205 : 235);
    const ws = hrx * (slime ? 0.78 : 0.5), wh = hrx * (slime ? 1.12 : sit ? 0.86 : 0.76);
    const lean = pose.lean || 0;
    const d = smooth(torsoPoints(hx, yT, yB, ws, wh, pose.breath || 0));
    const pad = '#ff9fb0';
    const behind = [], front = [];
    if (!sit && !slime) for (const s of [-1, 1]) behind.push(foot(hx + s * wh * 0.5, yB - 2, s, base, shade, kind));

    // arms (geometry first: the silhouette needs them)
    const holding = t.hold && t.hold !== 'none' && !slime;
    const specs = pose.arms || ['down', holding ? 'hold' : 'down'];
    const arms = [-1, 1].map((s, i) => {
      const S = [hx + s * ws * (slime ? 0.95 : 0.92), yT + (slime ? 120 : 92)];
      // a raised paw must clear the head (no tangents, no paw hidden behind a cheek): swing the arm out until it does
      let g;
      for (let push = 0; push <= 66; push += 6) {
        g = armShape(S, armAngles(specs[i], s, (pose.phase || 0) + (s > 0 ? 0 : 0.8), push), s, hx, { l1: hrx * 0.29, l2: hrx * 0.27 });
        const m = g.paw * 0.75;
        const dy = g.mc[1] - hy, wx = hrx * (1 + 0.1 * Math.max(-1, Math.min(1, dy / hry))) + m; // the head is a squarish blob, wider at the jaw
        if (Math.abs((g.mc[0] - hx) / wx) ** 2.4 + Math.abs(dy / (hry + m)) ** 2.4 >= 1) break;
      }
      const name = typeof specs[i] === 'string' ? specs[i] : (specs[i].k < 0.5 ? specs[i].from : specs[i].to);
      return { s, g, P: g.P, k: name };
    });
    // the slime: a puddle that spreads on the floor, with two little melting nubs for feet
    const puddle = slime ? [`M${hx - wh * 1.06} ${yB - 8} a ${wh * 1.06} 26 0 1 0 ${wh * 2.12} 0 a ${wh * 1.06} 26 0 1 0 ${-wh * 2.12} 0 Z`, ...[-1, 1].map((s) => `M${hx + s * wh * 0.42 - 44} ${yB - 2} a 44 26 0 1 0 88 0 a 44 26 0 1 0 -88 0 Z`)] : [];
    const sil = `${puddle.map((p) => `<path d="${p}"/>`).join('')}<path d="${d}"/>${arms.map((a) => `<path d="${a.g.tube}"/><path d="${a.g.mitten}"/><path d="${a.g.thumb}"/>`).join('')}`;

    // torso inside: shade, hatch, lit side, belly, the head's shadow, clothes
    let inside = `<rect width="1000" height="1100" fill="url(#hatch)"/><path d="${d}" fill="${base}" transform="translate(-22 -20)"/>`;
    inside += `<ellipse cx="${hx + 4}" cy="${yB - (yB - yT) * 0.36}" rx="${wh * 0.6}" ry="${(yB - yT) * 0.34}" fill="${belly}"/>`;
    inside += `<path d="M${hx - wh * 0.42} ${yB - (yB - yT) * 0.62} Q ${hx} ${yB - (yB - yT) * 0.78} ${hx + wh * 0.42} ${yB - (yB - yT) * 0.62}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity="0.55"/>`;
    if (t.wear === 'vest' && !slime) {
      for (const s of [-1, 1]) inside += `<path d="M${hx + s * 20} ${yT} L${hx + s * 60} ${yB - (yB - yT) * 0.35} Q ${hx + s * 70} ${yB - 30} ${hx + s * 52} ${yB + 20} L${hx + s * 260} ${yB + 20} L${hx + s * 260} ${yT} Z" fill="${accent}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M${hx + s * 70} ${yT + 70} L${hx + s * 250} ${yT + 70}" stroke="#fffdf7" stroke-width="14" opacity="0.85"/>`;
      inside += `<g transform="rotate(-6 ${hx - 100} ${yB - 90})"><rect x="${hx - 143}" y="${yB - 112}" width="86" height="44" rx="8" fill="#fffdf7" stroke="${INK}" stroke-width="6"/><text x="${hx - 100}" y="${yB - 82}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="20" text-anchor="middle" fill="${INK}">HELLO</text></g>`;
    }
    inside += `<ellipse cx="${hx}" cy="${hy + hry * 0.98}" rx="${hrx * 0.86}" ry="${hry * 0.32}" fill="${shade}" opacity="0.75"/>`;

    const tid = id('tc'), o = id('go'), fb = id('gf');
    const torso = `<g transform="rotate(${lean} ${hx} ${yB})"><defs>${goo(o, INK, 0.2)}${goo(fb, base, 0.5)}<clipPath id="${tid}"><path d="${d}"/></clipPath></defs>
<g filter="url(#${o})" transform="translate(4 5)">${sil}</g><g filter="url(#${o})">${sil}</g><g filter="url(#${fb})">${sil}</g>
${puddle.map((p) => `<path d="${p}" fill="${shade}"/>`).join('')}<path d="${d}" fill="${shade}"/><g clip-path="url(#${tid})">${inside}</g>
${arms.map((a) => armSvg(a.g, { base, shade, palm: a.k === 'wave' || a.k === 'up', pad })).join('')}</g>`;

    if (sit) for (const s of [-1, 1]) front.push(sole(hx + s * wh * 0.62, yB + 6, s, base, shade, pad));
    return { behind: behind.join(''), torso, front: front.join(''), arms, cap: (a) => pawCap(a.g, { base, shade }), yT, yB, ws, wh };
  }

  return { body, armShape, armAngles, foot, sole, torsoPoints, ARM };
};
