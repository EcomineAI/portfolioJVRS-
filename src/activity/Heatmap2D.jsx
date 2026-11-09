// 2D contribution heatmap: 53 weeks × 7 days (Sun→Sat), primary-blue ramp.
// Keyboard: the grid is ONE tab stop (roving tabindex); arrow keys move between days.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { clampTipX, contributionLabel } from './stats.js';

const DOW = [
  { short: '', full: 'Sunday' },
  { short: 'Mon', full: 'Monday' },
  { short: '', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: '', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: '', full: 'Saturday' },
];

function lastCell(weeks) {
  for (let w = weeks.length - 1; w >= 0; w--) {
    for (let d = 6; d >= 0; d--) if (weeks[w][d]) return { w, d };
  }
  return { w: 0, d: 0 };
}

export default function Heatmap2D({ grid }) {
  const { weeks, months } = grid;
  const wrapRef = useRef(null);
  const scrollRef = useRef(null);
  const cellRefs = useRef(new Map());
  const [active, setActive] = useState(() => lastCell(weeks));
  const [tip, setTip] = useState(null);

  // Keep the roving cell valid when data is swapped in.
  useEffect(() => { setActive(lastCell(weeks)); }, [weeks]);

  // Mobile: start scrolled to the most recent weeks (scrolls the grid's own box, not the page).
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const showTip = useCallback(el => {
    const wrap = wrapRef.current;
    if (!el || !wrap) return;
    const w = Number(el.dataset.w), d = Number(el.dataset.d);
    const cell = weeks[w]?.[d];
    if (!cell) return;
    const r = el.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    setTip({ text: contributionLabel(cell.count, cell.date), x: r.left - wr.left + r.width / 2, y: r.top - wr.top, wrapW: wr.width });
  }, [weeks]);

  const onKeyDown = e => {
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    let { w, d } = active;
    if (moves[e.key]) {
      const [dw, dd] = moves[e.key];
      w += dw; d += dd;
    } else if (e.key === 'Home') {
      w = 0;
    } else if (e.key === 'End') {
      w = weeks.length - 1;
      while (w > 0 && !weeks[w][d]) w--;
    } else return;
    e.preventDefault();
    if (!weeks[w]?.[d]) return; // edge of the grid or a future day
    setActive({ w, d });
    const el = cellRefs.current.get(`${w}-${d}`);
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      showTip(el);
    }
  };

  const onOver = e => {
    const el = e.target.closest('[data-w]');
    if (el) showTip(el);
  };

  const rows = useMemo(() => DOW.map((_, d) => weeks.map(col => col[d])), [weeks]);

  // Keep the tooltip inside the panel horizontally.
  const tipStyle = tip && { left: clampTipX(tip.x, tip.wrapW), top: tip.y };

  return (
    <div className="heatmap" ref={wrapRef} onMouseLeave={() => setTip(null)}>
      <div className="heatmap__scroll" ref={scrollRef}>
        <div className="heatmap__inner" style={{ '--weeks': weeks.length }}>
          <div className="heatmap__months" aria-hidden="true">
            {months.map(m => (
              <span key={`${m.week}-${m.label}`} style={{ gridColumn: m.week + 2 }}>{m.label}</span>
            ))}
          </div>
          <div
            role="grid"
            aria-label="Daily GitHub contributions, last 53 weeks. Use arrow keys to move between days."
            className="heatmap__grid"
            onKeyDown={onKeyDown}
            onMouseOver={onOver}
            onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setTip(null); }}
          >
            {rows.map((row, d) => (
              <div role="row" className="heatmap__row" key={d}>
                <span role="rowheader" className="heatmap__dow">
                  <span aria-hidden="true">{DOW[d].short}</span>
                  <span className="sr-only">{DOW[d].full}</span>
                </span>
                {row.map((cell, w) =>
                  cell ? (
                    <span
                      key={w}
                      role="gridcell"
                      ref={el => { if (el) cellRefs.current.set(`${w}-${d}`, el); else cellRefs.current.delete(`${w}-${d}`); }}
                      className="heatmap__cell"
                      data-level={cell.level}
                      data-w={w}
                      data-d={d}
                      tabIndex={active.w === w && active.d === d ? 0 : -1}
                      aria-label={contributionLabel(cell.count, cell.date)}
                      onFocus={e => { setActive({ w, d }); showTip(e.currentTarget); }}
                    />
                  ) : (
                    <span key={w} role="gridcell" className="heatmap__cell heatmap__cell--empty" aria-hidden="true" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {tip && (
        <div className="activity-tip" style={tipStyle} aria-hidden="true">{tip.text}</div>
      )}
    </div>
  );
}
