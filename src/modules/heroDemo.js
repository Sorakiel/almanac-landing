import { createTickRing, createCountUp } from './ring.js';

/**
 * Wires the interactive habit checklist in the hero card to the progress ring.
 * The streak number is deliberately NOT touched here — a streak counts
 * consecutive days, not today's checkbox state, so tying it to clicks was
 * both a bug and a category error. It stays a fixed demo value.
 */
export function initHeroDemo() {
  const habits = document.querySelectorAll('#demoHabits .demo-habit');
  const svg = document.getElementById('demoRingSvg');
  const ringPct = document.getElementById('ringPct');
  const ringFrac = document.getElementById('ringFrac');
  const setProgress = createTickRing(svg);
  const setPct = createCountUp(ringPct);

  function updateRing() {
    const done = document.querySelectorAll('#demoHabits .demo-habit[data-done="true"]').length;
    const total = habits.length;
    setProgress(done / total);
    setPct(Math.round((done / total) * 100));
    ringFrac.textContent = `${done}/${total}`;
  }

  habits.forEach((li) => {
    li.addEventListener('click', () => {
      const done = li.getAttribute('data-done') === 'true';
      li.setAttribute('data-done', String(!done));
      updateRing();
    });
  });

  return updateRing;
}
