import { clamp } from './fx.js';
import { register } from './scroll.js';

/**
 * Scene 4: each word takes ink as it's read. Words wrapped in *asterisks* in
 * the markup are the accent phrase; the asterisks never reach the page.
 */
export function initManifesto() {
  const p = document.getElementById('manifesto');
  if (!p) return;

  let inAccent = false;
  const words = p.textContent.trim().split(/\s+/);
  p.textContent = '';
  // Screen readers get the whole sentence at once; the per-word spans are a visual
  // effect (unread words are deliberately faint) and stay out of the a11y tree.
  const spoken = document.createElement('span');
  spoken.className = 'vh';
  spoken.textContent = words.join(' ').replaceAll('*', '');
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  p.append(spoken, visual);
  const spans = words.map((raw) => {
    let w = raw;
    if (w.startsWith('*')) {
      inAccent = true;
      w = w.slice(1);
    }
    const accent = inAccent;
    const ends = /\*[.,!?]?$/.test(w);
    if (ends) {
      w = w.replace('*', '');
      inAccent = false;
    }
    const span = document.createElement('span');
    if (accent) span.className = 'acc';
    span.textContent = w;
    visual.append(span, ' ');
    return span;
  });

  let litCount = -1;
  register({
    el: p,
    frame({ vh, reduced }) {
      const r = p.getBoundingClientRect();
      const ratio = reduced ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
      const n = Math.round(ratio * spans.length);
      if (n === litCount) return;
      litCount = n;
      spans.forEach((s, i) => s.classList.toggle('lit', i < n));
    },
  });
}
