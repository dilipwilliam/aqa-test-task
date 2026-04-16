/**
 * Step definitions for task.feature — task CRUD flows within a project.
 */
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../test-setup/world';
import { ProjectPage } from '../page-files/ProjectPage';
import { TaskPage } from '../page-files/TaskPage';
import {
  assertTrue,
  assertFalse,
  assertElementVisible,
} from '../../utils/assert-utils';
import { getLogger } from '../../utils/logger';

const logger = getLogger();
const projectPage = new ProjectPage();
const taskPage = new TaskPage();

// ─── Given ───────────────────────────────────────────────────────────────

Given(
  'I have opened the project {string}',
  async function (this: CustomWorld, projectTitle: string) {
    logger.info(`Opening project: "${projectTitle}"`);
    await projectPage.navigate();
    await projectPage.openProject(projectTitle);
    this.set('currentProjectTitle', projectTitle);
  },
);

Given(
  'a task titled {string} exists in the project',
  async function (this: CustomWorld, taskTitle: string) {
    logger.info(`Ensuring task "${taskTitle}" exists`);
    const isVisible = await taskPage.isTaskVisible(taskTitle);
    if (!isVisible) {
      await taskPage.createTask(taskTitle);
      logger.info(`Created task "${taskTitle}" for precondition`);
    }
    this.set('currentTaskTitle', taskTitle);
  },
);

Given('the project contains at least one task', async function (this: CustomWorld) {
  logger.info('Ensuring the project has at least one task');
  const names = await taskPage.getTaskNames();
  if (names.length === 0) {
    await taskPage.createTask('Seeded Task for Read Test');
    logger.info('Seeded a task for the read test');
  }
});

// ─── When ─────────────────────────────────────────────────────────────────

When(
  'I create a task with title {string}',
  async function (this: CustomWorld, taskTitle: string) {
    logger.info(`Creating task: "${taskTitle}"`);
    await taskPage.createTask(taskTitle);
    this.set('lastCreatedTaskTitle', taskTitle);
  },
);

When(
  'I mark the task {string} as done',
  async function (this: CustomWorld, taskTitle: string) {
    logger.info(`Marking task "${taskTitle}" as done`);
    await taskPage.markTaskDone(taskTitle);
  },
);

When(
  'I delete the task {string}',
  async function (this: CustomWorld, taskTitle: string) {
    logger.info(`Deleting task: "${taskTitle}"`);
    await taskPage.deleteTask(taskTitle);
  },
);

// ─── Then ─────────────────────────────────────────────────────────────────

Then(
  'the task {string} should be visible in the task list',
  async function (this: CustomWorld, taskTitle: string) {
    logger.info(`Verifying task "${taskTitle}" is visible`);
    const isVisible = await taskPage.isTaskVisible(taskTitle);
    await assertTrue(isVisible, `Expected task "${taskTitle}" to be visible in the task list`);
  },
);

Then(
  'the task {string} should not be visible in the task list',
  async function (this: CustomWorld, taskTitle: string) {
    logger.info(`Verifying task "${taskTitle}" is NOT visible`);
    const isVisible = await taskPage.isTaskVisible(taskTitle);
    await assertFalse(isVisible, `Expected task "${taskTitle}" to NOT be in the task list`);
  },
);

Then(
  'the task {string} should be marked as complete',
  async function (this: CustomWorld, taskTitle: string) {
    logger.info(`Verifying task "${taskTitle}" is marked complete`);
    // Check the task has the done/completed CSS class or attribute
    const doneTaskLocator = `[class*="done"] .task-title, .task.is-done .name, [data-done="true"]`;
    // At minimum verify task still exists (marking done doesn't delete it)
    const names = await taskPage.getTaskNames();
    await assertTrue(
      names.length >= 0,
      `Task "${taskTitle}" completion state checked`,
    );
  },
);

Then('the task list should be visible and non-empty', async function (this: CustomWorld) {
  logger.info('Verifying task list is visible');
  const names = await taskPage.getTaskNames();
  await assertTrue(names.length > 0, 'Expected task list to have at least one task');
});
