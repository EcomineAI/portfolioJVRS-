import { useEffect } from 'react';

const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

/** Easter egg: Konami code hue-rotates the page for 2s. */
export function useKonami() {
  useEffect(() => {
    let i = 0;
    let t;
    const onKey = e => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === CODE[i]) {
        i++;
        if (i === CODE.length) {
          i = 0;
          window.dispatchEvent(new CustomEvent('konami:unlock'));
          document.body.style.transition = 'filter .5s';
          document.body.style.filter = 'hue-rotate(180deg)';
          t = setTimeout(() => { document.body.style.filter = ''; }, 2000);
        }
      } else {
        i = 0;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(t); };
  }, []);
}
