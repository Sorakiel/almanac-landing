import { reduced } from './env.js';
import { clamp } from './fx.js';

/**
 * The single scroll engine: one requestAnimationFrame per frame for every scene.
 *
 *   register({ el, measure(ctx), frame(ctx) })
 *
 * - `el` is the scene's root. An IntersectionObserver keeps a scene inactive
 *   while it is off screen; inactive scenes are not updated (§7). A scene that
 *   leaves gets one last frame so it settles at its edge state.
 * - `measure(ctx)` runs on registration, on resize and whenever the page height
 *   changes. Read and cache layout here (offsetTop, scrollWidth, sticky tops…),
 *   never in `frame`.
 * - `frame(ctx)` runs inside the shared rAF. Write only transform, opacity,
 *   filter and CSS variables. ctx = { vh, vw, sy, reduced, prog(el) }, where
 *   prog(el) is a pinned scene's progress: clamp(−top / (height − vh), 0, 1).
 */

const scenes = [];
const heights = new WeakMap();
const bar = document.getElementById('prog');
let docRange = 1;
let ticking = false;

const ctx = {
  vh: window.innerHeight,
  vw: window.innerWidth,
  sy: window.scrollY,
  reduced,
  prog(el) {
    const range = (heights.get(el) ?? el.offsetHeight) - ctx.vh;
    return range > 0 ? clamp(-el.getBoundingClientRect().top / range, 0, 1) : 0;
  },
};

const io =
  'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            scenes.forEach((s) => {
              if (s.el !== e.target) return;
              if (s.active && !e.isIntersecting) s.settle = true;
              s.active = e.isIntersecting;
            });
          });
          schedule();
        },
        { rootMargin: '25% 0px' },
      )
    : null;

function measureScene(s) {
  if (s.el) heights.set(s.el, s.el.offsetHeight);
  s.measure?.(ctx);
}

function measureAll() {
  ctx.vh = window.innerHeight;
  ctx.vw = window.innerWidth;
  docRange = Math.max(1, document.documentElement.scrollHeight - ctx.vh);
  scenes.forEach(measureScene);
}

function frame() {
  ticking = false;
  ctx.sy = window.scrollY;
  if (bar) bar.style.transform = `scaleX(${ctx.sy / docRange})`;
  for (const s of scenes) {
    if (!s.active && !s.settle) continue;
    s.settle = false;
    s.frame?.(ctx);
  }
}

function schedule() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(frame);
}

/** Adds a scene to the loop. Returns nothing; scenes live for the page's lifetime. */
export function register(scene) {
  const s = { ...scene, active: !io || !scene.el, settle: true };
  scenes.push(s);
  measureScene(s);
  if (io && s.el) io.observe(s.el);
  schedule();
}

/** Asks for a frame outside of scroll, e.g. after a demo changed state. */
export const requestFrame = schedule;

/** Wide layout: pinned horizontal scenes only run above 900px. */
export const wide = () => ctx.vw > 900;

export function initScroll() {
  measureAll();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    measureAll();
    schedule();
  });
  // Fonts swapping in, demos rendering and images decoding all change the page
  // height without a resize event; re-measure so cached sizes stay true.
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      measureAll();
      schedule();
    }).observe(document.body);
  }
  schedule();
}
