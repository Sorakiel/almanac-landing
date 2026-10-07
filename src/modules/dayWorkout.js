import { burst, fmt, kg, vib, visible } from './fx.js';

const REST = 30;
const NUDGE = 15;
const EXERCISES = [
  { n: 'Присед', sets: [[90, 5], [90, 5], [90, 5], [90, 5], [90, 5]], last: [87.5, 5] },
  { n: 'Румынская тяга', sets: [[70, 10], [70, 10], [70, 10]], last: [65, 10] },
  { n: 'Выпады', sets: [[20, 12], [20, 12], [20, 12]], last: [20, 12] },
];
// The water's surface travels from the rim (8) to the bottom (192) of the 200-unit ring.
const waterY = (left, total) => (8 + (1 - Math.max(0, Math.min(1, left / total))) * 184).toFixed(1);
const WAVE = 'M0 0 Q25 -9 50 0 T100 0 T150 0 T200 0 T250 0 T300 0 T350 0 T400 0 V220 H0 Z';

/** 18:30 — one set at a time; a finished set drains a ring of water for the rest. */
export function initWorkout() {
  const stage = document.getElementById('wkStage');
  const track = document.getElementById('wkTrack');
  if (!stage) return;
  const w = { done: { '0-0': true }, rest: null, shown: '' };

  function current() {
    for (let i = 0; i < EXERCISES.length; i++) {
      for (let j = 0; j < EXERCISES[i].sets.length; j++) if (!w.done[`${i}-${j}`]) return [i, j];
    }
    return null;
  }
  function nextLabel(i, j) {
    const e = EXERCISES[i];
    if (e.sets[j + 1]) return `${e.n} · подход ${j + 2}`;
    const n = EXERCISES[i + 1];
    return n ? `${n.n} · ${kg(n.sets[0][0])} × ${n.sets[0][1]}` : 'финиш';
  }
  function waveRing(left, total) {
    return `<div class="wave"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><clipPath id="wclip"><circle cx="100" cy="100" r="90"/></clipPath></defs><circle cx="100" cy="100" r="90" fill="var(--teal)" fill-opacity=".08"/><g clip-path="url(#wclip)"><g class="water" style="transform:translateY(${waterY(left, total)}px)"><path class="w2" d="${WAVE}"/><path class="w1" d="${WAVE}"/></g></g><circle cx="100" cy="100" r="97" fill="none" stroke="var(--teal)" stroke-opacity=".35" stroke-width="2"/></svg><div class="c"><b class="num" id="restT">${fmt(left)}</b><small>отдых</small></div></div>`;
  }

  function render() {
    let cur = current();
    track.innerHTML = EXERCISES.map((e, i) => {
      const on = cur && cur[0] === i;
      const dots = e.sets.map((_, j) => `<i class="${w.done[`${i}-${j}`] ? 'd' : ''}${on && cur[1] === j && !w.rest ? ' c' : ''}"></i>`).join('');
      return `<div class="tr${on ? ' on' : ''}"><b>${e.n}</b><span>${dots}</span></div>`;
    }).join('');

    if (w.rest) {
      const left = (w.rest.until - Date.now()) / 1000;
      w.shown = 'rest';
      stage.innerHTML = `${waveRing(left, w.rest.total)}<div class="rbtns"><button class="rb" type="button" data-w="rest" data-d="-${NUDGE}">−${NUDGE} с</button><button class="rb go" type="button" data-w="skip">Я готов</button><button class="rb" type="button" data-w="rest" data-d="${NUDGE}">+${NUDGE} с</button></div><div class="wk-next">Дальше · <b>${w.rest.next}</b></div>`;
      return;
    }
    // Ran out of sets: start the loop over so the demo never dead-ends.
    if (!cur) {
      w.done = { '0-0': true };
      cur = [0, 1];
    }
    const e = EXERCISES[cur[0]];
    const [weight, reps] = e.sets[cur[1]];
    const pr = weight > e.last[0] || (weight === e.last[0] && reps > e.last[1]);
    const key = cur.join('-');
    const enter = w.shown !== key;
    w.shown = key;
    stage.className = `stage${enter ? ' enter' : ''}`;
    stage.innerHTML = `<div class="wk-ex">${e.n}</div><div class="wk-no">Подход <b>${cur[1] + 1}</b> из ${e.sets.length}</div><div class="wk-nums"><div><b class="num">${kg(weight)}</b><small>кг</small></div><span class="x">×</span><div><b class="num">${reps}</b><small>повт.</small></div></div><div class="wk-hint">В прошлый раз ${kg(e.last[0])} × ${e.last[1]}${pr ? ' <span class="pr">рекорд</span>' : ''}</div><button class="done-btn" type="button" data-w="set">Подход сделан</button>`;
  }

  function tick() {
    if (!w.rest) return;
    const left = (w.rest.until - Date.now()) / 1000;
    if (left <= 0) {
      w.rest = null;
      vib();
      render();
      return;
    }
    const t = document.getElementById('restT');
    const water = stage.querySelector('.water');
    if (t) t.textContent = fmt(left);
    if (water) water.style.transform = `translateY(${waterY(left, w.rest.total)}px)`;
  }

  stage.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-w]');
    if (!b) return;
    const kind = b.dataset.w;
    if (kind === 'set') {
      const cur = current();
      w.done[cur.join('-')] = true;
      vib();
      b.classList.add('ok');
      burst(b, stage);
      w.rest = { until: Date.now() + REST * 1000, total: REST, next: nextLabel(cur[0], cur[1]) };
      setTimeout(render, 300);
    } else if (kind === 'skip') {
      w.rest = null;
      render();
    } else if (kind === 'rest' && w.rest) {
      w.rest.until += +b.dataset.d * 1000;
      const left = (w.rest.until - Date.now()) / 1000;
      if (left <= 1) {
        w.rest = null;
        render();
        return;
      }
      w.rest.total = Math.max(w.rest.total, left);
      tick();
    }
  });

  // Rest is wall-clock based, so pausing the tick off screen loses nothing.
  let timer = 0;
  visible(stage, (v) => {
    clearInterval(timer);
    if (v) {
      tick();
      timer = setInterval(tick, 1000);
    }
  });
  render();
}
