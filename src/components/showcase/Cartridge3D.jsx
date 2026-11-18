// True CSS 3D extruded pixel game cartridge: pointer-tracking tilt, click/keyboard 180° flip,
// ridged side grips, gold connector pins, portrait front label, and quick-facts back label.
import { useRef, useState } from 'react';
import './Cartridge3D.css';

export default function Cartridge3D({
  photo,
  name,
  displayName,
  role,
  year,
  facts = [],
}) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 4, ry: -6 });
  const stageRef = useRef(null);

  const handlePointerMove = e => {
    if (e.pointerType === 'touch') return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Math.round(-ny * 36 * 10) / 10,
      ry: Math.round(nx * 56 * 10) / 10,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 4, ry: -6 });
  };

  return (
    <div
      ref={stageRef}
      className="cartridge-stage"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="cartridge-idle">
        <button
          type="button"
          className="cartridge-btn"
          data-sfx-pack="mechanical"
          aria-pressed={flipped}
          aria-label={flipped ? 'Show front of developer cartridge' : 'Flip developer cartridge to see quick facts'}
          onClick={() => setFlipped(f => !f)}
        >
          <span
            className="cartridge-tilt"
            style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
          >
            <span className={`cartridge-flip${flipped ? ' is-flipped' : ''}`}>
              {/* Extruded 3D thickness sides */}
              <span className="cartridge__side cartridge__side--left" aria-hidden="true" />
              <span className="cartridge__side cartridge__side--right" aria-hidden="true" />
              <span className="cartridge__side cartridge__side--top" aria-hidden="true" />
              <span className="cartridge__side cartridge__side--bottom" aria-hidden="true" />

              {/* Front face */}
              <span className="cartridge__face cartridge__face--front" data-spray-surface="true">
                <span className="cartridge__lip" aria-hidden="true">
                  <span className="cartridge__grip" />
                  <span className="cartridge__notch">JV_ABELLO · PAK</span>
                  <span className="cartridge__grip" />
                </span>

                <span className="cartridge__label">
                  <span className="cartridge__photo">
                    <img src={photo} alt={`Portrait of ${name}`} width="320" height="320" />
                  </span>
                  <span className="cartridge__meta">
                    <span className="cartridge__title">{displayName}</span>
                    <span className="cartridge__sub">
                      <span>{role}</span>
                      <span className="cartridge__badge">BSCS · {year}</span>
                    </span>
                  </span>
                </span>

                <span className="cartridge__hint" aria-hidden="true">CLICK TO FLIP ↻</span>
                <span className="cartridge__pins" aria-hidden="true" />
              </span>

              {/* Back face */}
              <span className="cartridge__face cartridge__face--back">
                <span className="cartridge__lip cartridge__lip--back" aria-hidden="true">
                  <span className="cartridge__notch">MODEL · JV-2026</span>
                </span>

                <span className="cartridge__back-label">
                  <span className="cartridge__back-head">CARTRIDGE SPECS</span>
                  <dl className="cartridge__specs">
                    {facts.map(f => (
                      <div key={f.term} className="cartridge__spec-row">
                        <dt>{f.term}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <span className="cartridge__back-foot">LOCAL LLMS · UX · CREATIVE</span>
                </span>

                <span className="cartridge__hint" aria-hidden="true">CLICK TO FLIP ↻</span>
                <span className="cartridge__pins" aria-hidden="true" />
              </span>
            </span>
          </span>
        </button>
      </div>
      <div className="cartridge-shadow" aria-hidden="true" />
    </div>
  );
}
