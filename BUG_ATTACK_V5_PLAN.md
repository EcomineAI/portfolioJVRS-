# Bug Attack v5 — locked event, phased stages, armies, sound design

## Context
The Bug Attack (`src/bugEvent/`) is now a 3-stage fight (NullPointer → MemoryLeak → RaceCondition) with
destructible cards, falling letters, armour, theme swords, team HP / lives and an escape-to-next-page loss.
The user wants it to feel like a real boss campaign: once it starts it can't be dodged, every stage has
**phases**, stages 2 and 3 open with a **small-bug army** while the main bug watches, the boss gets a big
explosive entrance and heavier moves, and the whole event gets a **sound design**.

## Refined description (for BUDDIES.md / DECISIONS.md)
> **Bug Attack** — a three-stage boss campaign hidden behind the green bug button. Once it starts, the site
> is locked into the fight: the menu is sealed until the bugs are beaten (or you press the bug button again to
> retreat). Each stage has phases. Stage 1 is a duel with NullPointer that turns into a rampage when it starts
> tearing the cards apart. In Stage 2, MemoryLeak flies above the page on buzzing wings, wrecking cards while
> its army of small green bugs rises up to fight; beat the army and it lands to fight you itself. Stage 3
> opens with an explosion: RaceCondition's elite flying bugs swarm out first while the boss watches from
> the rubble, then it steps in, punching hard enough to throw June Vic and Claude across the stage.
> Everything has chiptune sound, generated in the browser, with a mute switch.

## 1. Locked event (can't leave until defeated)
- Only two ways out: **win** (all stages) or **click the bug button** again (retreat). Escape no longer stops it.
- While running, add `html.bug-locked`:
  - Header nav links (`Header.jsx` / `site-nav__link`, mobile menu, logo, footer nav, page links inside
    `main`) are visually locked (dimmed, 🔒 cursor, `aria-disabled`) and clicks are blocked by one capture-phase
    `click` listener in `BugEvent.jsx` that cancels navigation for `a[href^="/"]` (and shows a fx "LOCKED! Beat the
    bug first." near the click). Theme / spray / bug buttons stay usable.
  - Browser **Back**: push a guard history entry on start; a `popstate` listener re-pushes it and shows the same
    "LOCKED" fx. Removed on finish.
  - `useEffect([pathname])` already ignores the game's own navigation (`g.navigating`) — keep; user navigation
    can no longer happen, so the "finish on page change" branch only remains as a safety net.
- The loss mechanic (bug escapes to the next page via pixel wipe) stays — that's the game moving you.
- Accessibility: announce "The site is locked until the bugs are defeated. Press the bug button to retreat."
  (aria-live), the bug button's label becomes "Retreat from the bug attack". Reduced motion unchanged.

## 2. Stage & phase system
Refactor `STAGES` (top of `BugEvent.jsx`) into a list of **phases** per stage; a small phase runner replaces
the hard-coded `'fight'` phase:

```
stage = { boss, phases: [ { kind, ...params }, ... ] }
kinds: 'duel' | 'rampage' | 'army' | 'boss-watch' | 'boss-fight'
```
Phase transitions show a theme banner ("PHASE 2 — RAMPAGE") + a short beat (no stat reset). `knockOut`,
`hitBug`, HUD and cleanup are generalised to a **list of bugs** (`g.bugs`; the boss is `g.boss`).

**Stage 1 — NullPointer**
1. *Duel* (HP 100 → 50%): current punch/bite behaviour.
2. *Rampage* (50% → 0): banner "IT'S DESTROYING THE PAGE!"; the bug prioritises leaping onto cards (leap
   cd ×0.4), each bite deals extra card damage so 1–2 cards fall; still punches when buddies get close.

**Stage 2 — MemoryLeak**
1. *Army uprising*: 6 small green bugs (the earlier green beetle style, reuse `BUG_POSES` at size 0.45 with a
   green palette) crawl up from cracks in the stage floor; they rush and nibble (low dmg).
   Meanwhile the boss is **airborne**: new `fly` mode with a 2-frame wing sprite (wings over `BUG_POSES`), it
   hovers over the page, swoops onto cards to bite them, is **not targetable** (buddies ignore it; clicking it
   does nothing, "Can't reach it!").
2. *Boss fight*: when the army is gone → banner "MEMORYLEAK LANDS", it drops onto the stage (shockwave) and
   fights with its current moves (combos, grab, acid).

**Stage 3 — RaceCondition (BOSS)**
1. *Explosion entrance*: replaces the card-crack spawn for this stage: screen flash, big pixel explosion
   (fx ring + debris + every visible card takes one bite), smoke surge.
2. *Elite flying army*: 5 small **winged** green bugs (fast, dive-attack from the air, stronger than stage 2's);
   the boss stands in the rubble on the right **watching** (idle + taunts, untargetable, arms crossed pose).
   Buddies use the existing specials; DEPLOY / token rain / prompts hit flying bugs.
3. *Boss fight*: bigger punch (dmg ×1.6, knockback ×1.8 — buddies fly across the stage), new **uppercut**
   (launches a buddy up), grab-and-slam, plus fire / pound / debris. Enrage at 30% as now.

Army bugs: shared `makeBug({ type:'minion', size, hp, flying })`; simple AI (approach nearest buddy, lunge
bite; flyers dive from y≈floor-200). Buddies' `focusFor` picks the nearest targetable bug; "army left" pips
in the HUD (reuse the old swarm pips styling).

## 3. New sprites (`bugSprites.js`)
- `WINGS` overlay frames (2) for flying bosses / elite minions (drawn behind the body).
- Minion palette `green` (bright #3ddc5a family) + elite palette (green with red eyes).
- Boss poses: `watch` (arms crossed), `uppercut`.
- Armour unchanged.

## 4. Sound design (new `src/bugEvent/sound.js`, no audio files)
Generated with the **Web Audio API** (tiny synth: square/triangle/noise oscillators + envelopes), so no
assets, licences or loading. One `sfx(name)` function + a looping chiptune `music(track)`.

| Group | Sounds |
|---|---|
| UI | button start (power-up arpeggio), locked click (low buzz), banner (blip), pixel wipe (sweep) |
| Intro | lights flicker (click/hum), alarm (two-tone siren loop), crack (noise burst), card rumble (low rumble), burst (explosion), SUIT UP clank |
| Combat — buddies | sword swing (short noise whoosh), sword hit (square "tick" + pitch drop), prompt fire (typing clicks + whoosh), DEPLOY (charge rise + zap), git push wave, token rain (coin plinks), stomp boing, throw yeet, X-slash double slash |
| Combat — bugs | punch thud, bite crunch, grab, acid spit/sizzle, fire breath (filtered noise), ground pound (boom), debris throw, wings (fast buzz loop while flying), taunt "bleep-speak" (random pitch blips per word) |
| Page damage | crack (crisp noise), card falls (descending whistle + crash), letter falls (tiny plinks), fire crackle loop (quiet, scales with fires) |
| Flow | phase change sting, K.O. (slow-mo low hit + "K.O." chord), stage clear jingle, lose (descending), game over, victory fanfare, vacuum loop, ✓ patch dings |
| Music | **user-supplied 8-bit OST (mp3)**, see below |

**Music (OST from the user):** played with `HTMLAudioElement` from `public/audio/` — expected names
`bug-stage1.mp3`, `bug-stage2.mp3`, `bug-boss.mp3`, `bug-transform.mp3` (Super Saiyan), `bug-victory.mp3`
(any can be missing: that track is simply silent, no errors). Looping, 0.6 s crossfades between stages,
cut during the Claude-falls moment, ducked during cinematics, paused when the tab is hidden, follows the mute
toggle. File names live in one `TRACKS` map in `sound.js` so the user can drop files in and rename easily.
Sound effects stay synthesized (Web Audio).

- **Mute toggle** in the HUD (speaker icon, remembered in `localStorage` `bug:sound`), respects the page
  being hidden (suspend `AudioContext`). Audio context is created on the button click (user gesture).
- Volume mixing: master gain ~0.25; music 0.5 of master; loops (alarm, wings, fire, vacuum) are tracked and
  stopped on phase change / finish.
- **Default: sound ON** when the event starts (the bug-button click unlocks audio); the mute toggle is
  remembered. Reduced motion does not change sound.
- **Escape does nothing** while locked; the bug button (keyboard-focusable) is the only exit besides winning.

## 4b. One boss per GitHub repo (Askademic is the final boss)
Each stage's bug comes from one of your projects (`src/data/projects.js`), so the fight tells your dev story;
the name card shows the repo ("from EcomineAI/jv-ytdlp").

| Stage | Repo | Boss | Signature power | Army |
|---|---|---|---|---|
| 1 | **jv-ytdlp** | **Error403** (Forbidden) | raises a "403 FORBIDDEN" shield that blocks hits until broken by a kick combo; throws stalled progress bars | — |
| 2 | **GC Assist / JALgorithm** (LLM apps) | **Hallucination** (flying, wings) | spawns fake decoy copies of itself; rains made-up "citations" | small green **TokenBugs** |
| 3 | **Askademic** (BOSS) | **RollbackKing** | "optimistic update rolled back": heals back the last hits unless you keep the combo going; realtime **desync** blink-teleports; **double-booking** clones | winged **DoubleBookingBugs** (fast, strong) |

Taunts reference each project ("Download failed: 403.", "Source: trust me bro.", "Rolling back…",
"Your booking was declined.", "Realtime: disconnected."). The previous generic names are retired;
colours: stage 1 purple, stage 2 green, stage 3 orange/red (army stays the classic small green bug).

## 5. Style direction: "Animation vs. Animation" (Alan Becker) inspired
Fluid hand-to-hand choreography where the UI itself is part of the fight: fighters bounce off cards, get
knocked into headings, kick debris, use page elements as props. (Inspiration only — our own characters/art.)

## 6. Combat: no swords — punches & kicks
- Remove `SWORDS` + `code-sword` rendering. Buddies fight **hand-to-hand**: jab → cross → kick string,
  roundhouse, flying kick (jump + kick), uppercut, dash punch; Claude: headbutt, spinning kick, claw jab.
- New pose frames in `src/buddies/sprites.js` (event-only exports): `vic.poses.punch/kick/uppercut/flykick`,
  `claude.poses.kick/headbutt`. Impact fx: pixel "impact star" + speed lines (theme colours).
- A **combo counter** ("12 HIT COMBO!") when hits chain within 0.6 s.
- **Specials kept** as occasional special moves on top of the hand-to-hand fighting: prompt attack (laptop),
  DEPLOY beam, git push wave, token rain, stomp, Claude throw, X-slash becomes an **X-kick**.

## 7. Armour that cracks and breaks
- Armour has 3 states per piece (helmet, chestplate): intact → cracked (crack pixels) → **breaks off**
  (pieces fly off as debris fx, fall to the stage). Driven by TEAM HP thresholds (70% / 40%) plus heavy hits.
- Broken pieces stay on the floor until cleanup (vacuumed with the rest).

## 8. Camera + cinematics (shared system)
- `g.cam = { zoom, x, y, letterbox }`: applies the same `scale` + `transform-origin` to the event overlay
  (`.bug-event`) and to `main` (origin converted to page coords), so the page and the fighters zoom together.
  Cinematic **letterbox bars** (theme dark) slide in; HUD hides during cinematics.
- `cinematic(steps)` helper: timed list of {zoom target, slow-mo, banner, sound, action}.

## 9. New finisher (replaces the K.O. spotlight)
When a boss's HP hits 0 → **zoom-in combo finisher**: letterbox, camera zooms to the bug, slow-mo; the buddies
take turns in a scripted chain (Vic jab-jab-kick, Claude headbutt, Vic uppercut launches it, both
double-kick) with the combo counter climbing; final blow sends the bug **through the page** (screen-crack
overlay + flash), freeze-frame 0.4 s, then "STAGE CLEAR". Each stage's chain ends differently
(stage 1 kick into a card, stage 2 slam out of the air, stage 3 the full chain).

## 10. Last stand: Claude falls → Super Saiyan June Vic (the "wow")
- Trigger (once): **last life** and TEAM HP ≤ 20%. This replaces losing on the final life (so no game over
  from there).
1. *Claude falls*: a bug hit lands, **slow-mo + zoom on Claude**, he collapses, his eyes **close**
   (eye pixels → closed lines via a `closed` face), heartbeat sound, music cuts. June Vic: "CLAUDE!"
2. *Transformation*: zoom on June Vic, screen darkens, ground shakes, pixel rocks float up, lightning strikes,
   aura builds (gold pixel flames), hair turns **golden & spiky** (new `vic.poses.ssj` frames), scream
   "AAAAAAH!", white flash → golden June Vic with a pulsing aura.
3. *Rampage*: he **flies** (new flight mode), dashing between every remaining bug (army + boss) at high
   speed, one-shot hits with impact flashes, afterimages; bugs explode one by one.
4. *Healing*: he lands by Claude, kneels, a green/gold healing light; Claude's eyes open: "…did we win?"
   → June Vic powers down → victory + normal cleanup.

## 11. Sound additions
heartbeat, music cut, transformation (rising roar synth + thunder), aura loop, flight whoosh, rapid hits,
healing chime, combo hit pitches rising with the counter, armour crack/shatter, punch/kick variants.

## Files
- `src/bugEvent/BugEvent.jsx` — lock, phase runner, multi-bug, army/flying AI, boss moves, sound hooks.
- `src/bugEvent/bugSprites.js` — wings, minion palettes, watch/uppercut poses, armour break states,
  impact/aura sprites; remove `SWORDS`.
- `src/buddies/sprites.js` — fight poses (punch, kick, uppercut, flykick, headbutt), SSJ June Vic frames,
  Claude `closed` eyes face.
- `src/bugEvent/sound.js` — new synth + music.
- `src/bugEvent/bugEvent.css` — locked nav styles, wings, explosion ring, mute button, army pips.
- `src/bugEvent/BugButton.jsx` — "retreat" label/state.
- `src/buddies/BUDDIES.md`, `DECISIONS.md` (#24: now "locked until defeated or retreated", sound + mute).
- Reuse: `bitePage`, `fallCard`, `dropLetters`, `restorePage`, `startSpawn/spawnStep`, `knockOut`, `lose`,
  `cleanup`, combos (`pickCombo`, `comboStep`) — generalised to target `focusFor(g, f)` over `g.bugs`.

## Verification
- `npx vite build` passes.
- Headless Chrome (puppeteer-core, dev hook `window.__bugG`):
  - nav link click and Back during the event → stays on page, "LOCKED" fx; bug button → retreat works.
  - full run: Stage 1 duel→rampage (≥1 card falls), Stage 2 army→boss (boss untargetable while flying),
    Stage 3 explosion→elite army→boss; outro cleanup restores everything (no `.bug-gone`, rotations, locked class).
  - forced loss → escape to next page still works while locked; 3 losses → game over → Retry.
  - sound: `AudioContext.state === 'running'` after start, mute toggle silences (gain 0), all loops stopped
    after finish (no active nodes).
  - finisher: boss HP 0 → letterbox + zoom + combo counter → stage clear.
  - last stand: force `losses = LIVES-1`, TEAM HP ≤ 20% → Claude falls (eyes closed) → SSJ transform →
    all bugs destroyed → Claude healed → cleanup; camera/zoom classes removed afterwards.
  - armour: pieces crack, then break off as TEAM HP drops; vacuumed in cleanup.
- Screenshots of each phase for review.

---

## STATUS (handoff — where the work stopped)

### Done
- `src/buddies/sprites.js` — appended `export const vicFight` (kick pose, Super Saiyan `ssj` / `ssjKick` frames, `ssjPalette` gold hair).
- `src/bugEvent/bugSprites.js` — **rewritten** for v5: boss types `e403` (Error403), `halluc` (Hallucination), `rollback` (RollbackKing), armies `minion` (TokenBug) / `elite` (DoubleBookingBug); `BUG_POSES` now also has `uppercut` + `watch`; `MINION_FRAMES` (classic small green bug), `ELITE_PALETTE`, `WINGS` + `WING_PALETTE`; armour split into `ARMOR_PIECES` (helmet/chest with intact + cracked frames, broken = not drawn); `SWORDS` and old `ARMOR` removed.
- `src/bugEvent/sound.js` — **new**: synthesized SFX (`sfx(name, pitch)`, `loop/stopLoop`), mp3 music (`TRACKS`, `playMusic`, `stopMusic`, `duckMusic`), `setMuted/isMuted` (localStorage `bug:sound`, ON by default), `initAudio()` (call on the bug-button click), `pauseAll/resumeAll/stopAll`.

### ✅ v6 implemented (2026-11-10): the 3-minute show
- **Music-driven director:**
  - The whole event runs to `public/audio/bug-hero.mp3` (3:37), with `CUES` and `PACE` in `BugEvent.jsx`.
  - Stage changes, finishers, the two stage 3 deaths, Claude's fall (2:36), SSJ (2:50), the sky battle (2:58), the beam struggle and the final blow (3:20) all land within about ±0.5 s of their cues.
  - Measured in headless Chrome with the track playing.
- **No transitions between stages.** The aftermath, wipe, `between` phase, game over and Retry are gone. Losing a life still escapes to the next page.
- **Card decals** render inside the card (portal into `.bug-decals`), so the fire and cracks follow a hanging or falling card. This fixes the hanging bug.
- **Stage 1:**
  - the card club (guaranteed once per rampage);
  - 429 minis;
  - the stalled-download laser;
  - a [Retry] assist button.
- **Swarms:**
  - stage 2: chat-reply hatching;
  - stage 3: the Askademic badge, then 3 waves;
  - ant-trail marches, "!" telegraphs, drop shadows, the dogpile and shake-off.
- **Buddies:** dodge / perfect-dodge counter, parry, wall jump, air juggle and slam, debris kicks, Claude's blink and bubble shield, springboard.
- **Final battle:** the swarm wipe spares the boss, then rollback to peak, thunderstorm sky battle (clash / barrage / knock / counter), beam struggle, disintegrate, heal.
- Cutscenes use wall-clock time, so a low frame rate can't desync them from the music.
- Not done as separate pixel art: the beam pose reuses June Vic's arms-forward frame, and the parry reuses his "held" frame.

### ✅ v5 implemented (2026-11-10)
- `BugEvent.jsx` was rewritten for v5, and the build passes. On top of sections 1–11 it also has:
  - the **crying beat** in the last stand;
  - the **stage aftermath** (chain explosions → PAGE DAMAGE % → coloured stage wipe);
  - the **new ending** (final explosions → VICTORY pose → results card with rank → ⏩ cleanup montage with returning letters → shine → high five → walk off).
- The camera zooms *and pans* the focus toward the screen centre.
- `bugEvent.css` has the v5 styles; the sword and K.O. styles are gone.
- `BugButton.jsx` has the Retreat label and calls `initAudio()`.
- `sound.js` has new sounds: sad, sob, clap, shine.
- Docs are updated: BUDDIES.md and DECISIONS #24.
- Verified in headless Chrome:
  - full win: 3 stages, all phases, finishers, aftermaths, ending, clean restore;
  - lock: a link click and Back stay on the page;
  - last stand, start to finish;
  - forced loss: escape to `/about`, then Retreat;
  - 0 page errors in the final runs.
- **Still open:** the user's OST mp3s in `public/audio/`.

### Original to-do list (all done except the music files)
1. Rewrite `BugEvent.jsx` v5 following sections 1–11 above (reuse v4 pieces: `bitePage`, `fallCard`, `dropLetters`, `restorePage`, spawn sequence, `lose` + pixel wipe, `cleanup`, specials in `pickCombo/comboStep`). Key new parts: lock (capture click blocker + history guard, Escape ignored), stage/phase runner, multi-bug list (boss + minions + decoys), minion/flyer AI, boss powers (403 shield broken by kicks, progress-bar throw, decoys, citation rain, rollback heal, desync blink, uppercut), hand-to-hand fighter combos (jab/cross/kick, headbutt/spin kick, flying kick, jump-kick for flyers) + combo counter, armour crack/break by TEAM HP (70%/40%), camera (`scale` + origin on `.bug-event`, `main`, `.bug-damage`, `.bug-bgfx`) + letterbox, combo finisher (card / slam / screen-crack per stage), last stand (Claude falls, eyes closed via blink char, SSJ transformation, flying rampage, heal), sound hooks everywhere.
2. `bugEvent.css` — locked nav (`html.bug-locked`), minions/wings, 403 shield, citation/progress-bar projectiles, letterbox, combo counter, impact star, screen-crack overlay, aura/lightning/rocks/heal fx, armour shards, mute button, SSJ glow + afterimages, explosion ring, remove sword styles.
3. `BugButton.jsx` — "Retreat from the bug attack" label while running; call `initAudio()` + `sfx('start')` on click.
4. Music: user will add 8-bit mp3s to `public/audio/` named as in `TRACKS` (`bug-stage1/2`, `bug-boss`, `bug-transform`, `bug-victory`).
5. Update `src/buddies/BUDDIES.md` + `DECISIONS.md` #24 with the refined description (note: the description above still names the old bugs — use Error403 / Hallucination / RollbackKing from section 4b).
6. Verify with the headless-Chrome scripts (dev hook `window.__bugG` in BugEvent.jsx): lock, all phases, forced loss → next page, game over → Retry, finisher, last stand, sound/mute, full restore after.
