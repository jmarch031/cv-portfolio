/**
 * Build-time render of the default page (French, dark theme), injected into dist/index.html
 * by scripts/prerender.mjs: search engines and link previews get the full text,
 * and the browser shows content before the script runs. The script then re-renders as usual.
 */
import { fr } from './content/fr';
import recommendations from './data/recommendations.json';
import { renderHeader, renderMain, renderSheet } from './render';

export function prerender() {
  return {
    header: renderHeader(fr, 'fr', 'dark'),
    sheet: renderSheet(fr),
    main: renderMain(fr, recommendations, 'fr'),
  };
}
