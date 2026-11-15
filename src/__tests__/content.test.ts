import { describe, it, expect } from 'vitest';
import { fr } from '../content/fr';
import { en } from '../content/en';
import recos from '../data/recommendations.json';

/** Same structure in both languages: same keys, same list lengths, same numbers. */
function shape(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(shape);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).sort().map(([k, x]) => [k, shape(x)]));
  return typeof v === 'number' ? v : typeof v;
}

describe('content', () => {
  it('FR and EN have the same shape', () => {
    expect(shape(en)).toEqual(shape(fr));
  });

  it('keeps facts aligned between languages (dates, companies)', () => {
    fr.journey.jobs.forEach((job, i) => {
      expect(en.journey.jobs[i].company).toBe(job.company);
      expect(en.journey.jobs[i].dates.match(/\d{4}/g)).toEqual(job.dates.match(/\d{4}/g));
    });
    expect(en.education.schools.map((s) => s.years)).toEqual(fr.education.schools.map((s) => s.years));
  });

  it('recommendation excerpts are verbatim quotes', () => {
    recos.forEach((r) => {
      expect(r.quote).toContain(r.excerpt);
      expect(r.quote_en).toContain(r.excerpt_en);
    });
  });
});
