// Original pixel sprites for the hero buddies (plan §6).
// Each sprite = equal-length strings; every character maps to a palette color, '.' = transparent.

/* ---- Vic: June Vic's avatar (colors picked from public/jv.png) ---------- */
/* Thin black outline is added in CSS (buddies.css, .buddy--vic) so the sprite keeps its size. */
export const vicPalette = {
  H: '#1b1512', // black hair
  h: '#3b2d25', // hair highlight
  S: '#c98d64', // skin
  s: '#a5694a', // skin shade
  E: '#1b1512', // eyes
  M: '#9c5a47', // mouth (soft, not too dark)
  B: '#4f7fb5', // blue polo
  b: '#36608f', // polo shade
  W: '#f4f4f4', // white collar trim
  P: '#2b2f3a', // dark pants
  K: '#121419', // shoes
  L: '#e3ad85', // skin highlight (hands)
  l: '#6f9bd0', // polo highlight (sleeves)
};

const vicTop = [
  '....HHHHHHH.....',
  '...HHHHHHHHHH...',
  '..HHhHHHHHHhHH..',   // hair highlights, symmetric
  '..HHHHHHHHHHHH..',
  '..HHSSHHSSSHHH..',
  '..HSSSSSSSSSSH..',
  '..HSSEESSEESSH..',   // eyes close together, centred
  '..sSSSSSSSSSSs..',
  '...SSSSSSSSSS...',   // no nose shading: keeps a clean gap above the mouth
  '...SSSMSSMSSS...',   // smile corners (cols 6 and 9)
  '....sSSMMSSs....',   // smile bottom → happy U-shaped smile
  '.....sSSSSs.....',
  '....WWBSSBWW....',
  '..BBBBWBBWBBBB..',
  '.BBBBBBBBBBBBbB.',
  '.SBBBBBBBBBBBbS.',
  '.SbBBBBBBBBBBbS.',
  '...PPPPPPPPPP...',
];

/** Copy a grid with some pixels changed: edits = [[row, col, char], ...]. */
const setPx = (grid, edits) => {
  const rows = grid.map(r => r.split(''));
  for (const [r, c, ch] of edits) rows[r][c] = ch;
  return rows.map(r => r.join(''));
};

/** Lighten (f > 1) or darken (f < 1) a #rrggbb colour. */
const tone = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f))));
  return `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`;
};
/**
 * Round off arms and hands with flat pixel shading: inside the given rows/cols, a `base` pixel with
 * nothing above it becomes the highlight, and one with nothing below it becomes the shadow.
 * layers = [{ base, hi, lo }, ...]
 */
const shadeRegion = (grid, rows, cols, layers) => {
  const out = grid.map(r => r.split(''));
  for (const r of rows) for (const c of cols) {
    const ch = grid[r]?.[c];
    const layer = layers.find(l => l.base === ch);
    if (!layer) continue;
    const up = grid[r - 1]?.[c], down = grid[r + 1]?.[c];
    if (!up || up === '.') out[r][c] = layer.hi;
    else if (!down || down === '.') out[r][c] = layer.lo;
  }
  return out.map(r => r.join(''));
};
const vicLegs = ['...PPP....PPP...', '...KKK....KKK...'];
const vicStand = [...vicTop, ...vicLegs];

// Wave: the right hand (viewer's right) comes up beside the face and swings
// between two positions. The hand that was at the side is removed.
const armUp = [[13, 14, 'B'], [15, 14, '.'], [16, 14, '.']];
const vicWave = [
  setPx(vicStand, [...armUp, [8, 14, 'S'], [9, 14, 'S'], [10, 14, 'B'], [11, 14, 'B'], [12, 14, 'B']]),
  setPx(vicStand, [...armUp, [7, 15, 'S'], [8, 15, 'S'], [9, 14, 'B'], [10, 14, 'B'], [11, 14, 'B'], [12, 14, 'B']]),
];

// Facial expressions: row overrides for the face (rows 5, 6, 9, 10).
// Only columns 2–13 are replaced, so a raised waving hand (col 14+) is kept.
const vicFaces = {
  happy:     { 5: '..HSSESSSSESSH..', 6: '..HSESESSESESH..', 9: '...SSSMMMMSSS...', 10: '....sSSMMSSs....' },  // ^ ^ eyes, big smile
  surprised: { 5: '..HSSEESSEESSH..', 6: '..HSSEESSEESSH..', 9: '...SSSSMMSSSS...', 10: '....sSSMMSSs....' },  // tall eyes, O mouth
  angry:     { 5: '..HSEESSSSEESH..', 6: '..HSSEESSEESSH..', 9: '...SSSSMMSSSS...', 10: '....sSMSSMSs....' },  // slanted brows over the eyes, frown
  sad:       { 5: '..HSSSESSESSSH..', 6: '..HSSESSSSESSH..', 9: '...SSSSMMSSSS...', 10: '....sSMSSMSs....' },  // inner brows raised, eyes low, frown
  neutral:   { 9: '...SSSSSSSSSS...', 10: '....sSSMMSSs....' },                                              // flat mouth
};

// Held up by the shirt (dragged with the mouse): arms shoot up beside the head,
// the shirt rides up (belly + navel showing) and the legs kick in turn.
const vicArmsUp = [
  [7, 1, 'S'], [8, 1, 'S'], [9, 1, 'B'], [10, 1, 'B'], [11, 1, 'B'], [12, 1, 'B'], [13, 1, 'B'],
  [7, 14, 'S'], [8, 14, 'S'], [9, 14, 'B'], [10, 14, 'B'], [11, 14, 'B'], [12, 14, 'B'], [13, 14, 'B'],
];
const vicHeldTop = setPx(vicTop, vicArmsUp).map((row, r) =>
  r === 15 ? '..BBBBBBBBBBBB..'        // shirt hem pulled up
  : r === 16 ? '...SSSSsSSSSS...'      // belly with a navel
  : row);
const vicHeld = [
  [...vicHeldTop, '..PPP......PPP..', '.KKK........KKK.'],
  [...vicHeldTop, '....PPP..PPP....', '....KKK.KKK.....'],
];

// Vacuuming: both hands out in front at chest height (the far arm is hidden
// behind the body), legs running.
const vicVacTop = setPx(vicTop, [
  [14, 15, 'S'], [15, 14, 'B'], [15, 15, 'S'], [16, 14, '.'],   // arm + hands forward
  [15, 1, '.'], [16, 1, '.'],                                    // other arm tucked away
]);
const vicVacuum = [
  [...vicVacTop, '..PPP......PPP..', '.KKK........KKK.'],
  [...vicVacTop, '....PPP..PPP....', '....KKK.KKK.....'],
];

const vicShadeArms = g => shadeRegion(g, [13, 14, 15, 16], [0, 1, 14, 15], [
  { base: 'B', hi: 'l', lo: 'b' },
  { base: 'S', hi: 'L', lo: 's' },
]);

export const vic = {
  palette: vicPalette,
  faces: vicFaces,
  faceCols: [2, 13],
  blinkChar: 's',            // eyes → skin-shade line while blinking
  stand: vicStand,
  // laptop: June Vic types with alternating hands raised (the laptop prop sits beside him)
  poses: {
    wave: vicWave,
    held: vicHeld,
    fall: vicHeld[0],
    vacuum: vicVacuum,
    laptop: [
      vicShadeArms(setPx(vicStand, [[14, 1, 'S'], [15, 1, 'B'], [14, 14, 'B'], [15, 14, 'S']])),
      vicShadeArms(setPx(vicStand, [[14, 1, 'B'], [15, 1, 'S'], [14, 14, 'S'], [15, 14, 'B']])),
    ],
  },  // array of frames = animated pose
  walk: [
    [...vicTop, '..PPP......PPP..', '.KKK........KKK.'],
    [...vicTop, '....PPP..PPP....', '....KKK.KKK.....'],
  ],
};

/* ---- Claude: drawn by hand in claude-sprite.txt -------------------------- */
// Edit src/buddies/claude-sprite.txt to change Claude. Frames: [stand], [walk], [nap].
import claudeSpriteText from './claude-sprite.txt?raw';

export const claudePalette = {
  O: '#D77757', // Claude orange
  o: '#B85C3E', // darker orange (closed eyes while blinking / napping)
  E: '#141414', // eyes
  L: '#EE9A78', // lighter orange (arm highlight)
};

/**
 * Parse the text file into { frameName: string[] }.
 * Rows drawn with spaces ("O O . O") are read by column: every 2 characters = 1 pixel,
 * so leading spaces (indentation) count as empty pixels. Rows without spaces ("OO.O")
 * are read 1 character = 1 pixel. Only O/o/E/. count as pixels; other lines are ignored.
 */
function parseSpriteText(text) {
  const frames = {};
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '');
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const header = /^\[(\w+)\]$/.exec(trimmed);
    if (header) { current = frames[header[1]] = []; continue; }
    if (!current || !/^[OoE.\s]+$/.test(line)) continue;      // skip notes like "mine"
    if (/\S\s\S/.test(trimmed)) {
      const cells = [];
      for (let i = 0; i < line.length; i++) if (line[i] !== ' ') cells[Math.floor(i / 2)] = line[i];
      current.push(Array.from(cells, c => c || '.').join(''));
    } else {
      current.push(trimmed);
    }
  }
  // pad rows so every row in a frame has the same width (forgiving while drawing)
  for (const rows of Object.values(frames)) {
    const w = Math.max(...rows.map(r => r.length));
    rows.forEach((r, i) => { rows[i] = r.padEnd(w, '.'); });
  }
  return frames;
}

const claudeFrames = parseSpriteText(claudeSpriteText);
const claudeStand = claudeFrames.stand;
const claudeShadeArms = g => shadeRegion(g, [2, 3, 4], [0, 1, 12, 13], [{ base: 'O', hi: 'L', lo: 'o' }]);

// Claude's expressions (eye rows 2–3, columns 2–11).
const claudeFaces = {
  happy:     { 2: '..OOEOOOOEOO..', 3: 'OOOEOEOOEOEOOO' },   // ^ ^
  surprised: { 2: '..OEEOOOOEEO..', 3: 'OOOEEOOOOEEOOO' },   // big eyes
  angry:     { 2: '..OOOEOOEOOO..', 3: 'OOOOEOOOOEOOOO' },   // inner brows, eyes low
  sad:       { 2: '..OOOOOOOOOO..', 3: 'OOOOEOOOOEOOOO' },   // eyes low
  neutral:   {},
};

export const claude = {
  palette: claudePalette,
  faces: claudeFaces,
  faceCols: [2, 11],
  blinkChar: 'o',
  stand: claudeStand,
  poses: {
    nap: claudeFrames.nap || claudeStand,
    // typing: eyes on the laptop, arms tapping in turn
    laptop: [claudeShadeArms(claudeFrames.type1 || claudeStand), claudeShadeArms(claudeFrames.type2 || claudeStand)],
    // dragged with the mouse: legs kick in turn
    held: [claudeFrames.walk || claudeStand, claudeFrames.walk2 || claudeStand],
    // used as a vacuum by June Vic: legs kick the same way
    vacuum: [claudeFrames.walk || claudeStand, claudeFrames.walk2 || claudeStand],
    fall: claudeFrames.walk || claudeStand,
  },
  // Legs don't animate: Claude uses the standing pose while walking/running.
  // (The [walk]/[walk2] frames in claude-sprite.txt are kept; put them back here to re-enable.)
  walk: [claudeStand],
};

/* ---- Laptop prop, front view (used by the Bug Attack game; the buddies use laptopSide below) ------------------------------ */
// Dark bezel, black screen with colourful code (like a code editor), two-tone base.
// Animated: the lid opens, then the code types out character by character with a
// cursor, the cursor blinks a few times when a "file" is done, and it loops.
// G bezel · D screen · P keyword (purple) · B blue · Y yellow · W text · C cursor (mint)
// K keyboard · k base shadow
const CODE = [            // what ends up on screen (10 px wide, D = empty, blank rows = line spacing)
  'PPDWWWWDDD',
  'DDDDDDDDDD',
  'DBBBDYYYDD',
  'DDDDDDDDDD',
  'DDWWWWDBBD',
];
const blankLine = 'DDDDDDDDDD';
// Laptop shape (14 × 11): lid with screen on top, wider keyboard deck below seen
// slightly from above (keys + trackpad), darker front edge.
const DECK = [
  '.KKKKKKKKKKKK.',   // hinge / back of the deck
  'KkKkKkKkKkKkKK',   // keys
  'KKkKkKkKkKkKKK',   // keys (offset row)
  'KKKKKTTTTKKKKK',   // trackpad
  'MMMMMMMMMMMMMM',   // front edge
];
const screen = (lines, cursorAt) => {
  const rows = lines.map(l => l.split(''));
  if (cursorAt) rows[cursorAt[0]][cursorAt[1]] = 'C';
  return ['.GGGGGGGGGGGG.', ...rows.map(r => `.G${r.join('')}G.`), ...DECK];
};
// Reveal the code 2 "characters" (pixels) at a time, skipping empty space.
function typingFrames() {
  const cells = [];
  CODE.forEach((line, r) => [...line].forEach((ch, c) => { if (ch !== 'D') cells.push([r, c]); }));
  const frames = [];
  const shown = CODE.map(() => blankLine.split(''));
  for (let i = 0; i <= cells.length; i += 2) {
    for (let j = Math.max(0, i - 2); j < i; j++) { const [r, c] = cells[j]; shown[r][c] = CODE[r][c]; }
    const next = cells[i];
    const cursor = next ? next : [CODE.length - 1, Math.min(9, cells.at(-1)[1] + 1)];
    frames.push(screen(shown.map(r => r.join('')), cursor));
  }
  // done: blink the cursor a few times, then the loop starts a fresh "file"
  const done = CODE;
  const end = [CODE.length - 1, Math.min(9, cells.at(-1)[1] + 1)];
  for (let k = 0; k < 3; k++) { frames.push(screen(done)); frames.push(screen(done, end)); }
  return frames;
}
const empty = '..............';
// closed: lid lying flat on the deck · half: lid tilting up
const closed = [empty, empty, empty, empty, empty, '.GGGGGGGGGGGG.', ...DECK];
const half = [empty, empty, empty, '.GGGGGGGGGGGG.', '.GDDDDDDDDDDG.', '.GGGGGGGGGGGG.', ...DECK];

export const laptop = {
  palette: {
    G: '#1c2030', D: '#06080f', P: '#a78bfa', B: '#5b8def', Y: '#f7d44a',
    W: '#dbe7ff', C: '#5cf2c8',
    K: '#c3c9d6', k: '#6f7789', T: '#a3aabb', M: '#5a6170',   // deck · keys · trackpad · front edge
  },
  opening: [closed, half],
  typing: typingFrames(),
};

/* ---- Emote icons (pop up next to a buddy's head) ------------------------- */
export const emotes = {
  '!': { palette: { Y: '#f7d44a' }, grid: ['YY', 'YY', 'YY', 'YY', '..', 'YY'] },
  '?': { palette: { B: '#5b8def' }, grid: ['.BBB.', 'B...B', '...B.', '..B..', '.....', '..B..'] },
  anger: { palette: { R: '#e5484d' }, grid: ['RR.RR', 'R...R', '.....', 'R...R', 'RR.RR'] },
  sweat: { palette: { B: '#7cc8ff', W: '#ffffff' }, grid: ['..B..', '.BBB.', 'BBWBB', 'BBBBB', '.BBB.'] },
  note: { palette: { P: '#a78bfa' }, grid: ['..PPP', '..P.P', '..P.P', 'PPP.P', 'PPP..'] },
  dots: { palette: { K: '#6f7789' }, grid: ['K.K.K'] },
  zz: { palette: { B: '#5b8def' }, grid: ['BBBB', '..B.', '.B..', 'BBBB'] },
  sparkle: { palette: { Y: '#f7d44a' }, grid: ['..Y..', '..Y..', 'YYYYY', '..Y..', '..Y..'] },
};

/* ---- Heart ---------------------------------------------------------------- */
export const heart = {
  palette: { R: '#ff5c8a', r: '#d63a68', w: '#ffd0dd' },
  grid: [
    '.RR.RR.',
    'RwRRRRR',
    'RRRRRRR',
    '.RRRRr.',
    '..RRr..',
    '...r...',
  ],
};

/* ---- World icons (hero card placeholders) -------------------------------- */
const ink = { '#': '#0d1226' };
export const worldIcons = {
  code: {
    palette: ink,
    grid: [
      '...#...#.#...',
      '..#....#..#..',
      '.#....#....#.',
      '#.....#.....#',
      '.#....#....#.',
      '..#..#....#..',
      '...#.#...#...',
    ],
  },
  create: {
    palette: ink,
    grid: [
      '....#....',
      '....#....',
      '...###...',
      '#########',
      '.#######.',
      '..#####..',
      '..##.##..',
      '.##...##.',
      '#.......#',
    ],
  },
  learn: {
    palette: ink,
    grid: [
      '.####.####.',
      '#....#....#',
      '#.##.#.##.#',
      '#....#....#',
      '#.##.#.##.#',
      '#....#....#',
      '.####.####.',
    ],
  },
};

/* ---- Bug Attack only: fighting poses + Super Saiyan June Vic ---------------- */
// side kick: the front leg shoots out at hip height (the other leg plants)
const vicKick = [...vicTop.slice(0, 17), '...PPPPPPPPPPPPK', '...PPP..........', '...KKK..........'];
// golden, spikier hair
const ssjTop = vicTop.map((r, i) => (i === 0 ? '..H.HH.HH.HH.H..' : i === 1 ? '..HHHHHHHHHHHH..' : r));
export const vicFight = {
  kick: vicKick,
  ssj: [...ssjTop, ...vicLegs],
  ssjKick: [...ssjTop.slice(0, 17), '...PPPPPPPPPPPPK', '...PPP..........', '...KKK..........'],
  ssjPalette: { ...vicPalette, H: '#f7c52b', h: '#fff3a0' },
};

/* ---- Costumes (wardrobe palettes + optional hat accessories) -------------- */
export const accessories = {
  partyHat: {
    palette: { Y: '#ffd54a', R: '#ff4d6d', C: '#4cc9f0', W: '#ffffff' },
    grid: [
      '..Y..',
      '.RRR.',
      '.CCC.',
      'RWRWR',
    ],
  },
  crown: {
    palette: { Y: '#ffd54a', y: '#d49b1a', R: '#ff4d6d', B: '#4cc9f0' },
    grid: [
      'Y..Y..Y',
      'YY.Y.YY',
      'YRYBYRY',
      'yyyyyyy',
    ],
  },
};

const vicCostumesRaw = [
  {
    id: 'classic',
    label: 'Classic Polo',
    quip: 'Back to the daily driver.',
    palette: vicPalette,
  },
  {
    id: 'hacker',
    label: 'Cyberpunk Hacker',
    quip: "I'm in.",
    palette: {
      ...vicPalette,
      H: '#151822', h: '#00ff88',
      B: '#1e2436', b: '#121622',
      W: '#00ff88',
      P: '#10131c', K: '#00cc66',
    },
  },
  {
    id: 'suit',
    label: 'Interview Suit',
    quip: 'Hired on the spot.',
    palette: {
      ...vicPalette,
      B: '#1c1f29', b: '#101218',
      W: '#f4f4f4',
      P: '#1c1f29', K: '#0b0c10',
    },
  },
  {
    id: 'cozy',
    label: 'Late-Night Hoodie',
    quip: 'Powered by caffeine and lo-fi.',
    palette: {
      ...vicPalette,
      B: '#9e3b4f', b: '#732636',
      W: '#e6c28b',
      P: '#2c313d', K: '#3b2d25',
    },
  },
  {
    id: 'ssj',
    label: 'Super Saiyan',
    quip: 'Over 9,000 commits!',
    palette: vicFight.ssjPalette,
    spikyHair: true,
  },
];

const claudeCostumesRaw = [
  {
    id: 'classic',
    label: 'Classic Orange',
    quip: 'Original recipe.',
    palette: claudePalette,
  },
  {
    id: 'terminal',
    label: 'Terminal Green',
    quip: '01100011 01101100 01100001 01110101 01100100 01100101',
    palette: { O: '#00e676', o: '#00994d', E: '#061a0e' },
  },
  {
    id: 'synthwave',
    label: 'Cyber Synthwave',
    quip: 'Aesthetic parameter: 1.0',
    palette: { O: '#ff4ecd', o: '#b3248c', E: '#00f5ff' },
  },
  {
    id: 'golden',
    label: 'Golden Shiny Crab',
    quip: '1 in 4,096 shiny chance!',
    palette: { O: '#ffd54a', o: '#d49b1a', E: '#2b1b00' },
    hat: 'crown',
  },
  {
    id: 'ninja',
    label: 'Midnight Ninja',
    quip: 'Silent. Deadly. Still no bugs.',
    palette: { O: '#262936', o: '#161822', E: '#ff4d6d' },
  },
  {
    id: 'party',
    label: 'Party Crab',
    quip: 'Is it my birthday again?!',
    palette: claudePalette,
    hat: 'partyHat',
  },
];

/* ---- Laptop prop (beside whoever is typing, SIDE view, shaded) ------------ */
// Side view with flat pixel shading: highlighted key tops, a mid-tone front, a shaded underside and a
// floor shadow; the lid is tilted back with a dark screen panel, a light shell and a shaded back, and
// glows mint toward the typist while little code dots float up.
// W highlight, K light, k mid, m shade, b outline, D screen, C glow, c soft glow, z floor shadow
// P pressed key, H/L/h hand (base / highlight / shade, set per buddy)
const LP_W = 14, LP_H = 12;
function laptopFrames() {
  const frames = [];
  const pairs = [[1, 5], [2, 6], [1, 6], [3, 7], [2, 5], [3, 6]];   // base columns the two hands hover over
  for (let i = 0; i < 12; i++) {
    const g = Array.from({ length: LP_H }, () => Array(LP_W).fill('.'));
    for (let c = 0; c <= 10; c++) {
      g[7][c] = c % 2 === 0 ? 'W' : 'K';        // key tops, lit from above
      g[8][c] = c === 10 ? 'm' : 'k';           // front of the keys / case
      g[9][c] = 'm';                            // shaded underside
      g[10][c] = 'b';                           // outline
    }
    for (let c = 2; c <= 12; c++) g[11][c] = 'z';   // shadow on the floor
    for (let r = 0; r <= 6; r++) {                  // lid, leaning back
      const L = 9 + Math.floor((6 - r) / 3);
      g[r][L] = r === 0 ? 'C' : 'D';              // screen panel (bright at the top edge)
      g[r][L + 1] = r === 0 ? 'W' : 'K';          // shell, highlighted at the corner
      g[r][L + 2] = 'm';                          // shaded back
      if (r < 6 && (r + i) % 3 !== 0) g[r][L - 1] = 'c';   // screen light spilling toward the typist, flickering
    }
    // code dots floating up from the screen
    const dot = (r, c) => { if (g[r]?.[c] === '.') g[r][c] = 'C'; };
    dot(5 - (i % 4), 6 + (i % 2));
    dot(3 - (i % 3), 7);
    const [a, b] = pairs[(i >> 1) % pairs.length];
    const leftTaps = i % 2 === 0;
    const hand = (c, down) => {
      const top = down ? 6 : 5;
      g[top][c] = 'L'; g[top][c + 1] = 'H'; g[top + 1][c] = 'H'; g[top + 1][c + 1] = 'h';
    };
    g[7][(leftTaps ? a : b) + 2] = 'P';
    hand(a, leftTaps);
    hand(b, !leftTaps);
    frames.push(g.map(r => r.join('')));
  }
  return frames;
}
export const laptopSide = {
  palette: {
    b: '#0d1226', W: '#ffffff', K: '#e8ecf5', k: '#aab6d3', m: '#7f8db0', D: '#1c2030',
    C: '#5cf2c8', c: 'rgba(92, 242, 200, 0.35)', z: 'rgba(13, 18, 38, 0.32)', P: '#5cf2c8',
    H: '#c98d64', L: '#e3ad85', h: '#a5694a',
  },
  width: LP_W,
  frames: laptopFrames(),
};

// Each costume gets matching highlight colours for the shaded hands and sleeves.
export const vicCostumes = vicCostumesRaw.map(c => ({
  ...c,
  palette: { ...c.palette, L: tone(c.palette.S, 1.2), l: tone(c.palette.B, 1.35) },
}));
export const claudeCostumes = claudeCostumesRaw.map(c => ({
  ...c,
  palette: { ...c.palette, L: tone(c.palette.O, 1.22) },
}));
