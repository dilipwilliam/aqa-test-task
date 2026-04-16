/**
 * Step definitions for register.feature — create account flow.
 */
import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../test-setup/world';
import { LoginPage } from '../page-files/LoginPage';
import { RegisterPage } from '../page-files/RegisterPage';
import { DashboardPage } from '../page-files/DashboardPage';
import { assertElementVisible } from '../../utils/assert-utils';
import { getLogger } from '../../utils/logger';
import {
  generateUsername,
  generatePassword,
  generateRegistrationEmail,
} from '../../utils/test-data-utils';

const logger = getLogger();
const loginPage = new LoginPage();
const registerPage = new RegisterPage();
const dashboardPage = new DashboardPage();

// ─── When ─────────────────────────────────────────────────────────────────

When('I click the "Create account" link', async function (this: CustomWorld) {
  logger.info('Clicking "Create account" link on login page');
  await loginPage.clickCreateAccountLink();
});

When(
  'I fill in the registration form with random credentials',
  async function (this: CustomWorld) {
    const username = generateUsername();
    const email = generateRegistrationEmail(username);
    const password = generatePassword();
    logger.info(`Registering with username: ${username}, email: ${email}`);
    this.set('regUsername', username);
    this.set('regEmail', email);
    await registerPage.enterUsername(username);
    await registerPage.enterEmail(email);
    await registerPage.enterPassword(password);
  },
);

When('I click the "Create account" button', async function (this: CustomWorld) {
  logger.info('Clicking "Create account" submit button');
  await registerPage.clickCreateAccount();
});

// ─── Then ─────────────────────────────────────────────────────────────────

Then(
  'I should see the "Winding down" welcome message on the dashboard',
  async function (this: CustomWorld) {
    logger.info('Verifying text welcome message is visible on the dashboard');
    await assertElementVisible(dashboardPage.getTextOnDashboardPage());
  },
);
