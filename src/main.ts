import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import fr from '../public/locales/fr.json';
import en from '../public/locales/en.json';
import recommendationsData from './data/recommendations.json';

import { applyTranslations, getInitialLang, saveLang, type Dictionary, type Lang } from './scripts/i18n';
import { renderRecommendations } from './scripts/recommendations';
import { initHeroShader } from './scripts/shader';
import { initScrollAnimations, playIntro, prefersReducedMotion } from './scripts/animations';
import { initAccordion, initCursor, initLetterHover, initMagnetic, initNav } from './scripts/interactions';

gsap.registerPlugin(ScrollTrigger);

const dictionaries: Record<Lang, Dictionary> = { fr, en };
let lang: Lang = getInitialLang();
const dict = () => dictionaries[lang];

function renderContent() {
  applyTranslations(lang, dict());
  renderRecommendations(document.querySelector('.recos__list'), recommendationsData, {
    more: dict().rec_more,
    less: dict().rec_less,
  });
}

function boot() {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  renderContent();

  /* Smooth scroll driven by the GSAP ticker */
  const lenis = new Lenis({ duration: 1.2, smoothWheel: !prefersReducedMotion() });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  const shader = initHeroShader(document.querySelector('.hero__canvas')!, prefersReducedMotion());
  const nav = initNav(lenis);
  nav.setLabels(dict().menu_btn, dict().menu_close);
  initCursor(dict);
  initMagnetic();
  initAccordion();

  let scrollCtx: gsap.Context | null = null;

  playIntro(() => {
    lenis.start();
    scrollCtx = initScrollAnimations(shader);
    initLetterHover();
    ScrollTrigger.refresh();
  });

  /* Language switch: curtain down → swap texts → rebuild triggers → curtain up */
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  document.body.appendChild(curtain);

  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.lang as Lang;
      if (next === lang || document.body.classList.contains('is-loading')) return;
      gsap.timeline()
        .set(curtain, { transformOrigin: 'bottom' })
        .to(curtain, { scaleY: 1, duration: 0.7, ease: 'expo.inOut' })
        .add(() => {
          // Remember where we are relative to the section in view, not in raw pixels:
          // reverting the pinned section changes the page height.
          const sections = Array.from(document.querySelectorAll<HTMLElement>('main > section'));
          const anchor = sections.find((s) => s.getBoundingClientRect().bottom > 0) ?? sections[0];
          const offset = -anchor.getBoundingClientRect().top;

          scrollCtx?.revert();
          lang = next;
          saveLang(lang);
          renderContent();
          nav.setLabels(dict().menu_btn, dict().menu_close);
          scrollCtx = initScrollAnimations(shader);
          ScrollTrigger.refresh();
          lenis.resize();
          const y = anchor.getBoundingClientRect().top + window.scrollY + offset;
          lenis.scrollTo(y, { immediate: true, force: true });
          ScrollTrigger.update();
          // Everything above the fold is already "seen": jump reveals to their end state
          ScrollTrigger.getAll().forEach((st) => {
            if (st.start < y + window.innerHeight * 0.5 && !st.vars.scrub && st.animation) st.animation.progress(1);
          });
        })
        .set(curtain, { transformOrigin: 'top' })
        .add(() => document.querySelector('.nav')?.classList.remove('is-hidden'))
        .to(curtain, { scaleY: 0, duration: 0.9, ease: 'expo.inOut' }, '+=0.1');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
