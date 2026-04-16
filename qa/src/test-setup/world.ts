/**
 * Custom Cucumber World — provides Playwright Browser, Context, Page,
 * and APIRequestContext on each scenario instance.
 */
import {
  World,
  IWorldOptions,
  setWorldConstructor,
  ITestCaseHookParameter,
} from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page, APIRequestContext } from '@playwright/test';

export interface WorldParameters {
  env?: string;
  headless?: boolean;
}

export class CustomWorld extends World<WorldParameters> {
  /** Playwright browser instance (set in @web/@ui Before hook) */
  browser!: Browser;

  /** Playwright browser context (set in @web/@ui Before hook) */
  context!: BrowserContext;

  /** Playwright page (set in @web/@ui Before hook) */
  page!: Page;

  /** Playwright API request context (set in @api Before hook) */
  apiContext!: APIRequestContext;

  /** Auth token obtained from login API */
  authToken?: string;

  /** Stored IDs for shared state between steps */
  projectId?: number;
  taskId?: number;
  userId?: number;
  lastResponse?: import('@playwright/test').APIResponse;

  /** Generic step-to-step data bag */
  scenarioData: Record<string, unknown> = {};

  constructor(options: IWorldOptions<WorldParameters>) {
    super(options);
    // Override environment from world parameters if provided
    if (options.parameters?.env) {
      process.env.ENV = options.parameters.env.toUpperCase();
    }
  }

  /**
   * Store a value for cross-step sharing.
   */
  set<T>(key: string, value: T): void {
    this.scenarioData[key] = value;
  }

  /**
   * Retrieve a stored value.
   */
  get<T>(key: string): T {
    return this.scenarioData[key] as T;
  }

  /**
   * Log the scenario name for debugging.
   */
  logScenario(scenario: ITestCaseHookParameter): void {
    const name = scenario.pickle.name;
    const tags = scenario.pickle.tags.map((t) => t.name).join(', ');
    this.attach(`Scenario: ${name}\nTags: ${tags}`);
  }
}

setWorldConstructor(CustomWorld);
