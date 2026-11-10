// Keeps the engine's collision rects in sync with the page (plan §5).
// Targets: page headings and cards inside <main>, anything marked [data-spray-surface]
// (solid boxes), plus horizontal lines: the top border of big sections (Say hi, the
// footer, the hero floor), which paint and noodles can catch on.
import { useEffect } from 'react';

export const TARGET_SELECTOR = 'main h1, main h2, main .pixel-card, [data-spray-surface]';
export const LINE_SELECTOR = '.say-hi, .site-footer, [data-buddy-platform], main hr';
const LINE_H = 4;

function measure() {
  const sx = window.scrollX;
  const sy = window.scrollY;
  const rects = [];
  const range = document.createRange();
  document.querySelectorAll(TARGET_SELECTOR).forEach(el => {
    let r;
    if (el.matches('h1, h2')) {
      // Headings are full-width blocks; use the tight box around the text instead.
      range.selectNodeContents(el);
      r = range.getBoundingClientRect();
      if (!r.width) r = el.getBoundingClientRect();
    } else {
      r = el.getBoundingClientRect();
    }
    if (r.width < 4 || r.height < 4) return;
    // `el` lets the engine follow each heading/card when the page reflows (resize)
    rects.push({ el, l: r.left + sx, t: r.top + sy, r: r.right + sx, b: r.bottom + sy });
  });
  // lines: just a thin strip along the element's top edge (the rest stays open)
  document.querySelectorAll(LINE_SELECTOR).forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width < 40) return;
    rects.push({ el, line: true, l: r.left + sx, t: r.top + sy, r: r.right + sx, b: r.top + sy + LINE_H });
  });
  const de = document.documentElement;
  return { rects, docW: de.scrollWidth, docH: Math.max(de.scrollHeight, document.body.scrollHeight) };
}

/** @param engineRef ref to a SprayEngine  @param pathname current route (re-measures on change) */
export function useSprayTargets(engineRef, pathname) {
  useEffect(() => {
    let frame = 0;
    let debounce = 0;
    let lastScroll = 0;
    let trailing = 0;

    const update = () => {
      frame = 0;
      const engine = engineRef.current;
      if (!engine) return;
      const { rects, docW, docH } = measure();
      engine.setTargets(rects, docW, docH);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const scheduleSoon = () => { clearTimeout(debounce); debounce = setTimeout(schedule, 150); };

    // Rects are in document coords, so scroll only matters for sticky/fixed
    // surfaces; throttle to a few times per second.
    const onScroll = () => {
      const now = performance.now();
      if (now - lastScroll > 250) { lastScroll = now; schedule(); }
      clearTimeout(trailing);
      trailing = setTimeout(schedule, 260);
    };

    schedule();
    window.addEventListener('resize', scheduleSoon);
    window.addEventListener('scroll', onScroll, { passive: true });

    const main = document.querySelector('main');
    const mo = main ? new MutationObserver(scheduleSoon) : null;
    mo?.observe(main, { childList: true, subtree: true, characterData: true });

    const ro = 'ResizeObserver' in window ? new ResizeObserver(scheduleSoon) : null;
    ro?.observe(document.body);

    document.fonts?.ready?.then(schedule).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(debounce);
      clearTimeout(trailing);
      window.removeEventListener('resize', scheduleSoon);
      window.removeEventListener('scroll', onScroll);
      mo?.disconnect();
      ro?.disconnect();
    };
  }, [engineRef, pathname]);
}
