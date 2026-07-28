/** Native <details> only toggles on the summary; clicking the answer itself should also close it. */
export function initFaq() {
  document.querySelectorAll('.faq-item p').forEach((answer) => {
    answer.addEventListener('click', () => {
      answer.closest('details')?.removeAttribute('open');
    });
  });
}
