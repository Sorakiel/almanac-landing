import { reduced } from './env.js';
import { lerp } from './fx.js';
import { register, wide } from './scroll.js';
import { initMorning, initReading, initEvening } from './dayDemos.js';
import { initFocus } from './dayFocus.js';
import { initWorkout } from './dayWorkout.js';

const TIMES = ['07:40', '13:10', '18:30', '21:00', '23:00'];
// Dawn → noon → evening → sunset → night: the sun and the sky glow pass through these.
const SKY = [
  [245, 199, 106],
  [245, 158, 92],
  [63, 184, 168],
  [232, 99, 42],
  [140, 123, 216],
];

/** Scene 5: one day, pinned and scrolled sideways from morning to night. */
export function initDay() {
  const section = document.getElementById('day');
  if (!section) return;
  const track = document.getElementById('dayTrack');
  const sky = document.getElementById('daySky');
  const fill = document.getElementById('tlFill');
  const sun = document.getElementById('tlSun');
  const timeline = section.querySelector('.timeline');
  const panels = Array.from(track.querySelectorAll('.panel'));

  const labels = TIMES.map((t, i) => {
    const s = document.createElement('span');
    s.textContent = t;
    s.style.left = `${(i / (TIMES.length - 1)) * 100}%`;
    s.style.top = '-6px';
    s.style.transform = 'translate(-50%,-100%)';
    timeline.appendChild(s);
    return s;
  });

  function gotoPanel(i) {
    if (!wide()) {
      panels[i].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    const top = section.getBoundingClientRect().top + scrollY;
    const range = section.offsetHeight - innerHeight;
    scrollTo({ top: top + range * (i / (panels.length - 1)), behavior: reduced ? 'auto' : 'smooth' });
  }

  initMorning();
  const focus = initFocus();
  initWorkout();
  initReading({ onFocus: () => { gotoPanel(1); focus.pick(25); } });
  initEvening();

  // Layout reads stay out of the frame loop: the track's travel only changes on resize.
  let dist = 0;
  let tlWidth = 0;
  let active = -1;
  let flat = null;
  register({
    el: section,
    measure() {
      dist = track.scrollWidth - innerWidth;
      tlWidth = timeline.offsetWidth;
    },
    frame({ prog, reduced: still }) {
      if (still || !wide()) {
        if (flat !== true) {
          flat = true;
          active = -1;
          panels.forEach((p) => p.classList.remove('dim'));
          track.style.transform = '';
        }
        return;
      }
      flat = false;
      const dp = prog(section);
      track.style.transform = `translateX(${-dp * dist}px)`;
      const ai = Math.round(dp * (panels.length - 1));
      if (ai !== active) {
        active = ai;
        panels.forEach((p, i) => p.classList.toggle('dim', i !== ai));
        labels.forEach((s, i) => s.classList.toggle('on', i === ai));
      }
      fill.style.transform = `scaleX(${dp})`;
      sun.style.transform = `translateX(${dp * tlWidth}px)`;
      const seg = dp * (SKY.length - 1);
      const k = Math.floor(seg);
      const c1 = SKY[k];
      const c2 = SKY[Math.min(SKY.length - 1, k + 1)];
      const rgb = c1.map((v, i) => Math.round(lerp(v, c2[i], seg - k))).join(',');
      sky.style.background = `radial-gradient(70% 55% at ${10 + dp * 80}% 0%,rgba(${rgb},.22),transparent 70%)`;
      sun.style.background = `rgb(${rgb})`;
      sun.style.boxShadow = `0 0 18px rgb(${rgb})`;
    },
  });
}
