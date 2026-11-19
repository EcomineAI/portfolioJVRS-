import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { gmailCompose, profile } from '../../data/profile.js';
import { BriefcaseIcon, GithubIcon, LinkedinIcon, MailIcon } from '../Icons.jsx';
import { PixelButton } from '../ui/index.jsx';
import { drawCode128, drawQrCode } from './idCodes.js';
import DirectEmailForm from './DirectEmailForm.jsx';

/** Custom pixel-art cursive 'J' signature overlapping the printed name. */
function PixelSignatureJ() {
  return (
    <svg
      className="mclovin-id__sig-j"
      viewBox="0 0 28 17"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="2" height="1" fill="#1d4ed8" />
      <rect x="6" y="3" width="2" height="1" fill="#1d4ed8" />
      <rect x="8" y="2" width="3" height="1" fill="#1d4ed8" />
      <rect x="11" y="1" width="7" height="1" fill="#1d4ed8" />
      <rect x="15" y="2" width="4" height="1" fill="#1d4ed8" />
      <rect x="18" y="3" width="2" height="1" fill="#1d4ed8" />
      <rect x="17" y="4" width="2" height="1" fill="#1d4ed8" />
      <rect x="14" y="2" width="2" height="2" fill="#141414" />
      <rect x="13" y="4" width="2" height="2" fill="#141414" />
      <rect x="12" y="6" width="2" height="2" fill="#141414" />
      <rect x="11" y="8" width="2" height="2" fill="#141414" />
      <rect x="10" y="10" width="2" height="2" fill="#141414" />
      <rect x="9" y="12" width="2" height="1" fill="#141414" />
      <rect x="6" y="13" width="4" height="1" fill="#141414" />
      <rect x="4" y="14" width="3" height="1" fill="#141414" />
      <rect x="2" y="13" width="2" height="1" fill="#141414" />
      <rect x="2" y="11" width="1" height="2" fill="#141414" />
      <rect x="3" y="10" width="2" height="1" fill="#141414" />
      <rect x="5" y="9" width="3" height="1" fill="#141414" />
      <rect x="8" y="8" width="3" height="1" fill="#141414" />
      <rect x="13" y="7" width="3" height="1" fill="#1d4ed8" />
      <rect x="16" y="6" width="4" height="1" fill="#1d4ed8" />
      <rect x="20" y="5" width="4" height="1" fill="#1d4ed8" />
      <rect x="24" y="4" width="2" height="1" fill="#1d4ed8" />
    </svg>
  );
}

/**
 * McLovin-style pixelated Developer ID card with Front & Back 3D flip.
 * - `docked`: compact floating side card triggered when scrolling to the bottom.
 * - `onClose`: shown as an ✕ button in docked mode.
 * - `resetKey`: flips back to front when dock closes or route changes.
 */
function McLovinIdCard({ docked = false, onClose, resetKey, onQrZoomChange }) {
  const [copied, setCopied] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [qrZoom, setQrZoom] = useState(false);
  const timer = useRef();
  const barcodeRef = useRef(null);
  const qrRef = useRef(null);
  const zoomQrRef = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    setFlipped(false);
    setQrZoom(false);
  }, [resetKey]);

  useEffect(() => {
    onQrZoomChange?.(qrZoom);
  }, [qrZoom, onQrZoomChange]);

  useEffect(() => {
    drawCode128(barcodeRef.current, 'JVA-WEB-03');
    drawQrCode(qrRef.current, profile.links.linkedin, 'in');
  }, []);

  useEffect(() => {
    if (!qrZoom) return undefined;
    drawQrCode(zoomQrRef.current, profile.links.linkedin, 'in');
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation?.();
        setQrZoom(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [qrZoom]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked: mailto link still works */ }
  };

  return (
    <div
      className={`mclovin-id${docked ? ' mclovin-id--docked' : ''}${flipped ? ' is-flipped' : ''}`}
      data-no-spray="true"
      data-uisfx-pack="studio"
    >
      <div className="mclovin-id__inner">
        {/* ======================== FRONT FACE ======================== */}
        <div className="mclovin-id__face mclovin-id__face--front" aria-hidden={flipped}>
          <div className="mclovin-id__glare" aria-hidden="true" />

          {/* Stepped cobalt/slate security stripe watermark behind right fields */}
          <svg
            className="mclovin-id__rainbow"
            viewBox="0 0 180 80"
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <path d="M0 10 H45 V16 H85 V24 H120 V34 H150 V46 H180 V58 H145 V46 H115 V36 H80 V28 H40 V22 H0 Z" fill="#e2e8f0" />
            <path d="M0 22 H40 V28 H80 V36 H115 V46 H145 V58 H180 V68 H140 V56 H110 V46 H75 V38 H35 V32 H0 Z" fill="#cbd5e1" />
            <path d="M0 32 H35 V38 H75 V46 H110 V56 H140 V68 H180 V76 H135 V66 H105 V56 H70 V48 H30 V42 H0 Z" fill="#1d4ed8" />
            <path d="M0 42 H30 V48 H70 V56 H105 V66 H135 V76 H110 V72 H65 V64 H25 V56 H0 Z" fill="#dbe3f0" />
          </svg>

          {onClose && (
            <button
              type="button"
              className="mclovin-id__close"
              data-uisfx="close"
              onClick={onClose}
              tabIndex={flipped ? -1 : 0}
              aria-label="Close Developer ID card"
              title="Close"
            >
              ✕
            </button>
          )}

          {copied && !flipped && (
            <div className="mclovin-id__stamp" aria-live="polite">
              COPIED ✓
            </div>
          )}

          {/* LEFT COLUMN: Real PFP + Code-128 Barcode (tap to flip) + Name/Address */}
          <div className="mclovin-id__left">
            <div className="mclovin-id__photo">
              <img
                src="/pfp.jpg"
                alt={`Portrait of ${profile.name.full}`}
                className="mclovin-id__img"
              />
            </div>

            <button
              type="button"
              className="mclovin-id__scan-btn"
              data-uisfx="swipe"
              onClick={() => setFlipped(true)}
              tabIndex={flipped ? -1 : 0}
              title="Flip card to scan LinkedIn QR code"
            >
              <canvas ref={barcodeRef} className="mclovin-id__barcode" aria-hidden="true" />
              <span className="mclovin-id__scan-hint">Tap for QR →</span>
            </button>

            <div className="mclovin-id__identity">
              <div className="mclovin-id__name">JUNE VIC</div>
              <div className="mclovin-id__addr">OLONGAPO, PH</div>
            </div>
          </div>

          {/* RIGHT COLUMN: Header + License Fields + Contact Actions */}
          <div className="mclovin-id__right">
            <div className="mclovin-id__head">
              <div className="mclovin-id__title-row">
                <span className="mclovin-id__state">OLONGAPO</span>
                <span className="mclovin-id__type">
                  DEV
                  <br />
                  LICENSE
                </span>
              </div>
              <div className="mclovin-id__num">
                NO. <strong>01-47-JVA03</strong>
              </div>
              <div className="mclovin-id__dates">
                <span>LVL <strong>3RD YR</strong></span>
                <span>EXP <strong className="is-open">OPEN</strong></span>
              </div>
            </div>

            <dl className="mclovin-id__specs">
              <div>
                <dt>ROLE</dt>
                <dd>WEB DEV</dd>
              </div>
              <div>
                <dt>STACK</dt>
                <dd>REACT</dd>
              </div>
              <div>
                <dt>ZONE</dt>
                <dd>{profile.timezone}</dd>
              </div>
              <div>
                <dt>RESTR</dt>
                <dd>NONE</dd>
              </div>
              <div className="mclovin-id__spec-wide">
                <dt>EYES</dt>
                <dd>DARK MODE</dd>
              </div>
            </dl>

            <div className="mclovin-id__footer">
              <a
                className="mclovin-id__email"
                href={`mailto:${profile.email}`}
                tabIndex={flipped ? -1 : 0}
              >
                {profile.email}
              </a>
              <div className="mclovin-id__actions">
                <button
                  type="button"
                  className="mclovin-id__btn mclovin-id__btn--mint"
                  data-uisfx="copy"
                  onClick={copy}
                  tabIndex={flipped ? -1 : 0}
                >
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
                <a
                  className="mclovin-id__btn mclovin-id__btn--primary"
                  href={gmailCompose}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-uisfx="open"
                  tabIndex={flipped ? -1 : 0}
                >
                  <MailIcon aria-hidden="true" /> Gmail
                </a>
                <a
                  className="mclovin-id__btn"
                  href={profile.resume}
                  download
                  data-uisfx="complete"
                  tabIndex={flipped ? -1 : 0}
                >
                  ↓ CV
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ======================== BACK FACE ======================== */}
        <div className="mclovin-id__face mclovin-id__face--back" aria-hidden={!flipped}>
          {/* Faint diagonal security stripe watermark */}
          <svg
            className="mclovin-id__back-rainbow"
            viewBox="0 0 200 120"
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <path d="M-10 95 L90 40 L210 75 L210 92 L90 56 L-10 112 Z" fill="#e2e8f0" />
            <path d="M-10 105 L90 50 L210 85 L210 100 L90 65 L-10 118 Z" fill="#cbd5e1" />
            <path d="M-10 114 L90 60 L210 95 L210 108 L90 73 L-10 125 Z" fill="#1d4ed8" />
            <path d="M-10 122 L90 68 L210 103 L210 116 L90 81 L-10 132 Z" fill="#dbe3f0" />
          </svg>

          {onClose && (
            <button
              type="button"
              className="mclovin-id__close"
              data-uisfx="close"
              onClick={onClose}
              tabIndex={flipped ? 0 : -1}
              aria-label="Close Developer ID card"
              title="Close"
            >
              ✕
            </button>
          )}

          {copied && flipped && (
            <div className="mclovin-id__stamp" aria-live="polite">
              COPIED ✓
            </div>
          )}

          <div className="mclovin-id__back-grid">
            {/* Left: Large Scannable LinkedIn QR (tap to enlarge) */}
            <div className="mclovin-id__back-qrcol">
              <button
                type="button"
                className="mclovin-id__back-qrbtn"
                data-uisfx="expand"
                onClick={() => setQrZoom(true)}
                tabIndex={flipped ? 0 : -1}
                aria-label="Enlarge LinkedIn QR code"
                title="Click to enlarge QR code"
              >
                <canvas
                  ref={qrRef}
                  className="mclovin-id__back-qr"
                  role="img"
                  aria-label={`QR code for ${profile.links.linkedin}`}
                />
              </button>
              <div className="mclovin-id__back-qrcap">
                <div>SCAN FOR LINKEDIN</div>
                <span>Tap QR to enlarge</span>
              </div>
            </div>

            {/* Right: Info above Quote + Links + Signature over Name */}
            <div className="mclovin-id__back-info">
              <div className="mclovin-id__back-top">
                <dl className="mclovin-id__back-meta">
                  <div><dt>DONOR:</dt><dd>OPEN SRC</dd></div>
                  <div><dt>RESTR:</dt><dd>NONE</dd></div>
                  <div><dt>ISS:</dt><dd>2024</dd></div>
                  <div><dt>EXP:</dt><dd className="is-open">HIRE ME</dd></div>
                </dl>

                <div className="mclovin-id__quote">
                  <div className="mclovin-id__quote-label">QUOTE</div>
                  <p className="mclovin-id__quote-text">&ldquo;Larp it till you Make it&rdquo;</p>
                </div>

                <div className="mclovin-id__back-links">
                  <a
                    className="mclovin-id__btn"
                    href={profile.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-uisfx="open"
                    tabIndex={flipped ? 0 : -1}
                  >
                    <LinkedinIcon aria-hidden="true" /> LinkedIn
                  </a>
                  <a
                    className="mclovin-id__btn"
                    href={profile.links.onlinejobs}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-uisfx="open"
                    tabIndex={flipped ? 0 : -1}
                  >
                    <BriefcaseIcon aria-hidden="true" /> OnlineJobs
                  </a>
                </div>
              </div>

              <div className="mclovin-id__back-bottom">
                <div className="mclovin-id__sig-wrap">
                  <PixelSignatureJ />
                  <span className="mclovin-id__sig-name">JUNE VIC M. ABELLO</span>
                </div>
                <div className="mclovin-id__actions">
                  <button
                    type="button"
                    className="mclovin-id__btn mclovin-id__btn--mint"
                    data-uisfx="copy"
                    onClick={copy}
                    tabIndex={flipped ? 0 : -1}
                  >
                    {copied ? 'Copied ✓' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    className="mclovin-id__btn mclovin-id__btn--gold"
                    data-uisfx="swipe"
                    onClick={() => setFlipped(false)}
                    tabIndex={flipped ? 0 : -1}
                  >
                    ← Front
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {qrZoom && createPortal(
        <div
          className="qr-modal"
          role="dialog"
          aria-modal="true"
          data-uisfx-pack="studio"
          aria-label="Enlarged LinkedIn QR code"
          onClick={(e) => { if (e.target === e.currentTarget) setQrZoom(false); }}
        >
          <div className="qr-modal__card pixel-card">
            <div className="qr-modal__head">
              <span className="qr-modal__title">LINKEDIN QR · JUNE VIC</span>
              <button
                type="button"
                className="mclovin-id__close qr-modal__x"
                data-uisfx="close"
                onClick={() => setQrZoom(false)}
                aria-label="Close enlarged QR code"
              >
                ✕
              </button>
            </div>
            <div className="qr-modal__box">
              <canvas
                ref={zoomQrRef}
                className="qr-modal__canvas"
                role="img"
                aria-label={`Large QR code for ${profile.links.linkedin}`}
              />
            </div>
            <p className="qr-modal__url">{profile.links.linkedin.replace('https://www.', '').replace(/\/$/, '')}</p>
            <div className="qr-modal__actions">
              <PixelButton href={profile.links.linkedin} size="sm">
                <LinkedinIcon aria-hidden="true" /> Open LinkedIn
              </PixelButton>
              <PixelButton variant="outline" size="sm" data-uisfx="close" onClick={() => setQrZoom(false)}>
                Close
              </PixelButton>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

/**
 * "Say hi" block.
 * - Default (bottom of every page except /contact): slim bar + side-docked McLovin ID
 *   card that slides in when scrolled all the way down and tucks away on scroll up.
 * - `inline` (/contact): renders the McLovin ID card directly in the page flow.
 */
export default function SayHi({ headingLevel = 'h2', id = 'say-hi', inline = false }) {
  const { pathname } = useLocation();
  const [dockOpen, setDockOpen] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const dismissedRef = useRef(false);
  const manualRef = useRef(false);
  const qrZoomRef = useRef(false);
  const Heading = headingLevel;

  useEffect(() => {
    setDockOpen(false);
    dismissedRef.current = false;
    manualRef.current = false;
  }, [pathname]);

  const closeDock = useCallback(() => {
    dismissedRef.current = true;
    manualRef.current = false;
    setDockOpen(false);
  }, []);

  const toggleDock = useCallback(() => {
    setDockOpen(prev => {
      const next = !prev;
      dismissedRef.current = !next;
      manualRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (inline) return undefined;
    let raf = 0;

    const checkScroll = () => {
      raf = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable < 120) return;

      const distFromBottom = doc.scrollHeight - (window.scrollY + window.innerHeight);
      if (distFromBottom <= 72 && window.scrollY > 40) {
        if (!dismissedRef.current) setDockOpen(true);
      } else if (distFromBottom > 180) {
        dismissedRef.current = false;
        if (!manualRef.current) setDockOpen(false);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(checkScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [inline]);

  useEffect(() => {
    if (inline || !dockOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !qrZoomRef.current) closeDock();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inline, dockOpen, closeDock]);

  if (inline) {
    return (
      <section className="say-hi say-hi--inline section" aria-labelledby={id}>
        <div className="container say-hi__inline-grid">
          <McLovinIdCard resetKey={pathname} />
          <div className="say-hi__inline-meta">
            <Heading id={id} className="say-hi__title">Say hi</Heading>
            <p className="say-hi__lead prose">
              Have a project, an internship opening or a question? Email is the fastest way to reach me.
            </p>
            <ul className="say-hi__links">
              <li>
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
                  <GithubIcon aria-hidden="true" /> GitHub <span className="say-hi__muted">@{profile.links.githubHandle}</span>
                </a>
              </li>
              <li>
                <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
                  <LinkedinIcon aria-hidden="true" /> LinkedIn <span className="say-hi__muted">connect</span>
                </a>
              </li>
              <li>
                <a href={profile.links.onlinejobs} target="_blank" rel="noopener noreferrer">
                  <BriefcaseIcon aria-hidden="true" /> OnlineJobs.ph <span className="say-hi__muted">hire me</span>
                </a>
              </li>
              <li>
                <a href={profile.resume} download>
                  <span aria-hidden="true">↓</span> Download résumé <span className="say-hi__muted">PDF</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="say-hi__inline-form">
            <DirectEmailForm />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="say-hi say-hi--compact" aria-labelledby={id}>
        <div className="container">
          <div className="say-hi__bar">
            <div className="say-hi__bar-left">
              <Heading id={id} className="say-hi__bar-title">Say hi</Heading>
              <a className="say-hi__bar-mail" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </div>

            <div className="say-hi__bar-actions">
              <PixelButton
                size="sm"
                variant={mailOpen ? 'primary' : 'outline'}
                data-uisfx={mailOpen ? 'close' : 'open'}
                onClick={() => setMailOpen((o) => !o)}
                aria-expanded={mailOpen}
                aria-controls="say-hi-mail-drawer"
              >
                {mailOpen ? 'Close' : 'Email me'}
              </PixelButton>

              <PixelButton
                size="sm"
                variant={dockOpen ? 'outline' : 'primary'}
                data-uisfx={dockOpen ? 'close' : 'open'}
                onClick={toggleDock}
                aria-expanded={dockOpen}
                aria-controls="dev-id-dock"
              >
                {dockOpen ? 'Hide Dev ID' : 'Show Dev ID'}
              </PixelButton>
            </div>
          </div>

          {mailOpen && (
            <div id="say-hi-mail-drawer" className="say-hi__mail-drawer">
              <DirectEmailForm compact onClose={() => setMailOpen(false)} />
            </div>
          )}
        </div>
      </section>

      <aside
        id="dev-id-dock"
        className={`say-hi-dock${dockOpen ? ' is-visible' : ''}`}
        aria-label="Developer ID Card"
        aria-hidden={!dockOpen}
      >
        <McLovinIdCard
          docked
          onClose={closeDock}
          resetKey={`${pathname}-${dockOpen}`}
          onQrZoomChange={(open) => { qrZoomRef.current = open; }}
        />
      </aside>
    </>
  );
}
