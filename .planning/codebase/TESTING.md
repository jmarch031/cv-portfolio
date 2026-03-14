# Testing

## Current State
There is no automated testing framework (like Jest, Cypress, or similar) currently integrated into the project.

## Quality Assurance Strategy
- **Manual Verification**: Primary method for checking layout, animations, and i18n switching across different viewports.
- **Husky Hooks**: The presence of `.husky/pre-commit` suggests a baseline check (likely linting or formatting) is enforced before commits are allowed.
- **Visual Regression**: Managed manually by ensuring GSAP timelines and ScrollTriggers behave consistently on various devices.

## Recommendations for Future Testing
1. **Visual Regression Testing**: Tools like Playwright or Percy could be used to catch regressions in the complex glassmorphism and animation layouts.
2. **Unit Testing for Logic**: Specifically for the i18n `translations` object and `setLanguage` function.
3. **Accessibility Audits**: Using Lighthouse or Axe-core to ensure the custom interactive elements (like the custom cursor and menu) remain usable for all users.
