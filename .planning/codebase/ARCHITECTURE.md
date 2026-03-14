# Architecture

## System Design
The project is a high-fidelity, single-page interactive portfolio built as a static web application. It follows a "Single-File Component" philosophy where the structure, styling, and logic are primarily contained within `index.html` for maximum performance and simplicity in deployment.

## Key Architectural Patterns
- **Curtain Reveal Pattern**: The layout is split between a fixed `hero-section` and a scrollable `main-content`. A "curtain" effect, managed via GSAP and CSS positioning, reveals the main content as the user scrolls.
- **Glassmorphism**: A consistent design language using `backdrop-filter`, semi-transparent backgrounds, and subtle borders to create a layered, modern aesthetic.
- **Theme Engine**: A robust dark/light mode implementation using CSS custom properties (variables) toggled via a `data-theme` attribute on the root element.
- **State Management (JS)**: Handled natively through DOM attributes and a global `translations` object. State transitions (like opening the menu or switching themes) are orchestrated by GSAP to ensure smooth visual feedback.

## Animation & Interaction Strategy
- **Smooth Scroll**: Powered by `Lenis` to provide a consistent, premium feel across different browsers.
- **Timeline-based Animations**: Uses `GSAP` and `ScrollTrigger` to link visual transformations (scaling, opacity, path drawing) directly to the scroll position.
- **Responsive Adaptability**: Uses `gsap.matchMedia` to switch between horizontal and vertical scroll behaviors based on screen width.
