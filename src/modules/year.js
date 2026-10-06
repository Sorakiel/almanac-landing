import { clamp, ease } from './fx.js';
import { register } from './scroll.js';

// The reference's "today" in a 365-day year, and the weekday the year starts on.
const TODAY = 278;
const OFFSET = 3;

// Seeded so the grid is the same on every visit — it's an illustration, not data.
function buildYear() {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const days = [];
  for (let d = 0; d < 365; d++) {
    const r = rnd();
    const trend = 0.45 + (d / 365) * 0.5;
    let lv = r > trend + 0.12 ? 0 : r < trend * 0.35 ? 4 : r < trend * 0.6 ? 3 : r < trend * 0.85 ? 2 : 1;
    if (d > 150 && d < 175) lv = Math.max(lv, 2);
    days.push(d > TODAY ? -1 : lv);
  }
  return days;
}

/** Scene 3: the year of diamonds lights up day by day as it scrolls past. */
export function initYear() {
  const section = document.getElementById('idea');
  const grid = document.getElementById('yearGrid');
  const daysEl = document.getElementById('yDays');
  const bestEl = document.getElementById('yBest');
  if (!section || !grid) return;

  const year = buildYear();
  let html = '<i style="visibility:hidden"></i>'.repeat(OFFSET);
  year.forEach((lv, d) => {
    html += `<i class="${lv < 0 ? 'fut' : `l${lv}`}${d === TODAY ? ' today' : ''}"></i>`;
  });
  grid.innerHTML = html;
  const cells = Array.from(grid.children).slice(OFFSET);

  let lit = -1;
  function paint(n) {
    if (n === lit) return;
    lit = n;
    let days = 0;
    let best = 0;
    let run = 0;
    cells.forEach((cell, d) => {
      cell.classList.toggle('on', d < n && year[d] > 0);
      if (d >= n) return;
      if (year[d] > 0) {
        days++;
        run++;
        best = Math.max(best, run);
      } else run = 0;
    });
    daysEl.textContent = days;
    bestEl.textContent = best;
  }

  register({
    el: section,
    frame({ vh, reduced }) {
      if (reduced) {
        paint(TODAY + 1);
        return;
      }
      const r = section.getBoundingClientRect();
      const p = clamp((vh * 0.95 - r.top) / (r.height + vh * 0.25), 0, 1);
      paint(Math.round(ease(p) * (TODAY + 1)));
    },
  });
}
