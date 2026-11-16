// Who I am — single source of truth for name, links and short copy.
// TODO(owner): review and rewrite every sentence in your own voice before submission.

export const profile = {
  name: {
    first: 'June Vic',
    middle: 'M.',
    last: 'Abello',
    full: 'June Vic M. Abello',
    display: 'June Vic Abello',
  },
  initials: 'JVA',
  role: 'AI & Web Developer',
  roleParts: [
    { text: 'AI', world: 'code' },
    { text: ' / ' },
    { text: 'Web', world: 'create' },
    { text: ' Developer' },
  ],
  school: 'Gordon College',
  program: 'BS Computer Science',
  year: '3rd year',
  location: 'Olongapo City, Philippines',
  timezone: 'GMT+8',
  lead: 'I build web apps and AI tools that people actually use, from campus systems to local LLM assistants.',
  meta: ['3rd-year BSCS · Gordon College', 'React, Vite, Supabase', 'Python', 'LM Studio · local LLMs'],
  status: 'Open to internships, part-time and freelance work',
  email: 'junevicabello@gmail.com',
  resume: '/June Vic M. Abello — Resume.pdf',
  photo: '/jv.png',
  portrait: '/pfp-no-bg.png',   // the Home dot-matrix portrait (plain background, auto-masked)
  links: {
    github: 'https://github.com/EcomineAI',
    githubHandle: 'EcomineAI',
    onlinejobs: 'https://www.onlinejobs.ph/jobseekers/info/4809449',
  },
};

export const gmailCompose = `https://mail.google.com/mail/?view=cm&to=${profile.email}&su=${encodeURIComponent('Hello from your portfolio')}`;

export const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/case-study', label: 'Case Study' },
  { to: '/contact', label: 'Contact' },
];
