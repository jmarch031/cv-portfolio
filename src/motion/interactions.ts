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
    onUpdate: (self) => {
      if (!open) nav.classList.toggle('is-hidden', self.direction === 1);
      nav.classList.toggle('is-scrolled', self.scroll() > window.innerHeight * 0.7);
    },
    onLeaveBack: () => nav.classList.remove('is-hidden', 'is-scrolled'),
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

/* ---------------- Writing: spotlight follows the cursor in the hovered row ---------------- */
export function bindWorks(signal: AbortSignal) {
  if (!finePointer()) return;
  document.querySelectorAll<HTMLElement>('.work__link').forEach((link) => {
    link.addEventListener('pointermove', (e) => {
      const r = link.getBoundingClientRect();
      link.style.setProperty('--mx', `${e.clientX - r.left}px`);
      link.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { signal });
  });
}

/* ---------------- Journey: the reader picks the role to read ---------------- */
export function bindJourney(signal: AbortSignal) {
  const jobs = Array.from(document.querySelectorAll<HTMLElement>('.job'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('.panel-item'));
  const panel = document.querySelector<HTMLElement>('.journey__panel');
  if (!jobs.length) return;
  const isDesktop = () => window.matchMedia('(min-width: 961px)').matches;
  let active = 0;

  // A detail taller than the screen sticks by its bottom edge, so all of it can be read
  const fitPanel = () => {
    if (!panel) return;
    const top = Math.min(100, window.innerHeight - panel.offsetHeight - 24);
    panel.style.setProperty('--panel-top', `${top}px`);
  };
  fitPanel();
  window.addEventListener('resize', fitPanel, { signal });

  const select = (i: number) => {
    const same = i === active;
    if (isDesktop()) {
      if (same) return;
      const from = panels[active];
      const to = panels[i];
      gsap.killTweensOf([from.children, to.children]);
      from.classList.remove('is-active');
      to.classList.add('is-active');
      gsap.fromTo(to.children, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.05, ease: EASE });
      fitPanel();
    } else {
      // accordion: tapping the open role closes it
      const closing = same && jobs[i].classList.contains('is-active');
      jobs.forEach((job, k) => {
        const detail = job.querySelector<HTMLElement>('.job__detail')!;
        const open = k === i && !closing;
        if (open === job.classList.contains('is-active') && k !== i) return;
        // explicit start height: the class toggles right after and would change the computed value
        gsap.fromTo(detail, { height: detail.offsetHeight }, { height: open ? 'auto' : 0, duration: open ? 1 : 0.7, ease: open ? EASE : 'expo.inOut', overwrite: true, onComplete: () => { gsap.set(detail, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
        if (open) gsap.fromTo(detail.firstElementChild!.children, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.04, ease: EASE, delay: 0.1 });
      });
      if (closing) {
        jobs[i].classList.remove('is-active');
        jobs[i].querySelector('.job__head')?.setAttribute('aria-expanded', 'false');
        return;
      }
    }
    jobs.forEach((job, k) => {
      job.classList.toggle('is-active', k === i);
      job.querySelector('.job__head')?.setAttribute('aria-expanded', String(k === i));
    });
    active = i;
  };

  jobs.forEach((job, i) => job.querySelector('.job__head')?.addEventListener('click', () => select(i), { signal }));
}

/* ---------------- Stack wall: hover / focus / tap reveals when it was used ---------------- */
export function bindWall(signal: AbortSignal) {
  const list = document.querySelector<HTMLElement>('.wall__words');
  const caption = document.querySelector<HTMLElement>('.wall__caption');
  if (!list || !caption) return;
  const words = Array.from(list.querySelectorAll<HTMLButtonElement>('.wall__word'));
  let current: HTMLButtonElement | null = null;

  const show = (w: HTMLButtonElement | null) => {
    if (w === current) return;
    current?.classList.remove('is-on');
    current = w;
    list.classList.toggle('is-hovering', !!w);
    caption.classList.toggle('is-on', !!w);
    if (!w) { caption.textContent = caption.dataset.hint ?? ''; return; }
    w.classList.add('is-on');
    const name = document.createElement('b');
    name.textContent = w.dataset.name ?? '';
    caption.replaceChildren(name, document.createTextNode(` — ${w.dataset.meta ?? ''}`));
    gsap.fromTo(caption, { y: 8, autoAlpha: 0.4 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });
  };

  // a tap focuses the button before the click: only keyboard focus should reveal on its own
  let pointerDown = false;
  words.forEach((w) => {
    w.addEventListener('pointerdown', () => { pointerDown = true; }, { signal });
    w.addEventListener('pointerenter', (e) => { if ((e as PointerEvent).pointerType === 'mouse') show(w); }, { signal });
    w.addEventListener('focus', () => { if (!pointerDown) show(w); }, { signal });
    w.addEventListener('click', () => {
      pointerDown = false;
      // on touch, tapping the active word again hides it
      show(current === w && !finePointer() ? null : w);
    }, { signal });
  });
  list.addEventListener('pointerleave', (e) => { if ((e as PointerEvent).pointerType === 'mouse') show(null); }, { signal });
  list.addEventListener('focusout', (e) => { if (!list.contains((e as FocusEvent).relatedTarget as Node)) show(null); }, { signal });
}
