/**
 * Playwright configuration — enterprise-ready, multi-browser, multi-environment.
 * Supports: Chromium, Firefox, WebKit; parallel execution; Allure reporting;
 * screenshot on failure; video retain-on-failure; trace on first retry.
 */
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file if present
dotenv.config({ path: path.resolve(__dirname, '.env') });

const ENV = (process.env.ENV ?? 'QA').toUpperCase();
const HEADLESS = process.env.HEADLESS !== 'false';
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const WORKERS = process.env.CI ? 4 : undefined;
const RETRIES = process.env.CI ? 2 : 0;

export default defineConfig({
  /* ── Test discovery ──────────────────────────────────────────────── */
  testDir: './src/Tests',
  testMatch: ['**/*.spec.ts'],

  /* ── Timeouts ────────────────────────────────────────────────────── */
  timeout: 60_000,
  expect: { timeout: 10_000 },

  /* ── Execution ───────────────────────────────────────────────────── */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: RETRIES,
  workers: WORKERS,

  /* ── Reporters ───────────────────────────────────────────────────── */
  reporter: [
    ['allure-playwright', { resultsDir: 'allure-results', suiteTitle: false }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],

  /* ── Global shared settings ──────────────────────────────────────── */
  use: {
    baseURL: BASE_URL,
    headless: HEADLESS,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  /* ── Browser projects ────────────────────────────────────────────── */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: HEADLESS,
        launchOptions: {
          slowMo: Number(process.env.SLOW_MO ?? 0),
          args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: HEADLESS,
        launchOptions: { slowMo: Number(process.env.SLOW_MO ?? 0) },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        headless: HEADLESS,
        launchOptions: { slowMo: Number(process.env.SLOW_MO ?? 0) },
      },
    },
    /* ── Mobile viewports (optional) ──────────────────────────────── */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  /* ── Output directory ────────────────────────────────────────────── */
  outputDir: 'test-results',

  /* ── Global setup / teardown ─────────────────────────────────────── */
  globalSetup: './src/test-setup/global-setup.ts',
  globalTeardown: './src/test-setup/global-teardown.ts',
});
