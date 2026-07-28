const CIRC = 326.7;
const STREAK_BASE = 11;

/** Wires the interactive habit checklist in the hero card to the progress ring and streak count. */
export function initHeroDemo() {
  const habits = document.querySelectorAll('#demoHabits .demo-habit');
  const ringFill = document.getElementById('ringFill');
  const ringPct = document.getElementById('ringPct');
  const streakNum = document.getElementById('streakNum');

  function updateRing() {
    const done = document.querySelectorAll('#demoHabits .demo-habit[data-done="true"]').length;
    const pct = Math.round((done / habits.length) * 100);
    ringFill.style.strokeDashoffset = (CIRC - (CIRC * pct) / 100).toFixed(1);
    ringPct.textContent = pct;
    streakNum.textContent = STREAK_BASE + done;
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
