// Footer year
document.getElementById('y').textContent = new Date().getFullYear();

// Detect touch device
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Magnetic buttons (desktop only for performance)
if (!isTouchDevice) {
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const mx = clamp((e.clientX - rect.left) / rect.width * 100, 0, 100);
            const my = clamp((e.clientY - rect.top) / rect.height * 100, 0, 100);
            btn.style.setProperty('--mx', mx + '%');
            btn.style.setProperty('--my', my + '%');
        });
    });
}

// Click ripple effect (optimized for mobile)
(function(){
    const ripple = document.getElementById('ripple');
    if (!ripple) return;

    const handleClick = (e) => {
        // Use touch coordinates if available, otherwise mouse coordinates
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        ripple.style.left = clientX + 'px';
        ripple.style.top = clientY + 'px';
        ripple.style.opacity = 1;
        ripple.style.transition = 'none';
        ripple.style.width = '12px';
        ripple.style.height = '12px';

        requestAnimationFrame(() => {
            ripple.style.transition = 'opacity .6s ease, width .6s ease, height .6s ease';
            ripple.style.width = isTouchDevice ? '180px' : '240px';
            ripple.style.height = isTouchDevice ? '180px' : '240px';
            ripple.style.opacity = 0;
        });
    };

    // Use both click and touchstart for better mobile support
    addEventListener('click', handleClick);
    if (isTouchDevice) {
        addEventListener('touchstart', handleClick, { passive: true });
    }
})();

// Reveal elements on scroll (optimized for mobile)
(function initReveal(){
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: isTouchDevice ? '0px 0px -5% 0px' : '0px 0px -10% 0px',
        threshold: isTouchDevice ? 0.05 : 0.12
    });

    elements.forEach(el => io.observe(el));
})();

// Timeline experience expansion (enhanced for mobile)
(function initTimelineExpansion(){
    const timelineItems = document.querySelectorAll('.tl-item');
    if (!timelineItems.length) return;

    timelineItems.forEach(item => {
        const expandIcon = item.querySelector('.expand-icon');
        if (!expandIcon) return;

        // Enhanced touch support - ONLY on the expand icon
        const handleToggle = (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleTimelineItem(item, expandIcon);
        };

        // Use both click and touch events ONLY on the expand icon
        expandIcon.addEventListener('click', handleToggle);

        if (isTouchDevice) {
            expandIcon.addEventListener('touchend', handleToggle, { passive: false });
        }
    });

    function toggleTimelineItem(item, expandIcon) {
        const isExpanded = item.classList.contains('expanded');

        // Close other expanded items on mobile for better UX
        if (!isExpanded && isTouchDevice && window.innerWidth <= 768) {
            document.querySelectorAll('.tl-item.expanded').forEach(expandedItem => {
                if (expandedItem !== item) {
                    expandedItem.classList.remove('expanded');
                    const otherIcon = expandedItem.querySelector('.expand-icon');
                    if (otherIcon) otherIcon.textContent = '+';
                }
            });
        }

        if (isExpanded) {
            // Collapse
            item.classList.remove('expanded');
            expandIcon.textContent = '+';
        } else {
            // Expand
            item.classList.add('expanded');
            expandIcon.textContent = '×';

            // Enhanced scroll behavior for mobile
            setTimeout(() => {
                const rect = item.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const isPartiallyVisible = rect.bottom > viewportHeight * 0.8;

                if (isPartiallyVisible) {
                    const scrollOptions = {
                        behavior: 'smooth',
                        block: isTouchDevice ? 'start' : 'nearest'
                    };

                    // Add offset for mobile to account for virtual keyboards
                    if (isTouchDevice) {
                        const offset = window.innerWidth <= 480 ? 20 : 40;
                        window.scrollTo({
                            top: window.scrollY + rect.top - offset,
                            behavior: 'smooth'
                        });
                    } else {
                        item.scrollIntoView(scrollOptions);
                    }
                }
            }, 300); // Increased delay for mobile animations
        }
    }
})();

// Skills expansion functionality (similar to timeline)
(function initSkillsExpansion(){
    const skillItems = document.querySelectorAll('.skill-item');
    if (!skillItems.length) return;

    skillItems.forEach(item => {
        const expandIcon = item.querySelector('.expand-icon');
        if (!expandIcon) return;

        // Enhanced touch support - ONLY on the expand icon
        const handleToggle = (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleSkillItem(item, expandIcon);
        };

        // Use both click and touch events ONLY on the expand icon
        expandIcon.addEventListener('click', handleToggle);

        if (isTouchDevice) {
            expandIcon.addEventListener('touchend', handleToggle, { passive: false });
        }
    });

    function toggleSkillItem(item, expandIcon) {
        const isExpanded = item.classList.contains('expanded');

        // Close other expanded items on mobile for better UX
        if (!isExpanded && isTouchDevice && window.innerWidth <= 768) {
            document.querySelectorAll('.skill-item.expanded').forEach(expandedItem => {
                if (expandedItem !== item) {
                    expandedItem.classList.remove('expanded');
                    const otherIcon = expandedItem.querySelector('.expand-icon');
                    if (otherIcon) otherIcon.textContent = '+';
                }
            });
        }

        if (isExpanded) {
            // Collapse
            item.classList.remove('expanded');
            expandIcon.textContent = '+';
        } else {
            // Expand
            item.classList.add('expanded');
            expandIcon.textContent = '×';

            // Enhanced scroll behavior for mobile
            setTimeout(() => {
                const rect = item.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const isPartiallyVisible = rect.bottom > viewportHeight * 0.8;

                if (isPartiallyVisible) {
                    const scrollOptions = {
                        behavior: 'smooth',
                        block: isTouchDevice ? 'start' : 'nearest'
                    };

                    // Add offset for mobile to account for virtual keyboards
                    if (isTouchDevice) {
                        const offset = window.innerWidth <= 480 ? 20 : 40;
                        window.scrollTo({
                            top: window.scrollY + rect.top - offset,
                            behavior: 'smooth'
                        });
                    } else {
                        item.scrollIntoView(scrollOptions);
                    }
                }
            }, 300); // Increased delay for mobile animations
        }
    }
})();

// Content filter for education section (mobile optimized)
(function initEducationFilter(){
    const buttons = document.querySelectorAll('#education .filter-btn');
    const cards = document.querySelectorAll('#eduGrid .edu');
    if (!buttons.length || !cards.length) return;

    // Sort education cards by default order
    function sortEducationCards() {
        const container = document.getElementById('eduGrid');
        if (!container) return;

        const cardsArray = Array.from(cards);

        cardsArray.sort((a, b) => {
            // Sort by year (oldest to newest)
            const yearA = extractYear(a);
            const yearB = extractYear(b);

            return yearA - yearB;
        });

        // Reorder DOM elements
        cardsArray.forEach(card => container.appendChild(card));
    }

    function extractYear(card) {
        const badge = card.querySelector('.badge.year, .badge.cert, .badge.training');
        if (!badge) return 0;

        const text = badge.textContent.trim();
        const yearMatch = text.match(/(\d{4})/);
        return yearMatch ? parseInt(yearMatch[1]) : 0;
    }

    // Apply default sorting on load
    sortEducationCards();

    function applyFilter(tag) {
        cards.forEach(card => {
            if (tag === 'all') {
                card.style.display = '';
                return;
            }
            const tags = (card.getAttribute('data-tags') || '').split(/\s+/);
            card.style.display = tags.includes(tag) ? '' : 'none';
        });

        // Scroll to content on mobile after filtering
        if (isTouchDevice && window.innerWidth <= 768) {
            setTimeout(() => {
                const eduGrid = document.getElementById('eduGrid');
                if (eduGrid) {
                    eduGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }

    buttons.forEach(button => {
        const handleFilter = () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            applyFilter(button.dataset.filter);
        };

        button.addEventListener('click', handleFilter);
        if (isTouchDevice) {
            button.addEventListener('touchend', handleFilter, { passive: true });
        }
    });
})();

// Content filter for talks/articles section (mobile optimized)
(function initContentFilter(){
    const buttons = document.querySelectorAll('#talks .filter-btn');
    const cards = document.querySelectorAll('#contentGrid .card');
    if (!buttons.length || !cards.length) return;

    // Sort content cards by default order
    function sortContentCards() {
        const container = document.getElementById('contentGrid');
        if (!container) return;

        const cardsArray = Array.from(cards);

        cardsArray.sort((a, b) => {
            // Sort by year (newest to oldest)
            const yearA = extractContentYear(a);
            const yearB = extractContentYear(b);

            return yearB - yearA;
        });

        // Reorder DOM elements
        cardsArray.forEach(card => container.appendChild(card));
    }

    function extractContentYear(card) {
        const badge = card.querySelector('.badge.year, .badge.cert, .badge.training');
        if (!badge) return 0;

        const text = badge.textContent.trim();
        const yearMatch = text.match(/(\d{4})/);
        return yearMatch ? parseInt(yearMatch[1]) : 0;
    }

    // Apply default sorting on load
    sortContentCards();

    function applyFilter(tag) {
        cards.forEach(card => {
            if (tag === 'all') {
                card.style.display = '';
                return;
            }
            const tags = (card.getAttribute('data-tags') || '').split(/\s+/);
            card.style.display = tags.includes(tag) ? '' : 'none';
        });

        // Scroll to content on mobile after filtering
        if (isTouchDevice && window.innerWidth <= 768) {
            setTimeout(() => {
                const contentGrid = document.getElementById('contentGrid');
                if (contentGrid) {
                    contentGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }

    buttons.forEach(button => {
        const handleFilter = () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            applyFilter(button.dataset.filter);
        };

        button.addEventListener('click', handleFilter);
        if (isTouchDevice) {
            button.addEventListener('touchend', handleFilter, { passive: true });
        }
    });
})();

// Typing animation effect
(function initTypedEffect(){
    const elements = document.querySelectorAll('.typed');
    if (!elements.length) return;

    elements.forEach(el => {
        const items = JSON.parse(el.getAttribute('data-rotate') || '[]');
        if (!items.length) return;

        let currentIndex = 0, charIndex = 0, direction = 1, currentText = '';
        // Slower animation on mobile for better readability
        const getSpeed = () => isTouchDevice ? 35 + Math.random() * 50 : 28 + Math.random() * 42;

        (function typeLoop() {
            const target = items[currentIndex] || '';

            if (direction > 0) {
                currentText = target.slice(0, charIndex++);
                if (charIndex > target.length + (isTouchDevice ? 20 : 12)) direction = -1;
            } else {
                currentText = target.slice(0, charIndex--);
                if (charIndex <= 0) {
                    direction = 1;
                    currentIndex = (currentIndex + 1) % items.length;
                }
            }

            el.textContent = currentText + (Date.now() % 800 < 400 ? '' : ' ');
            setTimeout(typeLoop, getSpeed());
        })();
    });
})();

// Card tilt effect (disabled on mobile for performance)
(function initCardTilt(){
    if (isTouchDevice) return; // Disable on touch devices

    const cards = document.querySelectorAll('.card');
    if (!cards.length) return;

    cards.forEach(card => {
        let rafId = 0;

        function handleMouseMove(e) {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                card.style.transform = `perspective(700px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-2px)`;
                card.style.boxShadow = '0 18px 40px rgba(20,35,80,0.22)';
            });
        }

        function resetCard() {
            card.style.transform = '';
            card.style.boxShadow = '';
        }

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', resetCard);
    });
})();

// Parallax scrolling effect (reduced on mobile)
(function initParallax(){
    const heroLeft = document.querySelector('.hero-left');
    const heroRight = document.querySelector('.hero-right');
    const titles = document.querySelectorAll('.section-title');

    if (!heroLeft && !heroRight && !titles.length) return;

    // Reduce parallax intensity on mobile for performance
    const parallaxIntensity = isTouchDevice ? 0.5 : 1;

    let ticking = false;
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY || 0;

                if (heroLeft) heroLeft.style.transform = `translateY(${scrollY * 0.02 * parallaxIntensity}px)`;
                if (heroRight) heroRight.style.transform = `translateY(${scrollY * 0.03 * parallaxIntensity}px)`;

                ticking = false;
            });
            ticking = true;
        }
    }

    addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
})();

// Viewport height fix for mobile browsers
(function fixMobileViewport(){
    if (!isTouchDevice) return;

    function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setVH();
    addEventListener('resize', setVH, { passive: true });
    addEventListener('orientationchange', () => {
        setTimeout(setVH, 100);
    }, { passive: true });
})();

// Optimize images for mobile
(function optimizeImagesForMobile(){
    if (!isTouchDevice) return;

    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.loading = 'eager'; // Load images immediately on mobile for better UX
    });
})();

// Prevent zoom on input focus (mobile)
(function preventZoomOnFocus(){
    if (!isTouchDevice) return;

    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
            }
        });

        input.addEventListener('blur', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1');
            }
        });
    });
})();
