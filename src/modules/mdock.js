import { $ } from './fx.js';
import { guessPlatform } from './platform.js';
import { register } from './scroll.js';

/**
 * Phones: the bottom install dock (LANDING.md §6а п.2). Shows once the hero is
 * done and hides while the final scene is on screen, which has its own buttons.
 */

const SUB = {
  android: 'Android · бесплатно',
  ios: 'iPhone · бесплатно',
  windows: 'Windows · бесплатно',
  macos: 'macOS · бесплатно',
  linux: 'Linux · бесплатно',
};
const PHONE_MAX = 700;

export function initMdock() {
  const dock = $('#mdock');
  const hero = $('#hero');
  const fin = $('#final');
  if (!dock || !hero || !fin) return;
  const btn = dock.querySelector('button');
  $('#mdockSub').textContent = SUB[guessPlatform()] || 'Бесплатно, без рекламы';

  let on = false;
  const set = (v) => {
    if (v === on) return;
    on = v;
    dock.classList.toggle('on', v);
    dock.setAttribute('aria-hidden', String(!v));
    btn.tabIndex = v ? 0 : -1;
  };

  // No `el`: it depends on two scenes at once, so it runs every frame (two rect reads).
  register({
    frame({ vw, vh, prog, reduced }) {
      if (vw > PHONE_MAX) {
        set(false);
        return;
      }
      // Reduced motion unpins the hero, so its progress is always 0: there
      // "passed" means its bottom edge is above the bottom of the screen.
      const heroDone = reduced ? hero.getBoundingClientRect().bottom <= vh : prog(hero) >= 0.98;
      const fr = fin.getBoundingClientRect();
      set(heroDone && !(fr.top < vh && fr.bottom > 0));
    },
  });
}
