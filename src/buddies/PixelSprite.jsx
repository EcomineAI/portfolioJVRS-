import { memo } from 'react';

/**
 * Renders a string-grid sprite as crisp SVG rects.
 * Runs of the same color in a row are merged into one rect to keep the DOM small.
 */
function PixelSprite({ grid, palette, scale = 3, className }) {
  const h = grid.length;
  const w = Math.max(...grid.map(r => r.length));
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
      {rects}
    </svg>
  );
}

export default memo(PixelSprite);
