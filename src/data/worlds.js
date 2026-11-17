// The three groups of work. Colors come from CSS: [data-world="<id>"] sets --dot.
export const worlds = [
  {
    id: 'code',
    num: '01',
    label: 'Code',
    title: 'Things I build',
    intro: 'Web apps, AI assistants and tools: from a real-time campus appointment system to local LLM chatbots and a desktop downloader.',
  },
  {
    id: 'create',
    num: '02',
    label: 'Create',
    title: 'Things I make',
    intro: 'Prompt engineering and UI graphics: the creative side that shapes how my projects look and feel.',
  },
  {
    id: 'learn',
    num: '03',
    label: 'Learn',
    title: 'Things I am learning',
    intro: 'School, self-study and experiments: where the skills behind the projects come from.',
  },
];

export const worldById = Object.fromEntries(worlds.map(w => [w.id, w]));
