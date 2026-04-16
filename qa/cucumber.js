/**
 * Cucumber.js configuration — supports default (sequential) and parallel profiles.
 * Uses ts-node/register for TypeScript compilation at runtime.
 * Allure reporter attaches results to allure-results/ folder.
 */

const common = {
  requireModule: ['ts-node/register'],
  require: [
    'src/test-setup/world.ts',
    'src/test-setup/hooks.ts',
    'src/Tests/step-files/**/*.ts',
  ],
  paths: ['src/Tests/feature-files/**/*.feature'],
  format: [
    'progress-bar',
    './src/test-setup/allure-reporter.js',
  ],
  publishQuiet: true,
  timeout: 60000,
};

module.exports = {
  /** Default sequential profile — standard CI/local run */
  default: {
    ...common,
  },

  /** Parallel profile — runs feature files across multiple workers */
  parallel: {
    ...common,
    parallel: 4,
  },

  /** Smoke profile — only @smoke tagged scenarios */
  smoke: {
    ...common,
    tags: '@smoke',
  },

  /** API-only profile */
  api: {
    ...common,
    tags: '@api',
  },

  /** UI-only profile */
  ui: {
    ...common,
    tags: '@ui or @web',
  },

  /** DEV environment profile */
  dev: {
    ...common,
    worldParameters: { env: 'DEV' },
  },

  /** STAGE environment profile */
  stage: {
    ...common,
    worldParameters: { env: 'STAGE' },
  },
};
