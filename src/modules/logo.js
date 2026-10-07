/**
 * The Almanac mark: the current app icon (orange tile + diamond). Not the
 * Logo Lab drafts — the new mark is still being chosen.
 *
 * Variants:
 *   plain  static icon (nav, footer, install window, QR centre)
 *   intro  hero load-in: tile pops, diamond draws, then snaps 90°
 *   final  ghost diamond + a stroke the final scene fills by scroll (.fprog .s)
 */

const DIA = 'M256 140 L372 256 L256 372 L140 256 Z';
const STROKE = 'fill="none" stroke="#1A1206" stroke-width="30" stroke-linejoin="round"';
let n = 0;
// .fin, not .final: #final is also the scene's class.
const CLS = { intro: 'intro', final: 'fin' };

/** SVG markup only; ids are unique per call so several logos can share a page. */
export function logoSVG(variant = 'plain') {
  const id = `lgA${++n}`;
  let dia;
  if (variant === 'intro') dia = `<path class="dia s" pathLength="100" d="${DIA}" ${STROKE}/>`;
  else if (variant === 'final')
    dia = `<path d="${DIA}" ${STROKE} stroke-opacity=".22"/><g class="fprog"><path class="dia s" pathLength="100" d="${DIA}" ${STROKE}/></g>`;
  else dia = `<path class="dia" d="${DIA}" ${STROKE}/>`;
  return (
    `<svg viewBox="0 0 512 512" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="#F59E5C"/><stop offset="1" stop-color="#E8632A"/></linearGradient></defs>` +
    `<rect class="tile" x="16" y="16" width="480" height="480" rx="128" fill="url(#${id})"/>${dia}</svg>`
  );
}

/** Whole `.logo` element markup, for modules that build HTML strings. */
export function Logo({ variant = 'plain', cls = '', size } = {}) {
  const classes = ['logo', CLS[variant], cls].filter(Boolean).join(' ');
  const style = size ? ` style="width:${size}px;height:${size}px"` : '';
  const ring = variant === 'intro' ? '<span class="ring"></span>' : '';
  return `<span class="${classes}"${style}>${logoSVG(variant)}${ring}</span>`;
}

/**
 * Logos visible on first paint (nav, hero, footer) are written into index.html
 * with the same markup, so the hero intro starts with the page instead of
 * after the script loads. Use the data-logo placeholder for anything else.
 *
 * Fills every `<span class="logo" data-logo="plain|intro|final">` placeholder in the page. */
export function mountLogos(root = document) {
  root.querySelectorAll('[data-logo]').forEach((el) => {
    const variant = el.dataset.logo || 'plain';
    if (CLS[variant]) el.classList.add(CLS[variant]);
    el.innerHTML = logoSVG(variant) + (variant === 'intro' ? '<span class="ring"></span>' : '');
    el.removeAttribute('data-logo');
  });
}
