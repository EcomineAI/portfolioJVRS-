// A world's list of work + a pixel laptop beside it that previews whichever row
// is hovered or focused (cover image on the screen, summary, tags, open button).
// Switching rows plays a pixel dissolve on the screen.
// On narrow screens the laptop is hidden and the rows stand alone.
import { useState } from 'react';
import { ItemRow, PixelButton, PixelArrow, TagList, Eyebrow } from '../ui/index.jsx';
import PixelSprite from '../../buddies/PixelSprite.jsx';
import { worldIcons } from '../../buddies/sprites.js';
import './WorldList.css';

export default function WorldList({ world, items, hrefFor, titleFor = p => p.title, roleFor = () => undefined }) {
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug);
  const index = Math.max(0, items.findIndex(p => p.slug === activeSlug));
  const active = items[index];

  return (
    <div className="world-list" data-world={world}>
      <ul className="item-list" data-world={world}>
        {items.map(p => (
          <ItemRow
            key={p.slug}
            to={hrefFor(p)}
            title={titleFor(p)}
            description={p.subtitle}
            meta={[p.type, p.date]}
            role={roleFor(p)}
            active={p.slug === active?.slug}
            onActivate={() => setActiveSlug(p.slug)}
          />
        ))}
      </ul>
      {active && <Laptop project={active} world={world} href={hrefFor(active)} index={index} total={items.length} />}
    </div>
  );
}

/* Pixel dissolve: a grid of tiles over the screen; each fades out on its own
   delay in a scrambled order, so the new picture appears pixel by pixel. */
const COLS = 12, ROWS = 8, STEP_MS = 5;
const TILES = Array.from({ length: COLS * ROWS }, (_, i) => ((i * 37 + 11) % (COLS * ROWS)) * STEP_MS);

const hostOf = url => { try { return new URL(url).host; } catch { return null; } };

function Laptop({ project: p, world, href, index, total }) {
  const [failedSlug, setFailedSlug] = useState(null);   // screenshot missing → show the placeholder
  const icon = worldIcons[world];
  const address = hostOf(p.links?.live) || `${p.slug}.local`;
  return (
    <aside className="lap" aria-label={`Preview: ${p.title}`} data-spray-surface="true">
      {/* lid */}
      <div className="lap__lid">
        <span className="lap__cam" aria-hidden="true" />
        {/* key = slug: switching rows remounts the screen and replays the dissolve */}
        <div className="lap__screen" key={p.slug}>
          <div className="lap__bar" aria-hidden="true">
            <span className="lap__dots"><i /><i /><i /></span>
            <span className="lap__url">{address}</span>
            <span className="lap__count">{index + 1}/{total}</span>
          </div>
          <div className="lap__view">
            {p.cover && failedSlug !== p.slug ? (
              <img src={p.cover} alt="" loading="lazy" onError={() => setFailedSlug(p.slug)} />
            ) : (
              <div className="lap__ph" aria-hidden="true">
                <PixelSprite grid={icon.grid} palette={icon.palette} scale={5} />
              </div>
            )}
            <span className="lap__badge">{p.status || p.date}</span>
            <span className="lap__dissolve" aria-hidden="true">
              {TILES.map((d, i) => <i key={i} style={{ animationDelay: `${d}ms` }} />)}
            </span>
          </div>
        </div>
      </div>

      {/* hinge + keyboard deck */}
      <div className="lap__hinge" aria-hidden="true" />
      <div className="lap__base" aria-hidden="true">
        <span className="lap__keys" />
        <span className="lap__pad" />
      </div>

      {/* the card under the laptop: details */}
      <div className="lap__card pixel-card">
        <div className="lap__body">
          <Eyebrow world={world}>{p.type}</Eyebrow>
          <h3 className="lap__title">{p.title}</h3>
          {p.summary && <p className="lap__summary">{p.summary}</p>}
          <TagList tags={p.tags?.slice(0, 5)} />
          <div className="lap__actions">
            <PixelButton to={href} size="sm">Open <PixelArrow /></PixelButton>
            {p.links?.live && (
              <PixelButton href={p.links.live} variant="outline" size="sm">
                Live <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
              </PixelButton>
            )}
          </div>
        </div>
        <div className="lap__cap">
          <span className="lap__cap-dot" /> PREVIEW · hover a row
        </div>
      </div>
    </aside>
  );
}
