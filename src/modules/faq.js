/**
 * <details> animates open smoothly via CSS (the .faq-answer grid-template-rows
 * trick), but removing the native `open` attribute collapses the content
 * instantly in every browser — there's no window left for a transition to run,
 * because `open` removal is what the browser uses to decide the content isn't
 * rendered anymore. So the visual state is driven by a `.is-open` class instead:
 * closing removes the class first (the transition plays while `open` is still
 * present, so nothing collapses natively), and `open` itself is only cleared
 * once that transition has actually finished.
 */
const CLOSE_MS = 260; // matches .faq-answer's grid-template-rows transition duration

function closeItem(details) {
  if (!details.classList.contains('is-open')) return;
  details.classList.remove('is-open');
  window.setTimeout(() => details.removeAttribute('open'), CLOSE_MS);
}

function openItem(details) {
  details.setAttribute('open', '');
  // rAF so the browser registers the closed starting state before the class
  // flips — flipping in the same tick can start the transition from its end state.
  requestAnimationFrame(() => details.classList.add('is-open'));
}

export function initFaq() {
  document.querySelectorAll('.faq-item').forEach((details) => {
    if (details.hasAttribute('open')) details.classList.add('is-open');

    const summary = details.querySelector('summary');
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (details.classList.contains('is-open')) closeItem(details);
      else openItem(details);
    });
  });

  // Clicking the answer text itself also closes it (matches the old behavior).
  document.querySelectorAll('.faq-item p').forEach((answer) => {
    answer.addEventListener('click', () => closeItem(answer.closest('.faq-item')));
  });
}
