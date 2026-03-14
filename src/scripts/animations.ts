import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { splitText } from './utils';

gsap.registerPlugin(ScrollTrigger);

/**
 * Global animations management
 */
export function initAnimations(lenis: Lenis, translations: any, currentLang: string) {
  
  // Custom cursor and spotlight
  const cursor = document.querySelector('.cursor');
  const spotlight = document.querySelector('.mouse-glow');
  
  window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
    gsap.to(spotlight, { x: e.clientX, y: e.clientY, duration: 0.8, ease: "power3.out" });
  });

  const updateHoverElements = () => {
    document.querySelectorAll('a, .nav-hover, button, .menu-link').forEach(el => {
      el.addEventListener('mouseenter', () => cursor?.classList.add('hover-active'));
      el.addEventListener('mouseleave', () => cursor?.classList.remove('hover-active'));
    });
  };
  updateHoverElements();

  // Magnetic buttons
  document.querySelectorAll('.magnetic-btn:not(.project-card)').forEach(elem => {
    const text = elem.querySelector('.btn-text') || elem.querySelector('svg');
    elem.addEventListener('mousemove', (e: any) => {
      const rect = elem.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
      gsap.to(elem, { x: x, y: y, duration: 0.3, ease: "power2.out" });
      if(text) gsap.to(text, { x: x*0.5, y: y*0.5, duration: 0.3, ease: "power2.out" });
    });
    elem.addEventListener('mouseleave', () => {
      gsap.to(elem, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
      if(text) gsap.to(text, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
  });

  // Preloader and Initial Animation
  const init = () => {
    splitText('.text-split');
    const tl = gsap.timeline();
    const loaderText = document.getElementById('ascii-loader');
    const targetText = "JULIEN MARCHAND";
    let iter = 0; 
    let counter = { value: 0 };
    
    gsap.to(counter, { 
      value: 100, 
      duration: 3.0, 
      ease: "power2.inOut", 
      onUpdate: () => { 
        const counterEl = document.getElementById('loader-counter');
        if (counterEl) counterEl.innerText = Math.round(counter.value) + "%"; 
      } 
    });

    const loaderInterval = setInterval(() => {
      if (loaderText) {
        loaderText.innerText = targetText.split("").map((_, index) => 
          index < Math.floor(iter) ? targetText[index] : (Math.random() > 0.5 ? "0" : "1")
        ).join("");
      }
      if(iter >= targetText.length) { 
        clearInterval(loaderInterval); 
        if (loaderText) loaderText.innerText = targetText; 
      }
      iter += 0.15;
    }, 30);

    tl.to('.preloader-bar', { width: "100%", duration: 3.0, ease: "power2.inOut" })
      .to('.preloader-content', { opacity: 0, y: -20, duration: 0.4 })
      .to('.preloader', { yPercent: -100, duration: 1, ease: "power4.inOut" }, "+=0.1")
      .to('main', { opacity: 1, duration: 0 }, "-=1") // Reveal main content as preloader slides up
      .to('.split-char', { y: "0%", opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.02, ease: "power4.out" }, "-=0.4")
      .to('.fade-reveal-header', { opacity: 1, duration: 1, ease: "power3.out" }, "-=0.8")
      .to('.fade-reveal', { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" }, "-=0.8");

    setTimeout(() => { 
      document.getElementById('global-scroll-indicator')?.classList.add('visible'); 
    }, 4000);

    gsap.utils.toArray<SVGPathElement>('.path-hero').forEach(path => {
      const length = path.getTotalLength() || 800;
      gsap.set(path, { opacity: 1, strokeDasharray: length, strokeDashoffset: length });
      tl.to(path, { strokeDashoffset: 0, duration: 2.5, ease: "power3.out" }, "-=1");
    });

    gsap.to('.hero-content', { 
      y: "-20vh", 
      opacity: 0, 
      scale: 0.95, 
      filter: "blur(10px)", 
      ease: "none", 
      scrollTrigger: { 
        trigger: ".main-content", 
        start: "top bottom", 
        end: "top top", 
        scrub: true 
      } 
    });

    gsap.to('.video-layer', {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".main-content",
        start: "top bottom",
        end: "top 20%",
        scrub: true
      }
    });

    // Wait a bit before initializing scroll doodles to ensure layout is ready
    setTimeout(() => {
      animateDoodlesScroll();
    }, 1000);
    
    gsap.from("footer", { 
      yPercent: -30, 
      opacity: 0, 
      ease: "none", 
      scrollTrigger: { 
        trigger: "footer", 
        start: "top bottom", 
        end: "bottom bottom", 
        scrub: true 
      } 
    });

    // Scroll to Top Logic
    ScrollTrigger.create({
      trigger: "footer",
      start: "top 95%",
      onEnter: () => {
        const indicator = document.getElementById('global-scroll-indicator');
        const textEl = document.getElementById('scroll-text');
        if(indicator && textEl) {
          indicator.classList.add('up');
          textEl.innerText = translations[currentLang].scroll_up;
        }
      },
      onLeaveBack: () => {
        const indicator = document.getElementById('global-scroll-indicator');
        const textEl = document.getElementById('scroll-text');
        if(indicator && textEl) {
          indicator.classList.remove('up');
          textEl.innerText = translations[currentLang].scroll_down;
        }
      }
    });

    const globalScrollIndicator = document.getElementById('global-scroll-indicator');
    if(globalScrollIndicator) {
      globalScrollIndicator.addEventListener('click', function() {
        if (this.classList.contains('up')) {
          lenis.scrollTo(0, { duration: 1.5 });
        }
      });
    }

    setTimeout(() => { ScrollTrigger.refresh(); }, 100);
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  // Responsive MatchMedia
  let mm = gsap.matchMedia();
  mm.add("(min-width: 1025px)", () => {
    const container = document.querySelector('.horizontal-content') as HTMLElement;
    if (!container) return;
    
    let horizTween = gsap.to(container, { 
      x: () => -(container.scrollWidth - window.innerWidth) + "px", 
      ease: "none", 
      scrollTrigger: { 
        trigger: ".horizontal-wrap", 
        pin: true, 
        scrub: 1, 
        end: () => "+=" + container.scrollWidth, 
        invalidateOnRefresh: true, 
        anticipatePin: 1 
      } 
    });
    
    gsap.utils.toArray('.skill-card').forEach((card: any) => { 
      ScrollTrigger.create({ 
        trigger: card, 
        containerAnimation: horizTween, 
        start: "left 65%", 
        end: "right 35%", 
        toggleClass: "is-focused" 
      }); 
    });
  });

  mm.add("(max-width: 1024px)", () => { 
    gsap.utils.toArray('.skill-card').forEach((card: any) => { 
      ScrollTrigger.create({ 
        trigger: card, 
        start: "top 70%", 
        end: "bottom 30%", 
        toggleClass: "is-focused" 
      }); 
    }); 
  });

  function animateDoodlesScroll() {
    gsap.utils.toArray<SVGGeometryElement>('.path-narrative').forEach(path => {
      const length = path.getTotalLength();
      gsap.set(path, { opacity: 1, strokeDasharray: length, strokeDashoffset: length });

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: path.closest('.h-section') || path.closest('section'),
          start: "top 85%",
          end: "bottom 30%",
          scrub: 1.5
        }
      });
    });

    gsap.utils.toArray<SVGPathElement>('.path-horizontal').forEach(path => {
      const length = path.getTotalLength();
      gsap.set(path, { opacity: 1, strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, { 
        strokeDashoffset: 0, 
        ease: "none", 
        scrollTrigger: { 
          trigger: ".horizontal-wrap", 
          start: "top 60%", 
          end: () => "+=" + (document.querySelector('.horizontal-content')?.scrollWidth || 0), 
          scrub: 1.5 
        } 
      });
    });
  }

  gsap.utils.toArray('.skill-focus-item').forEach((item: any) => { 
    ScrollTrigger.create({ 
      trigger: item, 
      start: "top 70%", 
      end: "bottom 30%", 
      toggleClass: "is-active" 
    }); 
  });
}
