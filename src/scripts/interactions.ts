import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import type { Dictionary } from './i18n';

const EASE = 'expo.out';
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------------- Cursor ---------------- */
export function initCursor(getDict: () => Dictionary) {
  const cursor = document.querySelector<HTMLElement>('.cursor');
  const label = cursor?.querySelector<HTMLElement>('.cursor__label');
  if (!cursor || !label || !finePointer()) return;

  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3' });

  window.addEventListener('pointermove', (e) => {
    cursor.classList.add('is-visible');
    xTo(e.clientX);
    yTo(e.clientY);
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));

  document.addEventListener('pointerover', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
    cursor.classList.remove('is-hover', 'is-label');
    if (!target) return;
    const kind = target.dataset.cursor;
    if (kind === 'hover') {
      cursor.classList.add('is-hover');
    } else if (kind) {
      const dict = getDict();
      const key = kind === 'open' && target.classList.contains('is-open') ? 'close' : kind;
      label.textContent = dict[`cursor_${key}`] ?? '';
      cursor.classList.add('is-label');
    }
  });
}

/* ---------------- Magnetic pills ---------------- */
export function initMagnetic() {
  if (!finePointer()) return;
  document.querySelectorAll<HTMLElement>('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1.25, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ---------------- Navigation ---------------- */
export function initNav(lenis: Lenis) {
  const nav = document.querySelector<HTMLElement>('.nav');
  const burger = document.querySelector<HTMLButtonElement>('.nav__burger');
  const menu = document.querySelector<HTMLElement>('.mobile-menu');
  const links = gsap.utils.toArray<HTMLElement>('.mobile-menu__link');
  let open = false;

  const tl = gsap.timeline({ paused: true })
    .set(menu, { visibility: 'visible' })
    .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'expo.inOut' })
    .from(links, { yPercent: 100, opacity: 0, duration: 1, stagger: 0.06, ease: EASE }, '-=0.5');

  const setMenu = (next: boolean) => {
    open = next;
    document.body.classList.toggle('menu-open', open);
    burger?.setAttribute('aria-expanded', String(open));
    menu?.setAttribute('aria-hidden', String(!open));
    const span = burger?.querySelector('span');
    if (span) span.textContent = open ? burger!.dataset.close ?? 'Close' : burger!.dataset.open ?? 'Menu';
    if (open) { lenis.stop(); tl.timeScale(1).play(); } else { lenis.start(); tl.timeScale(1.6).reverse(); }
  };
  burger?.addEventListener('click', () => setMenu(!open));

  document.querySelectorAll<HTMLAnchorElement>('a.js-scroll').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      e.preventDefault();
      if (open) setMenu(false);
      const target = id === '#top' ? 0 : document.querySelector<HTMLElement>(id);
      if (target !== null) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    });
  });

  // Hide on scroll down, reveal on scroll up
  ScrollTrigger.create({
    start: 'top -120',
    end: 'max',
    onUpdate: (self) => {
      if (open) return;
      nav?.classList.toggle('is-hidden', self.direction === 1);
    },
    onLeaveBack: () => nav?.classList.remove('is-hidden'),
  });

  return {
    setLabels(openLabel: string, closeLabel: string) {
      if (!burger) return;
      burger.dataset.open = openLabel;
      burger.dataset.close = closeLabel;
      const span = burger.querySelector('span');
      if (span) span.textContent = open ? closeLabel : openLabel;
    },
  };
}

/* ---------------- Experience accordion ---------------- */
export function initAccordion() {
  document.querySelectorAll<HTMLElement>('.job').forEach((job) => {
    const head = job.querySelector<HTMLButtonElement>('.job__head');
    const body = job.querySelector<HTMLElement>('.job__body');
    if (!head || !body) return;
    head.addEventListener('click', () => {
      const isOpen = job.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(isOpen));
      gsap.to(body, {
        height: isOpen ? 'auto' : 0,
        duration: isOpen ? 1 : 0.8,
        ease: isOpen ? 'expo.out' : 'expo.inOut',
        onComplete: () => ScrollTrigger.refresh(),
      });
      if (isOpen) {
        gsap.fromTo(body.querySelectorAll('.job__body-inner > *'),
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.06, ease: EASE, delay: 0.1 });
      }
      // refresh cursor label
      job.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    });
  });
}

/* ---------------- Contact letters ---------------- */
export function initLetterHover() {
  if (!finePointer()) return;
  const big = document.querySelector<HTMLElement>('.contact__big');
  big?.addEventListener('pointerover', (e) => {
    const ch = (e.target as HTMLElement).closest<HTMLElement>('.char');
    if (!ch || gsap.isTweening(ch)) return;
    gsap.timeline()
      .to(ch, { yPercent: -14, duration: 0.4, ease: 'power3.out' })
      .to(ch, { yPercent: 0, duration: 1.25, ease: 'elastic.out(1, 0.35)' });
  });
}
