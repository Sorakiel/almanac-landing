import { reduced } from './env.js';

/**
 * Fades [data-rv] blocks up as they enter. Only ones that start below the fold,
 * so nothing above it blinks on load. The first observer report decides which
 * those are: reading positions synchronously at init would force the page's
 * first layout in the middle of script setup.
 */
export function initReveal() {
  if (reduced || !('IntersectionObserver' in window)) return;
  const seen = new WeakSet();
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        const el = e.target;
        if (!seen.has(el)) {
          seen.add(el);
          if (e.boundingClientRect.top <= window.innerHeight) {
            io.unobserve(el);
            return;
          }
          el.classList.add('pre');
          return;
        }
        if (!e.isIntersecting) return;
        el.classList.remove('pre');
        io.unobserve(el);
      }),
    { rootMargin: '0px 0px -12% 0px' },
  );
  document.querySelectorAll('[data-rv]').forEach((el) => io.observe(el));
}
