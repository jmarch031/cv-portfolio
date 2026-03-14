import { describe, it, expect, beforeEach } from 'vitest';
import { renderRecommendations } from '../recommendations';

describe('Recommendation Section rendering', () => {
  beforeEach(() => {
    // Set up the container in the DOM
    document.body.innerHTML = `
      <section id="recommendations">
        <div class="marquee-content"></div>
      </section>
    `;
  });

  it('should render recommendation cards when given data', () => {
    const mockData = [
      {
        name: 'John Doe',
        role: 'CEO at Tech Corp',
        quote: 'Julien is an amazing developer!'
      },
      {
        name: 'Jane Smith',
        role: 'Lead Architect at Cloud Inc',
        quote: 'Exceptional work and great leadership.'
      }
    ];

    renderRecommendations(mockData);

    const cards = document.querySelectorAll('.recommendation-card');
    expect(cards.length).toBe(mockData.length);

    const firstCard = cards[0];
    expect(firstCard.querySelector('.recommendation-name')?.textContent).toBe('John Doe');
    expect(firstCard.querySelector('.recommendation-role')?.textContent).toBe('CEO at Tech Corp');
    expect(firstCard.querySelector('.recommendation-quote')?.textContent).toBe('Julien is an amazing developer!');
  });

  it('should handle empty data gracefully', () => {
    renderRecommendations([]);
    const cards = document.querySelectorAll('.recommendation-card');
    expect(cards.length).toBe(0);
  });
});
