// Tiny 8x8 pixel-art gadgets, drawn as crisp SVG rects. Used as the icons on the journey stepping stones.
const COLORS = {
  k: '#1f1f26', w: '#f5f2e8', b: '#3d7bff', g: '#5dff8f', y: '#ffd44a',
  r: '#d8404a', p: '#ff8fc0', o: '#d98a3d', s: '#b9c0cc',
};

const SPRITES = {
  laptop: [
    '........',
    '.kkkkkk.',
    '.kbbbbk.',
    '.kbwwbk.',
    '.kbbbbk.',
    '.kkkkkk.',
    'kssssssk',
    'kkkkkkkk',
  ],
  terminal: [
    'kkkkkkkk',
    'krygkkkk',
    'kkkkkkkk',
    'kgkkkkkk',
    'kkgkgggk',
    'kgkkkkkk',
    'kkkkkkkk',
    '........',
  ],
  chip: [
    '..k..k..',
    '.kkkkkk.',
    'kkbbbbkk',
    '.kbwwbk.',
    '.kbwwbk.',
    'kkbbbbkk',
    '.kkkkkk.',
    '..k..k..',
  ],
  badge: [
    '..kkkk..',
    '..k..k..',
    '.kkkkkk.',
    '.kwwwwk.',
    '.kwbbwk.',
    '.kwwwwk.',
    '.kwsswk.',
    '.kkkkkk.',
  ],
  bubble: [
    '.kkkkkk.',
    'kwwwwwwk',
    'kwkwkwwk',
    'kwwwwwwk',
    '.kkwkkk.',
    '..kwk...',
    '...kk...',
    '........',
  ],
  trophy: [
    'kkkkkkkk',
    'kyyyyyyk',
    'kyyyyyyk',
    '.kyyyyk.',
    '..kyyk..',
    '...kk...',
    '..kyyk..',
    '.kkkkkk.',
  ],
  briefcase: [
    '..kkkk..',
    '..k..k..',
    'kkkkkkkk',
    'kooooook',
    'kkkyykkk',
    'kooooook',
    'kooooook',
    'kkkkkkkk',
  ],
  robot: [
    '...kk...',
    '...rk...',
    '.kkkkkk.',
    'kwwwwwwk',
    'kwbwwbwk',
    'kwwwwwwk',
    'kwkkkkwk',
    '.kkkkkk.',
  ],
  scissors: [
    'kk...kk.',
    'kpk.kpk.',
    'kkk.kkk.',
    '..kkk...',
    '..kkk...',
    '.kk.kk..',
    'kpk.kpk.',
    'kk...kk.',
  ],
  medal: [
    '.rr..rr.',
    '..rkkr..',
    '.kyyyyk.',
    'kyywwyyk',
    'kyywwyyk',
    '.kyyyyk.',
    '..kkkk..',
    '........',
  ],
};

export default function PixelGadget({ name, size = 48 }) {
  const rows = SPRITES[name] || SPRITES.chip;
  const rects = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (c === '.') { x += 1; continue; }
      let end = x + 1;
      while (end < row.length && row[end] === c) end += 1;
      rects.push(<rect key={`${y}-${x}`} x={x} y={y} width={end - x} height="1" fill={COLORS[c]} />);
      x = end;
    }
  });
  return (
    <svg className="pixel-gadget" viewBox="0 0 8 8" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  );
}
