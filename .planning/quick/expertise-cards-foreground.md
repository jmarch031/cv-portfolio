# Quick Task: Expertise Cards Foreground

## Goal
Ensure expertise cards appear in the foreground (premier plan).

## Plan
1. Modify `src/styles/animations.css`:
   - Increase `z-index` of `.skill-card` to `50`.
   - Increase `z-index` of `.skill-card.is-focused` to `100`.
   - Ensure `.horizontal-content` has a sufficient `z-index`.
2. Verify:
   - Run `npm run build` to ensure no regressions.

## Execution
- [x] Update src/styles/animations.css
- [x] Build and verify
