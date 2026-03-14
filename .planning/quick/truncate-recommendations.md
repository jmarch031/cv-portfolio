# Quick Task: Truncate Recommendations

## Context
Some recommendation texts are long and can disrupt the layout of the marquee. The user wants to truncate them and provide a way to see the full text.

## Strategy
1. **Update Translations:** Add `rec_more` and `rec_less` keys to `fr.json` and `en.json`.
2. **CSS Truncation:** Use `line-clamp` to truncate the quote to 4-5 lines by default.
3. **JS Logic:** 
    - In `renderRecommendations`, detect if the text is long enough to need truncation.
    - Add a toggle button to each card with `data-i18n`.
    - Handle the toggle to add/remove an `.is-expanded` class using event delegation.
4. **CSS Expansion:** In `.is-expanded`, unset the `line-clamp`.

## Tasks
1. [x] Add translations for "Read more" and "Read less".
2. [x] Update `src/scripts/recommendations.ts` to include the toggle button and event delegation.
3. [x] Update `src/styles/components.css` with `line-clamp` and expansion styles.
4. [x] Update `src/styles/responsive.css` for mobile `line-clamp`.
5. [x] Update `STATE.md`.
