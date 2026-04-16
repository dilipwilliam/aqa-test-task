/**
 * RegisterPage — encapsulates locators and interactions for the Vikunja registration screen.
 * Follows Single Responsibility Principle: no assertions here — only interactions.
 */
import { getLocatorByRole } from '../../utils/locator-utils';
import { fill, click } from '../../utils/action-utils';
import { navigateTo } from '../../utils/page-utils';
import { getBaseURL } from '../../utils/env-utils';
import { getLogger } from '../../utils/logger';
import { waitForElement } from '../../utils/element-utils';

const logger = getLogger();

export class RegisterPage {
  // ─── Locators ──────────────────────────────────────────────────────────

  /** Username input on the registration form */
  private get usernameInput() {
    return getLocatorByRole('textbox', { name: 'Username' });
  }

  /** Email address input on the registration form */
  private get emailInput() {
    return getLocatorByRole('textbox', { name: 'Email address' });
  }

  /** Password input on the registration form */
  private get passwordInput() {
    return getLocatorByRole('textbox', { name: 'Password' });
  }

  /** "Create account" submit button (enabled only when all fields are filled) */
  private get createAccountButton() {
    return getLocatorByRole('button', { name: 'Create account' });
  }

  /** Page heading confirming we are on the register page */
  private get pageHeading() {
    return getLocatorByRole('heading', { name: 'Create account' });
  }

  // ─── Actions ──────────────────────────────────────────────────────────

  /**
   * Navigate directly to the Vikunja registration page.
   */
  async navigate(): Promise<void> {
    const url = `${getBaseURL()}/register`;
    logger.info(`Navigating to register page: ${url}`);
    await navigateTo(url);
  }

  /**
   * Enter the username in the username field.
   */
  async enterUsername(username: string): Promise<void> {
    logger.debug(`Entering registration username: ${username}`);
    await fill(this.usernameInput, username);
  }

  /**
   * Enter the email address in the email field.
   */
  async enterEmail(email: string): Promise<void> {
    logger.debug(`Entering registration email: ${email}`);
    await fill(this.emailInput, email);
  }

  /**
   * Enter the password in the password field.
   */
  async enterPassword(password: string): Promise<void> {
    logger.debug('Entering registration password (value hidden)');
    await fill(this.passwordInput, password);
  }

  /**
   * Click the "Create account" submit button.
   * Waits for it to be visible (enabled state) before clicking.
   */
  async clickCreateAccount(): Promise<void> {
    logger.debug('Clicking Create account button');
    await waitForElement(this.createAccountButton, 'visible', { timeout: 10_000 });
    await click(this.createAccountButton);
  }

  /**
   * Complete the full registration flow in one call.
   */
  async register(username: string, email: string, password: string): Promise<void> {
    logger.info(`Registering new user: ${username}`);
    await this.enterUsername(username);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickCreateAccount();
  }

  /**
   * Check whether the registration page heading is visible.
   */
  async isOnRegisterPage(): Promise<boolean> {
    return this.pageHeading.isVisible();
  }
}
