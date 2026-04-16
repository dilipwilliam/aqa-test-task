/**
 * TaskPage — encapsulates locators and actions for Vikunja task management within a project.
 * Covers: create, read, update, delete tasks.
 */
import {
  getLocatorByRole,
  getLocatorByText,
  getLocatorByPlaceholder,
  getLocator,
} from '../../utils/locator-utils';
import { click, fill, getText, waitForElement, pressKeyOnElement } from '../../utils/action-utils';
import { getLogger } from '../../utils/logger';

const logger = getLogger();

export class TaskPage {
  // ─── Locators ──────────────────────────────────────────────────────────

  private get addTaskInput() {
    return getLocatorByPlaceholder(/add a task|task title|new task/i);
  }

  private get taskTitleInput() {
    return getLocatorByPlaceholder(/task title|title/i);
  }

  private get taskDescriptionInput() {
    return getLocatorByPlaceholder(/description/i);
  }

  private get saveTaskButton() {
    return getLocatorByRole('button', { name: /save|add task|create/i });
  }

  private get taskList() {
    return getLocator('.task-title, [data-testid="task-title"], .tasks .task .name');
  }

  private get taskCheckbox() {
    return getLocator('[data-testid="task-done-checkbox"], .fancycheckbox label, .task input[type="checkbox"]');
  }

  private get taskMoreOptions() {
    return getLocator('.task-options, [data-testid="task-options"], .more-options');
  }

  private get editTaskOption() {
    return getLocatorByText(/edit/i);
  }

  private get deleteTaskOption() {
    return getLocatorByText(/delete/i);
  }

  private get confirmDeleteButton() {
    return getLocatorByRole('button', { name: /delete|confirm/i });
  }

  // ─── Actions ──────────────────────────────────────────────────────────

  /**
   * Create a new task with the given title by typing into the quick-add input.
   */
  async createTask(title: string): Promise<void> {
    logger.info(`Creating task: "${title}"`);
    try {
      // Try the quick-add inline input first
      await waitForElement(this.addTaskInput, 'visible', { timeout: 5000 });
      await fill(this.addTaskInput, title);
      await pressKeyOnElement(this.addTaskInput, 'Enter');
    } catch {
      // Fallback to button-based creation
      logger.debug('Quick-add input not found, trying button approach');
      const addButton = getLocatorByRole('button', { name: /add task|new task|\+/i });
      await click(addButton);
      await waitForElement(this.taskTitleInput, 'visible');
      await fill(this.taskTitleInput, title);
      await click(this.saveTaskButton);
    }
    logger.info(`Task "${title}" created`);
  }

  /**
   * Get the titles of all visible tasks.
   */
  async getTaskNames(): Promise<string[]> {
    const locators = await this.taskList.all();
    const names: string[] = [];
    for (const loc of locators) {
      const text = await loc.innerText();
      if (text.trim()) names.push(text.trim());
    }
    return names;
  }

  /**
   * Check whether a task with the given title is visible.
   */
  async isTaskVisible(title: string): Promise<boolean> {
    const names = await this.getTaskNames();
    return names.some((n) => n.includes(title));
  }

  /**
   * Mark a task as done by clicking its checkbox.
   */
  async markTaskDone(taskTitle: string): Promise<void> {
    logger.info(`Marking task as done: "${taskTitle}"`);
    const taskRow = getLocatorByText(taskTitle).locator('xpath=ancestor::div[contains(@class,"task")]').first();
    const checkbox = taskRow.locator('input[type="checkbox"], .fancycheckbox label');
    await click(checkbox);
  }

  /**
   * Delete a task by its title using the context menu.
   */
  async deleteTask(taskTitle: string): Promise<void> {
    logger.info(`Deleting task: "${taskTitle}"`);
    const taskRow = getLocatorByText(taskTitle).locator('xpath=ancestor::div[contains(@class,"task")]').first();
    await taskRow.hover();
    await click(this.taskMoreOptions.first());
    await waitForElement(this.deleteTaskOption, 'visible');
    await click(this.deleteTaskOption);
    await waitForElement(this.confirmDeleteButton, 'visible');
    await click(this.confirmDeleteButton);
    logger.info(`Task "${taskTitle}" deleted`);
  }

  /**
   * Open a task to view its details.
   */
  async openTask(taskTitle: string): Promise<void> {
    logger.info(`Opening task: "${taskTitle}"`);
    await click(getLocatorByText(taskTitle, { exact: true }));
  }

  /**
   * Update the title of an existing task.
   */
  async updateTaskTitle(currentTitle: string, newTitle: string): Promise<void> {
    logger.info(`Updating task "${currentTitle}" → "${newTitle}"`);
    await this.openTask(currentTitle);
    const titleField = getLocatorByPlaceholder(/task title|title/i);
    await waitForElement(titleField, 'visible');
    await fill(titleField, newTitle);
    await click(this.saveTaskButton);
    logger.info(`Task renamed to "${newTitle}"`);
  }
}
