/**
 * Plain button + div accordion — deliberately not <details>/<summary>. That
 * native element toggles its own content visibility as part of its `open`
 * attribute changing, outside CSS's control, which is exactly what made every
 * previous attempt at a smooth open/close fight the browser instead of the
 * transition just working. Here the answer stays in normal flow the whole
 * time; JS measures its real pixel height once per click and animates
 * max-height to that exact value, so there's nothing left to guess or race.
 */
function open(item, btn, answer) {
  item.classList.add('is-open');
  btn.setAttribute('aria-expanded', 'true');
  answer.style.maxHeight = `${answer.scrollHeight}px`;
}

function close(item, btn, answer) {
  // Commit a concrete pixel value first (in case it's still "none" from init)
  // and force a style flush before collapsing — two writes to the same
  // property in one tick can otherwise get collapsed into a single recalc,
  // skipping the "before" frame the transition needs to animate from.
  answer.style.maxHeight = `${answer.scrollHeight}px`;
  void answer.offsetHeight;
  item.classList.remove('is-open');
  btn.setAttribute('aria-expanded', 'false');
  answer.style.maxHeight = '0px';
}

export function initFaq() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', () => {
      if (item.classList.contains('is-open')) close(item, btn, answer);
      else open(item, btn, answer);
    });

    // Clicking the answer text itself also closes it (matches prior behavior).
    answer.addEventListener('click', () => close(item, btn, answer));

    // The default-open item renders open and unconstrained from the start —
    // no measured animation on load, and no risk of locking in a height
    // measured before web fonts have swapped in.
    if (item.classList.contains('is-open')) {
      answer.style.maxHeight = 'none';
    }
  });
}
