import { reduced, finePointer } from './env.js';

/** Subtle cursor-follow effect on primary CTAs. */
export function initMagnetic() {
  if (!finePointer || reduced) return;

  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = (e.clientX - r.left - r.width / 2) * 0.25;
      const my = (e.clientY - r.top - r.height / 2) * 0.35;
      btn.style.transform = `translate(${mx}px,${my}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });
}
