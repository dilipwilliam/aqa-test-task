/**
 * Setters and Getters — shared in-memory state store for cross-step data sharing.
 * Provides a typed key-value store that persists across step definitions within a test run.
 *
 * Usage:
 *   import { set, get, clear } from '../settersAndGetters';
 *
 *   set('authToken', 'eyJhb...');
 *   const token = get<string>('authToken');
 */

interface TestState {
  authToken?: string;
  userId?: number;
  projectId?: number;
  projectTitle?: string;
  taskId?: number;
  taskTitle?: string;
  lastResponseStatus?: number;
  lastResponseBody?: unknown;
  [key: string]: unknown;
}

const state: TestState = {};

/**
 * Store a value by key.
 */
export function set<T>(key: keyof TestState | string, value: T): void {
  (state as Record<string, unknown>)[key] = value;
}

/**
 * Retrieve a stored value by key.
 * Returns undefined if not set.
 */
export function get<T>(key: keyof TestState | string): T {
  return (state as Record<string, unknown>)[key] as T;
}

/**
 * Check whether a key has a stored value.
 */
export function has(key: keyof TestState | string): boolean {
  return key in state && (state as Record<string, unknown>)[key] !== undefined;
}

/**
 * Remove a specific key from state.
 */
export function remove(key: keyof TestState | string): void {
  delete (state as Record<string, unknown>)[key];
}

/**
 * Clear all stored state. Call in AfterAll or After hooks for isolation.
 */
export function clear(): void {
  const keys = Object.keys(state);
  for (const key of keys) {
    delete (state as Record<string, unknown>)[key];
  }
}

/**
 * Get the entire state snapshot (for debugging).
 */
export function getSnapshot(): Readonly<TestState> {
  return { ...state };
}

// ── Typed convenience accessors ─────────────────────────────────────────────

export function setAuthToken(token: string): void {
  set('authToken', token);
}

export function getAuthToken(): string | undefined {
  return get<string>('authToken');
}

export function setProjectId(id: number): void {
  set('projectId', id);
}

export function getProjectId(): number | undefined {
  return get<number>('projectId');
}

export function setTaskId(id: number): void {
  set('taskId', id);
}

export function getTaskId(): number | undefined {
  return get<number>('taskId');
}

export function setUserId(id: number): void {
  set('userId', id);
}

export function getUserId(): number | undefined {
  return get<number>('userId');
}
