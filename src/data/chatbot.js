// Scripted keyword replies for JV-BOT, the RPG-style chat helper.
// Bot replies are TRUSTED static HTML written here (internal links only);
// user input is always rendered as plain text by the widget.
// TODO(owner): reread every reply and adjust it to your own voice.

export const BOT_NAME = 'JV-BOT';

export const WELCOME =
  "Hi, traveler! I'm JV-BOT. Ask me about June Vic's projects, skills, the Askademic case study, or how to get in touch.";
export const CLEARED = 'Log cleared. What would you like to know about June Vic?';

export const quickChips = [
  { label: 'Projects', msg: 'What projects have you built?' },
  { label: 'Case study', msg: 'Tell me about the Askademic case study' },
  { label: 'Skills', msg: 'What skills do you have?' },
  { label: 'AI stack', msg: 'What AI tools do you use?' },
  { label: 'Hire?', msg: 'Are you available for hire?' },
  { label: 'Contact', msg: 'How can I contact you?' },
];

const responses = {
  greet: [
    "Hey there! Ask me about June Vic's <strong>projects</strong>, <strong>skills</strong> or how to <strong>contact</strong> him.",
    "Hi! I can talk about the Askademic case study, his other builds, his stack, or hiring. What's your quest?",
    'Hello! Pick a topic from the chips below or type a question.',
  ],
  projects: `June Vic has shipped <strong>5 coding projects</strong> so far:<br><br>
    ★ <strong>Askademic</strong>: faculty appointment &amp; consultation system for Gordon College CCS (team of 3, featured SE case study)<br>
    ▸ <strong>GC Assist</strong>: AI campus assistant running on a local LLM via LM Studio<br>
    ▸ <strong>JALgorithm</strong>: ML chatbot for salon booking &amp; reminders (thesis, in progress)<br>
    ▸ <strong>jv-ytdlp</strong>: Electron desktop video downloader<br>
    ▸ <strong>TwitchChat Sim</strong>: AI Twitch chat simulator in Python<br><br>
    See them all on the <a href="/projects">Projects page</a>.`,
  caseStudy: `<strong>Askademic</strong> (formerly G-CAS / FACS) is the featured software engineering project.<br><br>
    Students see which faculty are available in real time, book consultation slots and get notified when requests are approved.
    Built by a team of 3 with React, Vite and Supabase (Postgres, Auth, Realtime, Storage, Row Level Security), plus a PWA build.<br><br>
    Read the full story, including June Vic's role, on the <a href="/case-study">Case Study page</a>.`,
  gcassist: `<strong>GC Assist</strong> is a solo AI campus assistant for Gordon College. A Python crawler (BeautifulSoup) builds a knowledge base, relevance scoring picks the best chunks to fit the context window, and a local model in <strong>LM Studio</strong> answers. Frontend: React 19 + Vite, Supabase auth.<br><br>
    Details: <a href="/projects/gc-assist">GC Assist</a>.`,
  jalgorithm: `<strong>JALgorithm</strong> is a thesis project (team of 3): a chatbot that lets salon clients book appointments in plain language, with an admin dashboard and reminders. Stack: React, Tailwind v4, Supabase (Edge Functions), LM Studio.<br><br>
    Details: <a href="/projects/jalgorithm">JALgorithm</a>.`,
  ytdlp: `<strong>jv-ytdlp</strong> is a Windows desktop downloader: Electron + a Node.js server driving yt-dlp and ffmpeg. It detects real available qualities, shows progress/ETA, has an MP3 mode and a one-click installer.<br><br>
    Details: <a href="/projects/jv-ytdlp">jv-ytdlp</a>.`,
  twitch: `<strong>TwitchChat Sim</strong> fills an empty stream chat with AI viewers (hype, salty or chill), emotes and raid events. Python app running <strong>Gemma 3</strong> through LM Studio.<br><br>
    Details: <a href="/projects/twitchchat-sim">TwitchChat Sim</a>.`,
  ai: `June Vic's AI toolkit:<br><br>
    ▸ <strong>LM Studio</strong> for local inference (Gemma 3, Qwen and other GGUF models)<br>
    ▸ Prompt &amp; context engineering, token budgeting<br>
    ▸ Retrieval / relevance scoring over scraped knowledge bases<br>
    ▸ In-browser ML with transformers.js<br><br>
    He uses local models where privacy and cost matter, and cloud services like Supabase and Vercel where they fit the project.`,
  skills: `Skills, counted by the projects that use them:<br><br>
    ▸ <strong>Frontend</strong>: React, Vite, React Router, CSS theming, framer-motion, Tailwind, PWA<br>
    ▸ <strong>Backend / data</strong>: Supabase (Postgres, Auth, Realtime, Storage, RLS, Edge Functions)<br>
    ▸ <strong>AI</strong>: LM Studio, local LLMs, prompt &amp; context engineering<br>
    ▸ <strong>Python</strong>: web scraping, automation, CLI/GUI apps<br>
    ▸ <strong>Tooling</strong>: Electron, Node.js, Git/GitHub, Vercel, ESLint<br><br>
    More on the <a href="/about">About page</a>.`,
  hire: `Yes! June Vic is <strong>open to internships, part-time and freelance work</strong>:<br><br>
    ▸ React + Supabase web apps<br>
    ▸ AI assistants and chatbots (local or hosted models)<br>
    ▸ Small desktop tools and automation scripts<br><br>
    Say hi on the <a href="/contact">Contact page</a>.`,
  contact: `The quickest way is the <a href="/contact">Contact page</a>.<br><br>
    ▸ <strong>Email</strong>: junevicabello@gmail.com<br>
    ▸ <strong>GitHub</strong>: github.com/EcomineAI<br>
    ▸ <strong>OnlineJobs.ph</strong>: profile linked on the Contact page`,
  about: `<strong>June Vic M. Abello</strong> is a 2nd-year BS Computer Science student at <strong>Gordon College</strong>, Olongapo City, Philippines.<br><br>
    He builds web apps and AI tools that people actually use, from campus systems to local LLM assistants. More on the <a href="/about">About page</a>.`,
  school: `Gordon College is in <strong>Olongapo City, Philippines</strong>. June Vic is in his <strong>2nd year of BSCS</strong> there.<br><br>
    Two of his projects were built for the college: <a href="/case-study">Askademic</a> and <a href="/projects/gc-assist">GC Assist</a>.`,
  troubleshoot: `June Vic also does hands-on <strong>troubleshooting</strong>: PC hardware, Windows/Linux and driver issues, LLM load and VRAM errors, and home network problems. Most of it comes from running local AI on his own machines.`,
  default: [
    "Hmm, that's not in my spellbook. Try <strong>projects</strong>, <strong>case study</strong>, <strong>skills</strong>, <strong>AI</strong>, <strong>hire</strong> or <strong>contact</strong>.",
    "I'm a simple scripted bot, so keywords work best: <em>Askademic</em>, <em>GC Assist</em>, <em>skills</em>, <em>contact</em>…",
    'Not sure about that one. The <a href="/projects">Projects</a> and <a href="/about">About</a> pages might have it!',
  ],
};

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// Order matters: specific project names first, then broad topics.
const rules = [
  [/^(hi|hey|hello|yo|sup|greetings|good (morning|afternoon|evening)|howdy|kumusta)\b/, () => pick(responses.greet)],
  [/askademic|facs|g-?cas|case.?study|se project|software engineering|consultation|appointment system/, () => responses.caseStudy],
  [/gc.?assist|campus assistant/, () => responses.gcassist],
  [/jalgorithm|salon|thesis/, () => responses.jalgorithm],
  [/yt-?dlp|downloader|electron|ffmpeg/, () => responses.ytdlp],
  [/twitch|stream/, () => responses.twitch],
  [/hire|hiring|freelance|available|availability|job|intern|collab|opportunit|rate|commission/, () => responses.hire],
  [/contact|email|e-mail|mail|reach|message|onlinejobs|github|socials?/, () => responses.contact],
  [/project|built|build|made|portfolio|repo|apps?\b|work/, () => responses.projects],
  [/\bai\b|llm|model|machine learning|\bml\b|lm.?studio|gguf|gemma|qwen|prompt|transformers/, () => responses.ai],
  [/skill|tech|stack|language|tool|know|react|vite|supabase|python|javascript|\bjs\b|css/, () => responses.skills],
  [/gordon|college|school|university|olongapo|bscs|student|study/, () => responses.school],
  [/troubleshoot|debug|hardware|pc build|vram|driver|crash|network|wifi/, () => responses.troubleshoot],
  [/about|who|june|vic|abello|yourself|background/, () => responses.about],
];

/** Returns trusted HTML for a user message. */
export function getResponse(msg) {
  const m = msg.toLowerCase().trim();
  for (const [re, reply] of rules) if (re.test(m)) return reply();
  return pick(responses.default);
}
