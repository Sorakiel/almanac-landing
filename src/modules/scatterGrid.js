import { reduced } from './env.js';

const COLS = 34;
const ROWS = 18;

/** Builds the ambient heatmap-style background grid behind the hero headline. */
export function buildScatterGrid() {
  const grid = document.getElementById('scatterGrid');
  const cellCount = COLS * ROWS;

  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement('div');
    cell.className = 'scatter-cell';
    if (Math.random() < 0.1) cell.classList.add('active');

    const rx = (Math.random() * 36 - 18).toFixed(1);
    const ry = (Math.random() * 36 - 18).toFixed(1);
    const rot = (Math.random() * 40 - 20).toFixed(1);
    cell.style.transform = `translate(${rx}px,${ry}px) rotate(${rot}deg)`;
    cell.style.transitionDelay = `${i * 1.6}ms`;
    cell.style.transitionProperty = 'transform,opacity';
    cell.style.transitionDuration = reduced ? '0ms' : '1.1s';
    cell.style.transitionTimingFunction = 'cubic-bezier(.16,1,.3,1)';
    grid.appendChild(cell);
  }

  return grid;
}

/** Assembles the scattered cells into a neat grid, then starts an ambient "breathing" pulse. */
export function assembleScatterGrid(grid) {
  requestAnimationFrame(() => grid.classList.add('assembled'));

  setTimeout(() => {
    if (reduced) return;
    // Only the ~10% "active" (colored) cells actually read as breathing — the
    // other 90% are a barely-visible border tint, so animating all ~600 of
    // them forever was pure wasted compositor work for no visible gain.
    grid.querySelectorAll('.scatter-cell.active').forEach((cell) => {
      cell.classList.add('breathe');
      cell.style.animationDelay = `${(-(Math.random() * 3.6)).toFixed(2)}s`;
    });

    // The grid breathes for the rest of the page's life once started — pause
    // it while scrolled out of view instead of animating off-screen pixels.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => grid.classList.toggle('paused', !entry.isIntersecting));
    });
    io.observe(grid);
  }, 1300);
}
