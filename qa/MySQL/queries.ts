/**
 * Vikunja database query definitions.
 * These queries target the Vikunja MariaDB schema (vikunja database).
 *
 * Table reference (Vikunja schema):
 *   users         — id, name, email, password, created, updated, is_active
 *   projects      — id, title, description, owner_id, created, updated, is_archived
 *   tasks         — id, title, description, done, project_id, created_by_id, created, updated
 *   task_assignees — task_id, user_id
 *   teams         — id, name, description, created_by_id
 *   team_members  — team_id, user_id, admin
 *
 * Usage example:
 *   import { executeQuery } from './db-utils';
 *   import { queries } from './queries';
 *   const users = await executeQuery<UserRow>(queries.getUserByEmail, ['test@example.com']);
 */

export const queries = {
  // ── User queries ────────────────────────────────────────────────────────

  /** Get user by email */
  getUserByEmail: 'SELECT id, name, email, created, updated, is_active FROM users WHERE email = ?',

  /** Get user by username */
  getUserByUsername: 'SELECT id, name, email, created, updated, is_active FROM users WHERE name = ?',

  /** Get all users (id, name, email only — excludes password hash) */
  getAllUsers: 'SELECT id, name, email, created, updated, is_active FROM users ORDER BY id',

  /** Get user count */
  getUserCount: 'SELECT COUNT(*) AS cnt FROM users',

  // ── Project queries ─────────────────────────────────────────────────────

  /** Get projects by owner ID */
  getProjectsByOwner: `
    SELECT id, title, description, owner_id, created, updated, is_archived
    FROM projects
    WHERE owner_id = ?
    ORDER BY created DESC
  `,

  /** Get a specific project by title and owner */
  getProjectByTitleAndOwner: `
    SELECT id, title, description, owner_id, created, updated
    FROM projects
    WHERE title = ? AND owner_id = ?
  `,

  /** Get a project by ID */
  getProjectById: `
    SELECT id, title, description, owner_id, created, updated, is_archived
    FROM projects
    WHERE id = ?
  `,

  /** Delete project by title and owner (cleanup after tests) */
  deleteProjectByTitleAndOwner: 'DELETE FROM projects WHERE title = ? AND owner_id = ?',

  /** Delete project by ID */
  deleteProjectById: 'DELETE FROM projects WHERE id = ?',

  /** Count active (non-archived) projects for a user */
  countActiveProjectsByOwner: `
    SELECT COUNT(*) AS cnt FROM projects
    WHERE owner_id = ? AND is_archived = 0
  `,

  // ── Task queries ─────────────────────────────────────────────────────────

  /** Get all tasks for a project */
  getTasksByProjectId: `
    SELECT id, title, description, done, project_id, created_by_id, created, updated
    FROM tasks
    WHERE project_id = ?
    ORDER BY created DESC
  `,

  /** Get a task by title (within a project) */
  getTaskByTitleInProject: `
    SELECT id, title, description, done, project_id, created, updated
    FROM tasks
    WHERE title = ? AND project_id = ?
  `,

  /** Get a task by ID */
  getTaskById: `
    SELECT id, title, description, done, project_id, created, updated
    FROM tasks
    WHERE id = ?
  `,

  /** Get all done tasks in a project */
  getDoneTasksByProjectId: `
    SELECT id, title, done FROM tasks
    WHERE project_id = ? AND done = 1
  `,

  /** Delete a task by ID */
  deleteTaskById: 'DELETE FROM tasks WHERE id = ?',

  /** Delete all tasks in a project */
  deleteAllTasksByProjectId: 'DELETE FROM tasks WHERE project_id = ?',

  /** Count tasks in a project */
  countTasksByProjectId: 'SELECT COUNT(*) AS cnt FROM tasks WHERE project_id = ?',

  // ── Team queries ──────────────────────────────────────────────────────────

  /** Get all teams created by a user */
  getTeamsByCreator: `
    SELECT id, name, description, created_by_id, created, updated
    FROM teams
    WHERE created_by_id = ?
  `,

  /** Get team members */
  getTeamMembers: `
    SELECT u.id, u.name, u.email, tm.admin
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = ?
  `,

  /** Delete team by ID */
  deleteTeamById: 'DELETE FROM teams WHERE id = ?',
};

// ── Row type interfaces ─────────────────────────────────────────────────────

import type { RowDataPacket } from 'mysql2';

export interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  created: Date;
  updated: Date;
  is_active: number;
}

export interface ProjectRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  owner_id: number;
  created: Date;
  updated: Date;
  is_archived: number;
}

export interface TaskRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  done: number;
  project_id: number;
  created_by_id: number;
  created: Date;
  updated: Date;
}

export interface TeamRow extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  created_by_id: number;
  created: Date;
  updated: Date;
}
