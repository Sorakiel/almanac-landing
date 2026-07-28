/** Install modal: OS-detected tab, open/close via triggers, backdrop, close button, and Escape. */
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
    const isAndroid = /android/i.test(navigator.userAgent);
    setTab(isAndroid ? 'android' : 'other');
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
