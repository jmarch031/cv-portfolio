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
  // a wide, soft light trails the pointer, like a lamp carried across the page
  const light = document.createElement('div');
  light.className = 'cursor-light';
  light.setAttribute('aria-hidden', 'true');
  document.body.prepend(light);
  const lxTo = gsap.quickTo(light, 'x', { duration: 2.2, ease: 'power3' });
  const lyTo = gsap.quickTo(light, 'y', { duration: 2.2, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    cursor.classList.add('is-on');
    light.classList.add('is-on');
    xTo(e.clientX);
    yTo(e.clientY);
    lxTo(e.clientX);
    lyTo(e.clientY);
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

  // Reading progress
  const bar = nav.querySelector<HTMLElement>('.nav__progress-bar');
  const progress = nav.querySelector<HTMLElement>('.nav__progress');
  if (bar && progress) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress });
        progress.setAttribute('aria-valuenow', String(Math.round(self.progress * 100)));
      },
    });
  }

  // Current section, in the desktop menu and the sheet
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav__link, .sheet__link'));
  const setCurrent = (id: string | null) =>
    links.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  new Set(links.map((a) => a.getAttribute('href'))).forEach((href) => {
    const section = href ? document.querySelector<HTMLElement>(href) : null;
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => { if (self.isActive) setCurrent(section.id); },
      onLeaveBack: (self) => { if (self.trigger === document.querySelector('#story')) setCurrent(null); },
    });
  });

  // Contact shortcut: after the hero, until the contact section shows up
  const cta = document.querySelector<HTMLElement>('.cta-float');
  const contact = document.querySelector<HTMLElement>('#contact');
  if (cta && contact) {
    let pastHero = false;
    let atContact = false;
    let shown = false;
    const update = () => {
      const show = pastHero && !atContact;
      if (show === shown) return;
      shown = show;
      gsap.to(cta, { autoAlpha: show ? 1 : 0, y: show ? 0 : 16, duration: 0.8, ease: EASE, overwrite: true });
    };
    gsap.set(cta, { autoAlpha: 0, y: 16 });
    ScrollTrigger.create({ start: () => window.innerHeight * 0.8, end: 'max', onToggle: (self) => { pastHero = self.isActive; update(); } });
    ScrollTrigger.create({ trigger: contact, start: 'top 85%', end: 'max', onToggle: (self) => { atContact = self.isActive; update(); } });
  }
}

/* ---------------- Contact: copy the email address ---------------- */
export function bindContact(signal: AbortSignal) {
  const btn = document.querySelector<HTMLButtonElement>('.contact__copy');
  const status = document.querySelector<HTMLElement>('.contact__status');
  if (!btn) return;
  const labels = Array.from(btn.querySelectorAll<HTMLElement>('.rl__a, .rl__b'));
  const initial = labels[0]?.textContent ?? '';
  let timer = 0;
  btn.addEventListener('click', async () => {
    const email = btn.dataset.email ?? '';
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    labels.forEach((l) => { l.textContent = `${btn.dataset.copied} ✓`; });
    if (status) status.textContent = btn.dataset.copied ?? '';
    clearTimeout(timer);
    timer = window.setTimeout(() => { labels.forEach((l) => { l.textContent = initial; }); if (status) status.textContent = ''; }, 2400);
  }, { signal });
  signal.addEventListener('abort', () => clearTimeout(timer));
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
  const row = document.querySelector<HTMLElement>('.works');
  if (row) {
    // arrows: one card at a time
    document.querySelectorAll<HTMLButtonElement>('.writing__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = row.querySelector<HTMLElement>('.work');
        const step = (card?.offsetWidth ?? 320) + parseFloat(getComputedStyle(row).columnGap || '0');
        row.scrollBy({ left: Number(btn.dataset.dir) * step, behavior: 'smooth' });
      }, { signal });
    });
    // mouse drag (touch scrolls natively); a drag never counts as a click on a card
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    let down = false;
    row.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = row.scrollLeft;
    }, { signal });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; row.classList.add('is-dragging'); }
      if (moved) row.scrollLeft = startLeft - dx;
    }, { signal });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      row.classList.remove('is-dragging');
    }, { signal });
    row.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, { capture: true, signal });
    row.addEventListener('dragstart', (e) => e.preventDefault(), { signal });
  }
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

  // Phones and tablets: early career folds behind a button
  const section = document.querySelector<HTMLElement>('.journey');
  const more = document.querySelector<HTMLButtonElement>('.journey__more');
  if (section && more) {
    const count = more.textContent?.match(/\(\d+\)/)?.[0] ?? '';
    more.addEventListener('click', () => {
      const expanded = !section.classList.contains('is-expanded');
      section.classList.toggle('is-expanded', expanded);
      more.setAttribute('aria-expanded', String(expanded));
      more.textContent = expanded ? more.dataset.less! : `${more.dataset.more} ${count}`;
      const early = jobs.filter((j) => j.classList.contains('job--early'));
      if (expanded) gsap.fromTo(early, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.06, ease: EASE });
      else more.scrollIntoView({ block: 'center' });
      ScrollTrigger.refresh();
    }, { signal });
  }

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

/* ---------------- Tools: looping bands, sped up by the scroll, paused on hover ---------------- */
export function bindMarquees(reduced: boolean, signal: AbortSignal) {
  if (reduced) return;
  const tweens = Array.from(document.querySelectorAll<HTMLElement>('.marquee')).map((row) => {
    const dir = Number(row.dataset.dir) || -1;
    const track = row.querySelector<HTMLElement>('.marquee__track')!;
    // half the track is one full copy of the list: about 60px per second
    const duration = track.scrollWidth / 2 / 60;
    const tween = dir < 0
      ? gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration, ease: 'none', repeat: -1 })
      : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration, ease: 'none', repeat: -1 });
    if (finePointer()) {
      row.addEventListener('pointerenter', () => gsap.to(tween, { timeScale: 0, duration: 0.8, ease: 'power2.out', overwrite: true }), { signal });
      row.addEventListener('pointerleave', () => gsap.to(tween, { timeScale: 1, duration: 0.8, ease: 'power2.in', overwrite: true }), { signal });
    }
    return { row, tween };
  });
  if (!tweens.length) return;
  // the scroll gives them a push, then they settle back
  ScrollTrigger.create({
    trigger: '.marquees',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 5);
      tweens.forEach(({ row, tween }) => {
        if (row.matches(':hover')) return;
        gsap.to(tween, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => { gsap.to(tween, { timeScale: 1, duration: 1.2, ease: 'power2.out' }); } });
      });
    },
    onToggle: (self) => tweens.forEach(({ tween }) => (self.isActive ? tween.play() : tween.pause())),
  });
  signal.addEventListener('abort', () => tweens.forEach(({ tween }) => tween.kill()));
}
