import { memo } from 'react';

const RECT_CACHE = new WeakMap();
const MAX_ENTRIES_PER_PALETTE = 256;

function buildRects(grid, palette) {
  let byGrid = palette && typeof palette === 'object' ? RECT_CACHE.get(palette) : null;
  const key = grid.join('\n');
  if (byGrid) {
    const cached = byGrid.get(key);
    if (cached) return cached;
  }

  const rects = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const fill = palette[ch];
      if (ch !== '.' && fill) {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={fill} />);
      }
      x = end;
    }
  });

  if (palette && typeof palette === 'object') {
    if (!byGrid) {
      byGrid = new Map();
      RECT_CACHE.set(palette, byGrid);
    }
    if (byGrid.size >= MAX_ENTRIES_PER_PALETTE) byGrid.clear();
    byGrid.set(key, rects);
  }
  return rects;
}

function sameGrid(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

const areEqual = (a, b) =>
  a.scale === b.scale && a.className === b.className && a.palette === b.palette && sameGrid(a.grid, b.grid);

/**
 * Renders a string-grid sprite as crisp SVG rects.
 * Runs of the same color in a row are merged into one rect and cached per palette/grid.
 */
function PixelSprite({ grid, palette, scale = 3, className }) {
  const h = grid.length;
  const w = Math.max(...grid.map(r => r.length));
  return (
    <svg
      className={className}
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {buildRects(grid, palette)}
    </svg>
  );
}

export default memo(PixelSprite, areEqual);
