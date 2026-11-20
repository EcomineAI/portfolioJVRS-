# June Vic M. Abello — Portfolio

[![Live Site](https://img.shields.io/badge/Live-junevicabello.site-1D4ED8?style=flat-square&logo=vercel&logoColor=white)](https://www.junevicabello.site)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=141414)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?style=flat-square&logo=greensock&logoColor=141414)](https://gsap.com/)
[![Vercel](https://img.shields.io/badge/Hosted_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

**Three Worlds:**
![01 Code](https://img.shields.io/badge/01_%C2%B7_Code-Things_I_build-166534?style=flat-square)
![02 Create](https://img.shields.io/badge/02_%C2%B7_Create-Things_I_make-B91C1C?style=flat-square)
![03 Learn](https://img.shields.io/badge/03_%C2%B7_Learn-Things_I_am_learning-A14D05?style=flat-square)

Personal developer portfolio of **June Vic M. Abello**, a BS Computer Science student at Gordon College. Built with React and Vite in a retro pixel-art style with light and dark modes, interactive animations, and playful extras across every page.

---

## Portfolio Overview

```mermaid
flowchart TB
  classDef shell fill:#1d4ed8,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef page fill:#166534,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef extra fill:#6d28d9,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef secret fill:#b91c1c,stroke:#141414,stroke-width:2px,color:#ffffff

  SHELL["App Shell (Header, Theme & Sound Toggle, Direct Contact, Footer)"]

  subgraph PAGES["Pages"]
    direction LR
    HOME["/ Home"]
    ABOUT["/about About & Skills"]
    PROJS["/projects (Code, Create, Learn)"]
    CASE["/case-study Askademic Case Study"]
    CONTACT["/contact Contact & Developer ID"]
  end

  subgraph EXTRAS["Interactive Layers"]
    direction LR
    SPRAY["Spray Paint Canvas"]
    BUDDIES["Pixel Buddies (June Vic & Claude)"]
    BOT["JV-BOT Assistant"]
    BOSS["Hidden Boss Fight (Konami Code)"]
  end

  SHELL --> PAGES
  SHELL --> EXTRAS

  class SHELL shell
  class HOME,ABOUT,PROJS,CASE,CONTACT page
  class SPRAY,BUDDIES,BOT extra
  class BOSS secret
```

---

## Features & Data Flow

```mermaid
flowchart LR
  classDef source fill:#a14d05,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef flow fill:#1d4ed8,stroke:#141414,stroke-width:2px,color:#ffffff
  classDef view fill:#166534,stroke:#141414,stroke-width:2px,color:#ffffff

  GH["GitHub Activity"] -->|"Build-time snapshot + live refresh"| GHV["2D Heatmap & 3D Skyline Views"]
  FORM["Direct Contact Form"] -->|"Validation"| MAIL["In-Page Email or Pre-filled Gmail Fallback"]
  PREFS["Theme & Audio"] -->|"Saved locally"| UI["Light / Dark Palette & UI Sound Effects"]

  class GH,FORM,PREFS source
  class GHV,MAIL,UI view
```

---

## Pages

| Route | Tag | What Visitors See |
| :--- | :--- | :--- |
| `/` | ![Home](https://img.shields.io/badge/Home-1D4ED8?style=flat-square) | Dot-matrix intro, interactive skill keycap board, roaming buddies, and featured work |
| `/about` | ![About](https://img.shields.io/badge/About-166534?style=flat-square) | Background, skills pegboard & chains, certifications, GitHub activity, and timeline |
| `/projects` | ![Projects](https://img.shields.io/badge/Projects-166534?style=flat-square) | Featured Askademic showcase and all work grouped into Code, Create, and Learn |
| `/case-study` | ![Case Study](https://img.shields.io/badge/Case_Study-B91C1C?style=flat-square) | Askademic software engineering & UX walkthrough with sticky notebook navigation |
| `/contact` | ![Contact](https://img.shields.io/badge/Contact-A14D05?style=flat-square) | Developer ID card with scannable LinkedIn QR, direct email form, links, and FAQ |
| `404` | ![Not Found](https://img.shields.io/badge/Game_Over-B91C1C?style=flat-square) | Retro "Game over" screen for unknown routes |

---

## Interactive Highlights

| Feature | Tag | Description |
| :--- | :--- | :--- |
| **Spray Paint Mode** | ![Interactive](https://img.shields.io/badge/Canvas-1D4ED8?style=flat-square) | 5 modes (silly string, paint, sand, confetti, letters), custom nozzles & color palettes |
| **Pixel Buddies** | ![Sprites](https://img.shields.io/badge/Buddies-166534?style=flat-square) | Animated June Vic & Claude sprites roaming cards and vacuuming up spray paint |
| **GitHub Activity** | ![Visuals](https://img.shields.io/badge/2D_%2B_3D-166534?style=flat-square) | Switchable 2D contribution heatmap and 3D skyline |
| **Developer ID Card** | ![ID Card](https://img.shields.io/badge/QR_%2B_Barcode-6D28D9?style=flat-square) | Interactive ID card with scannable LinkedIn QR code and pixel barcode |
| **JV-BOT** | ![Assistant](https://img.shields.io/badge/RPG_Chat-1D4ED8?style=flat-square) | Retro RPG-style portfolio chat assistant |
| **UI Sound Effects** | ![Audio](https://img.shields.io/badge/Web_Audio-7C3AED?style=flat-square) | Toggleable retro web audio feedback across buttons and interactive keys |
| **Konami Easter Egg** | ![Secret](https://img.shields.io/badge/Boss_Fight-B91C1C?style=flat-square) | Hidden 3-stage pixel boss fight across the live page |

---

## Color Palette & Typography

**Fonts:** `Press Start 2P` (headings), `VT323` (UI labels & tags), `Space Grotesk` (body copy)

| Role | Light Mode (Warm Paper) | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| **01 · Code** | ![#166534](https://img.shields.io/badge/%23166534-166534?style=flat-square) | ![#15803D](https://img.shields.io/badge/%2315803D-15803D?style=flat-square) | Engineering projects & badges |
| **02 · Create** | ![#B91C1C](https://img.shields.io/badge/%23B91C1C-B91C1C?style=flat-square) | ![#DC2626](https://img.shields.io/badge/%23DC2626-DC2626?style=flat-square) | Creative work & alerts |
| **03 · Learn** | ![#A14D05](https://img.shields.io/badge/%23A14D05-A14D05?style=flat-square) | ![#B45309](https://img.shields.io/badge/%23B45309-B45309?style=flat-square) | Study, labs & experiments |
| **Background** | ![#F4F1EA](https://img.shields.io/badge/%23F4F1EA-F4F1EA?style=flat-square) | ![#111214](https://img.shields.io/badge/%23111214-111214?style=flat-square) | Page canvas |
| **Card Surface** | ![#FCFBF8](https://img.shields.io/badge/%23FCFBF8-FCFBF8?style=flat-square) | ![#1A1C20](https://img.shields.io/badge/%231A1C20-1A1C20?style=flat-square) | Elevated pixel cards |
| **Primary Text** | ![#141414](https://img.shields.io/badge/%23141414-141414?style=flat-square) | ![#E8E5DD](https://img.shields.io/badge/%23E8E5DD-E8E5DD?style=flat-square) | Headings & body ink |
| **Accent** | ![#1D4ED8](https://img.shields.io/badge/%231D4ED8-1D4ED8?style=flat-square) | ![#60A5FA](https://img.shields.io/badge/%2360A5FA-60A5FA?style=flat-square) | Links, buttons & focus states |

---

## Featured Work by World

| World | Project | Overview |
| :--- | :--- | :--- |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | **Askademic** | Faculty Appointment & Consultation System (featured at `/case-study`) |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | **GC-Assist** | AI-Powered Conversational Information System for Gordon College |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | **JALgorithm** | ML chatbot for salon appointment booking & reminders |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | **jv-ytdlp** | Browser-based desktop video downloader powered by `yt-dlp` |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | **TwitchChat Sim** | AI-powered Twitch chat simulator for testing & streaming practice |
| ![Code](https://img.shields.io/badge/01_%C2%B7_Code-166534?style=flat-square) | **State and Effect** | Interactive React lesson deck on state, re-rendering & `useEffect` |
| ![Create](https://img.shields.io/badge/02_%C2%B7_Create-B91C1C?style=flat-square) | **System Prompt Library** | Personas and prompt templates for local LLMs |
| ![Create](https://img.shields.io/badge/02_%C2%B7_Create-B91C1C?style=flat-square) | **UI & Graphics** | Mockups and visual assets |
| ![Create](https://img.shields.io/badge/02_%C2%B7_Create-B91C1C?style=flat-square) | **Video Editing & Motion** | CapCut edits, project demos & short-form video cuts |
| ![Create](https://img.shields.io/badge/02_%C2%B7_Create-B91C1C?style=flat-square) | **3D Modeling & Renders** | Blender & Prisma3D scenes, props & visual experiments |
| ![Learn](https://img.shields.io/badge/03_%C2%B7_Learn-A14D05?style=flat-square) | **BS Computer Science** | Gordon College, Olongapo City |
| ![Learn](https://img.shields.io/badge/03_%C2%B7_Learn-A14D05?style=flat-square) | **Local LLM Lab** | Running and integrating open models on local hardware |
| ![Learn](https://img.shields.io/badge/03_%C2%B7_Learn-A14D05?style=flat-square) | **Linux & Cybersecurity** | Hands-on Linux administration, networking & security basics |
| ![Learn](https://img.shields.io/badge/03_%C2%B7_Learn-A14D05?style=flat-square) | **AI Agents & Automation** | Tool-using agents, MCP servers & `n8n` workflows |

---

## Project Structure

```text
├── public/               # Static media, project covers, tech icons & audio
├── scripts/              # Build-time GitHub contributions snapshot fetcher
└── src/
    ├── pages/            # Route pages (Home, About, Projects, CaseStudy, Contact, 404)
    ├── components/       # Layout shell, Developer ID card, Email form & UI primitives
    ├── data/             # Profile, projects, skills, case study & FAQ content
    ├── styles/           # Design tokens, base styles & responsive layout rules
    ├── activity/         # 2D GitHub heatmap & 3D skyline views
    ├── buddies/          # Roaming pixel sprites (June Vic & Claude)
    ├── bugEvent/         # Konami-unlocked boss fight easter egg
    ├── dotmatrix/        # Dot-matrix text & portrait canvas effects
    ├── sound/            # Toggleable retro UI sound effects
    ├── spray/            # Interactive spray paint canvas
    └── widgets/          # JV-BOT assistant & Now Playing widget
```

---

## Links

- **Website:** https://www.junevicabello.site
- **GitHub:** https://github.com/EcomineAI
- **LinkedIn:** https://www.linkedin.com/in/june-vic-abello-82a1683b7/
- **Email:** junevicabello@gmail.com
