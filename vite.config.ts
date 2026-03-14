import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages deployment
  // Replace 'cv-portfolio' with your repository name if it's different
  base: '/cv-portfolio/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
