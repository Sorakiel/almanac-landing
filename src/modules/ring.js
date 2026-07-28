const SVG_NS = 'http://www.w3.org/2000/svg';

// Mirrors the app's CompletionDonut: a ring of 36 discrete radial ticks
// (flat-capped line segments), not a continuous stroked arc.
const CENTER = 80;
const R_IN = 58;
const R_OUT = 74;
const TICK_COUNT = 36;

/**
 * Builds a 36-tick ring inside the given <svg> element and returns a setter
 * that fills ticks up to a 0–1 fraction, sweeping in with a per-tick stagger.
 *
 * The stagger is recomputed on every call, scoped to whichever ticks actually
 * change this time — not a fixed delay baked in at build time. A fixed delay
 * (tick i always waits i*12ms) only produces a visible sweep on the very first
 * fill from empty; a later partial change (e.g. toggling one habit) only ever
 * touches a handful of ticks whose fixed delays are bunched within a ~100ms
 * window out of a 420ms range — barely perceptible, reads as a pop, not a
 * wipe. Rescoping the stagger to just the changed ticks makes every update
 * sweep the same way, whether it's the initial mount or a later click.
 */
export function createTickRing(svgEl) {
  svgEl.setAttribute('viewBox', '0 0 160 160');
  const ticks = [];

  for (let i = 0; i < TICK_COUNT; i++) {
    const angle = (-90 + i * (360 / TICK_COUNT)) * (Math.PI / 180);
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', (CENTER + R_IN * Math.cos(angle)).toFixed(2));
    line.setAttribute('y1', (CENTER + R_IN * Math.sin(angle)).toFixed(2));
    line.setAttribute('x2', (CENTER + R_OUT * Math.cos(angle)).toFixed(2));
    line.setAttribute('y2', (CENTER + R_OUT * Math.sin(angle)).toFixed(2));
    svgEl.appendChild(line);
    ticks.push(line);
  }

  let current = 0;

  return function setProgress(fraction) {
    const target = Math.round(Math.max(0, Math.min(1, fraction)) * TICK_COUNT);
    const lo = Math.min(current, target);
    const hi = Math.max(current, target);

    ticks.forEach((tick, i) => {
      tick.style.transitionDelay = i >= lo && i < hi ? `${(i - lo) * 12}ms` : '0ms';
      tick.classList.toggle('filled', i < target);
    });

    current = target;
  };
}
