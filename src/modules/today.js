import { use, vib } from './fx.js';

/**
 * The app's Today screen, rendered from data. Shared by every scene that shows
 * a phone or a habit list (hero, day, why, themes, devices) so the rows look
 * and behave the same everywhere.
 */

/** Demo habits for the hero phone and the theme split. Each scene copies before mutating. */
export const HABITS = [
  { id: 'med', n: 'Медитация', g: 'Утро', hue: 'var(--teal)', sub: '2 из 4 на этой неделе', st: 0, done: true, w: [1, 0, 1, 1, 0] },
  { id: 'str', n: 'Растяжка', g: 'Утро', hue: 'var(--teal)', sub: 'Каждый день', st: 11, done: false, w: [1, 1, 1, 1, 1] },
  { id: 'eng', n: 'Английский', g: 'День', hue: 'var(--accent)', sub: 'По будням', st: 2, done: false, w: [1, 1, 0, 1, 1] },
  { id: 'rd', n: 'Читать 20 страниц', g: 'Вечер', hue: 'var(--amber)', sub: 'Каждый день', st: 4, done: false, w: [0, 1, 1, 1, 1] },
  { id: 'ph', n: 'Без телефона после 23:00', g: 'Вечер', hue: 'var(--violet)', sub: 'Каждый день', st: 0, done: false, w: [1, 0, 0, 1, 0] },
];

/** One habit row. `live` makes the check a real toggle button. */
export function rowHTML(h, live) {
  const med = h.id === 'med';
  const check = live
    ? `<button class="p-check" type="button" aria-pressed="${h.done}" aria-label="${h.n}"><i>${use('check')}</i></button>`
    : `<span class="p-check"><i>${use('check')}</i></span>`;
  const streak = med
    ? ''
    : `<span class="stw" style="display:${h.st ? 'inline-flex' : 'none'};align-items:center;gap:3px">${use('flame')}<span class="st">${h.st}</span>&nbsp;</span>`;
  const dots = h.w.map((x) => `<i class="${x ? 'd' : ''}"></i>`).join('');
  return (
    `<div class="p-row${h.done ? ' done' : ''}" style="--hue:${h.hue}" data-h="${h.id}">${check}` +
    `<div class="main"><div class="nm">${h.n}</div><div class="sub">${streak}${h.sub}</div></div>` +
    `<span class="dots">${dots}<i class="t"></i></span></div>`
  );
}

/** Concentric day rings: habits (accent), workout (teal), focus (amber). */
export function rings(done, total) {
  const R = [
    [40, 'var(--accent)', done / total],
    [29, 'var(--teal)', 0],
    [18, 'var(--amber)', 0.5],
  ];
  const body = R.map(([r, col, v], i) => {
    const c = 2 * Math.PI * r;
    return (
      `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${col}" stroke-opacity=".18" stroke-width="9"/>` +
      `<circle class="rg${i}" cx="50" cy="50" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - v)).toFixed(1)}" transform="rotate(-90 50 50)"/>`
    );
  }).join('');
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
}

/** The whole Today screen inside a .phone: status bar, rings, grouped rows, module card, tab bar. */
export function todayHTML(list, live) {
  const done = list.filter((h) => h.done).length;
  let html =
    '<div class="p-status"><span>9:41</span><span class="isl"></span><span class="bars"><i></i><i></i><i></i><b></b></span></div><div class="p-scroll">' +
    '<div class="p-head"><div><small>Понедельник, 6 октября</small><h3>Сегодня</h3></div><span class="p-ava">Н</span></div>' +
    `<div class="p-sum">${rings(done, list.length)}<div class="p-legend">` +
    `<div><i style="background:var(--accent)"></i>Привычки<b class="cnt">${done}</b><small>из ${list.length}</small></div>` +
    '<div><i style="background:var(--teal)"></i>Тренировка<b>0</b><small>из 1</small></div>' +
    '<div><i style="background:var(--amber)"></i>Фокус<b>25</b><small>из 50</small></div></div></div>';
  ['Утро', 'День', 'Вечер'].forEach((g) => {
    const rows = list.filter((h) => h.g === g);
    html += `<div class="p-sec">${g}<span>${rows.length}</span></div><div class="p-group">${rows.map((h) => rowHTML(h, live)).join('')}</div>`;
  });
  html +=
    `<div class="p-sec">Модули</div><div class="p-modcard"><span class="p-ic" style="background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal)">${use('dumb')}</span>` +
    '<div class="tt"><small>Тренировка сегодня ›</small><b>Ноги</b></div><span class="p-pill" style="background:var(--teal);color:#fff;display:grid;place-items:center">Начать</span></div>' +
    `</div><div class="p-tabbar lg"><span class="p-tab on">${use('home')}Сегодня</span><span class="p-tab">${use('chart')}Прогресс</span><span class="p-tab">${use('grid')}Модули</span></div>` +
    `<span class="p-plus lg">${use('plus')}</span>`;
  return html;
}

/** Stamps "День закрыт" over `host` (positioned) for 2.3s. */
export function seal(host) {
  if (host.querySelector('.seal-wrap')) return;
  const w = document.createElement('div');
  w.className = 'seal-wrap';
  const cols = ['var(--accent)', 'var(--amber)', 'var(--teal)'];
  let sp = '';
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 105 + (i % 3) * 18;
    sp += `<i class="sp" style="--dx:${Math.round(Math.cos(a) * r)}px;--dy:${Math.round(Math.sin(a) * r)}px;background:${cols[i % 3]}"></i>`;
  }
  // Unique path id: two seals (hero + evening panel) can be on the page at once.
  const pid = `sealc${(seal.n = (seal.n || 0) + 1)}`;
  w.innerHTML =
    `<div class="seal">${sp}<svg viewBox="0 0 176 176" aria-hidden="true"><defs><path id="${pid}" d="M88,88 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0"/></defs>` +
    '<circle cx="88" cy="88" r="84" fill="var(--accent)"/><circle cx="88" cy="88" r="76" fill="none" stroke="var(--on)" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="3 4"/>' +
    `<text font-family="JetBrains Mono,monospace" font-size="11" letter-spacing="3" fill="var(--on)"><textPath href="#${pid}">ДЕНЬ ЗАКРЫТ · 6 ОКТЯБРЯ · ALMANAC ·</textPath></text>` +
    '<path d="M64 90l16 16 32-34" fill="none" stroke="var(--on)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
  host.appendChild(w);
  vib();
  setTimeout(() => w.remove(), 2350);
}

/** Reflection moods: labels and face colours, worst to best. */
export const MOOD = ['Тяжело', 'Так себе', 'Норм', 'Хорошо', 'Отлично'];
export const MOODC = ['#8C6BB5', '#6B8FD8', '#9A9AA0', '#3FB8A8', '#E0AA45'];

/** Mood face i (1..5) filled with `col`. */
export function face(i, col) {
  const ink = 'rgba(20,16,12,.78)';
  const eyes =
    i === 5
      ? '<path d="M11 17q3-3.5 6 0M23 17q3-3.5 6 0" fill="none"/>'
      : `<circle cx="14.5" cy="17" r="2.2" stroke="none" fill="${ink}"/><circle cx="25.5" cy="17" r="2.2" stroke="none" fill="${ink}"/>`;
  const mouth = ['M13 29.5q7-7 14 0', 'M14 28.5q6-3.5 12 0', 'M14.5 27h11', 'M13 24.5q7 6 14 0', 'M12 23.5q8 9.5 16 0z'][i - 1];
  const brow = i === 1 ? '<path d="M11 12.5l5 2M29 12.5l-5 2" fill="none"/>' : '';
  return (
    `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="${col}"/>` +
    `<g stroke="${ink}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${eyes}${brow}<path d="${mouth}" fill="${i === 5 ? ink : 'none'}"/></g></svg>`
  );
}
