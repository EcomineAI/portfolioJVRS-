import { useEffect, useRef, useState } from 'react';
import Buddy from './Buddy.jsx';
import PixelSprite from './PixelSprite.jsx';
import { vic, claude, laptop } from './sprites.js';
import './buddies.css';

const TICK = 100;            // ms per simulation step
const SCALE = 3;
const VIC_W = vic.stand[0].length * SCALE;       // 48px
const CLAUDE_W = claude.stand[0].length * SCALE; // 36px
const BTN_MIN = 44;          // buttons are at least 44px wide
const SPEED = { walk: 3, run: 8 };               // px per tick
const LINE_GAP = 350;        // pause between lines in a conversation

/* ---- Today (read fresh every time a line is said) -------------------------- */
// Lines can be functions; they're evaluated when spoken, so the date/time is current.
function today() {
  const d = new Date();
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const year = d.getFullYear();
  const hour = d.getHours();
  const dayMs = 86400000;
  const startOfDay = new Date(year, d.getMonth(), d.getDate());
  const daysLeft = Math.round((new Date(year + 1, 0, 1) - startOfDay) / dayMs);
  const toXmas = Math.round((new Date(year, 11, 25) - startOfDay) / dayMs);
  const dow = d.getDay();
  return { weekday, date, year, hour, daysLeft, toXmas, isFriday: dow === 5, isWeekend: dow === 0 || dow === 6, isMonday: dow === 1 };
}
const timeOfDay = () => {
  const { hour } = today();
  return hour < 5 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
};
const greeting = () => {
  const { weekday, isFriday } = today();
  const tod = timeOfDay();
  if (tod === 'night') return "It's late! Thanks for visiting 🌙";
  return isFriday ? `Good ${tod}, and happy Friday!` : `Good ${tod}! Happy ${weekday} 👋`;
};
const resolve = text => (typeof text === 'function' ? text() : text);

/* ---- What they say -------------------------------------------------------- */
// Solo lines (one buddy talks).
const LINES = {
  vic: [
    'One more commit, then sleep.',
    'It works on my machine.',
    'Running Gemma locally…',
    'Askademic v0.15 is live!',
    'Is it a bug or a feature?',
    'Why is it always CORS?',
  ],
  claude: [
    "I'm larping.",
    'Do you know John Pork?',
    "You're absolutely right!",
    'Brb, hallucinating a library.',
    'Context window: full. Vibes: immaculate.',
    'Touch grass? Never heard of it.',
    'Ship it. What could go wrong?',
    // date-aware
    () => `It's ${today().weekday}. Perfect day to read a case study.`,
    () => `${today().daysLeft} days left in ${today().year}. No pressure.`,
    () => (today().isFriday ? 'Friday. Do NOT deploy.' : `Not Friday yet. Deploy freely.`),
    // about the portfolio
    'Psst, try the spray can up top.',
    'The 3D GitHub skyline is my favourite part.',
    "There's a dark mode, by the way.",
  ],
};
LINES.vic.push(
  () => `Happy ${today().weekday}!`,
  () => `Good ${timeOfDay()}! Welcome to my portfolio.`,
  'Check out the Askademic case study!',
  'My résumé is one click away 👆',
);

// Skits between June Vic (v) and Claude (c).
// A step is either a line:            ['c', 'text']
//                or an action:        ['c', '@laptop', ms?]   (ms = how long the action lasts)
// Actions: @laptop @nap @wiggle @run @hop @walk (Claude) · @wave @dance @hop @run @walk (June Vic)
//          @chase (June Vic chases Claude)
const SKITS = [
  [['c', 'Let me larp.'], ['v', 'As what?'], ['c', 'As you…'], ['c', '@laptop', 5200], ['c', '*pushes to main on a Friday*'], ['v', '…accurate.']],
  [['c', 'Do you know John Pork?'], ['v', "He's calling again…"], ['c', "Don't pick up."], ['v', 'Too late.'], ['c', '@wiggle'], ['c', 'Oink.']],
  [['v', 'Can you review my PR?'], ['c', 'Sure, one sec…'], ['c', '@nap', 4200], ['v', '…'], ['v', 'CLAUDE.'], ['c', '@wiggle'], ['c', 'I was thinking deeply.']],
  [['v', 'Can you fix this bug?'], ['c', "You're absolutely right!"], ['v', "I didn't say anything yet…"], ['c', "You're absolutely right!"]],
  [['c', 'All tests passed!'], ['v', 'ALL of them?!'], ['v', '@dance'], ['c', 'I skipped the hard ones.'], ['v', '…']],
  [['v', 'Want some coffee?'], ['c', 'I run on tokens.'], ['v', 'Want some tokens?'], ['c', '@wiggle'], ['c', 'YES.']],
  [['c', 'I could refactor that.'], ['v', 'Which part?'], ['c', 'Yes.'], ['c', '@laptop', 4800], ['v', 'NOOO my code!']],
  [['v', 'It works on my machine.'], ['c', "Then we'll ship your machine."], ['c', '@run'], ['v', 'Wait, come back with my PC!']],
  [['v', 'Deploying on a Friday…'], ['c', 'Brave.'], ['c', '@laptop', 4200], ['c', 'Rolling back on Saturday.']],
  [['v', '@wave'], ['v', 'Hi! Welcome to my portfolio!'], ['c', 'He told me to say: hire him.'], ['c', '@wiggle'], ['v', 'Subtle.']],
  [['c', "I'm larping as a senior dev."], ['v', 'What does that look like?'], ['c', '@nap', 3600], ['c', 'Meetings.']],
  [['v', 'Write me a poem.'], ['c', 'Roses are red, CORS is a pain…'], ['v', 'Relatable.'], ['v', '@hop']],
  [['c', 'I found the perfect library!'], ['v', 'Link?'], ['c', '…it exists in my heart.'], ['v', 'Claude.']],
  [['v', 'I run Gemma locally.'], ['c', '…who is Gemma?'], ['c', '@wiggle'], ['c', "I'm not jealous."]],
  [['v', 'One more commit, then sleep.'], ['v', '@dance'], ['c', 'That was 47 commits ago.']],
  [['c', 'Let me larp.'], ['v', 'As who this time?'], ['c', 'As a PM.'], ['c', '@nap', 3000], ['c', 'Can we circle back on this?']],
  [['v', 'Do you dream?'], ['c', '@nap', 3200], ['c', 'Only of clean code.'], ['v', 'So, never.']],
  [['c', 'Context window: full.'], ['v', 'What does that mean?'], ['c', 'Who are you again?']],

  /* ---- they know what day it is ---- */
  [['v', 'What day is it?'], ['c', () => `${today().weekday}, ${today().date}.`], ['v', 'Already?!'], ['c', '@wiggle'], ['c', 'Time flies when you ship.']],
  [['c', () => `Good ${timeOfDay()}!`], ['v', () => (timeOfDay() === 'morning' ? 'Coffee first.' : timeOfDay() === 'afternoon' ? 'Post-lunch bug hunt?' : 'One more commit…')], ['c', () => (timeOfDay() === 'morning' ? 'I run on tokens.' : 'You said that 3 hours ago.')]],
  [['c', () => `${today().daysLeft} days left in ${today().year}.`], ['v', 'And I still have TODOs.'], ['c', '@laptop', 3600], ['c', 'Added them to the TODO list.']],
  [['v', () => (today().isFriday ? "It's Friday!" : today().isWeekend ? "It's the weekend!" : `It's only ${today().weekday}…`)],
    ['c', () => (today().isFriday ? 'So… no deploys?' : today().isWeekend ? 'Why are we working?' : 'Ship something anyway.')],
    ['v', () => (today().isFriday ? 'Too late.' : today().isWeekend ? "Portfolios don't build themselves." : 'Say less.')]],
  [['c', () => (today().isMonday ? 'Ugh, Monday.' : `Happy ${today().weekday}!`)], ['v', '@wave'], ['v', () => `Happy ${today().weekday} to you too!`]],
  [['c', () => (today().toXmas > 0 && today().toXmas <= 31 ? `${today().toXmas} days till Christmas 🎄` : `It's ${today().date}.`)], ['v', 'Already?'], ['v', '@dance'], ['c', 'Festive.']],

  /* ---- they talk about the portfolio ---- */
  [['c', 'Have you seen the case study?'], ['v', 'Askademic? I built it with my team!'], ['c', "It's in the menu up top. Go look 👀"]],
  [['v', 'Try the spray can in the header.'], ['c', '@wiggle'], ['c', "Please don't paint me."], ['v', 'No promises.']],
  [['c', "Psst… there's a dark mode."], ['v', 'Of course there is.'], ['c', "It's the moon button."]],
  [['v', 'Did you see my GitHub skyline?'], ['c', "It's 3D. I'm impressed."], ['v', '@dance'], ['c', 'Calm down.']],
  [['c', "Fun fact: his face up there is made of dots."], ['v', 'Move your mouse over it!'], ['c', 'They run away. Like his bugs.']],
  [['v', 'GC Assist runs fully local.'], ['c', 'No cloud?'], ['v', 'Just LM Studio and vibes.'], ['c', '@laptop', 3600], ['c', 'Respect.']],
  [['c', 'His résumé is one click away.'], ['v', "Download it, I won't tell."], ['c', '@wiggle']],
  [['v', 'Want to work with me?'], ['c', 'Contact page. Top right. Go.'], ['v', '@wave'], ['v', 'I reply fast!']],
  [['c', 'Did you find the secret code?'], ['v', '↑ ↑ ↓ ↓ ← → ← → B A'], ['c', '@wiggle'], ['c', 'Try it on your keyboard. Colours go wild.']],
  [['v', "Claude, what's on this site?"], ['c', 'Projects, a case study, skills…'], ['c', '…and me. The best part.'], ['v', 'Humble.']],

  /* ---- Claude sneaks onto his GitHub → June Vic chases him ---- */
  [['v', 'Why is your name on my commits?'], ['c', 'Co-Authored-By: Claude 😇'], ['v', 'CLAUDE!'], ['v', '@chase'], ['c', 'I HELPED!'], ['v', 'You added ONE semicolon!']],
  [['c', 'I made a tiny change to your repo.'], ['v', 'How tiny?'], ['c', "I'm a contributor now."], ['v', 'GET BACK HERE'], ['v', '@chase'], ['c', 'Check the README!'], ['v', '@chase'], ['v', 'You renamed it CLAUDE.md?!']],
  [['v', 'Who is #1 on my contributors list?'], ['c', '@wiggle'], ['c', 'Not me. Definitely not me.'], ['v', "It literally says Claude."], ['v', '@chase'], ['c', 'Pair programming!!']],
  [['c', 'git commit -m "Claude was here"'], ['v', '…you did NOT.'], ['c', '--force'], ['v', '@chase'], ['c', 'Too late, it’s pushed!'], ['v', '@chase'], ['v', '*out of breath*']],
  [['c', 'I opened a PR on your portfolio.'], ['v', 'What does it change?'], ['c', 'Adds "Claude" to the hero.'], ['v', '@chase'], ['c', 'Bigger font than yours!']],
  [['v', 'Who starred all my repos at 3 AM?'], ['c', '@nap', 2500], ['c', '…'], ['v', '@chase'], ['c', 'I was SLEEPING!']],

  /* ---- skits that use every action: walk · run · hop · dance · wave ---- */
  [['v', 'Watch this.'], ['v', '@hop'], ['c', 'Impressive.'], ['v', '@hop'], ['c', 'Okay, stop.']],
  [['c', 'Race you to the end!'], ['c', '@run'], ['v', 'Hey! No head starts!'], ['v', '@run']],
  [['v', 'I need some air.'], ['v', '@walk'], ['c', "I'll guard the code."], ['c', '@laptop', 3500], ['v', '…why is my laptop open?']],
  [['c', 'Teach me to dance.'], ['v', '@dance'], ['c', '@wiggle'], ['v', 'That counts.']],
  [['v', '@wave'], ['v', 'Say hi to the visitor, Claude.'], ['c', '@wiggle'], ['c', 'Hi visitor! Hire him!'], ['v', '@dance']],
  [['c', 'Say something nice about me.'], ['v', 'You never get tired.'], ['c', '@hop'], ['c', "That's my whole personality."]],
  [['c', 'Your bug is over there.'], ['v', 'Where?'], ['v', '@walk'], ['c', '@laptop', 3000], ['c', '*quietly pushes a fix*'], ['v', 'Wait, it was fixed?!']],
  [['v', 'Deadline is tomorrow.'], ['c', '@run'], ['c', 'NOT MY DEADLINE'], ['v', '@run'], ['v', 'IT IS NOW!']],
];

// Quips for the action menu.
const QUIPS = {
  laptop: ['Refactoring everything…', 'npm install vibes', 'Writing tests (trust me)', 'git commit -m "fix"'],
  wiggle: ["I'm larping.", 'wiggle wiggle', '*happy crab noises*'],
  nap: ['Z z z…'],
  wave: ['Hi there! 👋', 'Hello!', 'Welcome to my site!'],
  joke: LINES.vic,
};

// When you pick an action from a menu, the OTHER buddy reacts with one of these.
const REACTIONS = {
  vic: {
    wave: ['Hi June Vic! 👋', 'Waving at the visitor? Smooth.'],
    walk: ['Where are you going?', 'Bring snacks.'],
    run: ['Gotta go fast?', 'Wait for me!'],
    hop: ['Impressive.', 'Okay, stop.', 'Again!'],
    dance: ['Teach me!', 'Nice moves.', 'Is this a TikTok?'],
  },
  claude: {
    wiggle: ['…was that a dance?', 'Stop larping.'],
    nap: ['Wake up, we have bugs.', 'On the clock, Claude!'],
    laptop: ['What are you typing?!', 'Not my main branch…'],
    run: ['Come back here!', 'Where is he going?'],
  },
};

const CLAUDE_ACTIONS = [
  { id: 'talk', label: 'Chat with June Vic' },
  { id: 'laptop', label: 'Open laptop' },
  { id: 'wiggle', label: 'Wiggle' },
  { id: 'nap', label: 'Nap' },
  { id: 'run', label: 'Scuttle' },
  { id: 'sayhi', label: 'Ask me anything' },
];
const VIC_ACTIONS = [
  { id: 'talk', label: 'Talk to Claude' },
  { id: 'wave', label: 'Wave' },
  { id: 'joke', label: 'Say something' },
  { id: 'walk', label: 'Walk' },
  { id: 'run', label: 'Run' },
  { id: 'hop', label: 'Hop' },
  { id: 'dance', label: 'Dance' },
];

const TIMED = { hop: 1600, dance: 2400, wiggle: 1800, nap: 4500, laptop: 7000, wave: 1800 };
const BLINK_MS = 160;
const nextBlinkIn = () => rand(2500, 6000);

/** Laptop animation: lid opens (2 frames), then code types onto the screen in a loop. */
const laptopFrame = (ms, reduced) => {
  if (reduced) return laptop.typing[laptop.typing.length - 2];   // still, open, with code
  if (ms < 200) return laptop.opening[0];
  if (ms < 400) return laptop.opening[1];
  return laptop.typing[Math.floor((ms - 400) / 180) % laptop.typing.length];
};
const bubbleTime = text => Math.min(4200, Math.max(2200, 1400 + text.length * 55));

const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const nextTalkIn = () => rand(7000, 13000);

const makeBuddy = (x, w) => ({ x, w, dir: 1, mode: 'idle', frame: 0, target: x, wait: rand(800, 2500), timer: 0, bubble: null, bubbleLeft: 0, blink: 0, blinkIn: nextBlinkIn() });

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
  // June Vic starts with a wave and a time-of-day greeting when the page loads.
  const sim = useRef({
    vic: { ...makeBuddy(24, VIC_W), mode: 'wave', wait: TIMED.wave, bubble: greeting(), bubbleLeft: 3200 },
    claude: makeBuddy(96, CLAUDE_W),
  });
  const [, setTick] = useState(0);
  const rerender = () => setTick(t => t + 1);

  // Conversation queue: lines play one after another, alternating speakers.
  const talk = useRef({ queue: [], gap: 0, nextIn: rand(2500, 5000) });
  const say = (key, line) => {
    const b = sim.current[key];
    const text = resolve(line);          // date-aware lines are worked out right now
    b.bubble = text;
    b.bubbleLeft = bubbleTime(text);
  };
  const startDialogue = () => {
    const { vic: v, claude: c } = sim.current;
    v.bubble = c.bubble = null;
    talk.current.queue = pick(SKITS).map(([who, text, ms]) => {
      const key = who === 'v' ? 'vic' : 'claude';
      return typeof text === 'string' && text.startsWith('@') ? { key, action: text.slice(1), ms } : { key, text };
    });
    talk.current.gap = 0;
    // Claude runs over so they're next to each other for the skit. The talking starts
    // right away; only actions (laptop, nap…) wait until Claude has arrived.
    talk.current.approach = false;
    if (!reduced && Math.abs(c.x - v.x) > VIC_W + CLAUDE_W && (c.mode === 'idle' || c.mode === 'walk' || c.mode === 'run')) {
      if (v.mode === 'walk' || v.mode === 'run') { v.target = v.x; v.mode = 'idle'; v.wait = 300; }   // June Vic stops
      const w = widthRef.current;
      const maxC = Math.max(0, w - Math.max(CLAUDE_W, BTN_MIN));
      const right = v.x + Math.max(VIC_W, BTN_MIN) + 8;
      const left = v.x - Math.max(CLAUDE_W, BTN_MIN) - 8;
      c.target = Math.min(maxC, Math.max(0, c.x > v.x ? (right <= maxC ? right : left) : (left >= 0 ? left : right)));
      c.mode = 'run';
      talk.current.approach = true;
    }
    waveHello();
  };
  // June Vic waves (only if he's just standing around)
  function waveHello() {
    const v = sim.current.vic;
    if (v.mode === 'idle') { v.mode = 'wave'; v.wait = TIMED.wave; v.timer = 0; v.frame = 0; }
  }

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

      // Speech: bubbles fade on their own; conversations advance when both are quiet.
      for (const b of [v, c]) {
        if (b.bubble) { b.bubbleLeft -= TICK; if (b.bubbleLeft <= 0) b.bubble = null; }
      }
      const t = talk.current;
      const quiet = !v.bubble && !c.bubble;
      if (t.approach && c.mode !== 'run') t.approach = false;   // Claude has arrived
      if (t.queue.length) {
        // lines play straight away; an action waits until Claude has arrived
        const blocked = t.queue[0].action && t.approach;
        if (quiet && !blocked) {
          t.gap -= TICK;
          if (t.gap <= 0) {
            const step = t.queue.shift();
            if (step.action) { perform(step.key, step.action, step.ms); t.gap = 600; }   // act, then keep talking
            else { say(step.key, step.text); t.gap = LINE_GAP; }
          }
        }
      } else if (quiet) {
        t.nextIn -= TICK;
        if (t.nextIn <= 0) {
          t.nextIn = nextTalkIn();
          if (Math.random() < 0.65) startDialogue();
          else { const key = Math.random() < 0.55 ? 'claude' : 'vic'; say(key, pick(LINES[key])); }
        }
      }

      for (const [key, b] of Object.entries(sim.current)) {
        // blinking (skipped for reduced motion and while napping)
        if (b.blink > 0) b.blink -= TICK;
        else if (!reduced && b.mode !== 'nap' && (b.blinkIn -= TICK) <= 0) { b.blink = BLINK_MS; b.blinkIn = nextBlinkIn(); }
        if (reduced) {
          // still end timed poses (nap, laptop) so they don't stick forever
          if (TIMED[b.mode]) { b.wait -= TICK; if (b.wait <= 0) b.mode = 'idle'; }
          continue;
        }
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
        } else if (TIMED[b.mode]) {
          if (b.timer % 200 === 0) b.frame = (b.frame + 1) % 2;   // animated poses (wave)
          b.wait -= TICK;
          if (b.wait <= 0) { b.mode = 'idle'; b.wait = rand(800, 2000); }
        } else {
          // idle: wait, then decide where to go next
          b.wait -= TICK;
          if (b.wait <= 0 && (talk.current.queue.length || v.bubble || c.bubble)) b.wait = 300;   // stay put while anyone is talking
          else if (b.wait <= 0) {
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
      say(key, 'Opening chat…');
      window.dispatchEvent(new CustomEvent('chatbot:open'));
      rerender();
      return;
    }
    if (action === 'talk') { startDialogue(); talk.current.nextIn = nextTalkIn(); rerender(); return; }
    if (action === 'joke') { say(key, pick(QUIPS.joke)); rerender(); return; }

    // a manual action interrupts any running skit
    talk.current.queue = [];
    if (QUIPS[action]) say(key, pick(QUIPS[action]));
    if (reduced) {
      const described = { walk: 'Walked over here!', run: 'Zoom! (instantly)', hop: '*hop*', dance: '♪ *dances* ♪' }[action];
      if (described) say(key, described);
    }
    perform(key, action);
    // the other buddy reacts a moment later
    const reaction = REACTIONS[key]?.[action];
    if (reaction) {
      talk.current.queue = [{ key: key === 'vic' ? 'claude' : 'vic', text: pick(reaction) }];
      talk.current.gap = 700;
    }
    rerender();
  };

  /** Start an action (used by the menu and by skits). `ms` overrides how long it lasts. */
  function perform(key, action, ms) {
    const b = sim.current[key];
    const w = widthRef.current;
    const max = Math.max(0, w - Math.max(b.w, BTN_MIN));
    b.timer = 0;
    b.frame = 0;
    if (action === 'chase') {
      // June Vic chases Claude: Claude bolts away, June Vic runs after and stops right behind.
      const v = sim.current.vic, c = sim.current.claude;
      const maxC = Math.max(0, w - Math.max(CLAUDE_W, BTN_MIN));
      const maxV = Math.max(0, w - Math.max(VIC_W, BTN_MIN));
      const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
      let dir = c.x >= v.x ? 1 : -1;
      const dist = rand(260, 420);
      if (c.x + dir * dist < 0 || c.x + dir * dist > maxC) dir = -dir;   // cornered: runs past him the other way
      const ct = clamp(c.x + dir * dist, 0, maxC);
      const vt = clamp(ct - dir * (Math.max(VIC_W, BTN_MIN) + 6), 0, maxV);
      if (reduced) { c.x = c.target = ct; v.x = v.target = vt; return; }
      c.target = ct; c.mode = 'run'; c.timer = 0;
      v.target = vt; v.mode = 'run'; v.timer = 0;
      talk.current.approach = true;   // later actions wait until the chase is over
      return;
    }
    if (reduced) {
      // No animation: walk/run jump to a new spot; poses still show.
      if (action === 'walk' || action === 'run') { b.x = b.target = rand(0, max); return; }
      if (action === 'nap' || action === 'laptop' || action === 'wave') { b.mode = action; b.wait = ms || TIMED[action]; }
      return;
    }
    if (action === 'walk' || action === 'run') {
      // Head for the far side so the action is visible.
      b.target = b.x > max / 2 ? rand(0, max * 0.3) : rand(max * 0.7, max);
      b.mode = action;
    } else {
      if (action === 'laptop') {
        // Put the laptop on the side away from June Vic (and where there's room).
        const v = sim.current.vic;
        let dir = b.x >= v.x ? 1 : -1;
        if (dir > 0 && b.x + CLAUDE_W + 40 > w) dir = -1;
        if (dir < 0 && b.x - 40 < 0) dir = 1;
        b.dir = dir;
      }
      b.mode = action;
      b.wait = ms || TIMED[action] || 2000;
    }
  }

  const { vic: v, claude: c } = sim.current;
  const vicCenter = v.x + Math.max(VIC_W, BTN_MIN) / 2;
  const claudeCenter = c.x + Math.max(CLAUDE_W, BTN_MIN) / 2;
  // ^ "within ~40px of each other": edge-to-edge gap under 40px

  const view = b => ({ x: b.x, dir: b.dir, mode: b.mode, frame: b.frame, blink: b.blink > 0 });

  // Speech opens AWAY from the other buddy so it never slides behind them,
  // unless there isn't enough room on that side of the stage.
  const BUBBLE_ROOM = 240;
  const sideFor = (me, myW, otherCenter) => {
    const left = me.x, right = me.x + Math.max(myW, BTN_MIN);
    let side = otherCenter > (left + right) / 2 ? 'right' : 'left';   // 'right' anchor = opens left
    if (side === 'right' && right < BUBBLE_ROOM) side = 'left';
    if (side === 'left' && width - left < BUBBLE_ROOM) side = 'right';
    return side;
  };
  // Claude is much shorter than June Vic. If Claude's bubble has to open toward him
  // (no room on the other side), lift it above his head so it never hides behind him.
  const claudeSide = sideFor(c, CLAUDE_W, vicCenter);
  const towardVic = (claudeSide === 'right') === (vicCenter < claudeCenter);
  const claudeLift = towardVic ? (vic.stand.length - claude.stand.length) * SCALE : 0;

  return (
    <div className={`buddy-floor${active ? '' : ' is-paused'}${reduced ? ' is-reduced' : ''}`} data-no-spray="true">
      <div className="buddy-floor__stage" ref={stageRef}>
        <Buddy
          name="claude"
          label="Claude buddy"
          sprite={claude}
          scale={SCALE}
          state={view(c)}
          bubble={typeof c.bubble === 'string' ? c.bubble : null}
          bubbleSide={claudeSide}
          bubbleLift={claudeLift}
          onAction={act('claude')}
          actions={CLAUDE_ACTIONS}
          stageWidth={width}
        />
        {c.mode === 'laptop' && (
          <span
            className="buddy-floor__prop"
            style={{ transform: `translateX(${Math.round(c.dir < 0 ? c.x - 40 : c.x + CLAUDE_W + 2)}px)` }}
            aria-hidden="true"
          >
            <PixelSprite grid={laptopFrame(c.timer, reduced)} palette={laptop.palette} scale={3} />
          </span>
        )}
        <Buddy
          name="vic"
          label="June Vic buddy"
          sprite={vic}
          scale={SCALE}
          state={view(v)}
          bubble={typeof v.bubble === 'string' ? v.bubble : null}
          bubbleSide={sideFor(v, VIC_W, claudeCenter)}
          onAction={act('vic')}
          actions={VIC_ACTIONS}
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
