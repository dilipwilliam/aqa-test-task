/**
 * Database fixtures — seed and clean up test data directly via MySQL.
 * Useful for test preconditions that are faster to set via DB than via UI/API.
 *
 * NOTE: Requires the MariaDB port (3306) to be exposed from Docker.
 */
import {
  connectToDatabase,
  closeConnection,
  executeQuery,
  executeUpdate,
  rowExists,
  defaultDBConfig,
} from './db-utils';
import { queries, type UserRow, type ProjectRow, type TaskRow } from './queries';
import { getLogger } from '../src/utils/logger';

const logger = getLogger();

// ── Connection lifecycle helpers ──────────────────────────────────────────

export async function openDBConnection(): Promise<void> {
  await connectToDatabase(defaultDBConfig);
}

export async function closeDBConnection(): Promise<void> {
  await closeConnection();
}

// ── User fixtures ─────────────────────────────────────────────────────────

/**
 * Check whether a user with the given email exists in the DB.
 */
export async function userExistsByEmail(email: string): Promise<boolean> {
  return rowExists('users', 'email = ?', [email]);
}

/**
 * Check whether a user with the given username exists in the DB.
 */
export async function userExistsByUsername(username: string): Promise<boolean> {
  return rowExists('users', 'name = ?', [username]);
}

/**
 * Fetch user record by email.
 */
export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  const rows = await executeQuery<UserRow>(queries.getUserByEmail, [email]);
  return rows[0];
}

/**
 * Fetch user record by username.
 */
export async function getUserByUsername(username: string): Promise<UserRow | undefined> {
  const rows = await executeQuery<UserRow>(queries.getUserByUsername, [username]);
  return rows[0];
}

// ── Project fixtures ─────────────────────────────────────────────────────

/**
 * Check whether a project with the given title exists for the owner.
 */
export async function projectExistsByTitle(title: string, ownerId: number): Promise<boolean> {
  return rowExists('projects', 'title = ? AND owner_id = ?', [title, ownerId]);
}

/**
 * Fetch project by title and owner.
 */
export async function getProjectByTitle(
  title: string,
  ownerId: number,
): Promise<ProjectRow | undefined> {
  const rows = await executeQuery<ProjectRow>(queries.getProjectByTitleAndOwner, [title, ownerId]);
  return rows[0];
}

/**
 * Delete all projects owned by a user with the given title prefix (test cleanup).
 */
export async function cleanupProjectsByTitlePrefix(
  prefix: string,
  ownerId: number,
): Promise<number> {
  const sql = 'DELETE FROM projects WHERE title LIKE ? AND owner_id = ?';
  const result = await executeUpdate(sql, [`${prefix}%`, ownerId]);
  logger.info(`Cleaned up ${result.affectedRows} projects with prefix "${prefix}"`);
  return result.affectedRows;
}

// ── Task fixtures ─────────────────────────────────────────────────────────

/**
 * Check whether a task with the given title exists in a project.
 */
export async function taskExistsByTitle(title: string, projectId: number): Promise<boolean> {
  return rowExists('tasks', 'title = ? AND project_id = ?', [title, projectId]);
}

/**
 * Fetch task by title within a project.
 */
export async function getTaskByTitle(
  title: string,
  projectId: number,
): Promise<TaskRow | undefined> {
  const rows = await executeQuery<TaskRow>(queries.getTaskByTitleInProject, [title, projectId]);
  return rows[0];
}

/**
 * Delete all tasks in a project (test cleanup).
 */
export async function cleanupTasksByProjectId(projectId: number): Promise<number> {
  const result = await executeUpdate(queries.deleteAllTasksByProjectId, [projectId]);
  logger.info(`Cleaned up ${result.affectedRows} tasks in project ${projectId}`);
  return result.affectedRows;
}

/**
 * Get the count of tasks in a project directly from the DB.
 */
export async function getTaskCount(projectId: number): Promise<number> {
  const rows = await executeQuery<{ cnt: number } & import('mysql2').RowDataPacket>(
    queries.countTasksByProjectId,
    [projectId],
  );
  return rows[0]?.cnt ?? 0;
}

// ── Sample query demonstrating DB verification in a test ─────────────────

/**
 * Demonstrate a combined API + DB assertion pattern:
 * After creating a project via API, verify it exists in the DB.
 *
 * Usage:
 *   await openDBConnection();
 *   const verified = await verifyProjectInDB('My Project', userId);
 *   expect(verified).toBe(true);
 *   await closeDBConnection();
 */
export async function verifyProjectInDB(title: string, ownerId: number): Promise<boolean> {
  const exists = await projectExistsByTitle(title, ownerId);
  logger.info(`DB verification — project "${title}" exists: ${String(exists)}`);
  return exists;
}
