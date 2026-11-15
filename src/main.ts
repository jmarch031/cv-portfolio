import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { fr } from './content/fr';
import { en } from './content/en';
import type { Content, Lang } from './content/types';
import recommendations from './data/recommendations.json';
import { renderHeader, renderMain, renderSheet } from './render';
import { AMBER, OXBLOOD, SAGE, TAN, createLiquid } from './motion/shader';
import { playIntro } from './motion/intro';
import { initScroll } from './motion/scroll';
import { bindMagnetic, bindNav, bindRecos, bindSkills, bindWorks, initCursor } from './motion/interactions';

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

type Theme = 'dark' | 'light';
const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

/* Liquid-light surfaces survive re-renders: their canvases are moved into each new section. */
const liquids = {
  hero: createLiquid({ palette: [SAGE, AMBER, OXBLOOD], lens: [0.78, 0.68, 0.46], scale: 1.5, reduced }),
  story: createLiquid({ palette: [SAGE, AMBER, OXBLOOD], lens: [0.74, 0.52, 0.34], scale: 1.7, reduced }),
  contact: createLiquid({ palette: [AMBER, OXBLOOD, TAN], lens: [0.18, 0.3, 0.38], scale: 1.4, reduced }),
};
const allLiquids = Object.values(liquids);
const setLiquidLight = (theme: Theme) => allLiquids.forEach((l) => { l.state.light = theme === 'light' ? 1 : 0; l.redraw(); });
setLiquidLight(currentTheme());

function render() {
  const c = CONTENT[lang];
  document.documentElement.lang = lang;
  document.title = c.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', c.meta.description);
  header.innerHTML = renderHeader(c, lang, currentTheme());
  sheet.innerHTML = renderSheet(c);
  app.innerHTML = renderMain(c, recommendations);
  app.querySelector('.hero__media')?.appendChild(liquids.hero.canvas);
  app.querySelector('.story__media')?.appendChild(liquids.story.canvas);
  app.querySelector('.contact__media')?.appendChild(liquids.contact.canvas);
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

  liquids.hero.setActive(true);
  initCursor();

  let scrollCtx: gsap.Context | null = null;
  let bindCtx: gsap.Context | null = null;
  let abort = new AbortController();

  const bindAll = () => {
    const c = CONTENT[lang];
    scrollCtx = initScroll(liquids);
    // Created after the pins so their positions are right
    bindCtx = gsap.context(() => {
      bindNav(lenis, { menu: c.nav.menu, close: c.nav.close }, abort.signal);
      bindSkills(abort.signal);
      bindRecos(reduced, abort.signal);
      bindWorks(abort.signal);
      bindMagnetic(abort.signal);
    });
    header.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((b) =>
      b.addEventListener('click', () => switchLang(b.dataset.lang as Lang), { signal: abort.signal }),
    );
    header.querySelector<HTMLButtonElement>('[data-theme-toggle]')?.addEventListener('click', (e) => switchTheme(e), { signal: abort.signal });
    ScrollTrigger.refresh();
  };

  /* Theme switch: circular reveal from the toggle (View Transitions), crossfade otherwise */
  function applyTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
    const btn = header.querySelector<HTMLButtonElement>('[data-theme-toggle]');
    if (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'light'));
      const label = btn.querySelector('.nav__theme-text');
      if (label) label.textContent = theme === 'dark' ? btn.dataset.light! : btn.dataset.dark!;
    }
    setLiquidLight(theme);
  }
  function switchTheme(e: MouseEvent) {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || reduced) { applyTheme(next); return; }
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || 40;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const vt = doc.startViewTransition(() => applyTheme(next));
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 1100, easing: 'cubic-bezier(0.19, 1, 0.22, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  }

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
