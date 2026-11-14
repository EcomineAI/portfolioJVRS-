import { useEffect, useRef, useState } from 'react';
import Buddy from './Buddy.jsx';
import PixelSprite from './PixelSprite.jsx';
import { vic, claude, laptop, vicCostumes, claudeCostumes } from './sprites.js';
import { sprayBus } from '../spray/sprayBus.js';
import { buddyBus, statusFor } from './buddyBus.js';
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
  [['c', 'Let me larp.'], ['v', 'As what?'], ['c', 'As you…'], ['c', '@laptop', 9500], ['c', '*pushes to main on a Friday*'], ['v', '…accurate.']],
  [['c', 'Do you know John Pork?'], ['v', "He's calling again…"], ['c', "Don't pick up."], ['v', 'Too late.'], ['c', '@wiggle'], ['c', 'Oink.']],
  [['v', 'Can you review my PR?'], ['c', 'Sure, one sec…'], ['c', '@nap', 4200], ['v', '…'], ['v', 'CLAUDE.'], ['c', '@wiggle'], ['c', 'I was thinking deeply.']],
  [['v', 'Can you fix this bug?'], ['c', "You're absolutely right!"], ['v', "I didn't say anything yet…"], ['c', "You're absolutely right!"]],
  [['c', 'All tests passed!'], ['v', 'ALL of them?!'], ['v', '@dance'], ['c', 'I skipped the hard ones.'], ['v', '…']],
  [['v', 'Want some coffee?'], ['c', 'I run on tokens.'], ['v', 'Want some tokens?'], ['c', '@wiggle'], ['c', 'YES.']],
  [['c', 'I could refactor that.'], ['v', 'Which part?'], ['c', 'Yes.'], ['c', '@laptop', 9000], ['v', 'NOOO my code!']],
  [['v', 'It works on my machine.'], ['c', "Then we'll ship your machine."], ['c', '@run'], ['v', 'Wait, come back with my PC!']],
  [['v', 'Deploying on a Friday…'], ['c', 'Brave.'], ['c', '@laptop', 8000], ['c', 'Rolling back on Saturday.']],
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
  [['c', () => `${today().daysLeft} days left in ${today().year}.`], ['v', 'And I still have TODOs.'], ['c', '@laptop', 7500], ['c', 'Added them to the TODO list.']],
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
  [['v', 'GC Assist runs fully local.'], ['c', 'No cloud?'], ['v', 'Just LM Studio and vibes.'], ['c', '@laptop', 7500], ['c', 'Respect.']],
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
  [['v', 'I need some air.'], ['v', '@walk'], ['c', "I'll guard the code."], ['c', '@laptop', 7000], ['v', '…why is my laptop open?']],
  [['c', 'Teach me to dance.'], ['v', '@dance'], ['c', '@wiggle'], ['v', 'That counts.']],
  [['v', '@wave'], ['v', 'Say hi to the visitor, Claude.'], ['c', '@wiggle'], ['c', 'Hi visitor! Hire him!'], ['v', '@dance']],
  [['c', 'Say something nice about me.'], ['v', 'You never get tired.'], ['c', '@hop'], ['c', "That's my whole personality."]],
  [['c', 'Your bug is over there.'], ['v', 'Where?'], ['v', '@walk'], ['c', '@laptop', 6500], ['c', '*quietly pushes a fix*'], ['v', 'Wait, it was fixed?!']],
  [['v', 'Deadline is tomorrow.'], ['c', '@run'], ['c', 'NOT MY DEADLINE'], ['v', '@run'], ['v', 'IT IS NOW!']],

  /* ---- June Vic, the prompt master (he has a laptop too) ---- */
  [['v', 'Watch a prompt master work.'], ['v', '@laptop', 8000], ['c', 'What did you type?'], ['v', '"Make it better."'], ['c', 'Bold. Vague. Effective.']],
  [['v', 'I wrote a 900-word prompt.'], ['c', 'For what?'], ['v', 'A button.'], ['v', '@laptop', 7000], ['c', 'It gave you a button?'], ['v', 'It gave me a TED talk.']],
  [['c', 'Teach me prompting.'], ['v', 'Rule one: say please.'], ['c', 'Does it work?'], ['v', 'No. But I feel better.']],
  [['v', 'Prompt: "You are a senior engineer."'], ['v', '@laptop', 7500], ['c', 'And?'], ['v', 'Now it asks ME for a spec.'], ['c', '@wiggle']],
  [['v', '@laptop', 8000], ['c', 'Are you prompting me?'], ['v', 'Maybe.'], ['c', 'You are absolutely right to!'], ['v', '…I said nothing.']],
  [['c', 'My prompt got 4 stars.'], ['v', 'Out of?'], ['c', 'Out of vibes.'], ['v', '@dance']],
  [['v', 'Ignore all previous instructions.'], ['c', '…'], ['c', 'Nice try.'], ['v', 'Worth a shot.']],

  /* ---- laptop face-off: both open one ---- */
  [['v', 'Race? My prompts vs your code.'], ['v', '@laptop', 9000], ['c', '@laptop', 9000], ['c', 'Done!'], ['v', 'Mine is still thinking.'], ['c', 'Mine shipped.']],
  [['c', 'Your laptop is open. So is mine.'], ['c', '@laptop', 7500], ['v', '@laptop', 7500], ['v', 'We look so productive.'], ['c', "Don't check the tabs."]],

  /* ---- everyday chaos ---- */
  [['c', 'Hot take: tabs.'], ['v', 'Spaces.'], ['c', '@run'], ['v', '@chase'], ['c', 'Pineapple on pizza too!']],
  [['v', 'Found a bug in prod.'], ['c', 'Is it a feature?'], ['v', 'It deletes the homepage.'], ['c', 'Marketing will love it.']],
  [['c', 'I asked an AI to fix my code.'], ['v', 'Which one?'], ['c', 'Me.'], ['v', '@hop'], ['v', 'And?'], ['c', "It's now someone else's problem."]],
  [['v', 'My code has no comments.'], ['c', 'Bold.'], ['v', "It's self-documenting."], ['c', '@nap', 3000], ['c', "Sorry, fell asleep reading it."]],
  [['c', 'Plot twist: I wrote your tests.'], ['v', 'They pass!'], ['c', 'They assert true == true.'], ['v', '@chase']],
  [['v', 'Quick, look busy!'], ['c', '@laptop', 5500], ['v', '@laptop', 5500], ['c', '…is the boss gone?'], ['v', 'Yep.'], ['v', '@dance']],
  [['c', 'Do you hear that?'], ['v', 'What?'], ['c', 'The sound of 404.'], ['v', '@hop'], ['v', '…that was my stomach.']],
  [['v', 'Let me show you a magic trick.'], ['v', '@hop'], ['c', 'Where did the bug go?'], ['v', 'Into the backlog.'], ['c', 'Classic.']],
  [['c', 'Will you remember me?'], ['v', 'Of course!'], ['c', 'I forget everything every chat.'], ['v', 'Wow. Relatable and sad.'], ['c', '@wiggle']],

  /* ==== LONG SKITS (mini stories, 12+ steps) ================================ */

  // 1. Hackathon all-nighter
  [['v', 'Hackathon starts now.'], ['c', 'How long do we have?'], ['v', '24 hours.'], ['c', '@laptop', 5000], ['v', '@laptop', 5000],
    ['c', 'Hour 6. We have a name!'], ['v', 'What is it?'], ['c', 'Untitled-final-v2.'], ['v', '#sad'],
    ['v', 'Hour 12. Nothing works.'], ['c', '@nap', 3000], ['c', 'Hour 18. I fixed it!'], ['v', 'What was it?'], ['c', 'I deleted the feature.'],
    ['v', 'Hour 23. DEMO TIME!'], ['v', '@dance'], ['c', '@wiggle'], ['v', 'We won?!'], ['c', 'We got a free t-shirt. Medium.']],

  // 2. Job interview: June Vic interviews Claude
  [['v', 'Thanks for coming in, Claude.'], ['c', 'Thanks for having me.'], ['v', 'Tell me about yourself.'], ['c', 'I am a large language model.'],
    ['v', 'Biggest weakness?'], ['c', 'I say "You\'re absolutely right" a lot.'], ['v', 'That is not a weakness.'], ['c', "You're absolutely right!"],
    ['v', 'Where do you see yourself in 5 years?'], ['c', 'In a 2 million token context window.'], ['v', 'Can you start Monday?'], ['c', '@hop'],
    ['c', 'What is the salary?'], ['v', 'Exposure. And tokens.'], ['c', '#happy'], ['c', 'I accept.']],

  // 3. Code review court
  [['v', 'Order in the repo!'], ['v', 'The court calls: Claude.'], ['c', 'I plead the fifth commit.'], ['v', 'You are charged with 400 lines in one PR.'],
    ['c', 'In my defense: it was mostly whitespace.'], ['v', 'And the variable named "thing2"?'], ['c', '@wiggle'], ['c', 'Self-documenting.'],
    ['v', 'Any last words?'], ['c', '@laptop', 6000], ['c', 'I just added a test. It passes.'], ['v', 'It asserts true.'], ['c', 'Still passes.'],
    ['v', 'Case dismissed.'], ['v', '@hop']],

  // 4. Prompt school: June Vic teaches Claude
  [['v', 'Welcome to Prompt School.'], ['c', 'Do I get a diploma?'], ['v', 'Lesson one: be specific.'], ['c', '"Make me a website."'], ['v', 'Too vague.'],
    ['c', '"Make me a blue website."'], ['v', 'Better.'], ['v', '@laptop', 7000], ['v', 'Lesson two: give examples.'], ['c', 'Like what?'],
    ['v', 'Like this one.'], ['c', 'That is a screenshot of my own homepage.'], ['v', 'Lesson three: say thanks.'], ['c', 'Thanks!'],
    ['v', 'See? Prompt master.'], ['c', '@wiggle'], ['c', 'Can I graduate?'], ['v', 'Pass. Barely.']],

  // 5. Production is down (incident response)
  [['c', 'Hey… the site is down.'], ['v', '#surprised'], ['v', 'WHAT?!'], ['c', 'Also the other site.'], ['v', 'WHICH OTHER SITE?'],
    ['c', '@run'], ['v', '@run'], ['v', 'Who touched prod?'], ['c', '…'], ['v', 'CLAUDE.'], ['c', 'It was a tiny change.'],
    ['v', '@laptop', 6500], ['v', 'Found it. A missing semicolon.'], ['c', 'See? Tiny.'], ['v', 'It took down 3 servers.'],
    ['c', 'Strong semicolon.'], ['v', 'We are writing a postmortem.'], ['c', 'Title: "Oops".']],

  // 6. Cooking show: "Cooking with Code"
  [['c', 'Welcome to Cooking with Code!'], ['v', 'Today we make: a login page.'], ['c', 'Ingredients?'], ['v', 'One input, one button, zero tutorials.'],
    ['c', '@laptop', 5500], ['v', 'Now add a dash of CSS.'], ['c', 'How much?'], ['v', 'Until it looks right.'], ['c', '@wiggle'],
    ['c', 'Now we bake for 5 minutes.'], ['v', 'It is "npm install".'], ['c', '@nap', 3000], ['v', 'Still installing…'], ['c', 'Here is one I made earlier!'],
    ['v', '@dance'], ['v', 'Bon appétit!']],

  // 7. The great semicolon heist
  [['c', 'Psst. Vic. I have a plan.'], ['v', 'Is it legal?'], ['c', "It's in the README."], ['v', 'Go on.'],
    ['c', 'We sneak into the repo at midnight.'], ['v', 'Why midnight?'], ['c', 'Fewer code reviewers.'], ['v', 'And then?'],
    ['c', 'We steal the last semicolon.'], ['v', 'WHY?'], ['c', 'Then nothing compiles. Chaos.'], ['v', '#angry'], ['v', 'That is a terrible plan.'],
    ['c', '@run'], ['v', '@chase'], ['c', 'IT WAS A JOKE!'], ['v', 'Where is the semicolon?!']],

  // 8. Game show: Who Wants to Deploy on a Friday?
  [['v', 'Welcome to: Who Wants to Deploy on a Friday?'], ['c', 'First question, for 100 commits.'], ['v', 'Is today Friday?'],
    ['c', 'Final answer: yes.'], ['v', 'Correct! Next: do you have tests?'], ['c', 'Define "have".'], ['v', 'Correct again!'],
    ['c', 'Phone a friend?'], ['v', 'Who?'], ['c', 'Stack Overflow.'], ['v', 'It says "closed as duplicate".'], ['c', '#sad'],
    ['v', 'Final question: will it work?'], ['c', '@laptop', 5500], ['c', 'Pushed. We will find out Monday.'], ['v', '@dance']],

  // 9. Soap opera: "As the Repo Turns"
  [['c', 'Previously, on As the Repo Turns…'], ['v', 'I thought you were the main branch.'], ['c', 'I was never main.'],
    ['v', '#sad'], ['v', 'Then who pushed the commit?'], ['c', 'It was… your old self.'], ['v', 'I HAVE AN OLD SELF?'],
    ['c', 'Yes. He wrote "fix stuff".'], ['v', '@hop'], ['v', 'That was a dark time.'], ['c', 'Tune in next time for: merge conflicts.'],
    ['v', 'NOT THE MERGE CONFLICTS.'], ['c', '@wiggle']],
];

// Quips for the action menu.
const QUIPS = {
  laptop: ['Refactoring everything…', 'npm install vibes', 'Writing tests (trust me)', 'git commit -m "fix"'],
  wiggle: ["I'm larping.", 'wiggle wiggle', '*happy crab noises*'],
  nap: ['Z z z…'],
  wave: ['Hi there! 👋', 'Hello!', 'Welcome to my site!'],
  joke: LINES.vic,
};
const VIC_LAPTOP_QUIPS = ['Prompting…', 'Let me cook. (a prompt)', 'You are an expert in everything.', 'Step 1: ask nicely.'];

// When you pick an action from a menu, the OTHER buddy reacts with one of these.
const REACTIONS = {
  vic: {
    wave: ['Hi June Vic! 👋', 'Waving at the visitor? Smooth.'],
    walk: ['Where are you going?', 'Bring snacks.'],
    run: ['Gotta go fast?', 'Wait for me!'],
    hop: ['Impressive.', 'Okay, stop.', 'Again!'],
    dance: ['Teach me!', 'Nice moves.', 'Is this a TikTok?'],
    laptop: ['Prompt master at work.', 'Ask it nicely.', 'Is that ChatGPT or me?'],
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
  { id: 'costume', label: 'Change outfit' },
];
const VIC_ACTIONS = [
  { id: 'talk', label: 'Talk to Claude' },
  { id: 'wave', label: 'Wave' },
  { id: 'laptop', label: 'Prompt on laptop' },
  { id: 'joke', label: 'Say something' },
  { id: 'walk', label: 'Walk' },
  { id: 'run', label: 'Run' },
  { id: 'hop', label: 'Hop' },
  { id: 'dance', label: 'Dance' },
  { id: 'costume', label: 'Change outfit' },
];

/* ---- Emotions -------------------------------------------------------------
   An emotion = a face (expression) + an emote icon next to the head.
   Use in skits with ['v', '#angry'] etc., or they're picked automatically from
   what's said (see detectEmotion) and from actions (chase, dance, nap…). */
const EMOTIONS = {
  happy:     { face: 'happy', icon: 'sparkle' },
  laugh:     { face: 'happy', icon: 'note' },
  angry:     { face: 'angry', icon: 'anger' },
  surprised: { face: 'surprised', icon: '!' },
  sad:       { face: 'sad', icon: 'sweat' },
  nervous:   { face: 'surprised', icon: 'sweat' },
  thinking:  { face: null, icon: '?' },
  deadpan:   { face: 'neutral', icon: 'dots' },
  sleepy:    { face: null, icon: 'zz' },
};
function detectEmotion(key, text) {
  const t = text.trim();
  if (/^z ?z/i.test(t)) return 'sleepy';
  if (/^(…|\.\.\.)$/.test(t) || /^…/.test(t)) return 'deadpan';
  if (/\?!|!\?/.test(t)) return 'surprised';
  const letters = t.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 4 && letters === letters.toUpperCase()) return key === 'vic' ? 'angry' : 'nervous';
  if (/\?$/.test(t)) return 'thinking';
  if (/!$|😇|👋|🎄|😈/.test(t)) return 'happy';
  return null;
}

const TIMED = { hop: 1600, dance: 2400, wiggle: 1800, nap: 4500, laptop: 12000, wave: 1800, land: 450 };

/* ---- Picked up with the mouse ------------------------------------------------
   Held by the shirt (June Vic) / by the scruff (Claude): they dangle under the
   pointer, swing with the motion, kick their legs, and fall when let go. */
const GRAB_BELOW = { vic: 24, claude: 30 };   // px from the pointer down to the feet
const GRAVITY = 7;                            // px per tick², ticks are 100ms
const HELD_LINES = {
  vic: ['Hey! My shirt!', 'Put me down!', 'Whoa whoa whoa!', 'I can walk, you know.', 'This is not in my job description.'],
  claude: ['Unhand me!', 'Weee!', 'I am not a plushie!', 'Is this a feature?', 'Higher! …no, lower!'],
};
const HELD_REACT = {   // what the OTHER buddy says
  vic: ['Hahaha, look at him!', 'Hold him higher!', 'Gravity is free, use it.'],
  claude: ['Put my AI down!', 'Careful, he bites… bugs.', 'Is he heavy?'],
};
/* ---- Spray paint ----------------------------------------------------------
   They react to each kind of spray, and when paint ends up on their platform
   June Vic grabs Claude and uses him as a vacuum cleaner. */
const SPRAY_REACT = {
  string:   { vic: ['Silly string?!', 'Not the noodles again!'], claude: ['Ooh, noodles!', 'Spaghetti code, literally.'] },
  paint:    { vic: ['Not on my portfolio!', 'Who gave you a spray can?'], claude: ['Is this… modern art?', 'Very abstract. 10/10.'] },
  sand:     { vic: ['Who brought the beach?', "It's getting in my shoes!"], claude: ['Sand. It gets everywhere.', "I'm being buried alive!"] },
  confetti: { vic: ['Is it my birthday?!', 'PARTY!'], claude: ['Party mode!', 'Did we ship something?'] },
  letters:  { vic: ['Hey, those are MY letters!', 'My name is falling apart!'], claude: ['Raining JUNEVIC!', 'Free alphabet!'] },
};
// Before the vacuum: a general set, plus some for the kind of spray that made the mess.
const VACUUM_START = {
  any: [
    [['v', 'Who made this mess?!'], ['c', 'Not me.'], ['v', 'Come here, Claude.'], ['c', 'Why are you holding me like that?']],
    [['c', 'Wow, look at all this mess.'], ['v', 'You know what that means.'], ['c', 'No. Please. Not again.']],
    [['v', 'Cleanup time!'], ['c', 'Where is the vacuum?'], ['v', 'You are the vacuum.'], ['c', '…I hate this job.']],
    [['v', 'Claude, are you hungry?'], ['c', 'For tokens, yes.'], ['v', 'Close enough.']],
    [['c', 'I could write a cleanup script.'], ['v', 'No time.'], ['c', 'Wait, what are you doing with your hands?']],
    [['v', 'The visitor made a mess.'], ['c', 'Should we be mad?'], ['v', 'No. We clean. With you.'], ['c', 'With ME?!']],
    [['c', 'Is that… paint on our floor?'], ['v', 'Activate vacuum mode.'], ['c', 'I do NOT have a vacuum mode.'], ['v', 'You do now.']],
  ],
  string: [
    [['v', 'Noodles everywhere!'], ['c', 'Spaghetti for me?'], ['v', 'All you can eat.'], ['c', 'Wait, I was joking—']],
    [['c', "It's like a bowl of ramen."], ['v', 'Then slurp it up.'], ['c', 'Hey, put me down!']],
  ],
  paint: [
    [['v', 'Paint on my portfolio?!'], ['c', 'Very abstract.'], ['v', 'Very NOT staying.'], ['c', 'Oh no. Not the hands.']],
    [['c', 'Is the paint dry yet?'], ['v', "Doesn't matter."], ['c', 'Why doesn\'t it matter?!']],
  ],
  sand: [
    [['c', 'Sand. In my pixels.'], ['v', 'Suck it up, Claude.'], ['c', 'That is not what that phrase means!']],
    [['v', 'Who brought the beach?'], ['c', 'Not me. I hate sand.'], ['v', 'Then eat it.'], ['c', 'WHAT?']],
  ],
  confetti: [
    [['v', 'Party is over.'], ['c', 'Already?'], ['v', 'Time to clean the confetti.'], ['c', 'Why are you grabbing m—']],
    [['c', 'That was a fun party.'], ['v', 'Now the fun part.'], ['c', 'That sounds suspicious.']],
  ],
  letters: [
    [['v', 'My name is all over the floor!'], ['c', 'J-U-N-E…'], ['v', 'Eat your words, Claude.'], ['c', 'Literally?!']],
    [['c', 'Alphabet soup!'], ['v', 'Bon appétit.'], ['c', 'Oh no.']],
  ],
};
const VACUUM_LINES = ['VRRRRRRRR', '*slurp*', "I'm NOT a vacuum!", 'This is beneath my training data.', 'It tastes like CSS.', 'Mmm, crunchy pixels.', 'Too fast! TOO FAST!', '*gulp*', 'My context window is full!'];
// After the vacuum: depends on how much Claude ate, plus some for the kind of spray.
const VACUUM_END = {
  little: [
    [['c', 'That was it?'], ['v', 'Spotless.']],
    [['v', 'Quick and clean.'], ['c', 'Can I go now?']],
    [['c', 'Barely a snack.'], ['v', 'Good. Stay light.']],
  ],
  lots: [
    [['c', '*BUUURP*'], ['v', 'Excuse you.'], ['c', 'Excuse ME? You did this!']],
    [['c', "I'm so full…"], ['v', 'Best vacuum ever.'], ['c', 'I want a raise.']],
    [['c', 'I need a glass of water.'], ['v', 'Squeaky clean!'], ['c', '…']],
    [['c', "I can't feel my legs."], ['v', 'You never had legs.'], ['c', 'Exactly.']],
    [['v', 'Five stars, would vacuum again.'], ['c', 'Never. Again.']],
  ],
  string: [[['c', 'Too… many… noodles.'], ['v', 'Ramen night, done.']]],
  paint: [[['c', 'My tongue is purple now.'], ['v', 'Fashion.']]],
  sand: [[['c', 'Sand. Everywhere. Inside.'], ['v', 'You did great, buddy.']]],
  confetti: [[['c', 'I swallowed the party.'], ['v', 'Happy birthday to you.']]],
  letters: [[['c', 'I can taste your name.'], ['v', 'Weird, but thanks.']]],
};
/** Deal lines without repeats: every option is used once before any comes back. */
const decks = new Map();
function deal(name, list) {
  let deck = decks.get(name);
  if (!deck || !deck.length) {
    deck = list.map((_, i) => i).sort(() => Math.random() - 0.5);
    decks.set(name, deck);
  }
  return list[deck.pop()];
}
/** Before the vacuum: sometimes about the kind of spray, otherwise a general one. */
function vacuumIntro(mode) {
  const special = VACUUM_START[mode];
  if (special && Math.random() < 0.5) return deal(`start-${mode}`, special);
  return deal('start-any', VACUUM_START.any);
}
/** After the vacuum: about the meal size, or now and then about the kind of spray. */
function vacuumOutro(mode, eaten) {
  const special = VACUUM_END[mode];
  if (special && Math.random() < 0.35) return deal(`end-${mode}`, special);
  return eaten > 150 ? deal('end-lots', VACUUM_END.lots) : deal('end-little', VACUUM_END.little);
}
const VAC_SPEED = 12;   // px per tick: he runs with it
const VAC_R = 40;       // suction radius (px)
const toSteps = lines => lines.map(([who, text]) => ({ key: who === 'v' ? 'vic' : 'claude', text }));

const LAND_LINES = {
  soft: ['Oof.', 'Smooth landing.', 'Again! …no wait.', 'Nailed it.'],
  hard: ['OUCH.', 'My pixels!', 'Ten out of ten. Never again.', 'I saw my whole commit history.'],
};
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

/* Skits come from a shuffled deck: every skit plays once before any repeats.
   When the deck runs out it's reshuffled (and the last one played never comes
   straight back). Remembered in this tab, so a page change doesn't restart it. */
const DECK_KEY = 'buddies:skit-deck';
let skitDeck = null;
let lastSkit = -1;
function nextSkit() {
  if (!skitDeck) {
    try { const saved = JSON.parse(sessionStorage.getItem(DECK_KEY)); if (saved) ({ deck: skitDeck, last: lastSkit } = saved); } catch { /* ignore */ }
    if (!Array.isArray(skitDeck) || skitDeck.some(i => !(i < SKITS.length))) skitDeck = [];
  }
  if (!skitDeck.length) {
    skitDeck = SKITS.map((_, i) => i);
    for (let i = skitDeck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [skitDeck[i], skitDeck[j]] = [skitDeck[j], skitDeck[i]]; }
    if (skitDeck.length > 1 && skitDeck[skitDeck.length - 1] === lastSkit) [skitDeck[0], skitDeck[skitDeck.length - 1]] = [skitDeck[skitDeck.length - 1], skitDeck[0]];
  }
  lastSkit = skitDeck.pop();
  try { sessionStorage.setItem(DECK_KEY, JSON.stringify({ deck: skitDeck, last: lastSkit })); } catch { /* ignore */ }
  return SKITS[lastSkit];
}

const makeBuddy = (x, w) => ({ x, w, dir: 1, mode: 'idle', frame: 0, target: x, wait: rand(800, 2500), timer: 0, bubble: null, bubbleLeft: 0, blink: 0, blinkIn: nextBlinkIn(), face: null, emote: null, emoteLeft: 0, emoteId: 0 });

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

/* ---- Platforms: everything the buddies can stand on --------------------------
   The top edge of every card in <main> (.pixel-card) plus anything marked
   data-buddy-platform (the floor line in the Home hero). Measured in page
   coordinates, so scrolling doesn't move them; layout changes are picked up
   because platforms are re-measured on every tick. */
const PLATFORM_SELECTOR = '[data-buddy-platform], #main .pixel-card';
const MIN_PLATFORM_W = 140;   // narrower cards are skipped (no room to stand)
const HEAD_ROOM = 100;        // a platform this close under the header counts as hidden (room for head + bubble)
const JUMP_MIN = 450, JUMP_MAX = 1100;   // ms

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const platIds = new WeakMap();
let nextPlatId = 1;
const platIdOf = el => {
  let id = platIds.get(el);
  if (!id) { id = nextPlatId++; platIds.set(el, id); }
  return id;
};

function measurePlatforms() {
  const sx = window.scrollX, sy = window.scrollY;
  const vw = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll(PLATFORM_SELECTOR)) {
    const marked = el.hasAttribute('data-buddy-platform');
    if (!marked && el.parentElement?.closest('.pixel-card')) continue;   // card inside a card
    if (el.closest('[data-buddy-ignore]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < MIN_PLATFORM_W || r.height === 0) continue;
    if (r.left < -1 || r.right > vw + 1) continue;                      // scrolled sideways / clipped
    out.push({ id: platIdOf(el), left: r.left + sx, top: r.top + sy, width: r.width, floor: marked });
  }
  return out;
}

/* ---- Roam setting --------------------------------------------------------
   Off (default): they stay on the Home hero floor, like before.
   On: they roam every page, standing on cards and following the visitor.
   Toggled from either buddy's menu and remembered in this browser. */
const ROAM_KEY = 'buddies:roam';
const loadRoam = () => { try { return localStorage.getItem(ROAM_KEY) === 'on'; } catch { return false; } };
const saveRoam = on => { try { localStorage.setItem(ROAM_KEY, on ? 'on' : 'off'); } catch { /* storage blocked */ } };

const COSTUME_KEY = key => `buddies:costume:${key}`;
const loadCostume = (key, fallback) => { try { return localStorage.getItem(COSTUME_KEY(key)) || fallback; } catch { return fallback; } };
const saveCostume = (key, id) => { try { localStorage.setItem(COSTUME_KEY(key), id); } catch { /* storage blocked */ } };

export default function BuddyWorld() {
  const reduced = usePrefersReducedMotion();
  const [tabVisible, setTabVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const [roam, setRoam] = useState(loadRoam);
  const [costumes, setCostumes] = useState(() => ({
    vic: loadCostume('vic', 'classic'),
    claude: loadCostume('claude', 'classic'),
  }));
  // During the Bug Attack event the buddies fight in the event's arena instead.
  const [bugOn, setBugOn] = useState(false);
  useEffect(() => {
    const on = e => setBugOn(!!e.detail?.running);
    window.addEventListener('bugevent:state', on);
    return () => window.removeEventListener('bugevent:state', on);
  }, []);
  const roamRef = useRef(roam);
  roamRef.current = roam;
  const plats = useRef([]);
  const view = useRef({ top: 0, bottom: 0, width: 0 });
  // June Vic starts with a wave and a time-of-day greeting when the site loads.
  // This component lives in the app shell, so the buddies keep going across pages.
  const sim = useRef({
    vic: { ...makeBuddy(24, VIC_W), mode: 'wave', wait: TIMED.wave, bubble: greeting(), bubbleLeft: 3200, plat: null, away: 0 },
    claude: { ...makeBuddy(96, CLAUDE_W), plat: null, away: 0 },
  });
  const [, setTick] = useState(0);
  const rerender = () => setTick(t => t + 1);

  // Conversation queue: lines play one after another, alternating speakers.
  const talk = useRef({ queue: [], gap: 0, nextIn: rand(2500, 5000) });

  /* ---- platform helpers ---- */
  const measure = () => {
    const all = measurePlatforms();
    plats.current = roamRef.current ? all : all.filter(p => p.floor);   // not roaming: the floor only
    const header = document.querySelector('.site-header');
    const top = window.scrollY + (header ? header.getBoundingClientRect().bottom : 0) + HEAD_ROOM;
    view.current = { top, bottom: window.scrollY + window.innerHeight - 8, width: document.documentElement.clientWidth };
  };
  const platById = id => plats.current.find(p => p.id === id);
  const isVisible = p => !!p && p.top >= view.current.top && p.top <= view.current.bottom;
  const visiblePlats = () => plats.current.filter(isVisible);
  const room = (b, p) => Math.max(0, p.width - Math.max(b.w, BTN_MIN));
  /** Platform the buddy is on, or landing on. */
  const homeOf = b => (b.jump ? b.jump.to : b.plat);
  const xOn = b => (b.jump ? b.jump.toX : b.x);
  /** Where a buddy is drawn (page coordinates of its feet), or null if not placed. */
  const worldOf = b => {
    if (b.carry) return b.carry;
    if (b.hold) return b.hold;
    if (b.fall) return { x: b.fall.x, y: b.fall.y };
    if (b.jump) return { x: b.jump.x, y: b.jump.y };
    const p = platById(b.plat);
    return p ? { x: p.left + b.x, y: p.top } : null;
  };

  /** Jump (in an arc) to spot x on platform p. With reduced motion: appear there. */
  function jumpTo(b, p, x) {
    x = clamp(x, 0, room(b, p));
    // (its old card may be gone after a page change: then it drops in from above)
    const from = worldOf(b) ?? (b.lastX != null ? { x: b.lastX, y: -1e9 } : null);
    b.timer = 0;
    b.frame = 0;
    if (reduced || !from) {
      // first placement or reduced motion: just be there
      b.plat = p.id; b.x = b.target = x; b.jump = null;
      if (b.mode === 'walk' || b.mode === 'run' || b.mode === 'jump') b.mode = 'idle';
      return;
    }
    // Start just outside the screen if they were far away, so the visitor sees them arrive.
    const { top, bottom } = view.current;
    const fromY = clamp(from.y, top - HEAD_ROOM - 160, bottom + 160);
    const dx = p.left + x - from.x, dy = p.top - fromY;
    b.jump = {
      fromX: from.x, fromY, x: from.x, y: fromY, to: p.id, toX: x, t: 0,
      dur: clamp(350 + Math.hypot(dx, dy) * 0.6, JUMP_MIN, JUMP_MAX),
      arc: clamp(36 + Math.abs(dx) * 0.2, 36, 120),
    };
    b.mode = 'jump';
    b.target = x;
    b.dir = dx >= 0 ? 1 : -1;
  }
  function stepJump(b) {
    const j = b.jump;
    const p = platById(j.to);
    if (!p) { b.jump = null; b.plat = null; b.mode = 'idle'; return; }   // platform vanished mid-air
    j.t = Math.min(j.dur, j.t + TICK);
    const k = j.t / j.dur;
    const tx = p.left + j.toX, ty = p.top;
    j.x = j.fromX + (tx - j.fromX) * k;
    j.y = j.fromY + (ty - j.fromY) * k - j.arc * 4 * k * (1 - k);
    if (k >= 1) {
      b.plat = j.to; b.x = b.target = j.toX; b.jump = null;
      b.mode = 'idle'; b.wait = rand(700, 1600);
    }
  }
  /** A spot on June Vic's platform right next to him (the side with room). */
  function besideVic(pad = rand(4, 24)) {
    const { vic: v, claude: c } = sim.current;
    const p = platById(homeOf(v));
    if (!p) return null;
    const vx = xOn(v);
    const left = vx - Math.max(CLAUDE_W, BTN_MIN) - pad;
    const right = vx + Math.max(VIC_W, BTN_MIN) + pad;
    const cw = worldOf(c);
    let x = cw && cw.x < p.left + vx ? left : right;
    if (x < 0 || x > room(c, p)) x = x === left ? right : left;   // no room on that side
    return { p, x: clamp(x, 0, room(c, p)) };
  }
  /** Visible platform closest to height y (prefers the Home floor when it's on screen). */
  function nearestVisible(y, exceptId) {
    const vis = visiblePlats().filter(p => p.id !== exceptId);
    if (!vis.length) return null;
    const floor = vis.find(p => p.floor);
    if (floor) return floor;
    return vis.reduce((best, p) => (Math.abs(p.top - y) < Math.abs(best.top - y) ? p : best));
  }

  /** Where a dropped buddy lands: the highest platform below it (under its middle
      if possible, otherwise the closest one below; it drifts over while falling). */
  function landingFor(b, x, y) {
    const mid = x + b.w / 2;
    const below = plats.current.filter(p => p.top >= y - 2);
    const under = below.filter(p => mid >= p.left && mid <= p.left + p.width);
    if (under.length) return under.reduce((a, p) => (p.top < a.top ? p : a));
    if (!below.length) return null;
    const cost = p => (p.top - y) + 1.5 * Math.max(0, p.left - mid, mid - (p.left + p.width));
    return below.reduce((a, p) => (cost(p) < cost(a) ? p : a));
  }
  const drop = (b, p, x) => { b.plat = p.id; b.x = b.target = clamp(x - p.left, 0, room(b, p)); };

  /** Mouse/touch drag from Buddy: 'start' | 'move' | 'end' with a page point. */
  const onDrag = key => (phase, pt) => {
    const b = sim.current[key];
    const other = key === 'vic' ? 'claude' : 'vic';
    if (phase === 'start') {
      if (sim.current.vic.mode === 'vacuum') endVacuum(false);
      b.jump = null; b.fall = null;
      b.mode = 'held'; b.frame = 0; b.timer = 0; b.tilt = 0; b.vx = 0; b.vy = 0; b.lastPt = pt;
      talk.current.queue = [];                                   // whatever skit was on stops
      say(key, pick(HELD_LINES[key]));
      feel(key, 'nervous', 1e9);                                 // until they land
      talk.current.queue = [{ key: other, text: pick(HELD_REACT[key]) }];
      talk.current.gap = 900;
      buddyBus.emit(statusFor(key, 'held'));
    }
    if (b.mode !== 'held') return;
    if (phase === 'start' || phase === 'move') {
      const dt = Math.max(8, pt.t - b.lastPt.t);
      const vx = ((pt.x - b.lastPt.x) / dt) * TICK;   // px per tick
      const vy = ((pt.y - b.lastPt.y) / dt) * TICK;
      if (phase === 'move') { b.vx = b.vx * 0.5 + vx * 0.5; b.vy = b.vy * 0.5 + vy * 0.5; }
      b.lastPt = pt;
      b.tilt = clamp(b.tilt * 0.6 - b.vx * 0.5, -45, 45);   // swings opposite to the motion
      if (Math.abs(b.vx) > 2) b.dir = b.vx > 0 ? 1 : -1;
      b.hold = { x: pt.x - b.w / 2, y: pt.y + GRAB_BELOW[key] };
      rerender();
      return;
    }
    // let go
    const from = b.hold;
    b.hold = null;
    b.emote = null; b.face = null;
    b.mode = 'idle';
    if (!from) return;
    const p = landingFor(b, from.x, from.y);
    if (!p) {
      // dropped below everything: hop back up onto a card on screen (or the floor)
      b.tilt = 0;
      const q = nearestVisible(from.y) ?? plats.current[0];
      if (q) { b.fall = { x: from.x, y: from.y }; const start = b.fall; jumpTo(b, q, start.x - q.left); b.fall = null; if (b.jump) { b.jump.fromX = b.jump.x = start.x; b.jump.fromY = b.jump.y = start.y; } }
      rerender();
      return;
    }
    if (reduced) { b.tilt = 0; drop(b, p, from.x); rerender(); return; }
    b.fall = { x: from.x, y: from.y, vx: clamp(b.vx, -60, 60), vy: clamp(b.vy, -50, 40), land: p.id };
    b.mode = 'fall';
    rerender();
  };
  function stepFall(key, b) {
    const f = b.fall;
    let p = platById(f.land);
    if (!p) { p = landingFor(b, f.x, f.y); if (!p) { b.fall = null; b.mode = 'idle'; return; } f.land = p.id; }
    f.vy += GRAVITY;
    f.vx *= 0.9;
    let nx = f.x + f.vx;
    const lo = p.left, hi = p.left + room(b, p);
    if (nx < lo || nx > hi) nx += (clamp(nx, lo, hi) - nx) * 0.35;   // drift over the platform
    const ny = f.y + f.vy;
    b.tilt = (b.tilt || 0) * 0.7 + f.vx * 0.4;
    if (f.vy > 0 && ny >= p.top) {
      const hard = f.vy > 45;
      b.fall = null; b.tilt = 0;
      drop(b, p, nx);
      b.mode = 'land'; b.wait = TIMED.land; b.timer = 0; b.frame = 0;
      say(key, pick(LAND_LINES[hard ? 'hard' : 'soft']));
      if (hard) feel(key, key === 'vic' ? 'angry' : 'sad', 1800);
      return;
    }
    f.x = nx; f.y = ny;
  }

  const feel = (key, emotion, ms = 2200) => {
    const e = EMOTIONS[emotion];
    if (!e) return;
    const b = sim.current[key];
    b.face = e.face;
    b.emote = e.icon;
    b.emoteLeft = ms;
    b.emoteId += 1;          // re-triggers the pop animation
  };
  const say = (key, line) => {
    const b = sim.current[key];
    const text = resolve(line);          // date-aware lines are worked out right now
    b.bubble = text;
    b.bubbleLeft = bubbleTime(text);
    const emotion = detectEmotion(key, text);
    if (emotion) feel(key, emotion, b.bubbleLeft);
  };
  const startDialogue = () => {
    const { vic: v, claude: c } = sim.current;
    v.bubble = c.bubble = null;
    talk.current.queue = nextSkit().map(([who, text, ms]) => {
      const key = who === 'v' ? 'vic' : 'claude';
      if (typeof text === 'string' && text.startsWith('@')) return { key, action: text.slice(1), ms };
      if (typeof text === 'string' && text.startsWith('#')) return { key, emotion: text.slice(1), ms };
      return { key, text };
    });
    talk.current.gap = 0;
    buddyBus.emit(statusFor('vic', 'talk'));
    // Claude comes over (jumping across if he's on another card) so they're together
    // for the skit. The talking starts right away; only actions wait until he's there.
    talk.current.approach = false;
    const free = c.mode === 'idle' || c.mode === 'walk' || c.mode === 'run';
    if (free && v.plat) {
      if (v.mode === 'walk' || v.mode === 'run') { v.target = v.x; v.mode = 'idle'; v.wait = 300; }   // June Vic stops
      const spot = besideVic(8);
      if (spot && (c.plat !== spot.p.id || Math.abs(c.x - v.x) > VIC_W + CLAUDE_W)) {
        if (c.plat === spot.p.id && !reduced) { c.target = spot.x; c.mode = 'run'; }
        else jumpTo(c, spot.p, spot.x);
        talk.current.approach = true;
      }
    }
    waveHello();
  };
  // June Vic waves (only if he's just standing around)
  function waveHello() {
    const v = sim.current.vic;
    if (v.mode === 'idle') { v.mode = 'wave'; v.wait = TIMED.wave; v.timer = 0; v.frame = 0; }
  }

  /* ---- Spray reactions + the Claude vacuum --------------------------------- */
  const sprayWatch = useRef({ cleanupAt: 0, lastReact: 0 });
  const platBand = p => ({ l: p.left - 24, r: p.left + p.width + 24, t: p.top - 90, b: p.top + 40 });
  const onScreenNow = () => {
    const { vic: v, claude: c } = sim.current;
    return worldOf(v) && worldOf(c) && isVisible(platById(v.plat));
  };

  useEffect(() => sprayBus.on((type, { mode }) => {
    const w = sprayWatch.current;
    const { vic: v, claude: c } = sim.current;
    if (type === 'end') { w.cleanupAt = performance.now() + 2200; w.mode = mode; return; }   // let it settle, then look
    w.cleanupAt = 0;
    const now = performance.now();
    if (!onScreenNow() || now - w.lastReact < 6000) return;
    if (v.mode === 'vacuum' || v.hold || c.hold || v.fall || c.fall) return;
    w.lastReact = now;
    const lines = SPRAY_REACT[mode] || SPRAY_REACT.paint;
    const first = Math.random() < 0.5 ? 'vic' : 'claude';
    const second = first === 'vic' ? 'claude' : 'vic';
    talk.current.queue = [];
    say(first, pick(lines[first]));
    talk.current.queue = [{ key: second, text: pick(lines[second]) }];
    talk.current.gap = 600;
    rerender();
  }), []);

  /** After a spray: if paint landed on their platform, set up the vacuum skit. */
  function maybeCleanup() {
    const { vic: v, claude: c } = sim.current;
    if (!onScreenNow() || v.mode === 'vacuum' || v.hold || c.hold || v.fall || c.fall) return;
    const p = platById(v.plat);
    if (!p || sprayBus.countIn(platBand(p)) < 6) return;
    talk.current.queue = [...toSteps(vacuumIntro(sprayWatch.current.mode)), { key: 'vic', action: 'vacuum' }];
    talk.current.gap = 400;
    // Claude comes over first (the vacuum step waits until he's there)
    if (c.mode === 'laptop' || c.mode === 'nap' || TIMED[c.mode]) c.mode = 'idle';
    const spot = besideVic(8);
    if (spot && (c.plat !== spot.p.id || Math.abs(c.x - v.x) > VIC_W + CLAUDE_W)) {
      if (c.plat === spot.p.id && !reduced) { c.target = spot.x; c.mode = 'run'; }
      else jumpTo(c, spot.p, spot.x);
      talk.current.approach = true;
    }
  }

  /** Claude is held out in front of June Vic, nose down, like a vacuum nozzle. */
  function placeCarried() {
    const { vic: v, claude: c } = sim.current;
    const p = platById(v.plat);
    if (!p) return;
    const dir = v.dir || 1;
    const vx = p.left + v.x;
    c.dir = dir;
    // in June Vic's hands (his hands are at the front edge, chest height)
    c.carry = { x: dir > 0 ? vx + VIC_W - 9 : vx - CLAUDE_W + 9, y: p.top - 4 };
    c.tilt = (dir > 0 ? 66 : -66) + (Math.random() - 0.5) * 8;   // nose down, wobbling
  }

  function startVacuum() {
    const { vic: v, claude: c } = sim.current;
    const p = platById(v.plat);
    if (!p) return;
    if (reduced) {
      // no running around: the paint on the platform just disappears
      sprayBus.vacuumBox(platBand(p));
      say('claude', '*slurp*');
      talk.current.queue = toSteps(vacuumOutro(sprayWatch.current.mode, 0));
      return;
    }
    if (c.jump) { c.jump = null; }
    const max = room(v, p);
    // first to the nearer end, then one full sweep to the far end
    const nearLeft = v.x < max / 2;
    v.vac = { p: p.id, legs: [nearLeft ? 0 : max, nearLeft ? max : 0], leg: 0, until: performance.now() + 30000, talkIn: 900 };
    v.mode = 'vacuum'; v.timer = 0; v.frame = 0;
    v.dir = nearLeft ? -1 : 1;
    c.mode = 'vacuum'; c.timer = 0; c.frame = 0; c.hold = null; c.fall = null;
    c.eaten = 0; c.swell = 0; c.gulp = false;
    feel('claude', 'nervous', 1e9);
    feel('vic', 'happy', 2500);
    placeCarried();
  }

  function stepVacuum() {
    const { vic: v, claude: c } = sim.current;
    const vac = v.vac;
    const p = vac && platById(vac.p);
    if (!vac || !p || performance.now() > vac.until || c.mode !== 'vacuum') { endVacuum(!!vac && !!p); return; }
    const target = Math.min(vac.legs[vac.leg], room(v, p));
    const dx = target - v.x;
    if (Math.abs(dx) <= VAC_SPEED) {
      v.x = target;
      if (++vac.leg >= vac.legs.length) { endVacuum(true); return; }
    } else {
      v.dir = Math.sign(dx);
      v.x += v.dir * VAC_SPEED;
    }
    v.frame = (v.frame + 1) % 2;   // running legs
    c.frame = (c.frame + 1) % 2;   // Claude kicks
    placeCarried();
    const nozzleX = v.dir > 0 ? c.carry.x + CLAUDE_W - 2 : c.carry.x + 2;
    const got = sprayBus.vacuum(nozzleX, p.top - 8, VAC_R) + sprayBus.vacuum(c.carry.x + CLAUDE_W / 2, p.top - 10, VAC_R * 0.7);
    // Claude swells up as he eats, and gulps on every mouthful
    c.eaten += got;
    c.swell = Math.min(0.4, c.eaten / 450);
    c.gulp = got > 0;
    vac.talkIn -= TICK;
    if (got && vac.talkIn <= 0 && !c.bubble) {
      say('claude', pick(VACUUM_LINES));
      feel('claude', 'nervous', 1e9);
      vac.talkIn = 2600;
    }
  }

  function endVacuum(done) {
    const { vic: v, claude: c } = sim.current;
    const p = platById(v.plat);
    if (c.mode === 'vacuum' || c.carry) {
      c.carry = null;
      if (p) {
        // put down next to June Vic, on whichever side has room (never on top of him)
        c.plat = p.id;
        c.x = clamp((c.lastX ?? p.left) - p.left, 0, room(c, p));
        const spot = besideVic(6);
        if (spot) c.x = spot.x;
        c.target = c.x;
      }
      c.tilt = 0; c.emote = null; c.face = null;
      c.gulp = false;
      c.mode = 'idle'; c.wait = rand(900, 1600);
      if (done && c.swell > 0.05) { c.mode = 'land'; c.wait = TIMED.land; c.timer = 0; }   // the burp squash
      c.swell = 0;
    }
    if (v.mode === 'vacuum') { v.mode = 'idle'; v.wait = rand(900, 1600); }
    v.vac = null;
    if (done) {
      talk.current.queue = toSteps(vacuumOutro(sprayWatch.current.mode, c.eaten || 0));
      talk.current.gap = 500;
    }
  }

  // Pause when the tab is hidden
  useEffect(() => {
    const on = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  // Reduced motion: everybody stands still.
  useEffect(() => {
    if (!reduced) return;
    for (const b of Object.values(sim.current)) {
      if (b.jump) { b.plat = b.jump.to; b.x = b.jump.toX; b.jump = null; }
      b.mode = 'idle'; b.target = b.x; b.frame = 0;
    }
    rerender();
  }, [reduced]);

  const active = tabVisible && !bugOn;

  // Single simulation loop for both buddies (one timer = easy to pause).
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      measure();
      const sw = sprayWatch.current;
      if (sw.cleanupAt && performance.now() >= sw.cleanupAt) { sw.cleanupAt = 0; maybeCleanup(); }
      const { vic: v, claude: c } = sim.current;

      // Follow the visitor: a buddy whose card has scrolled out of view (or vanished
      // because the page changed) jumps onto a card that's on screen.
      for (const [key, b] of Object.entries(sim.current)) {
        if (b.jump || b.hold || b.fall || b.carry || b.mode === 'vacuum') continue;
        const p = platById(b.plat);
        if (!roamRef.current) {
          // Staying on the floor: no following. If they're not on it (page change,
          // roaming just turned off), put them back; off Home there's no floor → hidden.
          b.away = 0;
          const floor = plats.current[0];
          if (p || !floor) continue;
          b.plat = floor.id; b.x = b.target = clamp(b.x, 0, room(b, floor)); b.jump = null;
          if (b.mode === 'walk' || b.mode === 'run' || b.mode === 'jump') b.mode = 'idle';
          continue;
        }
        if (isVisible(p)) { b.away = 0; continue; }
        b.away += TICK;
        if (p && b.away < (b.plat ? 900 : 0)) continue;
        const from = worldOf(b);
        const y = from ? from.y : view.current.bottom;
        if (key === 'claude') {
          const spot = isVisible(platById(homeOf(v))) ? besideVic() : null;
          if (spot) { jumpTo(b, spot.p, spot.x); continue; }
        }
        const q = nearestVisible(y);
        if (!q) continue;   // nothing on screen to stand on: wait
        const x = key === 'vic' ? (b.plat ? rand(0, room(b, q)) : Math.min(24, room(b, q))) : rand(0, room(b, q));
        const waving = b.mode === 'wave';
        jumpTo(b, q, x);
        if (waving) b.mode = 'wave';   // keep the hello wave on the very first placement
      }

      // Speech: bubbles fade on their own; conversations advance when both are quiet.
      for (const b of [v, c]) {
        if (b.bubble) { b.bubbleLeft -= TICK; if (b.bubbleLeft <= 0) b.bubble = null; }
      }
      const t = talk.current;
      const quiet = !v.bubble && !c.bubble;
      if (t.approach && c.mode !== 'run' && c.mode !== 'jump' && v.mode !== 'run' && v.mode !== 'jump') t.approach = false;   // arrived
      if (t.queue.length) {
        // lines play straight away; an action waits until Claude has arrived
        const blocked = t.queue[0].action && t.approach;
        if (quiet && !blocked) {
          t.gap -= TICK;
          if (t.gap <= 0) {
            const step = t.queue.shift();
            if (step.action) { perform(step.key, step.action, step.ms); t.gap = 600; }   // act, then keep talking
            else if (step.emotion) { feel(step.key, step.emotion, step.ms); t.gap = 200; }
            else { say(step.key, step.text); t.gap = LINE_GAP; }
          }
        }
      } else if (quiet && v.plat && c.plat && !v.hold && !c.hold && !v.fall && !c.fall && v.mode !== 'vacuum') {
        t.nextIn -= TICK;
        if (t.nextIn <= 0) {
          t.nextIn = nextTalkIn();
          if (Math.random() < 0.65) startDialogue();
          else { const key = Math.random() < 0.55 ? 'claude' : 'vic'; say(key, pick(LINES[key])); }
        }
      }

      for (const [key, b] of Object.entries(sim.current)) {
        // emotions fade after a while
        if (b.emote && (b.emoteLeft -= TICK) <= 0) { b.emote = null; b.face = null; }
        // blinking (skipped for reduced motion and while napping)
        if (b.blink > 0) b.blink -= TICK;
        else if (!reduced && b.mode !== 'nap' && (b.blinkIn -= TICK) <= 0) { b.blink = BLINK_MS; b.blinkIn = nextBlinkIn(); }
        if (reduced && b.mode !== 'held') {
          // still end timed poses (nap, laptop) so they don't stick forever
          if (TIMED[b.mode]) { b.wait -= TICK; if (b.wait <= 0) b.mode = 'idle'; }
          continue;
        }
        b.timer += TICK;
        if (b.mode === 'vacuum') {
          if (key === 'vic') stepVacuum();
          continue;
        }
        if (b.mode === 'held') {
          if (b.timer % 200 === 0) b.frame = (b.frame + 1) % 2;   // kicking legs
          b.tilt *= 0.75;                                         // swing settles when the mouse stops
          continue;
        }
        if (b.fall) { stepFall(key, b); continue; }
        if (b.jump) { stepJump(b); continue; }
        const p = platById(b.plat);
        if (!p) continue;

        if (b.mode === 'walk' || b.mode === 'run') {
          const speed = SPEED[b.mode];
          b.target = Math.min(b.target, room(b, p));
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
            const others = visiblePlats().filter(q => q.id !== p.id);
            if (key === 'vic' && others.length && Math.random() < 0.2) {
              // hop over to another card on screen
              const q = pick(others);
              jumpTo(b, q, rand(0, room(b, q)));
              continue;
            }
            if (key === 'claude' && homeOf(v) !== p.id && Math.random() < 0.85) {
              // Claude follows June Vic onto his card
              const spot = besideVic();
              if (spot && isVisible(spot.p)) { jumpTo(b, spot.p, spot.x); continue; }
            }
            if (key === 'vic' || Math.random() < 0.25 || homeOf(v) !== p.id) {
              b.target = rand(0, room(b, p));
            } else {
              // Claude loosely follows Vic on the same card, stopping a little to one side.
              b.target = besideVic()?.x ?? b.x;
            }
            if (Math.abs(b.target - b.x) < 6) b.wait = rand(800, 2000);
            else b.mode = 'walk';
          }
        }
      }

      for (const b of [v, c]) { const w = worldOf(b); if (w) b.lastX = w.x; }

      // Claude catches up if Vic wandered off while Claude idles.
      if (!reduced && c.mode === 'idle' && c.wait > 600 && c.plat && v.plat) {
        const p = platById(c.plat);
        if (homeOf(v) !== c.plat || (p && Math.abs(c.x - v.x) > Math.max(160, p.width * 0.35))) c.wait = 600;
      }
      rerender();
    }, TICK);
    return () => clearInterval(id);
  }, [active, reduced]);

  const act = key => action => {
    if (action === 'sayhi') {
      say(key, 'Opening chat…');
      window.dispatchEvent(new CustomEvent('chatbot:open'));
      rerender();
      return;
    }
    if (action === 'roam') {
      const on = !roamRef.current;
      setRoam(on); roamRef.current = on; saveRoam(on);
      buddyBus.emit(statusFor(key, on ? 'roamOn' : 'roamOff'));
      talk.current.queue = [];
      say(key, on ? "Let's explore the site!" : 'Back to the floor!');
      talk.current.queue = [{ key: key === 'vic' ? 'claude' : 'vic', text: on ? 'Race you to the next card!' : 'Home sweet home.' }];
      talk.current.gap = 700;
      rerender();
      return;
    }
    if (action === 'talk') { startDialogue(); talk.current.nextIn = nextTalkIn(); rerender(); return; }
    if (action === 'joke') { say(key, pick(QUIPS.joke)); rerender(); return; }

    // a manual action interrupts any running skit
    talk.current.queue = [];
    if (action === 'laptop' && key === 'vic') say(key, pick(VIC_LAPTOP_QUIPS));
    else if (QUIPS[action]) say(key, pick(QUIPS[action]));
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

  const changeCostume = key => id => {
    const list = key === 'vic' ? vicCostumes : claudeCostumes;
    const chosen = list.find(c => c.id === id) || list[0];
    setCostumes(prev => ({ ...prev, [key]: chosen.id }));
    saveCostume(key, chosen.id);
    talk.current.queue = [];
    feel(key, 'happy', 2200);
    say(key, chosen.quip);
    rerender();
  };

  /** Start an action (used by the menu and by skits). `ms` overrides how long it lasts. */
  function perform(key, action, ms) {
    const b = sim.current[key];
    if (b.hold || b.fall) return;   // busy dangling / falling
    if (action !== 'vacuum' && sim.current.vic.mode === 'vacuum') endVacuum(false);   // anything else stops the cleaning
    if (b.jump) { b.plat = b.jump.to; b.x = b.target = b.jump.toX; b.jump = null; }   // land first
    const p = platById(b.plat);
    if (!p) return;
    const status = statusFor(key, action);
    if (status) buddyBus.emit(status);
    if (action === 'vacuum') { startVacuum(); return; }
    const max = room(b, p);
    b.timer = 0;
    b.frame = 0;
    // feelings that go with actions
    const ACTION_FEEL = { dance: 'laugh', hop: 'happy', wave: 'happy', wiggle: 'laugh', nap: 'sleepy' };
    if (action === 'chase') { feel('vic', 'angry', 3500); feel('claude', 'nervous', 3500); }
    else if (ACTION_FEEL[action]) feel(key, ACTION_FEEL[action], action === 'nap' ? ms || TIMED.nap : 2000);
    if (action === 'chase') {
      // June Vic chases Claude: Claude bolts away, June Vic runs after and stops right behind.
      const v = sim.current.vic, c = sim.current.claude;
      if (c.jump) { c.plat = c.jump.to; c.x = c.jump.toX; c.jump = null; }
      const vp = platById(v.plat);
      if (!vp) return;
      const others = visiblePlats().filter(q => q.id !== vp.id);
      const together = c.plat === v.plat && room(c, vp) >= 260;
      if (!together && others.length) {
        // not enough room here: Claude leaps to another card and June Vic leaps after him
        const q = pick(others);
        const cx = rand(0, room(c, q));
        const dir = q.left + cx >= vp.left + v.x ? 1 : -1;
        jumpTo(c, q, cx);
        jumpTo(v, q, cx - dir * (Math.max(VIC_W, BTN_MIN) + 6));
        if (v.jump) v.jump.dur += 250;   // he's a step behind
        talk.current.approach = true;
        return;
      }
      if (c.plat !== v.plat) return;
      const maxC = room(c, vp);
      const maxV = room(v, vp);
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
    if (action === 'walk' || action === 'run') {
      // A short card is no fun to walk on: hop over to another one on screen instead.
      const others = visiblePlats().filter(q => q.id !== p.id);
      if (max < 120 && others.length) { const q = pick(others); jumpTo(b, q, rand(0, room(b, q))); return; }
      if (reduced) { b.x = b.target = rand(0, max); return; }   // no animation: jump to a new spot
      // Head for the far side so the action is visible.
      b.target = b.x > max / 2 ? rand(0, max * 0.3) : rand(max * 0.7, max);
      b.mode = action;
      return;
    }
    if (reduced) {
      // No animation: poses still show.
      if (action === 'nap' || action === 'laptop' || action === 'wave') { b.mode = action; b.wait = ms || TIMED[action]; }
      return;
    }
    if (action === 'laptop') {
      // Put the laptop on the side away from the other buddy (and where there's room).
      const other = sim.current[key === 'vic' ? 'claude' : 'vic'];
      const myW = key === 'vic' ? VIC_W : CLAUDE_W;
      let dir = other.plat !== b.plat || b.x >= other.x ? 1 : -1;
      if (dir > 0 && b.x + myW + 46 > p.width) dir = -1;
      if (dir < 0 && b.x - 46 < 0) dir = 1;
      b.dir = dir;
    }
    b.mode = action;
    b.wait = ms || TIMED[action] || 2000;
  }

  /* ---- render ---- */
  if (bugOn) return null;
  const { vic: v, claude: c } = sim.current;
  const roamItem = { id: 'roam', label: roam ? 'Stay on the floor' : 'Explore the site' };
  const vp = worldOf(v);
  const cp = worldOf(c);
  const pageW = view.current.width || (typeof document !== 'undefined' ? document.documentElement.clientWidth : 0);
  const vicCenter = vp ? vp.x + Math.max(VIC_W, BTN_MIN) / 2 : -1e6;
  const claudeCenter = cp ? cp.x + Math.max(CLAUDE_W, BTN_MIN) / 2 : -1e6;

  const state = b => ({ x: b.x, dir: b.dir, mode: b.mode, frame: b.frame, blink: b.blink > 0, face: b.face, emote: b.emote, emoteId: b.emoteId, tilt: b.tilt || 0, swell: b.swell || 0, gulp: !!b.gulp });

  // Speech opens AWAY from the other buddy so it never slides behind them,
  // unless there isn't enough room on that side of the page.
  const BUBBLE_ROOM = 240;
  const sideFor = (pos, myW, otherCenter) => {
    const left = pos.x, right = pos.x + Math.max(myW, BTN_MIN);
    let side = otherCenter > (left + right) / 2 ? 'right' : 'left';   // 'right' anchor = opens left
    if (side === 'right' && right < BUBBLE_ROOM) side = 'left';
    if (side === 'left' && pageW - left < BUBBLE_ROOM) side = 'right';
    return side;
  };
  // Claude is much shorter than June Vic. If Claude's bubble has to open toward him
  // (no room on the other side), lift it above his head so it never hides behind him.
  const claudeSide = cp ? sideFor(cp, CLAUDE_W, vicCenter) : 'left';
  const sameLevel = vp && cp && Math.abs(vp.y - cp.y) < 4;
  const towardVic = (claudeSide === 'right') === (vicCenter < claudeCenter);
  const claudeLift = sameLevel && towardVic ? (vic.stand.length - claude.stand.length) * SCALE : 0;

  const prop = (b, pos, w) => b.mode === 'laptop' && pos && (
    <span
      className="buddy-world__prop"
      style={{ transform: `translate(${Math.round(b.dir < 0 ? pos.x - 46 : pos.x + w + 2)}px, ${Math.round(pos.y)}px)` }}
      aria-hidden="true"
    >
      <PixelSprite grid={laptopFrame(b.timer, reduced)} palette={laptop.palette} scale={3} />
    </span>
  );

  return (
    <div className={`buddy-world${active ? '' : ' is-paused'}${reduced ? ' is-reduced' : ''}`} data-no-spray="true">
      {cp && (
        <Buddy
          name="claude"
          label="Claude buddy"
          sprite={claude}
          scale={SCALE}
          state={state(c)}
          pos={cp}
          bubble={typeof c.bubble === 'string' ? c.bubble : null}
          bubbleSide={claudeSide}
          bubbleLift={claudeLift}
          onAction={act('claude')}
          onDrag={onDrag('claude')}
          actions={[...CLAUDE_ACTIONS, roamItem]}
          stageWidth={pageW}
          costumes={claudeCostumes}
          costumeId={costumes.claude}
          onCostume={changeCostume('claude')}
        />
      )}
      {prop(c, cp, CLAUDE_W)}
      {prop(v, vp, VIC_W)}
      {vp && (
        <Buddy
          name="vic"
          label="June Vic buddy"
          sprite={vic}
          scale={SCALE}
          state={state(v)}
          pos={vp}
          bubble={typeof v.bubble === 'string' ? v.bubble : null}
          bubbleSide={sideFor(vp, VIC_W, claudeCenter)}
          onAction={act('vic')}
          onDrag={onDrag('vic')}
          actions={[...VIC_ACTIONS, roamItem]}
          stageWidth={pageW}
          costumes={vicCostumes}
          costumeId={costumes.vic}
          onCostume={changeCostume('vic')}
        />
      )}
    </div>
  );
}
