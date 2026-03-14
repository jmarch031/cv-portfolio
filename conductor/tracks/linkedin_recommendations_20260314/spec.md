# Specification: LinkedIn Recommendations Section

## Overview
Add a high-fidelity, interactive "Recommendations" section to the portfolio to showcase professional endorsements from LinkedIn. This section will reinforce Julien's profile as a strategic leader and expert developer through social proof, maintaining the "Awwwards-level" aesthetic of the site.

## Functional Requirements
- **Content**: A collection of recommendation cards containing the author's name, role/company, and a curated quote.
- **Display Style**: An **Infinite Marquee**. The cards will scroll horizontally in a continuous loop.
- **Placement**: Positioned as the final section of the `main` content, directly **before the footer**.
- **Dynamic Effects**:
    - **3D Tilt**: Individual cards will respond to mouse movement with a subtle 3D tilt/perspective effect.
    - **GSAP Reveal**: The entire section will fade and slide into view using ScrollTrigger.
    - **Pause on Hover**: The marquee will pause or slow down when a user hovers over a card to allow for easier reading.

## Non-Functional Requirements
- **Performance**: Must maintain 60fps during the infinite scroll.
- **Accessibility**: Respect `prefers-reduced-motion` by disabling the auto-scroll or providing a static layout.
- **Responsiveness**: Adjust the card size and marquee speed for mobile devices.

## Acceptance Criteria
- [ ] The section is correctly placed before the footer.
- [ ] The marquee scrolls infinitely without visible jumps or resets.
- [ ] Hovering over a recommendation card triggers a smooth 3D tilt effect.
- [ ] The design is consistent with existing "Glass-card" and "Tilt-card" styles used in the portfolio.

## Out of Scope
- Live LinkedIn API integration (content is manually curated in JSON/HTML).
- Full-page modal for expanded recommendation text.
