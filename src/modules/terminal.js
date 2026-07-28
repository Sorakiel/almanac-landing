/** Types out the stack "terminal" line by line once it scrolls into view. */
export function initTerminal() {
  const term = document.getElementById('supportTerm');
  if (!term) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        term.classList.add('typed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  io.observe(term);
}
