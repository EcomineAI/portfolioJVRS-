// Evidence-based skills: level = number of my projects that use it (see plan.md GitHub scan).
// `projects` are slugs from data/projects.js.

export const skillGroups = [
  {
    id: 'frontend',
    title: 'Frontend',
    skills: [
      { name: 'React', projects: ['askademic', 'gc-assist', 'jalgorithm'] },
      { name: 'Vite', projects: ['askademic', 'gc-assist', 'jalgorithm'] },
      { name: 'React Router', projects: ['askademic', 'gc-assist', 'jalgorithm'] },
      { name: 'CSS theming / dark mode', projects: ['askademic', 'gc-assist', 'jv-ytdlp'] },
      { name: 'framer-motion', projects: ['askademic', 'gc-assist'] },
      { name: 'Tailwind CSS', projects: ['jalgorithm'] },
      { name: 'PWA', projects: ['askademic'] },
    ],
  },
  {
    id: 'backend',
    title: 'Backend & data',
    skills: [
      { name: 'Supabase (PostgreSQL)', projects: ['askademic', 'gc-assist', 'jalgorithm'] },
      { name: 'Auth & row-level security', projects: ['askademic', 'jalgorithm'] },
      { name: 'Realtime subscriptions', projects: ['askademic'] },
      { name: 'Node.js', projects: ['jv-ytdlp'] },
      { name: 'Edge Functions', projects: ['jalgorithm'] },
    ],
  },
  {
    id: 'ai',
    title: 'AI / LLM',
    skills: [
      { name: 'LM Studio (local LLMs)', projects: ['gc-assist', 'jalgorithm', 'twitchchat-sim', 'local-llm-lab'] },
      { name: 'Prompt & context engineering', projects: ['gc-assist', 'twitchchat-sim', 'prompt-engineering'] },
      { name: 'Retrieval / relevance scoring', projects: ['gc-assist'] },
      { name: 'transformers.js (in-browser ML)', projects: ['gc-assist'] },
    ],
  },
  {
    id: 'tools',
    title: 'Python & tooling',
    skills: [
      { name: 'Python', projects: ['gc-assist', 'twitchchat-sim', 'askademic'] },
      { name: 'Web scraping (BeautifulSoup)', projects: ['gc-assist'] },
      { name: 'Electron', projects: ['jv-ytdlp'] },
      { name: 'Git & GitHub', projects: ['askademic', 'gc-assist', 'jalgorithm', 'jv-ytdlp', 'twitchchat-sim'] },
      { name: 'Vercel', projects: ['askademic', 'gc-assist', 'jalgorithm'] },
    ],
  },
];

export const troubleshooting = [
  { area: 'Hardware', items: ['PC builds & assembly', 'RAM / storage diagnosis', 'Thermal & power issues'] },
  { area: 'Software', items: ['OS errors & crashes', 'Driver conflicts', 'Windows / Linux fixes'] },
  { area: 'LLM / AI', items: ['Model load errors', 'VRAM & out-of-memory', 'GGUF compatibility'] },
  { area: 'Network', items: ['Wi-Fi / LAN drops', 'DNS & IP config', 'Local server & tunnels'] },
];
