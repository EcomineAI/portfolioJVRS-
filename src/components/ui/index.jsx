// Shared UI primitives. Styling lives in src/styles/primitives.css.
// Pages and feature modules compose these; do not fork their styles per page.
import { createElement, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const cx = (...c) => c.filter(Boolean).join(' ');
const isExternal = href => /^https?:\/\//.test(href || '');

/**
 * Button that renders the right element:
 *  - `to`   → react-router <Link>
 *  - `href` → <a> (external links open in a new tab)
 *  - else   → <button>
 */
export function PixelButton({ to, href, variant = 'primary', size, icon, loading, className, children, ...rest }) {
  const classes = cx('pixel-btn', `pixel-btn--${variant}`, size && `pixel-btn--${size}`, icon && 'pixel-btn--icon', loading && 'is-loading', className);
  if (loading) rest = { ...rest, 'aria-busy': true, disabled: true };
  if (to) return <Link to={to} className={classes} {...rest}>{children}</Link>;
  if (href) {
    const ext = isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return <a href={href} className={classes} {...ext} {...rest}>{children}</a>;
  }
  return <button type="button" className={classes} {...rest}>{children}</button>;
}

export function PixelCard({ as = 'div', pad = false, interactive = false, className, children, ...rest }) {
  return createElement(
    as,
    { className: cx('pixel-card', pad && 'pixel-card--pad', interactive && 'pixel-card--interactive', className), ...rest },
    children,
  );
}

export function TagList({ tags = [], label = 'Technologies', className }) {
  if (!tags.length) return null;
  return (
    <ul className={cx('tag-list', className)} aria-label={label}>
      {tags.map(t => <li key={t} className="tag">{t}</li>)}
    </ul>
  );
}

export function WorldDot({ world }) {
  return <span className="world-dot" data-world={world} aria-hidden="true" />;
}

/** Small uppercase label: "● 01 · CODE" */
export function Eyebrow({ world, num, children, className }) {
  return (
    <p className={cx('eyebrow', className)} data-world={world}>
      {world && <WorldDot world={world} />}
      {num && <span className="eyebrow__num">{num}</span>}
      {num && children && <span aria-hidden="true">·</span>}
      {children}
    </p>
  );
}

/** Section heading block. `as` lets pages keep a correct heading outline (h1 on page tops, h2 in sections). */
export function SectionHeading({ as = 'h2', id, world, num, label, title, intro, className }) {
  return (
    <header className={cx('section-heading', className)}>
      {(label || num) && <Eyebrow world={world} num={num}>{label}</Eyebrow>}
      {createElement(as, { id, className: 'section-heading__title' }, title)}
      {intro && <p className="section-heading__intro prose">{intro}</p>}
    </header>
  );
}

/** Kenney Pixel UI arrow (CC0). Drawn as a mask so it takes the text colour and reads on any button. */
export function PixelArrow() {
  return <span className="pixel-arrow" aria-hidden="true" />;
}

/** One row in a list of work: title · one-liner · meta · arrow. */
export function ItemRow({ to, href, title, description, meta = [], role, active = false, onActivate }) {
  const inner = (
    <>
      <span className="item-row__title">{title}</span>
      {description && <span className="item-row__desc">{description}</span>}
      {(meta.length > 0 || role) && (
        <span className="item-row__meta">
          {meta.filter(Boolean).map((m, i) => <span key={i}>{m}</span>)}
          {role && <span className="item-row__role">{role}</span>}
        </span>
      )}
      <span className="item-row__arrow"><PixelArrow /></span>
    </>
  );
  const hover = onActivate ? { onMouseEnter: onActivate, onFocus: onActivate } : {};
  return (
    <li className={cx('item-row', active && 'is-active')}>
      {to ? (
        <Link to={to} className="item-row__link" {...hover}>{inner}</Link>
      ) : (
        <a href={href} className="item-row__link" {...hover} {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{inner}</a>
      )}
    </li>
  );
}

/** Numbered thumbnail card used in the hero and "Now" slots. */
export function FeaturedCard({ to, world, num, label, title, image, imageAlt = '', placeholder, className }) {
  return (
    <Link to={to} className={cx('featured-card pixel-card pixel-card--interactive', className)} data-spray-surface="true">
      <div className="featured-card__media">
        {image ? <img src={image} alt={imageAlt} loading="lazy" /> : placeholder}
      </div>
      <div className="featured-card__body">
        <Eyebrow world={world} num={num}>{label}</Eyebrow>
        <h3 className="featured-card__title">{title}</h3>
      </div>
    </Link>
  );
}

export function ViewAll({ to, label = 'View all', count }) {
  return (
    <Link to={to} className="view-all">
      {label}
      {count != null && <span className="view-all__count">({count})</span>}
      <PixelArrow />
    </Link>
  );
}

/** Visible placeholder for content the owner still has to write. */
export function Todo({ children }) {
  return <div className="todo" role="note">{children}</div>;
}

/** Fades children in (choppy, pixel style) when scrolled into view. */
export function Reveal({ as = 'div', className, children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return createElement(as, { ref, className: cx('reveal', visible && 'is-visible', className), ...rest }, children);
}
