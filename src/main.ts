import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { fr } from './content/fr';
import { en } from './content/en';
import type { Content, Lang } from './content/types';
import recommendations from './data/recommendations.json';
import { renderHeader, renderMain, renderSheet } from './render';
import { initHeroShader } from './motion/shader';
import { playIntro } from './motion/intro';
import { initScroll } from './motion/scroll';
import { bindMagnetic, bindNav, bindRecos, bindSkills, initCursor } from './motion/interactions';

gsap.registerPlugin(ScrollTrigger);

const CONTENT: Record<Lang, Content> = { fr, en };
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'fr' || saved === 'en') return saved;
  } catch { /* storage unavailable */ }
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

let lang: Lang = initialLang();
const header = document.querySelector<HTMLElement>('.nav')!;
const sheet = document.querySelector<HTMLElement>('.sheet')!;
const app = document.querySelector<HTMLElement>('#app')!;

/* The WebGL canvas survives re-renders: it is moved into each new hero. */
const canvas = document.createElement('canvas');

function render() {
  const c = CONTENT[lang];
  document.documentElement.lang = lang;
  document.title = c.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', c.meta.description);
  header.innerHTML = renderHeader(c, lang);
  sheet.innerHTML = renderSheet(c);
  app.innerHTML = renderMain(c, recommendations);
  app.querySelector('.hero__media')?.appendChild(canvas);
}

function boot() {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  render();

  const lenis = new Lenis({ duration: 1.2, smoothWheel: !reduced });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  const shader = initHeroShader(canvas, reduced);
  initCursor();

  let scrollCtx: gsap.Context | null = null;
  let bindCtx: gsap.Context | null = null;
  let abort = new AbortController();

  const bindAll = () => {
    const c = CONTENT[lang];
    scrollCtx = initScroll(shader);
    // Created after the pins so their positions are right
    bindCtx = gsap.context(() => {
      bindNav(lenis, { menu: c.nav.menu, close: c.nav.close }, abort.signal);
      bindSkills(abort.signal);
      bindRecos(reduced, abort.signal);
      bindMagnetic(abort.signal);
    });
    header.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((b) =>
      b.addEventListener('click', () => switchLang(b.dataset.lang as Lang), { signal: abort.signal }),
    );
    ScrollTrigger.refresh();
  };

  /* Language switch: curtain down → re-render → rebuild motion → curtain up */
  const curtain = document.querySelector<HTMLElement>('.curtain')!;
  let switching = false;
  function switchLang(next: Lang) {
    if (next === lang || switching) return;
    switching = true;
    gsap.timeline({ onComplete: () => { switching = false; } })
      .set(curtain, { transformOrigin: 'bottom' })
      .to(curtain, { scaleY: 1, duration: 0.75, ease: 'expo.inOut' })
      .add(() => {
        const sections = Array.from(app.querySelectorAll<HTMLElement>(':scope > section, :scope > .pin-spacer > section'));
        const anchorIdx = Math.max(0, sections.findIndex((s) => s.getBoundingClientRect().bottom > 1));
        const offset = -(sections[anchorIdx]?.getBoundingClientRect().top ?? 0);

        abort.abort();
        bindCtx?.revert();
        scrollCtx?.revert();
        abort = new AbortController();
        lang = next;
        try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
        render();
        bindAll();

        const target = Array.from(app.querySelectorAll<HTMLElement>('section'))[anchorIdx];
        lenis.resize();
        const y = target ? target.getBoundingClientRect().top + window.scrollY + offset : 0;
        lenis.scrollTo(y, { immediate: true, force: true });
        ScrollTrigger.update();
        // Reveals above the reading line have already been "seen"
        ScrollTrigger.getAll().forEach((st) => {
          if (!st.vars.scrub && st.animation && st.start < y + window.innerHeight * 0.6) st.animation.progress(1);
        });
        header.classList.remove('is-hidden');
      })
      .set(curtain, { transformOrigin: 'top' })
      .to(curtain, { scaleY: 0, duration: 0.95, ease: 'expo.inOut' }, '+=0.1');
  }

  playIntro({
    roles: CONTENT[lang].intro.roles,
    caption: CONTENT[lang].intro.caption,
    reduced,
    onReveal: () => {
      lenis.start();
      bindAll();
    },
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
