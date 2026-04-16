/**
 * Environment utilities: load config by QA, DEV, STAGE, PROD.
 * Dynamically switches base URLs, credentials, and API endpoints.
 */
import type { EnvConfig } from './types';
import { getLogger } from './logger';
import { qaEnvConfig } from '../env/qa.env';
import { devEnvConfig } from '../env/dev.env';
import { stageEnvConfig } from '../env/stage.env';

const logger = getLogger();

export type EnvName = 'QA' | 'DEV' | 'STAGE' | 'PROD';

let currentEnv: EnvName = (process.env.ENV as EnvName) || 'QA';

export function setEnvironment(env: EnvName): void {
  currentEnv = env;
  process.env.ENV = env;
  logger.info(`Environment set to: ${env}`);
}

export function getEnvironment(): EnvName {
  return currentEnv;
}

export function getEnvConfig(): EnvConfig {
  const env = getEnvironment();
  switch (env) {
    case 'DEV':
      return { ...devEnvConfig, ...overrideFromProcess() };
    case 'STAGE':
      return { ...stageEnvConfig, ...overrideFromProcess() };
    case 'PROD':
      return {
        baseURL: process.env.BASE_URL || 'https://prod.vikunja.example.com',
        apiBaseURL: process.env.API_BASE_URL || 'https://prod.vikunja.example.com/api/v1',
        username: process.env.TEST_USERNAME || '',
        password: process.env.PASSWORD || '',
        envName: 'PROD',
        ...overrideFromProcess(),
      };
    case 'QA':
    default:
      return { ...qaEnvConfig, ...overrideFromProcess() };
  }
}

function overrideFromProcess(): Partial<EnvConfig> {
  const o: Partial<EnvConfig> = {};
  if (process.env.BASE_URL) o.baseURL = process.env.BASE_URL;
  if (process.env.API_BASE_URL) o.apiBaseURL = process.env.API_BASE_URL;
  if (process.env.TEST_USERNAME) o.username = process.env.TEST_USERNAME;
  if (process.env.PASSWORD) o.password = process.env.PASSWORD;
  return o;
}

export function getBaseURL(): string {
  return process.env.BASE_URL || getEnvConfig().baseURL;
}

export function getApiBaseURL(): string {
  return process.env.API_BASE_URL || getEnvConfig().apiBaseURL;
}

export function getCredentials(): { username: string; password: string } {
  const config = getEnvConfig();
  return {
    username: process.env.TEST_USERNAME || config.username,
    password: process.env.PASSWORD || config.password,
  };
}
