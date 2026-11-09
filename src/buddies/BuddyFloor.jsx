import { useEffect, useRef, useState } from 'react';
import Buddy from './Buddy.jsx';
import PixelSprite from './PixelSprite.jsx';
import { vic, claude, heart } from './sprites.js';
import './buddies.css';

const TICK = 100;            // ms per simulation step
const SCALE = 3;
const VIC_W = vic.stand[0].length * SCALE;       // 48px
const CLAUDE_W = claude.stand[0].length * SCALE; // 36px
const BTN_MIN = 44;          // buttons are at least 44px wide
const SPEED = { walk: 3, run: 8 };               // px per tick
const HEART_DIST = 40;
const BUBBLE_MS = 3600;

const LINES = {
  vic: [
    'Running Gemma locally…',
    'Shipping Askademic v0.15',
    'Ask me about Supabase!',
    'One more commit, then sleep.',
    'Is it a bug or a feature?',
    'LM Studio go brrr',
  ],
  claude: [
    'Need a hand? Click me!',
    'I like your commit streak',
    'Beep boop, hi!',
    'Have you tried turning it off and on?',
    'Psst, the case study is cool.',
  ],
};

const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const nextBubbleIn = () => rand(8000, 15000);

const makeBuddy = (x, w) => ({ x, w, dir: 1, mode: 'idle', frame: 0, target: x, wait: rand(800, 2500), timer: 0, bubble: null, bubbleLeft: 0, bubbleIn: nextBubbleIn() });

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

export default function BuddyFloor() {
  const stageRef = useRef(null);
  const widthRef = useRef(0);
  const [width, setWidth] = useState(0);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const reduced = usePrefersReducedMotion();
  const sim = useRef({ vic: makeBuddy(24, VIC_W), claude: makeBuddy(96, CLAUDE_W) });
  const [, setTick] = useState(0);
  const rerender = () => setTick(t => t + 1);

  // Stage width
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      widthRef.current = w;
      setWidth(w);
      // keep buddies inside after a resize
      for (const b of Object.values(sim.current)) {
        const max = Math.max(0, w - Math.max(b.w, BTN_MIN));
        b.x = Math.min(b.x, max);
        b.target = Math.min(b.target, max);
      }
    };
    measure();
    if (!('ResizeObserver' in window)) {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pause when offscreen
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause when the tab is hidden
  useEffect(() => {
    const on = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  // Reduced motion: everybody stands still.
  useEffect(() => {
    if (!reduced) return;
    for (const b of Object.values(sim.current)) { b.mode = 'idle'; b.target = b.x; b.frame = 0; }
    rerender();
  }, [reduced]);

  const active = onScreen && tabVisible;

  // Single simulation loop for both buddies (one timer = easy to pause).
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const w = widthRef.current;
      if (!w) return;
      const { vic: v, claude: c } = sim.current;
      const maxX = b => Math.max(0, w - Math.max(b.w, BTN_MIN));

      for (const [key, b] of Object.entries(sim.current)) {
        // Speech bubbles
        if (b.bubble) {
          b.bubbleLeft -= TICK;
          if (b.bubbleLeft <= 0) { b.bubble = null; b.bubbleIn = nextBubbleIn(); }
        } else {
          b.bubbleIn -= TICK;
          if (b.bubbleIn <= 0) { b.bubble = pick(LINES[key]); b.bubbleLeft = BUBBLE_MS; }
        }

        if (reduced) continue;
        b.timer += TICK;

        if (b.mode === 'walk' || b.mode === 'run') {
          const speed = SPEED[b.mode];
          const dx = b.target - b.x;
          if (Math.abs(dx) <= speed) {
            b.x = b.target;
            b.mode = 'idle';
            b.wait = rand(1200, 4000);
          } else {
            b.dir = Math.sign(dx);
            b.x += b.dir * speed;
          }
          const frameEvery = b.mode === 'run' ? 1 : 2; // 100ms / 200ms per frame
          if (b.timer % (TICK * frameEvery) === 0) b.frame = (b.frame + 1) % 2;
        } else if (b.mode === 'hop' || b.mode === 'dance') {
          b.wait -= TICK;
          if (b.wait <= 0) { b.mode = 'idle'; b.wait = rand(800, 2000); }
        } else {
          // idle: wait, then decide where to go next
          b.wait -= TICK;
          if (b.wait <= 0) {
            if (key === 'vic' || Math.random() < 0.25) {
              b.target = rand(0, maxX(b));
            } else {
              // Claude loosely follows Vic, stopping a little to one side.
              const left = v.x - Math.max(CLAUDE_W, BTN_MIN) - rand(4, 24);
              const right = v.x + Math.max(VIC_W, BTN_MIN) + rand(4, 24);
              let t = c.x < v.x ? left : right;
              if (t < 0 || t > maxX(b)) t = t < 0 ? right : left; // no room on that side
              b.target = Math.min(maxX(b), Math.max(0, t));
            }
            if (Math.abs(b.target - b.x) < 6) b.wait = rand(800, 2000);
            else b.mode = 'walk';
          }
        }
      }

      // Claude catches up if Vic wandered far away while Claude idles.
      if (!reduced && c.mode === 'idle' && Math.abs(c.x - v.x) > Math.max(160, w * 0.35) && c.wait > 600) {
        c.wait = 600;
      }
      rerender();
    }, TICK);
    return () => clearInterval(id);
  }, [active, reduced]);

  const act = key => action => {
    const b = sim.current[key];
    const w = widthRef.current;
    const max = Math.max(0, w - Math.max(b.w, BTN_MIN));
    if (action === 'sayhi') {
      b.bubble = 'Opening chat…';
      b.bubbleLeft = 2000;
      window.dispatchEvent(new CustomEvent('chatbot:open'));
      rerender();
      return;
    }
    if (reduced) {
      // No animation: walk/run jump to a new spot; hop/dance are described instead.
      if (action === 'walk' || action === 'run') { b.x = b.target = rand(0, max); }
      b.bubble = { walk: 'Walked over here!', run: 'Zoom! (instantly)', hop: '*hop*', dance: '♪ *dances* ♪' }[action];
      b.bubbleLeft = 2500;
      rerender();
      return;
    }
    b.timer = 0;
    if (action === 'walk' || action === 'run') {
      // Head for the far side so the action is visible.
      b.target = b.x > max / 2 ? rand(0, max * 0.3) : rand(max * 0.7, max);
      b.mode = action;
    } else {
      b.mode = action;
      b.wait = action === 'hop' ? 1600 : 2400;
    }
    rerender();
  };

  const { vic: v, claude: c } = sim.current;
  const vicCenter = v.x + Math.max(VIC_W, BTN_MIN) / 2;
  const claudeCenter = c.x + Math.max(CLAUDE_W, BTN_MIN) / 2;
  const showHeart = width > 0 && Math.abs(vicCenter - claudeCenter) < HEART_DIST + (VIC_W + CLAUDE_W) / 2;
  // ^ "within ~40px of each other": edge-to-edge gap under 40px

  const view = b => ({ x: b.x, dir: b.dir, mode: b.mode, frame: b.frame });

  return (
    <div className={`buddy-floor${active ? '' : ' is-paused'}${reduced ? ' is-reduced' : ''}`} data-no-spray="true">
      <div className="buddy-floor__stage" ref={stageRef}>
        {showHeart && (
          <span
            className="buddy-floor__heart"
            style={{ transform: `translateX(${Math.round((vicCenter + claudeCenter) / 2 - 10)}px)` }}
            aria-hidden="true"
          >
            <PixelSprite grid={heart.grid} palette={heart.palette} scale={3} />
          </span>
        )}
        <Buddy
          name="claude"
          label="Claude buddy"
          sprite={claude}
          scale={SCALE}
          state={view(c)}
          bubble={typeof c.bubble === 'string' ? c.bubble : null}
          onAction={act('claude')}
          extraActions={[{ id: 'sayhi', label: 'Say hi' }]}
          stageWidth={width}
        />
        <Buddy
          name="vic"
          label="June Vic buddy"
          sprite={vic}
          scale={SCALE}
          state={view(v)}
          bubble={typeof v.bubble === 'string' ? v.bubble : null}
          onAction={act('vic')}
          stageWidth={width}
        />
      </div>
      <div className="buddy-floor__line" aria-hidden="true">
        <span data-world="code" />
        <span data-world="create" />
        <span data-world="learn" />
        <span />
      </div>
    </div>
  );
}
