// Fetches my GitHub contribution calendar at build time (runs as `prebuild`) and writes
// src/data/contributions.json. If the fetch fails, the last committed JSON is kept (exit 0)
// so the build never breaks because a third-party API is down. Node 18+ (global fetch).
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSnapshot } from '../src/activity/stats.js';

const USER = 'EcomineAI';
const API = `https://github-contributions-api.jogruber.de/v4/${USER}?y=all`;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/contributions.json');

async function main() {
  const res = await fetch(API, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json.contributions)) throw new Error('unexpected response shape');

  const snap = buildSnapshot(json, USER, API);
  await writeFile(OUT, JSON.stringify(snap, null, 2) + '\n');
  const s = snap.stats;
  console.log(
    `[contributions] wrote ${snap.days.length} days · ${s.allTime} all-time · ${s.last365} last 365d · ` +
    `${s.last30} last 30d · longest streak ${s.longestStreak}d · current ${s.currentStreak}d · ${s.activeDays} active days`,
  );
}

main().catch(err => {
  console.warn(`[contributions] fetch failed (${err.message}); keeping existing src/data/contributions.json`);
  process.exitCode = 0;
});
