// All work items. Facts come from the GitHub scan in plan.md.
// `team` lists members for team projects; `role` + `contributions` say what *I* did.
// TODO(owner): fill every `todo:` field and confirm dates.

export const CASE_STUDY_SLUG = 'askademic';

export const projects = [
  // ---------------------------------------------------------------- CODE
  {
    slug: 'askademic',
    world: 'code',
    featured: true,
    title: 'Askademic',
    subtitle: 'Faculty Appointment & Consultation System',
    type: 'Web app · Software engineering project',
    date: 'Feb – Nov 2026',
    status: 'v0.15 · in use',
    summary:
      'A real-time system for the Gordon College CCS department: students see which faculty are available right now, book consultation slots, and get notified when requests are approved.',
    tags: ['React', 'Vite', 'Supabase', 'PostgreSQL', 'Realtime', 'PWA'],
    team: ['June Vic M. Abello', 'Erica Mae D. Camintoy', 'Ma. Erica P. Monton'],
    role: 'Implementation lead · Design assistance',
    contributions: [
      'Split frontend, Supabase backend, and documentation tracks across our 3-person team (Erica Mae D. Camintoy, Ma. Erica P. Monton, and myself) so parallel builds stayed aligned with defense milestones.',
      'Drove the shift from a generic admin screen to an Instructor → Program Chair → Department Dean review hierarchy after the May 8 defense panel, shaping the role switcher and dedicated Reports views.',
      'Specified and documented the unified auto-flagged login and mandatory “Closed · Held / No-show” outcome flow so students see real availability and instructors never leave ambiguous records (46 requests tracked, 14 closed with outcomes).',
      'Co-authored UX documentation, personas, journey maps, and interface reviews across the February – November 2026 build cycle.',
    ],
    links: { live: 'https://askademic1.vercel.app', source: 'https://github.com/EcomineAI/CAE-G-CAS' },
    cover: '/projects/askademic/cover.jpg',
  },
  {
    slug: 'gc-assist',
    world: 'code',
    title: 'GC-Assist',
    subtitle: 'An AI-Powered Conversational Information System for Gordon College',
    type: 'AI chatbot web app · BSCS 2-A',
    date: '2025 – 2026',
    status: '2nd Sem AY 2025–2026',
    summary:
      'GC-Assist is a self-hosted / cloud AI chatbot web application that provides instant, accurate answers to Gordon College inquiries using a local open-source Large Language Model (LLM) and Retrieval-Augmented Generation (RAG) over a verified institutional JSON knowledge base.',
    tags: ['React 19', 'Local LLM', 'RAG', 'LM Studio', 'Python', 'JSON KB', 'Supabase'],
    team: null,
    role: 'Solo developer (Gordon College, Olongapo City · BSCS 2-A): UI design, chat frontend, local JSON knowledge base, RAG pipeline, and LLM integration',
    highlights: [
      {
        title: 'Problem solved',
        items: [
          'Handles high-volume repetitive inquiries on admission requirements, enrollment schedules, academic programs, office locations, and announcements.',
          'Reduces delays, confusion, repeated questions, and administrative workload.',
        ],
      },
      {
        title: 'Architecture & pipeline',
        items: [
          '1. User submits a question via the chat interface.',
          '2. Backend server processes the request and retrieves relevant entries from a local JSON knowledge base.',
          '3. Local open-source LLM generates an instant response grounded only in authorized institutional data.',
        ],
      },
      {
        title: 'Target users',
        items: [
          'Prospective students, current students, parents and guardians, faculty and administrative staff, and the general public.',
        ],
      },
      {
        title: 'Why self-hosted & scalable',
        items: [
          'Better data privacy and institutional control — can operate inside an internal campus network with zero recurring cloud API fees.',
          'Architected for institutional licensing, tailored knowledge bases, and deployment across other schools.',
        ],
      },
    ],
    links: { live: 'https://gcassist.vercel.app', source: 'https://github.com/EcomineAI/GC-Assist' },
    cover: '/projects/gc-assist/cover.jpg',
    coverAlt: 'GC-Assist: An AI-Powered Conversational Information System for Gordon College — developed by June Vic M. Abello',
  },
  {
    slug: 'jalgorithm',
    world: 'code',
    title: 'JALgorithm',
    subtitle: 'ML chatbot for salon appointment booking & reminders',
    type: 'Research project · in progress',
    date: '2026',
    summary:
      'A chatbot that lets clients of small hair and makeup salons book appointments in natural language, with an admin dashboard for stylists and automated reminders.',
    tags: ['React', 'Tailwind v4', 'Supabase', 'Edge Functions', 'LM Studio'],
    team: ['June Vic M. Abello', 'Lorraine R. Azucenas', 'Alan Jr. P. Ecalnir'],
    role: 'Lead developer · Chatbot & Supabase integration',
    contributions: [
      'Built the React + Tailwind v4 conversational booking interface and stylist admin dashboard.',
      'Connected Supabase Edge Functions and database tables for appointment scheduling and automated reminders.',
      'Integrated natural-language intent handling via LM Studio for salon client inquiries.',
    ],
    links: { live: 'https://trevluna.vercel.app', source: 'https://github.com/EcomineAI/jalgorithm-chatbot' },
    cover: '/projects/jalgorithm/cover.jpg',
    coverAlt: 'JALgorithm (Makeup and Hair by Trev Luna) landing page and JAL booking chatbot',
  },
  {
    slug: 'jv-ytdlp',
    world: 'code',
    title: 'jv-ytdlp',
    subtitle: 'Browser-based desktop video downloader powered by yt-dlp',
    type: 'Windows desktop app',
    date: '2026',
    status: 'v0.2',
    summary:
      'A local Windows desktop app that lets you download videos through a clean browser UI — no command line needed after setup. Paste a URL, pick a quality, and download with live progress, ETA, and automatic ffmpeg audio/video merging.',
    tags: ['Electron', 'Node.js', 'yt-dlp', 'ffmpeg'],
    team: null,
    role: 'Solo developer: desktop wrapper, browser UI, and Windows installer',
    highlights: [
      {
        title: 'Key features',
        items: [
          'Detects available video/audio resolutions directly before downloading.',
          'Live download progress and ETA tracking in a clean browser interface.',
          'Merges high-quality video and audio streams automatically with ffmpeg.',
          'Packaged as a one-click Windows installer (JVDownloader.Setup.0.2.0.exe).',
        ],
      },
    ],
    links: { source: 'https://github.com/EcomineAI/jv-ytdlp' },
    cover: '/projects/jv-ytdlp/cover.webp',
    coverAlt: 'jv-ytdlp desktop video downloader browser UI',
  },
  {
    slug: 'twitchchat-sim',
    world: 'code',
    title: 'TwitchChat Sim',
    subtitle: 'AI-powered Twitch chat simulator for testing & streaming practice',
    type: 'Python app · beta',
    date: '2026',
    status: 'Beta 0.5',
    summary:
      'Recreates the energy of a live Twitch chat using local AI via LM Studio (Gemma 3). Simulates realistic viewer personalities, emote spam, follows/bits/donations, mod interventions, and streamer replies so you can test bots or practise streaming offline.',
    tags: ['Python', 'LM Studio', 'Gemma 3', 'Tkinter'],
    team: null,
    role: 'Solo developer: Python GUI/CLI, personality engine, and LM Studio integration',
    highlights: [
      {
        title: 'Key features',
        items: [
          'Configurable viewer personalities (Hype, Troll, Gamer, Question, LOL, Advice, Wholesome).',
          'Simulated follows, bits cheers, donations, custom emotes (Kappa, PogChamp), and mod/ban events.',
          'Real-time streamer chat input with AI viewer responses powered locally by Gemma 3 in LM Studio.',
        ],
      },
    ],
    links: { source: 'https://github.com/EcomineAI/ECO-S-TWITCHCHAT-SIM' },
    cover: '/projects/twitchchat-sim/cover.jpg',
    coverAlt: 'TwitchChat Sim live chat feed and behavior settings GUI',
  },
  {
    slug: 'state-and-effect',
    world: 'code',
    title: 'State and Effect',
    subtitle: 'Interactive React lesson deck on state, re-rendering & useEffect',
    type: 'React web app · class presentation',
    date: '2026',
    summary:
      'A retro-window React lesson on state, re-rendering, and useEffect, built as a 46-slide interactive deck across 14 core topics with live demos, quizzes, and explainer videos.',
    tags: ['React 19', 'Vite', 'Retro UI', 'Vercel'],
    team: null,
    role: 'Solo project: slides, live demos, retro UI, and sound design',
    highlights: [
      {
        title: 'Deck features',
        items: [
          '14 core topics across 46 slides covering Introduction to State, More on State, and Side Effects & useEffect.',
          'Keyboard shortcuts (Arrow keys, Space, Enter, Home/End, F for fullscreen) plus touch swipe navigation.',
          'URL hash sync so any slide link can be bookmarked and shared directly.',
        ],
      },
    ],
    links: { live: 'https://jv-sae.vercel.app', source: 'https://github.com/EcomineAI/-State-and-Effect---ppt' },
    cover: '/projects/state-and-effect/cover.jpg',
    coverAlt: 'State and Effect retro OS window slide deck title screen',
  },

  // -------------------------------------------------------------- CREATE
  {
    slug: 'prompt-engineering',
    world: 'create',
    title: 'System Prompt Library',
    subtitle: 'Personas and prompt templates for local LLMs',
    type: 'Prompt engineering',
    date: '2025–2026',
    summary:
      'System prompts, chain-of-thought templates and persona designs used across my AI projects, tuned for small local models.',
    tags: ['Prompt design', 'LM Studio', 'GGUF'],
    team: null,
    role: 'Solo',
    links: {},
    cover: '/projects/prompt-engineering.webp',
  },
  {
    slug: 'graphics',
    world: 'create',
    title: 'UI & Graphics',
    subtitle: 'Mockups and visual assets',
    type: 'Graphic design',
    date: '2025–2026',
    summary: 'UI mockups, logos and visual assets made for my projects and freelance work.',
    tags: ['UI design', 'Graphics'],
    team: null,
    role: 'Solo',
    links: {},
    cover: '/projects/graphics.webp',
  },
  {
    slug: 'video-editing',
    world: 'create',
    title: 'Video Editing & Motion',
    subtitle: 'CapCut edits, project demos & short-form video cuts',
    type: 'Video editing',
    date: '2025–2026',
    summary:
      'Project walkthroughs, showcase demos, and short-form video edits cut and paced in CapCut for school presentations and personal builds.',
    tags: ['CapCut', 'Video editing', 'Motion', 'Demos'],
    team: null,
    role: 'Solo',
    links: {},
    cover: '/projects/video-editing.webp',
    coverAlt: 'Multi-track video editing timeline and preview monitor',
  },
  {
    slug: '3d-modeling',
    world: 'create',
    title: '3D Modeling & Renders',
    subtitle: 'Blender & Prisma3D scenes, props & visual experiments',
    type: '3D design',
    date: '2025–2026',
    summary:
      'Exploring low-poly props, lighting, and 3D scene composition in Blender and Prisma3D for creative assets and visual experiments.',
    tags: ['Blender', 'Prisma3D', '3D modeling', 'Rendering'],
    team: null,
    role: 'Solo',
    links: {},
    cover: '/projects/3d-modeling.webp',
    coverAlt: 'Blender 3D viewport and modeling workspace',
  },

  // --------------------------------------------------------------- LEARN
  {
    slug: 'bscs-gordon-college',
    world: 'learn',
    title: 'BS Computer Science',
    subtitle: 'Gordon College, Olongapo City',
    type: 'Education',
    date: '2024 – present',
    summary: 'Programming, data structures, algorithms and software engineering, applied straight into real projects.',
    tags: ['Data structures', 'Algorithms', 'OOP', 'Software engineering'],
    team: null,
    role: 'Student',
    links: {},
    cover: '/projects/bscs-gordon-college.webp',
  },
  {
    slug: 'local-llm-lab',
    world: 'learn',
    title: 'Local LLM Lab',
    subtitle: 'Running and integrating models on my own hardware',
    type: 'Self-study',
    date: '2024 – present',
    summary:
      'Experiments with LM Studio and GGUF models (Gemma, Qwen, Llama): quantization, context limits, VRAM troubleshooting and wiring models into web apps.',
    tags: ['LM Studio', 'GGUF', 'Gemma', 'Qwen'],
    team: null,
    role: 'Self-directed',
    links: {},
    cover: '/projects/local-llm-lab.webp',
  },
  {
    slug: 'linux-cybersecurity',
    world: 'learn',
    title: 'Linux & Cybersecurity',
    subtitle: 'Hands-on Linux administration, networking & security basics',
    type: 'Self-study · Certs',
    date: '2024 – present',
    summary:
      'Practicing Linux CLI workflows, network diagnostics, and security fundamentals alongside Fortinet NSE 1, Cisco, and DICT Data Privacy certifications.',
    tags: ['Linux', 'Networking', 'Fortinet NSE 1', 'Data Privacy'],
    team: null,
    role: 'Self-directed',
    links: {},
    cover: '/projects/linux-cybersecurity.webp',
  },
  {
    slug: 'ai-agents-automation',
    world: 'learn',
    title: 'AI Agents & Automation',
    subtitle: 'Tool-using agents, MCP servers & n8n workflows',
    type: 'Self-study · Certs',
    date: '2025 – present',
    summary:
      'Exploring multi-step AI agent workflows, MCP integrations, and task automation with n8n, Claude Code, and OpenAI / Claude Academy courses.',
    tags: ['n8n', 'Claude Code', 'MCP', 'Automation'],
    team: null,
    role: 'Self-directed',
    links: {},
    cover: '/projects/ai-agents-automation.webp',
  },
];

export const projectBySlug = Object.fromEntries(projects.map(p => [p.slug, p]));
export const projectsInWorld = world => projects.filter(p => p.world === world);
export const caseStudyProject = projectBySlug[CASE_STUDY_SLUG];
