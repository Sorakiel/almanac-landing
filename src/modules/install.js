// Install sheet v2: platform tabs with a sliding indicator, animated height, lazy QR codes, copy toast.
import { reduced } from './env.js';
import { logoSVG } from './logo.js';
import { guessPlatform } from './platform.js';

const CLOSE_MS = 240; // sheetOut .25s
const HEIGHT_MS = 420; // body height transition .35s + a frame of slack
const TOAST_MS = 1600;
const TOAST_FALLBACK_MS = 3000;
const QR_HOLE_FROM = 0.39; // modules under the centre logo are left out
const QR_HOLE_TO = 0.61;

async function drawQRs(sheet) {
  let qrcode;
  try {
    ({ default: qrcode } = await import('qrcode-generator'));
  } catch {
    sheet.querySelectorAll('.qr[data-qr]').forEach((box) => {
      box.classList.add('fail');
      box.textContent = 'Код не загрузился. Используйте кнопку справа.';
    });
    return;
  }
  sheet.querySelectorAll('.qr[data-qr]').forEach((box) => {
    const url = box.dataset.qr;
    const q = qrcode(0, 'H');
    q.addData(url);
    q.make();
    const n = q.getModuleCount();
    const c0 = n * QR_HOLE_FROM;
    const c1 = n * QR_HOLE_TO;
    let rects = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!q.isDark(r, c)) continue;
        if (r > c0 && r < c1 && c > c0 && c < c1) continue;
        rects += `<rect x="${c + 0.06}" y="${r + 0.06}" width=".88" height=".88" rx=".3"/>`;
      }
    }
    box.innerHTML =
      `<svg viewBox="0 0 ${n} ${n}" fill="#1A1206" role="img" aria-label="QR-код: ${url}">${rects}</svg>` +
      `<span class="qr-logo">${logoSVG('plain')}</span>` +
      (reduced ? '' : '<span class="scan" aria-hidden="true"></span>');
  });
}

export function initInstall() {
  const wrap = document.getElementById('sheet');
  if (!wrap) return;
  const sheet = wrap.querySelector('.sheet');
  const seg = document.getElementById('seg');
  const ind = document.getElementById('segInd');
  const body = document.getElementById('sheetBody');
  const toast = document.getElementById('copied');
  const tabs = [...seg.querySelectorAll('[role="tab"]')];
  const panes = [...wrap.querySelectorAll('.pane')];
  let lastFocus = null;
  let qrDone = false;
  let heightTimer = 0;
  let toastTimer = 0;

  const plat = guessPlatform();
  tabs.forEach((t) => t.classList.toggle('you', t.dataset.p === plat));

  const moveIndicator = () => {
    const on = seg.querySelector('[aria-selected="true"]');
    if (!on) return;
    ind.style.transform = `translateX(${on.offsetLeft}px)`;
    ind.style.width = `${on.offsetWidth}px`;
  };

  const select = (p, animate) => {
    const h0 = body.offsetHeight;
    tabs.forEach((t) => {
      const on = t.dataset.p === p;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panes.forEach((x) => {
      x.hidden = x.dataset.pane !== p;
    });
    moveIndicator();
    if (!animate || reduced || !h0) return;
    const h1 = body.scrollHeight;
    body.style.height = `${h0}px`;
    void body.offsetWidth; // commit the start height before transitioning
    body.style.height = `${h1}px`;
    clearTimeout(heightTimer);
    heightTimer = setTimeout(() => {
      body.style.height = '';
    }, HEIGHT_MS);
  };

  const open = (p) => {
    lastFocus = document.activeElement;
    wrap.hidden = false;
    wrap.classList.remove('closing');
    sheet.classList.remove('closing');
    document.body.style.overflow = 'hidden';
    select(p || plat, false);
    requestAnimationFrame(moveIndicator);
    if (!qrDone) {
      qrDone = true;
      drawQRs(wrap);
    }
    setTimeout(() => seg.querySelector('[aria-selected="true"]')?.focus(), 50);
  };

  const close = () => {
    if (wrap.hidden) return;
    wrap.classList.add('closing');
    sheet.classList.add('closing');
    setTimeout(() => {
      wrap.hidden = true;
      document.body.style.overflow = '';
      lastFocus?.focus?.();
    }, CLOSE_MS);
  };

  const showToast = (text, ms) => {
    toast.textContent = text;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('on'), ms);
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-install]');
    if (trigger) {
      e.preventDefault();
      open(trigger.dataset.install);
      return;
    }
    if (wrap.hidden) return;
    if (e.target.closest('[data-close]')) return close();
    const t = e.target.closest('#seg [role="tab"]');
    if (t) return select(t.dataset.p, true);
    const copy = e.target.closest('[data-copy]');
    if (!copy) return;
    const txt = copy.dataset.copy;
    const label = /^chmod/.test(txt) ? 'Команда скопирована' : 'Ссылка скопирована';
    // No clipboard (insecure context, denied permission): show the text so it can be copied by hand.
    navigator.clipboard?.writeText(txt).then(
      () => showToast(label, TOAST_MS),
      () => showToast(txt, TOAST_FALLBACK_MS),
    ) ?? showToast(txt, TOAST_FALLBACK_MS);
  });

  document.addEventListener('keydown', (e) => {
    if (wrap.hidden) return;
    if (e.key === 'Escape') return close();
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && document.activeElement?.closest('#seg')) {
      const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      select(next.dataset.p, true);
      next.focus();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = [...sheet.querySelectorAll('button,a[href]')].filter((x) => x.offsetParent && x.tabIndex !== -1);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });

  addEventListener('resize', moveIndicator);
}
