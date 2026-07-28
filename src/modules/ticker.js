import { reduced } from './env.js';

const LINES = [
  'PATCH /habit_logs · 200 · 0мс UI',
  'PATCH /workouts · 200 · 0мс UI',
  'GET /dashboard · 200 · 12мс',
  'PATCH /habit_logs · 200 · 0мс UI',
];

/** A small rotating log line — a continuous, ambient signal of "it's fast", not a one-shot reveal. */
export function initTicker() {
  const el = document.getElementById('wTicker');
  const spans = LINES.map((text, i) => {
    const span = document.createElement('span');
    span.className = 'tk-line';
    if (i === 0) span.classList.add('active');
    span.textContent = text;
    el.appendChild(span);
    return span;
  });

  if (reduced || spans.length < 2) return;

  let current = 0;
  setInterval(() => {
    spans[current].classList.remove('active');
    current = (current + 1) % spans.length;
    spans[current].classList.add('active');
  }, 1800);
}
