import type { LogoKey } from './logos';

export type Lang = 'fr' | 'en';

export interface Act {
  numeral: string;
  title: string;
  years: string;
  text: string;
  tags: string[];
}

/** One tool, shown with its official mark. */
export interface TechItem {
  name: string;
  /** Key of the official mark in src/content/logos.ts (none: the name is set as a wordmark) */
  logo?: LogoKey;
}

export interface TechGroup {
  name: string;
  items: TechItem[];
}

export interface Practice {
  name: string;
  /** Small aside next to the name (e.g. the flavours of Agile) */
  sub?: string;
  /** Context or period, shown on hover / tap */
  period: string;
}

export interface Conviction {
  title: string;
  text: string;
}

export interface Job {
  dates: string;
  duration: string;
  role: string;
  company: string;
  place: string;
  /** One line that sums the role up, shown in the list */
  headline: string;
  text: string;
  points?: string[];
  figures?: { value: string; label: string }[];
  tags: string[];
}

export interface Work {
  kind: string;
  title: string;
  text: string;
  meta: string;
  href?: string;
  tags?: string[];
  /** file name in public/covers */
  cover: string;
}

export interface School {
  years: string;
  from: number;
  to: number;
  name: string;
  degree: string;
  note: string;
}

export interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  detail: string;
}

export interface Content {
  meta: { title: string; description: string };
  nav: { story: string; skills: string; journey: string; education: string; contact: string; writing: string; menu: string; close: string; toLight: string; toDark: string; recos: string; cta: string; progress: string };
  intro: { roles: string[]; caption: string; skip: string };
  hero: { lines: string[]; caption: string; scroll: string; contact: string; cv: string };
  statement: { label: string; portraitAlt: string; text: string };
  story: { label: string; title: string; acts: Act[] };
  numbers: { label: string; title: string; stats: Stat[] };
  skills: {
    label: string;
    title: string;
    techTitle: string;
    practicesTitle: string;
    hint: string;
    tech: TechGroup[];
    practices: Practice[];
    convictionsTitle: string;
    convictions: Conviction[];
  };
  journey: { label: string; title: string; hint: string; more: string; less: string; jobs: Job[] };
  writing: { label: string; title: string; intro: string; items: Work[]; all: string; read: string; prev: string; next: string };
  education: {
    label: string;
    title: string;
    schools: School[];
    degreesTitle: string;
    certTitle: string;
    cert: string;
    langTitle: string;
    langs: { name: string; level: string }[];
  };
  recos: { label: string; title: string; original: string; readMore: string; readLess: string; prev: string; next: string };
  contact: { label: string; lines: string[]; email: string; cv: string; copy: string; copied: string; location: string; rights: string; top: string };
}
