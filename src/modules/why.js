// Scene 6: four sticky cards that slide over each other - tap, offline, privacy, price.
import { reduced } from './env.js';
import { odo, ripple, burst, vib, plural, clamp, countTo } from './fx.js';
import { rowHTML } from './today.js';
import { register } from './scroll.js';

const SYNC_LIST = [
  { id: 'a', n: 'Английский', hue: 'var(--accent)', sub: 'По будням', st: 2, done: false, w: [1, 1, 0, 1, 1] },
  { id: 'b', n: 'Растяжка', hue: 'var(--teal)', sub: 'Каждый день', st: 11, done: false, w: [1, 1, 1, 1, 1] },
  { id: 'c', n: 'Читать 20 страниц', hue: 'var(--amber)', sub: 'Каждый день', st: 4, done: true, w: [0, 1, 1, 1, 1] },
];
const PRICE_FROM = 299;
const PRICE_MS = 1400;
const SEND_MS = 1200;
const SYNCED_MS = 1800;
const STACK_SHRINK = 0.06;
const STACK_DIM = 0.35;
const RIPPLE_MS = 600;

function initTap(root) {
  const tap = root.querySelector('#tapBig');
  const label = root.querySelector('#tapSt');
  let streak = 29;
  tap.addEventListener('click', () => {
    const on = !tap.classList.contains('on');
    tap.classList.toggle('on', on);
    tap.setAttribute('aria-pressed', String(on));
    vib();
    const from = streak;
    streak += on ? 1 : -1;
    odo(label, from, streak);
    if (on) {
      // The big button has no inner <i>, so the shared ripple() skips it; same ring, added by hand.
      const rip = document.createElement('span');
      rip.className = 'rip';
      tap.appendChild(rip);
      setTimeout(() => rip.remove(), RIPPLE_MS);
      burst(tap, tap.closest('.card-vis'), ['var(--accent)', 'var(--amber)', '#F59E5C']);
    }
  });
}

function toggleRow(list, btn) {
  const row = btn.closest('.p-row');
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
  return row;
}

function initOffline(root) {
  const list = SYNC_LIST.map((h) => ({ ...h }));
  const box = root.querySelector('#syncList');
  const cap = root.querySelector('#capsule');
  const capText = root.querySelector('#capText');
  const sw = root.querySelector('#netSw');
  let off = false;
  box.innerHTML = list
    .map((h) => rowHTML(h, true).replace('<span class="dots">', '<svg class="pend" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-clock"/></svg><span class="dots">'))
    .join('');
  const show = (cls, text) => {
    cap.className = `capsule lg ${cls}`;
    capText.textContent = text;
  };
  const pending = () => box.querySelectorAll('.p-row.pending');

  box.addEventListener('click', (e) => {
    const b = e.target.closest('.p-check');
    if (!b) return;
    const row = toggleRow(list, b);
    if (!off) return;
    row.classList.add('pending');
    const n = pending().length;
    show('', `Без сети · ${n} ${plural(n, 'изменение ждёт', 'изменения ждут', 'изменений ждут')}`);
  });

  sw.addEventListener('click', () => {
    off = !off;
    sw.setAttribute('aria-checked', String(off));
    sw.setAttribute('aria-label', off ? 'Включить сеть' : 'Выключить сеть');
    if (off) return show('off', 'Нет сети · отметки сохранятся');
    const n = pending().length;
    if (!n) return show('hide', '');
    show('spin', `Отправляю ${n}…`);
    setTimeout(() => {
      pending().forEach((r) => r.classList.remove('pending'));
      show('ok', 'Синхронизировано');
      setTimeout(() => {
        if (!off) show('hide', '');
      }, SYNCED_MS);
    }, SEND_MS);
  });
}

function initPrice(root) {
  const el = root.querySelector('#price');
  let done = false;
  return () => {
    if (done) return;
    done = true;
    countTo(el, PRICE_FROM, 0, PRICE_MS, () => {
      if (!reduced) el.parentNode.style.animation = 'popMark .7s var(--spring)';
    });
  };
}

export function initWhy() {
  const root = document.getElementById('why');
  if (!root) return;
  initTap(root);
  initOffline(root);
  const runPrice = initPrice(root);
  const cards = [...root.querySelectorAll('.card-s')];
  let tops = [];

  register({
    el: root,
    measure() {
      tops = cards.map((c) => parseFloat(getComputedStyle(c).top) || 96);
    },
    frame({ vh, reduced: still }) {
      if (still) return runPrice();
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const d = (next.getBoundingClientRect().top - tops[i + 1]) / vh;
        const k = clamp(1 - d, 0, 1);
        c.style.transform = `scale(${1 - k * STACK_SHRINK})`;
        c.style.filter = `brightness(${1 - k * STACK_DIM})`;
      });
      if (cards[cards.length - 1].getBoundingClientRect().top < vh * 0.6) runPrice();
    },
  });
}
