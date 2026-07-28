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

/** Builds the "soft streak rules" block-bar widget and fills it in once visible. */
function initBlockBar() {
  const bar = document.getElementById('wBlockbar');
  const filled = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0];
  filled.forEach(() => bar.appendChild(document.createElement('span')));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const spans = bar.querySelectorAll('span');
        filled.forEach((v, i) => { if (v) spans[i].classList.add('filled'); });
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  io.observe(bar);
}

export function initProductSection() {
  initFanStage();
  buildHeatmap();
  initBlockBar();
}
