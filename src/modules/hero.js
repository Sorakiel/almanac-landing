import { $, $$, clamp, ease, lerp, odo, ripple, vib } from './fx.js';
import { register } from './scroll.js';
import { HABITS, MOODC, face, seal, todayHTML } from './today.js';

/**
 * Scene 2: the headline, then the Today phone rises to the centre while eight
 * cards fly in from the edges and settle around it. The phone is live: check
 * every habit and the day gets sealed.
 */

const PHONE_W = 340;
const PHONE_H = 712;
const FLOAT_RING = 106.8; // circumference of the small ring on the "Привычки сегодня" card

function initPhone(phone) {
  const habits = HABITS.map((h) => ({ ...h }));
  phone.innerHTML = todayHTML(habits, true);
  $('#fFaces').innerHTML = [3, 4, 5]
    .map((i) => face(i, MOODC[i - 1]).replace('<svg ', `<svg class="${i === 4 ? 'on' : ''}" `))
    .join('');

  const fDone = $('#fDone');
  const fRing = $('#fRing');
  const fStreak = $('#fStreak');
  const hint = $('#heroHint');
  const cnt = phone.querySelector('.cnt');
  const ring = phone.querySelector('.rg0');
  const ringC = 2 * Math.PI * 40;

  phone.addEventListener('click', (e) => {
    const b = e.target.closest('.p-check');
    if (!b) return;
    const row = b.closest('.p-row');
    const h = habits.find((x) => x.id === row.dataset.h);
    h.done = !h.done;
    vib();
    row.classList.toggle('done', h.done);
    b.setAttribute('aria-pressed', h.done);
    if (h.done) ripple(b);

    const st = row.querySelector('.st');
    if (st) {
      const from = h.st;
      h.st = Math.max(0, h.st + (h.done ? 1 : -1));
      st.parentNode.style.display = h.st ? 'inline-flex' : 'none';
      odo(st, from, h.st);
    }

    const done = habits.filter((x) => x.done).length;
    const all = done === habits.length;
    ring.setAttribute('stroke-dashoffset', (ringC * (1 - done / habits.length)).toFixed(1));
    odo(cnt, +cnt.textContent, done);
    odo(fDone, +fDone.textContent, done);
    fRing.setAttribute('stroke-dashoffset', (FLOAT_RING * (1 - done / habits.length)).toFixed(1));
    if (all) odo(fStreak, 12, 13);
    hint.innerHTML = all
      ? '<i aria-hidden="true"></i><b>День закрыт.</b> Так выглядит хорошее утро'
      : '<i aria-hidden="true"></i><b>Попробуйте:</b> отметьте все привычки';
    if (all) setTimeout(() => seal(phone), 350);
  });
}

export function initHero() {
  const hero = $('#hero');
  if (!hero) return;
  const copy = $('#heroCopy');
  const wrap = $('#heroPhoneWrap');
  const phone = $('#heroPhone');
  const hint = $('#heroHint');
  const cue = $('#cue');
  const floats = $$('.float', hero).map((el) => ({ el, d: el.dataset.f.split(',').map(Number), w: 0 }));

  initPhone(phone);

  // Cached on resize: the bottom of the headline block, where the phone starts,
  // and the stage height. The stage is 100svh, so on iOS it stays put while the
  // toolbar collapses; innerHeight would move the phone on every collapse.
  let copyBottom = 0;
  let stageH = 0;
  let heroH = 0;
  const stage = hero.firstElementChild;
  // Floats only move while fe changes (or after a re-measure); past the end of
  // the fly-in nothing is written.
  let lastFe = -1;

  register({
    el: hero,
    measure() {
      copyBottom = copy.offsetTop + copy.offsetHeight;
      stageH = stage.offsetHeight;
      heroH = hero.offsetHeight;
      // Card widths for the phone's edge clamp; hidden cards measure 0 and are skipped.
      for (const f of floats) f.w = f.el.offsetWidth;
      lastFe = -1;
    },
    frame({ vw, reduced }) {
      if (reduced) return;
      const vh = stageH;
      const range = heroH - vh;
      const p = range > 0 ? clamp(-hero.getBoundingClientRect().top / range, 0, 1) : 0;
      const e = ease(clamp(p / 0.8, 0, 1));
      const narrow = vw < 700;
      // Phones: narrower (70% of the width) so the cards can sit on its corners,
      // and never taller than the space under the nav (64px top, 12px bottom).
      const s = narrow
        ? Math.min(1, (vw * 0.7) / PHONE_W, (vh - 76) / PHONE_H)
        : Math.min(1, (vh - 56) / PHONE_H);
      const pW = PHONE_W * s;
      const pH = PHONE_H * s;

      copy.style.transform = `translateY(${-e * 180}px) scale(${1 - e * 0.08})`;
      copy.style.opacity = clamp(1 - p * 3, 0, 1);
      copy.style.pointerEvents = p > 0.3 ? 'none' : '';

      const y0 = Math.max(vh * 0.55, Math.min(copyBottom + 28, vh - 140));
      const y1 = Math.max(64, (vh - pH) / 2);
      wrap.style.transform = `translateY(${lerp(y0, y1, e)}px)`;
      phone.style.transform = `scale(${s * lerp(0.9, 1, e)}) rotateX(${lerp(30, 0, e)}deg)`;

      // Card positions are fractions of the phone's half-size; they fly from
      // the far value (x0,y0) to the resting one (x1,y1). On a phone the four
      // visible cards land on the phone's corners like stickers, keep 30% of
      // their tilt and stay 8px inside the screen.
      const fe = ease(clamp((p - 0.04) / 0.72, 0, 1));
      if (fe !== lastFe) {
        lastFe = fe;
        const ux = Math.min(pW, vw * 0.3);
        const uy = pH / 2;
        const sc = narrow ? 0.74 : 1;
        for (const { el, d, w } of floats) {
          let x = lerp(d[2], d[0], fe) * ux;
          const y = lerp(d[3], narrow ? (d[1] < 0 ? -0.9 : 0.84) : d[1], fe) * uy;
          const rot = lerp(d[4], narrow ? d[4] * 0.3 : 0, fe);
          if (narrow && w) {
            const lim = vw / 2 - (w * sc) / 2 - 8;
            x = clamp(x, -lim, lim);
          }
          el.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px) rotate(${rot}deg) scale(${sc})`;
          el.style.opacity = clamp(fe * 1.6, 0, 1);
          // A per-frame blur on the cards is what made iOS stutter; phones fade only.
          el.style.filter = narrow ? '' : `blur(${((1 - fe) * 6).toFixed(1)}px)`;
        }
      }

      hint.style.opacity = p > 0.82 ? 1 : 0;
      cue.style.opacity = p < 0.04 ? 1 : 0;
    },
  });
}
