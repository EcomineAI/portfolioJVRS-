// Evidence-based skills: level = number of my projects that use it (see plan.md GitHub scan).
// `projects` are slugs from data/projects.js. `icon` names a logo in public/assets/tech/<icon>.svg (shown as a pixel-art tile); skills without one are listed as chips. `short` is the tile label when the full name is long.

export const skillGroups = [
  {
    id: 'languages',
    title: 'Languages',
    // From the GitHub API language breakdown of the public repos (2026-11-16) plus the stack listed for Askademic,
    // whose repo could not be read (private or renamed).
    skills: [
      { name: 'JavaScript', icon: 'javascript', projects: ['askademic', 'gc-assist', 'jalgorithm', 'jv-ytdlp', 'state-and-effect'] },
      { name: 'HTML', icon: 'html5', projects: ['askademic', 'gc-assist', 'jalgorithm', 'jv-ytdlp', 'state-and-effect'] },
      { name: 'CSS', icon: 'css', projects: ['askademic', 'gc-assist', 'jalgorithm', 'jv-ytdlp', 'state-and-effect'] },
      { name: 'SQL (PostgreSQL)', short: 'SQL', icon: 'postgresql', projects: ['askademic', 'gc-assist', 'jalgorithm'] },
      { name: 'Python', icon: 'python', projects: ['gc-assist', 'twitchchat-sim'] },
      { name: 'Batch scripting', icon: 'windows', projects: ['gc-assist', 'jv-ytdlp'] },
      { name: 'TypeScript', icon: 'typescript', projects: ['jalgorithm'] },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    skills: [
      { name: 'React', icon: 'react', projects: ['askademic', 'gc-assist', 'jalgorithm', 'state-and-effect'] },
      { name: 'Vite', icon: 'vite', projects: ['askademic', 'gc-assist', 'jalgorithm', 'state-and-effect'] },
      { name: 'React Router', icon: 'reactrouter', projects: ['askademic', 'gc-assist', 'jalgorithm'] },
      { name: 'CSS theming / dark mode', projects: ['askademic', 'gc-assist', 'jv-ytdlp'] },
      { name: 'framer-motion', icon: 'framer', projects: ['askademic', 'gc-assist'] },
      { name: 'Tailwind CSS', icon: 'tailwindcss', projects: ['jalgorithm'] },
      { name: 'PWA', icon: 'pwa', projects: ['askademic'] },
      { name: 'Vitest', icon: 'vitest', projects: ['jalgorithm'] },
    ],
  },
  {
    id: 'backend',
    title: 'Backend & data',
    skills: [
      { name: 'Supabase (PostgreSQL)', short: 'Supabase', icon: 'supabase', projects: ['askademic', 'gc-assist', 'jalgorithm'] },
      { name: 'Auth & row-level security', projects: ['askademic', 'jalgorithm'] },
      { name: 'Realtime subscriptions', projects: ['askademic'] },
      { name: 'Node.js server', short: 'Node.js', icon: 'nodedotjs', projects: ['jv-ytdlp'] },
      { name: 'Edge Functions', icon: 'deno', projects: ['jalgorithm'] },
    ],
  },
  {
    id: 'ai',
    title: 'AI / LLM',
    skills: [
      { name: 'LM Studio (local LLMs)', short: 'LM Studio', icon: 'lmstudio', projects: ['gc-assist', 'jalgorithm', 'twitchchat-sim', 'local-llm-lab'] },
      { name: 'Prompt & context engineering', projects: ['gc-assist', 'twitchchat-sim', 'prompt-engineering'] },
      { name: 'Retrieval / relevance scoring', projects: ['gc-assist'] },
      { name: 'transformers.js (in-browser ML)', short: 'transformers​.js', icon: 'huggingface', projects: ['gc-assist'] },
      { name: 'Token counting (gpt-tokenizer)', projects: ['gc-assist'] },
    ],
  },
  {
    id: 'tools',
    title: 'Tooling',
    skills: [
      { name: 'Web scraping (BeautifulSoup)', projects: ['gc-assist'] },
      { name: 'PDF parsing (pdfplumber)', projects: ['gc-assist'] },
      { name: 'yt-dlp & FFmpeg', icon: 'ffmpeg', projects: ['jv-ytdlp'] },
      { name: 'Python GUI (PySimpleGUI)', projects: ['twitchchat-sim'] },
      { name: 'Git', icon: 'git', projects: ['askademic', 'gc-assist', 'jalgorithm', 'jv-ytdlp', 'twitchchat-sim', 'state-and-effect'] },
      { name: 'GitHub', icon: 'github', projects: ['askademic', 'gc-assist', 'jalgorithm', 'jv-ytdlp', 'twitchchat-sim', 'state-and-effect'] },
      { name: 'VS Code', icon: 'vscode', projects: ['askademic', 'gc-assist', 'jalgorithm', 'jv-ytdlp', 'twitchchat-sim', 'state-and-effect'] },
      { name: 'Vercel', icon: 'vercel', projects: ['askademic', 'gc-assist', 'jalgorithm', 'state-and-effect'] },
    ],
  },
];

export const troubleshooting = [
  { area: 'Hardware', items: ['PC builds & assembly', 'RAM / storage diagnosis', 'Thermal & power issues'] },
  { area: 'Software', items: ['OS errors & crashes', 'Driver conflicts', 'Windows / Linux fixes'] },
  { area: 'LLM / AI', items: ['Model load errors', 'VRAM & out-of-memory', 'GGUF compatibility'] },
  { area: 'Network', items: ['Wi-Fi / LAN drops', 'DNS & IP config', 'Local server & tunnels'] },
];
