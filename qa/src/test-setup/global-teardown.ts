/**
 * Playwright global teardown — runs once after all Playwright test suites.
 * Cleans up shared resources and logs summary.
 */
import { getLogger } from '../utils/logger';

const logger = getLogger();

async function globalTeardown(): Promise<void> {
  logger.info('Global Teardown: cleaning up shared resources');
  // Add any global cleanup here (e.g., delete seeded test data via API)
  logger.info('Global Teardown complete');
}

export default globalTeardown;
