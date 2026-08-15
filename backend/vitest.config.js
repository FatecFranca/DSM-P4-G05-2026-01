import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.js'],
      exclude: ['src/generated/**', 'src/bin/**'],
      reporter: ['text', 'text-summary', 'json-summary'],
    },
  },
});
