import { createTickRing } from './ring.js';

/** Fans the stacked screen mockups out into an arc once the section scrolls into view. */
function initFanStage() {
  const fanStage = document.getElementById('fanStage');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        fanStage.classList.add('fanned');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  io.observe(fanStage);
}

/** Fills the heatmap mockup with randomized intensity levels, GitHub-contribution-graph style. */
function buildHeatmap() {
  const heat = document.getElementById('fcHeat');
  for (let i = 0; i < 91; i++) {
    const span = document.createElement('span');
    const r = Math.random();
    if (r > 0.82) span.className = 'l3';
    else if (r > 0.6) span.className = 'l2';
    else if (r > 0.4) span.className = 'l1';
    heat.appendChild(span);
  }
}

/** The two static ring mockups (dashboard + coffee screens) — always show a fixed 65%, no interaction. */
function initFanRings() {
  const dashboard = createTickRing(document.getElementById('fcRingDashboardSvg'));
  const coffee = createTickRing(document.getElementById('fcRingCoffeeSvg'));
  dashboard(0.65);
  coffee(0.65);
}

/** Reveals the "soft streak rules" glyph progress bar once its card is visible. */
function initBlockBar() {
  const fill = document.getElementById('wBlockbarFill');
  const bar = document.getElementById('wBlockbar');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        fill.style.width = '79%';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  io.observe(bar);
}

export function initProductSection() {
  initFanStage();
  buildHeatmap();
  initFanRings();
  initBlockBar();
}
