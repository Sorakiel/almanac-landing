function detectPlatform() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/mac/i.test(ua)) return 'macos';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
  return 'windows';
}

/** Install modal: OS-detected tab (Android / Windows / macOS / Linux / iOS), open/close via triggers, backdrop, close button, Escape. */
export function initInstallModal() {
  const modal = document.getElementById('installModal');
  const tabs = modal.querySelectorAll('.im-tab');
  const bodies = modal.querySelectorAll('.im-body');

  function setTab(name) {
    tabs.forEach((t) => t.classList.toggle('active', t.getAttribute('data-tab') === name));
    bodies.forEach((b) => b.classList.toggle('active', b.getAttribute('data-panel') === name));
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
