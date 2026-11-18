import { describe, it, expect, beforeEach } from 'vitest';
import { esc, renderHeader, renderMain } from '../render';
import { fr } from '../content/fr';
import { en } from '../content/en';
import recos from '../data/recommendations.json';

describe('esc', () => {
  it('escapes HTML special characters', () => {
    expect(esc(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});

describe('renderMain', () => {
  beforeEach(() => {
    document.body.innerHTML = '<header class="nav"></header><main id="app"></main>';
  });

  it('renders every section with the expected anchors', () => {
    document.querySelector('#app')!.innerHTML = renderMain(fr, recos);
    for (const id of ['top', 'statement', 'story', 'skills', 'journey', 'writing', 'education', 'contact']) {
      expect(document.getElementById(id), id).not.toBeNull();
    }
    expect(document.querySelectorAll('.act')).toHaveLength(fr.story.acts.length);
    expect(document.querySelectorAll('.job')).toHaveLength(fr.journey.jobs.length);
    expect(document.querySelectorAll('.panel-item')).toHaveLength(fr.journey.jobs.length);
    const allTech = fr.skills.stack.flatMap((g) => g.items);
    const wall = Array.from(document.querySelectorAll('.wall__item'));
    expect(wall).toHaveLength(allTech.length);
    // current technologies come first, then the earlier ones
    const firstPast = wall.findIndex((li) => !li.classList.contains('is-now'));
    expect(wall.slice(firstPast).every((li) => !li.classList.contains('is-now'))).toBe(true);
    expect(firstPast).toBe(allTech.filter((t) => t.now).length);
    expect(document.querySelectorAll('.conviction')).toHaveLength(fr.skills.convictions.length);
    expect(document.querySelectorAll('.reco')).toHaveLength(recos.length);
    expect(document.querySelectorAll('.work')).toHaveLength(fr.writing.items.length);
    expect(document.querySelectorAll('a.work__link')).toHaveLength(fr.writing.items.filter((w) => w.href).length);
  });

  it('every in-page link points to an existing section', () => {
    document.querySelector('.nav')!.innerHTML = renderHeader(en, 'en', 'dark');
    document.querySelector('#app')!.innerHTML = renderMain(en, recos);
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
      expect(document.querySelector(a.getAttribute('href')!), a.getAttribute('href')!).not.toBeNull();
    });
    expect(document.querySelector('[data-lang="en"]')?.classList.contains('is-active')).toBe(true);
  });

  it('labels the theme toggle with the theme it switches to', () => {
    document.querySelector('.nav')!.innerHTML = renderHeader(fr, 'fr', 'dark');
    const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')!;
    expect(btn.textContent?.trim()).toBe(fr.nav.toLight);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    document.querySelector('.nav')!.innerHTML = renderHeader(fr, 'fr', 'light');
    expect(document.querySelector('[data-theme-toggle]')?.textContent?.trim()).toBe(fr.nav.toDark);
  });

  it('escapes recommendation content', () => {
    document.querySelector('#app')!.innerHTML = renderMain(fr, [{ name: '<b>x</b>', role: 'r', quote: 'q', excerpt: 'q' }]);
    expect(document.querySelector('.reco__name b')).toBeNull();
    expect(document.querySelector('.reco__name')?.textContent).toBe('<b>x</b>');
  });

  it('shows translated recommendations in English, originals in French', () => {
    const app = document.querySelector('#app')!;
    app.innerHTML = renderMain(en, recos, 'en');
    expect(app.querySelector('.reco__excerpt')?.textContent).toContain(recos[0].excerpt_en);
    app.innerHTML = renderMain(fr, recos, 'fr');
    expect(app.querySelector('.reco__excerpt')?.textContent).toContain(recos[0].excerpt);
  });

  it('gives every work a cover and the statement a portrait', () => {
    const app = document.querySelector('#app')!;
    app.innerHTML = renderMain(fr, recos, 'fr');
    expect(app.querySelectorAll('.work__cover img')).toHaveLength(fr.writing.items.length);
    expect(app.querySelector('.portrait__img')?.getAttribute('alt')).toBe(fr.statement.portraitAlt);
  });

  it('omits the recommendations section when there are none', () => {
    document.querySelector('#app')!.innerHTML = renderMain(fr, []);
    expect(document.querySelector('.recos')).toBeNull();
  });
});
