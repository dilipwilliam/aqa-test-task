/**
 * Test data utilities: random strings, numbers, test data builders.
 */
import { getLogger } from './logger';

const logger = getLogger();

export function getRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomEmail(prefix = 'test'): string {
  return `${prefix}+${getRandomString(8)}@example.com`;
}

export function getUniqueId(): string {
  return `${Date.now()}_${getRandomString(6)}`;
}

export function loadTestData<T>(key: string, fallback: T): T {
  const env = process.env[`TEST_DATA_${key}`];
  if (env) {
    try {
      return JSON.parse(env) as T;
    } catch {
      logger.warn(`Could not parse TEST_DATA_${key}, using fallback`);
    }
  }
  return fallback;
}

/**
 * Generate a unique project name with timestamp suffix.
 */
export function generateProjectName(prefix = 'Project'): string {
  return `${prefix}_${Date.now()}`;
}

/**
 * Generate a unique task title with timestamp suffix.
 */
export function generateTaskTitle(prefix = 'Task'): string {
  return `${prefix}_${Date.now()}`;
}

/**
 * Generate a unique username for registration.
 */
export function generateUsername(prefix = 'user'): string {
  return `${prefix}${getRandomString(6).toLowerCase()}`;
}

/**
 * Generate a valid password meeting common requirements.
 */
export function generatePassword(): string {
  return `Test@${getRandomInt(1000, 9999)}${getRandomString(4)}`;
}

/**
 * Build a Vikunja user registration payload.
 */
export function buildRegistrationPayload(overrides?: {
  username?: string;
  email?: string;
  password?: string;
}): { username: string; email: string; password: string } {
  const username = overrides?.username ?? generateUsername();
  return {
    username,
    email: overrides?.email ?? `${username}@test.local`,
    password: overrides?.password ?? generatePassword(),
  };
}

/**
 * Build a Vikunja project payload.
 */
export function buildProjectPayload(overrides?: {
  title?: string;
  description?: string;
  color?: string;
}): { title: string; description: string; color: string } {
  return {
    title: overrides?.title ?? generateProjectName(),
    description: overrides?.description ?? 'Automated test project',
    color: overrides?.color ?? '#4a90e2',
  };
}

/**
 * Build a Vikunja task payload.
 */
export function buildTaskPayload(overrides?: {
  title?: string;
  description?: string;
  done?: boolean;
}): { title: string; description: string; done: boolean } {
  return {
    title: overrides?.title ?? generateTaskTitle(),
    description: overrides?.description ?? 'Automated test task',
    done: overrides?.done ?? false,
  };
}
