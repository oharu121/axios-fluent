import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global setup/teardown
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['Axon.ts'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'examples/**',
        'dev-notes/**',
        'tests/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        'index.ts',
        'vitest.config.ts',
        'postbuild.js',
      ],
      // Thresholds - enforce minimum coverage
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },

    // Test setup file
    setupFiles: ['./tests/setup.ts'],

    // Test patterns
    include: ['tests/**/*.test.ts'],

    // Timeout for tests
    testTimeout: 10000,

    // Bail on first failure (optional)
    bail: 0,

    // Run tests in parallel
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
});
