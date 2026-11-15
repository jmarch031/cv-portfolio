export interface Recommendation {
  name: string;
  role: string;
  quote: string;
}

export interface RecoLabels {
  more: string;
  less: string;
}

/** Quotes longer than this get a "read more" toggle (CSS clamps them to 4 lines). */
export const LONG_QUOTE = 220;

export function renderRecommendations(
  container: Element | null,
  recommendations: Recommendation[],
  labels: RecoLabels,
) {
  if (!container) return;
  container.innerHTML = '';

  recommendations.forEach((rec) => {
    const item = document.createElement('article');
    item.className = 'reco';

    const meta = document.createElement('div');
    meta.className = 'reco__meta';
    const name = document.createElement('p');
    name.className = 'reco__name';
    name.textContent = rec.name;
    const role = document.createElement('p');
    role.className = 'reco__role';
    role.textContent = rec.role;
    meta.append(name, role);

    const body = document.createElement('div');
    const quote = document.createElement('p');
    quote.className = 'reco__quote';
    quote.textContent = `« ${rec.quote} »`;
    body.append(quote);

    if (rec.quote.length > LONG_QUOTE) {
      const btn = document.createElement('button');
      btn.className = 'reco__toggle';
      btn.type = 'button';
      btn.dataset.cursor = 'hover';
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = labels.more;
      btn.addEventListener('click', () => {
        const expanded = item.classList.toggle('is-expanded');
        btn.setAttribute('aria-expanded', String(expanded));
        btn.textContent = expanded ? labels.less : labels.more;
      });
      body.append(btn);
    }

    item.append(meta, body);
    container.appendChild(item);
  });
}
