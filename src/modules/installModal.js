function detectPlatform() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/mac/i.test(ua)) return 'macos';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
  return 'windows';
}

const SWITCH_MS = 200; // matches .im-body's opacity transition duration

/** Install modal: OS-detected tab (Android / Windows / macOS / Linux / iOS), open/close via triggers, backdrop, close button, Escape. */
export function initInstallModal() {
  const modal = document.getElementById('installModal');
  const tabs = modal.querySelectorAll('.im-tab');
  const bodies = modal.querySelectorAll('.im-body');
  let pendingSwitch = null;
  let pendingCleanup = null;

  function setTab(name) {
    const nextBody = [...bodies].find((b) => b.getAttribute('data-panel') === name);
    if (!nextBody || nextBody.classList.contains('active')) return;

    // A second click before the previous switch finished: settle it instantly
    // instead of leaving a stale "leaving" panel stacked underneath.
    if (pendingSwitch) {
      clearTimeout(pendingSwitch);
      pendingCleanup();
      pendingSwitch = null;
      pendingCleanup = null;
    }

    tabs.forEach((t) => t.classList.toggle('active', t.getAttribute('data-tab') === name));

    const stack = nextBody.parentElement;
    const currentBody = [...bodies].find((b) => b !== nextBody && b.classList.contains('active'));

    if (!currentBody) {
      nextBody.classList.add('active');
      // A single rAF here is NOT enough: `active` and the rAF callback both
      // get queued in the same click-handler tick, so the browser runs the
      // callback before it ever paints the "active, not yet entered" (opacity
      // 0) frame — the transition has no real starting frame to animate from
      // and just snaps to its end state. Reading a layout property forces a
      // synchronous style flush, which *does* commit that in-between state,
      // giving the next class change something real to transition from.
      void nextBody.offsetHeight;
      nextBody.classList.add('entered');
      return;
    }

    // Lock the stack to the outgoing panel's current height, then pull it out
    // of flow — the incoming panel becomes the only thing in flow, so it
    // renders at its own natural height immediately, and both panels can
    // fade in the same spot at once instead of one after the other.
    stack.style.height = `${currentBody.offsetHeight}px`;
    currentBody.classList.add('leaving');
    currentBody.classList.remove('entered');
    nextBody.classList.add('active');

    const nextHeight = nextBody.offsetHeight; // same forced-flush purpose as above
    nextBody.classList.add('entered');
    stack.style.height = `${nextHeight}px`;

    pendingCleanup = () => {
      currentBody.classList.remove('active', 'leaving');
      stack.style.height = '';
    };
    pendingSwitch = window.setTimeout(() => {
      pendingCleanup();
      pendingSwitch = null;
      pendingCleanup = null;
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
