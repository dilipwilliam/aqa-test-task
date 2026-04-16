/**
 * Step definitions for api.feature — Vikunja REST API test steps.
 * Uses Playwright APIRequestContext via api-utils.
 */
import { Given, When, Then } from '@cucumber/cucumber';
import type { APIResponse } from '@playwright/test';
import { CustomWorld } from '../../test-setup/world';
import {
  createRequestContext,
  post,
  get,
  put,
  deleteRequest,
  attachRequestResponseToAllure,
  parseJSON,
} from '../../utils/api-utils';
import {
  assertStatusCode,
  assertTrue,
  assertContains,
  assertResponseOk,
  assertResponseBodyContains,
} from '../../utils/assert-utils';
import { getApiBaseURL } from '../../utils/env-utils';
import { getLogger } from '../../utils/logger';

const logger = getLogger();

// ─── Type helpers ─────────────────────────────────────────────────────────

interface LoginResponse {
  token: string;
}

interface ProjectResponse {
  id: number;
  title: string;
  [key: string]: unknown;
}

interface TaskResponse {
  id: number;
  title: string;
  done: boolean;
  [key: string]: unknown;
}

// ─── Given ───────────────────────────────────────────────────────────────

Given('the API base URL is configured', async function (this: CustomWorld) {
  const apiBase = getApiBaseURL();
  logger.info(`API base URL configured: ${apiBase}`);
  this.apiContext = await createRequestContext({ baseURL: apiBase, ignoreHTTPSErrors: true });
});

Given(
  'I am authenticated via API as {string} with password {string}',
  async function (this: CustomWorld, username: string, password: string) {
    logger.info(`Authenticating via API as: ${username}`);
    const apiBase = getApiBaseURL();
    this.apiContext = await createRequestContext({ baseURL: apiBase, ignoreHTTPSErrors: true });

    const response = await post('/login', {
      data: { username, password, long_token: false },
    });
    await attachRequestResponseToAllure(response, '/login', { username });
    await assertStatusCode(response, 200, 'Login should return 200');

    const body = await parseJSON<LoginResponse>(response);
    this.authToken = body.token;
    logger.info('API authentication successful — token acquired');

    // Re-create context with Bearer token header
    await this.apiContext.dispose();
    this.apiContext = await createRequestContext({
      baseURL: apiBase,
      extraHTTPHeaders: { Authorization: `Bearer ${body.token}` },
      ignoreHTTPSErrors: true,
    });
  },
);

Given(
  'a project exists via API with title {string}',
  async function (this: CustomWorld, title: string) {
    logger.info(`Creating project via API: "${title}"`);
    const response = await put('/projects', { data: { title, description: 'API test project' } });
    await attachRequestResponseToAllure(response, 'PUT /projects', { title });
    await assertStatusCode(response, [200, 201], 'Project creation should return 200 or 201');
    const body = await parseJSON<ProjectResponse>(response);
    this.projectId = body.id;
    logger.info(`Project created with ID: ${body.id}`);
  },
);

Given(
  'a task exists via API with title {string}',
  async function (this: CustomWorld, title: string) {
    logger.info(`Creating task via API: "${title}"`);
    const projectId = this.projectId;
    if (!projectId) throw new Error('No projectId set — ensure project exists first');
    const response = await put(`/projects/${projectId}/tasks`, {
      data: { title, description: 'API test task' },
    });
    await attachRequestResponseToAllure(response, `PUT /projects/${projectId}/tasks`, { title });
    await assertStatusCode(response, [200, 201], 'Task creation should return 200 or 201');
    const body = await parseJSON<TaskResponse>(response);
    this.taskId = body.id;
    logger.info(`Task created with ID: ${body.id}`);
  },
);

// ─── When ─────────────────────────────────────────────────────────────────

When(
  'I send a POST login request with username {string} and password {string}',
  async function (this: CustomWorld, username: string, password: string) {
    logger.info(`Sending POST /login with username: ${username}`);
    const response = await post('/login', { data: { username, password, long_token: false } });
    await attachRequestResponseToAllure(response, '/login', { username });
    this.lastResponse = response;
  },
);

When(
  'I send a PUT request to {string} with title {string}',
  async function (this: CustomWorld, path: string, title: string) {
    logger.info(`Sending PUT ${path} — title: "${title}"`);
    const response = await put(path, { data: { title } });
    await attachRequestResponseToAllure(response, `PUT ${path}`, { title });
    this.lastResponse = response;

    if (response.ok()) {
      const body = await parseJSON<ProjectResponse>(response);
      if (body.id) this.projectId = body.id;
    }
  },
);

When(
  'I send a GET request to {string}',
  async function (this: CustomWorld, path: string) {
    logger.info(`Sending GET ${path}`);
    const response = await get(path);
    await attachRequestResponseToAllure(response, `GET ${path}`);
    this.lastResponse = response;
  },
);

When(
  'I send a POST request to update the project title to {string}',
  async function (this: CustomWorld, newTitle: string) {
    const projectId = this.projectId;
    if (!projectId) throw new Error('No projectId available for update');
    logger.info(`Sending POST /projects/${projectId} — new title: "${newTitle}"`);
    const response = await post(`/projects/${projectId}`, { data: { title: newTitle } });
    await attachRequestResponseToAllure(response, `POST /projects/${projectId}`, {
      title: newTitle,
    });
    this.lastResponse = response;
  },
);

When('I send a DELETE request to remove the project', async function (this: CustomWorld) {
  const projectId = this.projectId;
  if (!projectId) throw new Error('No projectId available for deletion');
  logger.info(`Sending DELETE /projects/${projectId}`);
  const response = await deleteRequest(`/projects/${projectId}`);
  await attachRequestResponseToAllure(response, `DELETE /projects/${projectId}`);
  this.lastResponse = response;
});

When(
  'I create a task via API with title {string}',
  async function (this: CustomWorld, title: string) {
    const projectId = this.projectId;
    if (!projectId) throw new Error('No projectId set for task creation');
    logger.info(`Creating task via API: "${title}" in project ${projectId}`);
    const response = await put(`/projects/${projectId}/tasks`, {
      data: { title, description: 'Created via API step' },
    });
    await attachRequestResponseToAllure(response, `PUT /projects/${projectId}/tasks`, { title });
    this.lastResponse = response;
    if (response.ok()) {
      const body = await parseJSON<TaskResponse>(response);
      if (body.id) this.taskId = body.id;
    }
  },
);

When(
  'I send a GET request to retrieve tasks for the project',
  async function (this: CustomWorld) {
    const projectId = this.projectId;
    if (!projectId) throw new Error('No projectId set for task listing');
    const path = `/projects/${projectId}/tasks`;
    logger.info(`Sending GET ${path}`);
    const response = await get(path);
    await attachRequestResponseToAllure(response, `GET ${path}`);
    this.lastResponse = response;
  },
);

When('I send a DELETE request to remove the task', async function (this: CustomWorld) {
  const taskId = this.taskId;
  if (!taskId) throw new Error('No taskId available for deletion');
  logger.info(`Sending DELETE /tasks/${taskId}`);
  const response = await deleteRequest(`/tasks/${taskId}`);
  await attachRequestResponseToAllure(response, `DELETE /tasks/${taskId}`);
  this.lastResponse = response;
});

// ─── Then ─────────────────────────────────────────────────────────────────

Then(
  'the API response status code should be {int}',
  async function (this: CustomWorld, statusCode: number) {
    logger.info(`Asserting response status code: ${statusCode}`);
    if (!this.lastResponse) throw new Error('No API response stored in world');
    await assertStatusCode(this.lastResponse, statusCode);
  },
);

Then(
  'the response body should contain a {string} field',
  async function (this: CustomWorld, fieldName: string) {
    logger.info(`Asserting response body contains field: "${fieldName}"`);
    if (!this.lastResponse) throw new Error('No API response stored in world');
    const body = await parseJSON<Record<string, unknown>>(this.lastResponse);
    await assertTrue(
      fieldName in body,
      `Expected response body to contain field "${fieldName}"`,
    );
  },
);

Then('the token should not be empty', async function (this: CustomWorld) {
  logger.info('Asserting token is not empty');
  if (!this.lastResponse) throw new Error('No API response stored in world');
  const body = await parseJSON<LoginResponse>(this.lastResponse);
  await assertTrue(
    typeof body.token === 'string' && body.token.length > 0,
    'Expected token to be a non-empty string',
  );
});

Then('the response body should contain an error message', async function (this: CustomWorld) {
  logger.info('Asserting response body contains an error message');
  if (!this.lastResponse) throw new Error('No API response stored in world');
  const text = await this.lastResponse.text();
  await assertTrue(text.length > 0, 'Expected response body to contain an error message');
});

Then(
  'the response body should contain field {string} with value {string}',
  async function (this: CustomWorld, fieldName: string, expectedValue: string) {
    logger.info(`Asserting "${fieldName}" === "${expectedValue}"`);
    if (!this.lastResponse) throw new Error('No API response stored in world');
    const body = await parseJSON<Record<string, unknown>>(this.lastResponse);
    await assertTrue(
      body[fieldName] === expectedValue,
      `Expected body["${fieldName}"] to equal "${expectedValue}" but got "${String(body[fieldName])}"`,
    );
  },
);

Then(
  'the response body should contain a numeric {string} field',
  async function (this: CustomWorld, fieldName: string) {
    logger.info(`Asserting response body has numeric field: "${fieldName}"`);
    if (!this.lastResponse) throw new Error('No API response stored in world');
    const body = await parseJSON<Record<string, unknown>>(this.lastResponse);
    await assertTrue(
      typeof body[fieldName] === 'number',
      `Expected "${fieldName}" to be a number but got ${typeof body[fieldName]}`,
    );
  },
);

Then('the response body should be a valid JSON array', async function (this: CustomWorld) {
  logger.info('Asserting response body is a JSON array');
  if (!this.lastResponse) throw new Error('No API response stored in world');
  const body = await parseJSON<unknown>(this.lastResponse);
  await assertTrue(Array.isArray(body), 'Expected response body to be a JSON array');
});
