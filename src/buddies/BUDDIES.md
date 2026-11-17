# Pixel Buddies — what they can do

Two pixel characters live on the Home hero floor and, if you turn on **Explore the site**, roam every page standing on top of the cards: **June Vic** (the tall one, a "prompt master") and **Claude** (the small orange crab-like one). This file lists everything they can do and where to change it.

## Files

| File | What it holds |
|---|---|
| `BuddyWorld.jsx` | The brain: platforms, jumping, movement, skits, emotions, laptop timing, menu actions. Mounted once in the app shell (`Layout.jsx`) |
| `BuddyFloor.jsx` | The floor line in the Home hero (one of the platforms; they prefer it when it's on screen) |
| `Buddy.jsx` | One buddy: draws the sprite, speech bubble, emote icon and the "What now?" menu |
| `sprites.js` | June Vic's pixel art and faces, the laptop prop, emote icons |
| `claude-sprite.txt` | Claude's pixel art, drawn by hand (edit it and the site updates) |
| `PixelSprite.jsx` | Renders a grid of letters as pixels |
| `buddies.css` | Layout and styling |

## Actions

| Action | June Vic | Claude | Notes |
|---|---|---|---|
| Walk / Run | yes | yes (called "Scuttle") | Heads for the far side of the card they're on; on a short card they jump to another one instead |
| Jump | automatic | automatic | Arcs from one card to another (see Platforms) |
| Hop | yes | skits only | |
| Dance | yes | skits only | |
| Wave | yes (2-frame animation) | no | June Vic waves when the page loads |
| Wiggle | no | yes | |
| Nap | no | yes | Eyes close, "Z z z" |
| Open laptop | yes ("Prompt on laptop") | yes | A side-view laptop with a glowing screen appears on the side away from the other buddy. Hands tap the keys in turn, shaded for depth. Lasts 12 s from the menu |
| Chase | skits only | n/a | June Vic runs after Claude, who bolts away; if the card is too small, Claude leaps to another card and June Vic leaps after him |

## Pick them up (drag with the mouse or a finger)

- **Press and move** a buddy to pick it up (a press without moving is still a click → menu).
- **Held:** June Vic is held up by his shirt: arms shoot up, the shirt rides up (belly showing), legs kick, nervous face. Claude dangles and kicks his legs. They swing opposite to how fast you move the mouse.
- They complain while held ("Hey! My shirt!", "Unhand me!") and the other buddy reacts ("Hahaha, look at him!").
- **Let go:** they fall with gravity (a flick throws them) onto the highest platform below; if nothing is right below, they drift over to the nearest one. Dropped below everything → they hop back up onto a card on screen.
- **Landing:** a squash, then a line. A soft landing gets "Oof." / "Nailed it."; a hard one (dropped from high up) gets "OUCH." / "My pixels!" with an angry or sad face.
- With "reduce motion" on you can still drag them; letting go puts them straight onto the platform below.
- Sprites: `held` / `fall` poses in `sprites.js`; tune `GRAB_BELOW` and `GRAVITY` in `BuddyWorld.jsx`.

## Spray paint: reactions + Claude the vacuum

- **Reactions:** when you start spraying (and they're on screen), one buddy reacts to the kind of spray and the other answers. String: "Ooh, noodles!" / "Not the noodles again!"; paint: "Is this… modern art?"; sand: "Sand. It gets everywhere."; confetti: "Is it my birthday?!"; letters: "Hey, those are MY letters!". At most once every 6 s.
- **Cleanup:** about 2 s after you stop spraying, if paint landed on their platform, a short skit plays ("Who made this mess?!" / "You are the vacuum.") and June Vic grabs Claude and holds him nose-down in front of him like a vacuum cleaner. He runs to the nearer end of the platform and then sweeps the whole length; paint near Claude's nose is sucked up. Claude rattles, kicks and complains ("VRRRRRRRR", "It tastes like CSS."), then gets put down: "*burp*" / "Spotless."
- Dragging either buddy or picking another action stops the cleaning. With reduced motion the paint on the platform just disappears.
- Code: `SPRAY_REACT`, `VACUUM_*` and `startVacuum` / `stepVacuum` in `BuddyWorld.jsx`; the link to the spray engine is `src/spray/sprayBus.js` (`countIn`, `vacuum`, `vacuumBox`).

## Bug Attack (green bug button in the header)

A three-minute boss campaign, code in `src/bugEvent/`. Style: inspired by Alan Becker's stickman *Animation vs. Animation*, where the page UI is the arena. Everything is styled in the site theme (cards, 4px borders, hard shadows; no neon).

**A show synced to the music:**
- The whole event runs to the 8-bit **"HERO"** track (`public/audio/bug-hero.mp3`, 3:37). Its playback time is the show clock (`g.mt`).
- Every stage change, finisher, death, Claude's fall, the Super Saiyan moment and the final blow lands on a **cue** picked from the track's loudness. The cues are in `CUES` at the top of `BugEvent.jsx`.
- A **director** paces the boss HP (`PACE`) and the danger, so each finisher lands on its beat. It also keeps the buddies alive in stages 1–2 and lets them fall twice in stage 3.
- Fighting runs from 0:08 to 3:20; the victory follows when the track ends.
- If the file is missing, the clock just counts real time. Muting keeps the track playing silently, so the clock keeps going.

**Starts on Home:** pressing the bug button on any other page takes you to Home first.

**Locked:** once it starts, the site is sealed. Menu links and the browser Back button are blocked ("🔒 LOCKED! Beat the bugs first."), and Escape does nothing. The only ways out are winning or pressing the bug button again (**Retreat**).

**3 stages, no transitions:** when a boss dies, the next one breaks in right away on the same, still-burning page. Claude gives a quick +30 hotfix heal while it arrives.

| Track | Boss (repo) | What happens |
|---|---|---|
| 0:08–0:58 | **Error403** (jv-ytdlp) | **Duel:** "!"-telegraphed punches and bites, a **403 shield** (3 kicks break it), "99%" progress bars.<br>**Rampage** (0:38): it **rips a hanging card off and swings it as a club** before throwing it, calls **"429 Too Many Requests"** (4 small purple bugs), and sweeps a **stalled-download laser** across the stage (jump it!).<br>A **[↻ Retry]** button pops up now and then: click it for a power hit. |
| 1:00–1:56 | **Hallucination** (GC Assist) | It flies above the page on wings while a **fake chat reply types out** ("Sure! Here are 10 bugs:"). **Every list item drops and hatches into a TokenBug**, and the bugs march off in lines to the walls and ceiling. More come from "Regenerating response…".<br>At **1:30** it lands. Decoys, fake citations. |
| 1:58–2:36 | **RollbackKing** (Askademic) | The **Askademic card** grows a badge (🔔 30 pending bookings), shakes and **explodes on the loudest drop**. Three waves follow: **stampede → crawlers → V-formation dive squadron**, with endless reinforcements after.<br>At **2:16** it steps in: uppercut, grab & slam, rollback heal, desync blink. The swarm overwhelms the buddies twice (escape to the next page each time). |

**The swarm:**
- It crawls the whole arena: the stage, up the walls, upside down along the ceiling and across the background.
- A **"!"** flashes before every lunge or dive, and a **shadow grows on the stage** before a bug drops from the ceiling.
- **Dogpile:** bugs latch onto a buddy. At 3, the buddy **shakes them all off** in a spin.
- Clicking a bug swats it down, or pulls it off a buddy.

**It gets more epic as the fight goes on** (the page itself stays the same, just more broken). With each stage, and more again for Claude's fall and the final battle:
- **New cracks** keep tearing open across the background, faster each time.
- **Glitch bursts** in the site's own dot-matrix style: rows of 8 px blocks jump sideways and dead pixels blink. A card or box jitters in 4 px steps with pixel noise and an error stamp (`SEGFAULT`, `ERR 0x1F`, `NaN`…).
- **More bugs crawl around the background**: dark silhouettes with red eyes, coming out of the cracks (5 in stage 1, up to 34 in the final battle).

- **The small boxes break too:** status pill, meta line, chips, lead, buttons, the 01/02/03 pills, tags, and any bordered box on other pages.
  - Hit once: they crack, glitch and tilt.
  - Hit twice: they shatter into pixel debris in their own colours, leaving a dashed outline.
  - The boss bites them, swarm bugs crawling over them nibble them, and a buddy knocked flying into one cracks it.
- **The fight moves through the page:** when about **80%** of what's in view is wrecked, the boss shouts "This page is DONE." and leaps down (or up, towards whichever side still has intact boxes). The page scrolls with it, the buddies jump after it, and it drops back in on the fresh section. This can happen at most once every 15 s.

The ending calms everything down. The background bugs scurry off the screen edges, then **the page heals**:
- each crack lights up in the theme blue and un-draws, with ✓ sparks and a rising run of dings;
- holes fill back in pixel by pixel, and fallen tiles fly back up;
- bites close, fire shrinks into the edges, and stickers peel off.

**Boss moves:** every boss also has a **dash punch**, a **dropkick**, a **spinning backfist**, **block → counter**, and **throwing a buddy into a card**. Signature moves:
- Error403: the "REQUEST DENIED" shoulder charge.
- Hallucination: a phantom strike and a dive kick.
- RollbackKing: a **rewind strike** (it snaps back a second, then dashes in) and an uppercut → juggle → slam.

**The page is destructible:**
- Cards get jagged bites, spreading cracks, **pixel fire** on the edges, smoke plumes and error stickers.
- These decals live **inside the card**, so when a broken card **hangs by one corner and swings**, its fire and cracks swing with it, and they fall with it.
- Heading letters fall out onto the stage. June Vic **kicks them back at the bugs**.
- Damage, fire, embers and smoke keep building through the whole event.

**The buddies** wear pixel armour that cracks, then breaks off as TEAM HP drops. They fight **hand-to-hand**:
- **June Vic:** jab → cross → kick, flying kick.
- **Claude:** headbutt, spin kick.
- **Both:** a combo counter. Kicks launch small bugs for an **air juggle → SLAM**. They **wall jump** off the screen edges.
- **Defence:**
  - **Dodge** (roll/backflip with an afterimage; a perfect dodge gives slow-mo and a "Too slow!" counter).
  - June Vic sometimes **parries** a boss punch ("BLOCKED!").
  - Claude **blinks** away, and can cover June Vic with a **"Context window!" bubble shield**.
- **Specials:**
  - prompt attack, DEPLOY, git push wave, token rain, stomp, throw, X-kick;
  - the **springboard**: June Vic jumps off Claude's head for a super kick.

**Stage extras:**
- **Error403 "Downloading your card…"** (around 0:20 and 0:42): a progress bar and a beam latch onto one of your cards.
  - The buddies' hits push it back; hitting it back to 0% cancels it.
  - You can click **✕ Cancel** to stop it instantly; the boss gets stunned.
  - At 100% the card is sucked into the bug (it comes back in the fix-up).
- **Hallucination rewrites your page:** your real text gets typed over with confident wrong facts, with a red squiggle:
  - "Open to naps", "Culinary Arts", "Hogwarts", COBOL / CLIPPY chips…
  - **Click a fake fact** to fact-check it (✓, and it damages the boss).
  - Hitting the boss also fixes one fact now and then, and they're all corrected when the stage ends.
- **Hallucination swoops can be hit:** while it dives on a card it can be jump-kicked ("SWATTED!"). It lands at 1:20, so its boss fight is longer.
- **Prompt injection** (1:32): "SYSTEM: Ignore previous instructions. Attack each other." June Vic gets confused and bonks Claude, until Claude refuses: "I don't follow injected instructions."
- **Refined moves:**
  - punches wind up then lunge; kicks swing;
  - headbutts squash and stretch;
  - smear streaks follow fists;
  - runs lean forward, jumps stretch, landings squash, hits flash;
  - bosses pull back before punching, lunge, stretch on dashes, and squash on landing.

**Finisher** (stages 1–2): letterbox, a camera zoom and slow-mo, then the chained combo. It ends through a card (stage 1) or with a slam (stage 2).

**The final battle** (stage 3):
1. **Claude's last fight (2:26–2:36):**
   - The swarm buries June Vic in a dogpile he can't shake ("I… can't… move…").
   - **Claude powers up** with an orange pixel aura ("CONTEXT WINDOW: MAX!!"). A token nova blasts every bug off June Vic, who drops to his knees, exhausted.
   - Claude takes RollbackKing on alone (it blocks and counters).
   - At 2:32 the boss **DESYNCs behind him, grabs him by the head and FLIES up with him** on red thrusters. It beats him in the air while his tokens drain away and he greys out. June Vic, hopeless, tries to crawl: "No… no… CLAUDE!".
   - At **2:36**, in the quietest dip, Claude goes limp ("One down.") and is **dropped from the sky**. He falls in slow motion and hits the stage hard. June Vic runs to him and **cries**: "Claude…?", "Wake up, buddy…", "CLAUDE!!".
2. **2:44–2:50:** the tears turn into an aura → **SUPER SAIYAN**. A pixel-flame aura (`AURA_FRAMES` in `bugSprites.js`) flickers around him, and the power **shatters his armour** off.
3. He one-shots the whole swarm, but the boss laughs, "ROLLBACK TO PEAK STATE!", refills and rises into the sky.
4. **2:58–3:16, a FAST sky battle in a thunderstorm** (DBZ style: teleport flurries all over the sky, 30 ms punch blurs, **impact frames** that invert the screen, speed lines, rings, sparks): pixel rain, storm clouds, lightning that strikes cards. One exchange per beat:
   - **teleport clashes** with a shockwave ring;
   - **punch barrages**;
   - **knock-throughs** (kicked through a card, or slammed into the stage);
   - **desync counters**.
   - The boss's HP drains slowly.
5. **3:16:** a **beam struggle** (both hands on one line, a pulsing camera, power surges, sparks and rocks; the final blow brings triple impact frames, a white-out and a **screen crack**), the golden "git push --force!!" against the orange ROLLBACK BEAM. June Vic overpowers it on the **3:20 peak**, and RollbackKing **disintegrates** pixel by pixel.
6. **3:26:** June Vic heals Claude: "…did we win?" / "We did. …don't scare me like that."

**Ending** (the bug button skips it):
1. A VICTORY pose, back to back.
2. A **results card**: time, max combo, bugs squashed, lives, page damage, rank S/A/B/C.
3. The fix-up: June Vic **vacuums** the mess piece by piece with Claude as the nozzle, then **codes the fixes** element by element (`git commit -m 'fix'`, ✓ each; hanging and fallen cards fly back up, cracks seal).
4. A shine sweep, "DEPLOYED ✓ v2.0", a **high five** and a dance, "Same time next sprint?" / "Please no.", and they walk back and wave.

**Sound** (`sound.js`): one Web Audio mixer for music and effects, with a 🔊 mute toggle and a volume slider (remembered; 0% = silent). The loud mp3 sits on a low music bus behind a compressor. chiptune sound effects synthesized in the browser for everything (clashes, teleports, rain, beams, dodges, parries, notifications…), plus the OST. Sound is on by default, with a 🔊 mute toggle (remembered).

- Nothing is really changed: overlays, card decals (removed afterwards), a small tilt, a hidden flag, and the camera zoom, all undone at the end. Reduced motion: no flashing, shaking, slow-mo, zoom or wobble.
- While it runs, the normal buddies are hidden. Tune `CUES`, `PACE`, `STAGES`, `TEAM_HP` and `LIVES` at the top of `BugEvent.jsx`.
- Dev: `window.__bugStartStage = 1 | 2` before pressing the button starts mid-show, with the track seeked to match.


## Menu (click a buddy)

- **Claude:** Chat with June Vic · Open laptop · Wiggle · Nap · Scuttle · Ask me anything (opens the site chatbot) · Explore the site / Stay on the floor
- **June Vic:** Talk to Claude · Wave · Prompt on laptop · Say something · Walk · Run · Hop · Dance · Explore the site / Stay on the floor

The other buddy reacts to many menu actions with a line (see `REACTIONS`).

## Emotions

An emotion is a **face** (for June Vic) plus an **emote icon** next to the head. Claude changes his eye pixels too.

| Emotion | Face | Icon |
|---|---|---|
| happy | `^ ^` eyes, big smile | sparkle |
| laugh | same as happy | note |
| angry | slanted brows, frown | anger |
| surprised | tall eyes, "O" mouth | `!` |
| nervous | surprised face | sweat |
| sad | raised inner brows, frown | sweat |
| thinking | none | `?` |
| deadpan | flat mouth | dots |
| sleepy | none | zz |

They are picked automatically from what is said (ALL CAPS → angry/nervous, `?!` → surprised, ending in `?` → thinking, `!` → happy, `…` → deadpan) and from actions (dance, hop, nap, chase…). In a skit you can force one with a step like `['v', '#angry']`.

## Skits (conversations)

- About 90 skits in `SKITS` (nine of them are long mini stories, see below), plus one-liners in `LINES`, played every 7–13 seconds. Skits are dealt from a shuffled deck: **none repeats until every skit has played**; then the deck is reshuffled (the last one never plays twice in a row). The deck is kept for the browser tab (`sessionStorage`), so changing pages or reloading doesn't restart it.
- Topics: dev jokes, the current weekday / time of day / days left in the year, Christmas countdown, tips about the portfolio (case study, spray can, dark mode, GitHub skyline, résumé, secret code), Claude sneaking onto June Vic's GitHub (chases), June Vic's prompt-master laptop skits, and laptop face-offs where both open one.
- **Long skits** (12–19 steps each): 1) Hackathon all-nighter · 2) Job interview (June Vic interviews Claude) · 3) Code review court · 4) Prompt School (June Vic teaches Claude) · 5) Production is down (incident + postmortem) · 6) Cooking with Code (cooking show) · 7) The great semicolon heist · 8) Who Wants to Deploy on a Friday? (game show) · 9) As the Repo Turns (soap opera).
- A step is a line `['c', 'text']` or an action `['v', '@laptop', 8000]` (the number is how long it lasts in ms). Text can be a function for live values, e.g. `() => today().weekday`.
- Actions usable in skits: `@laptop @nap @wiggle @run @hop @walk @wave @dance @chase`.

## Platforms (where they stand)

**Default: they stay on the floor** in the Home hero, and aren't shown on other pages. Pick **Explore the site** in either buddy's menu to let them roam; pick **Stay on the floor** to bring them back. The choice is remembered in the browser (`localStorage` key `buddies:roam`).

When exploring:

- They stand on the **top edge of any card** in the page content (`.pixel-card` inside `<main>`) and on anything marked `data-buddy-platform` (the Home hero floor).
- Skipped: cards narrower than 140px, cards inside other cards, cards scrolled sideways, and anything inside an element with `data-buddy-ignore` (add that attribute to keep them off a card).
- **They follow you:** when their card scrolls out of view (or under the header) for about a second, they jump onto a card that's on screen, arriving from the edge you scrolled away from. Claude lands next to June Vic.
- **Changing pages:** they stay with you. Their old card is gone, so they drop in from above onto the new page.
- June Vic sometimes jumps to another visible card on his own; Claude follows him there. Before a skit, Claude jumps over to June Vic's card.

## Other behaviours

- **HUD badge (bottom-left):** the "EQUIPPED" badge flips to what a buddy is doing ("JUNE VIC: prompting on the laptop", "CLAUDE: napping") for ~4.5 s whenever an action, skit, pick-up or roam toggle starts. Wording lives in `buddyBus.js` (`ACTION_STATUS`); `BuddyWorld.jsx` calls `buddyBus.emit`.
- **Idle wandering:** June Vic walks along his card or jumps to another one; Claude loosely follows him and catches up if he gets far away.
- **Blinking:** every few seconds (not while napping).
- **Speech bubbles:** open away from the other buddy and stay inside the page. The menu opens downward when a buddy is close to the header.
- **Saves effort when hidden:** the simulation pauses when the tab is hidden.
- **Reduced motion:** with "reduce motion" on, nothing wanders. Actions jump to the end state (a walk or a jump between cards becomes an instant move, the laptop shows a still frame) and timed poses still end.
- **Accessibility:** each buddy is a real button with a label, and the menu is keyboard-operable (focus moves into it, Escape closes it).

## How to add things

- **New skit:** add a line to `SKITS` in `BuddyWorld.jsx`.
- **New one-liner:** add to `LINES.vic` / `LINES.claude`.
- **New expression:** add to `vicFaces` in `sprites.js` (rows 5, 6, 9, 10; columns 2–13) and map it in `EMOTIONS`.
- **Change how long the laptop stays open:** `TIMED.laptop` in `BuddyWorld.jsx`, or the number in a skit step.
- **Redraw Claude:** edit `claude-sprite.txt`.
- **Add a platform:** put `data-buddy-platform` on any element; they'll stand on its top edge.
