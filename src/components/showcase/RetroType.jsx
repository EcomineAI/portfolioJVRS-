// Old-console boot text: a pixel prompt types the line out one character at a time
// behind a blinking block cursor, then the cursor blinks a few times and goes away.
// Screen readers get the full text immediately.
import { useEffect, useState } from 'react';
import './RetroType.css';

export default function RetroType({ text, delay = 350, speed = 70 }) {
  const reduce =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [count, setCount] = useState(reduce ? text.length : 0);
  const [cursor, setCursor] = useState(!reduce);

  useEffect(() => {
    if (reduce) return undefined;
    let timer;
    let hide;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        setCount(c => {
          if (c + 1 >= text.length) {
            clearInterval(timer);
            hide = setTimeout(() => setCursor(false), 2200);
          }
          return c + 1;
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearTimeout(hide);
      clearInterval(timer);
    };
  }, [text, delay, speed, reduce]);

  const typing = count < text.length;
  return (
    <span className="retro-type">
      <span className="retro-type__sr">{text}</span>
      <span className="retro-type__visual" aria-hidden="true">
        {/* invisible full text reserves the final width so the layout never jumps */}
        <span className="retro-type__ghost">{text}</span>
        <span className="retro-type__live">
          {text.slice(0, count)}
          {cursor && <span className={`retro-type__cursor${typing ? ' is-solid' : ''}`} />}
        </span>
      </span>
    </span>
  );
}
