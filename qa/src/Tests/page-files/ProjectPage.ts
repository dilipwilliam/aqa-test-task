/**
 * ProjectPage — encapsulates locators and actions for Vikunja project management.
 * Covers: create, read, update, delete projects.
 */
import {
  getLocatorByRole,
  getLocatorByText,
  getLocatorByPlaceholder,
  getLocator,
} from '../../utils/locator-utils';
import { click, fill, getText, waitForElement } from '../../utils/action-utils';
import { navigateTo } from '../../utils/page-utils';
import { getBaseURL } from '../../utils/env-utils';
import { getLogger } from '../../utils/logger';

const logger = getLogger();

export class ProjectPage {
  // ─── Locators ──────────────────────────────────────────────────────────

  private get newProjectButton() {
    return getLocatorByRole('button', { name: /new project/i });
  }

  private get projectTitleInput() {
    return getLocatorByPlaceholder(/project name|title/i);
  }

  private get projectDescriptionInput() {
    return getLocatorByPlaceholder(/description/i);
  }

  private get saveProjectButton() {
    return getLocatorByRole('button', { name: /save|create|done/i });
  }

  private get projectList() {
    return getLocator('.project-title, [data-testid="project-title"], .menu-item-title');
  }

  /** Context menu / kebab menu on a project card */
  private get projectContextMenu() {
    return getLocator('.project-menu, [data-testid="project-menu"], .dropdown-trigger');
  }

  private get editProjectOption() {
    return getLocatorByText(/edit/i);
  }

  private get deleteProjectOption() {
    return getLocatorByText(/delete/i);
  }

  private get confirmDeleteButton() {
    return getLocatorByRole('button', { name: /delete|confirm/i });
  }

  private get successNotification() {
    return getLocator('.notification.is-success, [data-testid="success-notification"], .success-notification');
  }

  // ─── Actions ──────────────────────────────────────────────────────────

  /**
   * Navigate to the projects page.
   */
  async navigate(): Promise<void> {
    const url = `${getBaseURL()}/projects`;
    logger.info(`Navigating to projects page: ${url}`);
    await navigateTo(url);
  }

  /**
   * Create a new project with the given title (and optional description).
   */
  async createProject(title: string, description?: string): Promise<void> {
    logger.info(`Creating project: "${title}"`);
    await click(this.newProjectButton);
    await waitForElement(this.projectTitleInput, 'visible');
    await fill(this.projectTitleInput, title);
    if (description) {
      try {
        await fill(this.projectDescriptionInput, description);
      } catch {
        logger.debug('Description field not visible — skipping');
      }
    }
    await click(this.saveProjectButton);
    logger.info(`Project "${title}" created`);
  }

  /**
   * Get the names of all visible projects.
   */
  async getProjectNames(): Promise<string[]> {
    const locators = await this.projectList.all();
    const names: string[] = [];
    for (const locator of locators) {
      const text = await locator.innerText();
      if (text.trim()) names.push(text.trim());
    }
    return names;
  }

  /**
   * Check whether a project with the given title is visible on the page.
   */
  async isProjectVisible(title: string): Promise<boolean> {
    const names = await this.getProjectNames();
    return names.some((n) => n.includes(title));
  }

  /**
   * Open the context menu for a named project.
   */
  async openProjectMenu(projectTitle: string): Promise<void> {
    logger.debug(`Opening menu for project: "${projectTitle}"`);
    const projectItem = getLocatorByText(projectTitle);
    await click(projectItem);
  }

  /**
   * Delete the named project via its context menu.
   */
  async deleteProject(projectTitle: string): Promise<void> {
    logger.info(`Deleting project: "${projectTitle}"`);
    const projectRow = getLocator(`text=${projectTitle}`).locator('xpath=ancestor::li | xpath=ancestor::div[contains(@class,"project")]').first();
    // Hover to reveal the action buttons
    await projectRow.hover().catch(async () => {
      // Fallback: click the project name to enter it, then use settings
      await click(getLocatorByText(projectTitle, { exact: true }));
    });

    // Try the context/dropdown menu approach
    await click(this.projectContextMenu.first());
    await waitForElement(this.deleteProjectOption, 'visible');
    await click(this.deleteProjectOption);
    await waitForElement(this.confirmDeleteButton, 'visible');
    await click(this.confirmDeleteButton);
    logger.info(`Project "${projectTitle}" deleted`);
  }

  /**
   * Edit the title of an existing project.
   */
  async updateProjectTitle(currentTitle: string, newTitle: string): Promise<void> {
    logger.info(`Updating project "${currentTitle}" → "${newTitle}"`);
    await click(this.projectContextMenu.first());
    await waitForElement(this.editProjectOption, 'visible');
    await click(this.editProjectOption);
    await waitForElement(this.projectTitleInput, 'visible');
    await fill(this.projectTitleInput, newTitle);
    await click(this.saveProjectButton);
    logger.info(`Project renamed to "${newTitle}"`);
  }

  /**
   * Navigate to a specific project by its title link.
   */
  async openProject(projectTitle: string): Promise<void> {
    logger.info(`Opening project: "${projectTitle}"`);
    await click(getLocatorByText(projectTitle, { exact: true }));
  }
}
