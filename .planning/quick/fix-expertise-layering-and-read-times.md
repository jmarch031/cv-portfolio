# Quick Task: Fix Expertise Layering and Update Read Times

## Goal
1. Ensure expertise cards appear in front of background visuals on the live site.
2. Update article reading times according to user feedback.

## Plan
1. Modify `src/styles/animations.css`:
   - Increase `z-index` of `.horizontal-wrap` to `25` (currently `10`) to be clearly above `.main-content` (`z-index: 10`).
2. Modify `public/locales/fr.json` and `public/locales/en.json`:
   - Update `pub_2_read_time` (Burnout) to `5 min`.
   - Update `pub_3_read_time` (QA) to `5 min`.
   - Update `pub_4_read_time` (Demain) to `4 min`.
3. Verify:
   - Run `npm run build`.
   - Manual check.

## Execution
- [ ] Update src/styles/animations.css
- [ ] Update locale JSONs
- [ ] Build and verify
