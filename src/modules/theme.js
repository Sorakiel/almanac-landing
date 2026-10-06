import { reduced } from './env.js';

/**
 * Dark / coffee. With nothing stored the page follows the system; a tap stores
 * the explicit choice. index.html repeats the stored-choice read in an inline
 * script so the first frame is already in the right theme.
 */

const KEY = 'almanac-landing-theme';
const root = document.documentElement;
const mq = window.matchMedia('(prefers-color-scheme: light)');

function isLight() {
  const t = root.getAttribute('data-theme');
  return t ? t === 'light' : mq.matches;
}

function apply(next) {
  root.setAttribute('data-theme', next);
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // storage blocked (private mode): the choice just won't survive a reload
  }
}

/** Switches the theme with a circular wipe from the pointer (or the nav button). */
export function flip(ev) {
  const next = isLight() ? 'dark' : 'light';
  const x = ev?.clientX || window.innerWidth - 60;
  const y = ev?.clientY || 40;
  if (!document.startViewTransition || reduced) {
    apply(next);
    return;
  }
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  document.startViewTransition(() => apply(next)).ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}

export function initTheme() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-theme-toggle]');
    if (b) flip(e);
  });
}
