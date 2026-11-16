// "// LIVE ACTIVITY: GITHUB" panel (plan §6b).
// Renders instantly from the build-time snapshot, then quietly refetches and swaps in newer data.
import { useEffect, useMemo, useRef, useState } from 'react';
import { PixelCard } from '../components/ui/index.jsx';
import snapshot from '../data/contributions.json';
import Heatmap2D from './Heatmap2D.jsx';
import Skyline3D from './Skyline3D.jsx';
import { buildGrid, buildSnapshot, formatDay, monthlyTotals } from './stats.js';
import './activity.css';

const VIEW_KEY = 'activity-view';
const VIEWS = [
  { id: '2d', label: '2D' },
  { id: '3d', label: '3D Skyline' },
];

function initialView() {
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === '2d' || saved === '3d') return saved;
  } catch { /* storage blocked */ }
  return window.matchMedia?.('(max-width: 640px)').matches ? '2d' : '3d';
}

const fmt = n => Number(n || 0).toLocaleString('en-US');

export default function ActivityPanel({ headingLevel: Heading = 'h3', id = 'activity-title' }) {
  const [data, setData] = useState(snapshot);
  const [view, setView] = useState(initialView);
  const radios = useRef([]);

  // Optional freshness: refetch at runtime (API allows CORS). Never blocks render; failures are silent.
  useEffect(() => {
    const api = snapshot.sources?.github?.api;
    if (!api || typeof fetch !== 'function') return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(api, { signal: ctrl.signal });
        if (!res.ok) return;
        const json = await res.json();
        if (!Array.isArray(json.contributions)) return;
        const fresh = buildSnapshot(json, snapshot.user, api);
        const lastOld = snapshot.days.at(-1)?.date || '';
        const lastNew = fresh.days.at(-1)?.date || '';
        if (fresh.days.length && (lastNew > lastOld || fresh.stats.allTime !== snapshot.stats.allTime)) setData(fresh);
      } catch { /* offline or API down: keep the snapshot */ }
    }, 1500);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, []);

  const grid = useMemo(() => buildGrid(data.days), [data.days]);
  const months = useMemo(() => monthlyTotals(data.days), [data.days]);
  const s = data.stats;
  const profileUrl = data.sources?.github?.url || `https://github.com/${data.user}`;

  const choose = next => {
    setView(next);
    try { localStorage.setItem(VIEW_KEY, next); } catch { /* ignore */ }
  };

  const onRadioKey = (e, i) => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + VIEWS.length) % VIEWS.length;
    choose(VIEWS[next].id);
    radios.current[next]?.focus();
  };

  const summary =
    `${fmt(s.last365)} GitHub contributions in the last year and ${fmt(s.allTime)} all-time. ` +
    `${fmt(s.last30)} in the last 30 days, ${s.activeDays} active days, longest streak ${s.longestStreak} days, ` +
    `current streak ${s.currentStreak} days` +
    (s.busiestDay ? `. Busiest day: ${formatDay(s.busiestDay.date)} with ${s.busiestDay.count} contributions.` : '.');

  return (
    <PixelCard as="section" className="activity" data-view={view} aria-labelledby={id} data-spray-surface="true">
      <header className="activity__head">
        <Heading id={id} className="activity__title">
          <span className="activity__dot" aria-hidden="true" />
          <span>
            GitHub activity
          </span>
        </Heading>
        <span className="activity__badge">{fmt(s.allTime)} all-time</span>

        <div className="activity__toggle" role="radiogroup" aria-label="Activity view">
          {VIEWS.map((v, i) => (
            <button
              key={v.id}
              ref={el => { radios.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={view === v.id}
              tabIndex={view === v.id ? 0 : -1}
              className="activity__radio"
              onClick={() => choose(v.id)}
              onKeyDown={e => onRadioKey(e, i)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </header>

      <p className="sr-only">{summary}</p>

      {/* key={view} remounts the body so the enter animation (activity.css) plays on every switch */}
      <div className="activity__body" key={view} data-view={view}>
        {view === '3d' ? <Skyline3D grid={grid} /> : <Heatmap2D grid={grid} />}
      </div>

      <footer className="activity__foot">
        <p className="activity__stats">
          <span><strong>{fmt(s.last365)}</strong> events (365d)</span>
          <span aria-hidden="true">·</span>
          <span><strong>{s.longestStreak}d</strong> longest streak</span>
          <span aria-hidden="true">·</span>
          <span><strong>{fmt(s.last30)}</strong> last 30 days</span>
        </p>
        <div className="activity__legend" aria-hidden="true">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(l => <span key={l} className="activity__swatch" data-level={l} />)}
          <span>More</span>
        </div>
        <div className="activity__links">
          <a className="activity__link" href={profileUrl} target="_blank" rel="noopener noreferrer">
            View on GitHub <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </footer>

      <details className="activity__table">
        <summary>View as table</summary>
        <table>
          <caption className="sr-only">GitHub contributions per month, last 53 weeks</caption>
          <thead>
            <tr><th scope="col">Month</th><th scope="col">Contributions</th></tr>
          </thead>
          <tbody>
            {months.map(m => (
              <tr key={m.key}>
                <th scope="row">{m.label}{m.partial ? ' (partial)' : ''}</th>
                <td>{fmt(m.count)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th scope="row">Total</th><td>{fmt(months.reduce((t, m) => t + m.count, 0))}</td></tr>
          </tfoot>
        </table>
        <p className="activity__note">
          Snapshot from {formatDay(data.generatedAt.slice(0, 10))}. Shading is relative to my busiest day.
        </p>
      </details>
    </PixelCard>
  );
}
