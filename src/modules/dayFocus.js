import { reduced } from './env.js';
import { fmt, visible } from './fx.js';

const DURATIONS = [15, 25, 45, 60];
// The demo starts part-way through a session so the sand is already piling up.
const START_LEFT = 0.58;
const R = 104;
const C = 2 * Math.PI * R;

function hex(v, fallback) {
  const m = /^#([0-9a-f]{6})$/i.exec((v || '').trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mix = (a, b, t) => `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',')})`;

/** 13:10 — focus dial with an hourglass of sand filling inside it. */
export function initFocus() {
  const dial = document.getElementById('dial');
  const svg = document.getElementById('dialSvg');
  const time = document.getElementById('fcTime');
  const durs = document.getElementById('durs');
  const cv = document.getElementById('sand');
  const f = { dur: 25, left: 25 * 60 * START_LEFT };

  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const r2 = i % 5 ? 112 : 108;
    ticks += `<line x1="${(120 + Math.sin(a) * 116).toFixed(1)}" y1="${(120 - Math.cos(a) * 116).toFixed(1)}" x2="${(120 + Math.sin(a) * r2).toFixed(1)}" y2="${(120 - Math.cos(a) * r2).toFixed(1)}" stroke="var(--ink3)" stroke-width="${i % 5 ? 1 : 1.8}"/>`;
  }
  svg.innerHTML = `${ticks}<circle cx="120" cy="120" r="${R}" fill="none" stroke="var(--accent)" stroke-opacity=".14" stroke-width="10"/><circle id="fcArc" cx="120" cy="120" r="${R}" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" transform="rotate(-90 120 120)" style="transition:stroke-dashoffset 1s linear"/>`;
  const arc = document.getElementById('fcArc');

  function paint() {
    time.textContent = fmt(f.left);
    arc.setAttribute('stroke-dashoffset', (C * (1 - f.left / (f.dur * 60))).toFixed(1));
  }
  function pick(d) {
    f.dur = d;
    f.left = d * 60 * START_LEFT;
    durs.querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.d === d));
    paint();
  }

  durs.innerHTML = DURATIONS.map((d) => `<button type="button" data-d="${d}" class="${d === 25 ? 'on' : ''}">${d} мин</button>`).join('');
  durs.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) pick(+b.dataset.d);
  });

  // The clock and the sand only run while the dial is on screen.
  let on = false;
  let timer = 0;
  let raf = 0;
  visible(dial, (v) => {
    on = v;
    clearInterval(timer);
    cancelAnimationFrame(raf);
    if (!v) return;
    timer = setInterval(() => {
      f.left -= 1;
      if (f.left <= 0) f.left = f.dur * 60;
      paint();
    }, 1000);
    raf = requestAnimationFrame(frame);
  });
  paint();

  const sd = { grains: [], rollers: [], lvl: null, peak: 0, size: 0, dots: null, col: null, frame: 0 };
  function colours() {
    const cs = getComputedStyle(cv);
    const amb = hex(cs.getPropertyValue('--amber'), [224, 170, 69]);
    const acc = hex(cs.getPropertyValue('--accent'), [239, 136, 87]);
    sd.col = {
      hi: mix(amb, [255, 255, 255], 0.35),
      top: mix(amb, [255, 255, 255], 0.12),
      mid: mix(amb, acc, 0.35),
      deep: mix(amb, acc, 0.8),
      grain: mix(amb, [255, 255, 255], 0.2),
      dark: mix(acc, [40, 20, 10], 0.45),
    };
  }

  function frame() {
    if (!on) return;
    raf = requestAnimationFrame(frame);
    const S = cv.clientWidth;
    if (!S) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    // Re-read the palette now and then so a theme switch reaches the sand.
    if (!sd.col || sd.frame++ % 60 === 0) colours();
    if (sd.size !== S) {
      sd.size = S;
      cv.width = S * dpr;
      cv.height = S * dpr;
      sd.dots = [];
      for (let i = 0; i < Math.round((S * S) / 55); i++) {
        sd.dots.push([Math.random() * S, Math.random() * S, Math.random() < 0.5 ? 0 : 1, Math.random() * 0.9 + 0.4]);
      }
    }
    const ctx = cv.getContext('2d');
    const c = S / 2;
    const k = sd.col;
    const target = 0.1 + 0.72 * (1 - f.left / (f.dur * 60));
    const flow = !reduced;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);
    sd.lvl = sd.lvl == null ? target : sd.lvl + (target - sd.lvl) * 0.06;
    sd.peak += ((flow ? 0.075 : 0.04) * S - sd.peak) * 0.04;
    const base = S * (1 - sd.lvl);
    const w = 0.26 * S;
    const surf = (x) => {
      const d = (x - c) / w;
      return base - sd.peak * Math.exp(-d * d);
    };

    if (flow) {
      for (let n = 0; n < 3; n++) {
        sd.grains.push({ x: c + (Math.random() - 0.5) * 2.4, y: -2 - Math.random() * 6, vx: (Math.random() - 0.5) * 0.12, vy: 1.2 + Math.random() * 0.8, r: Math.random() * 0.7 + 0.7 });
      }
      ctx.strokeStyle = k.grain;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(c, 0);
      ctx.lineTo(c, surf(c) - 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.beginPath();
    ctx.moveTo(0, S);
    for (let x = 0; x <= S; x += 2) ctx.lineTo(x, surf(x));
    ctx.lineTo(S, S);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, base - sd.peak, 0, S);
    g.addColorStop(0, k.top);
    g.addColorStop(0.45, k.mid);
    g.addColorStop(1, k.deep);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.save();
    ctx.clip();
    for (const d of sd.dots) {
      if (d[1] < surf(d[0]) - 1) continue;
      ctx.fillStyle = d[2] ? k.hi : k.dark;
      ctx.globalAlpha = d[2] ? 0.55 : 0.22;
      ctx.fillRect(d[0], d[1], d[3], d[3]);
    }
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = k.dark;
    ctx.lineWidth = 1;
    for (let L = 1; L < 4; L++) {
      ctx.beginPath();
      for (let x = 0; x <= S; x += 4) {
        const y = surf(x) + L * S * 0.07 + Math.sin((x / S) * 6 + L * 2) * 2;
        if (x) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    ctx.beginPath();
    for (let x = 0; x <= S; x += 2) {
      if (x) ctx.lineTo(x, surf(x));
      else ctx.moveTo(x, surf(x));
    }
    ctx.strokeStyle = k.hi;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = k.grain;
    sd.grains = sd.grains.filter((p) => {
      p.vy += 0.22;
      p.x += p.vx;
      p.y += p.vy;
      if (p.y >= surf(p.x)) {
        if (Math.random() < 0.35) sd.rollers.push({ x: p.x, dir: Math.random() < 0.5 ? -1 : 1, v: 0.6 + Math.random() * 1.2, life: 18 + Math.random() * 30, r: p.r });
        return false;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.3);
      ctx.fill();
      return true;
    });
    ctx.fillStyle = k.hi;
    sd.rollers = sd.rollers.filter((r) => {
      r.x += r.dir * r.v;
      r.v *= 0.97;
      r.life--;
      if (r.life <= 0) return false;
      ctx.globalAlpha = Math.min(1, r.life / 12);
      ctx.beginPath();
      ctx.arc(r.x, surf(r.x) - r.r * 0.6, r.r, 0, 6.3);
      ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    });
  }

  return { pick };
}
