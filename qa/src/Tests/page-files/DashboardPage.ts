/**
 * DashboardPage — encapsulates locators and interactions for the Vikunja main dashboard.
 * Follows Single Responsibility Principle: navigation, header state, sidebar access.
 */
import { getLocatorByRole, getLocatorByText, getLocator } from '../../utils/locator-utils';
import { click, getText } from '../../utils/action-utils';
import { navigateTo, getURL } from '../../utils/page-utils';
import { getBaseURL } from '../../utils/env-utils';
import { getLogger } from '../../utils/logger';

const logger = getLogger();

export class DashboardPage {
  // ─── Locators ──────────────────────────────────────────────────────────

  /** User avatar or username in top navigation */
  private get userMenuTrigger() {
    return getLocator('.user-info, [data-testid="user-menu"], .navbar-item.has-dropdown');
  }

  /** 'Logout' item in user dropdown */
  private get logoutButton() {
    return getLocatorByText(/logout/i);
  }

  /** Sidebar link for Projects */
  private get projectsNavLink() {
    return getLocatorByRole('link', { name: /projects/i });
  }

  /** Sidebar 'Home' / overview link */
  private get homeNavLink() {
    return getLocatorByRole('link', { name: /home|overview/i });
  }

  /** Page heading shown on the dashboard */
  private get pageHeading() {
    return getLocatorByRole('heading', { name: /home|overview|dashboard/i });
  }

  /** Sidebar 'New Project' button */
  private get newProjectButton() {
    return getLocatorByRole('button', { name: /new project/i });
  }

  // ─── Actions ──────────────────────────────────────────────────────────

  /**
   * Navigate to the dashboard (root URL after login).
   */
  async navigate(): Promise<void> {
    const url = getBaseURL();
    logger.info(`Navigating to dashboard: ${url}`);
    await navigateTo(url);
  }

  /**
   * Check if the user is currently logged in (dashboard is visible).
   */
  async isLoggedIn(): Promise<boolean> {
    const currentURL = await getURL();
    return !currentURL.includes('/login') && !currentURL.includes('/register');
  }

  /**
   * Get the current page URL.
   */
  async getCurrentURL(): Promise<string> {
    return getURL();
  }

  /**
   * Open the user menu (avatar / username dropdown).
   */
  async openUserMenu(): Promise<void> {
    logger.debug('Opening user menu');
    await click(this.userMenuTrigger);
  }

  /**
   * Log out via the user menu.
   */
  async logout(): Promise<void> {
    logger.info('Logging out');
    await this.openUserMenu();
    await click(this.logoutButton);
  }

  /**
   * Click the 'Projects' link in the sidebar.
   */
  async navigateToProjects(): Promise<void> {
    logger.debug('Navigating to Projects via sidebar');
    await click(this.projectsNavLink);
  }

  /**
   * Click the 'New Project' button in the sidebar.
   */
  async clickNewProject(): Promise<void> {
    logger.debug('Clicking New Project');
    await click(this.newProjectButton);
  }

  /**
   * Get the dashboard heading text.
   */
  async getHeadingText(): Promise<string> {
    return getText(this.pageHeading);
  }
}
