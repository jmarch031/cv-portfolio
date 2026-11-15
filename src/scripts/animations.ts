import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { HeroShader } from './shader';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* Signature curve from design.md: cubic-bezier(0.19, 1, 0.22, 1) ≈ expo.out */
const EASE = 'expo.out';
const DUR = 1.25;

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ======================================================================
   INTRO — counter, curtain lift, hero reveal
   ====================================================================== */
export function playIntro(onDone: () => void) {
  const intro = document.querySelector<HTMLElement>('.intro');
  const num = document.querySelector<HTMLElement>('.intro__num');
  const words = gsap.utils.toArray<HTMLElement>('.hero__word');
  const splitHero = () =>
    words.flatMap((w) => SplitText.create(w, { type: 'chars', mask: 'chars', charsClass: 'char' }).chars);

  const finish = () => {
    intro?.remove();
    document.body.classList.remove('is-loading');
    onDone();
  };

  if (prefersReducedMotion()) {
    finish();
    return;
  }

  gsap.set('.hero .line-inner', { yPercent: 110 });
  gsap.set(['.hero__ctas > *', '.hero__meta > *'], { opacity: 0, y: 24 });
  gsap.set('.hero__media', { scale: 1.3, opacity: 0 });
  gsap.set('.nav > *', { opacity: 0, y: -20 });
  gsap.set('.scroll-badge', { scale: 0, rotate: -120 });

  const counter = { v: 0 };
  const fontsReady = (document as Document & { fonts?: FontFaceSet }).fonts?.ready ?? Promise.resolve();

  const build = (chars: Element[]) => {
  gsap.set(chars, { yPercent: 115 });
  const tl = gsap.timeline({ onComplete: finish });
  tl.to(counter, {
    v: 100,
    duration: 1.6,
    ease: 'power3.inOut',
    onUpdate: () => { if (num) num.textContent = String(Math.round(counter.v)); },
  })
    .to('.intro__count, .intro__label', { yPercent: -100, opacity: 0, duration: 0.8, ease: 'power3.in' })
    .to(intro, { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'expo.inOut' }, '-=0.2')
    .to('.hero__media', { scale: 1, opacity: 1, duration: 2.4, ease: EASE }, '<0.2')
    .to(chars, { yPercent: 0, duration: 1.6, stagger: 0.035, ease: EASE }, '<0.35')
    .to('.hero .line-inner', { yPercent: 0, duration: DUR, stagger: 0.1, ease: EASE }, '<0.4')
    .to(['.hero__ctas > *', '.hero__meta > *'], { opacity: 1, y: 0, duration: DUR, stagger: 0.08, ease: EASE }, '<0.2')
    .to('.nav > *', { opacity: 1, y: 0, duration: DUR, stagger: 0.06, ease: EASE }, '<')
    .to('.scroll-badge', { scale: 1, rotate: 0, duration: 1.6, ease: EASE }, '<0.1');
  };

  // Split once the type is ready so character boxes match the final font
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 2500))]).then(() => build(splitHero()));
}

/* ======================================================================
   SCROLL — every ScrollTrigger lives inside a gsap.context so the whole
   set can be reverted and rebuilt after a language switch.
   ====================================================================== */
export function initScrollAnimations(shader: HeroShader) {
  return gsap.context(() => {
    const mm = gsap.matchMedia();

    /* ---- Hero: pause shader off-screen ---- */
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
      },
      (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;

        /* ---- Hero exit: words drift apart, media sinks ---- */
        const heroTl = gsap.timeline({
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        });
        heroTl
          .to('.hero__media', { yPercent: 30, scale: 1.12, ease: 'none' }, 0)
          .to('.hero__word:first-child', { xPercent: -14, ease: 'none' }, 0)
          .to('.hero__word--indent', { xPercent: 10, ease: 'none' }, 0)
          .to('.hero__inner', { yPercent: 18, opacity: 0.15, ease: 'none' }, 0)
          .to('.scroll-badge', { opacity: 0, ease: 'none' }, 0);

        /* ---- Section heading rules draw in ---- */
        gsap.utils.toArray<HTMLElement>('.section-head').forEach((head) => {
          gsap.fromTo(head, { '--head-line': 0 }, {
            '--head-line': 1, duration: 1.6, ease: EASE,
            scrollTrigger: { trigger: head, start: 'top 88%' },
          });
          gsap.from(head.children, {
            yPercent: 100, opacity: 0, duration: DUR, stagger: 0.08, ease: EASE,
            scrollTrigger: { trigger: head, start: 'top 88%' },
          });
        });

        /* ---- Manifesto: words light up with the scroll ---- */
        const manifesto = document.querySelector<HTMLElement>('[data-words]');
        if (manifesto) {
          const split = SplitText.create(manifesto, { type: 'words', wordsClass: 'word' });
          gsap.fromTo(split.words, { opacity: 0.12 }, {
            opacity: 1, stagger: 0.1, ease: 'none',
            scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 45%', scrub: true },
          });
        }

        /* ---- Line-by-line reveals (paragraphs + headings) ---- */
        gsap.utils.toArray<HTMLElement>('.reveal-lines, [data-split-lines]').forEach((el) => {
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110, duration: DUR, stagger: 0.08, ease: EASE,
                scrollTrigger: { trigger: el, start: 'top 85%' },
              }),
          });
        });

        /* ---- Parallax depth in the about grid ---- */
        gsap.utils.toArray<HTMLElement>('.about__col').forEach((col, i) => {
          gsap.fromTo(col, { y: i === 0 ? 40 : 120 }, {
            y: i === 0 ? -20 : -40, ease: 'none',
            scrollTrigger: { trigger: '.about__grid', start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });

        /* ---- Stats: counters + rules ---- */
        gsap.from('.stat', {
          y: 60, opacity: 0, duration: DUR, stagger: 0.1, ease: EASE,
          scrollTrigger: { trigger: '.stats', start: 'top 85%' },
        });
        gsap.utils.toArray<HTMLElement>('.js-count').forEach((el) => {
          const to = Number(el.dataset.to ?? el.textContent);
          const o = { v: 0 };
          gsap.to(o, {
            v: to, duration: 2, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
            onUpdate: () => { el.textContent = String(Math.round(o.v)); },
          });
        });

        /* ---- Expertise: horizontal pinned track on desktop ---- */
        const track = document.querySelector<HTMLElement>('.expertise__track');
        if (desktop && track) {
          const distance = () => track.scrollWidth - window.innerWidth;
          const horizontal = gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: '.expertise__pin',
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
          gsap.utils.toArray<HTMLElement>('.exp-card').forEach((card) => {
            gsap.from(card, {
              yPercent: 18, rotate: 3, opacity: 0.2, ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontal,
                start: 'left 100%',
                end: 'left 70%',
                scrub: true,
              },
            });
          });
        } else {
          gsap.utils.toArray<HTMLElement>('.exp-card').forEach((card) => {
            gsap.from(card, {
              y: 60, opacity: 0, duration: DUR, ease: EASE,
              scrollTrigger: { trigger: card, start: 'top 88%' },
            });
          });
        }

        /* ---- Marquee reacts to scroll velocity ---- */
        const row = document.querySelector<HTMLElement>('.marquee__row');
        if (row && !row.dataset.cloned) {
          row.innerHTML += row.innerHTML;
          row.dataset.cloned = '1';
        }
        if (row) {
          const loop = gsap.to(row, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
          const skewTo = gsap.quickTo(row, 'skewX', { duration: 0.6, ease: 'power3' });
          ScrollTrigger.create({
            trigger: '.marquee',
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => {
              const v = self.getVelocity();
              const dir = self.direction;
              gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 300, 6)), duration: 0.3, overwrite: true });
              gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.3 });
              skewTo(gsap.utils.clamp(-8, 8, v / -250));
            },
            onLeave: () => skewTo(0),
            onLeaveBack: () => skewTo(0),
          });
        }

        /* ---- Rows: jobs, works, education ---- */
        ScrollTrigger.batch('.job, .work, .edu, .edu-side__block', {
          start: 'top 92%',
          onEnter: (batch) =>
            gsap.from(batch, { y: 70, opacity: 0, duration: DUR, stagger: 0.08, ease: EASE, overwrite: true }),
          once: true,
        });

        /* ---- Education aside floats a little slower ---- */
        if (desktop) {
          gsap.fromTo('.edu-side', { y: 80 }, {
            y: -40, ease: 'none',
            scrollTrigger: { trigger: '.edu-grid', start: 'top bottom', end: 'bottom top', scrub: true },
          });
        }

        /* ---- Recommendations: wipe in ---- */
        gsap.utils.toArray<HTMLElement>('.reco').forEach((reco) => {
          gsap.from(reco.querySelector('.reco__quote'), {
            clipPath: 'inset(0 0 100% 0)', y: 40, duration: 1.6, ease: EASE,
            scrollTrigger: { trigger: reco, start: 'top 82%' },
          });
          gsap.from(reco.querySelector('.reco__meta'), {
            opacity: 0, x: -30, duration: DUR, ease: EASE,
            scrollTrigger: { trigger: reco, start: 'top 82%' },
          });
        });

        /* ---- Contact: the big line rises letter by letter ---- */
        const big = document.querySelector<HTMLElement>('.contact__big-line');
        if (big) {
          const split = SplitText.create(big, { type: 'chars', mask: 'chars', charsClass: 'char' });
          gsap.from(split.chars, {
            yPercent: 115, duration: 1.6, stagger: 0.04, ease: EASE,
            scrollTrigger: { trigger: '.contact', start: 'top 70%' },
          });
          gsap.fromTo('.contact__big', { xPercent: 6 }, {
            xPercent: -4, ease: 'none',
            scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom bottom', scrub: true },
          });
        }
        gsap.from('.contact__ctas > *, .contact__eyebrow', {
          y: 30, opacity: 0, duration: DUR, stagger: 0.08, ease: EASE,
          scrollTrigger: { trigger: '.contact__ctas', start: 'top 95%' },
        });
      },
    );

    /* ---- Light / dark bands: the whole page crossfades.
       Created last so their positions include the expertise pin spacing. ---- */
    gsap.utils.toArray<HTMLElement>('main > section').forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) document.body.classList.toggle('is-dark', section.dataset.themeBand === 'dark');
        },
      });
    });
  });
}
