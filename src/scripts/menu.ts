import gsap from 'gsap';
import Lenis from 'lenis';

/**
 * Menu and navigation management
 */
export function initMenu(lenis: Lenis, translations: any, currentLang: string) {
  const menuToggle = document.getElementById('menu-toggle');
  const menuToggleText = document.getElementById('menu-toggle-text');
  const menuOverlay = document.getElementById('menu-overlay');
  const menuBg = document.querySelector('.menu-bg');
  const menuLinks = document.querySelectorAll('.menu-link');
  const menuCloseTrigger = document.querySelector('.menu-close-trigger');
  
  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
    if (menuOpen) {
      if (menuOverlay instanceof HTMLElement) {
        menuOverlay.style.visibility = 'visible';
        menuOverlay.classList.add('is-open');
      }
      gsap.to(menuBg, { opacity: 0.95, duration: 0.6, ease: "power3.out" });
      gsap.to(menuLinks, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 });
      if (menuToggleText) menuToggleText.innerText = translations[currentLang].menu_close;
      lenis.stop();
    } else {
      gsap.to(menuLinks, { opacity: 0, y: -20, duration: 0.4, stagger: 0.05, ease: "power2.in" });
      gsap.to(menuBg, {
        opacity: 0,
        duration: 0.6,
        ease: "power3.inOut",
        delay: 0.3,
        onComplete: () => {
          if (menuOverlay instanceof HTMLElement) {
            menuOverlay.style.visibility = 'hidden';
            menuOverlay.classList.remove('is-open');
          }
        }
      });
      if (menuToggleText) menuToggleText.innerText = translations[currentLang].menu_btn;
      lenis.start();
    }
  }

  menuToggle?.addEventListener('click', toggleMenu);

  menuCloseTrigger?.addEventListener('click', (e) => {
    e.preventDefault();
    if (menuOpen) toggleMenu();
    lenis.scrollTo(0, { duration: 1.5 });
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (!targetId) return;
      
      const targetEl = document.querySelector(targetId);
      if (menuOpen) toggleMenu();
      if (targetEl) {
        lenis.scrollTo(targetEl as HTMLElement, { offset: 0, duration: 1.5 });
      }
    });
  });

  return { toggleMenu, isMenuOpen: () => menuOpen };
}
