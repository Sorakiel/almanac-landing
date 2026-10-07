// Scenes 8-9: the theme split phone, and phone → desktop sync with the platform dock.
import { reduced } from './env.js';
import { odo, ripple, vib, visible } from './fx.js';
import { HABITS, rowHTML, todayHTML } from './today.js';
import { guessPlatform } from './platform.js';

const PHONE_LIST = [
  { id: 'a', n: 'Растяжка', hue: 'var(--teal)', sub: 'Каждый день', st: 11, done: false, w: [1, 1, 1, 1, 1] },
  { id: 'b', n: 'Английский', hue: 'var(--accent)', sub: 'По будням', st: 2, done: false, w: [1, 1, 0, 1, 1] },
  { id: 'c', n: 'Читать 20 страниц', hue: 'var(--amber)', sub: 'Каждый день', st: 4, done: false, w: [0, 1, 1, 1, 1] },
];
const DESK_TOTAL = 5;
const DESK_DONE_BEFORE = 1; // "Медитация" is already ticked on the desktop
const RING_LEN = 106.8; // 2π·17, the desktop ring's circumference
const FLY_MS = 700;
const SYNCED_HIDE_MS = 1400;
const IDLE_MS = 8000;
const AUTO_MS = 3200;

function initThemes() {
  const split = document.getElementById('split');
  if (!split) return;
  // The split always shows three of five done, independent of the hero's live state.
  const shown = HABITS.map((h, i) => ({ ...h, done: i < 3 }));
  document.getElementById('splitDark').innerHTML = todayHTML(shown, false);
  document.getElementById('splitCoffee').innerHTML = todayHTML(shown, false);
  const range = document.getElementById('splitRange');
  range.addEventListener('input', () => split.style.setProperty('--x', `${range.value}%`));
}

function initSync() {
  const stage = document.getElementById('devStage');
  if (!stage) return;
  const list = PHONE_LIST.map((h) => ({ ...h }));
  const phoneList = document.getElementById('phoneList');
  const link = document.getElementById('devLink');
  const path = document.getElementById('devPath');
  const dot = document.getElementById('devDot');
  const cap = document.getElementById('devCap');
  const capText = document.getElementById('devCapT');
  const cnt = document.getElementById('deskCnt');
  const ring = document.getElementById('deskRing');
  let lastUser = 0;
  let auto = 0;
  let hideTimer = 0;

  phoneList.innerHTML = list.map((h) => rowHTML(h, true)).join('');

  const deskCount = () => {
    const n = DESK_DONE_BEFORE + list.filter((h) => h.done).length;
    odo(cnt, Number(cnt.textContent), n);
    ring.setAttribute('stroke-dashoffset', (RING_LEN * (1 - n / DESK_TOTAL)).toFixed(1));
  };

  const sync = (h, btn) => {
    const row = document.querySelector(`#deskList [data-sync="${h.id}"]`);
    if (!row) return;
    const arrive = () => {
      row.classList.toggle('d', h.done);
      row.classList.remove('flash');
      void row.offsetWidth; // restart the flash keyframes
      row.classList.add('flash');
      deskCount();
      cap.className = 'capsule lg ok';
      capText.textContent = 'Синхронизировано';
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        cap.className = 'capsule lg hide';
      }, SYNCED_HIDE_MS);
    };
    if (reduced) return arrive();

    const sr = stage.getBoundingClientRect();
    const a = btn.getBoundingClientRect();
    const b = row.querySelector('i').getBoundingClientRect();
    const ax = a.left + a.width / 2 - sr.left;
    const ay = a.top + a.height / 2 - sr.top;
    const bx = b.left + b.width / 2 - sr.left;
    const by = b.top + b.height / 2 - sr.top;
    path.setAttribute('d', `M${ax} ${ay} C${ax - 60} ${ay - 140} ${bx + 160} ${by - 90} ${bx} ${by}`);
    link.classList.add('on');
    cap.className = 'capsule lg spin';
    capText.textContent = 'Отправляю…';
    const len = path.getTotalLength();
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / FLY_MS);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const p = path.getPointAtLength(len * e);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      if (k < 1) return requestAnimationFrame(step);
      dot.setAttribute('cx', -20);
      link.classList.remove('on');
      arrive();
    };
    requestAnimationFrame(step);
  };

  const toggle = (row, btn) => {
    const h = list.find((x) => x.id === row.dataset.h);
    h.done = !h.done;
    vib();
    row.classList.toggle('done', h.done);
    btn.setAttribute('aria-pressed', String(h.done));
    if (h.done) ripple(btn);
    const st = row.querySelector('.st');
    if (st) {
      const from = h.st;
      h.st = Math.max(0, h.st + (h.done ? 1 : -1));
      st.parentNode.style.display = h.st ? 'inline-flex' : 'none';
      odo(st, from, h.st);
    }
    sync(h, btn);
  };

  phoneList.addEventListener('click', (e) => {
    const b = e.target.closest('.p-check');
    if (!b) return;
    lastUser = Date.now();
    toggle(b.closest('.p-row'), b);
  });

  // An untouched demo plays itself, and only while it is on screen.
  let timer = 0;
  const tick = () => {
    if (Date.now() - lastUser < IDLE_MS) return;
    const rows = phoneList.querySelectorAll('.p-row');
    const r = rows[auto++ % rows.length];
    toggle(r, r.querySelector('.p-check'));
  };
  if (!reduced) {
    visible(stage, (v) => {
      clearInterval(timer);
      if (v) timer = setInterval(tick, AUTO_MS);
    });
  }

  const plat = guessPlatform();
  document.querySelectorAll(`.dk-chip[data-plat="${plat}"]`).forEach((c) => c.classList.add('you'));
}

export function initDevices() {
  initThemes();
  initSync();
}
