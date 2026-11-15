import { describe, it, expect, beforeEach } from 'vitest';
import { renderRecommendations, LONG_QUOTE } from '../recommendations';

const labels = { more: 'Lire plus', less: 'Réduire' };

describe('renderRecommendations', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div class="recos__list"></div>';
    container = document.querySelector('.recos__list')!;
  });

  it('renders one item per recommendation with name, role and quote', () => {
    renderRecommendations(container, [
      { name: 'John Doe', role: 'CEO at Tech Corp', quote: 'Great developer.' },
      { name: 'Jane Smith', role: 'Lead Architect', quote: 'Great leader.' },
    ], labels);

    const items = container.querySelectorAll('.reco');
    expect(items.length).toBe(2);
    expect(items[0].querySelector('.reco__name')?.textContent).toBe('John Doe');
    expect(items[0].querySelector('.reco__role')?.textContent).toBe('CEO at Tech Corp');
    expect(items[0].querySelector('.reco__quote')?.textContent).toContain('Great developer.');
  });

  it('escapes content instead of injecting HTML', () => {
    renderRecommendations(container, [{ name: '<b>x</b>', role: 'r', quote: 'q' }], labels);
    expect(container.querySelector('.reco__name b')).toBeNull();
    expect(container.querySelector('.reco__name')?.textContent).toBe('<b>x</b>');
  });

  it('adds a toggle only on long quotes and flips its label', () => {
    renderRecommendations(container, [
      { name: 'Short', role: 'r', quote: 'short' },
      { name: 'Long', role: 'r', quote: 'a'.repeat(LONG_QUOTE + 1) },
    ], labels);

    const [short, long] = Array.from(container.querySelectorAll('.reco'));
    expect(short.querySelector('.reco__toggle')).toBeNull();

    const btn = long.querySelector<HTMLButtonElement>('.reco__toggle')!;
    expect(btn.textContent).toBe('Lire plus');
    btn.click();
    expect(long.classList.contains('is-expanded')).toBe(true);
    expect(btn.textContent).toBe('Réduire');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('handles empty data and a missing container', () => {
    renderRecommendations(container, [], labels);
    expect(container.children.length).toBe(0);
    expect(() => renderRecommendations(null, [], labels)).not.toThrow();
  });
});
