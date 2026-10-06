// Scene 7: two giant rows that move only while the page scrolls, in opposite directions.
import { reduced } from './env.js';
import { register } from './scroll.js';

const SPEED = 0.45;
const GAP = 40;

export function initMarquee() {
  const root = document.querySelector('.mq');
  if (!root || reduced) return;
  const rows = [...root.querySelectorAll('[data-mq]')].map((el) => ({ el, dir: Number(el.dataset.mq), w: 0 }));

  register({
    el: root,
    measure() {
      rows.forEach((r) => {
        r.w = r.el.firstElementChild.offsetWidth + GAP;
      });
    },
    frame({ sy }) {
      rows.forEach((r) => {
        const x = (((sy * SPEED * r.dir) % r.w) + r.w) % r.w;
        r.el.style.transform = `translateX(${-x}px)`;
      });
    },
  });
}
