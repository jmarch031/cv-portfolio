# Technology Stack

## Core Technologies
- **HTML5**: Primary document structure for the portfolio.
- **CSS3**: Implements responsive design using CSS Grid, Flexbox, and CSS Variables. Features a "glassmorphism" aesthetic.
- **JavaScript (ES6+)**: Handles all client-side logic, including theme switching, i18n, and animations.

## Build and Developer Tools
- **Static Assets**: The project currently operates as a standalone static HTML/CSS/JS site with no active build system (Vite is not used).
- **Husky**: Git hooks manager (found in `.husky/pre-commit`).
- **Standard Formatting**: Likely relies on global or IDE-level formatters since no local configuration (like `package.json`) is present.

## Libraries and Frameworks
- **GSAP (GreenSock Animation Platform) v3.12.5**: Core animation engine for scroll-triggered effects and interactive elements.
- **ScrollTrigger (GSAP Plugin)**: Manages timeline-based animations synchronized with page scrolling.
- **Lenis v1.0.34**: Smooth scrolling library for improved UX.
- **Google Fonts**: Custom typography using Plus Jakarta Sans and Space Mono.
