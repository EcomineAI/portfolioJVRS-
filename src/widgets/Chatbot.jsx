// JV-BOT: the scripted chat helper, styled as a retro RPG dialog box.
// Opens from the launcher button or from `window.dispatchEvent(new CustomEvent('chatbot:open'))`.
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BOT_NAME, CLEARED, WELCOME, getResponse, quickChips } from '../data/chatbot.js';
import './widgets.css';

const TYPE_MS = 16;          // per character
const THINK_MS = 380;        // pause before the bot "speaks"

let nextId = 1;
const botMsg = html => ({ id: nextId++, from: 'bot', html, plain: toPlain(html) });

/** Plain-text version of a trusted bot reply (used for the typewriter + screen readers). */
function toPlain(html) {
  const el = document.createElement('div');
  el.innerHTML = html.replace(/<br\s*\/?>/gi, '\n');
  return el.textContent.replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/[ \t]{2,}/g, ' ').trim();
}

function prefersReducedMotion() {
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** 12×12 pixel portrait of JV-BOT. */
export function BotPortrait({ size = 40 }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <rect x="5" y="0" width="2" height="1" fill="var(--world-create)" />
      <rect x="5.5" y="1" width="1" height="1" fill="var(--fg)" />
      <rect x="1" y="2" width="10" height="8" fill="var(--fg)" />
      <rect x="2" y="3" width="8" height="6" fill="var(--primary-soft)" />
      <rect x="3" y="4" width="2" height="2" fill="var(--world-code)" />
      <rect x="7" y="4" width="2" height="2" fill="var(--world-code)" />
      <rect x="4" y="7" width="4" height="1" fill="var(--ink)" />
      <rect x="0" y="5" width="1" height="2" fill="var(--fg)" />
      <rect x="11" y="5" width="1" height="2" fill="var(--fg)" />
      <rect x="3" y="10" width="6" height="2" fill="var(--fg)" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 12 12" width="26" height="26" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M1 1h10v1H1zM0 2h1v6H0zM11 2h1v6h-1zM1 8h4v1H1zM7 8h4v1H7zM4 9h2v1H4zM3 10h2v1H3z" />
      <path fill="currentColor" d="M3 4h1v1H3zM6 4h1v1H6zM9 4h1v1H9z" />
      <path fill="var(--world-code)" d="M1 2h10v6H1z" opacity=".35" />
    </svg>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [botMsg(WELCOME)]);
  const [typing, setTyping] = useState(null);     // { id, count } for the reply being revealed
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState('');
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const panelRef = useRef(null);
  const thinkTimer = useRef(0);
  const navigate = useNavigate();
  const inputId = useId();
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  // open from anywhere (the Claude pixel buddy dispatches this)
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('chatbot:open', onOpen);
    return () => window.removeEventListener('chatbot:open', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  const onRootKeyDown = e => {
    if (open && e.key === 'Escape') { e.stopPropagation(); close(); }
  };

  // keep the newest message in view
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, thinking, open]);

  // typewriter
  useEffect(() => {
    if (!typing) return undefined;
    const msg = messages.find(m => m.id === typing.id);
    if (!msg || typing.count >= msg.plain.length) { setTyping(null); return undefined; }
    const t = setTimeout(() => setTyping(tp => tp && { ...tp, count: tp.count + 2 }), TYPE_MS);
    return () => clearTimeout(t);
  }, [typing, messages]);

  useEffect(() => () => clearTimeout(thinkTimer.current), []);

  const skipTyping = () => setTyping(null);

  const send = text => {
    const msg = text.trim();
    if (!msg || thinking) return;
    skipTyping();
    setMessages(ms => [...ms, { id: nextId++, from: 'user', text: msg }]);
    setInput('');
    setThinking(true);
    clearTimeout(thinkTimer.current);
    thinkTimer.current = setTimeout(() => {
      const reply = botMsg(getResponse(msg));
      setThinking(false);
      setMessages(ms => [...ms, reply]);
      if (!prefersReducedMotion()) setTyping({ id: reply.id, count: 0 });
    }, prefersReducedMotion() ? 0 : THINK_MS);
  };

  const reset = () => {
    clearTimeout(thinkTimer.current);
    setThinking(false);
    setTyping(null);
    setMessages([botMsg(CLEARED)]);
    inputRef.current?.focus();
  };

  // internal links inside bot replies use the router instead of a full reload
  const onLogClick = e => {
    const a = e.target.closest?.('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href.startsWith('/') && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      navigate(href);
      if (window.matchMedia?.('(max-width: 639px)').matches) close();
    }
  };

  return (
    <div className={`jvbot${open ? ' is-open' : ''}`} data-no-spray="true" data-uisfx-pack="scifi" onKeyDown={onRootKeyDown}>
      {open && (
        <section ref={panelRef} className="jvbot__panel" role="dialog" aria-modal="false" aria-labelledby={titleId}>
          <header className="jvbot__head">
            <div className="jvbot__portrait"><BotPortrait /></div>
            <h2 className="jvbot__name" id={titleId}>{BOT_NAME}<span className="sr-only"> chat assistant</span></h2>
            <div className="jvbot__head-actions">
              <button type="button" className="jvbot__icon-btn" data-uisfx="undo" onClick={reset} aria-label="Clear conversation" title="Clear">↺</button>
              <button type="button" className="jvbot__icon-btn" data-uisfx="close" onClick={close} aria-label="Close chat" title="Close (Esc)">✕</button>
            </div>
          </header>

          <div
            ref={logRef}
            className="jvbot__log"
            role="log"
            aria-live="polite"
            aria-label="Conversation"
            onClick={e => { if (typing) skipTyping(); onLogClick(e); }}
          >
            {messages.map(m => {
              if (m.from === 'user') {
                return (
                  <p key={m.id} className="jvbot__msg jvbot__msg--user">
                    <span className="sr-only">You: </span>{m.text}
                  </p>
                );
              }
              const isTyping = typing?.id === m.id;
              return (
                <div key={m.id} className="jvbot__msg jvbot__msg--bot">
                  <span className="sr-only">{BOT_NAME}: </span>
                  {isTyping ? (
                    <>
                      <span className="jvbot__typed" aria-hidden="true">
                        {m.plain.slice(0, typing.count)}
                        <span className="jvbot__caret">▌</span>
                      </span>
                      <span className="sr-only">{m.plain}</span>
                    </>
                  ) : (
                    // Trusted static HTML from src/data/chatbot.js (never user input).
                    <span dangerouslySetInnerHTML={{ __html: m.html }} />
                  )}
                </div>
              );
            })}
            {thinking && (
              <p className="jvbot__msg jvbot__msg--bot jvbot__thinking" aria-hidden="true">
                <span>■</span><span>■</span><span>■</span>
              </p>
            )}
            {!typing && !thinking && <span className="jvbot__next" aria-hidden="true">▼</span>}
          </div>

          <div className="jvbot__chips" role="group" aria-label="Suggested questions">
            {quickChips.map(c => (
              <button key={c.label} type="button" className="jvbot__chip" data-uisfx="select" onClick={() => send(c.msg)} disabled={thinking}>
                {c.label}
              </button>
            ))}
          </div>

          <form className="jvbot__form" onSubmit={e => { e.preventDefault(); send(input); }}>
            <label htmlFor={inputId} className="jvbot__label">Your message</label>
            <div className="jvbot__row">
              <input
                ref={inputRef}
                id={inputId}
                className="jvbot__input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about projects, skills…"
                maxLength={200}
                autoComplete="off"
              />
              <button type="submit" className="jvbot__send" data-uisfx="send" disabled={!input.trim() || thinking}>
                Send
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        ref={launcherRef}
        type="button"
        className="jvbot__launcher"
        data-uisfx={open ? 'close' : 'open'}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? <span className="jvbot__launcher-x" aria-hidden="true">✕</span> : <ChatIcon />}
      </button>
    </div>
  );
}
