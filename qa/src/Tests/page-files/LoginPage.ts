/**
 * LoginPage — encapsulates all locators and actions for the Vikunja login screen.
 * Follows Single Responsibility Principle: no assertions here — only interactions.
 */
import { getLocatorByPlaceholder, getLocatorByRole, getLocatorByText } from '../../utils/locator-utils';
import { fill, click, getText } from '../../utils/action-utils';
import { navigateTo } from '../../utils/page-utils';
import { getBaseURL } from '../../utils/env-utils';
import { getLogger } from '../../utils/logger';
import { waitForElement } from '../../utils/element-utils';

const logger = getLogger();

export class LoginPage {
  // ─── Locators ──────────────────────────────────────────────────────────

  private get usernameInput() {
    //return getLocatorByPlaceholder(/username or email address/i);
    return getLocatorByRole('textbox', { name: 'Username Or Email Address' });
   }

  private get passwordInput() {
    //return getLocatorByPlaceholder(/password/i);
    return getLocatorByRole('textbox', { name: 'Password' })
  }

  private get loginButton() {
    return getLocatorByRole('button', { name: /login/i });
  }

  private get errorMessage() {
    // Vikunja shows errors in a notification banner
    return getLocatorByText("Wrong username or password.");
  }

  private get registerLink() {
    return getLocatorByRole('link', { name: 'Create account' });
  }

  private get forgotPasswordLink() {
    return getLocatorByText(/forgot password/i);
  }

  private get pleaseProvideAUserName() {
    // Vikunja shows errors in a notification banner
    return getLocatorByText("Please provide a username.");
  }

  private get pleaseProvideAPassword() {
    // Vikunja shows errors in a notification banner
    return getLocatorByText("Please provide a password.");
  }
  // ─── Actions ──────────────────────────────────────────────────────────

  /**
   * Navigate to the Vikunja login page.
   */
  async navigate(): Promise<void> {
    const url = `${getBaseURL()}/login`;
    logger.info(`Navigating to login page: ${url}`);
    await navigateTo(url);
  }

  /**
   * Enter the username/email in the username field.
   */
  async enterUsername(username: string): Promise<void> {
    logger.debug(`Entering username: ${username}`);
    await fill(this.usernameInput, username);
  }

  /**
   * Enter the password in the password field.
   */
  async enterPassword(password: string): Promise<void> {
    logger.debug('Entering password (value hidden)');
    await fill(this.passwordInput, password);
  }

  /**
   * Click the login button.
   */
  async clickLogin(): Promise<void> {
    logger.debug('Clicking login button');
    await click(this.loginButton);
  }

  /**
   * Complete the full login flow in one call.
   */
  async login(username: string, password: string): Promise<void> {
    logger.info(`Logging in as: ${username}`);
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  /**
   * Get the error message text displayed after a failed login.
   */
  async getErrorMessage(): Promise<string> {
    return getText(this.errorMessage);
  }

  /**
   * Check whether the error message element is present in the DOM.
   */
  async hasErrorMessage(): Promise<boolean> {
    await waitForElement(this.errorMessage, 'visible', { timeout: 10_000 });
    return this.errorMessage.isVisible();
  }

  /**
   * Click the 'Register' link to navigate to registration.
   */
  async clickRegister(): Promise<void> {
    await click(this.registerLink);
  }

  /**
   * Click the "Create account" link on the login page to go to /register.
   */
  async clickCreateAccountLink(): Promise<void> {
    logger.debug('Clicking Create account link on login page');
    await click(this.registerLink);
  }

  /**
   * Verify Login Button Is Displyed
   */
  async verifyLoginButtonIsDisplayed(): Promise<void> {
    logger.debug('Verify Login Button Is Displyed');
    await waitForElement(this.loginButton, 'visible', { timeout: 10_000 });
  }

  /**
   * Check whether the error message element is present in the DOM.
   */
  async pleaseProvideUserNameAndPasswordError(): Promise<void> {
    await waitForElement(this.pleaseProvideAUserName, 'visible', { timeout: 10_000 });
    await waitForElement(this.pleaseProvideAPassword, 'visible', { timeout: 10_000 });
  
  }

}

