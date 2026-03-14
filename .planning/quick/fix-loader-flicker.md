# Quick Task: Fix Loader Flicker

## Context
Page elements appear briefly before the loader is shown, causing a "flicker" effect. This is likely due to CSS loading asynchronously after the initial HTML render.

## Strategy
1. **Inlined Critical CSS:** Inline the essential styles for the preloader directly into the `<head>` of `index.html`. This ensures the loader is visible and correctly positioned immediately.
2. **Initial Content Visibility:** Set the initial opacity of main sections (header, main) to 0 in the HTML/CSS and reveal them only through the GSAP animation in `animations.ts`.
3. **Optimized Timing:** Ensure the transition between the loader finishing and the content appearing is seamless.

## Tasks
1. [x] Extract critical preloader CSS from `components.css`.
2. [x] Inline this CSS into `index.html`.
3. [x] Set initial `opacity: 0` for `header` and `main` in `index.html` or through a global style.
4. [x] Verify that the GSAP animation correctly reveals these elements.
5. [x] Update `STATE.md`.
