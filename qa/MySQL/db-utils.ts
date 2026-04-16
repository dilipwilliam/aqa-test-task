/**
 * MySQL / MariaDB database utilities.
 *
 * The Vikunja docker-compose exposes MariaDB on the internal Docker network.
 * To use this from your host machine, expose port 3306 by adding to docker-compose.yml:
 *   ports:
 *     - "3306:3306"
 *
 * Or override the host via environment variable:
 *   DB_HOST=127.0.0.1 DB_PORT=3306 npm run test:bdd
 */
import mysql from 'mysql2/promise';
import type { Connection, RowDataPacket, ResultSetHeader, OkPacket } from 'mysql2/promise';
import { getLogger } from '../src/utils/logger';

const logger = getLogger();

export interface DBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/** Default Vikunja MariaDB config — matches docker-compose.yml */
export const defaultDBConfig: DBConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'vikunja',
  password: process.env.DB_PASSWORD || 'vicunja_password',
  database: process.env.DB_NAME || 'vikunja',
};

let connection: Connection | undefined;

/**
 * Open a MySQL connection.
 */
export async function connectToDatabase(config: DBConfig = defaultDBConfig): Promise<Connection> {
  connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });
  logger.info(`Connected to MySQL: ${config.host}:${config.port}/${config.database}`);
  return connection;
}

/**
 * Get the current connection. Throws if not connected.
 */
export function getConnection(): Connection {
  if (!connection) {
    throw new Error('Database connection not established. Call connectToDatabase() first.');
  }
  return connection;
}

/**
 * Execute a SELECT query and return typed rows.
 */
export async function executeQuery<T extends RowDataPacket>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  logger.debug(`SQL: ${sql} | Params: ${JSON.stringify(params)}`);
  const [rows] = await getConnection().execute<T[]>(sql, params);
  return rows;
}

/**
 * Execute an INSERT / UPDATE / DELETE and return the result header.
 */
export async function executeUpdate(
  sql: string,
  params?: unknown[],
): Promise<ResultSetHeader> {
  logger.debug(`SQL (update): ${sql} | Params: ${JSON.stringify(params)}`);
  const [result] = await getConnection().execute<ResultSetHeader>(sql, params);
  return result;
}

/**
 * Close the MySQL connection.
 */
export async function closeConnection(): Promise<void> {
  if (connection) {
    await connection.end();
    connection = undefined;
    logger.info('Database connection closed');
  }
}

/**
 * Utility: check that at least one row matches the given condition.
 * Returns true if the count is > 0.
 */
export async function rowExists(table: string, whereClause: string, params: unknown[]): Promise<boolean> {
  const sql = `SELECT COUNT(*) AS cnt FROM ${table} WHERE ${whereClause}`;
  const rows = await executeQuery<RowDataPacket & { cnt: number }>(sql, params);
  return (rows[0]?.cnt ?? 0) > 0;
}
