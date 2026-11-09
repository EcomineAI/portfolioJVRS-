# Design & Tech Decisions

Why the portfolio is built the way it is. Each decision names the **UI/UX principle** it serves (from the course: clear navigation, readable content, consistent design, usability, accessibility) so I can explain and defend it.

> TODO(owner): read every entry, change anything you don't agree with, and rewrite the "why" in your own words. You must be able to explain these in class.

| # | Decision | Principle | Why |
|---|---|---|---|
| 1 | Nav labels are **Home / About / Projects / Case Study / Contact** | Clear navigation | Matches the prof's suggested structure and what visitors expect. Creative names (Code / Create / Learn) only appear *inside* Projects as groups, never as top-level menu items. |
| 2 | **Case study is one click from every page** (nav item) and the first, biggest card on Home and Projects | Clear navigation, visual hierarchy | The software engineering project is the most important item for graders, so it gets the strongest position. |
| 3 | **Multi-page site** (React Router) instead of one long scroll | Clear navigation, usability | Each required section has its own URL that can be linked, bookmarked and shared. Back button works as expected. |
| 4 | **Pixel-art visual style** (Press Start 2P + VT323, 0 radius, 4px borders, hard shadows) | Consistent design | A distinctive identity that fits a developer who builds AI tools and games-inspired UIs. One token file (`src/styles/tokens.css`) drives every color, border and shadow, so every page looks like part of the same system. |
| 5 | **Readable font for long text** (Space Grotesk); pixel fonts only for headings, labels and short UI text, Press Start 2P never below 16px | Readable content | Pixel fonts are hard to read in paragraphs. The trade-off keeps the style without hurting readability. Prose is capped at ~68 characters per line. |
| 6 | **Light and dark themes**, follows the system setting, remembered after toggling | Usability, accessibility | Respects user preference; no flash of the wrong theme on load. |
| 7 | **Color contrast ≥ 4.5:1** for all text in both themes (muted text and button colors were darkened from the reference) | Accessibility | WCAG AA. The reference site's light-blue muted text was too faint on white. |
| 8 | **Visible focus ring, skip-to-content link, semantic landmarks, one `<h1>` per page** | Accessibility | Keyboard and screen-reader users can navigate as easily as mouse users. |
| 9 | **Tap targets ≥ 44px**, mobile menu with large links, layouts tested at 360 / 768 / 1280px | Usability (mobile) | Prof requires mobile + desktop. No horizontal page scroll on phones. |
| 10 | **Spray paint is opt-in and never blocks the page**: only starts after holding on an empty spot, ignores links/buttons/inputs, can be switched off, touch requires turning on spray mode | Usability | A fun feature must not break clicking, selecting text or scrolling. |
| 11 | **Pixel buddies live only in the hero**, are real buttons with labels, and stop moving with "reduce motion" | Accessibility, usability | Delight without covering content; keyboard and screen-reader friendly. |
| 12 | **`prefers-reduced-motion` respected everywhere** (no physics, no wandering, no typewriter) | Accessibility | Motion can cause discomfort for some users. |
| 13 | **Skills shown as "LVL = number of my projects that use it"** instead of made-up percentages | Honest, readable content | Every level can be checked against real projects; easy to defend. |
| 14 | **GitHub activity widget** with 2D grid and 3D skyline, plus a text summary and table | Readable content, accessibility | Shows real, recent work. The canvas is decorative; the same data is available as text. |
| 15 | **Team projects always show "My role" and "My contributions"** | Honest content (prof requirement R3) | Makes clear what I did vs. teammates. |
| 16 | **Contact = email with Copy + Open Gmail, GitHub, OnlineJobs.ph, résumé**; no form | Usability | Works without a backend, nothing can silently fail; the "Say hi" block ends every page so contact is never more than a scroll away. |
| 17 | **Vite + React + plain CSS**, no UI framework | Performance, maintainability | Small bundle, fast load, and I understand every line of styling. |
| 18 | **Hosted on Vercel**, SPA rewrite so deep links work | Usability | Direct links like `/case-study` load correctly. Custom domain planned (`junevicabello.com`). |
| 20 | **Dot-matrix hero**: my name and portrait are drawn as pixels that move away from the cursor; the real name is in the `<h1>` as screen-reader text and the canvases are decorative | Consistent design, accessibility | Memorable first impression that matches the pixel theme, without hiding content from assistive tech. Photo is cropped and masked so only my face/shoulders are used. |
| 21 | **Animated pixel-gradient background** at very low opacity, slow stepped animation, fades toward the bottom of the screen, stops with "reduce motion" | Readable content, accessibility | Adds life without competing with text. |
| 22 | **Text never sits directly on the busy background**: lists are boxed cards, headings/intros/paragraphs get a solid backing | Readable content | Fixes low readability of small text over the grid and animated pixels. |
| 23 | **Wider layout (max 1440px)** | Usability on large screens | Uses the left/right space on desktop; long text still capped at ~68 characters per line. |
| 19 | **AI tools used for assistance** (planning, scaffolding, code); all text and design reviewed and personalized by me | Course rule R6 | TODO(owner): describe which parts you changed and why. |
