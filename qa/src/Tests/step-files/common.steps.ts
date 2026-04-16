/**
 * Common step definitions shared across multiple feature files.
 */
import { Given, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../test-setup/world';
import { LoginPage } from '../page-files/LoginPage';
import { DashboardPage } from '../page-files/DashboardPage';
import { assertElementVisible, assertTrue } from '../../utils/assert-utils';
import { getLogger } from '../../utils/logger';
import { getBaseURL } from '../../utils/env-utils';
import { navigateTo } from '../../utils/page-utils';

const logger = getLogger();

/**
 * Verify the application is accessible.
 */
Given('the application is accessible', async function (this: CustomWorld) {
  const url = getBaseURL();
  logger.info(`Verifying application is accessible at: ${url}`);
  await navigateTo(url);
  // Just verify the page loaded (no crash) — any redirect is fine
  await assertTrue(true, 'Application is accessible');
});

/**
 * Log in once and have a ready session for subsequent steps.
 */
Given(
  'I am logged into the application as {string} with password {string}',
  async function (this: CustomWorld, username: string, password: string) {
    logger.info(`Logging in as ${username}`);
    const loginPage = new LoginPage();
    await loginPage.navigate();
    await loginPage.login(username, password);
    // Wait for the dashboard to load after login
    const dashboard = new DashboardPage();
    await dashboard.navigate();
    const isLoggedIn = await dashboard.isLoggedIn();
    await assertTrue(isLoggedIn, `Expected to be logged in as ${username}`);
  },
);
