# Conventions

## Coding Standards
- **Vanilla Frontend**: The project avoids heavy frameworks (like React or Vue), opting for modern Vanilla JS and CSS3 to minimize bundle size and complexity.
- **Modern CSS**: Extensive use of `clamp()`, `calc()`, and CSS Variables for responsive scaling without excessive media queries.
- **BEM-ish Naming**: Classes follow a descriptive, component-based naming convention (e.g., `btn-primary`, `glass-card`, `exp-item`).
- **Semantic HTML**: Proper use of `<header>`, `<nav>`, `<main>`, `<section>`, and `<footer>` tags for accessibility and SEO.

## Internationalization (i18n)
- All user-facing strings are stored in a central `translations` object within the script tag.
- Elements use `data-i18n` attributes for dynamic content replacement.
- The `setLanguage()` function handles the switching logic, including updating metadata and refreshing layout calculations.

## Animation Conventions
- All significant visual transitions must be handled by GSAP for performance (hardware acceleration) and ease of timing management.
- Scroll-triggered animations should use a `scrub` value for a tactile link between user action and visual feedback.
- "Hover" states for interactive elements include a custom cursor expansion and magnetic movement effects.
