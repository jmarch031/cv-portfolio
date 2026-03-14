export interface Recommendation {
  name: string;
  role: string;
  quote: string;
}

/**
 * Render recommendation cards into the DOM
 * @param recommendations - Array of recommendation data
 */
export function renderRecommendations(recommendations: Recommendation[]) {
  const container = document.querySelector('#recommendations .marquee-content');
  if (!container) return;

  // Clear existing content
  container.innerHTML = '';

  recommendations.forEach(rec => {
    const card = document.createElement('div');
    card.classList.add('recommendation-card', 'glass-card', 'tilt-card');
    
    // Only show toggle if quote is long enough (e.g. > 150 chars)
    const isLong = rec.quote.length > 150;
    
    card.innerHTML = `
      <div class="recommendation-content">
        <p class="recommendation-quote">${rec.quote}</p>
        ${isLong ? `
          <button class="rec-toggle-btn nav-hover" aria-label="Toggle recommendation text">
            <span data-i18n="rec_more" class="more-text">Lire plus</span>
            <span data-i18n="rec_less" class="less-text">Réduire</span>
          </button>
        ` : ''}
        <div class="recommendation-meta">
          <p class="recommendation-name">${rec.name}</p>
          <p class="recommendation-role">${rec.role}</p>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });

  // Event delegation for toggle buttons
  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('.rec-toggle-btn');
    if (btn) {
      const card = btn.closest('.recommendation-card');
      if (card) {
        card.classList.toggle('is-expanded');
        btn.classList.toggle('is-active');
      }
    }
  });
}

/**
 * Setup the marquee for an infinite loop by duplicating its content
 */
export function setupMarquee() {
  const marqueeContent = document.querySelector('.marquee-content');
  if (!marqueeContent) return;

  // Clone all child elements
  const items = Array.from(marqueeContent.children);
  items.forEach(item => {
    const clone = item.cloneNode(true);
    marqueeContent.appendChild(clone);
  });
}
