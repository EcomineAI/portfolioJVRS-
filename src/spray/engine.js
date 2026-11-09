// Spray engine: physics + rendering for the spray layer (plan §5).
// Plain JS, no React. Everything is stored in DOCUMENT coordinates and drawn
// offset by the current scroll, so paint stays attached to the content.
//
// Modes
//   string   silly-string strands (Verlet ropes) that drape on headings
//   paint    mist + drips that run down and pool on headings
//   sand     grains that pour, pile up and slide off ledges
//   confetti flakes that flutter down and settle
//   letters  characters of my name tumbling onto headings
// Settings
//   can      sprite + spray width (classic · graffiti · marker · crosshair)
//   flow     physics preset (balanced · curly · heavy · floaty · chaos)
//   palette  colors (section · neon · ink · pastel)
// Reduced motion: no physics; every mode leaves static marks.

const GRID = 4;               // one pixel of the pixel-art grid
const SEG = 6;                // rest length between rope points
const STRAND_POINTS = 20;
const MAX_STRANDS = 60;
const MAX_POINTS = 1500;
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
  ink: ['fg', 'primary', 'purple'],
  pastel: ['#ffc8dd', '#bde0fe', '#caffbf', '#fdffb6', '#d0bfff'],
};

const COLOR_VARS = {
  code: '--world-code',
  create: '--world-create',
  learn: '--world-learn',
  primary: '--primary-soft',
  purple: '--bg-purple',
  fg: '--fg',
};
const FALLBACK = {
  code: '#5cf2c8', create: '#ff9ec0', learn: '#f7d44a', primary: '#4c6ef6', purple: '#8b5cf6',
  fg: '#1a2447', card: '#fff', muted: '#4d5a85',
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
    this.tick = this.tick.bind(this);
    this.colors = { ...FALLBACK };
    this.readColors();
    this.resize();
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
    this.targets = rects;
    this.docW = docW;
    this.docH = docH;
    for (const s of this.strands) { s.sleep = false; s.still = 0; }
    this.requestFrame();
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
      this.end();
    } else {
      this.requestFrame();
    }
  }

  /** Color of the page section under the pointer (Code / Create / Learn), else blue/purple. */
  sectionColor() {
    const el = document.elementFromPoint(this.pointer.x, this.pointer.y);
    const world = el?.closest?.('[data-world]')?.dataset.world
      || el?.closest?.('section[id]')?.id;
    if (world === 'code' || world === 'create' || world === 'learn') return world;
    this.colorIndex = (this.colorIndex + 1) % 2;
    return ['primary', 'purple'][this.colorIndex];
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
    this.active = null;
    this.requestFrame();
  }

  /** Scrolling makes free strand ends lag behind the content, so they swing. */
  onScroll(dy) {
    if (this.reduced || !dy) { this.requestFrame(); return; }
    const kick = Math.max(-5, Math.min(5, dy * 0.12));
    const top = window.scrollY - 200;
    const bottom = window.scrollY + this.h + 200;
    for (const s of this.strands) {
      const head = s.pts[0];
      if (!head || head.y < top || head.y > bottom) continue;
      for (let i = 0; i < s.pts.length; i++) {
        if (s.pinned && i === s.pts.length - 1) continue;
        s.pts[i].py -= kick * (0.4 + Math.random() * 0.6);
      }
      s.sleep = false;
      s.still = 0;
    }
    this.requestFrame();
  }

  // ---- loop ----------------------------------------------------------------
  requestFrame() {
    if (!this.raf && !this.hidden) this.raf = requestAnimationFrame(this.tick);
  }

  tick(now) {
    this.raf = 0;
    const busy = this.update(now);
    this.draw(now);
    if (busy) this.requestFrame();
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
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

  emitString(now, x, y) {
    const f = this.flow;
    let s = this.active;
    if (s && s.pts.length >= STRAND_POINTS) {
      s.pinned = false;
      this.active = s = null;
      this.nextStrandAt = now + 70;
    }
    if (!s) {
      if (now < this.nextStrandAt) return;
      s = { pts: [], color: this.nextColor(), pinned: true, sleep: false, still: 0, curl: (Math.random() < 0.5 ? -1 : 1) * f.curl };
      this.strandDir = -Math.PI / 2 + rand(-f.spread, f.spread) * this.canCfg.fan;
      this.strands.push(s);
      this.active = s;
      this.enforceBudget();
    }
    this.strandDir += s.curl;                                // curly flow loops the strand
    const speed = rand(f.speed[0], f.speed[1]);
    const ang = this.strandDir + rand(-f.jitter, f.jitter);
    const vx = Math.cos(ang) * speed;
    const vy = Math.sin(ang) * speed;
    s.pts.push({ x, y, px: x - vx, py: y - vy });
    this.enforceBudget();
  }

  enforceBudget() {
    let total = 0;
    for (const s of this.strands) total += s.pts.length;
    while (this.strands.length > 1 && (this.strands.length > MAX_STRANDS || total > MAX_POINTS)) {
      const idx = this.strands[0] === this.active ? 1 : 0;
      total -= this.strands[idx].pts.length;
      this.strands.splice(idx, 1);
    }
  }

  // ---- physics -------------------------------------------------------------
  /** Rect whose top edge the point (moving from prevY) just reached, if any. */
  ledgeHit(x, prevY, y) {
    for (const r of this.targets) {
      if (x > r.l && x < r.r && prevY <= r.t && y >= r.t - GRID) return r;
    }
    return null;
  }

  collide(p) {
    for (const r of this.targets) {
      if (p.x <= r.l || p.x >= r.r || p.y <= r.t || p.y >= r.b) continue;
      if (p.py <= r.t + 1) {
        // landed on top: rest there with friction (this is the "drape")
        p.y = r.t;
        p.px = p.x - (p.x - p.px) * 0.35;
        p.py = p.y;
      } else {
        const dl = p.x - r.l, dr = r.r - p.x, dt = p.y - r.t, db = r.b - p.y;
        const m = Math.min(dl, dr, dt, db);
        if (m === dt) p.y = r.t;
        else if (m === db) p.y = r.b;
        else if (m === dl) p.x = r.l;
        else p.x = r.r;
      }
    }
    if (this.docH && p.y > this.docH - 2) { p.y = this.docH - 2; p.px = p.x - (p.x - p.px) * 0.5; }
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
    if (this.docH && sy >= this.docH - GRID) return true;
    for (const r of this.targets) {
      if (sx > r.l - GRID && sx < r.r && sy >= r.t && sy < r.t + GRID * 2) return true;
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
        // falling-sand rule: settle when blocked below, otherwise slide diagonally
        if (this.solid(p.x, p.y + GRID)) {
          if (!this.solid(p.x - GRID, p.y + GRID) && !this.solid(p.x - GRID, p.y)) { p.x -= GRID; p.vy = 0.5; keep.push(p); continue; }
          if (!this.solid(p.x + GRID, p.y + GRID) && !this.solid(p.x + GRID, p.y)) { p.x += GRID; p.vy = 0.5; keep.push(p); continue; }
          this.addDot(p.x, p.y, p.color);
          continue;
        }
      } else if (p.kind === 'confetti') {
        p.phase += 0.25;
        p.vy = Math.min(p.vy + gravity * 0.35, 1.8);
        p.vx = p.vx * damping + Math.sin(p.phase) * 0.18;
        p.x += p.vx;
        p.y += p.vy;
        if (this.ledgeHit(p.x, prevY, p.y) || (this.docH && p.y >= this.docH - GRID)) {
          this.addDot(p.x, p.y, p.color);
          if (Math.sin(p.phase) > 0) this.addDot(p.x + GRID, p.y, p.color);
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
          // stack on top of letters already resting at this spot
          const lx = snap(p.x);
          let restY = snap(r ? r.t - GRID : this.docH - GRID);
          while (this.letters.some(l => Math.abs(l.x - lx) < 10 && l.y === restY)) restY -= 16;
          this.letters.push({ x: lx, y: restY, ch: p.ch, color: p.color });
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
      if (key !== current) { current = key; ctx.fillStyle = this.colors[key] || key || this.colors.primary; }
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

    // strands: walk each segment in grid steps and stamp squares
    for (const s of this.strands) {
      const pts = s.pts;
      if (pts.length < 2) continue;
      fill(s.color);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        const ax = a.x - sx, ay = a.y - sy;
        if ((ax < -40 || ax > w + 40 || ay < -40 || ay > h + 40) && (b.y - sy < -40 || b.y - sy > h + 40)) continue;
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) / GRID));
        for (let k = 0; k < steps; k++) {
          const t = k / steps;
          ctx.fillRect(snap(a.x + (b.x - a.x) * t) - sx, snap(a.y + (b.y - a.y) * t) - sy, GRID, GRID);
        }
      }
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
    const paint = c[this.active?.color || this.sprayColor] || this.active?.color || this.sprayColor || c.primary;
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
