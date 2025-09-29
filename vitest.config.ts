/** @type {import('vitest').Config} */
export default {
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['./tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
};
