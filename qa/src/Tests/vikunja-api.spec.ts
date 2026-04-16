/**
 * Vikunja API Specification — Playwright Test (non-BDD) API test suite.
 * Demonstrates combined UI + API approach with Allure integration.
 * Covers: Auth, Projects CRUD, Tasks CRUD.
 */
import { test, expect, request } from '@playwright/test';
import { getApiBaseURL, getCredentials } from '../utils/env-utils';
import { getLogger } from '../utils/logger';
import { buildProjectPayload, buildTaskPayload, buildRegistrationPayload } from '../utils/test-data-utils';
import { assertStatusCode, assertResponseOk, assertResponseMatchesObject } from '../utils/assert-utils';
import { createRequestContext, attachRequestResponseToAllure, parseJSON } from '../utils/api-utils';

const logger = getLogger();

// ─── Types ────────────────────────────────────────────────────────────────

interface AuthResponse {
  token: string;
}

interface ProjectBody {
  id: number;
  title: string;
  description?: string;
  [key: string]: unknown;
}

interface TaskBody {
  id: number;
  title: string;
  done: boolean;
  project_id?: number;
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

async function loginAndGetToken(
  apiBase: string,
  username: string,
  password: string,
): Promise<{ token: string; ctx: Awaited<ReturnType<typeof request.newContext>> }> {
  const ctx = await request.newContext({ baseURL: apiBase, ignoreHTTPSErrors: true });
  const res = await ctx.post('/login', { data: { username, password, long_token: false } });
  expect(res.status(), `Login should return 200 but got ${res.status()}`).toBe(200);
  const body = (await res.json()) as AuthResponse;
  expect(body.token, 'Login response should include a token').toBeTruthy();
  await ctx.dispose();
  return { token: body.token, ctx };
}

async function authedContext(apiBase: string, token: string) {
  return request.newContext({
    baseURL: apiBase,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    ignoreHTTPSErrors: true,
  });
}

// ─── Test Suite ───────────────────────────────────────────────────────────

test.describe('Vikunja REST API', () => {
  let apiBase: string;
  let credentials: { username: string; password: string };
  let authToken: string;

  test.beforeAll(async () => {
    apiBase = getApiBaseURL();
    credentials = getCredentials();
    logger.info(`API spec suite — base URL: ${apiBase}`);
  });

  // ── Authentication ────────────────────────────────────────────────────

  test.describe('Authentication', () => {
    test('POST /login — valid credentials return 200 with token', async () => {
      const { token } = await loginAndGetToken(apiBase, credentials.username, credentials.password);
      authToken = token;
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(10);
    });

    test('POST /login — invalid credentials return 401', async () => {
      const ctx = await request.newContext({ baseURL: apiBase, ignoreHTTPSErrors: true });
      const res = await ctx.post('/login', {
        data: { username: 'no_such_user', password: 'bad_password' },
      });
      expect([401, 400]).toContain(res.status());
      await ctx.dispose();
    });

    test('GET /user — authenticated request returns current user', async () => {
      const { token } = await loginAndGetToken(apiBase, credentials.username, credentials.password);
      const ctx = await authedContext(apiBase, token);
      const res = await ctx.get('/user');
      await attachRequestResponseToAllure(res, 'GET /user');
      expect(res.ok()).toBe(true);
      const body = (await res.json()) as { id: number; name: string };
      expect(typeof body.id).toBe('number');
      await ctx.dispose();
    });
  });

  // ── Projects CRUD ─────────────────────────────────────────────────────

  test.describe('Projects CRUD', () => {
    let projectId: number;
    let projectTitle: string;
    let ctx: Awaited<ReturnType<typeof request.newContext>>;

    test.beforeAll(async () => {
      const { token } = await loginAndGetToken(
        apiBase,
        credentials.username,
        credentials.password,
      );
      authToken = token;
      ctx = await authedContext(apiBase, token);
    });

    test.afterAll(async () => {
      if (ctx) await ctx.dispose();
    });

    test('PUT /projects — create a new project (201)', async () => {
      const payload = buildProjectPayload();
      projectTitle = payload.title;
      const res = await ctx.put('/projects', { data: payload });
      await attachRequestResponseToAllure(res, 'PUT /projects', payload);

      expect([200, 201]).toContain(res.status());
      const body = (await res.json()) as ProjectBody;
      expect(body.id).toBeDefined();
      expect(typeof body.id).toBe('number');
      expect(body.title).toBe(projectTitle);
      projectId = body.id;
      logger.info(`Created project ID: ${projectId}`);
    });

    test('GET /projects — returns array including new project', async () => {
      const res = await ctx.get('/projects');
      await attachRequestResponseToAllure(res, 'GET /projects');

      expect(res.ok()).toBe(true);
      const body = (await res.json()) as ProjectBody[];
      expect(Array.isArray(body)).toBe(true);
      const found = body.find((p) => p.id === projectId);
      expect(found, `Project ID ${projectId} should appear in GET /projects`).toBeDefined();
    });

    test('GET /projects/:id — returns specific project', async () => {
      const res = await ctx.get(`/projects/${projectId}`);
      await attachRequestResponseToAllure(res, `GET /projects/${projectId}`);

      expect(res.ok()).toBe(true);
      const body = (await res.json()) as ProjectBody;
      expect(body.id).toBe(projectId);
      expect(body.title).toBe(projectTitle);
    });

    test('POST /projects/:id — update project title', async () => {
      const newTitle = `${projectTitle}_updated`;
      const res = await ctx.post(`/projects/${projectId}`, {
        data: { title: newTitle },
      });
      await attachRequestResponseToAllure(res, `POST /projects/${projectId}`, {
        title: newTitle,
      });

      expect(res.ok()).toBe(true);
      const body = (await res.json()) as ProjectBody;
      expect(body.title).toBe(newTitle);
      projectTitle = newTitle;
    });

    test('DELETE /projects/:id — delete project (200)', async () => {
      const res = await ctx.delete(`/projects/${projectId}`);
      await attachRequestResponseToAllure(res, `DELETE /projects/${projectId}`);
      expect(res.ok()).toBe(true);
    });
  });

  // ── Tasks CRUD ────────────────────────────────────────────────────────

  test.describe('Tasks CRUD', () => {
    let projectId: number;
    let taskId: number;
    let ctx: Awaited<ReturnType<typeof request.newContext>>;

    test.beforeAll(async () => {
      const { token } = await loginAndGetToken(
        apiBase,
        credentials.username,
        credentials.password,
      );
      ctx = await authedContext(apiBase, token);

      // Create a project to hold the tasks
      const payload = buildProjectPayload({ title: `TaskSpec_${Date.now()}` });
      const res = await ctx.put('/projects', { data: payload });
      const body = (await res.json()) as ProjectBody;
      projectId = body.id;
      logger.info(`Task spec — using project ID: ${projectId}`);
    });

    test.afterAll(async () => {
      if (ctx && projectId) {
        // Clean up the project (cascades to tasks)
        await ctx.delete(`/projects/${projectId}`);
      }
      if (ctx) await ctx.dispose();
    });

    test('PUT /projects/:id/tasks — create a task (201)', async () => {
      const payload = buildTaskPayload();
      const res = await ctx.put(`/projects/${projectId}/tasks`, { data: payload });
      await attachRequestResponseToAllure(res, `PUT /projects/${projectId}/tasks`, payload);

      expect([200, 201]).toContain(res.status());
      const body = (await res.json()) as TaskBody;
      expect(body.id).toBeDefined();
      expect(body.title).toBe(payload.title);
      expect(body.done).toBe(false);
      taskId = body.id;
      logger.info(`Created task ID: ${taskId}`);
    });

    test('GET /projects/:id/tasks — returns array containing new task', async () => {
      const res = await ctx.get(`/projects/${projectId}/tasks`);
      await attachRequestResponseToAllure(res, `GET /projects/${projectId}/tasks`);

      expect(res.ok()).toBe(true);
      const body = (await res.json()) as TaskBody[];
      expect(Array.isArray(body)).toBe(true);
      const found = body.find((t) => t.id === taskId);
      expect(found, `Task ID ${taskId} should appear in task list`).toBeDefined();
    });

    test('GET /tasks/:id — returns specific task', async () => {
      const res = await ctx.get(`/tasks/${taskId}`);
      await attachRequestResponseToAllure(res, `GET /tasks/${taskId}`);

      expect(res.ok()).toBe(true);
      const body = (await res.json()) as TaskBody;
      expect(body.id).toBe(taskId);
    });

    test('POST /tasks/:id — update task (mark as done)', async () => {
      const res = await ctx.post(`/tasks/${taskId}`, { data: { done: true } });
      await attachRequestResponseToAllure(res, `POST /tasks/${taskId}`, { done: true });

      expect(res.ok()).toBe(true);
      const body = (await res.json()) as TaskBody;
      expect(body.done).toBe(true);
    });

    test('DELETE /tasks/:id — delete task (200)', async () => {
      const res = await ctx.delete(`/tasks/${taskId}`);
      await attachRequestResponseToAllure(res, `DELETE /tasks/${taskId}`);
      expect(res.ok()).toBe(true);
    });
  });
});
