import './style.css';
import { initTheme } from './scripts/theme';
import { initI18n } from './scripts/i18n';
import { initMenu } from './scripts/menu';
import { initAnimations } from './scripts/animations';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Load translations
import fr from '../public/locales/fr.json';
import en from '../public/locales/en.json';

const translations: any = { fr, en };

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Smooth Scroll
  const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
  });

  // Link ScrollTrigger to Lenis
  lenis.on('scroll', ScrollTrigger.update);

  // Sync GSAP ticker with Lenis
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Initialize Modules
  const initialLang = 'fr';
  const i18n = initI18n(initialLang, translations);
  initTheme();
  initMenu(lenis, translations, initialLang);
  initAnimations(lenis, translations, initialLang);

  // Set initial language
  i18n.setLanguage(initialLang);
  
  // Final refresh to ensure all triggers are correctly positioned
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 500);
});
