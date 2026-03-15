# Quick Task: Hide Header Copyright on Mobile

## Context
The copyright text "© 2026 — EM & Développeur" in the header causes layout shifts or spacing issues on mobile devices. The user wants to hide it on small screens.

## Strategy
1. **Update HTML:** The element already has a `hide-mobile` class. I need to verify if this class is correctly defined in the CSS to hide the element on mobile.
2. **Update CSS:** If `hide-mobile` is not defined or needs adjustment, update `src/styles/responsive.css`.
3. **Verify:** Ensure the text is visible on desktop and hidden on mobile.

## Tasks
1. [x] Verify definition of `.hide-mobile` class in CSS.
2. [x] Update `src/styles/responsive.css` if necessary.
3. [x] Update `STATE.md`.
