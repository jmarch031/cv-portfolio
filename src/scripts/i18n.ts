import { splitText } from './utils';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * i18n management
 */
export function initI18n(initialLang: string, translations: any) {
  let currentLang = initialLang;

  function setLanguage(lang: string) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.title = lang === 'fr' ? "Julien Marchand — EM & Développeur" : "Julien Marchand — EM & Developer";
    
    const metaDesc = document.getElementById('meta-desc');
    if (metaDesc) {
      metaDesc.setAttribute('content', translations[lang].meta_desc);
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
        if (el.classList.contains('text-split')) {
          splitText(el as HTMLElement);
          el.querySelectorAll('.split-char').forEach(char => {
            if (char instanceof HTMLElement) {
              char.style.opacity = '1';
              char.style.transform = 'none';
            }
          });
        }
      }
    });

    const langBtnText = document.querySelector('#lang-toggle .btn-text');
    if (langBtnText instanceof HTMLElement) {
      langBtnText.innerText = lang === 'fr' ? 'EN' : 'FR';
    }

    const scrollIndicator = document.getElementById('global-scroll-indicator');
    const scrollTextElement = document.getElementById('scroll-text');
    if (scrollIndicator && scrollTextElement) {
      scrollTextElement.innerText = scrollIndicator.classList.contains('up') 
        ? translations[lang].scroll_up 
        : translations[lang].scroll_down;
    }

    setTimeout(() => ScrollTrigger.refresh(), 100);
  }

  const langToggle = document.getElementById('lang-toggle');
  langToggle?.addEventListener('click', () => {
    setLanguage(currentLang === 'fr' ? 'en' : 'fr');
  });

  return { 
    setLanguage, 
    getCurrentLang: () => currentLang 
  };
}
