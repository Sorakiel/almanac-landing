import { reduced } from './env.js';

/** Small shared helpers for the live demos. */

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/** Markup for an icon from the sprite in index.html. */
export const use = (name, cls) =>
  `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true"><use href="#i-${name}"/></svg>`;

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
/** easeInOutCubic — the curve every scroll scene uses. */
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function vib(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // vibrate throws in some embedded browsers; a missing buzz is not worth surfacing
  }
}

/** Seconds → "mm:ss". */
export function fmt(s) {
  s = Math.max(0, Math.round(s));
  const m = Math.floor(s / 60);
  const x = s % 60;
  return `${m < 10 ? '0' : ''}${m}:${x < 10 ? '0' : ''}${x}`;
}

/** Russian decimal comma for weights: 92.5 → "92,5". */
export const kg = (v) => String(v).replace('.', ',');

/** Russian plural: plural(n, 'день', 'дня', 'дней'). 11–14 take "many". */
export function plural(n, one, few, many) {
  const m = n % 10;
  const h = n % 100;
  if (m === 1 && h !== 11) return one;
  if (m >= 2 && m <= 4 && (h < 10 || h >= 20)) return few;
  return many;
}

/** Rolls a number from `from` to `to` like an odometer. */
export function odo(el, from, to) {
  if (!el) return;
  if (reduced || from === to) {
    el.textContent = to;
    return;
  }
  const down = to < from;
  el.innerHTML = `<span class="odo${down ? ' down' : ''}"><span>${down ? `${to}<br>${from}` : `${from}<br>${to}`}</span></span>`;
}

/** Sparkle burst centred on `el`, drawn inside the positioned `host`. */
export function burst(el, host, cols = ['var(--teal)', 'var(--accent)', 'var(--amber)']) {
  if (reduced || !el || !host) return;
  const hr = host.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const w = document.createElement('div');
  w.className = 'burst';
  w.style.left = `${r.left + r.width / 2 - hr.left - host.clientLeft}px`;
  w.style.top = `${r.top + r.height / 2 - hr.top - host.clientTop}px`;
  let html = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
    const d = 46 + Math.random() * 34;
    const s = 4 + (i % 3) * 2;
    html += `<i style="--dx:${Math.round(Math.cos(a) * d)}px;--dy:${Math.round(Math.sin(a) * d)}px;background:${cols[i % cols.length]};width:${s}px;height:${s}px"></i>`;
  }
  w.innerHTML = html;
  host.appendChild(w);
  setTimeout(() => w.remove(), 900);
}

/** Ring that spreads from a check button (expects an <i> circle inside). */
export function ripple(btn) {
  if (reduced || !btn.querySelector('i')) return;
  const r = document.createElement('span');
  r.className = 'rip';
  btn.appendChild(r);
  setTimeout(() => r.remove(), 600);
}

/** Calls cb(true|false) as `el` enters/leaves the viewport (100px margin). */
export function visible(el, cb) {
  if (!('IntersectionObserver' in window)) {
    cb(true);
    return;
  }
  new IntersectionObserver((es) => es.forEach((e) => cb(e.isIntersecting)), { rootMargin: '100px' }).observe(el);
}

/** Counts el's text from `from` to `to` over `ms` (ease-out cubic), then calls done. */
export function countTo(el, from, to, ms, done) {
  if (reduced) {
    el.textContent = to;
    done?.();
    return;
  }
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
    else done?.();
  };
  requestAnimationFrame(step);
}
