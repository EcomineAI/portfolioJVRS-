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
};

const vicTop = [
  '....HHHHHHH.....',
  '...HHHHHHHHHH...',
  '..HHHhHHHHHhHH..',
  '..HHHHHHHHHHHH..',
  '..HHSSHHSSSHHH..',
  '..HSSSSSSSSSSH..',
  '..HSEESSSEESSH..',
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

const vicLegs = ['...PPP....PPP...', '...KKK....KKK...'];
const vicStand = [...vicTop, ...vicLegs];

// Wave: the right hand (viewer's right) comes up beside the face and swings
// between two positions. The hand that was at the side is removed.
const armUp = [[13, 14, 'B'], [15, 14, '.'], [16, 14, '.']];
const vicWave = [
  setPx(vicStand, [...armUp, [8, 14, 'S'], [9, 14, 'S'], [10, 14, 'B'], [11, 14, 'B'], [12, 14, 'B']]),
  setPx(vicStand, [...armUp, [7, 15, 'S'], [8, 15, 'S'], [9, 14, 'B'], [10, 14, 'B'], [11, 14, 'B'], [12, 14, 'B']]),
];

export const vic = {
  palette: vicPalette,
  blinkChar: 's',            // eyes → skin-shade line while blinking
  stand: vicStand,
  poses: { wave: vicWave },  // array of frames = animated pose
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

export const claude = {
  palette: claudePalette,
  blinkChar: 'o',
  stand: claudeStand,
  poses: {
    nap: claudeFrames.nap || claudeStand,
    // typing: eyes on the laptop, arms tapping in turn
    laptop: [claudeFrames.type1 || claudeStand, claudeFrames.type2 || claudeStand],
  },
  // 4-legged gait: frame A and frame B alternate which pair of legs is down
  walk: [claudeFrames.walk || claudeStand, claudeFrames.walk2 || claudeStand],
};

/* ---- Laptop prop (Claude's "Laptop" action) ------------------------------ */
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
const screen = (lines, cursorAt) => {
  const rows = lines.map(l => l.split(''));
  if (cursorAt) rows[cursorAt[0]][cursorAt[1]] = 'C';
  return ['GGGGGGGGGGGG', ...rows.map(r => `G${r.join('')}G`), 'GGGGGGGGGGGG', 'KKKKKKKKKKKK', '.kkkkkkkkkk.'];
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
const closed = ['............', '............', '............', '............', '............', '............', 'GGGGGGGGGGGG', 'KKKKKKKKKKKK', '.kkkkkkkkkk.'];
const half = ['............', '............', '............', '............', 'GGGGGGGGGGGG', 'GDDDDDDDDDDG', 'GGGGGGGGGGGG', 'KKKKKKKKKKKK', '.kkkkkkkkkk.'];

export const laptop = {
  palette: {
    G: '#1c2030', D: '#06080f', P: '#a78bfa', B: '#5b8def', Y: '#f7d44a',
    W: '#dbe7ff', C: '#5cf2c8', K: '#b6bdcc', k: '#7d8597',
  },
  opening: [closed, half],
  typing: typingFrames(),
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
