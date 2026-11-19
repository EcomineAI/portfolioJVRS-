// Spray engine: physics + rendering for the spray layer (plan §5).
// Plain JS, no React. Everything is stored in DOCUMENT coordinates and drawn
// offset by the current scroll, so paint stays attached to the content.
//
// Modes
//   string   silly string: ONE continuous rope per spray (never breaks off) that
//            drapes over headings, cards and section lines and snags on their edges
//   paint    mist + drips that run down and pool on headings
//   sand     grains that pour, pile up and slide off ledges
//   confetti flakes that flutter down and settle
//   letters  characters of my name tumbling onto headings
// Settings
//   can      sprite + spray width (classic · graffiti · marker · crosshair)
//   flow     physics preset (balanced · curly · heavy · floaty · chaos)
//   palette  colors (section · neon · ink · print)
// Reduced motion: no physics; every mode leaves static marks.

import { sprayBus } from './sprayBus.js';

const GRID = 4;               // one pixel of the pixel-art grid
const STEP = 1000 / 60;       // fixed physics timestep (60 Hz)
const SEG = 6;                // rest length between rope points
const MAX_STRAND = 700;       // one spray = one continuous string; past this its far end is trimmed
const MAX_STRANDS = 40;
const MAX_POINTS = 3200;
const STRING_W = 3;           // line width of the silly string (px)
const STRING_R = 2;           // collision radius: it rests ON edges, not inside them
const MAX_DOTS = 4000;
const MAX_PARTICLES = 900;
const MAX_LETTERS = 400;
const ITERATIONS = 4;
const SLEEP_SPEED = 0.06;
const SLEEP_FRAMES = 40;
const HOLD_SHAKE_MS = 280;
const LETTER_FONT = '18px "VT323", ui-monospace, monospace';
const LETTER_TEXT = 'JUNEVICABELLO</>{};=+*';

export const MODES = ['string', 'paint', 'sand', 'confetti', 'letters'];

/** Physics presets. `spread` = half-angle of the emission fan (radians). */
export const FLOWS = {
  balanced: { gravity: 0.32, damping: 0.985, speed: [6.5, 9.5], spread: 1.25, curl: 0, jitter: 0.12 },
  curly:    { gravity: 0.2,  damping: 0.988, speed: [5, 7.5],   spread: 1.1,  curl: 0.42, jitter: 0.05 },
  heavy:    { gravity: 0.65, damping: 0.97,  speed: [4.5, 6.5], spread: 0.9,  curl: 0, jitter: 0.08 },
  floaty:   { gravity: 0.07, damping: 0.994, speed: [3, 5],     spread: 1.4,  curl: 0.08, jitter: 0.2 },
  chaos:    { gravity: 0.3,  damping: 0.98,  speed: [3, 13],    spread: Math.PI, curl: 0.6, jitter: 0.6 },
};

// Sprites: N nozzle · K cap (paint color) · O outline · B body · W shine · P label (paint color)
const SPRITES = {
  classic: [
    'NNN.......',
    '..NKKK....',
    '...KKKK...',
    '..OOOOOO..',
    '.OBBBBBBO.',
    '.OWBBBBBO.',
    '.OWBBBBBO.',
    '.OPPPPPPO.',
    '.OPWPPPPO.',
    '.OPPPPPPO.',
    '.OWBBBBBO.',
    '.OBBBBBBO.',
    '.OBBBBBBO.',
    '..OOOOOO..',
  ],
  graffiti: [
    'NNNN........',
    '...NKKKK....',
    '...KKKKKK...',
    '..OOOOOOOO..',
    '.OBBBBBBBBO.',
    '.OWBPPPPBBO.',
    '.OWPPPPPPBO.',
    '.OWPPWPPPBO.',
    '.OWPPPPPPBO.',
    '.OWBPPPPBBO.',
    '.OBBBBBBBBO.',
    '.OBBBBBBBBO.',
    '..OOOOOOOO..',
  ],
  marker: [
    'KK......',
    'KKO.....',
    '.OBO....',
    '..OWBO..',
    '...OBBO.',
    '....OPPO',
    '.....OPP',
    '......OO',
  ],
};

/** Can = look + how wide it sprays. */
export const CANS = {
  classic:   { sprite: 'classic',  scale: 3, radius: 12, density: 1,   fan: 1 },
  graffiti:  { sprite: 'graffiti', scale: 3, radius: 22, density: 2,   fan: 1.3 },
  marker:    { sprite: 'marker',   scale: 3, radius: 4,  density: 0.6, fan: 0.45 },
  crosshair: { sprite: null,       scale: 3, radius: 8,  density: 1,   fan: 0.8 },
};

/** Palettes. Names are CSS-variable keys (see COLOR_VARS) or literal colors. */
export const PALETTES = {
  section: null, // color of the page section under the pointer
  neon: ['#39ff14', '#ff2bd6', '#00e5ff', '#fff200'],
  ink: ['fg', 'primary', 'create'],
  print: ['fg', 'primary', 'create', 'code', 'learn'],
};

const COLOR_VARS = {
  code: '--world-code',
  create: '--world-create',
  learn: '--world-learn',
  primary: '--primary-soft',
  fg: '--fg',
};
const FALLBACK = {
  code: '#166534', create: '#b91c1c', learn: '#a14d05', primary: '#1d4ed8',
  fg: '#141414', card: '#fcfbf8', muted: '#4a4843',
};

const snap = v => Math.round(v / GRID) * GRID;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export class SprayEngine {
  constructor(paintCanvas, canCanvas) {
    this.paint = paintCanvas;
    this.can = canCanvas;
    this.pctx = paintCanvas.getContext('2d');
    this.cctx = canCanvas.getContext('2d');

    this.mode = 'string';
    this.canId = 'classic';
    this.flowId = 'balanced';
    this.palette = 'section';
    this.reduced = false;
    this.hidden = false;

    this.strands = [];       // { pts: [{x,y,px,py}], color, pinned, sleep, still, curl }
    this.drips = [];         // { x, y, vy, left, color, lastY }
    this.particles = [];     // { kind, x, y, vx, vy, color, ch?, phase }
    this.letters = [];       // settled letters { x, y, ch, color }
    this.sucked = [];        // paint bits / air flying into the vacuum { sx, sy, tx, ty, t, color, air }
    this.dots = new Map();   // "x,y" -> color (insertion order = age)
    this.targets = [];       // [{ l, t, r, b }] document coords
    this.docW = 0;
    this.docH = 0;

    this.spraying = false;
    this.pointer = { x: 0, y: 0 };   // client coords
    this.active = null;              // strand currently being emitted
    this.strandDir = 0;
    this.nextStrandAt = 0;
    this.lastDripAt = 0;
    this.lastDotsAt = 0;
    this.lastEmitAt = 0;
    this.letterIndex = 0;
    this.shakeUntil = 0;
    this.sprayColor = 'primary';
    this.colorIndex = -1;

    this.raf = 0;
    this.lastTick = 0;
    this.acc = 0;
    this.wasBusy = false;
    this.tick = this.tick.bind(this);
    this.colors = { ...FALLBACK };
    this.readColors();
    this.resize();
    sprayBus.attach(this);
  }

  get flow() { return FLOWS[this.flowId] || FLOWS.balanced; }
  get canCfg() { return CANS[this.canId] || CANS.classic; }

  // ---- configuration -------------------------------------------------------
  readColors() {
    const cs = getComputedStyle(document.documentElement);
    const get = (name, fb) => cs.getPropertyValue(name).trim() || fb;
    for (const [k, v] of Object.entries(COLOR_VARS)) this.colors[k] = get(v, FALLBACK[k]);
    this.colors.card = get('--card', FALLBACK.card);
    this.colors.muted = get('--muted-fg', FALLBACK.muted);
    this.requestFrame();
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    for (const [c, ctx] of [[this.paint, this.pctx], [this.can, this.cctx]]) {
      c.width = Math.round(this.w * dpr);
      c.height = Math.round(this.h * dpr);
      c.style.width = `${this.w}px`;
      c.style.height = `${this.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }
    this.requestFrame();
  }

  setTargets(rects, docW, docH) {
    // Re-measured on scroll too: only react when the layout really changed (≥ 1px),
    // otherwise settled paint would wake up and creep every time you scroll.
    const prev = this.targets;
    const same = prev.length === rects.length && prev.every((o, i) => {
      const n = rects[i];
      return o.el === n.el && Math.abs(o.l - n.l) < 1 && Math.abs(o.t - n.t) < 1 && Math.abs(o.r - n.r) < 1 && Math.abs(o.b - n.b) < 1;
    });
    this.docW = docW;
    this.docH = docH;
    if (same) return;
    this.reflow(prev, rects);
    this.targets = rects;
    for (const s of this.strands) { s.sleep = false; s.still = 0; }
    this.requestFrame();
  }

  /**
   * The page reflowed (window resized, fonts loaded…): headings and cards moved, so
   * move the paint with them. Every piece of paint belongs to the target nearest to
   * it (paint sits on/around headings) and keeps its place relative to that target:
   * same offset from its top edge, same fraction across its width (and the same
   * distance past its edge if it hangs over the side). Whole strands move together.
   */
  reflow(prev, next) {
    if (!prev.length || !next.length) return;
    if (!this.dots.size && !this.strands.length && !this.letters.length && !this.drips.length && !this.particles.length) return;
    const byEl = new Map();
    for (const r of next) if (r.el) byEl.set(r.el, r);
    const owners = [];
    let moved = false;
    for (const o of prev) {
      const n = o.el && byEl.get(o.el);
      if (!n) continue;   // target is gone (e.g. hidden at this width): its paint stays put
      if (n.l !== o.l || n.t !== o.t || n.r !== o.r || n.b !== o.b) moved = true;
      owners.push({ o, n });
    }
    if (!moved || !owners.length) return;

    const ownerOf = (x, y) => {
      let best = null, bestD = Infinity;
      for (const w of owners) {
        const r = w.o;
        const dx = Math.max(r.l - x, 0, x - r.r);
        const dy = y < r.t ? (r.t - y) * 0.7 : Math.max(0, y - r.b);   // paint mostly sits on top
        const d = dx + dy;
        if (d < bestD) { bestD = d; best = w; }
      }
      return best;
    };
    const mapX = ({ o, n }, x) => {
      if (x < o.l) return n.l - (o.l - x);
      if (x > o.r) return n.r + (x - o.r);
      const ow = o.r - o.l;
      return ow > 0 ? n.l + ((x - o.l) / ow) * (n.r - n.l) : n.l;
    };
    const mapY = ({ o, n }, y) => (y > o.b ? y + (n.b - o.b) : y + (n.t - o.t));
    const movePoint = (p, w = ownerOf(p.x, p.y)) => {
      if (!w) return;
      const x = mapX(w, p.x), y = mapY(w, p.y);
      if ('px' in p) { p.px += x - p.x; p.py += y - p.y; }
      p.x = x; p.y = y;
    };

    // static dots: rebuild the grid map at the new positions (keeps age order)
    if (this.dots.size) {
      const old = [...this.dots];
      this.dots.clear();
      for (const [key, color] of old) {
        const c = key.indexOf(',');
        const p = { x: +key.slice(0, c), y: +key.slice(c + 1) };
        movePoint(p);
        this.dots.set(`${snap(p.x)},${snap(p.y)}`, color);
      }
    }
    for (const s of this.strands) {
      if (!s.pts.length || s === this.active) continue;
      const mid = s.pts[Math.floor(s.pts.length / 2)];
      const w = ownerOf(mid.x, mid.y);
      for (const p of s.pts) movePoint(p, w);
      s.sleep = false; s.still = 0;
    }
    for (const d of this.drips) { movePoint(d); d.lastY = null; }
    for (const p of this.particles) movePoint(p);
    for (const l of this.letters) { movePoint(l); l.x = snap(l.x); l.y = snap(l.y); }
    if (this.letters.length) this.dropUnsupported();
  }

  setMode(mode) { this.mode = MODES.includes(mode) ? mode : 'string'; }
  setCan(id) { this.canId = CANS[id] ? id : 'classic'; this.requestFrame(); }
  setFlow(id) { this.flowId = FLOWS[id] ? id : 'balanced'; }
  setColor(id) { this.palette = id in PALETTES ? id : 'section'; this.colorIndex = -1; }
  setReducedMotion(on) { this.reduced = !!on; }

  setHidden(hidden) {
    this.hidden = hidden;
    if (hidden) {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.lastTick = 0;
      this.acc = 0;
      this.wasBusy = false;
      this.end();
    } else {
      this.requestFrame();
    }
  }

  resolveColor(key) {
    if (key && this.colors[key]) return this.colors[key];
    if (typeof key === 'string' && (key[0] === '#' || key.startsWith('rgb') || key.startsWith('hsl'))) return key;
    return this.colors.primary;
  }

  /** Color of the page section under the pointer (Code / Create / Learn), else theme inks. */
  sectionColor() {
    const el = document.elementFromPoint(this.pointer.x, this.pointer.y);
    const world = el?.closest?.('[data-world]')?.dataset.world
      || el?.closest?.('section[id]')?.id;
    if (world === 'code' || world === 'create' || world === 'learn') return world;
    const inks = ['primary', 'code', 'create', 'learn'];
    this.colorIndex = (this.colorIndex + 1) % inks.length;
    return inks[this.colorIndex];
  }

  nextColor() {
    const list = PALETTES[this.palette];
    if (!list) return this.sectionColor();
    this.colorIndex = (this.colorIndex + 1) % list.length;
    return list[this.colorIndex];
  }

  // ---- input ---------------------------------------------------------------
  begin(clientX, clientY) {
    this.spraying = true;
    this.pointer.x = clientX;
    this.pointer.y = clientY;
    this.sprayColor = this.nextColor();
    this.shakeUntil = performance.now() + HOLD_SHAKE_MS;
    sprayBus.emit('start', { mode: this.mode });
    this.active = null;
    this.nextStrandAt = 0;
    this.lastDripAt = 0;
    this.lastDotsAt = 0;
    this.lastEmitAt = 0;
    this.requestFrame();
  }

  move(clientX, clientY) {
    this.pointer.x = clientX;
    this.pointer.y = clientY;
    if (this.spraying) this.requestFrame();
  }

  end() {
    if (!this.spraying) return;
    this.spraying = false;
    sprayBus.emit('end', { mode: this.mode });
    if (this.active) this.active.pinned = false;
    this.active = null;
    this.requestFrame();
  }

  clear() {
    this.strands = [];
    this.drips = [];
    this.particles = [];
    this.letters = [];
    this.dots.clear();
    this.sucked = [];
    this.active = null;
    this.requestFrame();
  }

  /** Scrolling just redraws: paint is stored in page coordinates, so it stays
      exactly where it landed (no swinging). */
  onScroll() {
    this.requestFrame();
  }

  // ---- loop ----------------------------------------------------------------
  requestFrame() {
    if (!this.raf && !this.hidden) this.raf = requestAnimationFrame(this.tick);
  }

  tick(now) {
    this.raf = 0;
    if (!this.lastTick || now - this.lastTick > 100) {
      this.lastTick = now;
      this.acc = STEP;
    } else {
      this.acc = Math.min(this.acc + (now - this.lastTick), STEP * 3);
      this.lastTick = now;
    }
    let stepped = false;
    let busy = this.wasBusy;
    while (this.acc >= STEP - 1) {
      busy = this.update(now);
      this.acc = Math.max(0, this.acc - STEP);
      stepped = true;
      if (!busy) { this.acc = 0; break; }
    }
    this.wasBusy = busy;
    this.draw(now);
    if (busy || (!stepped && this.wasBusy)) this.requestFrame();
    else this.lastTick = 0;
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    sprayBus.detach(this);
  }

  // ---- buddies: count / vacuum paint (page coordinates) -------------------
  /** How much paint is inside the box { l, t, r, b }. */
  countIn(box) {
    const inBox = (x, y) => x >= box.l && x <= box.r && y >= box.t && y <= box.b;
    let n = 0;
    for (const key of this.dots.keys()) {
      const c = key.indexOf(',');
      if (inBox(+key.slice(0, c), +key.slice(c + 1))) n++;
    }
    for (const s of this.strands) for (const p of s.pts) if (inBox(p.x, p.y)) n++;
    for (const l of this.letters) if (inBox(l.x, l.y)) n += 3;
    for (const p of this.particles) if (inBox(p.x, p.y)) n++;
    return n;
  }

  /** Remove paint for which hit(x, y) is true. Strings are cut where the
      sucked-up part was (the pieces left over stay where they are). */
  removeWhere(hit, collect = null) {
    let n = 0;
    for (const [key, color] of [...this.dots]) {
      const c = key.indexOf(',');
      const x = +key.slice(0, c) + GRID / 2, y = +key.slice(c + 1) + GRID / 2;
      if (hit(x, y)) { this.dots.delete(key); n++; collect?.(x, y, color); }
    }
    const strands = [];
    for (const s of this.strands) {
      if (s === this.active) { strands.push(s); continue; }
      let piece = [];
      const pieces = [];
      for (const p of s.pts) {
        if (hit(p.x, p.y)) { n++; collect?.(p.x, p.y, s.color); if (piece.length) { pieces.push(piece); piece = []; } }
        else piece.push(p);
      }
      if (piece.length) pieces.push(piece);
      if (pieces.length === 1 && pieces[0].length === s.pts.length) { strands.push(s); continue; }
      for (const pts of pieces) if (pts.length > 1) strands.push({ ...s, pts, pinned: false, sleep: false, still: 0 });
    }
    this.strands = strands;
    const keepL = this.letters.filter(l => { const h = hit(l.x + 4, l.y - 4); if (h) collect?.(l.x + 4, l.y - 4, l.color); return !h; });
    n += (this.letters.length - keepL.length) * 3;
    this.letters = keepL;
    const keepP = this.particles.filter(p => { const h = hit(p.x, p.y); if (h) collect?.(p.x, p.y, p.color); return !h; });
    n += this.particles.length - keepP.length;
    this.particles = keepP;
    this.drips = this.drips.filter(d => !hit(d.x, d.y));
    if (n && this.letters.length) this.dropUnsupported();
    if (n) this.requestFrame();
    return n;
  }

  /** Is a settled letter resting on something: a ledge, the page bottom, or a letter below it? */
  letterSupported(l) {
    for (const r of this.targets) {
      if (l.x + 4 > r.l && l.x + 4 < r.r && Math.abs(l.y - snap(r.t - GRID)) <= GRID) return true;
    }
    if (this.docH && l.y >= snap(this.docH - GRID) - GRID) return true;
    return this.letters.some(o => o !== l && Math.abs(o.x - l.x) < 10 && o.y > l.y && o.y - l.y <= 16 + GRID);
  }

  /** Letters left floating (the ones under them were vacuumed, or the layout moved)
      fall again and land on whatever is below. */
  dropUnsupported() {
    const falling = [];
    for (let pass = 0, changed = true; changed && pass < 40; pass++) {
      changed = false;
      for (let i = this.letters.length - 1; i >= 0; i--) {
        if (this.letterSupported(this.letters[i])) continue;
        falling.push(this.letters.splice(i, 1)[0]);
        changed = true;
      }
    }
    if (this.reduced) {
      // no animation: drop them straight onto the closest ledge below
      for (const l of falling) this.particles.push({ kind: 'letter', x: l.x, y: l.y, vx: 0, vy: 0, color: l.color, ch: l.ch, phase: 0 });
      while (this.particles.some(p => p.kind === 'letter')) if (!this.stepParticles()) break;
    } else {
      for (const l of falling) this.particles.push({ kind: 'letter', x: l.x, y: l.y, vx: 0, vy: 0, color: l.color, ch: l.ch, phase: 0 });
    }
    if (falling.length) this.requestFrame();
  }

  /** Suck up paint near (x, y): the bits visibly fly into the nozzle, with air streaks. */
  vacuum(x, y, r) {
    const r2 = r * r;
    const bits = [];
    const n = this.removeWhere(
      (px, py) => (px - x) * (px - x) + (py - y) * (py - y) <= r2,
      (px, py, color) => { if (bits.length < 50 && Math.random() < 0.7) bits.push([px, py, color]); },
    );
    for (const [px, py, color] of bits) this.sucked.push({ sx: px, sy: py, tx: x, ty: y, t: rand(-0.3, 0), color, air: false });
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * Math.PI * 2, d = r * rand(0.8, 1.4);
      this.sucked.push({ sx: x + Math.cos(a) * d, sy: y + Math.sin(a) * d, tx: x, ty: y, t: rand(-0.2, 0), air: true });
    }
    if (this.sucked.length > 400) this.sucked.splice(0, this.sucked.length - 400);
    this.requestFrame();
    return n;
  }

  stepSucked() {
    if (!this.sucked.length) return false;
    this.sucked = this.sucked.filter(s => (s.t += s.air ? 0.11 : 0.08) < 1);
    return this.sucked.length > 0;
  }

  vacuumBox(box) {
    return this.removeWhere((x, y) => x >= box.l && x <= box.r && y >= box.t && y <= box.b);
  }

  /** Advance one frame. Returns true while anything still moves. */
  update(now) {
    const nx = this.pointer.x + window.scrollX;
    const ny = this.pointer.y + window.scrollY;

    if (this.spraying) {
      if (this.reduced) this.emitStatic(now, nx, ny);
      else if (this.mode === 'paint') this.emitPaint(now, nx, ny);
      else if (this.mode === 'sand') this.emitParticles(now, nx, ny, 'sand');
      else if (this.mode === 'confetti') this.emitParticles(now, nx, ny, 'confetti');
      else if (this.mode === 'letters') this.emitParticles(now, nx, ny, 'letter');
      else this.emitString(now, nx, ny);
    }

    let moving = false;
    if (!this.reduced) {
      moving = this.stepStrands(nx, ny) || moving;
      moving = this.stepDrips() || moving;
      moving = this.stepParticles() || moving;
    }
    moving = this.stepSucked() || moving;
    return this.spraying || moving;
  }

  // ---- emitters ------------------------------------------------------------
  addDot(x, y, color) {
    const key = `${snap(x)},${snap(y)}`;
    if (this.dots.has(key)) this.dots.delete(key);
    this.dots.set(key, color);
    while (this.dots.size > MAX_DOTS) this.dots.delete(this.dots.keys().next().value);
  }

  splat(x, y, radius, count, color) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;
      this.addDot(x + Math.cos(a) * r, y + Math.sin(a) * r, color);
    }
  }

  addLetter(x, y, color) {
    const ch = LETTER_TEXT[this.letterIndex++ % LETTER_TEXT.length];
    this.letters.push({ x: snap(x), y: snap(y), ch, color });
    if (this.letters.length > MAX_LETTERS) this.letters.shift();
  }

  emitStatic(now, x, y) {
    if (now - this.lastDotsAt < 40) return;
    this.lastDotsAt = now;
    if (Math.random() < 0.08) this.sprayColor = this.nextColor();
    const { radius, density } = this.canCfg;
    if (this.mode === 'letters') {
      if (now - this.lastEmitAt > 160) { this.lastEmitAt = now; this.addLetter(x + rand(-radius, radius), y + rand(-radius, radius), this.sprayColor); }
      return;
    }
    this.splat(x, y, radius + 2, Math.max(2, Math.round(4 * density)), this.sprayColor);
  }

  emitPaint(now, x, y) {
    const { radius, density } = this.canCfg;
    if (now - this.lastDotsAt > 30) {
      this.lastDotsAt = now;
      this.splat(x, y, radius, Math.max(1, Math.round(3 * density)), this.sprayColor);
    }
    if (now - this.lastDripAt > 110 / density) {
      this.lastDripAt = now;
      if (Math.random() < 0.25) this.sprayColor = this.nextColor();
      const g = this.flow.gravity / 0.32;
      this.drips.push({
        x: x + rand(-radius, radius) * 0.8, y: y + rand(-4, 6), vy: rand(0.4, 1.1) * Math.max(0.3, g),
        left: rand(30, 160), color: this.sprayColor, lastY: null, g,
      });
      if (this.drips.length > 80) this.drips.shift();
    }
  }

  emitParticles(now, x, y, kind) {
    const interval = kind === 'letter' ? 85 : 16;
    if (now - this.lastEmitAt < interval) return;
    this.lastEmitAt = now;
    const { radius, density, fan } = this.canCfg;
    const f = this.flow;
    const n = kind === 'letter' ? 1 : Math.max(1, Math.round((kind === 'sand' ? 4 : 2) * density));
    for (let i = 0; i < n; i++) {
      if (Math.random() < (kind === 'sand' ? 0.04 : 0.2)) this.sprayColor = this.nextColor();
      const ang = -Math.PI / 2 + rand(-f.spread, f.spread) * fan;
      const sp = kind === 'sand' ? rand(0.5, 2.5) : rand(f.speed[0], f.speed[1]) * 0.6;
      const p = {
        kind,
        x: x + rand(-radius, radius) * 0.6,
        y: y + rand(-radius, radius) * 0.3,
        vx: Math.cos(ang) * sp * (kind === 'sand' ? 0.6 : 1),
        vy: Math.sin(ang) * sp,
        color: this.sprayColor,
        phase: Math.random() * Math.PI * 2,
      };
      if (kind === 'letter') p.ch = LETTER_TEXT[this.letterIndex++ % LETTER_TEXT.length];
      this.particles.push(p);
    }
    while (this.particles.length > MAX_PARTICLES) this.particles.shift();
  }

  /** While the can is held, keep feeding the SAME string: it never breaks off. */
  emitString(now, x, y) {
    const f = this.flow;
    let s = this.active;
    if (!s) {
      s = { pts: [], color: this.nextColor(), pinned: true, sleep: false, still: 0, curl: (Math.random() < 0.5 ? -1 : 1) * f.curl };
      this.strandDir = -Math.PI / 2 + rand(-f.spread, f.spread) * this.canCfg.fan * 0.5;
      this.strands.push(s);
      this.active = s;
    }
    // the stream sways a little, like a real can (and loops with the curly flow)
    this.strandDir += s.curl * 0.5 + rand(-0.07, 0.07);
    const lim = f.spread * this.canCfg.fan;
    this.strandDir = Math.max(-Math.PI / 2 - lim, Math.min(-Math.PI / 2 + lim, this.strandDir));
    const speed = rand(f.speed[0], f.speed[1]) * 1.2;   // big spray: shoots out far
    const ang = this.strandDir + rand(-f.jitter, f.jitter);
    const vx = Math.cos(ang) * speed;
    const vy = Math.sin(ang) * speed;
    s.pts.push({ x, y, px: x - vx, py: y - vy });
    if (s.pts.length > MAX_STRAND) s.pts.shift();       // trim the far end, keep it one piece
    s.sleep = false;
    this.enforceBudget();
  }

  enforceBudget() {
    let total = 0;
    for (const s of this.strands) total += s.pts.length;
    while (this.strands.length > 1 && (this.strands.length > MAX_STRANDS || total > MAX_POINTS)) {
      const idx = this.strands.findIndex(s => s !== this.active);   // oldest finished string goes first
      if (idx < 0) break;
      total -= this.strands[idx].pts.length;
      this.strands.splice(idx, 1);
    }
  }

  // ---- physics -------------------------------------------------------------
  /** Topmost rect whose top edge the point (moving downward from prevY) just reached, if any. */
  ledgeHit(x, prevY, y) {
    if (y <= prevY) return null;
    let best = null;
    for (const r of this.targets) {
      if (x > r.l && x < r.r && prevY <= r.t && y >= r.t - GRID) {
        if (!best || r.t < best.t) best = r;
      }
    }
    return best;
  }

  /** String point vs boxes and lines. The string is sticky: it grips the edge it
      lands on and slides only slowly down the sides, so it snags and hangs. */
  collide(p) {
    const R = STRING_R;
    for (const r of this.targets) {
      const l = r.l - R, t = r.t - R, rr = r.r + R, b = r.b + R;
      if (p.x <= l || p.x >= rr) continue;
      // crossed the top edge this frame (also stops fast points falling through thin lines)
      if (p.py <= t && p.y >= t) {
        p.y = t;
        p.px = p.x - (p.x - p.px) * 0.2;   // grip
        p.py = p.y;
        continue;
      }
      if (p.y <= t || p.y >= b) continue;
      const dl = p.x - l, dr = rr - p.x, dt = p.y - t, db = b - p.y;
      const m = Math.min(dl, dr, dt, db);
      if (m === dt) { p.y = t; p.px = p.x - (p.x - p.px) * 0.2; p.py = p.y; }
      else if (m === db) p.y = b;
      else {
        p.x = m === dl ? l : rr;
        p.py = p.y - (p.y - p.py) * 0.45;   // rubs along the side: hangs instead of sliding off
      }
    }
    if (this.docH && p.y > this.docH - R) { p.y = this.docH - R; p.px = p.x - (p.x - p.px) * 0.5; }
    if (p.x < 0) p.x = 0;
    else if (this.docW && p.x > this.docW) p.x = this.docW;
  }

  stepStrands(nx, ny) {
    const { gravity, damping } = this.flow;
    let moving = false;
    for (const s of this.strands) {
      if (s.sleep) continue;
      const pts = s.pts;
      const last = pts.length - 1;
      let maxV = 0;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (s.pinned && i === last) continue;
        const vx = (p.x - p.px) * damping;
        const vy = (p.y - p.py) * damping;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + gravity;
        const v = Math.abs(vx) + Math.abs(vy);
        if (v > maxV) maxV = v;
      }
      if (s.pinned && last >= 0) {
        const p = pts[last];
        p.px = p.x = nx; p.py = p.y = ny;
      }

      for (let k = 0; k < ITERATIONS; k++) {
        for (let i = 0; i < last; i++) {
          const a = pts[i], b = pts[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.0001;
          const diff = (d - SEG) / d;
          const bFixed = s.pinned && i + 1 === last;
          if (bFixed) { a.x += dx * diff; a.y += dy * diff; }
          else { a.x += dx * diff * 0.5; a.y += dy * diff * 0.5; b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5; }
        }
        for (let i = 0; i < pts.length; i++) {
          if (s.pinned && i === last) continue;
          this.collide(pts[i]);
        }
      }

      if (!s.pinned && maxV < SLEEP_SPEED) {
        if (++s.still > SLEEP_FRAMES) s.sleep = true;
      } else {
        s.still = 0;
      }
      if (!s.sleep) moving = true;
    }
    return moving;
  }

  stepDrips() {
    if (!this.drips.length) return false;
    const keep = [];
    for (const d of this.drips) {
      const prevY = d.y;
      d.vy = Math.min(d.vy + 0.03 * d.g, 2.2 * Math.max(0.4, d.g));
      d.y += d.vy;
      d.left -= d.vy;

      const sy = snap(d.y);
      if (sy !== d.lastY) { this.addDot(d.x, d.y, d.color); d.lastY = sy; }

      let dead = false;
      const r = this.ledgeHit(d.x, prevY, d.y);
      if (r) { this.pool(d.x, r, d.color); dead = true; }
      if (!dead && this.docH && d.y >= this.docH - GRID) dead = true;
      if (!dead && d.left <= 0) {
        this.addDot(d.x - GRID, d.y, d.color);
        this.addDot(d.x, d.y + GRID, d.color);
        dead = true;
      }
      if (!dead) keep.push(d);
    }
    this.drips = keep;
    return keep.length > 0;
  }

  pool(x, r, color) {
    const y = r.t - GRID;
    const half = rand(8, 22);
    for (let px = Math.max(r.l, x - half); px <= Math.min(r.r - GRID, x + half); px += GRID) this.addDot(px, y, color);
    const half2 = half * 0.5;
    for (let px = Math.max(r.l, x - half2); px <= Math.min(r.r - GRID, x + half2); px += GRID) this.addDot(px, y - GRID, color);
  }

  /** Is the grid cell at (x, y) solid for sand (paint dot or a target's top edge)? */
  solid(x, y) {
    const sx = snap(x), sy = snap(y);
    if (this.dots.has(`${sx},${sy}`)) return true;
    if (this.docH && sy >= snap(this.docH - GRID)) return true;
    for (const r of this.targets) {
      const rt = snap(r.t);
      if (sx >= snap(r.l) && sx < snap(r.r) && sy >= rt && sy < rt + GRID * 2) return true;
    }
    return false;
  }

  stepParticles() {
    if (!this.particles.length) return false;
    const { gravity, damping } = this.flow;
    const keep = [];
    for (const p of this.particles) {
      const prevY = p.y;
      if (p.kind === 'sand') {
        p.vy = Math.min(p.vy + gravity * 1.1, 6);
        p.vx *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx = 0; }
        else if (this.docW && p.x > this.docW - GRID) { p.x = this.docW - GRID; p.vx = 0; }
        // falling-sand rule: sweep downward to avoid tunneling, then slide diagonally or stack
        if (p.vy > 0) {
          const sx = snap(p.x);
          const startY = snap(prevY);
          const endY = snap(p.y);
          let hitY = null;
          for (let sy = startY; sy <= endY; sy += GRID) {
            if (this.solid(sx, sy + GRID)) { hitY = sy; break; }
          }
          if (hitY !== null) {
            const d = Math.random() < 0.5 ? -GRID : GRID;
            const inBounds = nx => nx >= 0 && (!this.docW || nx <= this.docW - GRID);
            let slid = false;
            for (const dir of [d, -d]) {
              const nx = sx + dir;
              if (inBounds(nx) && !this.solid(nx, hitY + GRID) && !this.solid(nx, hitY)) {
                p.x = nx;
                p.y = hitY;
                p.vy = 0.5;
                p.vx = 0;
                keep.push(p);
                slid = true;
                break;
              }
            }
            if (slid) continue;
            let landY = hitY;
            let steps = 0;
            while (landY > 0 && this.solid(sx, landY) && steps < 4) {
              landY -= GRID;
              steps++;
            }
            if (!this.solid(sx, landY)) this.addDot(sx, landY, p.color);
            continue;
          }
        }
      } else if (p.kind === 'confetti') {
        p.phase += 0.25;
        p.vy = Math.min(p.vy + gravity * 0.35, 1.8);
        p.vx = p.vx * damping + Math.sin(p.phase) * 0.18;
        p.x += p.vx;
        p.y += p.vy;
        const r = this.ledgeHit(p.x, prevY, p.y);
        if (r || (this.docH && p.y >= this.docH - GRID)) {
          const landY = r ? r.t - GRID : this.docH - GRID;
          this.addDot(p.x, landY, p.color);
          if (Math.sin(p.phase) > 0 && (!r || p.x + GRID < r.r)) this.addDot(p.x + GRID, landY, p.color);
          continue;
        }
      } else { // letter
        p.phase += 0.15;
        p.vy = Math.min(p.vy + gravity * 0.6, 4);
        p.vx *= damping;
        p.x += p.vx;
        p.y += p.vy;
        const r = this.ledgeHit(p.x, prevY, p.y);
        if (r || (this.docH && p.y >= this.docH - GRID)) {
          // land on the ledge; if that spot is taken, tumble to a free spot beside
          // the pile first (keeps piles low), and only stack up when there's none
          const lx = snap(p.x);
          let restY = snap(r ? r.t - GRID : this.docH - GRID);
          const taken = (x, y) => this.letters.some(l => Math.abs(l.x - x) < 10 && l.y === y);
          const fits = x => !r || (x > r.l && x < r.r - 8);
          let x = lx;
          if (taken(x, restY)) {
            const side = Math.random() < 0.5 ? -1 : 1;
            for (const dx of [12 * side, -12 * side, 24 * side, -24 * side]) {
              if (fits(lx + dx) && !taken(lx + dx, restY)) { x = lx + dx; break; }
            }
          }
          while (taken(x, restY)) restY -= 16;
          this.letters.push({ x, y: restY, ch: p.ch, color: p.color });
          if (this.letters.length > MAX_LETTERS) this.letters.shift();
          continue;
        }
      }
      if (p.y < (this.docH || Infinity) + 50) keep.push(p);
    }
    this.particles = keep;
    return keep.length > 0;
  }

  // ---- rendering -----------------------------------------------------------
  draw(now) {
    const ctx = this.pctx;
    const sx = window.scrollX, sy = window.scrollY;
    const w = this.w, h = this.h;
    ctx.clearRect(0, 0, w, h);

    let current = null;
    const fill = key => {
      if (key !== current) { current = key; ctx.fillStyle = this.resolveColor(key); }
    };

    // static dots
    for (const [key, color] of this.dots) {
      const comma = key.indexOf(',');
      const x = +key.slice(0, comma) - sx;
      const y = +key.slice(comma + 1) - sy;
      if (x < -GRID || y < -GRID || x > w || y > h) continue;
      fill(color);
      ctx.fillRect(x, y, GRID, GRID);
    }

    // silly string: one smooth, rounded line through each rope (curves between points)
    ctx.lineWidth = STRING_W;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of this.strands) {
      const pts = s.pts;
      if (pts.length < 2) continue;
      ctx.strokeStyle = this.resolveColor(s.color);
      ctx.beginPath();
      ctx.moveTo(pts[0].x - sx, pts[0].y - sy);
      for (let i = 1; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        ctx.quadraticCurveTo(a.x - sx, a.y - sy, (a.x + b.x) / 2 - sx, (a.y + b.y) / 2 - sy);
      }
      const z = pts[pts.length - 1];
      ctx.lineTo(z.x - sx, z.y - sy);
      ctx.stroke();
    }

    // drip heads (taller squares)
    for (const d of this.drips) {
      fill(d.color);
      ctx.fillRect(snap(d.x) - sx, snap(d.y) - sy, GRID, GRID * 2);
    }

    // falling particles
    for (const p of this.particles) {
      if (p.kind === 'letter') continue;
      const x = snap(p.x) - sx, y = snap(p.y) - sy;
      if (x < -GRID * 2 || y < -GRID * 2 || x > w || y > h) continue;
      fill(p.color);
      if (p.kind === 'confetti') {
        // flips between a wide and a tall flake as it tumbles
        if (Math.sin(p.phase) > 0) ctx.fillRect(x, y, GRID * 2, GRID);
        else ctx.fillRect(x, y, GRID, GRID * 2);
      } else {
        ctx.fillRect(x, y, GRID, GRID);
      }
    }

    // paint bits and air being sucked into the vacuum: they speed up as they get close
    // and swirl a little on the way
    if (this.sucked.length) {
      for (const s of this.sucked) {
        if (s.t <= 0) continue;
        const k = s.t * s.t;
        const swirl = Math.sin(s.t * Math.PI) * 7;
        const dx = s.tx - s.sx, dy = s.ty - s.sy, len = Math.hypot(dx, dy) || 1;
        const x = s.sx + dx * k - (dy / len) * swirl - sx;
        const y = s.sy + dy * k + (dx / len) * swirl - sy;
        if (s.air) {
          ctx.globalAlpha = 0.5 * (1 - s.t);
          ctx.fillStyle = this.colors.fg;
          ctx.fillRect(Math.round(x), Math.round(y), 3, 3);
        } else {
          const size = Math.max(2, Math.round(GRID * (1 - s.t * 0.5)));
          ctx.globalAlpha = 1;
          ctx.fillStyle = this.resolveColor(s.color);
          ctx.fillRect(Math.round(x), Math.round(y), size, size);
        }
      }
      ctx.globalAlpha = 1;
      current = null;
    }

    // letters (falling + settled)
    if (this.letters.length || this.particles.some(p => p.kind === 'letter')) {
      ctx.font = LETTER_FONT;
      ctx.textBaseline = 'bottom';
      for (const l of this.letters) {
        const x = l.x - sx, y = l.y + GRID - sy;
        if (x < -20 || y < -20 || x > w + 20 || y > h + 20) continue;
        fill(l.color);
        ctx.fillText(l.ch, x, y);
      }
      for (const p of this.particles) {
        if (p.kind !== 'letter') continue;
        fill(p.color);
        ctx.fillText(p.ch, snap(p.x) - sx, snap(p.y) + GRID - sy);
      }
    }

    this.drawCan(now);
  }

  drawCan(now) {
    const ctx = this.cctx;
    ctx.clearRect(0, 0, this.w, this.h);
    if (!this.spraying) return;
    const cfg = this.canCfg;
    const S = cfg.scale;
    const c = this.colors;
    const paint = this.resolveColor(this.active?.color || this.sprayColor);
    let ox = Math.round(this.pointer.x);
    let oy = Math.round(this.pointer.y);
    if (now < this.shakeUntil && !this.reduced) {
      const f = Math.floor(now / 40) % 4;
      ox += [-S, S, 0, S][f];
      oy += [0, -S, S, 0][f];
    }

    if (!cfg.sprite) {
      // pixel crosshair: four arms with a gap, paint-colored center
      ctx.fillStyle = c.fg;
      const arm = 4, gap = 2;
      for (let i = gap; i < gap + arm; i++) {
        ctx.fillRect(ox - S / 2 + i * S, oy - S / 2, S, S);
        ctx.fillRect(ox - S / 2 - i * S, oy - S / 2, S, S);
        ctx.fillRect(ox - S / 2, oy - S / 2 + i * S, S, S);
        ctx.fillRect(ox - S / 2, oy - S / 2 - i * S, S, S);
      }
      ctx.fillStyle = paint;
      ctx.fillRect(ox - S / 2, oy - S / 2, S, S);
      return;
    }

    // nozzle tip sits a little left/up of the pointer so paint leaves from it
    ox -= S;
    oy -= S;
    const map = { N: c.fg, O: c.fg, K: paint, P: paint, B: c.muted, W: c.card };
    const sprite = SPRITES[cfg.sprite];
    for (let row = 0; row < sprite.length; row++) {
      const line = sprite[row];
      for (let col = 0; col < line.length; col++) {
        const ch = line[col];
        if (ch === '.') continue;
        ctx.fillStyle = map[ch];
        ctx.fillRect(ox + col * S, oy + row * S, S, S);
      }
    }
  }
}
