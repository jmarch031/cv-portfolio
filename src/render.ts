import type { Content, Lang } from './content/types';

export interface Recommendation {
  name: string;
  role: string;
  quote: string;
  excerpt: string;
}

/** Escape text for safe interpolation into HTML. */
export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const pad = (n: number) => String(n).padStart(2, '0');

/** Pill / link label with the hover "roll" duplicate. */
const roll = (text: string) =>
  `<span class="rl"><span class="rl__a">${esc(text)}</span><span class="rl__b" aria-hidden="true">${esc(text)}</span></span>`;

const label = (idx: string, text: string) =>
  `<div class="label"><span class="label__idx">${idx}</span><span class="label__text">${esc(text)}</span></div>`;

const LINKEDIN = 'https://www.linkedin.com/in/julien-marchand-0256186a';
const MEDIUM = 'https://medium.com/@julienmarchand_83183';

/* ------------------------------------------------------------------ */

const navLinks = (c: Content): [string, string][] => [
  ['#story', c.nav.story],
  ['#skills', c.nav.skills],
  ['#journey', c.nav.journey],
  ['#writing', c.nav.writing],
  ['#education', c.nav.education],
  ['#contact', c.nav.contact],
];

const glow = (variant: string) => `<div class="glow glow--${variant}" aria-hidden="true"></div>`;

export function renderHeader(c: Content, lang: Lang, theme: 'dark' | 'light') {
  const links = navLinks(c);
  return `
    <a href="#top" class="nav__logo js-scroll roll">${roll('julien marchand')}</a>
    <div class="nav__lang" role="group" aria-label="Language">
      <button class="nav__lang-btn${lang === 'fr' ? ' is-active' : ''}" data-lang="fr" lang="fr">FR</button>
      <span class="nav__lang-sep">/</span>
      <button class="nav__lang-btn${lang === 'en' ? ' is-active' : ''}" data-lang="en" lang="en">EN</button>
      <span class="nav__lang-sep">·</span>
      <button class="nav__theme" data-theme-toggle aria-pressed="${theme === 'light'}" data-light="${esc(c.nav.toLight)}" data-dark="${esc(c.nav.toDark)}">
        <span class="nav__theme-dot" aria-hidden="true"></span><span class="nav__theme-text">${esc(theme === 'dark' ? c.nav.toLight : c.nav.toDark)}</span>
      </button>
    </div>
    <nav class="nav__menu" aria-label="Menu">
      ${links.map(([href, text]) => `<a href="${href}" class="nav__link js-scroll roll">${roll(text)}</a>`).join('')}
    </nav>
    <button class="nav__burger" aria-expanded="false" aria-controls="sheet">${esc(c.nav.menu)}</button>`;
}

export function renderSheet(c: Content) {
  return `
    <nav class="sheet__list">
      ${navLinks(c).map(([href, text], i) => `<a href="${href}" class="sheet__link js-scroll"><span class="sheet__idx">${pad(i + 1)}</span><span class="sheet__text">${esc(text)}</span></a>`).join('')}
    </nav>`;
}

export function renderMain(c: Content, recos: Recommendation[]) {
  return [hero(c), statement(c), story(c), numbers(c), skills(c), journey(c), writing(c), education(c), recommendations(c, recos), contact(c)].join('');
}

/* ------------------------------------------------------------------ */

function hero(c: Content) {
  return `
  <section class="hero" id="top">
    <div class="hero__media" aria-hidden="true"></div>
    <h1 class="hero__title">
      ${c.hero.lines.map((l) => `<span class="hero__line">${esc(l)}</span>`).join('')}
    </h1>
    <p class="hero__caption">${esc(c.hero.caption)}</p>
    <a href="#statement" class="badge js-scroll" aria-label="Scroll">
      <svg viewBox="0 0 120 120" class="badge__ring" aria-hidden="true">
        <defs><path id="badge-path" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
        <text><textPath href="#badge-path" textLength="286">${esc(c.hero.scroll)}</textPath></text>
      </svg>
      <span class="badge__arrow" aria-hidden="true">↓</span>
    </a>
  </section>`;
}

function statement(c: Content) {
  const s = c.statement;
  return `
  <section class="statement section" id="statement">
    ${glow('left')}
    <div class="container">
      ${label('01', s.label)}
      <p class="statement__text js-words">${esc(s.text)}</p>
      <div class="statement__cols">
        <div class="statement__col js-rise">
          <h3 class="statement__h">${esc(s.todayTitle)}</h3>
          <p class="js-lines">${esc(s.today)}</p>
        </div>
        <div class="statement__col js-rise">
          <h3 class="statement__h">${esc(s.mattersTitle)}</h3>
          <p class="js-lines">${esc(s.matters)}</p>
        </div>
      </div>
    </div>
  </section>`;
}

function story(c: Content) {
  const s = c.story;
  return `
  <section class="story" id="story">
    <div class="story__pin">
      <div class="story__media" aria-hidden="true"></div>
      <div class="story__head container">
        ${label('02', s.label)}
        <p class="story__count"><span class="story__current">01</span> / ${pad(s.acts.length)}</p>
      </div>
      <div class="story__stage">
        ${s.acts
          .map(
            (a, i) => `
          <article class="act" data-act="${i}">
            <span class="act__numeral" aria-hidden="true">${esc(a.numeral)}</span>
            <div class="act__body container">
              <p class="act__years">${esc(a.years)}</p>
              <h3 class="act__title">${esc(a.title)}</h3>
              <p class="act__text">${esc(a.text)}</p>
              <ul class="act__tags">${a.tags.map((t) => `<li class="tag">${esc(t)}</li>`).join('')}</ul>
            </div>
          </article>`,
          )
          .join('')}
      </div>
      <div class="story__progress" aria-hidden="true"><span class="story__bar"></span></div>
      <h2 class="visually-hidden">${esc(s.title)}</h2>
    </div>
  </section>`;
}

function numbers(c: Content) {
  return `
  <section class="numbers section">
    ${glow('right')}
    <div class="container">
      ${label('03', c.numbers.label)}
      <div class="numbers__grid">
        ${c.numbers.stats
          .map(
            (s) => `
          <div class="stat js-rise">
            <p class="stat__value iri">${s.prefix ? esc(s.prefix) : ''}<span class="js-count" data-to="${s.value}">${s.value}</span>${s.suffix ? esc(s.suffix) : ''}</p>
            <p class="stat__label">${esc(s.label)}</p>
            <p class="stat__detail">${esc(s.detail)}</p>
          </div>`,
          )
          .join('')}
      </div>
    </div>
  </section>`;
}

function skills(c: Content) {
  const s = c.skills;
  return `
  <section class="skills section" id="skills">
    ${glow('right')}
    <div class="container">
      ${label('04', s.label)}
      <h2 class="skills__title js-lines">${esc(s.title)}</h2>
      <ul class="skills__list">
        ${s.items
          .map(
            (it, i) => `
          <li class="skill">
            <button class="skill__head" aria-expanded="false">
              <span class="skill__idx">${pad(i + 1)}</span>
              <span class="skill__name">${esc(it.name)}</span>
              <span class="skill__plus" aria-hidden="true"></span>
            </button>
            <div class="skill__body">
              <div class="skill__inner">
                <p class="skill__text">${esc(it.text)}</p>
                <p class="skill__context">${esc(it.context)}</p>
              </div>
            </div>
          </li>`,
          )
          .join('')}
      </ul>
    </div>
  </section>`;
}

function jobDetail(j: Content['journey']['jobs'][number]) {
  return `
    <p class="job-detail__meta">${esc(j.place)} · ${esc(j.duration)}</p>
    ${j.figures ? `<div class="job-detail__figures">${j.figures.map((f) => `<p><span class="job-detail__figure iri">${esc(f.value)}</span><span class="job-detail__figure-label">${esc(f.label)}</span></p>`).join('')}</div>` : ''}
    <p class="job-detail__text">${esc(j.text)}</p>
    ${j.points ? `<ul class="job-detail__points">${j.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
    <ul class="job-detail__tags">${j.tags.map((t) => `<li class="tag">${esc(t)}</li>`).join('')}</ul>`;
}

function journey(c: Content) {
  const s = c.journey;
  return `
  <section class="journey section" id="journey">
    ${glow('left')}
    ${glow('right glow--low')}
    <div class="container">
      ${label('05', s.label)}
      <h2 class="journey__title js-lines">${esc(s.title)}</h2>
      <div class="journey__grid">
        <div class="jobs__window">
        <ol class="jobs">
          ${s.jobs
            .map(
              (j, i) => `
            <li class="job${i === 0 ? ' is-active' : ''}" data-job="${i}">
              <p class="job__dates">${esc(j.dates)}</p>
              <h3 class="job__role">${esc(j.role)}</h3>
              <p class="job__company">${esc(j.company)}</p>
              <div class="job__detail job-detail">${jobDetail(j)}</div>
            </li>`,
            )
            .join('')}
        </ol>
        </div>
        <aside class="journey__panel" aria-hidden="true">
          <div class="journey__panel-inner">
            ${s.jobs
              .map(
                (j, i) => `
              <div class="panel-item${i === 0 ? ' is-active' : ''}" data-panel="${i}">
                <p class="panel-item__company">${esc(j.company)}</p>
                <p class="panel-item__role">${esc(j.role)}</p>
                <div class="job-detail">${jobDetail(j)}</div>
              </div>`,
              )
              .join('')}
          </div>
        </aside>
      </div>
    </div>
  </section>`;
}

function writing(c: Content) {
  const w = c.writing;
  return `
  <section class="writing section" id="writing">
    ${glow('left')}
    <div class="container">
      ${label('06', w.label)}
      <div class="writing__head">
        <h2 class="writing__title js-lines">${esc(w.title)}</h2>
        <p class="writing__intro js-rise">${esc(w.intro)}</p>
      </div>
      <ul class="works">
        ${w.items
          .map((it, i) => {
            const inner = `
              <span class="work__idx">${pad(i + 1)}</span>
              <span class="work__main">
                <span class="work__kind">${esc(it.kind)} · ${esc(it.meta)}</span>
                <span class="work__title">${esc(it.title)}</span>
                <span class="work__text">${esc(it.text)}</span>
                ${it.tags ? `<span class="work__tags">${it.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</span>` : ''}
              </span>
              <span class="work__arrow" aria-hidden="true">${it.href ? '↗' : ''}</span>`;
            return `
          <li class="work" data-work="${i}">
            ${it.href
              ? `<a class="work__link" href="${esc(it.href)}" target="_blank" rel="noopener" aria-label="${esc(w.read)} : ${esc(it.title)}">${inner}</a>`
              : `<div class="work__link">${inner}</div>`}
          </li>`;
          })
          .join('')}
      </ul>
      <div class="writing__cta">
        <a href="${MEDIUM}" target="_blank" rel="noopener" class="pill magnetic">${roll(w.all)}</a>
      </div>
    </div>
  </section>`;
}

function education(c: Content) {
  const e = c.education;
  return `
  <section class="education section" id="education">
    ${glow('right')}
    <div class="container">
      ${label('07', e.label)}
      <h2 class="education__title js-lines">${esc(e.title)}</h2>
      <div class="edu-timeline">
        ${e.schools
          .map((s) => {
            const min = Math.min(...e.schools.map((x) => x.from));
            const max = Math.max(...e.schools.map((x) => x.to));
            const left = ((s.from - min) / (max - min)) * 100;
            const width = ((s.to - s.from) / (max - min)) * 100;
            return `
          <div class="school js-rise">
            <div class="school__info">
              <p class="school__years">${esc(s.years)}</p>
              <h3 class="school__name">${esc(s.name)}</h3>
              <p class="school__degree">${esc(s.degree)}</p>
              <p class="school__note">${esc(s.note)}</p>
            </div>
            <div class="school__track" aria-hidden="true">
              <span class="school__bar" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%"></span>
            </div>
          </div>`;
          })
          .join('')}
        <div class="edu-axis" aria-hidden="true">
          <span></span>
          <div class="edu-axis__years">
            ${(() => {
              const min = Math.min(...e.schools.map((x) => x.from));
              const max = Math.max(...e.schools.map((x) => x.to));
              return Array.from({ length: max - min + 1 }, (_, k) => `<span style="left:${((k / (max - min)) * 100).toFixed(2)}%">${min + k}</span>`).join('');
            })()}
          </div>
        </div>
      </div>
      <div class="education__extra">
        <div class="js-rise">
          <p class="mini-label">${esc(e.certTitle)}</p>
          <p class="education__cert">${esc(e.cert)}</p>
        </div>
        <div class="js-rise">
          <p class="mini-label">${esc(e.langTitle)}</p>
          <ul class="langs">${e.langs.map((l) => `<li><span>${esc(l.name)}</span><span>${esc(l.level)}</span></li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>`;
}

function recommendations(c: Content, recos: Recommendation[]) {
  const r = c.recos;
  if (!recos.length) return '';
  return `
  <section class="recos section">
    ${glow('left')}
    <div class="container">
      ${label('08', r.label)}
      <div class="recos__stage">
        ${recos
          .map(
            (rec, i) => `
          <figure class="reco${i === 0 ? ' is-active' : ''}" data-reco="${i}" lang="fr">
            <blockquote class="reco__excerpt">« ${esc(rec.excerpt)} »</blockquote>
            <figcaption class="reco__by">
              <span class="reco__name">${esc(rec.name)}</span>
              <span class="reco__role">${esc(rec.role)}</span>
            </figcaption>
            <div class="reco__full"><p>${esc(rec.quote)}</p></div>
          </figure>`,
          )
          .join('')}
      </div>
      <div class="recos__controls">
        <p class="recos__note">${esc(r.original)}</p>
        <button class="recos__more pill" data-more="${esc(r.readMore)}" data-less="${esc(r.readLess)}" aria-expanded="false">${roll(r.readMore)}</button>
        <div class="recos__nav">
          <button class="recos__btn pill" data-dir="-1" aria-label="${esc(r.prev)}">←</button>
          <span class="recos__count"><span class="recos__current">01</span> / ${pad(recos.length)}</span>
          <button class="recos__btn pill" data-dir="1" aria-label="${esc(r.next)}">→</button>
        </div>
      </div>
      <div class="recos__progress" aria-hidden="true"><span class="recos__bar"></span></div>
    </div>
  </section>`;
}

function contact(c: Content) {
  const k = c.contact;
  return `
  <section class="contact" id="contact">
    <div class="contact__media" aria-hidden="true"></div>
    <div class="container">
      ${label('09', k.label)}
      <h2 class="contact__title">
        ${k.lines.map((l, i) => `<span class="contact__line${i === k.lines.length - 1 ? ' iri' : ''}">${esc(l)}</span>`).join('')}
      </h2>
      <div class="contact__ctas">
        <a href="mailto:${esc(k.email)}" class="pill magnetic">${roll(k.email)}</a>
        <a href="${LINKEDIN}" target="_blank" rel="noopener" class="pill magnetic">${roll('LinkedIn')}</a>
        <a href="cv-julien-marchand.pdf" target="_blank" rel="noopener" class="pill magnetic">${roll(k.cv)}</a>
      </div>
    </div>
    <footer class="footer">
      <div class="container footer__grid">
        <div class="footer__col">
          <p>Julien Marchand</p>
          <p>${esc(k.location)}</p>
        </div>
        <div class="footer__col">
          <a href="mailto:${esc(k.email)}" class="roll">${roll(k.email)}</a>
          <a href="${LINKEDIN}" target="_blank" rel="noopener" class="roll">${roll('LinkedIn')}</a>
          <a href="${MEDIUM}" target="_blank" rel="noopener" class="roll">${roll('Medium')}</a>
        </div>
        <div class="footer__col footer__col--end">
          <p>${esc(k.rights)}</p>
          <a href="#top" class="js-scroll roll">${roll(k.top)}</a>
        </div>
      </div>
    </footer>
  </section>`;
}
