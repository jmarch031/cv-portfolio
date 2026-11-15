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
  ['#education', c.nav.education],
  ['#contact', c.nav.contact],
];

export function renderHeader(c: Content, lang: Lang) {
  const links = navLinks(c);
  return `
    <a href="#top" class="nav__logo js-scroll roll">${roll('julien marchand')}</a>
    <div class="nav__lang" role="group" aria-label="Language">
      <button class="nav__lang-btn${lang === 'fr' ? ' is-active' : ''}" data-lang="fr" lang="fr">FR</button>
      <span class="nav__lang-sep">/</span>
      <button class="nav__lang-btn${lang === 'en' ? ' is-active' : ''}" data-lang="en" lang="en">EN</button>
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
  return [hero(c), statement(c), story(c), numbers(c), skills(c), journey(c), education(c), recommendations(c, recos), contact(c)].join('');
}

/* ------------------------------------------------------------------ */

function hero(c: Content) {
  return `
  <section class="hero" id="top" data-band="dark">
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
  <section class="statement section" id="statement" data-band="light">
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
  <section class="story" id="story" data-band="dark">
    <div class="story__pin">
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
  <section class="numbers section" data-band="light">
    <div class="container">
      ${label('03', c.numbers.label)}
      <div class="numbers__grid">
        ${c.numbers.stats
          .map(
            (s) => `
          <div class="stat js-rise">
            <p class="stat__value">${s.prefix ? esc(s.prefix) : ''}<span class="js-count" data-to="${s.value}">${s.value}</span>${s.suffix ? esc(s.suffix) : ''}</p>
            <p class="stat__label">${esc(s.label)}</p>
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
  <section class="skills section" id="skills" data-band="light">
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
            <div class="skill__body"><p class="skill__text">${esc(it.text)}</p></div>
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
    <p class="job-detail__text">${esc(j.text)}</p>
    ${j.points ? `<ul class="job-detail__points">${j.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}`;
}

function journey(c: Content) {
  const s = c.journey;
  return `
  <section class="journey section" id="journey" data-band="light">
    <div class="container">
      ${label('05', s.label)}
      <h2 class="journey__title js-lines">${esc(s.title)}</h2>
      <div class="journey__grid">
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

function education(c: Content) {
  const e = c.education;
  return `
  <section class="education section" id="education" data-band="light">
    <div class="container">
      ${label('06', e.label)}
      <h2 class="education__title js-lines">${esc(e.title)}</h2>
      <div class="education__grid">
        ${e.schools
          .map(
            (s) => `
          <div class="school js-rise">
            <p class="school__years">${esc(s.years)}</p>
            <h3 class="school__name">${esc(s.name)}</h3>
            <p class="school__degree">${esc(s.degree)}</p>
          </div>`,
          )
          .join('')}
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
  <section class="recos section" data-band="dark">
    <div class="container">
      ${label('07', r.label)}
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
        <button class="recos__more pill pill--light" data-more="${esc(r.readMore)}" data-less="${esc(r.readLess)}" aria-expanded="false">${roll(r.readMore)}</button>
        <div class="recos__nav">
          <button class="recos__btn pill pill--light" data-dir="-1" aria-label="${esc(r.prev)}">←</button>
          <span class="recos__count"><span class="recos__current">01</span> / ${pad(recos.length)}</span>
          <button class="recos__btn pill pill--light" data-dir="1" aria-label="${esc(r.next)}">→</button>
        </div>
      </div>
      <div class="recos__progress" aria-hidden="true"><span class="recos__bar"></span></div>
    </div>
  </section>`;
}

function contact(c: Content) {
  const k = c.contact;
  return `
  <section class="contact" id="contact" data-band="dark">
    <div class="container">
      ${label('08', k.label)}
      <h2 class="contact__title">
        ${k.lines.map((l) => `<span class="contact__line">${esc(l)}</span>`).join('')}
      </h2>
      <div class="contact__ctas">
        <a href="mailto:${esc(k.email)}" class="pill pill--light magnetic">${roll(k.email)}</a>
        <a href="${LINKEDIN}" target="_blank" rel="noopener" class="pill pill--light magnetic">${roll('LinkedIn')}</a>
        <a href="cv-julien-marchand.pdf" target="_blank" rel="noopener" class="pill pill--light magnetic">${roll(k.cv)}</a>
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
