import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  test: {
    include: ['services/**/*.test.ts', 'app/**/*.test.ts'],
  },
});
