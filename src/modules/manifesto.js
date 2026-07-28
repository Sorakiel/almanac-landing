/** Lights up manifesto lines as they cross the center of the viewport (scroll-scrub reveal). */
export function initManifesto() {
  const lines = document.querySelectorAll('.ms-line');
  const thresholds = [];
  for (let t = 0; t <= 1; t += 0.05) thresholds.push(t);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('lit', entry.intersectionRatio > 0.6);
    });
  }, { threshold: thresholds });

  lines.forEach((line) => io.observe(line));
}
