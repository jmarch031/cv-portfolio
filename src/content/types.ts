export type Lang = 'fr' | 'en';

export interface Act {
  numeral: string;
  title: string;
  years: string;
  text: string;
  tags: string[];
}

/** One technology or practice; `now` = part of the current role (LinkedIn). */
export interface StackItem {
  name: string;
  now: boolean;
  /** When it was used, from the LinkedIn export (shown on hover / tap) */
  period: string;
}

export interface StackGroup {
  name: string;
  items: StackItem[];
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
  nav: { story: string; skills: string; journey: string; education: string; contact: string; writing: string; menu: string; close: string; toLight: string; toDark: string };
  intro: { roles: string[]; caption: string };
  hero: { lines: string[]; caption: string; scroll: string };
  statement: { label: string; portraitAlt: string; text: string; today: string; todayTitle: string; matters: string; mattersTitle: string };
  story: { label: string; title: string; acts: Act[] };
  numbers: { label: string; stats: Stat[] };
  skills: {
    label: string;
    title: string;
    stackTitle: string;
    legendNow: string;
    legendBefore: string;
    hint: string;
    stack: StackGroup[];
    convictionsTitle: string;
    convictions: Conviction[];
  };
  journey: { label: string; title: string; hint: string; jobs: Job[] };
  writing: { label: string; title: string; intro: string; items: Work[]; all: string; read: string };
  education: {
    label: string;
    title: string;
    schools: School[];
    certTitle: string;
    cert: string;
    langTitle: string;
    langs: { name: string; level: string }[];
  };
  recos: { label: string; original: string; readMore: string; readLess: string; prev: string; next: string };
  contact: { label: string; lines: string[]; email: string; cv: string; location: string; rights: string; top: string };
}
