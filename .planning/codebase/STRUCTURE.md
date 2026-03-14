# Directory Structure

## Overview
The project maintains a very lean directory structure, typical of a standalone static web application.

```
Portfolio/
├── .husky/             # Git hooks (pre-commit checks)
├── .idea/              # JetBrains IDE configuration
├── index.html          # Main entry point (HTML, CSS, JS, Content)
├── .gitignore          # Git exclusion rules
└── .planning/          # Project documentation and codebase mapping
    └── codebase/       # Structured analysis documents
```

## Component Breakdown (within index.html)
- **Head**: Metadata, Typography (Google Fonts), and Core Library CDNs (GSAP, Lenis).
- **Styles**: Unified CSS variable system and component-level styling.
- **HTML Body**:
  - `preloader`: Initial loading screen with ASCII animation.
  - `menu-overlay`: Full-screen navigation.
  - `hero-section`: Primary landing view (Fixed).
  - `main-content`: Scrollable sections (About, Expertise, Journey, Publications).
  - `bg-visuals`: Ambient background layers (video, grids, noise texture).
- **Scripts**: 
  - `translations`: I18n data for French and English.
  - `utilities`: Text splitting and DOM helpers.
  - `init()`: Orchestration of the preloader and entry animations.
  - `lenis/gsap`: Scroll and animation logic.
