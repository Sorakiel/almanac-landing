// Styles are linked directly from index.html's <head>, not imported here —
// see src/styles/index.css for why (avoids a flash of unstyled content).

import { mountLogos } from './modules/logo.js';
import { initTheme } from './modules/theme.js';
import { initScroll } from './modules/scroll.js';
import { initReveal } from './modules/reveal.js';
import { initHero } from './modules/hero.js';
import { initInstallModal } from './modules/installModal.js';
import { initPlatformDownloads } from './modules/platformDownloads.js';
import { initFaq } from './modules/faq.js';
import { initYear } from './modules/year.js';
import { initManifesto } from './modules/manifesto.js';
import { initDay } from './modules/day.js';

// Logo placeholders first: scenes measure their layout and logos are part of it.
mountLogos();
initTheme();

// Scene modules register with scroll.js here, one import + init per scene (PR 2-7).
initHero();
initYear();
initManifesto();
initDay();

initReveal();
initScroll();
initInstallModal();
initPlatformDownloads();
initFaq();
