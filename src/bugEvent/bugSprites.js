// Pixel art for the "Bug Attack" event (see BugEvent.jsx).
//
// BOSSES are humanoid beetle warriors (22×24, facing right; the body sits in the middle so a
// punch can reach out). S horns · H head · E eye · e eye core · F mandibles · M mouth
// B carapace · b shine · X marks · A arm · C claw · L leg · K foot
const W = 22;
const row = s => ('.....' + s).padEnd(W, '.').slice(0, W);

const HEAD = [
  '...S.....S',
  '....S...S.',
  '...HHHHHHH',
  '..HHHHHHHHH',
  '..HEEHHHEEH',
  '..HEeHHHEeH',
  '..HHHHHHHHH',
  '...FHHHHHF',
  '...F.....F',
];
const BODY = [
  '..SBBBBBBBS',
  '.ABBXBBBXBBA',
  '.ABBBBBBBBBA',
  '.ABbBBBBBbBA',
  '.CBBBXBXBBBC',
  '..BBBBBBBBB',
  '...BbBBBbB',
  '...BBBBBBB',
];
const LEGS = {
  stand: ['....LL.LL', '....LL.LL', '...LL...LL', '...LL...LL', '..LLL...LLL', '.KKK.....KKK', ''],
  bend:  ['....LL.LL', '...LL...LL', '...LL...LL', '..LL.....LL', '..LL.....LL', '.KKK.....KKK', ''],
  stepA: ['....LL.LL', '...LL...LL', '..LL.....LL', '..L.......LL', '.LL........L', 'KKK.......KKK', ''],
  stepB: ['....LL.LL', '....LL.LL', '....LL.LL', '....LL.LL', '...LLL.LLL', '..KKK...KKK', ''],
};
const build = (head, body, legs) => [...head, ...body, ...legs].map(row);

const bodyWind = BODY.map((r, i) => (i === 0 ? '..SBBBBBBBSAC' : i === 1 ? '.ABBXBBBXBBA' : i >= 2 && i <= 4 ? r.slice(0, -1) + 'B' : r));
const bodyPunch = BODY.map((r, i) => (i === 1 ? '.ABBXBBBXBBAAAAC' : i === 2 ? '.ABBBBBBBBBAAAAC' : i >= 3 && i <= 4 ? r.slice(0, -1) + 'B' : r));
// arms crossed over the chest (watching from the side)
const bodyWatch = ['..SBBBBBBBS', '..BBXBBBXBB', '.BAAAAAAAAAB', '.BCAAAAAAACB', '..BBBXBXBBB', '..BBBBBBBBB', '...BbBBBbB', '...BBBBBBB'];
// uppercut: the front arm goes straight up
const bodyUpper = BODY.map((r, i) => (i === 0 ? '..SBBBBBBBSA' : i === 1 ? '.ABBXBBBXBBA' : i >= 2 && i <= 4 ? r.slice(0, -1) + 'B' : r));
const headUpper = HEAD.map((r, i) => (i === 7 ? '...FHHHHHF.C' : i === 8 ? '...F.....F.A' : r));
const headBite = [
  '.....S.....S',
  '......S...S.',
  '.....HHHHHHH',
  '....HHHHHHHHH',
  '....HEEHHHEEH',
  '....HEeHHHEeHF',
  '....HHHHHHHHMF',
  '.....FHMMMMMMF',
  '....FF.MMMM.FF',
];
const headHurt = HEAD.map(r => r.replaceAll('e', 'E'));

// v6.2 moves: kick (leg out), charge (leaning in, head down), block (arms crossed high),
// slam (both fists overhead), hold (one arm straight up, gripping)
const legsKick = ['....LL.LLLLLLLLK', '....LL.LLLLLLLLK', '...LL', '...LL', '..LLL', '.KKK', ''];
const headCharge = HEAD.map(r => '..' + r);
const bodyCharge = BODY.map((r, i) => (i < 3 ? '.' + r : r));
const bodyBlock = ['..SBBBBBBBS', '.CAAAAAAAAAC', '.BAAAAAAAAAB', '.ABbBBBBBbBA', '..BBBXBXBBB', '..BBBBBBBBB', '...BbBBBbB', '...BBBBBBB'];
const headSlam = HEAD.map((r, i) => (i === 0 ? 'C..S.....S..C' : i === 1 ? 'A...S...S...A' : i === 2 ? 'A..HHHHHHH..A' : i === 3 ? 'A.HHHHHHHHH.A' : r));
const bodySlam = BODY.map((r, i) => (i === 0 ? 'A.SBBBBBBBS.A' : i === 1 ? '.ABBXBBBXBBA' : i >= 2 && i <= 4 ? '.' + r.slice(1, -1) + 'B' : r));
const headHold = HEAD.map((r, i) => (i === 0 ? '...S.....S.CC' : i === 1 ? '....S...S..CC' : i === 2 ? '...HHHHHHH.A' : i === 3 ? '..HHHHHHHHHA' : i >= 4 && i <= 8 ? r.padEnd(11, '.') + 'A' : r));

export const BUG_POSES = {
  kick: [build(HEAD, BODY, legsKick)],
  charge: [build(headCharge, bodyCharge, LEGS.stepA)],
  block: [build(HEAD, bodyBlock, LEGS.bend)],
  slam: [build(headSlam, bodySlam, LEGS.bend)],
  hold: [build(headHold, bodyUpper, LEGS.stand)],
  idle: [build(HEAD, BODY, LEGS.stand), build(HEAD, BODY, LEGS.bend)],
  walk: [build(HEAD, BODY, LEGS.stepA), build(HEAD, BODY, LEGS.stepB)],
  wind: [build(HEAD, bodyWind, LEGS.bend)],
  punch: [build(HEAD, bodyPunch, LEGS.stepA)],
  uppercut: [build(headUpper, bodyUpper, LEGS.stepB)],
  bite: [build(headBite, BODY, LEGS.stepA)],
  hurt: [build(headHurt, BODY, LEGS.bend)],
  watch: [build(HEAD, bodyWatch, LEGS.stand)],
};
export const BUG_W = W;
export const BUG_H = BUG_POSES.idle[0].length;

// ---- the small classic green bug (the armies) ----------------------------------
// seen from the side, facing right · G shell · g spots · H head · W eye · K pupil · M mandible · L legs
const MBODY = [
  '..........K...K.',
  '...........K.K..',
  '....GGGGGG.HHHH.',
  '..GGgGGGgGGHWKH.',
  '.GGGGGGGGGGHHHHM',
  '.GgGGGgGGGGgHHM.',
  '..GGGGGGGGGG....',
];
export const MINION_FRAMES = [
  [...MBODY, '...L.L..L.L..L..', '..L...L...L.L...'],
  [...MBODY, '..L..L.L...L.L..', '...L...L.L...L..'],
];
export const MINION_W = 16;
export const MINION_H = MINION_FRAMES[0].length;
export const MINION_PALETTE = { G: '#3ddc5a', g: '#1f8a3a', H: '#1a6b2c', W: '#ffffff', K: '#0b1f10', M: '#e8f7a0', L: '#0f3d18' };
// background ambience: dark silhouettes with glowing red eyes, crawling behind the page
export const AMB_PALETTE = { G: '#121a14', g: '#0b110c', H: '#0d150f', W: '#ff3b2a', K: '#ff3b2a', M: '#1c261d', L: '#0b110c' };
export const ELITE_PALETTE = { ...MINION_PALETTE, G: '#2fbf4d', g: '#14702c', W: '#ff2a2a', K: '#ffd166', M: '#ff4d4d' };

// ---- wings (drawn behind flying bugs) · w membrane · O outline ------------------
export const WINGS = [
  ['..OOO.....OOO..', '.OwwwO...OwwwO.', 'OwwwwO...OwwwwO', '.OwwO.....OwwO.', '..OO.......OO..'],
  ['...............', '...............', 'OOOOOO...OOOOOO', 'OwwwwwO.OwwwwwO', '.OOOOO...OOOOO.'],
];
export const WING_PALETTE = { O: '#1a2447', w: 'rgba(214, 236, 255, 0.85)' };

const base = { E: '#ff2a2a', e: '#fff2a8', F: '#f4f4f4', M: '#5a0710', K: '#0b0b10' };
/** Bosses (one per GitHub repo) + the armies. */
export const BUG_TYPES = {
  e403:     { name: 'Error403', palette: { ...base, S: '#7a5cc4', H: '#1b1426', B: '#2a1f3d', b: '#4b3a6b', X: '#b48cff', A: '#2a1f3d', C: '#b48cff', L: '#1b1426' } },
  halluc:   { name: 'Hallucination', palette: { ...base, E: '#5cf2c8', e: '#ffffff', S: '#5cf2c8', H: '#0d2a2a', B: '#123c3a', b: '#1f6b66', X: '#5cf2c8', A: '#123c3a', C: '#5cf2c8', L: '#0d2a2a' } },
  rollback: { name: 'RollbackKing', palette: { ...base, E: '#ffe14a', S: '#ff7a1a', H: '#200805', B: '#3a0f0a', b: '#7a1e10', X: '#ffb020', A: '#3a0f0a', C: '#ffb020', L: '#200805' } },
  minion:   { name: 'TokenBug', palette: MINION_PALETTE },
  elite:    { name: 'DoubleBookingBug', palette: ELITE_PALETTE },
  // Error403's "429 Too Many Requests" minions
  blocked:  { name: 'BlockedRequest', palette: { ...MINION_PALETTE, G: '#8b5cf6', g: '#5b3aa8', H: '#3a2470', W: '#ffffff', K: '#1b1426', M: '#ff4d4d', L: '#2a1f3d' } },
};
export const BUG_RAGE_PALETTE = { ...base, E: '#ffffff', S: '#ff4d4d', H: '#240206', B: '#3d0508', b: '#7a0f18', X: '#ff4d4d', A: '#3d0508', C: '#ff4d4d', L: '#240206' };

// ---- the buddies' armour, in pieces that crack and break off ---------------------
// M steel · m shine · B site blue · P darker steel · k crack
const VIC_HELMET = [
  '....MMMMMMM.....',
  '...MMmMMMMMMM...',
  '..MMMMMMMMMMMM..',
  '..MBBBBBBBBBBM..',
  '..M..........M..',
  '..M..........M..',
  '..M..........M..',
];
const VIC_CHEST = [
  '.PMMMMMMMMMMMMP.',
  '..MmMMMBBMMMmM..',
  '..MMMMMBBMMMMM..',
  '...MMMMMMMMMM...',
];
const CL_HELMET = ['.....MMMM.....', '...MMmMMMMM...', '..MBBBBBBBBM..', '..M........M..'];
const crack = (grid, spots) => grid.map((r, y) => [...r].map((ch, x) => (ch !== '.' && spots.some(([sx, sy]) => sx === x && sy === y) ? 'k' : ch)).join(''));
export const ARMOR_PIECES = {
  vic: [
    { id: 'helmet', top: 0, frames: [VIC_HELMET, crack(VIC_HELMET, [[5, 1], [6, 2], [10, 2], [7, 0], [11, 3]])] },
    { id: 'chest', top: 13, frames: [VIC_CHEST, crack(VIC_CHEST, [[4, 1], [11, 2], [7, 3], [9, 0], [5, 2]])] },
  ],
  claude: [
    { id: 'helmet', top: -2, frames: [CL_HELMET, crack(CL_HELMET, [[6, 0], [8, 1], [5, 2], [9, 2]])] },
  ],
};
export const ARMOR_PALETTE = { M: '#c3c9d6', m: '#ffffff', B: '#4c6ef6', P: '#8a93a8', k: '#2a2f3a' };

// ---- Super Saiyan aura: 4 frames of pixel flame (cream core, yellow spikes) -----------
// W cream core · Y yellow flame · O orange tips
function auraFrame(seed) {
  const W = 30, H = 32;
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const rows = Array.from({ length: H }, () => Array(W).fill('.'));
  for (let x = 0; x < W; x++) {
    const d = Math.abs(x - (W - 1) / 2) / ((W - 1) / 2);      // 0 centre → 1 edge
    let h = Math.round(H * (0.3 + 0.42 * (1 - d * d)));         // rounded body
    if (rnd() < 0.5) h += Math.round(rnd() * H * 0.32 * (1 - d * 0.5));   // flame spikes
    h = Math.min(H, h);
    const ih = d < 0.8 ? Math.round(h * 0.7 * (1 - d * 0.45)) - 2 : 0;   // cream core
    for (let y = H - 1; y >= H - h; y--) {
      const r = H - 1 - y;                                   // rows from the bottom
      const edge = r < 5 ? 0.62 + r * 0.08 : 2;              // the base curves in like a bowl
      if (d > edge) continue;
      const fromTop = y - (H - h);
      rows[y][x] = d > edge - 0.12 ? 'Y' : r < ih ? 'W' : fromTop < 2 && h > H * 0.55 ? 'O' : 'Y';
    }
  }
  return rows.map(r => r.join(''));
}
export const AURA_FRAMES = [11, 29, 47, 83].map(auraFrame);
export const AURA_PALETTE = { W: '#fffbd6', Y: '#ffd83b', O: '#ffb21f' };
// Claude's power-up: the same flame, in Claude orange
export const AURA_PALETTE_ORANGE = { W: '#ffe9d6', Y: '#ff8a4c', O: '#d9532b' };

// Header button icon: a small green bug seen from the front.
export const BUG_ICON = [
  'K.........K',
  '.K.......K.',
  '..KGGGGGK..',
  'L.GWKGWKG.L',
  '.LGGGGGGGL.',
  '..GGgGgGG..',
  'LLGGGgGGGLL',
  '..GgGGGgG..',
  '.LGGGgGGGL.',
  'L..GGGGG..L',
  '....GGG....',
];
export const BUG_ICON_PALETTE = { G: '#3ddc5a', g: '#1f8a3a', W: '#ffffff', K: 'currentColor', L: 'currentColor' };
