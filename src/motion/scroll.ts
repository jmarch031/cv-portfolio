import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { AMBER, OXBLOOD, SAGE, TAN, type Liquid, type RGB } from './shader';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* design.md: cubic-bezier(0.19, 1, 0.22, 1) ≈ expo.out, 0.8–1.25s */
const EASE = 'expo.out';
const DUR = 1.25;

/**
 * Every ScrollTrigger lives in this context so the whole set can be reverted
 * and rebuilt when the page is re-rendered (language switch).
 */
export interface Liquids { hero: Liquid; story: Liquid; contact: Liquid }

/** One palette per act: the light changes colour with the story. */
const ACT_PALETTES: [RGB, RGB, RGB][] = [
  [SAGE, AMBER, OXBLOOD],
  [AMBER, OXBLOOD, TAN],
  [SAGE, TAN, AMBER],
];
const ACT_LENSES = [[0.74, 0.52, 0.34], [0.8, 0.42, 0.42], [0.7, 0.55, 0.3]];
const flat = (p: [RGB, RGB, RGB]) => p.flatMap((c) => c.map((v) => v / 255));

export function initScroll(liquids: Liquids) {
  return gsap.context(() => {
    const mm = gsap.matchMedia();

    // Each liquid surface only renders while visible
    ([['.hero', liquids.hero], ['.story', liquids.story], ['.contact', liquids.contact]] as const).forEach(([sel, l]) => {
      ScrollTrigger.create({ trigger: sel, start: 'top bottom', end: 'bottom top', onToggle: (self) => l.setActive(self.isActive) });
    });
    liquids.story.state.c = flat(ACT_PALETTES[0]);
    liquids.story.state.lens = [...ACT_LENSES[0]];

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        desktop: '(min-width: 961px)',
        // pin the story only when an act fits on screen
        tall: '(min-width: 961px) and (min-height: 620px), (max-width: 960px) and (min-height: 700px)',
      },
      (ctx) => {
        const { motion, desktop, tall } = ctx.conditions as Record<string, boolean>;
        if (!motion) {
          document.querySelector('.story')?.classList.add('is-static');
          return;
        }

        /* ---------- Hero: the statement slides over it ---------- */
        ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', pin: true, pinSpacing: false });
        gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
          .to('.hero__media', { scale: 1.18, yPercent: 8, ease: 'none' }, 0)
          .to('.hero__line:first-child', { xPercent: -18, ease: 'none' }, 0)
          .to('.hero__line:last-child', { xPercent: 18, ease: 'none' }, 0)
          .to('.hero__title', { scale: 0.86, autoAlpha: 0.2, ease: 'none' }, 0)
          .to(['.hero__caption', '.badge'], { autoAlpha: 0, ease: 'none', duration: 0.4 }, 0);

        /* ---------- Section labels: rule draws, text rises ---------- */
        gsap.utils.toArray<HTMLElement>('.label').forEach((el) => {
          const st = { trigger: el, start: 'top 90%' };
          gsap.fromTo(el, { '--draw': 0 }, { '--draw': 1, duration: 1.6, ease: EASE, scrollTrigger: st });
          gsap.from(el.children, { yPercent: 100, autoAlpha: 0, duration: DUR, stagger: 0.08, ease: EASE, scrollTrigger: st });
        });

        /* ---------- Statement: words light up with the scroll ---------- */
        gsap.utils.toArray<HTMLElement>('.js-words').forEach((el) => {
          const { words } = SplitText.create(el, { type: 'words', wordsClass: 'word' });
          gsap.fromTo(words, { autoAlpha: 0.1 }, {
            autoAlpha: 1, stagger: 0.1, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true },
          });
        });

        /* ---------- Line reveals ---------- */
        gsap.utils.toArray<HTMLElement>('.js-lines').forEach((el) => {
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110, duration: DUR, stagger: 0.08, ease: EASE,
                scrollTrigger: { trigger: el, start: 'top 88%' },
              }),
          });
        });

        /* ---------- Generic rise ---------- */
        ScrollTrigger.batch('.js-rise', {
          start: 'top 90%',
          once: true,
          onEnter: (batch) => gsap.from(batch, { y: 80, autoAlpha: 0, duration: DUR, stagger: 0.1, ease: EASE }),
        });

        /* ---------- Story: three pinned acts ---------- */
        const acts = gsap.utils.toArray<HTMLElement>('.act');
        if (tall && acts.length) {
          const parts = (a: HTMLElement) => a.querySelectorAll('.act__years, .act__title, .act__text, .act__tags');
          const numeral = (a: HTMLElement) => a.querySelector('.act__numeral');
          const current = document.querySelector<HTMLElement>('.story__current');

          acts.forEach((a, i) => { if (i) gsap.set(a, { autoAlpha: 0 }); });

          // No snap (it fights Lenis' smooth scroll): each act gets a plateau where it
          // stays fully visible, and short transitions in between.
          //   act i is complete from T(i) = i * STEP until T(i) + REST, then hands over.
          const last = acts.length - 1;
          const REST = 1;
          const MOVE = 0.6;
          const STEP = REST + MOVE;
          const T = (i: number) => i * STEP;
          const total = T(last) + REST;

          const tl = gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            scrollTrigger: {
              trigger: '.story__pin',
              start: 'top top',
              end: () => `+=${window.innerHeight * acts.length * 1.2}`,
              pin: true,
              scrub: 0.8,
              onUpdate: () => {
                const t = tl.time();
                let idx = 0;
                acts.forEach((_, i) => { if (t >= T(i) - MOVE / 2) idx = i; });
                if (current) current.textContent = String(idx + 1).padStart(2, '0');
              },
            },
          });

          tl.fromTo('.story__bar', { scaleX: 1 / acts.length }, { scaleX: 1, ease: 'none', duration: total }, 0);
          acts.forEach((a, i) => {
            // slow drift of the numeral while its act is on screen
            const from = Math.max(0, T(i) - MOVE);
            const to = Math.min(total, T(i) + REST);
            tl.fromTo(numeral(a), { yPercent: 8 }, { yPercent: -8, ease: 'none', duration: to - from }, from);
            if (i === 0) return;
            const prev = acts[i - 1];
            const out = T(i) - MOVE;
            tl.to(parts(prev), { yPercent: -50, autoAlpha: 0, stagger: 0.03, duration: MOVE * 0.45 }, out)
              .to(numeral(prev), { autoAlpha: 0, duration: MOVE * 0.45 }, out)
              .set(a, { autoAlpha: 1 }, out + MOVE * 0.4)
              .fromTo(parts(a), { yPercent: 50, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.04, duration: MOVE * 0.45 }, out + MOVE * 0.4)
              .fromTo(numeral(a), { autoAlpha: 0, scale: 0.88 }, { autoAlpha: 1, scale: 1, duration: MOVE * 0.55 }, out + MOVE * 0.4)
              .to(liquids.story.state.c, { endArray: flat(ACT_PALETTES[i % ACT_PALETTES.length]), duration: MOVE, ease: 'none' }, out)
              .to(liquids.story.state.lens, { endArray: ACT_LENSES[i % ACT_LENSES.length], duration: MOVE }, out);
          });

          // First act enters when the section arrives (on the wrapper: the timeline owns the parts)
          gsap.from(acts[0].querySelector('.act__body'), {
            y: 120, autoAlpha: 0, duration: 1.6, ease: EASE,
            scrollTrigger: { trigger: '.story', start: 'top 60%' },
          });
        } else {
          document.querySelector('.story')?.classList.add('is-static');
        }

        /* ---------- Numbers ---------- */
        gsap.utils.toArray<HTMLElement>('.js-count').forEach((el) => {
          const to = Number(el.dataset.to);
          const o = { v: 0 };
          gsap.to(o, {
            v: to, duration: 2.2, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
            onUpdate: () => { el.textContent = String(Math.round(o.v)); },
          });
        });

        /* ---------- Skills: rows glide in from alternating sides ---------- */
        gsap.utils.toArray<HTMLElement>('.skill').forEach((row, i) => {
          gsap.fromTo(row.querySelector('.skill__name'),
            { xPercent: i % 2 ? 12 : -12, autoAlpha: 0.15 },
            { xPercent: 0, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 98%', end: 'top 65%', scrub: true } });
        });

        /* ---------- Journey: the row in the reading line drives the panel ---------- */
        const jobs = gsap.utils.toArray<HTMLElement>('.job');
        const panels = gsap.utils.toArray<HTMLElement>('.panel-item');
        let active = 0;
        const activate = (i: number) => {
          if (i === active) return;
          jobs[active]?.classList.remove('is-active');
          jobs[i]?.classList.add('is-active');
          if (desktop && panels[i] && panels[active]) {
            const from = panels[active];
            const to = panels[i];
            gsap.killTweensOf([from, to]);
            gsap.set(from, { clearProps: 'all' });
            from.classList.remove('is-active');
            to.classList.add('is-active');
            gsap.fromTo(to.children, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.05, ease: EASE });
          }
          active = i;
        };
        if (desktop && tall) {
          // Pinned reading: each role gets the same scroll distance, the list slides
          // to keep the active row in view, the panel shows its full detail.
          document.querySelector('.journey')?.classList.add('is-pinned');
          const list = document.querySelector<HTMLElement>('.jobs')!;
          const win = document.querySelector<HTMLElement>('.jobs__window')!;
          const follow = (i: number) => {
            const row = jobs[i];
            const max = Math.max(0, list.scrollHeight - win.clientHeight);
            const y = gsap.utils.clamp(0, max, row.offsetTop - win.clientHeight / 2 + row.offsetHeight / 2);
            gsap.to(list, { y: -y, duration: 1, ease: EASE, overwrite: true });
          };
          const st = ScrollTrigger.create({
            trigger: '.journey__grid',
            start: 'top 120px',
            end: () => `+=${jobs.length * window.innerHeight * 0.8}`,
            pin: true,
            onUpdate: (self) => {
              const i = Math.min(jobs.length - 1, Math.floor(self.progress * jobs.length));
              if (i !== active) { activate(i); follow(i); }
            },
          });
          jobs.forEach((job, i) => {
            job.addEventListener('click', () => {
              const y = st.start + ((i + 0.5) / jobs.length) * (st.end - st.start);
              window.dispatchEvent(new CustomEvent('jm:scrollto', { detail: y }));
            });
          });
          gsap.from('.journey__panel', {
            autoAlpha: 0, y: 60, duration: DUR, ease: EASE,
            scrollTrigger: { trigger: '.journey__grid', start: 'top 75%' },
          });
        } else {
          jobs.forEach((job, i) => {
            ScrollTrigger.create({
              trigger: job,
              start: 'top 55%',
              end: 'bottom 55%',
              onToggle: (self) => self.isActive && activate(i),
            });
          });
        }
        ScrollTrigger.batch('.work', {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => gsap.from(batch, { y: 60, autoAlpha: 0, duration: DUR, stagger: 0.1, ease: EASE }),
        });
        if (!(desktop && tall)) {
          ScrollTrigger.batch('.job', {
            start: 'top 92%',
            once: true,
            onEnter: (batch) => gsap.from(batch, { y: 50, autoAlpha: 0, duration: DUR, stagger: 0.08, ease: EASE }),
          });
        }

        /* ---------- Contact: lines converge, letters rise ---------- */
        gsap.utils.toArray<HTMLElement>('.contact__line').forEach((line, i) => {
          const { chars } = SplitText.create(line, { type: 'chars', mask: 'chars', charsClass: 'char' });
          // A gradient clipped to text does not reach transformed children: give each
          // letter its own slice of the line-wide gradient instead.
          if (line.classList.contains('iri')) {
            line.classList.add('is-split');
            const lineBox = line.getBoundingClientRect();
            (chars as HTMLElement[]).forEach((ch) => {
              const box = ch.getBoundingClientRect();
              ch.classList.add('iri-char');
              ch.style.backgroundSize = `${lineBox.width}px 100%`;
              ch.style.backgroundPosition = `${lineBox.left - box.left}px 0`;
            });
          }
          gsap.from(chars, {
            yPercent: 120, duration: 1.4, stagger: 0.03, ease: EASE, delay: i * 0.12,
            scrollTrigger: { trigger: '.contact__title', start: 'top 80%' },
          });
          gsap.fromTo(line, { xPercent: i % 2 ? 10 : -6 }, {
            xPercent: 0, ease: 'none',
            // must end at a reachable position: the contact is the last section
            scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom bottom', scrub: true },
          });
        });
        gsap.from('.contact__ctas > *', {
          y: 30, autoAlpha: 0, duration: DUR, stagger: 0.08, ease: EASE,
          scrollTrigger: { trigger: '.contact__ctas', start: 'top 95%' },
        });
      },
    );

    /* ---------- Light leaks drift through their section ---------- */
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.utils.toArray<HTMLElement>('.glow').forEach((g, i) => {
        gsap.fromTo(g, { yPercent: 60, xPercent: i % 2 ? 10 : -10, rotate: -40 }, {
          yPercent: -80, xPercent: i % 2 ? -12 : 14, rotate: -22, ease: 'none',
          scrollTrigger: { trigger: g.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }
  });
}
