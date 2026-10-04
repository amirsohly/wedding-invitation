// Generates the SVG artwork used by the invitation (envelope pattern, wax-seal
// outline, placeholder photos). You normally never need to run this.
// Usage: node tools/gen-assets.mjs .
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
const img = join(root, 'src/assets/images');
mkdirSync(img, { recursive: true });

const r2 = (n) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ */
/* 1. Embossed floral tile (envelope paper)                            */
/* ------------------------------------------------------------------ */
const W = 380, H = 420;

// Shapes are defined once (no fill) so <use> can paint them as shadow + highlight.
const defs = `
<path id="petal" d="M0 0C-16-2-22-20-13-32C-8-39 8-39 13-32C22-20 16-2 0 0Z"/>
<path id="petalS" d="M0 0C-10-1-14-13-8-21C-5-25 5-25 8-21C14-13 10-1 0 0Z"/>
<path id="leaf" d="M0 0C4-9 14-13 27-8C19 3 8 5 0 0Z"/>
<path id="leafS" d="M0 0C3-6 9-9 18-6C12 2 6 3 0 0Z"/>
<g id="wreath">
  ${[0,1,2,3,4,5,6,7].map(i=>`<use href="#leaf" transform="rotate(${i*45+12}) translate(30 0) scale(1.15)"/>`).join('')}
</g>
<g id="peony">
  <use href="#wreath"/>
  ${[0,1,2,3,4,5,6].map(i=>`<use href="#petal" transform="rotate(${i*51.43})"/>`).join('')}
  ${[0,1,2,3,4,5].map(i=>`<use href="#petal" transform="rotate(${25+i*60}) scale(.72)"/>`).join('')}
  ${[0,1,2,3,4].map(i=>`<use href="#petal" transform="rotate(${10+i*72}) scale(.46)"/>`).join('')}
  <circle r="3.4"/>
</g>
<g id="bloom">
  ${[0,1,2,3,4].map(i=>`<use href="#petalS" transform="rotate(${i*72})"/>`).join('')}
  ${[0,1,2,3,4].map(i=>`<use href="#petalS" transform="rotate(${36+i*72}) scale(.55)"/>`).join('')}
  <circle r="2.4"/>
</g>
<g id="sprig">
  <path d="M0 0C20-14 46-18 80-6L80-3.6C46-14 21-10 1 2.2Z"/>
  <use href="#leaf"  transform="translate(14 -8) rotate(-40)"/>
  <use href="#leaf"  transform="translate(31 -14) rotate(-16)"/>
  <use href="#leafS" transform="translate(47 -15) rotate(-32)"/>
  <use href="#leaf"  transform="translate(59 -12) rotate(4)"/>
  <use href="#leaf"  transform="translate(22 -8) rotate(142)"/>
  <use href="#leafS" transform="translate(42 -13) rotate(162)"/>
  <use href="#leafS" transform="translate(66 -9) rotate(152)"/>
</g>
<g id="berries"><circle r="2.6"/><circle cx="6.5" cy="3" r="2.6"/><circle cx="1" cy="7.5" r="2.6"/></g>
<g id="bud"><path d="M0 0C-6-6-6-17 0-22C6-17 6-6 0 0Z"/><use href="#leafS" transform="translate(-1 -2) rotate(150)"/><use href="#leafS" transform="translate(1 -3) rotate(30)"/></g>`;

// Element placements: [id, x, y, rotate, scale, radius]
const placements = [
  ['peony',   96, 112,  14, 1.05, 66],
  ['peony',  290, 300, -26, 0.86, 56],
  ['bloom',  300,  70,  20, 1.00, 30],
  ['bloom',   62, 336, -12, 0.92, 28],
  ['bloom',  196, 214,  38, 0.72, 22],
  ['sprig',  168,  40,  14, 1.05, 50],
  ['sprig',   10, 236, -20, 1.00, 48],
  ['sprig',  366, 372, 170, 0.95, 46],
  ['sprig',  212, 132,  64, 0.78, 36],
  ['sprig',  124, 398, -6,  0.88, 42],
  ['sprig',  330, 190, 118, 0.70, 34],
  ['bud',    248, 168, -30, 1.00, 14],
  ['bud',     34,  46,  25, 0.95, 14],
  ['bud',    206, 300,  70, 0.95, 14],
  ['berries',160, 262,   0, 1.00,  9],
  ['berries', 70, 212,   0, 1.00,  9],
  ['berries',250,  18,   0, 1.00,  9],
  ['berries',360, 130,   0, 1.00,  9],
  ['berries',196, 356,   0, 1.00,  9],
];

// Wrap-around copies keep the tile seamless when an element crosses an edge.
let art = '';
for (const [id, x, y, rot, sc, rad] of placements) {
  const xs = [0]; const ys = [0];
  if (x - rad < 0) xs.push(W); if (x + rad > W) xs.push(-W);
  if (y - rad < 0) ys.push(H); if (y + rad > H) ys.push(-H);
  for (const dx of xs) for (const dy of ys) {
    art += `<use href="#${id}" transform="translate(${x + dx} ${y + dy}) rotate(${rot}) scale(${sc})"/>`;
  }
}

const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${defs}
<g id="art">${art}</g>
</defs>
<use href="#art" fill="#9ea3dc" opacity=".5" transform="translate(1.8 2.4)"/>
<use href="#art" fill="#ffffff" opacity=".74"/>
<use href="#art" fill="none" stroke="#b4b8e6" stroke-width=".9" stroke-linejoin="round" opacity=".75"/>
<use href="#art" fill="none" stroke="#ffffff" stroke-width=".7" stroke-linejoin="round" opacity=".6" transform="translate(-.5 -.6)"/>
</svg>`;
writeFileSync(join(img, 'floral-pattern.svg'), tile);

/* ------------------------------------------------------------------ */
/* 2. Wax seal outline (organic blob, Catmull-Rom smoothed)            */
/* ------------------------------------------------------------------ */
function blobPath(cx, cy, base, n, wobble) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const r = base + wobble(t);
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  let d = `M${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r2(c1[0])} ${r2(c1[1])} ${r2(c2[0])} ${r2(c2[1])} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d + 'Z';
}
const wax = blobPath(60, 60, 51, 40, (t) => 2.6 * Math.sin(5 * t + .4) + 1.6 * Math.sin(8 * t + 2.1) + 1 * Math.sin(13 * t + 1));
console.log('wax seal path (paste into index.html .wax-shape if you change it):\n' + wax);

/* (the couple photo is a real file in src/assets/images — nothing generated here) */
/* ------------------------------------------------------------------ */
console.log('done');
