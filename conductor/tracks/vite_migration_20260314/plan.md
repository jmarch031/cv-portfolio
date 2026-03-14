# Implementation Plan: Vite Migration & Professional Structure

## Overview
This plan outlines the steps for transitioning the current monolithic portfolio to a professional Vite-based structure using TypeScript. Each phase will focus on a specific area of the modernization process.

## Phase 1: Vite & Infrastructure Setup
- [x] Task: Initialize a new Vite project with the TypeScript template (`vanilla-ts`).
- [x] Task: Set up the project's dependency management by creating a `package.json` file.
- [x] Task: Install core dependencies (GSAP, Lenis, etc.) as NPM packages.
- [x] Task: Configure GitHub Actions for automated deployment to GitHub Pages.
- [~] Task: Conductor - User Manual Verification 'Vite & Infrastructure Setup' (Protocol in workflow.md).

## Phase 2: Content & Asset Extraction
- [ ] Task: Extract CSS from `index.html` into modular `.css` or `.scss` files.
- [ ] Task: Extract JavaScript logic from `index.html` and convert it into TypeScript (`.ts`) modules.
- [ ] Task: Move i18n translations from `index.html` into separate JSON files (`fr.json`, `en.json`).
- [ ] Task: Move images and other static assets into the `public/` or `assets/` directory.
- [ ] Task: Conductor - User Manual Verification 'Content & Asset Extraction' (Protocol in workflow.md).

## Phase 3: Integration & Testing
- [ ] Task: Update the main `index.html` file to use the new modular structure and Vite asset loading.
- [ ] Task: Re-implement the GSAP animations and Lenis smooth scrolling using the new TypeScript modules and NPM packages.
- [ ] Task: Test the i18n system to ensure it correctly loads and switches between languages from external JSON files.
- [ ] Task: Verify the overall site performance and 60fps animation consistency.
- [ ] Task: Conductor - User Manual Verification 'Integration & Testing' (Protocol in workflow.md).

## Phase 4: Final Deployment & Cleanup
- [ ] Task: Run a production build (`npm run build`) and verify the output.
- [ ] Task: Push the changes to the `main` branch and verify the GitHub Actions deployment workflow.
- [ ] Task: Clean up the old monolithic `index.html` and any unused assets.
- [ ] Task: Conductor - User Manual Verification 'Final Deployment & Cleanup' (Protocol in workflow.md).

---

*This plan follows the project's standard development workflow.*
