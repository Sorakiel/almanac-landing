// Styles are linked directly from index.html's <head>, not imported here —
// see src/styles/index.css for why (avoids a flash of unstyled content).

import { initPreloader } from './modules/preloader.js';
import { initCursor } from './modules/cursor.js';
import { initMagnetic } from './modules/magnetic.js';
import { initNav } from './modules/nav.js';
import { initReveal } from './modules/reveal.js';
import { buildScatterGrid, assembleScatterGrid } from './modules/scatterGrid.js';
import { initHeroDemo } from './modules/heroDemo.js';
import { initManifesto } from './modules/manifesto.js';
import { initProductSection } from './modules/productSection.js';
import { initMarquee } from './modules/marquee.js';
import { initThemeFlip } from './modules/themeFlip.js';
import { initInstallModal } from './modules/installModal.js';
import { initPlatformDownloads } from './modules/platformDownloads.js';
import { initFaq } from './modules/faq.js';
import { initTicker } from './modules/ticker.js';

// Effects that don't depend on the preloader can start immediately.
initCursor();
initMagnetic();
initNav();
initReveal();
initManifesto();
initProductSection();
initMarquee();
initThemeFlip();
initInstallModal();
initPlatformDownloads();
initFaq();
initTicker();

const scatterGrid = buildScatterGrid();
const updateRing = initHeroDemo();

// The scatter-grid assembly and the hero ring are the page's first "orchestrated
// moment" — they start together, right as the preloader clears.
initPreloader(() => {
  assembleScatterGrid(scatterGrid);
  updateRing();
});
