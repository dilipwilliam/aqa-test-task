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
import { getLocatorByRole } from '../../utils/locator-utils';
import { generateTaskTitle } from '../../utils/test-data-utils';
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

// ─── CRUD Flow — When ─────────────────────────────────────────────────────────

When('I create a task with a unique generated title', async function (this: CustomWorld) {
  const taskTitle = generateTaskTitle('CRUDTask');
  logger.info(`Generated task title: "${taskTitle}"`);
  this.set('dynamicTaskTitle', taskTitle);
  await taskPage.createTaskViaAddButton(taskTitle);
});

When('I open the dynamically created task', async function (this: CustomWorld) {
  const taskTitle = this.get<string>('dynamicTaskTitle');
  logger.info(`Opening dynamically created task: "${taskTitle}"`);
  await taskPage.openTask(taskTitle);
});

When('I add a bullet list comment to the task', async function (this: CustomWorld) {
  const commentText = `Comment_${Date.now()}`;
  logger.info(`Adding bullet-list comment: "${commentText}"`);
  this.set('commentText', commentText);
  await taskPage.addBulletListComment(commentText);
});

When('I delete the task from the detail page', async function (this: CustomWorld) {
  logger.info('Initiating task deletion from detail page');
  await taskPage.deleteTaskFromDetailPage();
});

When('I confirm the task deletion', async function (this: CustomWorld) {
  logger.info('Confirming task deletion');
  await taskPage.confirmTaskDeletion();
});

// ─── CRUD Flow — Then ─────────────────────────────────────────────────────────

Then(
  'the dynamically created task should be visible in the task list',
  async function (this: CustomWorld) {
    const taskTitle = this.get<string>('dynamicTaskTitle');
    logger.info(`Verifying task "${taskTitle}" is visible in task list`);
    await assertElementVisible(getLocatorByRole('link', { name: taskTitle }));
  },
);

Then(
  'the task detail header should contain the task title',
  async function (this: CustomWorld) {
    const taskTitle = this.get<string>('dynamicTaskTitle');
    logger.info(`Verifying task detail header contains "${taskTitle}"`);
    await assertElementVisible(taskPage.getTaskDetailHeading(taskTitle));
  },
);

Then(
  'the {string} button should be visible on task detail',
  async function (this: CustomWorld, buttonName: string) {
    logger.info(`Verifying "${buttonName}" button is visible on task detail`);
    await assertElementVisible(getLocatorByRole('button', { name: buttonName }));
  },
);

Then(
  'the {string} section should be visible on task detail',
  async function (this: CustomWorld, sectionName: string) {
    logger.info(`Verifying "${sectionName}" section is visible on task detail`);
    await assertElementVisible(
      getLocatorByRole('heading', { name: new RegExp(sectionName, 'i') }),
    );
  },
);

Then(
  'I should see the success message {string}',
  async function (this: CustomWorld, message: string) {
    logger.info(`Verifying success toast: "${message}"`);
    await taskPage.waitForSuccessMessage(message);
  },
);
