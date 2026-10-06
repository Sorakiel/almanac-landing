import { burst, clamp, vib } from './fx.js';
import { register } from './scroll.js';

const BURST = ['#F59E5C', '#E8632A', 'var(--amber)', 'var(--teal)'];

/** Scene 10: the mark's outline fills with the scroll, like a day closing. */
export function initFinal() {
  const section = document.getElementById('final');
  const logo = document.getElementById('finalLogo');
  const pct = document.getElementById('finalPct');
  if (!section || !logo) return;
  const segs = Array.from(logo.querySelectorAll('.fprog .s'));
  const stage = section.querySelector('.final-stage');

  function paint(fp) {
    section.style.setProperty('--fp', fp.toFixed(3));
    segs.forEach((seg, i) => {
      seg.style.strokeDashoffset = (100 * (1 - clamp(fp * segs.length - i, 0, 1))).toFixed(1);
    });
    pct.textContent = Math.round(fp * 100);
  }

  let full = false;
  register({
    el: section,
    frame({ prog, reduced }) {
      // Reduced motion unpins the scene, so it simply shows the closed day, without the pop.
      if (reduced) {
        paint(1);
        logo.classList.add('full');
        return;
      }
      const fp = clamp(prog(section) * 1.25, 0, 1);
      paint(fp);
      if (fp >= 1 && !full) {
        full = true;
        logo.classList.add('full');
        logo.classList.remove('done-pop');
        void logo.offsetWidth; // restart the pop if it was mid-flight
        logo.classList.add('done-pop');
        vib(10);
        burst(logo, stage, BURST);
      }
      // A little hysteresis so the pop doesn't retrigger on a 1px wobble.
      if (fp < 0.98 && full) {
        full = false;
        logo.classList.remove('full');
      }
    },
  });
}
