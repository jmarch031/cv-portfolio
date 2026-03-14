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
    
    card.innerHTML = `
      <div class="recommendation-content">
        <p class="recommendation-quote">${rec.quote}</p>
        <div class="recommendation-meta">
          <p class="recommendation-name">${rec.name}</p>
          <p class="recommendation-role">${rec.role}</p>
        </div>
      </div>
    `;
    
    container.appendChild(card);
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
