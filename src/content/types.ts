export type Lang = 'fr' | 'en';

export interface Act {
  numeral: string;
  title: string;
  years: string;
  text: string;
  tags: string[];
}

export interface Skill {
  name: string;
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
}

export interface School {
  years: string;
  name: string;
  degree: string;
}

export interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface Content {
  meta: { title: string; description: string };
  nav: { story: string; skills: string; journey: string; education: string; contact: string; menu: string; close: string };
  intro: { roles: string[]; caption: string };
  hero: { lines: string[]; caption: string; scroll: string };
  statement: { label: string; text: string; today: string; todayTitle: string; matters: string; mattersTitle: string };
  story: { label: string; title: string; acts: Act[] };
  numbers: { label: string; stats: Stat[] };
  skills: { label: string; title: string; items: Skill[] };
  journey: { label: string; title: string; jobs: Job[] };
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
