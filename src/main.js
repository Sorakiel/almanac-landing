import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';
import './styles/modal.css';

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

const scatterGrid = buildScatterGrid();
const updateRing = initHeroDemo();

// The scatter-grid assembly and the hero ring are the page's first "orchestrated
// moment" — they start together, right as the preloader clears.
initPreloader(() => {
  assembleScatterGrid(scatterGrid);
  updateRing();
});

// The Boosty link isn't wired up yet — swap this for a real href once it exists.
document.getElementById('boostyLink').addEventListener('click', (e) => {
  e.preventDefault();
  alert('Ссылка на Boosty ещё не подключена — добавьте href в index.html.');
});
