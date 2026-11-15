export type Lang = 'fr' | 'en';
export type Dictionary = Record<string, string>;

const STORAGE_KEY = 'lang';

export function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    /* storage unavailable */
  }
  return 'fr';
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage unavailable */
  }
}

/**
 * Write every [data-i18n] key into the DOM and update document metadata.
 * Values may contain trusted markup (they come from our own locale files).
 */
export function applyTranslations(lang: Lang, dict: Dictionary, root: ParentNode = document) {
  document.documentElement.lang = lang;
  if (dict.doc_title) document.title = dict.doc_title;
  document.getElementById('meta-desc')?.setAttribute('content', dict.meta_desc ?? '');

  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (key && dict[key] !== undefined) el.innerHTML = dict[key];
  });

  root.querySelectorAll<HTMLElement>('[data-lang]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.lang === lang);
  });

  syncRollLabels(root);
}

/**
 * Hover "text roll": the label is duplicated in a clipped wrapper
 * (.rl__a visible, .rl__b waiting below, both slide up on hover).
 */
export function syncRollLabels(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.roll > span, .pill__text').forEach((el) => {
    const text = (el.querySelector('.rl__a')?.textContent ?? el.textContent ?? '').trim();
    const rl = document.createElement('span');
    rl.className = 'rl';
    const a = document.createElement('span');
    a.className = 'rl__a';
    a.textContent = text;
    const b = document.createElement('span');
    b.className = 'rl__b';
    b.setAttribute('aria-hidden', 'true');
    b.textContent = text;
    rl.append(a, b);
    el.replaceChildren(rl);
  });
}
