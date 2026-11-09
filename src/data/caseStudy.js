// Askademic case study content.
// Structure follows the prof's required topics; exact order will be aligned
// with the case study slide deck once received.
// Facts marked (README) come from the CAE-G-CAS repository README / PROJECT_GUIDE.
// Anything with `todo` must be written by the owner — the page renders it as a visible TODO block.

export const caseStudy = {
  slug: 'askademic',
  title: 'Askademic',
  tagline: 'Knowing when your instructor is actually available, in real time.',
  formerNames: 'G-CAS → FACS → Askademic',
  meta: [
    { label: 'Type', value: 'Software engineering project (team)' },
    { label: 'Timeline', value: 'Apr – Oct 2026' },
    { label: 'Team', value: 'June Vic M. Abello, Erica M., Erica C.' },
    { label: 'Platform', value: 'Web app · PWA (mobile + desktop)' },
  ],
  stack: [
    { name: 'React + Vite', role: 'Frontend framework and build tool' },
    { name: 'Supabase (PostgreSQL)', role: 'Database, row-level security, storage' },
    { name: 'Supabase Auth', role: 'One login for students, faculty and admins' },
    { name: 'Supabase Realtime', role: 'Live sync of availability and requests' },
    { name: 'vite-plugin-pwa', role: 'Add to Home Screen on iOS/Android' },
    { name: 'Vercel', role: 'Hosting' },
  ],
  links: {
    live: 'https://cae-g-cas.vercel.app',
    source: 'https://github.com/EcomineAI/CAE-G-CAS',
  },

  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body: [
        'Askademic is a real-time consultation system for the College of Computer Studies at Gordon College. It records and displays faculty consultation availability so students can see who is free, book a slot, and get notified when it is approved. (README)',
      ],
    },
    {
      id: 'problem',
      title: 'Problem',
      body: [
        'Consultation between students and instructors is critical, but actual availability often differs from the announced schedule. Students wait for long periods or travel to campus for nothing. (README)',
      ],
      goals: [
        'Improve the faculty consultation process for the CCS department.',
        'Give students a reliable, real-time view of faculty availability.',
        'Reduce time wasted due to uncertainty.',
      ],
    },
    {
      id: 'users',
      title: 'Target users',
      users: [
        { name: 'Students', need: 'Know who is available now, book a slot, track request status.' },
        { name: 'Faculty', need: 'Publish consultation hours, set live status, approve or decline requests quickly.' },
        { name: 'Admin', need: 'Manage accounts and switch user roles.' },
      ],
      todo: 'Add how you learned about these users (interviews, surveys, observation) and any personas from the slide deck.',
    },
    {
      id: 'role',
      title: 'My role & contributions',
      todo: 'State your role on the team and list exactly what YOU built or designed vs. teammates (required by the prof).',
    },
    {
      id: 'process',
      title: 'Process',
      steps: [
        { date: 'Apr 21', title: 'Student dashboard', text: 'Pill navigation, CSS-variable dark mode, status badge system.' },
        { date: 'Apr 25', title: 'Faculty dashboard', text: 'Mirrored the student design system; schedule modals; filter chips with live counts.' },
        { date: 'Apr 27', title: 'Supabase integration', text: 'Real database, realtime subscriptions, optimistic updates with rollback, skeleton loading, toasts.' },
        { date: 'May 4', title: 'Mobile UX', text: 'Card layouts on mobile, history management, confirmation modals for destructive actions.' },
        { date: 'May 8–9', title: 'Scheduling & accessibility', text: 'Calendar view, notification center, reduced-motion and dyslexia-friendly font settings, PWA.' },
        { date: 'Oct 7', title: 'Unified login & rebrand', text: 'One login for all roles, admin role toggle, scroll-gated terms, logout confirmation.' },
        { date: 'Oct 13', title: 'Mobile polish', text: 'Tighter stat cards, dark mobile drawer, synced avatar colors. Renamed to Askademic.' },
      ],
      todo: 'Describe the team workflow (planning, task split, tools, testing) from the slide deck.',
    },
    {
      id: 'designs',
      title: 'Designs',
      highlights: [
        'Frosted-glass login with a role hint chip ("Student account" / "Faculty account") as you type.',
        'Friendly error messages instead of raw database errors.',
        'Collapsible hover sidebar that becomes a bottom tab bar on phones.',
        'Skeleton loading and minimum display time to avoid flicker.',
        'Accessibility settings: reduced motion, dyslexia-friendly font, text size.',
      ],
      todo: 'Add wireframes, mockups or Figma screenshots with captions.',
    },
    {
      id: 'result',
      title: 'Final result',
      features: [
        'Live faculty directory with Available / Busy / Unavailable status',
        'Booking flow: browse → pick slot → submit',
        'Faculty schedule manager with overlap detection and capacity limits',
        'Approve / decline with reasons and real-time notifications',
        'Monthly calendar view for faculty',
        'Installable as a phone app (PWA)',
      ],
      todo: 'Add final screenshots and, if possible, a short demo video or GIF.',
    },
    {
      id: 'lessons',
      title: 'Lessons learned',
      todo: 'Write 2–4 lessons in your own words: what worked, what you would change, what you learned about teamwork and UX.',
    },
  ],
};
