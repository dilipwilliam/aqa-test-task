/**
 * Playwright global setup — runs once before all Playwright test suites.
 * Verifies application health and optionally pre-creates a test user.
 */
import { chromium, request } from '@playwright/test';
import { getLogger } from '../utils/logger';
import { getBaseURL, getApiBaseURL } from '../utils/env-utils';

const logger = getLogger();

async function globalSetup(): Promise<void> {
  const baseURL = getBaseURL();
  const apiBaseURL = getApiBaseURL();

  logger.info(`Global Setup: verifying application at ${baseURL}`);

  // Verify application is reachable
  const ctx = await request.newContext({ ignoreHTTPSErrors: true });
  try {
    const response = await ctx.get(baseURL, { timeout: 30_000 });
    if (!response.ok() && response.status() !== 302) {
      logger.warn(`Application returned HTTP ${response.status()} — proceeding anyway`);
    } else {
      logger.info(`Application is reachable at ${baseURL}`);
    }
  } catch (err) {
    logger.error(`Could not reach ${baseURL} — ensure Docker Compose is running.`, err);
    throw new Error(`Application not accessible at ${baseURL}. Start with: cd application && docker-compose up -d`);
  } finally {
    await ctx.dispose();
  }

  logger.info('Global Setup complete');
}

export default globalSetup;
