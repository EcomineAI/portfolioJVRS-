// Askademic case study content — synced with the 19-slide Askademic UX case study deck
// and real screenshots/assets extracted into /public/projects/askademic/.

export const caseStudy = {
  slug: 'askademic',
  title: 'Askademic',
  tagline:
    'A web-based consultation system for college students to request appointment slots, instructors to record consultation outcomes, and academic leaders to review feedback.',
  formerNames: 'G-CAS → FACS → Askademic',
  cover: '/projects/askademic/cover.jpg',
  coverAlt: 'Askademic: A Faculty Consultation Appointment System title slide — Ctrl Alt Elite (CAE)',
  meta: [
    { label: 'My role', value: 'Implementation lead · Design assistance' },
    { label: 'Timeline', value: 'February 2026 – November 2026' },
    { label: 'Team', value: 'Ctrl Alt Elite (CAE) — June Vic M. Abello, Erica Mae D. Camintoy, Ma. Erica P. Monton' },
    { label: 'Platform', value: 'Web app · PWA (mobile + desktop)' },
  ],
  kpis: [
    { value: '46', label: 'Consultation requests tracked' },
    { value: '8', label: 'Faculty members onboarded' },
    { value: '5', label: 'Student test participants' },
    { value: '14', label: 'Closed with recorded outcome' },
  ],
  stack: [
    { name: 'React + Vite', role: 'Frontend framework, role-based views, and build tool' },
    { name: 'Supabase (PostgreSQL)', role: 'Database, row-level security, consultation outcome records' },
    { name: 'Supabase Auth', role: 'Unified login with automatic faculty vs. student role detection' },
    { name: 'Supabase Realtime', role: 'Live sync of instructor availability and request updates' },
    { name: 'vite-plugin-pwa', role: 'Add to Home Screen on iOS, Android, and desktop' },
    { name: 'Vercel', role: 'Hosting and preview deployments' },
  ],
  links: {
    live: 'https://askademic1.vercel.app',
    source: 'https://github.com/EcomineAI/CAE-G-CAS',
  },

  sections: [
    {
      id: 'overview',
      title: 'Overview, problem & my role',
      body: [
        'Askademic is a web-based consultation system designed for college students to request appointment slots with faculty members. Instructors can approve requests and document consultation details, while program chairs and department deans can review student feedback and ratings.',
      ],
      problemCard: {
        title: 'The problem',
        text: 'Students can’t tell when an instructor is really available, instructors have no record of consultations that happened or didn’t, and the department has no evidence of how consultations go.',
      },
      goalCard: {
        title: 'The goal',
        text: 'Make booking clear, close every consultation with a recorded outcome, and give the department a fair basis for evaluating instructors.',
      },
    },
    {
      id: 'interface',
      title: 'System interface',
      body: [
        'System automatically flags the account (faculty vs. student) directly on the unified sign-in screen before routing each user into their dedicated workplace.',
      ],
      interfaceViews: {
        faculty: [
          {
            src: '/projects/askademic/faculty-login.jpg',
            alt: 'Askademic unified login screen automatically flagging a faculty account',
            caption: 'Faculty login — email is flagged with a purple FACULTY ACCOUNT chip.',
          },
          {
            src: '/projects/askademic/faculty-dashboard.jpg',
            alt: 'Askademic Faculty Workplace dashboard showing status toggle, upcoming count, pending requests, and appointments',
            caption: 'Faculty Workplace — live status toggle, pending requests queue, and calendar shortcut.',
          },
        ],
        student: [
          {
            src: '/projects/askademic/student-login.jpg',
            alt: 'Askademic unified login screen automatically flagging a student account',
            caption: 'Student login — student ID email is flagged with a green STUDENT ACCOUNT chip.',
          },
          {
            src: '/projects/askademic/student-dashboard.jpg',
            alt: 'Askademic Student Workplace welcome guide showing quick steps and consultation policies',
            caption: 'Student Workplace — 4-step Quick Guide plus booking, punctuality, and cancellation rules.',
          },
        ],
      },
    },
    {
      id: 'research',
      title: 'User research & pain points',
      body: [
        'The team had already assumed that the targeted problem was experienced by our target users. To prove this, we conducted surveys and interviews with Gordon College faculty members and students—turning our initial assumption into a confirmed hypothesis.',
      ],
      painPoints: [
        {
          title: 'Unclear availability for students',
          text: 'Students chase instructors through chat or outside the faculty room and often find no one there. Every screen shows real, bookable slots and clear request statuses, so students never have to guess.',
        },
        {
          title: 'Part-time instructors who can’t maintain a calendar',
          text: 'Part-timers have little time to update availability daily, leaving schedules outdated. Setting availability is quick and recurring by default, with department blocked dates applied automatically.',
        },
        {
          title: 'No record of whether a consultation happened',
          text: 'Without an outcome, a no-show looks identical to a held session. Every appointment ends in a recorded outcome (“Closed · Held” or “Closed · No-show”), leaving nothing ambiguous.',
        },
        {
          title: 'Leaders who are also instructors',
          text: 'Program chairs and the dean teach too, so one account must act as manager and instructor without conflicts of interest. A role switcher separates the two views, routing ratings of a chair or dean upward.',
        },
      ],
    },
    {
      id: 'personas',
      title: 'User personas',
      personas: [
        {
          name: 'Nilou',
          role: 'Graduating Student',
          age: '23',
          education: 'College',
          hometown: 'Olongapo City',
          photo: '/projects/askademic/persona-nilou.jpg',
          photoAlt: 'Persona photo representing Nilou, a graduating student holding a tablet with her backpack',
          quote: '“Deadline is coming, I badly need to get this done!”',
          problemStatement:
            'Nilou is a graduating student who needs her thesis consulted with her adviser before next week’s final defense.',
          goal: 'Have her project consulted with her respective instructor without wasted trips.',
          frustration: 'Uncertain whether her adviser is actually available, leading to hours wasted waiting.',
          bio: 'With her final defense approaching next week, Nilou faces intense pressure to finalize her thesis manuscript, while uncertain campus availability leads to wasted time waiting outside the faculty room.',
        },
        {
          name: 'Albedo Santos',
          role: 'Full-Time College Instructor',
          age: '43',
          education: 'College',
          hometown: 'Bataan',
          photo: '/projects/askademic/persona-albedo.jpg',
          photoAlt: 'Persona photo representing Albedo Santos, a college instructor working at a desk with a laptop and calendar',
          quote: '“Ad-hoc walk-ins disrupt classes, and sudden schedule changes are hard to announce.”',
          problemStatement:
            'Albedo is a full-time college instructor handling multiple classes who needs an organized way to support students.',
          goal: 'Provide prompt academic mentorship while tracking requests and schedule updates clearly.',
          frustration: 'Unscheduled walk-ins interrupt workflow and scattered chat requests create disorganized hours.',
          bio: 'Handling multiple classes and administrative tasks, Sir Albedo strives to give students timely mentorship, but ad-hoc walk-ins disrupt his daily flow and leave consultation hours disorganized.',
        },
      ],
    },
    {
      id: 'journeys',
      title: 'User journey maps',
      body: [
        'We mapped one journey for each side of the booking—from a student trying to book guidance to an instructor running sessions and recording outcomes.',
      ],
      journeys: [
        {
          id: 'student',
          label: 'Student: get a consultation',
          person: 'Mika, a student who needs a consultation',
          goal: 'Get an appointment and feedback on her project',
          image: '/projects/askademic/journey-student.png',
          imageAlt: 'Student user journey map for Mika across 5 steps from finding an instructor to rating the consultation',
          imageCaption: 'Student journey map — 5 steps showing emotion curve and feature opportunities.',
          steps: [
            { title: '1. Find an instructor & open hours', mood: 'Confused', tone: 'neg', opp: 'Show fixed schedule and today’s live status side by side.' },
            { title: '2. Request a slot with a purpose', mood: 'Nervous', tone: 'mid', opp: 'Show seats left and ask for a short purpose up front.' },
            { title: '3. Wait for approval', mood: 'Anxious', tone: 'neg', opp: 'Notify on every decision and auto-expire stale requests so seats free up.' },
            { title: '4. Attend the consultation', mood: 'Reassured', tone: 'pos', opp: 'Remind before the slot and show if the instructor is running late.' },
            { title: '5. Rate the consultation', mood: 'Heard', tone: 'pos', opp: 'Familiar paper-style feedback form; student names are never shown to instructors.' },
          ],
        },
        {
          id: 'instructor',
          label: 'Instructor: run a consultation',
          person: 'Mr. Arnie, an instructor who runs consultations',
          goal: 'Help students without losing track of who came',
          image: '/projects/askademic/journey-instructor.png',
          imageAlt: 'Instructor user journey map for Mr. Arnie across 6 steps from setting weekly hours to viewing ratings',
          imageCaption: 'Instructor journey map — 6 steps showing emotion curve and feature opportunities.',
          steps: [
            { title: '1. Set weekly hours', mood: 'Organized', tone: 'pos', opp: 'Choose own slot length and seats per slot.' },
            { title: '2. Review requests', mood: 'Pressed', tone: 'neg', opp: 'Pending list shows seats held and student purpose up front.' },
            { title: '3. Approve or decline', mood: 'In control', tone: 'pos', opp: 'Approve up to seat capacity; excess requests decline automatically.' },
            { title: '4. Hold the consultation', mood: 'Focused', tone: 'pos', opp: 'Live status switches to Busy, then returns automatically to Available.' },
            { title: '5. Record the outcome', mood: 'Relieved', tone: 'pos', opp: 'One short close form: held or no-show, resolved, follow-up. No-shows free the slot.' },
            { title: '6. See ratings & remarks', mood: 'Curious', tone: 'mid', opp: 'Scores per criterion; comments appear only after enough responses.' },
          ],
        },
      ],
    },
    {
      id: 'usability',
      title: 'Usability study & build process',
      body: [
        'We didn’t run artificial lab sessions. Our usability studies were two real review rounds by the people who judge and use the system: the final defense panel on May 8, 2026, and a follow-up review from the faculty representative.',
      ],
      round1: [
        {
          title: 'Several students can want the same last slot',
          text: 'Students can now request it concurrently, and once the instructor approves one, the competing requests are cancelled automatically.',
        },
        {
          title: 'A no-show had no way to end a record',
          text: 'Instructors can mark “No-show,” and “Completed” became “Closed” so the final state matches the remark chosen.',
        },
        {
          title: 'The organizational hierarchy wasn’t clear',
          text: 'Program chairs were view-only and the department dean’s role was missing, so we built dedicated interfaces for both.',
        },
      ],
      round2: [
        {
          title: 'Availability should be trackable per day',
          text: 'Reworked the calendar into a familiar month view with daily appointment counts and long names shortened with an ellipsis.',
        },
        {
          title: 'A no-show needs a required note and clearer features',
          text: 'Tightened the no-show closing flow with a mandatory note so the consultation outcome is unmistakable to everyone.',
        },
        {
          title: 'Records need limits and a way out',
          text: 'Program chairs and the department dean now get dedicated Reports with history pagination limits and clean export controls.',
        },
      ],
      steps: [
        { date: 'Apr 21', title: 'Student dashboard', text: 'Pill navigation, CSS-variable dark mode, status badge system.' },
        { date: 'Apr 25', title: 'Faculty dashboard', text: 'Mirrored student design system, schedule modals, filter chips with live counts.' },
        { date: 'Apr 27', title: 'Supabase integration', text: 'PostgreSQL schema, Realtime subscriptions, optimistic updates with rollback, skeleton loading.' },
        { date: 'May 4', title: 'Mobile UX', text: 'Card layouts on mobile, history management, confirmation modals for destructive actions.' },
        { date: 'May 8–9', title: 'Defense panel, calendar & accessibility', text: 'Completed Round 1 panel review; added month calendar, notification center, dyslexia-friendly font, reduced motion, and PWA.' },
        { date: 'Oct 7 – Nov 2026', title: 'Unified login, hierarchy & Askademic rebrand', text: 'Auto-flagged login across all roles, chair/dean reporting hierarchy, outcome closing flow, and Askademic rebrand.' },
      ],
    },
    {
      id: 'accessibility',
      title: 'Refining the design & accessibility',
      body: [
        'After validating core workflows with the defense panel and faculty representative, we focused on clarity for color-blind users, form ergonomics, and comfortable mobile navigation.',
      ],
      accessibilityCards: [
        {
          title: 'Not color alone',
          text: 'Status badges and calendar legends carry explicit words as well as color—Pending, Approved, Closed, Declined, Follow-up—so color-blind users can always tell them apart.',
        },
        {
          title: 'Forms that guide',
          text: 'Every field has a visible label and example, the active field gets a crisp outline, and passwords can be revealed so typos are easy to catch.',
        },
        {
          title: 'Readable and reachable',
          text: 'Dark navy text on light surfaces, generous spacing, large tap targets, and paired icon-plus-text navigation on phones.',
        },
      ],
      highlights: [
        'Frosted-glass login with real-time account type detection (“Student account” / “Faculty account”).',
        'Friendly validation and database error messages instead of raw SQL/auth errors.',
        'Collapsible hover sidebar that transforms into an accessible bottom tab bar on mobile screens.',
        'Skeleton loading states with minimum display timing to eliminate UI flicker.',
        'User-selectable accessibility settings: reduced motion, dyslexia-friendly font, and text size.',
      ],
    },
    {
      id: 'takeaways',
      title: 'Takeaways & next steps',
      impact:
        'Askademic replaces chasing instructors with bookable slots and a recorded outcome for every consultation. Its dashboard already tracks 46 consultation requests across 8 faculty and 5 students, with 14 closed with a recorded outcome.',
      learned:
        'Understand how an organization is structured before designing for it. We built an admin because it was a familiar pattern, but the defense panel’s question exposed that the real structure was a chain of review: instructor, program chair, then department dean.',
      nextSteps: [
        {
          title: 'Integrate Google Calendar',
          text: 'Students and instructors already plan their days in Google Calendar. Syncing approved consultations there saves part-time instructors from maintaining a second calendar.',
        },
        {
          title: 'Deploy across the whole campus',
          text: 'Every department shares the same consultation tracking problem. With role hierarchy, program views, and school-wide closed dates already built in, Askademic can scale beyond the CCS department.',
        },
      ],
    },
  ],
};
