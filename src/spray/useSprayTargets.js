// Keeps the engine's collision rects in sync with the page (plan §5).
// Targets: page headings and cards inside <main>, anything marked [data-spray-surface]
// (solid boxes), plus horizontal lines: the top border of big sections (Say hi, the
// footer, the hero floor), which paint and noodles can catch on.
import { useEffect } from 'react';

export const TARGET_SELECTOR = 'main h1, main h2, main .pixel-card, [data-spray-surface]';
export const LINE_SELECTOR = '.say-hi, .site-footer, [data-buddy-platform], main hr';
const LINE_H = 4;

function measureHeading(el, range) {
  const elRect = el.getBoundingClientRect();
  if (elRect.width < 4 || elRect.height < 4) return null;

  const df = el.querySelector('.dotfield');
  if (df) {
    const dr = (df.querySelector('.dotfield__canvas') || df).getBoundingClientRect();
    const raw = df.dataset.dotBounds;
    if (raw) {
      const parts = raw.split(',').map(Number);
      if (parts.length === 4 && parts.every(Number.isFinite)) {
        const [minX, minY, maxX, maxY] = parts;
        if (maxX > minX && maxY > minY) {
          return {
            left: dr.left + minX,
            top: dr.top + minY,
            right: dr.left + maxX,
            bottom: dr.top + maxY,
            width: maxX - minX,
            height: maxY - minY,
          };
        }
      }
    }
    return dr;
  }

  // Headings are full-width blocks; walk visible text nodes and ignore sr-only spans.
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  let found = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.nodeValue || !node.nodeValue.trim()) continue;
    if (node.parentElement?.closest('.sr-only, .retro-type__sr')) continue;
    range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    if (r.left < left) left = r.left;
    if (r.top < top) top = r.top;
    if (r.right > right) right = r.right;
    if (r.bottom > bottom) bottom = r.bottom;
    found = true;
  }
  if (!found) return elRect;

  left = Math.max(left, elRect.left);
  right = Math.min(right, elRect.right);
  top = Math.max(top, elRect.top);
  bottom = Math.min(bottom, elRect.bottom);
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

function measure() {
  const sx = window.scrollX;
  const sy = window.scrollY;
  const rects = [];
  const range = document.createRange();
  document.querySelectorAll(TARGET_SELECTOR).forEach(el => {
    const r = el.matches('h1, h2') ? measureHeading(el, range) : el.getBoundingClientRect();
    if (!r || r.width < 4 || r.height < 4) return;
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
    // Short debounce: paint on a card that just moved or resized shouldn't hang in the air before it follows.
    const scheduleSoon = () => { clearTimeout(debounce); debounce = setTimeout(schedule, 40); };
    // Resize / browser zoom: cards move in the same frame, so re-measure right now (not after a delay),
    // otherwise paint hangs at the old positions for a split second. A trailing pass catches late layout.
    const updateNow = () => {
      cancelAnimationFrame(frame);
      update();
      clearTimeout(debounce);
      debounce = setTimeout(schedule, 120);
    };

    // Rects are in document coords, so scroll only matters for sticky/fixed
    // surfaces (the sticky laptop preview); re-measure often enough that paint on them keeps up.
    const onScroll = () => {
      const now = performance.now();
      if (now - lastScroll > 60) { lastScroll = now; schedule(); }
      clearTimeout(trailing);
      trailing = setTimeout(schedule, 90);
    };

    schedule();
    window.addEventListener('resize', updateNow);
    window.visualViewport?.addEventListener('resize', updateNow);
    window.addEventListener('scroll', onScroll, { passive: true });

    const main = document.querySelector('main');
    const mo = main ? new MutationObserver(schedule) : null;
    mo?.observe(main, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-dot-bounds'],
    });

    const ro = 'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
    ro?.observe(document.body);

    document.fonts?.ready?.then(schedule).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(debounce);
      clearTimeout(trailing);
      window.removeEventListener('resize', updateNow);
      window.visualViewport?.removeEventListener('resize', updateNow);
      window.removeEventListener('scroll', onScroll);
      mo?.disconnect();
      ro?.disconnect();
    };
  }, [engineRef, pathname]);
}
