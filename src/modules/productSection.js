import { createTickRing } from './ring.js';

/**
 * Fans the stacked screen mockups out into an arc once the section scrolls into view,
 * and — at the same moment — fills the two ring mockups tick-by-tick (like the hero
 * ring does). Both rings are built at 0% upfront so there's something to animate;
 * filling them immediately on load meant they were already full by the time anyone
 * scrolled down to see the section.
 */
function initFanStage(fillRings) {
  const fanStage = document.getElementById('fanStage');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        fanStage.classList.add('fanned');
        fillRings();
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

/** Builds the two ring mockups (dashboard + coffee screens) at 0% and returns a function that fills them to 65%. */
function initFanRings() {
  const dashboard = createTickRing(document.getElementById('fcRingDashboardSvg'));
  const coffee = createTickRing(document.getElementById('fcRingCoffeeSvg'));
  dashboard(0);
  coffee(0);
  return () => { dashboard(0.65); coffee(0.65); };
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
  const fillRings = initFanRings();
  initFanStage(fillRings);
  buildHeatmap();
  initBlockBar();
}
