# Portfolio Redesign Plan

**Layout reference:** serkanuslu.com/en — compact home with numbered "worlds", list rows, detail pages, a hero floor with pixel buddies, and a spray-paint canvas.
**Style reference:** youssefahmedy.vercel.app — pixel-art / retro-game UI.
We recreate *patterns and tokens*, not their code, copy, images or branding.

---

## Course requirements (prof's instructions) — these override everything below

| # | Requirement | How the plan meets it | Status |
|---|---|---|---|
| R1 | Individual build, any stack, works on **mobile + desktop** | Vite + React; dedicated mobile-first responsive layouts across all pages, tested at 360px, 390px, 768px, 1280px+ | ✅ done |
| R2 | UI/UX principles: **clear navigation, readable content, consistent design, usability, accessibility** | Plain nav labels (see IA), readable body font for long text, one token system, spray/buddies opt-in and never blocking, WCAG AA contrast, keyboard + screen reader support, reduced motion | ✅ done — see §R2 notes |
| R3 | **SE project as featured case study**; other work optional; **state own role & contributions** in team projects | Askademic is the #1 featured item on Home and Projects (2-col retro browser preview card); every team project has a "My role" + "My contributions" block | ✅ done |
| R4 | Case study content follows the **provided slide deck template** (adapt, don't copy layout) | `/case-study` maps 1:1 to sections `01`–`08` with corkboard hero, locker TOC (`CS-01`), and lined notebook sheets | ✅ done |
| R5 | Publish on a **paid, affordable domain + hosting**; domain **based on own name**; publicly accessible | Deployed on Vercel with custom domain `www.junevicabello.site` | ✅ done |
| R6 | AI allowed; **review & personalize**; **must be able to explain** work and decisions | Owner reviewed copy and design; `DECISIONS.md` logs every design/tech choice with the UI/UX principle behind it | ✅ done |

**Suggested structure → our pages:** Home → `/` · About & skills → `/about` · Projects → `/projects` · Case study → `/projects/<se-project>` (also linked as "Case Study" in nav) · Contact → `/contact`.

### R2 notes — keeping the fun features compliant
- **Readable content:** Press Start 2P only for headings/labels; VT323 for short UI text; **long prose (case study, about) uses a readable font** (e.g. "Space Grotesk" or "Inter") at ≥17px, line length ≤ 70ch. This is a deliberate trade-off to defend in the presentation.
- **Clear navigation:** nav uses the prof's plain names (Home, About, Projects, Case Study, Contact). "Code / Create / Learn" survive only as *filters/groups inside Projects*, not as top-level nav.
- **Usability:** spray never starts on links/buttons/text inputs; one-click Clear; can be turned off and the choice is remembered. Buddies sit in the hero only and never cover content.
- **Accessibility:** skip-to-content link, visible focus rings (pixel style), semantic landmarks/headings, alt text on all images, buddy menu is a real `<button>` + keyboard-operable menu, canvases `aria-hidden`, `prefers-reduced-motion` disables physics/wandering, contrast checked in both themes, chatbot input labelled.
- **Consistency:** single token file; every card/button uses the same primitives.

### Publishing (domain purchased: `www.junevicabello.site`)

**Purchased domain:** `www.junevicabello.site` (apex `junevicabello.site`) — full name (meets "based on your own name"). Keep the purchase receipt as proof of a *paid* domain for the prof.

**Where to buy (approx. yearly prices; confirm at checkout, renewals may differ):**

| Registrar | `.com` | Notes |
|---|---|---|
| ✅ **Porkbun** | ~$11 | Free WHOIS privacy, simple DNS, accepts card/PayPal |
| Cloudflare Registrar | ~$10.50 (at cost) | Cheapest renewals; DNS must stay on Cloudflare |
| Namecheap | ~$7–11 first year | Renewal higher; free privacy |
| Vercel Domains | ~$11–20 | Auto-connects to Vercel, fewest steps |
| `.ph` registrars | ~$35+ | Local TLD but much pricier — not needed |

**Hosting** — the site is a static build (`dist/`), so it runs anywhere:
- If only the domain must be paid → **Vercel Hobby + custom domain** (repo already has `vercel.json`).
- If hosting must be paid too → Hostinger "Premium Web Hosting" (often bundles a free domain for year 1) or Netlify/Vercel Pro. On Apache hosts add `.htaccess` SPA fallback to `index.html`.

**Step by step (Vercel + `www.junevicabello.site`):**
1. Domain `www.junevicabello.site` purchased; keep WHOIS privacy, auto-renew, and the payment receipt (proof of a *paid* domain for the prof).
2. In Vercel: import `EcomineAI/portfolioJVRS-` → it auto-detects Vite → deploy.
3. Vercel → Project → Settings → Domains → add `www.junevicabello.site` and `junevicabello.site` (redirect apex → `www.junevicabello.site` or vice versa).
4. In registrar DNS: point `www` (`CNAME` → `cname.vercel-dns.com` or the exact value Vercel shows) and apex `@` (`A` → `76.76.21.21`), removing any default parking records.
5. Wait for DNS (minutes to a few hours); Vercel issues HTTPS automatically.
6. Verify: open on desktop + a phone on mobile data, test deep links (`/projects`, `/case-study`) load directly, test the contact links.
7. Put the URL in the GitHub repo "About" field and in the résumé.

**Budget:** ≈ ₱600–700 / year (domain only) on the Vercel path.

---

## 0. Decisions (✅ = recommended default)

| # | Question | Options |
|---|---|---|
| 1 | Top-level nav | ✅ **Home / About / Projects / Case Study / Contact** (prof's structure) with Code / Create / Learn as groups inside Projects — or the reference's Code / Create / Learn nav |
| 2 | Multi-page vs single page | ✅ **Multi-page** with `react-router-dom` — or one long page with anchors only |
| 3 | Project detail pages | ✅ **Yes** — the SE case study is full-length; other projects get short pages |
| 4 | Current effects (particles, aurora, glitch, tilt, magnetic) | ✅ **Drop** them; keep chatbot, now-playing, theme toggle, Konami |
| 5 | TR/EN language switch, ⌘K search | ✅ **Skip** |
| 6 | Body font for long text | ✅ **Readable sans for prose**, pixel fonts for headings/UI — or VT323 everywhere (riskier for "readable content") |
| 7 | Hosting | ✅ depends on prof's answer: Vercel + paid domain, or paid static host + paid domain |

**Inputs needed from owner before building the case study:**
1. Confirm the SE project = **FACS / Askademic** (repo `CAE-G-CAS`) — see GitHub scan below. Which name to show (G-CAS → FACS → Askademic)?
2. The case study slide deck template.
3. Team (README lists June A., Erica M., Erica C.): each member's role and **my specific contributions**. All 138 commits are under `EcomineAI`, so git history alone can't show the split.
4. Screenshots, wireframes/designs, process artifacts (user research, flows), final result, lessons learned.
5. Whether hosting must also be paid.

**Owner answers (Nov 9 2026):**
| # | Answer |
|---|---|
| SE project | **Askademic** (repo `CAE-G-CAS`, formerly G-CAS → FACS) |
| Slide deck, team roles, screenshots, lessons learned | **Template placeholders for now** — render visible `TODO` blocks, fill later |
| Hosting | **Vercel + paid custom domain (`https://www.junevicabello.site`)** |
| Pixel avatar source | `public/jv.png` |
| TryHackMe | **Template slot for now** (no account data yet) |
| Askademic admin bypass | Not now |
| Identity | **Real name: June Vic M. Abello** (first: June Vic, middle: M., last: Abello). Drop "EcomineAI" as primary brand; logo `<JVA/>`. GitHub handle stays `EcomineAI` in links only. |

**Status (Nov 19 2026):** ✅ Complete mobile-first responsive overhaul across all pages; EmailJS direct email form (`DirectEmailForm.jsx`) + `.env.example`; LinkedIn integrated across McLovin Developer ID card (with Version-6 ECC-H scannable QR code), `/contact`, footer Connect, and JV-BOT; `/case-study` redesigned with corkboard hero, locker TOC (`CS-01`), and full-width lined notebook sheets (`01`–`08`); `/projects` Askademic featured card upgraded to 2-col retro browser preview; `03 · Learn` expanded to 4 topics with verified local cover photos in `public/projects/`; résumé PDF updated. Build passes cleanly (`npm run build`).
**Remaining:** Replace placeholder Lorem ipsum text inside the résumé PDF when ready, configure EmailJS env vars on Vercel (`VITE_EMAILJS_*`), and rehearse `DECISIONS.md`.

---

## GitHub scan (github.com/EcomineAI, Nov 2026)

### Project inventory

| Repo | What it is | Team? | Stack (verified from repo) | Live | Portfolio slot |
|---|---|---|---|---|---|
| **CAE-G-CAS** → FACS / Askademic | Faculty Appointment & Consultation System for Gordon College CCS: real-time faculty availability, booking, schedules, approvals | **Team of 3** (June A., Erica M., Erica C.) | React, Vite, React Router, Supabase (Postgres, Auth, Realtime, Storage, RLS), framer-motion, lucide-react, sonner, auto-animate, vite-plugin-pwa, ESLint, Python (Cloudflare tunnel script) | cae-g-cas.vercel.app | ★ **Featured SE case study** |
| **GC-Assist** | AI campus assistant for Gordon College; local LLM via LM Studio; scraped knowledge base with relevance scoring to fit the context window | Solo | React 19, Vite, React Router, Supabase (auth), framer-motion, react-markdown, `@xenova/transformers`, gpt-tokenizer, Python (BeautifulSoup crawler, Cloudflare/ngrok tunnels) | gcassist.vercel.app | Code #2 |
| **jalgorithm-chatbot** | JALgorithm — ML-based chatbot for appointment booking & reminders for small salons (thesis) | **Team of 3** (Abello, Azucenas, Ecalnir) | React, Vite, Tailwind v4, Supabase (Postgres, Auth, Edge Functions), LM Studio (OpenAI-compatible API), ngrok | jalgorithm-chatbot.vercel.app | Code #3 (in progress) |
| **jv-ytdlp** | Windows desktop video downloader with browser UI; smart quality detection, progress/ETA, ffmpeg merge, MP3 mode, one-click installer | Solo | Electron, Node.js HTTP server, yt-dlp, ffmpeg, HTML/JS, Windows installer | Releases v0.2 | Code #4 |
| **ECO-S-TWITCHCHAT-SIM** | AI Twitch chat simulator with personalities, emotes, raid events | Solo | Python, LM Studio (Gemma 3), CLI + GUI | — | Code #5 |
| docs | Fork of PaperMC docs | — | — | — | skip |
| GhostMask-Universal-Stealth---source | Near-empty repo (1 KB) | — | — | — | skip |

### Evidence-based tech profile (replaces the old % skill bars)

| Area | Skills (count = projects that use it) |
|---|---|
| Languages | JavaScript (5), HTML (5), CSS (5), SQL / PostgreSQL (3), Python (2), TypeScript (1), Batch scripting (2) |
| Frontend | React (4), Vite (4), React Router (3), Tailwind CSS (1), framer-motion (2), PWA (1), CSS theming / dark mode (3), Vitest (1) |
| Backend & data | Supabase (3), Node.js server (1), Edge Functions (1), Auth & row-level security (2), Realtime subscriptions (1) |
| AI / LLM | LM Studio (4), transformers.js (1), prompt & context engineering (3), retrieval / relevance scoring (1), token counting (1) |
| Automation & scripts | n8n (no project count), yt-dlp & FFmpeg (1), web scraping, PDF parsing, Python GUI |
| Design & 3D | Figma, Blender (no project count) |
| Editors & IDEs | VS Code (6), Antigravity IDE, Google Colab (no project count) |
| Dev workflow | Git (6), GitHub (6), Vercel (4), Vitest (1) |

Tools with no project count are ones I use day to day but that aren't tied to one repo. They show "daily tool" instead of a number.

**Skill display (built):** instead of XP/LVL bars, skills are logo tiles grouped by category, and the home hero shows a 3D keycap board (6 columns × 4 rows of logos). Each key's count is the number of shipped projects using it; tools without a repo show no count.

### Content corrections for the current site
- The current copy ("No frameworks, no bloat", "No OpenAI, no cloud", "fully local") undersells the work. The real projects use React, Supabase cloud and Vercel. Rewrite to match.
- "3 coding projects" → at least 5 shipped repos.
- Add FACS, JALgorithm and jv-ytdlp, which the current site doesn't mention.

### ⚠ Security note (fix before featuring FACS publicly)
The CAE-G-CAS README publishes an **admin bypass login** (`Admin@gmail.com` / `admin`). If cae-g-cas.vercel.app still accepts it, anyone can get admin access and change user roles. Remove the bypass (or limit it to local dev), rotate it, and drop it from the README before linking the live app from the portfolio.

---

## Reference notes

**serkanuslu.com/en (layout)** — Next.js on Vercel, `/en` + `/tr` routes.
- Home = hero → Code → Create → Explore → "Say hi" → "Hi, I'm …" sign-off. Each world: intro, "Now" featured card, list rows, "View all (N) →".
- Hero: giant name (top edge faded), role line with colored marker highlights, lead sentence, mono meta line, pills `● 01 CODE ● 02 CREATE ● 03 EXPLORE ↓`, a 3D keycap board of skills on the right (click a key to open its projects; the board spins in on a fresh page load), floor line with two pixel buddies.
- List row: title · one-liner · meta `type / date / tags` · arrow link. No filter tabs.
- Project page: back link, meta strip (type, date, read time), eyebrow, title, summary, tags, cover + caption, Live/Source buttons, My role, Tools and their roles, numbered "In this story" TOC, prose + screenshots, CTA repeat, prev/next pager.
- About: bio, numbered Journey timeline, How I work, "On my desk" tools list, Bookmarks. Contact: Say hi + email Copy + location + socials + résumé PDF. Same Say hi block ends every page.
- Header: logo, nav, ⌘K search, socials, TR link, spray-settings button.
- **Spray:** canvas + Verlet physics silly string; "hold on an empty spot to spray"; strands catch on headings (`data-spray`), surfaces (`data-spray-surface`), zones (`data-spray-zone`), ignore `[data-no-spray]` and interactive elements; modes spray / brush / flick; settings panel with chips.
- **Buddies:** "me" + "claude" cast on a floor; walk/run/hop/dance; speech bubbles; click menu "What now?".

**youssefahmedy.vercel.app (style)** — Next.js + Tailwind + shadcn/ui, Inter loaded but body/headings overridden by pixel fonts.
- `body { font-family: VT323 }`, `h1–h6 { font-family: 'Press Start 2P'; letter-spacing: .05em; line-height: 1.6 }`, `--radius: 0`, `--pixel-size: 4px`.
- `.pixel-card`, `.pixel-button`, `.pixel-grid`, `.pixel-cursor`, `.animate-pixel { transition: all .2s steps(5) }`.
- Skills shown as game HUD: tier labels (EXPERT / ADVANCED / SKILLED), `LVL 11`, `11,420 XP`. Square glyph `■` before nav items. Light + dark theme toggle.

---

## 1. Style system (from the style reference's CSS)

| Token | Value |
|---|---|
| Heading font | `Press Start 2P`, letter-spacing .05em, line-height 1.6 |
| Body font | `VT323`, 1.125rem, letter-spacing .05em |
| Radius | `0` everywhere |
| Primary | `hsl(228 90% 63%)` ≈ `#4C6EF6` |
| Dark | bg `#0D1226` · card `#151D38` · border `#223060` · text `#C9D2E0` · muted `hsl(218 46% 69%)` |
| Light | bg `#F0F2FF` · text `#1A2447` · border `hsl(218 30% 83%)` |
| Card | 4px solid border + `8px 8px 0` hard offset shadow (foreground @ 80%) |
| Button | 4px border + `4px 4px 0` shadow; hover → translate(2px,2px) shadow 2px; active → translate(4px,4px) shadow 0 |
| Background | `.pixel-grid` — 4px grid lines at 5% foreground |
| Motion | `transition: … steps(5)` for choppy pixel movement |
| Extras | pixel cursor, XP/LVL bars, light + dark theme |

**World colors** (from the layout reference's pill dots / role highlights, used for markers, dots, spray paint):
- 01 Code — mint `#5CF2C8`
- 02 Create — pink `#FF9EC0`
- 03 Learn — yellow `#F7D44A`

**Rules:** Press Start 2P only for headings and labels ≥ 16px (it is hard to read small); body stays in VT323. Check WCAG AA contrast for muted text in both themes. Respect `prefers-reduced-motion` everywhere.

---

## 2. Information architecture

```
/                 Home        hero(+floor & buddies) → ★ Featured case study → 01 Code → 02 Create → 03 Learn
                              (short previews) → Say hi → sign-off
/about            About       photo, bio, interests, skills as logo tiles by category, certificates (pictures, click to enlarge), troubleshooting "skill tree",
                              journey timeline (education), "On my desk" tools
/projects         Projects    ★ SE case study card first (large) → groups Code / Create / Learn
                              (anchor pills or filter chips); each row: title · one-liner · type/date/tags · role
/projects/:slug   Project     short project page; team projects always show My role + Contributions
/case-study       Case Study  alias/redirect to /projects/<se-project> — full-length case study (template below)
/contact          Contact     Say hi: email (mailto + Copy), Gmail compose, GitHub, OnlineJobs.ph, résumé PDF
*                 404         "GAME OVER — Continue?" page with links back
```

**Case study page sections** (exact order to be aligned with the prof's slide deck once received):
1. Overview — name, one-line pitch, timeline, team, tools, links (live/repo)
2. Problem — context and pain points
3. Target users — personas / user groups and their needs
4. My role & contributions — what *I* did vs the team (explicit list)
5. Process — research → requirements → flows → wireframes → build → testing (numbered steps)
6. Designs — wireframes, mockups, style decisions, with captions
7. Final result — screenshots, key features, demo link/video
8. Lessons learned — what worked, what I'd change, what I learned
Plus: sticky numbered table of contents on desktop, prev/next pager.

- Router: `react-router-dom`; SPA fallback rewrite to `/index.html` on the host.
- **Header:** `<eco.mine/>` logo · nav (Home, About, Projects, Case Study, Contact) · spray-settings button · theme toggle. Mobile: full-screen pixel menu with large tap targets (≥44px).
- **Skip link** to `#main` as the first focusable element.
- **Every page** ends with the shared **Say hi** block (email + Copy, socials, résumé) and a pixel-grid footer.
- Skipped for now: TR/EN language switch, ⌘K search.

---

## 3. Home page (matches the screenshot)

**Hero**
1. Giant two-line name **JUNE VIC / ABELLO** in Press Start 2P, top edge faded with a CSS mask gradient.
2. Role line: **Web Developer** with a chunky pixel marker highlight behind the words (the "AI" part was removed from the role on purpose).
3. Lead sentence (large VT323): what I build.
4. Mono meta line: `2nd-year BSCS · Gordon College · Python, JS · LM Studio, Gemma, Qwen`.
5. Anchor pills with colored dots: `● 01 CODE  ● 02 CREATE  ● 03 LEARN  ↓`.
6. Right side: 3 numbered featured cards (01 Code · GC-Assist, 02 Create · …, 03 Learn · …), floating/stacked, `data-spray-surface`.
7. Bottom: **floor line** (1px rule with colored segments) where the **buddies** live (§6).

**World sections** (×3): eyebrow `01 · CODE`, title, intro, "Now" featured card, list of `ItemRow`s, `View all (N) →`.

---

## 4. Components

| Component | Notes |
|---|---|
| `Layout`, `Header`, `Footer`, `SayHi`, `ThemeToggle` | shared shell |
| `PixelButton`, `PixelCard`, `Tag` `[Python]`, `Eyebrow`, `SectionHeading` | primitives |
| `ItemRow` | title · one-liner · meta (`type / date / tags`) · arrow link |
| `FeaturedCard` | numbered thumbnail card |
| `ViewAll` | `View all (N) →` |
| `XpBar` | skill % → `LVL n` + stepped segmented bar |
| `ProjectPage` | back link, meta strip, eyebrow/title/summary/tags, cover + caption, Live/Source buttons, My role, Tools & roles, numbered TOC, story sections, Pager (prev/next) |
| `SprayLayer`, `SprayPanel` | §5 |
| `BuddyFloor`, `Buddy`, `PixelSprite` | §6 |
| `Chatbot` | restyled as RPG dialog box; can be opened from the Claude buddy |
| `NowPlaying` | becomes a small HUD badge ("Equipped: LM Studio + Gemma 3 4B") |

**Content model** (`src/data/projects.js`): `slug, world, type, date, title, summary, cover, tags[], role, tools[{name, role}], story[{heading, body, image?}], links{live, source}`.
Needs from owner: screenshots/covers, dates, short "how I made it" write-ups (can ship short first).

**Dropped** (clash with pixel look): particles, aurora, glitch text, 3D tilt, magnetic buttons.
**Kept:** chatbot, now-playing, theme toggle, Konami easter egg.

---

## 5. Spray feature (own implementation)

**Behaviour**
- Press-and-hold on an *empty* spot sprays. Ignored over `a, button, input, textarea, select, label, [data-no-spray]`.
- A pixel **spray-can sprite** follows the pointer while spraying (shake wobble on start).
- **Modes** (chips in `SprayPanel`):
  - **String** — silly-string strands: Verlet rope (≈20 points each) with gravity; they drape over and catch on headings, loose ends swing on scroll.
  - **Paint** — drips that run down from the nozzle point and pool on top of headings.
  - **Clear** — wipe everything.
- Colors cycle through the world palette (mint, pink, yellow, primary blue).
- Header button (spray-can icon) opens the panel: mode, color, clear, on/off. One-time hint toast on first visit: "Hold on an empty spot to spray".

**Engine**
- Two fixed full-viewport canvases (`pointer-events: none`): strands/paint layer + can sprite.
- Strands stored in **document coordinates**, drawn offset by `scrollY` so paint stays on the content.
- Collision: rectangles from elements marked `data-spray` / `data-spray-surface` (`getBoundingClientRect` + scroll), recomputed on resize/scroll (throttled). Rect collision is enough; no DOM-raster masks.
- Pixel look: snap rendered points to a 4px grid, draw as squares.
- Budget: max ~60 strands; oldest removed first; RAF pauses when nothing is moving; DPR-aware canvas.
- Touch: long-press conflicts with scrolling → on touch devices spraying only works while "spray mode" is toggled on in the panel.
- Reduced motion: no physics; paint is static dots.
- Optional later: 404 mini-game ("bugs on the page — spray to glue them").

**Files:** `src/spray/engine.js` (pure physics + render, no React), `src/spray/SprayLayer.jsx`, `src/spray/SprayPanel.jsx`, `src/spray/useSprayTargets.js`.

---

## 6. Pixel buddies (own sprites)

**Cast**
- **Vic** — pixel avatar of June Vic (≈16×20 px sprite, based on jv.png: hair, hoodie colors).
- **Claude** — little orange critter (`#D97757`), blocky body, two dark eyes, tiny legs; small heart pops above it when near Vic.

**Behaviour**
- Live on the hero `BuddyFloor`; wander with a 2-frame walk cycle; idle bob; Claude roughly follows Vic.
- Random speech bubbles (our own lines), e.g. Vic: "Running Gemma locally…", Claude: "Need a hand? Click me!".
- Click a buddy → pixel menu **"What now?"**: Walk · Run · Hop · Dance · Say hi. On Claude, *Say hi* opens the EcomineAI chatbot.
- Smaller buddy pair can reappear in the Say hi block.

**Rendering:** sprites defined as string grids (`'..OOOO..'`) + palette → SVG `<rect>`s with `shape-rendering: crispEdges`; frames swapped on a timer. Buttons are real `<button>`s with labels; decorative parts `aria-hidden`; reduced motion → stand still.

**Files:** `src/buddies/sprites.js`, `PixelSprite.jsx`, `Buddy.jsx`, `BuddyFloor.jsx`.

---

## 6b. Live activity widget (GitHub contributions, 2D grid + 3D skyline)

**Reference:** owner's screenshots — panel titled `// LIVE ACTIVITY: GITHUB`, total badge (`N ALL-TIME`), segmented toggle `2D | 3D SKYLINE`, contribution heatmap (2D) or isometric extruded bars (3D), footer stats (`events (365d)`, `longest streak`, `last 30 days`) and a `Less ▢▢▢▢▢ More` legend.

**Real data today (EcomineAI, Nov 9 2026):** 393 all-time · 380 in last 365 days · 86 in last 30 days · longest streak 7 days · 41 active days.
→ The graph will be sparser than the reference screenshot. That's honest; levels are scaled to *my* max day so the busy weeks still pop. Tip: enable GitHub → Settings → Public profile → **"Include private contributions"** so private-repo work counts too.

**Data source (verified):**
- **Primary — build-time snapshot:** `scripts/fetch-contributions.mjs` runs before `vite build`, fetches `https://github-contributions-api.jogruber.de/v4/EcomineAI?y=all` (public, no token, returns per-day `count` + `level` 0–4), sorts by date, computes stats, writes `src/data/contributions.json`. Site always renders even if the API is down later.
- **Fallback:** if the fetch fails at build time, keep the last committed JSON.
- **Optional freshness:** refetch at runtime (API sends `Access-Control-Allow-Origin: *`) and swap in newer data silently; or a daily Vercel Deploy Hook / GitHub Action to rebuild.
- **TryHackMe:** not included (no account found). Add later as a second series if wanted.

**Stats computed:** all-time total, last-365-days total, last 30 days, longest streak, current streak, active days, busiest day.

**2D mode** — 53 × 7 grid of square cells (Sun→Sat rows), radius 0, 2px gaps, 5 levels. Colors use the site's **primary blue ramp** (not GitHub green) so it matches the pixel theme: level 0 = card surface, 1–4 = increasing `--primary` lightness. Month labels on top, Mon/Wed/Fri on the left. Hover/focus a cell → pixel tooltip `12 contributions · Mar 4, 2026`.

**3D skyline mode** — isometric extruded columns drawn on a `<canvas>` (no Three.js, keeps bundle small):
- Each day = an iso box; height ∝ count (clamped, min 1px tile for zero days); 3 faces with light/medium/dark shades of the level color → crisp pixel look.
- Painter's algorithm (draw back-to-front by week + weekday) so no depth buffer needed.
- DPR-aware, re-renders on resize/theme change; `steps()` "build-up" animation when first scrolled into view (columns grow in 5 steps); none with reduced motion.
- Hover = highlight column + same tooltip (hit-test by projecting pointer back to grid coords).

**UI shell** — `PixelCard` with header (status dot, `// LIVE ACTIVITY: GITHUB`, total badge), `2D | 3D SKYLINE` toggle as a `role="radiogroup"` of two pixel buttons (choice remembered in localStorage, default 2D on mobile), footer stats + legend, link "View on GitHub ↗".

**Accessibility** — canvas `aria-hidden`; a visually hidden summary ("380 contributions in the last year, longest streak 7 days…") and a `<details>` "View as table" (month × total) for screen readers/keyboard; toggle is keyboard operable; contrast of level colors checked against the card.

**Placement** — About & skills page under the tech profile (proof of the skills). Compact 2D version on Home under "01 Code" is optional.

**Files:** `scripts/fetch-contributions.mjs`, `src/data/contributions.json`, `src/activity/ActivityPanel.jsx`, `Heatmap2D.jsx`, `Skyline3D.jsx`, `stats.js`. `package.json`: `"prebuild": "node scripts/fetch-contributions.mjs"`.

---

## 7. Phases

| # | Phase | Output | Parallel? |
|---|---|---|---|
| 0 | Confirm decisions; get slide deck template, SE project details, role/contributions, screenshots | content | — |
| 1 | **Foundation**: router, Layout/Header/Footer, skip link, tokens + primitives, SPA rewrite | empty routes in new style | no — everything depends on it |
| 2a | Home (hero, featured case study, group previews, Say hi) | `/` | ✅ agent |
| 2b | Projects list + short project page | `/projects`, `/projects/:slug` | ✅ agent |
| 2c | **Case study page** (template-aligned) | `/case-study` | ✅ agent — content written/reviewed by owner |
| 2d | About & skills, Contact, 404 | 3 pages | ✅ agent |
| 3a | **Spray** engine + panel | `src/spray/*` | ✅ agent |
| 3b | **Buddies** sprites + floor + menu | `src/buddies/*` | ✅ agent |
| 3c | Chatbot → RPG dialog; NowPlaying → HUD | widgets | ✅ |
| 3d | **Activity widget**: fetch script + JSON, 2D heatmap, 3D skyline canvas, stats, a11y table | `src/activity/*` | ✅ agent |
| 4 | Integration + QA: 360px mobile, keyboard, contrast both themes, reduced motion, Lighthouse, perf of spray on low-end, prune dead CSS | polish | no |
| 4b | **Personalize & explain**: owner rewrites all copy in own voice; write `DECISIONS.md` (each choice → UI/UX principle → why); rehearse explaining spray engine, buddies, routing, a11y | defensible project | no |
| 5 | Domain `www.junevicabello.site` purchased; connect to Vercel, DNS, HTTPS, SPA fallback; build + deploy; test on real phone; commit, push | public site on own domain (`https://www.junevicabello.site`) | in progress — domain purchased, wire DNS & deploy |

Agents for 2a–3c work in separate git worktrees on disjoint files, against the Phase 1 primitives; I merge and do Phase 4.

---

## 8. Risks

- **Spray performance** — physics + full-screen canvas on low-end phones. Mitigate: point budget, pause RAF when idle, DPR cap of 2.
- **Spray vs. usability** — must never block clicks/selection; strict ignore-list and `pointer-events: none` canvases.
- **Thin content** — Create/Learn need at least one real "Now" item each.
- **SPA routing on Vercel** — rewrite required or deep links 404.
- **Carry-over fixes** — chatbot email typo (`@email.com` → `@gmail.com`), duplicated About paragraph.
