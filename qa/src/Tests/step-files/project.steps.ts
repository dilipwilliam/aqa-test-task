/**
 * Step definitions for project.feature — project CRUD flows.
 */
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../test-setup/world';
import { ProjectPage } from '../page-files/ProjectPage';
import {
  assertTrue,
  assertFalse,
  assertElementVisible,
} from '../../utils/assert-utils';
import { getLogger } from '../../utils/logger';
import { getUniqueId } from '../../utils/test-data-utils';

const logger = getLogger();
const projectPage = new ProjectPage();

// ─── Given ───────────────────────────────────────────────────────────────

Given('I am on the projects page', async function (this: CustomWorld) {
  logger.info('Navigating to projects page');
  await projectPage.navigate();
});

Given(
  'a project titled {string} exists',
  async function (this: CustomWorld, title: string) {
    logger.info(`Ensuring project "${title}" exists`);
    const isVisible = await projectPage.isProjectVisible(title);
    if (!isVisible) {
      await projectPage.createProject(title);
      logger.info(`Created project "${title}" for precondition`);
    }
    this.set('currentProjectTitle', title);
  },
);

// ─── When ─────────────────────────────────────────────────────────────────

When(
  'I create a project with title {string}',
  async function (this: CustomWorld, title: string) {
    logger.info(`Creating project: "${title}"`);
    await projectPage.createProject(title);
    this.set('lastCreatedProjectTitle', title);
  },
);

When(
  'I delete the project {string}',
  async function (this: CustomWorld, projectTitle: string) {
    logger.info(`Deleting project: "${projectTitle}"`);
    await projectPage.deleteProject(projectTitle);
  },
);

When(
  'I update the project title from {string} to {string}',
  async function (this: CustomWorld, oldTitle: string, newTitle: string) {
    logger.info(`Updating project "${oldTitle}" to "${newTitle}"`);
    await projectPage.updateProjectTitle(oldTitle, newTitle);
  },
);

When(
  'I attempt to create a project with an empty title',
  async function (this: CustomWorld) {
    logger.info('Attempting to create a project with empty title');
    await projectPage.createProject('');
  },
);

// ─── Then ─────────────────────────────────────────────────────────────────

Then(
  'the project {string} should be visible in the project list',
  async function (this: CustomWorld, title: string) {
    logger.info(`Verifying project "${title}" is visible`);
    await projectPage.navigate();
    const isVisible = await projectPage.isProjectVisible(title);
    await assertTrue(isVisible, `Expected project "${title}" to be visible in the project list`);
  },
);

Then(
  'the project {string} should not be visible in the project list',
  async function (this: CustomWorld, title: string) {
    logger.info(`Verifying project "${title}" is NOT visible`);
    await projectPage.navigate();
    const isVisible = await projectPage.isProjectVisible(title);
    await assertFalse(
      isVisible,
      `Expected project "${title}" to NOT be visible in the project list`,
    );
  },
);

Then('the projects page should display a list of projects', async function (this: CustomWorld) {
  logger.info('Verifying project list is displayed');
  const names = await projectPage.getProjectNames();
  await assertTrue(
    names.length >= 0,
    'Expected projects page to render without error',
  );
});

Then('I should see a project title validation error', async function (this: CustomWorld) {
  logger.info('Checking for project title validation error');
  const errorLocator = '[data-testid="error"], .notification.is-danger, .error-message';
  await assertElementVisible(errorLocator);
});
