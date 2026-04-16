/**
 * Step definitions for login.feature — authentication flows.
 */
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../test-setup/world';
import { LoginPage } from '../page-files/LoginPage';
import {
  assertElementVisible,
  assertElementHidden,
  assertTrue,
  assertContains,
  assertURLContains,
} from '../../utils/assert-utils';
import { getLogger } from '../../utils/logger';
import { getPage } from '../../utils/page-utils';

const logger = getLogger();
const loginPage = new LoginPage();

// ─── Given ───────────────────────────────────────────────────────────────

Given('I am on the login page', async function (this: CustomWorld) {
  logger.info('Navigating to login page');
  await loginPage.navigate();
  await assertURLContains('/login', 'Should be on the login page');
});

// ─── When ─────────────────────────────────────────────────────────────────

When('I enter username {string}', async function (this: CustomWorld, username: string) {
  logger.debug(`Entering username: "${username}"`);
  await loginPage.enterUsername(username);
});

When('I enter password {string}', async function (this: CustomWorld, password: string) {
  logger.debug('Entering password');
  await loginPage.enterPassword(password);
});

When('I click the login button', async function (this: CustomWorld) {
  logger.debug('Clicking login button');
  await loginPage.clickLogin();
});

// ─── Then ─────────────────────────────────────────────────────────────────

Then('I should be redirected to the dashboard', async function (this: CustomWorld) {
  logger.info('Verifying redirect to dashboard');
  // After successful login, the URL should no longer contain /login
  const page = getPage();
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 15_000 });
  const currentUrl = page.url();
  await assertTrue(
    !currentUrl.includes('/login'),
    `Expected to be redirected from /login but current URL is ${currentUrl}`,
  );
});

Then('I should not see the login form', async function (this: CustomWorld) {
  logger.info('Verifying login form is not visible');
  await assertElementHidden('form[action*="login"], [data-testid="login-form"]');
});

Then('I should see an authentication error message', async function (this: CustomWorld) {
  logger.info('Verifying authentication error message');
  const hasError = await loginPage.hasErrorMessage();
  await assertTrue(
    hasError,
    'Expected an error message to be visible after failed login',
  );
});

Then('I should remain on the login page', async function (this: CustomWorld) {
  logger.info('Verifying still on login page');
  await assertURLContains('/login', 'Should remain on the login page after failed login');
});

Then('the username field should be visible', async function (this: CustomWorld) {
  logger.info('Checking username field visibility');
  await assertElementVisible('[placeholder*="Username"], [placeholder*="username"], input[name="username"]');
});

Then('the password field should be visible', async function (this: CustomWorld) {
  logger.info('Checking password field visibility');
  await assertElementVisible('input[type="password"]');
});

Then('the login button should be visible', async function (this: CustomWorld) {
  logger.info('Checking login button visibility');
  await loginPage.verifyLoginButtonIsDisplayed();
  //await assertElementVisible('button[type="submit"], button');
});

Then('I should see a validation error', async function (this: CustomWorld) {
  logger.info('Verifying validation error is displayed');
  await loginPage.pleaseProvideUserNameAndPasswordError();
 });
