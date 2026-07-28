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
    grid.querySelectorAll('.scatter-cell').forEach((cell) => {
      cell.classList.add('breathe');
      cell.style.animationDelay = `${(-(Math.random() * 3.6)).toFixed(2)}s`;
    });
  }, 1300);
}
