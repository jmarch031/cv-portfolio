// Injects the build-time render (dist-ssr/prerender.js) into dist/index.html.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const { prerender } = await import(new URL('../dist-ssr/prerender.js', import.meta.url));
const { header, sheet, main } = prerender();
const file = new URL('../dist/index.html', import.meta.url);
let html = readFileSync(file, 'utf8');

const fill = (open, close, content) => {
  const tag = `${open}${close}`;
  if (!html.includes(tag)) throw new Error(`prerender: ${tag} not found in index.html`);
  html = html.replace(tag, `${open}${content}${close}`);
};
fill('<header class="nav">', '</header>', header);
fill('<div class="sheet" id="sheet" aria-hidden="true">', '</div>', sheet);
fill('<main id="app">', '</main>', main);

writeFileSync(file, html);
rmSync(new URL('../dist-ssr', import.meta.url), { recursive: true, force: true });
console.log(`prerender: dist/index.html now ${(html.length / 1024).toFixed(1)} kB`);
