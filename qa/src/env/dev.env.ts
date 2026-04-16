/**
 * DEV environment configuration.
 * Maps to a development instance of Vikunja.
 */
import type { EnvConfig } from '../utils/types';

export const devEnvConfig: EnvConfig = {
  baseURL: process.env.DEV_BASE_URL || 'http://localhost:8081',
  apiBaseURL: process.env.DEV_API_BASE_URL || 'http://localhost:8081/api/v1',
  username: process.env.DEV_USERNAME || 'devuser',
  password: process.env.DEV_PASSWORD || 'devPassword1!',
  envName: 'DEV',
};
