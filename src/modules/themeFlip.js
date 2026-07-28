/**
 * Drives the page's dark/coffee theme two ways:
 *  - automatically, based on scroll position crossing the #themeflip section
 *  - manually, via the nav pin button, which overrides auto-detection until
 *    the user scrolls back near the top (a real UX escape hatch, not a dead end)
 */
export function initThemeFlip() {
  const root = document.documentElement;
  const enterEl = document.getElementById('themeSentinelEnter');
  const exitEl = document.getElementById('themeSentinelExit');
  const pin = document.getElementById('themePin');

  let manualOverride = false;

  function setTheme(value) {
    root.setAttribute('data-theme', value);
  }

  function autoThemeCheck() {
    // Check the reset condition *before* the early return — otherwise a manual
    // override could never clear once scrolled back to the top.
    if (window.scrollY < 40) manualOverride = false;
    if (manualOverride) return;

    const mid = window.innerHeight / 2;
    const enterTop = enterEl.getBoundingClientRect().top;
    const exitTop = exitEl.getBoundingClientRect().top;
    setTheme(enterTop < mid && exitTop > mid ? 'coffee' : 'dark');
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      autoThemeCheck();
      ticking = false;
    });
  }, { passive: true });

  pin.addEventListener('click', () => {
    manualOverride = true;
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'coffee' : 'dark');
  });

  autoThemeCheck();
}
