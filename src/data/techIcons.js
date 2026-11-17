// Tech logos: Devicon (MIT) full-color logos, official icons for LM Studio and Hugging Face, and
// Simple Icons (CC0) where Devicon has none; see public/assets/tech/LICENSES.txt.
// Brand colors (hex) drive the tile's hover shadow; very dark brands fall back to the theme color.
export const TECH_COLOR = {
  javascript: '#F7DF1E', html5: '#E34F26', css: '#663399', postgresql: '#4169E1', python: '#3776AB',
  typescript: '#3178C6', react: '#61DAFB', vite: '#9135FF', reactrouter: '#CA4245', framer: '#0055FF',
  tailwindcss: '#06B6D4', vitest: '#00FF74', supabase: '#3FCF8E', nodedotjs: '#5FA04E', deno: '#000000',
  lmstudio: '#6E56F8', huggingface: '#FFD21E', ffmpeg: '#007808', git: '#F03C2E', github: '#181717',
  vercel: '#000000', pwa: '#5A0FC8', windows: '#0078D4', vscode: '#007ACC',
  figma: '#F24E1E', blender: '#EA7600', googlecolab: '#F9AB00', n8n: '#EA4B71', antigravity: '#4285F4',
  cloudflare: '#F38020', githubactions: '#2088FF', docker: '#2496ED', gitlab: '#FC6D26',
  claude: '#D97757', googlegemini: '#8E75B2', qwen: '#FF6A00',
  canva: '#00C4CC', capcut: '#111827', prisma3d: '#2563EB',
};

const luma = hex => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

/** Brand color for the hover shadow, or null for near-black brands (they use the theme shadow). */
export const brandColor = slug => {
  const hex = TECH_COLOR[slug];
  return hex && luma(hex) >= 0.18 ? hex : null;
};

/* Logos that are not SVG (official app icons only published as images). `?v=` busts stale browser caches after a logo is replaced. */
const LOGO_FILE = {
  lmstudio: 'lmstudio.png',
  canva: 'canva.png?v=2',
  capcut: 'capcut.png?v=2',
  prisma3d: 'prisma3d.png?v=2',
};

/** Public path of a logo file. */
export const logoSrc = slug => `/assets/tech/${LOGO_FILE[slug] || `${slug}.svg`}`;
