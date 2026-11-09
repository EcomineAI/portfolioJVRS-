// Original pixel sprites for the hero buddies (plan §6).
// Each sprite = equal-length strings; every character maps to a palette color, '.' = transparent.

/* ---- Vic: June Vic's avatar (colors picked from public/jv.png) ---------- */
export const vicPalette = {
  H: '#1b1512', // black hair
  h: '#3b2d25', // hair highlight
  S: '#c98d64', // skin
  s: '#a5694a', // skin shade
  E: '#1b1512', // eyes
  M: '#8a4b3a', // mouth
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
  '...SSSSssSSSS...',
  '...SSSMMMSSSS...',
  '....sSSSSSSs....',
  '.....sSSSSs.....',
  '....WWBSSBWW....',
  '..BBBBWBBWBBBB..',
  '.BBBBBBBBBBBBbB.',
  '.SBBBBBBBBBBBbS.',
  '.SbBBBBBBBBBBbS.',
  '...PPPPPPPPPP...',
];

export const vic = {
  palette: vicPalette,
  stand: [...vicTop, '...PPP....PPP...', '...KKK....KKK...'],
  walk: [
    [...vicTop, '..PPP......PPP..', '.KKK........KKK.'],
    [...vicTop, '....PPP..PPP....', '....KKK.KKK.....'],
  ],
};

/* ---- Claude: little orange critter -------------------------------------- */
export const claudePalette = {
  O: '#D97757', // body
  o: '#B85C3E', // shading
  w: '#F0A587', // highlight
  E: '#1d1410', // eyes
  L: '#8F4A33', // legs
};

const claudeTop = [
  '...OOOOOO...',
  '..OwwOOOOO..',
  '.OOOOOOOOOO.',
  '.OOEOOOOEOO.',
  '.OOEOOOOEOO.',
  'OOOOOOOOOOOO',
  '.OOOOOOOOOO.',
  '.oooooooooo.',
];

export const claude = {
  palette: claudePalette,
  stand: [...claudeTop, '..L.L..L.L..', '..L.L..L.L..'],
  walk: [
    [...claudeTop, '..L.L..L.L..', '..L.L..L.L..'],
    [...claudeTop, '.L.L..L.L...', '.L.L..L.L...'],
  ],
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
