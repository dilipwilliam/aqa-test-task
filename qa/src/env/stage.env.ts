/**
 * STAGE environment configuration.
 * Maps to a staging instance of Vikunja.
 */
import type { EnvConfig } from '../utils/types';

export const stageEnvConfig: EnvConfig = {
  baseURL: process.env.STAGE_BASE_URL || 'http://staging.vikunja.example.com',
  apiBaseURL: process.env.STAGE_API_BASE_URL || 'http://staging.vikunja.example.com/api/v1',
  username: process.env.STAGE_USERNAME || 'stageuser',
  password: process.env.STAGE_PASSWORD || 'stagePassword1!',
  envName: 'STAGE',
};
