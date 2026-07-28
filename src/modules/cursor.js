import { reduced, finePointer } from './env.js';

/** Custom cursor (dot + trailing ring) — desktop fine-pointer only. */
export function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!finePointer || reduced) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  document.body.classList.add('has-cursor');
  let rx = 0, ry = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    dot.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
  }, { passive: true });

  (function loop() {
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a,button,.demo-habit,.fan-card')) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a,button,.demo-habit,.fan-card')) ring.classList.remove('hover');
  });
}
