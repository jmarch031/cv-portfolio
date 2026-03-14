# Track Specification: Portfolio Modernization with Vite

## Overview
This track aims to modernize the current monolithic portfolio into a professional, modular structure using **Vite** and **TypeScript**. The project will leverage modern build tools for better developer experience (DX), performance, and maintainability, while remaining hosted on **GitHub Pages**.

## Functional Requirements
- **Vite Integration**: Transition from a single-file static structure to a modern Vite-based build system.
- **TypeScript Migration**: Convert the existing Vanilla JavaScript logic into TypeScript for improved type safety and maintainability.
- **NPM-Based Dependency Management**: Move from CDN-based external libraries (GSAP, Lenis, etc.) to project-managed NPM packages (`package.json`).
- **Modular Project Structure**:
    - Extract CSS into standalone modules or SCSS files.
    - Extract JavaScript/TypeScript logic into separate, functional components/modules.
    - Move internationalization (i18n) data from the script tag into separate JSON translation files.
- **Automated Deployment**: Set up a **GitHub Actions** workflow to automatically build and deploy the site to GitHub Pages whenever changes are pushed to the `main` branch.

## Non-Functional Requirements
- **Performance**: Maintain or improve current load times and 60fps animation performance.
- **Maintainability**: Ensure the new structure is intuitive and follows modern frontend best practices.
- **SEO & Accessibility**: Preserve or enhance existing metadata and semantic HTML structure during the migration.

## Acceptance Criteria
- [ ] The project builds successfully using `npm run build`.
- [ ] All GSAP animations and Lenis smooth scrolling work as expected in the new environment.
- [ ] The i18n system correctly loads and switches between French and English from external JSON files.
- [ ] The site is successfully deployed to GitHub Pages via a GitHub Actions workflow.
- [ ] The final production bundle is minified and optimized.

## Out of Scope
- Redesigning the portfolio's visual aesthetic.
- Adding major new features or content sections beyond what is currently in `index.html`.
