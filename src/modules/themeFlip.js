/**
 * The page has a "base" theme (dark by default) that you pick with the nav
 * pin, and it stays your base — permanently, not just until you scroll away.
 * The #themeflip section is a small showcase of *the other* theme: once it's
 * substantially in view, the page shows the opposite of your base; leave the
 * section and it returns to your base. So it's always "mostly your theme,
 * with one small stretch of the other one" — never a coin flip that forgets
 * what you picked.
 */
export function initThemeFlip() {
  const root = document.documentElement;
  const section = document.getElementById('themeflip');
  const pin = document.getElementById('themePin');

  let baseTheme = 'dark';
  let inZone = false;
  let pendingTimer = null;

  function opposite(theme) {
    return theme === 'dark' ? 'coffee' : 'dark';
  }

  function applyTheme() {
    root.setAttribute('data-theme', inZone ? opposite(baseTheme) : baseTheme);
  }

  function commitZone(value, delay) {
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => {
      inZone = value;
      applyTheme();
    }, delay);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Hysteresis: a high bar to enter the showcase (must nearly fill the
      // viewport — a deliberate stop, not a pass-through), a low bar to
      // leave it (only once it's mostly scrolled away again).
      if (entry.intersectionRatio > 0.85) commitZone(true, 220);
      else if (entry.intersectionRatio < 0.2) commitZone(false, 220);
    });
  }, { threshold: [0, 0.2, 0.4, 0.65, 0.85, 1] });
  io.observe(section);

  pin.addEventListener('click', () => {
    baseTheme = opposite(baseTheme);
    applyTheme();
  });

  applyTheme();
}
