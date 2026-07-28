/**
 * Drives the page's dark/coffee theme two ways:
 *  - automatically, once the #themeflip section is *substantially* in view
 *    (not just brushed past while scrolling through to the next section) —
 *    debounced so a fast scroll-by doesn't flicker the whole page
 *  - manually, via the nav pin button, which overrides auto-detection until
 *    the user scrolls back near the top
 */
export function initThemeFlip() {
  const root = document.documentElement;
  const section = document.getElementById('themeflip');
  const pin = document.getElementById('themePin');

  let manualOverride = false;
  let pendingTimer = null;

  function setTheme(value) {
    root.setAttribute('data-theme', value);
  }

  function commit(value, delay) {
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => {
      if (!manualOverride) setTheme(value);
    }, delay);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (manualOverride) return;
      // Hysteresis: a high bar to switch to coffee (must nearly fill the
      // viewport — a deliberate stop, not a pass-through), a low bar to
      // switch back (only once it's mostly scrolled away again).
      if (entry.intersectionRatio > 0.65) commit('coffee', 220);
      else if (entry.intersectionRatio < 0.2) commit('dark', 220);
    });
  }, { threshold: [0, 0.2, 0.4, 0.65, 0.8, 1] });
  io.observe(section);

  window.addEventListener('scroll', () => {
    if (window.scrollY < 40) manualOverride = false;
  }, { passive: true });

  pin.addEventListener('click', () => {
    manualOverride = true;
    clearTimeout(pendingTimer);
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'coffee' : 'dark');
  });
}
