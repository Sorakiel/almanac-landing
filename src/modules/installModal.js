function detectPlatform() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/mac/i.test(ua)) return 'macos';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
  return 'windows';
}

const SWITCH_MS = 220; // matches .im-body's opacity/transform transition duration

/** Install modal: OS-detected tab (Android / Windows / macOS / Linux / iOS), open/close via triggers, backdrop, close button, Escape. */
export function initInstallModal() {
  const modal = document.getElementById('installModal');
  const tabs = modal.querySelectorAll('.im-tab');
  const bodies = modal.querySelectorAll('.im-body');
  let pendingSwitch = null;

  function activate(body) {
    body.classList.add('active');
    // rAF so "active" (display:flex) paints at its resting opacity/transform
    // before "entered" flips them — otherwise the crossfade never plays.
    requestAnimationFrame(() => body.classList.add('entered'));
  }

  function setTab(name) {
    const nextBody = [...bodies].find((b) => b.getAttribute('data-panel') === name);
    if (!nextBody || nextBody.classList.contains('active')) return;

    tabs.forEach((t) => t.classList.toggle('active', t.getAttribute('data-tab') === name));

    if (pendingSwitch) {
      clearTimeout(pendingSwitch);
      pendingSwitch = null;
    }
    const currentBody = [...bodies].find((b) => b !== nextBody && b.classList.contains('active'));

    if (!currentBody) {
      activate(nextBody);
      return;
    }

    currentBody.classList.remove('entered');
    pendingSwitch = window.setTimeout(() => {
      currentBody.classList.remove('active');
      activate(nextBody);
      pendingSwitch = null;
    }, SWITCH_MS);
  }

  tabs.forEach((t) => t.addEventListener('click', () => setTab(t.getAttribute('data-tab'))));

  function open() {
    setTab(detectPlatform());
    modal.classList.add('open');
  }

  function close() {
    modal.classList.remove('open');
  }

  document.querySelectorAll('[data-open-install]').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.preventDefault(); open(); });
  });
  modal.querySelectorAll('[data-close-install]').forEach((btn) => btn.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
