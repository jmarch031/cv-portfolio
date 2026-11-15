import { describe, it, expect, beforeEach } from 'vitest';
import { applyTranslations } from '../i18n';
import fr from '../../../public/locales/fr.json';
import en from '../../../public/locales/en.json';

describe('applyTranslations', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="description" id="meta-desc" content="">';
    document.body.innerHTML = `
      <button data-lang="fr"></button><button data-lang="en"></button>
      <a class="roll"><span data-i18n="menu_about"></span></a>
      <p data-i18n="unknown_key">kept</p>
    `;
  });

  it('writes keys, metadata and active language', () => {
    applyTranslations('en', en);
    expect(document.documentElement.lang).toBe('en');
    expect(document.querySelector('[data-i18n="menu_about"] .rl__a')?.textContent).toBe('About');
    expect(document.getElementById('meta-desc')?.getAttribute('content')).toBe(en.meta_desc);
    expect(document.querySelector('[data-lang="en"]')?.classList.contains('is-active')).toBe(true);
    expect(document.querySelector('[data-lang="fr"]')?.classList.contains('is-active')).toBe(false);
  });

  it('keeps the existing text when a key is missing', () => {
    applyTranslations('fr', fr);
    expect(document.querySelector('[data-i18n="unknown_key"]')?.textContent).toBe('kept');
  });

  it('syncs the text-roll duplicate label', () => {
    applyTranslations('fr', fr);
    const span = document.querySelector<HTMLElement>('.roll > span')!;
    expect(span.querySelector('.rl__a')?.textContent).toBe('À propos');
    expect(span.querySelector('.rl__b')?.textContent).toBe('À propos');
    expect(span.textContent).toBe('À proposÀ propos');
    // idempotent
    applyTranslations('en', en);
    expect(span.querySelector('.rl__a')?.textContent).toBe('About');
  });

  it('has the same keys in both locales', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
  });
});
