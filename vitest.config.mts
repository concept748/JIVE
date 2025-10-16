import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      'tests/integration/**', // Skip integration tests by default (require running server)
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/.next/**',
        'tests/**',
        'vitest.config.mts',
        'vitest.setup.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.config.*',
        '**/coverage/**',
      ],
      include: ['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'types/**/*.ts'],
      all: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
