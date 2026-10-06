import { reduced } from './env.js';

/** Fades [data-rv] blocks up as they enter. Only ones that start below the fold, so nothing above it blinks on load. */
export function initReveal() {
  if (reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.remove('pre');
        io.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -12% 0px' },
  );
  document.querySelectorAll('[data-rv]').forEach((el) => {
    if (el.getBoundingClientRect().top <= window.innerHeight) return;
    el.classList.add('pre');
    io.observe(el);
  });
}
