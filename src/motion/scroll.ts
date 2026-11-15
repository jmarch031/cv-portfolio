import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { HeroShader } from './shader';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* design.md: cubic-bezier(0.19, 1, 0.22, 1) ≈ expo.out, 0.8–1.25s */
const EASE = 'expo.out';
const DUR = 1.25;

/**
 * Every ScrollTrigger lives in this context so the whole set can be reverted
 * and rebuilt when the page is re-rendered (language switch).
 */
export function initScroll(shader: HeroShader) {
  return gsap.context(() => {
    const mm = gsap.matchMedia();

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onToggle: (self) => shader.setActive(self.isActive),
    });

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        desktop: '(min-width: 961px)',
        tall: '(min-height: 620px)',
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

          const tl = gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            scrollTrigger: {
              trigger: '.story__pin',
              start: 'top top',
              end: () => `+=${window.innerHeight * acts.length * 1.1}`,
              pin: true,
              scrub: 1,
              snap: { snapTo: 'labels', duration: { min: 0.3, max: 0.9 }, ease: 'power2.inOut' },
              onUpdate: (self) => {
                const idx = Math.min(acts.length - 1, Math.round(self.progress * (acts.length - 1)));
                if (current) current.textContent = String(idx + 1).padStart(2, '0');
              },
            },
          });

          tl.addLabel('act0');
          tl.fromTo('.story__bar', { scaleX: 1 / acts.length }, { scaleX: 1, ease: 'none', duration: acts.length - 1 }, 0);
          acts.forEach((a, i) => {
            tl.fromTo(numeral(a), { yPercent: 12 }, { yPercent: -12, ease: 'none', duration: 1 }, Math.max(0, i - 0.5));
            if (i === 0) return;
            const prev = acts[i - 1];
            const at = i - 0.5;
            tl.to(parts(prev), { yPercent: -60, autoAlpha: 0, stagger: 0.04, duration: 0.4 }, at)
              .to(numeral(prev), { autoAlpha: 0, duration: 0.3 }, at)
              .set(a, { autoAlpha: 1 }, at + 0.3)
              .fromTo(parts(a), { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.05, duration: 0.45 }, at + 0.3)
              .fromTo(numeral(a), { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, at + 0.3)
              .addLabel(`act${i}`, i);
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
        jobs.forEach((job, i) => {
          ScrollTrigger.create({
            trigger: job,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => self.isActive && activate(i),
          });
        });
        if (desktop) {
          gsap.from('.journey__panel', {
            autoAlpha: 0, y: 60, duration: DUR, ease: EASE,
            scrollTrigger: { trigger: '.journey__grid', start: 'top 75%' },
          });
        }
        ScrollTrigger.batch('.job', {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => gsap.from(batch, { y: 50, autoAlpha: 0, duration: DUR, stagger: 0.08, ease: EASE }),
        });

        /* ---------- Contact: lines converge, letters rise ---------- */
        gsap.utils.toArray<HTMLElement>('.contact__line').forEach((line, i) => {
          const { chars } = SplitText.create(line, { type: 'chars', mask: 'chars', charsClass: 'char' });
          gsap.from(chars, {
            yPercent: 120, duration: 1.4, stagger: 0.03, ease: EASE, delay: i * 0.12,
            scrollTrigger: { trigger: '.contact__title', start: 'top 80%' },
          });
          gsap.fromTo(line, { xPercent: i % 2 ? 10 : -6 }, {
            xPercent: 0, ease: 'none',
            scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top 20%', scrub: true },
          });
        });
        gsap.from('.contact__ctas > *', {
          y: 30, autoAlpha: 0, duration: DUR, stagger: 0.08, ease: EASE,
          scrollTrigger: { trigger: '.contact__ctas', start: 'top 95%' },
        });
      },
    );

    /* ---------- Light / dark bands (last: positions must include pin spacing) ---------- */
    gsap.utils.toArray<HTMLElement>('#app > section').forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) document.body.classList.toggle('is-dark', section.dataset.band === 'dark');
        },
      });
    });
  });
}
