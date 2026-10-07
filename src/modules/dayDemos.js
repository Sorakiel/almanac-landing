import { burst, odo, plural, ripple, vib } from './fx.js';
import { MOOD, MOODC, face, rowHTML, seal } from './today.js';

/** Toggles a habit row in place: check, ripple, streak odometer. Returns the new state. */
function toggleRow(list, btn) {
  const row = btn.closest('.p-row');
  const h = list.find((x) => x.id === row.dataset.h);
  h.done = !h.done;
  vib();
  row.classList.toggle('done', h.done);
  btn.setAttribute('aria-pressed', h.done);
  if (h.done) ripple(btn);
  const st = row.querySelector('.st');
  if (st) {
    const from = h.st;
    h.st = Math.max(0, h.st + (h.done ? 1 : -1));
    st.parentNode.style.display = h.st ? 'inline-flex' : 'none';
    odo(st, from, h.st);
  }
  return h.done;
}

const MORNING = [
  { id: 'm1', n: 'Медитация', hue: 'var(--teal)', sub: '2 из 4 на этой неделе', st: 0, done: true, w: [1, 0, 1, 1, 0] },
  { id: 'm2', n: 'Растяжка', hue: 'var(--teal)', sub: 'Каждый день', st: 11, done: false, w: [1, 1, 1, 1, 1] },
  { id: 'm3', n: 'Стакан воды', hue: 'var(--accent)', sub: 'Каждый день', st: 27, done: false, w: [1, 1, 1, 1, 1] },
];

/** 07:40 — three morning habits and a running count. */
export function initMorning() {
  const host = document.getElementById('morning');
  const count = document.getElementById('mCnt');
  if (!host) return;
  host.innerHTML = MORNING.map((h) => rowHTML(h, true)).join('');
  host.addEventListener('click', (e) => {
    const btn = e.target.closest('.p-check');
    if (!btn) return;
    if (toggleRow(MORNING, btn)) burst(btn, host.closest('.demo'), ['var(--accent)', 'var(--amber)', 'var(--teal)']);
    odo(count, +count.textContent, MORNING.filter((h) => h.done).length);
  });
}

const BOOK = { start: 212, total: 320, step: 15, pace: 14 };

/** 21:00 — the daily-goal button and an honest finish forecast. */
export function initReading({ onFocus }) {
  const plus = document.getElementById('rdPlus');
  if (!plus) return;
  const bar = document.getElementById('rdBar');
  const pagesEl = document.getElementById('rdPages');
  const todayEl = document.getElementById('rdToday');
  const forecast = document.getElementById('rdForecast');
  const r = { pages: BOOK.start, today: 0 };

  function paint() {
    bar.style.width = `${(r.pages / BOOK.total) * 100}%`;
    todayEl.textContent = r.today;
    const left = BOOK.total - r.pages;
    const days = Math.ceil(left / BOOK.pace);
    forecast.innerHTML = left
      ? `Дочитаете примерно через <b>${days} ${plural(days, 'день', 'дня', 'дней')}</b>`
      : '<b>Дочитана.</b> Оценку можно поставить в карточке книги';
    plus.textContent = left ? `+${BOOK.step} стр` : 'Начать заново';
  }

  plus.addEventListener('click', () => {
    if (r.pages >= BOOK.total) {
      r.pages = BOOK.start;
      r.today = 0;
      pagesEl.textContent = r.pages;
      paint();
      return;
    }
    const from = r.pages;
    r.pages = Math.min(BOOK.total, r.pages + BOOK.step);
    r.today = Math.min(r.today + BOOK.step, r.pages);
    vib();
    odo(pagesEl, from, r.pages);
    burst(plus, plus.closest('.demo'), ['var(--amber)', '#E8C27A', 'var(--accent)']);
    paint();
  });
  document.getElementById('rdFocus').addEventListener('click', onFocus);
  paint();
}

const ENERGY = ['Выжат', 'Мало сил', 'Норм', 'Бодро', 'Заряжен'];
const ENERGY_COLORS = ['#E5544A', '#E0873A', '#E0AA45', '#9CCB5A', '#52C48A'];
const CLOSE_RESET_MS = 4000;

/** 23:00 — face of the day, the energy battery, and «Закрыть день» with the seal. */
export function initEvening() {
  const demo = document.getElementById('eveDemo');
  if (!demo) return;
  const moods = document.getElementById('moods');
  const energy = document.getElementById('energy');
  const closeBtn = document.getElementById('closeDay');
  const rf = { mood: 4, en: 3 };

  function paintMoods() {
    moods.innerHTML = MOOD.map((m, i) => {
      const on = rf.mood === i + 1;
      return `<button type="button" data-i="${i + 1}" class="${on ? 'on' : ''}${rf.mood && !on ? ' dim' : ''}" aria-pressed="${on}" style="--fc:${MOODC[i]}">${face(i + 1, MOODC[i])}<span>${m}</span></button>`;
    }).join('');
  }

  function paintEnergy() {
    const e = rf.en;
    const cells = [1, 2, 3, 4, 5]
      .map((i) => `<button type="button" tabindex="-1" aria-label="Энергия ${i}" data-e="${i}" class="${i <= e ? 'on' : ''}" style="--d:${i * 45}ms"></button>`)
      .join('');
    energy.innerHTML = `<span>Энергия</span><div class="batt" role="slider" tabindex="0" aria-label="Энергия" aria-valuemin="1" aria-valuemax="5" aria-valuenow="${e}" aria-valuetext="${ENERGY[e - 1]}" style="--bc:${ENERGY_COLORS[e - 1]}"><div class="body">${cells}</div><span class="nub"></span>${e === 5 ? '<svg class="bolt" aria-hidden="true"><use href="#i-bolt"/></svg>' : ''}</div><b style="color:${ENERGY_COLORS[e - 1]}">${ENERGY[e - 1]}</b>`;
  }

  moods.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    rf.mood = +b.dataset.i;
    vib();
    paintMoods();
    if (rf.mood >= 4) burst(moods.querySelector('.on'), demo, [MOODC[rf.mood - 1], 'var(--amber)']);
  });

  function setEnergy(v) {
    if (v === rf.en) return;
    rf.en = v;
    vib();
    paintEnergy();
    energy.querySelector('.batt').focus({ preventScroll: true });
  }
  let drag = false;
  const valueAt = (e) => {
    const r = energy.querySelector('.body').getBoundingClientRect();
    return Math.max(1, Math.min(5, Math.ceil(((e.clientX - r.left) / r.width) * 5)));
  };
  energy.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.batt')) return;
    drag = true;
    setEnergy(valueAt(e));
    e.preventDefault();
  });
  addEventListener('pointermove', (e) => drag && setEnergy(valueAt(e)));
  addEventListener('pointerup', () => { drag = false; });
  energy.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setEnergy(Math.min(5, rf.en + 1));
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setEnergy(Math.max(1, rf.en - 1));
    else return;
    e.preventDefault();
  });

  closeBtn.addEventListener('click', () => {
    seal(demo);
    burst(closeBtn, demo, ['var(--accent)', 'var(--amber)', 'var(--violet)', 'var(--teal)']);
    closeBtn.textContent = 'День закрыт ✓';
    closeBtn.classList.replace('btn-acc', 'btn-soft');
    setTimeout(() => {
      closeBtn.textContent = 'Закрыть день';
      closeBtn.classList.replace('btn-soft', 'btn-acc');
    }, CLOSE_RESET_MS);
  });

  paintMoods();
  paintEnergy();
}
