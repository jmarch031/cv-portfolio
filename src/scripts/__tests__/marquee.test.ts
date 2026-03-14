import { describe, it, expect, beforeEach } from 'vitest';
import { setupMarquee } from '../recommendations';

describe('Marquee setup', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="recommendations">
        <div class="marquee-container">
          <div class="marquee-content">
            <div class="recommendation-card">Card 1</div>
            <div class="recommendation-card">Card 2</div>
          </div>
        </div>
      </section>
    `;
  });

  it('should duplicate marquee content for infinite loop', () => {
    const marqueeContent = document.querySelector('.marquee-content') as HTMLElement;
    const initialCount = marqueeContent.children.length;
    
    setupMarquee();
    
    // In many infinite marquee implementations, we duplicate the content once
    expect(marqueeContent.children.length).toBe(initialCount * 2);
  });
});
