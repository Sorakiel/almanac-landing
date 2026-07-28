import { reduced } from './env.js';

/** Runs the boot-sequence preloader, then calls onComplete once (deadline-guarded so it can never hang the page). */
export function initPreloader(onComplete) {
  const preloader = document.getElementById('preloader');
  const plBar = document.getElementById('plBar');
  const plPct = document.getElementById('plPct');
  const dur = reduced ? 250 : 1150;
  let start = null;
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    plBar.style.width = '100%';
    plPct.textContent = '// ЗАГРУЗКА 100%';
    preloader.classList.add('pl-done');
    onComplete();
    setTimeout(() => { preloader.style.display = 'none'; }, 750);
  }

  function step(ts) {
    if (done) return;
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const pct = Math.round(p * 100);
    plBar.style.width = pct + '%';
    plPct.textContent = '// ЗАГРУЗКА ' + (pct < 10 ? '0' : '') + pct + '%';
    if (p < 1) requestAnimationFrame(step);
    else finish();
  }

  requestAnimationFrame(step);
  // Deadline fallback: never let a throttled rAF (hidden tab, slow device) block the page.
  setTimeout(finish, dur + 900);
}
