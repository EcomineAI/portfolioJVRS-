# June Vic M. Abello — Portfolio (`portfolio-jvrs` v0.5.0)

[![Live Site](https://img.shields.io/badge/Live-junevicabello.site-1D4ED8?style=flat-square&logo=vercel&logoColor=white)](https://www.junevicabello.site)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=141414)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-6.30.6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15.1-88CE02?style=flat-square&logo=greensock&logoColor=141414)](https://gsap.com/)
[![uisfx](https://img.shields.io/badge/Audio-uisfx_0.4.0-7C3AED?style=flat-square)](https://www.npmjs.com/package/uisfx)
[![EmailJS](https://img.shields.io/badge/Contact-EmailJS_REST_+_Gmail_Fallback-F59E0B?style=flat-square&logo=gmail&logoColor=141414)](https://www.emailjs.com/)
[![WCAG AA](https://img.shields.io/badge/Contrast-WCAG_AA_%E2%89%A5_4.5:1-166534?style=flat-square)](src/styles/tokens.css)

**Domain Color Worlds:**
![01 Code](https://img.shields.io/badge/01_%C2%B7_Code-Things_I_build-166534?style=flat-square)
![02 Create](https://img.shields.io/badge/02_%C2%B7_Create-Things_I_make-B91C1C?style=flat-square)
![03 Learn](https://img.shields.io/badge/03_%C2%B7_Learn-Things_I_am_learning-A14D05?style=flat-square)

Technical specification and architecture documentation for the personal developer portfolio of **June Vic M. Abello** (`BS Computer Science`, Gordon College). Built as a zero-backend React 18 + Vite 5 SPA styled around a 4 px pixel-grid design system (**Warm Paper & Charcoal Ink** light default + dark mode) with custom physics, procedural encoders, synthesized Web Audio, and build-time data hydration on Vercel.

---

## 1. System Architecture

The application separates **eager shell/home rendering**, **idle-prefetched route chunks**, **non-React simulation loops** (canvas spray physics, 100 ms pixel buddy AI, DOM boss fight), and **build-time GitHub snapshot hydration**.

```mermaid
flowchart TB
  classDef entry fill:#1d4ed8,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef provider fill:#6d28d9,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef route fill:#166534,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef overlay fill:#b91c1c,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef data fill:#a14d05,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef infra fill:#334155,stroke:#141414,stroke-width:2px,color:#ffffff

  HTML["index.html (pre-paint data-theme script)"] --> MAIN["src/main.jsx (BrowserRouter)"]
  MAIN --> APP["src/App.jsx (useKonami + prefetchAllRoutes)"]
  APP --> LAYOUT["src/components/layout/Layout.jsx"]

  subgraph PROVIDERS["Global Context Providers"]
    direction LR
    SOUND["SoundProvider (src/sound/SoundContext.jsx)"] --> SPRAY["SprayProvider (src/spray/SprayContext.jsx)"]
  end

  LAYOUT --> PROVIDERS

  subgraph SHELL["Persistent App Shell"]
    direction LR
    BG["PixelBackground"]
    HDR["Header + Lazy BugButton"]
    OUTLET["Suspense Outlet"]
    SAYHI["SayHi + DirectEmailForm (skipped on /contact)"]
    FTR["Footer"]
  end

  SPRAY --> SHELL

  subgraph ROUTES["Route Graph (src/routes.js)"]
    direction TB
    HOME["/ -> Home.jsx (Eager)"]
    ABOUT["/about -> About.jsx (Lazy)"]
    PROJS["/projects -> Projects.jsx (Lazy)"]
    REDIR["/projects/askademic -> Redirect to /case-study"]
    PDETAIL["/projects/:slug -> ProjectDetail.jsx (Lazy)"]
    CASE["/case-study -> CaseStudy.jsx (Lazy)"]
    CONTACT["/contact -> Contact.jsx (Lazy)"]
    NF["* -> NotFound.jsx (Lazy)"]
  end

  OUTLET --> ROUTES

  subgraph OVERLAYS["Persistent Interactive Layers"]
    direction LR
    BUDDIES["BuddyWorld (100ms AI loop)"]
    BOT["Chatbot (JV-BOT RPG dialog)"]
    SLAYER["SprayLayer (60Hz Dual Canvas)"]
    BUG["BugEvent (Konami-gated Lazy Chunk)"]
  end

  SPRAY --> OVERLAYS

  subgraph DATA["Static & Build-Hydrated Data (src/data/)"]
    direction LR
    D1["profile.js / worlds.js / projects.js"]
    D2["caseStudy.js / skills.js / certifications.js"]
    D3["chatbot.js / faq.js / techIcons.js"]
    CONTRIB["contributions.json (prebuild snapshot)"]
  end

  ROUTES --> DATA
  PREBUILD["scripts/fetch-contributions.mjs"] --> CONTRIB

  class HTML,MAIN,APP entry
  class SOUND,SPRAY,LAYOUT provider
  class HOME,ABOUT,PROJS,REDIR,PDETAIL,CASE,CONTACT,NF route
  class BUDDIES,BOT,SLAYER,BUG,HDR,SAYHI overlay
  class D1,D2,D3,CONTRIB data
  class PREBUILD,BG,FTR,OUTLET infra
```

---

## 2. Route Splitting, Bundle Chunking & Idle Prefetch

![Chunking](https://img.shields.io/badge/Chunks-react--vendor_%2B_gsap_%2B_Lazy_Routes-1D4ED8?style=flat-square)
![Data Saver](https://img.shields.io/badge/Prefetch-Save--Data_Aware-166534?style=flat-square)

`Home.jsx` is bundled into the initial entry chunk for immediate First Contentful Paint. All secondary routes and `BugEvent.jsx` are code-split via `React.lazy` in [`src/routes.js`](src/routes.js) and [`vite.config.js`](vite.config.js).

```mermaid
flowchart LR
  classDef blue fill:#1d4ed8,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef green fill:#166534,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef amber fill:#a14d05,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef red fill:#b91c1c,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef slate fill:#334155,stroke:#141414,stroke-width:2px,color:#ffffff

  MOUNT["App.jsx Mount"] --> SAVE{"navigator.connection.saveData?"}
  SAVE -->|"true"| SKIP["Skip background prefetch"]
  SAVE -->|"false"| IDLE{"requestIdleCallback available?"}
  IDLE -->|"Yes (timeout 1500ms)"| PRELOAD["prefetchAllRoutes()"]
  IDLE -->|"No (fallback 600ms)"| PRELOAD
  HOVER["Header NavLink Intent"] --> PREONE["prefetchRoute(path)"]
  PRELOAD --> DEDUP["prefetched Set deduplication"]
  PREONE --> DEDUP

  DEDUP --> C1["About / Projects / CaseStudy / Contact / ProjectDetail"]
  KONAMI["Konami Code or sessionStorage bug:unlocked=1"] --> C2["BugButton + BugEvent Chunks"]
  VITE["vite.config.js manualChunks"] --> V1["react-vendor (react, react-dom, react-router-dom)"]
  VITE --> V2["gsap (gsap, @gsap/react)"]

  class MOUNT,HOVER,VITE blue
  class PRELOAD,PREONE,C1 green
  class SAVE,IDLE,DEDUP amber
  class KONAMI,C2 red
  class SKIP,V1,V2 slate
```

### Route Matrix

| Route | Strategy | Page Module | Key Components & Subsystems | Primary Data Modules |
| :--- | :--- | :--- | :--- | :--- |
| `/` | ![Eager](https://img.shields.io/badge/EAGER-166534?style=flat-square) | `src/pages/Home.jsx` | `DotText`, `SkillKeys` (Web Audio keycaps), `BuddyFloor`, `WorldList` | `profile.js`, `projects.js` |
| `/about` | ![Lazy](https://img.shields.io/badge/LAZY-1D4ED8?style=flat-square) | `src/pages/About.jsx` | `RetroType`, `Cartridge3D`, `PegBoard`, `SkillChains`, `ActivityPanel`, `PixelGadget` | `contributions.json`, `skills.js`, `certifications.js` |
| `/projects` | ![Lazy](https://img.shields.io/badge/LAZY-1D4ED8?style=flat-square) | `src/pages/Projects.jsx` | Featured Askademic browser mockup card, `WorldList` grouped by world | `projects.js`, `worlds.js` |
| `/projects/askademic` | ![Redirect](https://img.shields.io/badge/REDIRECT-A14D05?style=flat-square) | `Navigate` | Canonical client redirect to `/case-study` | `CASE_STUDY_SLUG` |
| `/projects/:slug` | ![Lazy](https://img.shields.io/badge/LAZY-1D4ED8?style=flat-square) | `src/pages/ProjectDetail.jsx` | Project specs, `TagList`, team role breakdown, missing-slug 404 card | `projects.js`, `worlds.js` |
| `/case-study` | ![Lazy](https://img.shields.io/badge/LAZY-1D4ED8?style=flat-square) | `src/pages/CaseStudy.jsx` | `useActiveSection` (`IntersectionObserver`), locker TOC (`CS-01`), lined notebook sheets (`01`-`08`) | `caseStudy.js`, `projects.js` |
| `/contact` | ![Lazy](https://img.shields.io/badge/LAZY-1D4ED8?style=flat-square) | `src/pages/Contact.jsx` | Inline `SayHi`, `DirectEmailForm`, Developer ID card (`idCodes.js`), `Asia/Manila` clock | `profile.js`, `faq.js` |
| `*` | ![Lazy](https://img.shields.io/badge/LAZY-B91C1C?style=flat-square) | `src/pages/NotFound.jsx` | Retro "Game over" screen with decorative `9 -> 0` countdown | — |

---

## 3. Cross-Module Event Buses & Interactive Subsystems

High-frequency visual and audio subsystems bypass React re-renders by communicating through plain-JS pub/sub buses (`sprayBus`, `buddyBus`) and `window` `CustomEvent` channels.

```mermaid
flowchart LR
  classDef bus fill:#6d28d9,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef engine fill:#1d4ed8,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef ui fill:#166534,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef secret fill:#b91c1c,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef dom fill:#334155,stroke:#141414,stroke-width:2px,color:#ffffff

  SE["SprayEngine (60Hz Canvas)"] <-->|"attach / emit start-end / countIn / vacuum"| SB["sprayBus (src/spray/sprayBus.js)"]
  SB <-->|"detects paint on cards & vacuums"| BW["BuddyWorld (100ms AI Tick)"]
  BW -->|"emit who & what status"| BB["buddyBus (src/buddies/buddyBus.js)"]
  BB --> HUD["Buddy Status HUD"]

  KON["useKonami (Up Up Down Down L R L R B A)"] -->|"window event: konami:unlock + 2s hue-rotate"| LAY["Layout & Header"]
  LAY -->|"lazy mount"| BUG["BugEvent (3-Stage Boss Campaign)"]

  THM["useTheme (Light / Dark Toggle)"] -->|"window event: themechange + html dataset.theme"| SE
  THM -->|"localStorage theme"| ROOT["html[data-theme]"]

  DOC["Global Capture Click (SoundContext)"] -->|"reads data-uisfx / data-uisfx-pack / data-no-sfx"| UISFX["uisfx Web Audio Synthesizer"]
  TRIGGER["SayHi / External Trigger"] -->|"window event: chatbot:open"| BOT["Chatbot (JV-BOT)"]

  class SB,BB bus
  class SE,BW,UISFX engine
  class HUD,BOT,TRIGGER ui
  class KON,BUG secret
  class LAY,THM,ROOT,DOC dom
```

### Subsystem Engineering Specs

| Subsystem | Module | Color Tag | Technical Implementation Details |
| :--- | :--- | :--- | :--- |
| **Spray Physics Engine** | `src/spray/engine.js` | ![60Hz Canvas](https://img.shields.io/badge/Physics-60Hz_Fixed_Step-1D4ED8?style=flat-square) | Plain JS dual-canvas renderer stored in document coordinates. Fixed timestep `STEP = 1000/60`, 4-iteration Verlet/rope constraint solver (`SEG = 6`), bounded buffers (`MAX_STRAND = 700`, `MAX_STRANDS = 40`, `MAX_POINTS = 3200`, `MAX_DOTS = 4000`, `MAX_PARTICLES = 900`, `MAX_LETTERS = 400`), auto-sleep (`SLEEP_SPEED = 0.06` for `40` frames). Supports 5 modes (`string`, `paint`, `sand`, `confetti`, `letters`), 5 flow presets (`balanced`, `curly`, `heavy`, `floaty`, `chaos`), 4 nozzle sprites (`classic`, `graffiti`, `marker`, `crosshair`), 4 palettes (`section`, `neon`, `ink`, `print`), and static reduced-motion placement. |
| **Pixel Buddy Simulation** | `src/buddies/BuddyWorld.jsx` | ![100ms Tick](https://img.shields.io/badge/AI_Loop-100ms_Tick-166534?style=flat-square) | Autonomous agents (**June Vic** `48 px` wide, **Claude** `36 px` wide at `SCALE = 3`) walking at `3 px/tick` and running at `8 px/tick` across `[data-spray-surface]` card boundaries. Evaluates date/time-aware dialogue (`today()`, `timeOfDay()`), picks up paint coordinates via `sprayBus.countIn()`, and triggers vacuum cleanup via `sprayBus.vacuum()`. |
| **Procedural Barcode & QR** | `src/components/layout/idCodes.js` | ![Zero-Dep](https://img.shields.io/badge/Encoders-Code_128B_%2B_QR_ECC--H-6D28D9?style=flat-square) | Pure-JS **Code 128B** generator (`encodeCode128B`, start code `104`, mod-103 checksum, stop `106`) paired with a **stylized ECC Level H QR generator** featuring connected rounded modules, custom finder eyes, and center badge rendered onto the Developer ID card in `SayHi.jsx`. |
| **Dot-Matrix Portrait** | `src/dotmatrix/DotPortrait.jsx` | ![Canvas Mask](https://img.shields.io/badge/Image_Proc-Flood--Fill_Knockout-A14D05?style=flat-square) | Crops `411x411` portrait to 4:5 (`41, 0, 329x411`) and executes a stack-based flood fill seeded **only from top and side edges** (`r,g,b > 214`, chroma `< 26`) to clear studio white backgrounds while preserving the white shirt collar between lapels. |
| **Web Audio UI SFX** | `src/sound/SoundContext.jsx` | ![Web Audio](https://img.shields.io/badge/Audio-5_Preloaded_Packs-7C3AED?style=flat-square) | Wraps `uisfx` with first-gesture audio unlock, capture-phase DOM click delegation (`[data-uisfx]`, `[data-uisfx-pack]`, `[data-no-sfx]`), preloads 5 packs (`mechanical`, `minimal`, `studio`, `arcade`, `scifi`), and persists volume/mute in `localStorage['portfolio-jvrs:uisfx']`. |
| **Bug Attack Boss Fight** | `src/bugEvent/BugEvent.jsx` | ![Konami](https://img.shields.io/badge/Easter_Egg-3_Boss_Stages-B91C1C?style=flat-square) | Konami-gated lazy chunk (`GRAVITY = 1900`). Three bosses mapped to real portfolio projects (`Error403` / `jv-ytdlp`, `Hallucination` / `GC-Assist`, `RollbackKing` / `Askademic`) with combo mechanics, Last Stand sequence, non-destructive overlay FX, and clean DOM restoration on victory or retreat. |
| **GitHub Activity Views** | `src/activity/ActivityPanel.jsx` | ![2D + 3D](https://img.shields.io/badge/Charts-2D_Heatmap_%2B_3D_Skyline-166534?style=flat-square) | Dual visualization (`Heatmap2D.jsx` + `Skyline3D.jsx`). Auto-defaults to `2d` on `<= 640px` viewports and `3d` on desktop, persisted via `localStorage['activity-view']`. |
| **JV-BOT Dialog Widget** | `src/widgets/Chatbot.jsx` | ![Scripted RPG](https://img.shields.io/badge/Assistant-RPG_Typewriter-1D4ED8?style=flat-square) | Scripted retro RPG dialog box (`TYPE_MS = 16`, `THINK_MS = 380`) with `12x12` crisp-edge SVG avatar (`BotPortrait`), quick-action chips, and instant text render under `prefers-reduced-motion`. |

---

## 4. Direct Email Delivery & Validation Pipeline

![EmailJS](https://img.shields.io/badge/Primary-EmailJS_REST_v1.0-1D4ED8?style=flat-square)
![Fallback](https://img.shields.io/badge/Fallback-Prefilled_Gmail_Compose-166534?style=flat-square)
![Spam Guard](https://img.shields.io/badge/Protection-Honeypot_%2B_Regex_Validation-A14D05?style=flat-square)

[`DirectEmailForm.jsx`](src/components/layout/DirectEmailForm.jsx) validates input client-side, filters automated submissions with a hidden `website` honeypot field, and gracefully degrades to a pre-filled Gmail compose URL whenever `VITE_EMAILJS_*` environment variables are absent or the upstream API rejects.

```mermaid
sequenceDiagram
  autonumber
  participant V as Visitor (Browser)
  participant F as DirectEmailForm.jsx
  participant EJS as EmailJS REST API
  participant GM as Gmail Compose

  V->>F: Submit Name, Email, Message (+ hidden honeypot)
  alt Honeypot "website" is non-empty
    F-->>V: Silently abort submission
  else Empty required fields
    F-->>V: Show validation alert ("Please fill in your name, email, and message.")
  else Invalid format (!EMAIL_RE)
    F-->>V: Show validation alert ("Please enter a valid email address.")
  else Valid payload & VITE_EMAILJS_* env vars configured
    F->>EJS: POST /api/v1.0/email/send (service_id, template_id, user_id, dual template_params)
    alt HTTP 200 OK
      EJS-->>F: 200 OK
      F-->>V: Clear inputs + show sent confirmation
    else Network or HTTP error
      EJS-->>F: Error response
      F-->>V: Show error + pre-filled "Open in Gmail" link (buildGmailUrl)
    end
  else Valid payload & VITE_EMAILJS_* env vars unset
    F->>GM: window.open(buildGmailUrl) with su + body pre-filled
    F-->>V: Show fallback notice + keep pre-filled "Open in Gmail" link
  end
```

---

## 5. Build Pipeline, GitHub Data Hydration & Vercel CDN

![Prebuild](https://img.shields.io/badge/Prebuild-GitHub_Snapshot-166534?style=flat-square)
![CDN](https://img.shields.io/badge/Hosting-Vercel_Edge_CDN-000000?style=flat-square)

`npm run build` executes `scripts/fetch-contributions.mjs` before bundling so the GitHub activity heatmap/skyline always renders immediately at zero network cost, while silently falling back to the committed [`src/data/contributions.json`](src/data/contributions.json) if the third-party API times out (`15000 ms`).

```mermaid
flowchart LR
  classDef build fill:#1d4ed8,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef ext fill:#a14d05,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef ok fill:#166534,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef edge fill:#334155,stroke:#141414,stroke-width:2px,color:#ffffff

  CMD["npm run build"] --> PRE["prebuild: scripts/fetch-contributions.mjs"]
  PRE -->|"GET ?y=all (15s timeout)"| API["github-contributions-api.jogruber.de"]
  API -->|"200 Valid Array"| SNAP["buildSnapshot() -> write contributions.json"]
  API -->|"Timeout / Error"| KEEP["Warn & exit 0 (keep committed snapshot)"]
  SNAP --> VITE["vite build -> dist/"]
  KEEP --> VITE
  VITE --> VERCEL["Vercel CDN + SPA Rewrite (vercel.json)"]
  VERCEL --> CLIENT["ActivityPanel renders snapshot immediately"]
  CLIENT -.->|"Non-blocking CORS refresh"| API

  class CMD,PRE,VITE build
  class API ext
  class SNAP,KEEP,CLIENT ok
  class VERCEL edge
```

### Vercel HTTP Caching & Routing Rules (`vercel.json`)

| Pattern | Directive | Purpose |
| :--- | :--- | :--- |
| `/assets/(.*)` | `public, max-age=31536000, immutable` | Permanent caching for content-hashed Vite JS/CSS chunks |
| `/projects/(.*)` | `public, max-age=604800, stale-while-revalidate=86400` | 7-day edge/browser cache with 24 h background revalidation for project media |
| `/(.*)\\.(webp\|jpg\|jpeg\|png\|svg\|woff2)` | `public, max-age=604800, stale-while-revalidate=86400` | Long-lived caching for static images, icons, and fonts |
| `/(.*)` | Rewrite `-> /index.html` | Client-side React Router deep-link support (`/about`, `/projects/:slug`, `/case-study`, `/contact`) |

---

## 6. Design System & Color Tokens (`src/styles/tokens.css`)

Light mode (**Warm Paper & Charcoal Ink**) is the default; dark mode activates via `[data-theme="dark"]` on `<html>`, initialized synchronously in `index.html` before first paint to eliminate theme flash.

### World Accents & Fixed Ink

| Token | Light Mode | Dark Mode | Role |
| :--- | :--- | :--- | :--- |
| `--world-code` | ![#166534](https://img.shields.io/badge/%23166534-166534?style=flat-square) | ![#15803D](https://img.shields.io/badge/%2315803D-15803D?style=flat-square) | `01 · Code` badge, eyebrow, spray & progress accents |
| `--world-create` | ![#B91C1C](https://img.shields.io/badge/%23B91C1C-B91C1C?style=flat-square) | ![#DC2626](https://img.shields.io/badge/%23DC2626-DC2626?style=flat-square) | `02 · Create` badge, error left-border & creative accents |
| `--world-learn` | ![#A14D05](https://img.shields.io/badge/%23A14D05-A14D05?style=flat-square) | ![#B45309](https://img.shields.io/badge/%23B45309-B45309?style=flat-square) | `03 · Learn` badge & study/experiment accents |
| `--world-fg` / `--ink` | ![#FFFFFF](https://img.shields.io/badge/%23FFFFFF-FFFFFF?style=flat-square) ![#141414](https://img.shields.io/badge/%23141414-141414?style=flat-square) | ![#FFFFFF](https://img.shields.io/badge/%23FFFFFF-FFFFFF?style=flat-square) ![#141414](https://img.shields.io/badge/%23141414-141414?style=flat-square) | High-contrast world label ink & fixed pixel outline ink |

### Surface, Text & Interactive Palette

| Token | Light Mode (`:root`) | Dark Mode (`[data-theme='dark']`) | Contrast / Usage |
| :--- | :--- | :--- | :--- |
| `--bg` | ![#F4F1EA](https://img.shields.io/badge/%23F4F1EA-F4F1EA?style=flat-square) | ![#111214](https://img.shields.io/badge/%23111214-111214?style=flat-square) | Base page canvas |
| `--fg` | ![#141414](https://img.shields.io/badge/%23141414-141414?style=flat-square) | ![#E8E5DD](https://img.shields.io/badge/%23E8E5DD-E8E5DD?style=flat-square) | Primary body & heading ink |
| `--card` | ![#FCFBF8](https://img.shields.io/badge/%23FCFBF8-FCFBF8?style=flat-square) | ![#1A1C20](https://img.shields.io/badge/%231A1C20-1A1C20?style=flat-square) | Elevated pixel-card background |
| `--surface` | ![#E9E4D9](https://img.shields.io/badge/%23E9E4D9-E9E4D9?style=flat-square) | ![#23262C](https://img.shields.io/badge/%2323262C-23262C?style=flat-square) | Secondary control / feedback surface |
| `--muted-fg` | ![#4A4843](https://img.shields.io/badge/%234A4843-4A4843?style=flat-square) | ![#A3A098](https://img.shields.io/badge/%23A3A098-A3A098?style=flat-square) | Labels & metadata (~8.2:1 light / ~6.8:1 dark on `--card`) |
| `--primary` | ![#1D4ED8](https://img.shields.io/badge/%231D4ED8-1D4ED8?style=flat-square) | ![#60A5FA](https://img.shields.io/badge/%2360A5FA-60A5FA?style=flat-square) | Links, primary buttons (6.7:1 light / 7.4:1 dark) |
| `--primary-soft` | ![#2563EB](https://img.shields.io/badge/%232563EB-2563EB?style=flat-square) | ![#3B82F6](https://img.shields.io/badge/%233B82F6-3B82F6?style=flat-square) | Active accents & spray primary tone |
| `--primary-fg` | ![#FFFFFF](https://img.shields.io/badge/%23FFFFFF-FFFFFF?style=flat-square) | ![#111214](https://img.shields.io/badge/%23111214-111214?style=flat-square) | Text on `--primary` buttons |
| `--border` | ![#141414](https://img.shields.io/badge/%23141414-141414?style=flat-square) | ![#D6D2C7](https://img.shields.io/badge/%23D6D2C7-D6D2C7?style=flat-square) | Hard `4px` pixel borders |
| `--hairline` | ![#CFC8BA](https://img.shields.io/badge/%23CFC8BA-CFC8BA?style=flat-square) | ![#32363E](https://img.shields.io/badge/%2332363E-32363E?style=flat-square) | Dashed rules & subtle dividers |
| `--focus` | ![#1D4ED8](https://img.shields.io/badge/%231D4ED8-1D4ED8?style=flat-square) | ![#60A5FA](https://img.shields.io/badge/%2360A5FA-60A5FA?style=flat-square) | `3px` `:focus-visible` outline |

### Typography & Geometry Tokens

- **Fonts**: `'Press Start 2P'` (`--font-pixel`, headings/labels >= 16 px), `'VT323'` (`--font-ui`, tags/nav/controls), `'Space Grotesk'` (`--font-prose`, body copy at `1.0625rem` / `68ch` measure)
- **Pixel Grid**: `--px: 4px`, `--radius: 0`, `--border-w: 4px`, `--shadow-sm: 4px 4px 0 0 var(--shadow-color)`, `--shadow-md: 8px 8px 0 0 var(--shadow-color)`
- **Stepped Motion**: `--step-ease: steps(5, end)`, `--dur: 200ms`
- **Container Max Width**: `--max-w: 1760px` with responsive gutter `clamp(16px, 4vw, 72px)`

---

## 7. Portfolio Content Inventory (`src/data/projects.js`)

| World | Slug | Title | Summary |
| :--- | :--- | :--- | :--- |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | `askademic` | **Askademic** | Faculty Appointment & Consultation System (featured at `/case-study`) |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | `gc-assist` | **GC-Assist** | AI-Powered Conversational Information System for Gordon College |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | `jalgorithm` | **JALgorithm** | ML chatbot for salon appointment booking & reminders |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | `jv-ytdlp` | **jv-ytdlp** | Browser-based desktop video downloader powered by `yt-dlp` |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | `twitchchat-sim` | **TwitchChat Sim** | AI-powered Twitch chat simulator for testing & streaming practice |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | `state-and-effect` | **State and Effect** | Interactive React lesson deck on state, re-rendering & `useEffect` |
| ![Create](https://img.shields.io/badge/02_%C2%B7_Create-B91C1C?style=flat-square) | `prompt-engineering` | **System Prompt Library** | Personas and prompt templates for local LLMs |
| ![Create](https://img.shields.io/badge/02_%C2%B7_Create-B91C1C?style=flat-square) | `graphics` | **UI & Graphics** | Mockups and visual assets |
| ![Create](https://img.shields.io/badge/02_%C2%B7_Create-B91C1C?style=flat-square) | `video-editing` | **Video Editing & Motion** | CapCut edits, project demos & short-form video cuts |
| ![Create](https://img.shields.io/badge/02_%C2%B7_Create-B91C1C?style=flat-square) | `3d-modeling` | **3D Modeling & Renders** | Blender & Prisma3D scenes, props & visual experiments |
| ![Learn](https://img.shields.io/badge/03_%C2%B7_Learn-A14D05?style=flat-square) | `bscs-gordon-college` | **BS Computer Science** | Gordon College, Olongapo City |
| ![Learn](https://img.shields.io/badge/03_%C2%B7_Learn-A14D05?style=flat-square) | `local-llm-lab` | **Local LLM Lab** | Running and integrating models on local hardware (LM Studio) |
| ![Learn](https://img.shields.io/badge/03_%C2%B7_Learn-A14D05?style=flat-square) | `linux-cybersecurity` | **Linux & Cybersecurity** | Hands-on Linux administration, networking & security basics |
| ![Learn](https://img.shields.io/badge/03_%C2%B7_Learn-A14D05?style=flat-square) | `ai-agents-automation` | **AI Agents & Automation** | Tool-using agents, MCP servers & `n8n` workflows |

---

## 8. Repository Structure

```text
portfolioJVRS--main/
├── index.html                        # Entry HTML, Google Fonts & pre-paint theme script
├── package.json                      # Dependencies & npm scripts (dev, prebuild, build, preview)
├── vite.config.js                    # Vite + manualChunks (react-vendor, gsap)
├── vercel.json                       # Edge Cache-Control headers & SPA rewrite
├── scripts/
│   └── fetch-contributions.mjs       # Build-time GitHub activity fetcher (graceful offline fallback)
├── public/
│   ├── assets/tech/                  # Tech stack SVG/PNG icons & LICENSES.txt
│   ├── assets/ui/kenney-pixel-ui/    # CC0 pixel UI sprites
│   ├── audio/bug-hero.mp3            # Bug Attack stage soundtrack
│   └── projects/                     # Cover media, Askademic screenshots & personas
└── src/
    ├── main.jsx                      # ReactDOM root & BrowserRouter mount
    ├── App.jsx                       # Route table, Konami listener & idle route prefetcher
    ├── routes.js                     # Centralized lazy imports & Save-Data-aware prefetching
    ├── activity/                     # GitHub ActivityPanel, Heatmap2D, Skyline3D & stats.js
    ├── buddies/                      # BuddyWorld, Buddy, PixelSprite, sprites.js & buddyBus.js
    ├── bugEvent/                     # Konami-gated BugButton, 3-stage BugEvent, sprites & audio
    ├── components/
    │   ├── layout/                   # Layout, Header, Footer, SayHi, DirectEmailForm, idCodes, PixelBackground
    │   ├── showcase/                 # Cartridge3D, PegBoard, PixelGadget, RetroType, SkillChains, SkillKeys, WorldList
    │   └── ui/                       # Shared PixelButton, PixelCard, Eyebrow, SectionHeading, TagList, Reveal
    ├── data/                         # Structured portfolio content & contributions.json snapshot
    ├── dotmatrix/                    # DotField, DotPortrait (flood-fill mask) & DotText
    ├── hooks/                        # useKonami, useScrollToTop, useTheme
    ├── pages/                        # Home, About, Projects, ProjectDetail, CaseStudy, Contact, NotFound
    ├── sound/                        # SoundContext & uisfx Web Audio preload/delegation
    ├── spray/                        # SprayEngine (60Hz canvas physics), sprayBus, SprayLayer, SprayPanel
    ├── styles/                       # tokens.css, base.css, primitives.css, layout.css, index.css
    └── widgets/                      # Chatbot (JV-BOT) & NowPlaying
```

---

## 9. Local Development & Environment Variables

### Commands

```bash
npm install      # Install dependencies
npm run dev      # Start Vite dev server (HMR)
npm run build    # Run prebuild GitHub snapshot + Vite production bundle -> dist/
npm run preview  # Preview production dist/ locally
```

### Optional Environment Variables (`.env` / Vercel)

| Variable | Required | Default Behavior When Unset | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_EMAILJS_SERVICE_ID` | No | Falls back to pre-filled Gmail compose | EmailJS service identifier for `DirectEmailForm` |
| `VITE_EMAILJS_TEMPLATE_ID` | No | Falls back to pre-filled Gmail compose | EmailJS template identifier (`from_name`, `from_email`, `reply_to`, `message`, `to_email` + `name`, `email`, `title`) |
| `VITE_EMAILJS_PUBLIC_KEY` | No | Falls back to pre-filled Gmail compose | EmailJS public API key (`user_id`) |

> **Security note:** `.env` and `.env.*` are gitignored in [`.gitignore`](.gitignore). Add the three `VITE_EMAILJS_*` variables in **Vercel Project Settings -> Environment Variables** when deploying direct in-page mail delivery.

---

## 10. Links

- **Website:** https://www.junevicabello.site
- **GitHub:** https://github.com/EcomineAI
- **LinkedIn:** https://www.linkedin.com/in/june-vic-abello-82a1683b7/
- **Email:** junevicabello@gmail.com
