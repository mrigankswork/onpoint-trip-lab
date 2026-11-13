import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Relative base so the same build works on Vercel and on GitHub Pages sub-paths.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
