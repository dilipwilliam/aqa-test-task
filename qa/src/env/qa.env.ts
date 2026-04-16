/**
 * QA environment configuration.
 * Maps to: http://localhost:8080 (Vikunja Docker instance).
 */
import type { EnvConfig } from '../utils/types';

export const qaEnvConfig: EnvConfig = {
  baseURL: 'http://localhost:8080',
  apiBaseURL: 'http://localhost:8080/api/v1',
  username: process.env.QA_USERNAME || 'qauser',
  password: process.env.QA_PASSWORD || 'qaPassword1!',
  envName: 'QA',
};
