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
    for (const id of ['top', 'statement', 'story', 'skills', 'journey', 'education', 'contact']) {
      expect(document.getElementById(id), id).not.toBeNull();
    }
    expect(document.querySelectorAll('.act')).toHaveLength(fr.story.acts.length);
    expect(document.querySelectorAll('.job')).toHaveLength(fr.journey.jobs.length);
    expect(document.querySelectorAll('.panel-item')).toHaveLength(fr.journey.jobs.length);
    expect(document.querySelectorAll('.skill')).toHaveLength(fr.skills.items.length);
    expect(document.querySelectorAll('.reco')).toHaveLength(recos.length);
  });

  it('every in-page link points to an existing section', () => {
    document.querySelector('.nav')!.innerHTML = renderHeader(en, 'en');
    document.querySelector('#app')!.innerHTML = renderMain(en, recos);
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
      expect(document.querySelector(a.getAttribute('href')!), a.getAttribute('href')!).not.toBeNull();
    });
    expect(document.querySelector('[data-lang="en"]')?.classList.contains('is-active')).toBe(true);
  });

  it('escapes recommendation content', () => {
    document.querySelector('#app')!.innerHTML = renderMain(fr, [{ name: '<b>x</b>', role: 'r', quote: 'q', excerpt: 'q' }]);
    expect(document.querySelector('.reco__name b')).toBeNull();
    expect(document.querySelector('.reco__name')?.textContent).toBe('<b>x</b>');
  });

  it('omits the recommendations section when there are none', () => {
    document.querySelector('#app')!.innerHTML = renderMain(fr, []);
    expect(document.querySelector('.recos')).toBeNull();
  });
});
