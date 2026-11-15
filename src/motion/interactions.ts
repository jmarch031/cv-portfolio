import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

const EASE = 'expo.out';
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------------- Cursor (persistent, bound once) ---------------- */
export function initCursor() {
  if (!finePointer()) return;
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    cursor.classList.add('is-on');
    xTo(e.clientX);
    yTo(e.clientY);
  });
  document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
  document.addEventListener('pointerover', (e) => {
    const link = (e.target as Element).closest('a, button');
    cursor.classList.toggle('is-link', !!link);
  });
}

/* ---------------- Magnetic pills ---------------- */
export function bindMagnetic(signal: AbortSignal) {
  if (!finePointer()) return;
  document.querySelectorAll<HTMLElement>('.magnetic, .recos__btn').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    }, { signal });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1.25, ease: 'elastic.out(1, 0.4)' }), { signal });
  });
}

/* ---------------- Navigation ---------------- */
export function bindNav(lenis: Lenis, labels: { menu: string; close: string }, signal: AbortSignal) {
  const nav = document.querySelector<HTMLElement>('.nav')!;
  const burger = nav.querySelector<HTMLButtonElement>('.nav__burger');
  const sheet = document.querySelector<HTMLElement>('.sheet')!;
  let open = false;

  const tl = gsap.timeline({ paused: true })
    .set(sheet, { visibility: 'visible' })
    .to(sheet, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'expo.inOut' })
    .from(sheet.querySelectorAll('.sheet__link'), { yPercent: 100, autoAlpha: 0, duration: 1, stagger: 0.06, ease: EASE }, '-=0.45');

  const setOpen = (next: boolean) => {
    open = next;
    burger?.setAttribute('aria-expanded', String(open));
    sheet.setAttribute('aria-hidden', String(!open));
    if (burger) burger.textContent = open ? labels.close : labels.menu;
    if (open) { lenis.stop(); tl.timeScale(1).play(); } else { lenis.start(); tl.timeScale(1.6).reverse(); }
  };
  burger?.addEventListener('click', () => setOpen(!open), { signal });
  signal.addEventListener('abort', () => { tl.progress(0).kill(); gsap.set(sheet, { clearProps: 'all' }); lenis.start(); });

  document.querySelectorAll<HTMLAnchorElement>('a.js-scroll').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href?.startsWith('#')) return;
      e.preventDefault();
      if (open) setOpen(false);
      const target = href === '#top' ? 0 : document.querySelector<HTMLElement>(href);
      if (target !== null) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    }, { signal });
  });

  // Hide while reading down, come back on the way up
  ScrollTrigger.create({
    start: 'top -100',
    end: 'max',
    onUpdate: (self) => { if (!open) nav.classList.toggle('is-hidden', self.direction === 1); },
    onLeaveBack: () => nav.classList.remove('is-hidden'),
  });
}

/* ---------------- Skills accordion ---------------- */
export function bindSkills(signal: AbortSignal) {
  document.querySelectorAll<HTMLElement>('.skill').forEach((skill) => {
    const head = skill.querySelector<HTMLButtonElement>('.skill__head')!;
    const body = skill.querySelector<HTMLElement>('.skill__body')!;
    const toggle = (force?: boolean) => {
      const isOpen = force ?? !skill.classList.contains('is-open');
      if (isOpen === skill.classList.contains('is-open')) return;
      skill.classList.toggle('is-open', isOpen);
      head.setAttribute('aria-expanded', String(isOpen));
      gsap.to(body, { height: isOpen ? 'auto' : 0, duration: isOpen ? 1 : 0.8, ease: isOpen ? EASE : 'expo.inOut', overwrite: true, onComplete: () => ScrollTrigger.refresh() });
      if (isOpen) gsap.fromTo(body.firstElementChild, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: EASE, delay: 0.1 });
    };
    head.addEventListener('click', () => toggle(), { signal });
  });
}

/* ---------------- Recommendations slider ---------------- */
export function bindRecos(reduced: boolean, signal: AbortSignal) {
  const section = document.querySelector<HTMLElement>('.recos');
  if (!section) return;
  const items = Array.from(section.querySelectorAll<HTMLElement>('.reco'));
  const bar = section.querySelector<HTMLElement>('.recos__bar')!;
  const current = section.querySelector<HTMLElement>('.recos__current')!;
  const more = section.querySelector<HTMLButtonElement>('.recos__more')!;
  let index = 0;
  let expanded = false;

  const progress = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 9, ease: 'none', paused: true, onComplete: () => go(1) });

  const setMore = (open: boolean) => {
    expanded = open;
    const full = items[index].querySelector<HTMLElement>('.reco__full')!;
    gsap.to(full, { height: open ? 'auto' : 0, duration: open ? 1 : 0.6, ease: open ? EASE : 'expo.inOut', onComplete: () => ScrollTrigger.refresh() });
    more.setAttribute('aria-expanded', String(open));
    const text = open ? more.dataset.less! : more.dataset.more!;
    more.querySelectorAll('.rl__a, .rl__b').forEach((s) => { s.textContent = text; });
    if (open) progress.pause(); else progress.play();
  };

  function go(dir: number) {
    const prev = items[index];
    if (expanded) {
      gsap.set(prev.querySelector('.reco__full'), { height: 0 });
      expanded = false;
      more.setAttribute('aria-expanded', 'false');
      more.querySelectorAll('.rl__a, .rl__b').forEach((s) => { s.textContent = more.dataset.more!; });
    }
    index = (index + dir + items.length) % items.length;
    const next = items[index];
    current.textContent = String(index + 1).padStart(2, '0');
    gsap.to(prev, { autoAlpha: 0, y: -30 * dir, duration: 0.5, ease: 'power3.in', onComplete: () => {
      prev.classList.remove('is-active');
      gsap.set(prev, { clearProps: 'all' });
      next.classList.add('is-active');
      gsap.fromTo(next.querySelectorAll('.reco__excerpt, .reco__by'), { y: 40 * dir, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.08, ease: EASE });
      ScrollTrigger.refresh();
    } });
    if (!reduced) progress.restart();
  }

  section.querySelectorAll<HTMLButtonElement>('.recos__btn').forEach((b) =>
    b.addEventListener('click', () => go(Number(b.dataset.dir)), { signal }),
  );
  more.addEventListener('click', () => setMore(!expanded), { signal });

  // Auto-advance only while visible
  if (!reduced) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      end: 'bottom 30%',
      onToggle: (self) => (self.isActive && !expanded ? progress.play() : progress.pause()),
    });
    section.addEventListener('pointerenter', () => progress.pause(), { signal });
    section.addEventListener('pointerleave', () => { if (!expanded) progress.play(); }, { signal });
  }
  signal.addEventListener('abort', () => progress.kill());
}

/* ---------------- Writing: glass orb follows the cursor ---------------- */
export function bindWorks(signal: AbortSignal) {
  if (!finePointer() || window.innerWidth < 961) return;
  const list = document.querySelector<HTMLElement>('.works');
  const preview = document.querySelector<HTMLElement>('.works__preview');
  if (!list || !preview) return;
  const orbs = Array.from(preview.querySelectorAll<HTMLElement>('.orb'));
  const xTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3' });
  const yTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3' });
  const rTo = gsap.quickTo(preview, 'rotate', { duration: 0.9, ease: 'power3' });
  let lastX = 0;
  list.addEventListener('pointermove', (e) => {
    // keep the orb to the right of the text column
    xTo(Math.max(e.clientX + 180, list.getBoundingClientRect().left + list.offsetWidth * 0.62));
    yTo(e.clientY);
    rTo(gsap.utils.clamp(-15, 15, (e.clientX - lastX) * 0.6));
    lastX = e.clientX;
  }, { signal });
  list.addEventListener('pointerover', (e) => {
    const work = (e.target as Element).closest<HTMLElement>('.work');
    if (!work) return;
    const i = Number(work.dataset.work);
    orbs.forEach((o, k) => o.classList.toggle('is-active', k === i));
  }, { signal });
  list.addEventListener('pointerleave', () => orbs.forEach((o) => o.classList.remove('is-active')), { signal });
}
