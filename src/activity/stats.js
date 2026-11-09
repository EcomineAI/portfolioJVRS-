// Pure helpers for the activity widget. No React, no DOM: also imported by
// scripts/fetch-contributions.mjs at build time.

export const WEEKS = 53;
export const KEEP_DAYS = 371; // 53 weeks of days kept in the JSON
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM-DD' → Date at UTC midnight (avoids timezone drift). */
export const parseDay = iso => new Date(`${iso}T00:00:00Z`);
export const isoDay = d => d.toISOString().slice(0, 10);
export function addDays(iso, n) {
  const d = parseDay(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return isoDay(d);
}

/** "Mar 4, 2026" */
export function formatDay(iso) {
  const d = parseDay(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export const contributionLabel = (count, iso) =>
  `${count} contribution${count === 1 ? '' : 's'} · ${formatDay(iso)}`;

/** Tooltip x (its centre) kept inside a box `width` wide; the tooltip is ≈ 280px wide. */
export function clampTipX(x, width, half = 140) {
  if (width <= half * 2) return width / 2;
  return Math.min(Math.max(x, half), width - half);
}

/** Normalise the API's `contributions` array: numbers, sorted ascending, no future dates. */
export function normalizeDays(raw, today = isoDay(new Date())) {
  return (raw || [])
    .map(d => ({ date: d.date, count: Number(d.count) || 0, level: Number(d.level) || 0 }))
    .filter(d => d.date && d.date <= today)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** All-time / 365 / 30-day totals, streaks, active days, busiest day. `days` sorted ascending. */
export function computeStats(days, today = isoDay(new Date())) {
  const byDate = new Map(days.map(d => [d.date, d.count]));
  const sumSince = n => {
    const from = addDays(today, -(n - 1));
    return days.reduce((s, d) => (d.date >= from && d.date <= today ? s + d.count : s), 0);
  };

  let longest = 0, run = 0, prev = null;
  for (const d of days) {
    if (d.count > 0) {
      run = prev && addDays(prev, 1) === d.date && byDate.get(prev) > 0 ? run + 1 : 1;
      longest = Math.max(longest, run);
    } else run = 0;
    prev = d.date;
  }

  // Current streak counts back from today, or from yesterday if today has nothing yet.
  let cursor = (byDate.get(today) || 0) > 0 ? today : addDays(today, -1);
  let current = 0;
  while ((byDate.get(cursor) || 0) > 0) { current++; cursor = addDays(cursor, -1); }

  const busiest = days.reduce((b, d) => (d.count > (b ? b.count : 0) ? d : b), null);
  return {
    allTime: days.reduce((s, d) => s + d.count, 0),
    last365: sumSince(365),
    last30: sumSince(30),
    longestStreak: longest,
    currentStreak: current,
    activeDays: days.filter(d => d.count > 0).length,
    busiestDay: busiest ? { date: busiest.date, count: busiest.count } : null,
  };
}

/** Same shape as src/data/contributions.json. */
export function buildSnapshot(apiJson, user, apiUrl, now = new Date()) {
  const today = isoDay(now);
  const all = normalizeDays(apiJson.contributions, today);
  const from = addDays(today, -(KEEP_DAYS - 1));
  return {
    generatedAt: now.toISOString(),
    user,
    sources: {
      github: { user, url: `https://github.com/${user}`, api: apiUrl },
      tryhackme: null,
    },
    days: all.filter(d => d.date >= from),
    stats: computeStats(all, today),
  };
}

/**
 * Level 0–4 relative to *my* busiest day (sqrt curve) so sparse data still shows contrast.
 * GitHub's own `level` is relative to everyone and would make most of my days look identical.
 */
export function scaleLevel(count, max) {
  if (!count || count <= 0 || !max) return 0;
  return Math.min(4, Math.max(1, Math.ceil(Math.sqrt(count / max) * 4)));
}

/**
 * 53 columns (weeks) × 7 rows (Sun→Sat). The last column holds the most recent day.
 * Returns { weeks: [[cell|null ×7] ×53], max, months: [{week, label}] }.
 * cell = { date, count, level, week, dow }.
 */
export function buildGrid(days) {
  if (!days.length) return { weeks: [], max: 0, months: [] };
  const end = days[days.length - 1].date;
  const endDow = parseDay(end).getUTCDay();
  const start = addDays(end, -(endDow + (WEEKS - 1) * 7));
  const byDate = new Map(days.map(d => [d.date, d.count]));
  const max = days.reduce((m, d) => Math.max(m, d.count), 0);

  const weeks = [];
  const months = [];
  let lastLabelWeek = -10;
  for (let w = 0; w < WEEKS; w++) {
    const col = [];
    for (let dow = 0; dow < 7; dow++) {
      const date = addDays(start, w * 7 + dow);
      if (date > end) { col.push(null); continue; }
      const count = byDate.get(date) || 0;
      col.push({ date, count, level: scaleLevel(count, max), week: w, dow });

      // Label a month on the week that contains its 1st day (or on the first column).
      const day = parseDay(date).getUTCDate();
      if ((day === 1 || (w === 0 && dow === 0)) && w - lastLabelWeek >= 3) {
        const label = MONTHS[parseDay(date).getUTCMonth()];
        // A partial first month right before a real month start would collide: skip it.
        if (!(w === 0 && day > 14)) { months.push({ week: w, label }); lastLabelWeek = w; }
      }
    }
    weeks.push(col);
  }
  return { weeks, max, months };
}

/** Monthly totals for the accessible table: [{ key:'2026-03', label:'Mar 2026', count, partial }]. */
export function monthlyTotals(days) {
  const map = new Map();
  for (const d of days) {
    const key = d.date.slice(0, 7);
    map.set(key, (map.get(key) || 0) + d.count);
  }
  const keys = [...map.keys()];
  return keys.map((key, i) => {
    const [y, m] = key.split('-').map(Number);
    return { key, label: `${MONTHS[m - 1]} ${y}`, count: map.get(key), partial: i === 0 || i === keys.length - 1 };
  });
}
