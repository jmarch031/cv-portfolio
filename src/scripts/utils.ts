/**
 * Utility function to split text into characters and words for animations
 */
export function splitText(elements: string | HTMLElement | NodeListOf<HTMLElement>) {
  let targetElements: HTMLElement[] = [];
  
  if (typeof elements === 'string') {
    targetElements = Array.from(document.querySelectorAll(elements));
  } else if (elements instanceof HTMLElement) {
    targetElements = [elements];
  } else if (elements instanceof NodeList) {
    targetElements = Array.from(elements) as HTMLElement[];
  }

  targetElements.forEach(el => {
    const html = el.innerHTML;
    let newHtml = '';
    let inTag = false;
    let currentWord = '';

    const flushWord = () => {
      if (currentWord.length > 0) {
        newHtml += `<span class="split-word">${currentWord}</span>`;
        currentWord = '';
      }
    };

    for (let i = 0; i < html.length; i++) {
      if (html[i] === '<') {
        flushWord();
        inTag = true;
        newHtml += html[i];
      } else if (html[i] === '>') {
        inTag = false;
        newHtml += html[i];
      } else if (inTag) {
        newHtml += html[i];
      } else if (html[i] === ' ' || html[i] === '\n') {
        flushWord();
        newHtml += html[i];
      } else {
        currentWord += `<span class="split-char">${html[i]}</span>`;
      }
    }
    flushWord();
    el.innerHTML = newHtml;
  });
}
