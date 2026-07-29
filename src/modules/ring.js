import { reduced } from './env.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Mirrors the app's CompletionDonut: a ring of 36 discrete radial ticks
// (flat-capped line segments), not a continuous stroked arc.
const CENTER = 80;
const R_IN = 58;
const R_OUT = 74;
const TICK_COUNT = 36;

/**
 * Builds a 36-tick ring inside the given <svg> element and returns a setter
 * that fills ticks up to a 0–1 fraction. Mirrors the app's real CompletionDonut
 * exactly: every tick's transition-delay is its own fixed index * 12ms, set
 * once at build time — NOT recomputed relative to whatever changed on a given
 * update. A relative/rescoped stagger looks like a different (faster, always-
 * from-zero) animation than the app depending on which ticks happen to change,
 * which is exactly the mismatch this was rebuilt to remove.
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
    line.style.transitionDelay = `${i * 12}ms`;
    svgEl.appendChild(line);
    ticks.push(line);
  }

  return function setProgress(fraction) {
    const target = Math.round(Math.max(0, Math.min(1, fraction)) * TICK_COUNT);
    ticks.forEach((tick, i) => {
      tick.classList.toggle('filled', i < target);
    });
  };
}

/**
 * Tweens the % readout next to a ring up to `target`, easing out over
 * `duration` ms — mirrors the app's useCountUp hook exactly (same easeOutCubic
 * curve, same 600ms default). The ring's ticks sweep in via their own CSS
 * transition; without this the number used to just snap while the ring
 * visibly animated, which read as two disconnected pieces instead of one
 * gauge.
 */
export function createCountUp(el, duration = 600) {
  let from = 0;
  let rafId = null;

  return function setValue(target) {
    if (rafId !== null) cancelAnimationFrame(rafId);

    if (reduced || from === target) {
      from = target;
      el.textContent = target;
      return;
    }

    const start = from;
    let startTs = null;

    function step(ts) {
      if (startTs === null) startTs = ts;
      const t = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        from = target;
        rafId = null;
      }
    }
    rafId = requestAnimationFrame(step);
  };
}
