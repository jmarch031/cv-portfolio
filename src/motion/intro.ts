import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const EASE = 'expo.out';

interface IntroOptions {
  roles: string[];
  caption: string;
  reduced: boolean;
  onReveal: () => void; // hero is visible, page can be scrolled
}

/**
 * Intro: the career plays in fast-forward (one role after another, 2011 → 2026),
 * then the iridescent hero blooms from the centre and the headline rises.
 */
export function playIntro({ roles, caption, reduced, onReveal }: IntroOptions) {
  const intro = document.querySelector<HTMLElement>('.intro')!;
  const roleEl = intro.querySelector<HTMLElement>('.intro__role-text')!;
  const countEl = intro.querySelector<HTMLElement>('.intro__count')!;
  intro.querySelector<HTMLElement>('.intro__caption')!.textContent = caption;

  const done = () => {
    intro.remove();
    document.body.classList.remove('is-loading');
    onReveal();
  };

  if (reduced) {
    done();
    return;
  }

  gsap.set('.hero', { clipPath: 'circle(0% at 50% 50%)' });
  gsap.set('.hero__media', { scale: 1.4 });
  gsap.set(['.hero__caption', '.badge'], { autoAlpha: 0 });
  gsap.set('.nav', { autoAlpha: 0, y: -20 });

  const start = () => {
    const chars = gsap.utils
      .toArray<HTMLElement>('.hero__line')
      .flatMap((line) => SplitText.create(line, { type: 'chars', mask: 'chars', charsClass: 'char' }).chars);
    gsap.set(chars, { yPercent: 120 });

    const count = { v: 0 };
    const tl = gsap.timeline({ onComplete: done });
    const step = 0.42;

    roles.forEach((role, i) => {
      tl.call(() => { roleEl.textContent = role; }, [], i * step)
        .fromTo(roleEl, { yPercent: 110 }, { yPercent: 0, duration: step * 0.55, ease: 'power3.out' }, i * step)
        .to(roleEl, { yPercent: -110, duration: step * 0.4, ease: 'power3.in' }, i * step + step * 0.6);
    });

    const total = roles.length * step;
    tl.to(count, {
      v: 100,
      duration: total,
      ease: 'power1.inOut',
      onUpdate: () => { countEl.textContent = String(Math.round(count.v)).padStart(3, '0'); },
    }, 0)
      .to(['.intro__caption', '.intro__count'], { autoAlpha: 0, duration: 0.4 }, total)
      // Hero blooms from the centre
      .to(intro, { autoAlpha: 0, duration: 0.3 }, total)
      .to('.hero', { clipPath: 'circle(75% at 50% 50%)', duration: 1.6, ease: 'expo.inOut' }, total)
      .to('.hero__media', { scale: 1, duration: 2.4, ease: EASE }, total + 0.2)
      .to(chars, { yPercent: 0, duration: 1.5, stagger: 0.04, ease: EASE }, total + 0.7)
      .set('.hero', { clipPath: 'none' })
      .to('.nav', { autoAlpha: 1, y: 0, duration: 1.25, ease: EASE }, total + 1.1)
      .to(['.hero__caption', '.badge'], { autoAlpha: 1, duration: 1.25, stagger: 0.1, ease: EASE }, total + 1.2);
  };

  // Wait for the type so the split matches the final glyph metrics
  const fonts = document.fonts?.ready ?? Promise.resolve();
  Promise.race([fonts, new Promise((r) => setTimeout(r, 2500))]).then(start);
}
