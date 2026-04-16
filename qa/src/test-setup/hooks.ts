/**
 * Cucumber hooks — lifecycle management for browser, API context, screenshots, and logging.
 *
 * Hook execution order:
 *   BeforeAll → Before (per scenario) → Steps → After (per scenario) → AfterAll
 */
import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setDefaultTimeout,
  ITestCaseHookParameter,
} from '@cucumber/cucumber';
import { CustomWorld } from './world';
import { launchBrowser, closeBrowser } from '../utils/browser-utils';
import { createRequestContext, disposeRequestContext } from '../utils/api-utils';
import { setPage, setAttachFn, getAttachFn } from '../utils/page-utils';
import { getLogger } from '../utils/logger';
import { getApiBaseURL, setEnvironment, EnvName } from '../utils/env-utils';
import { CUCUMBER_STEP_TIMEOUT } from '../utils/constants';

const logger = getLogger();

/** Align Cucumber step timeout with the constant used by element-utils wait functions. */
setDefaultTimeout(CUCUMBER_STEP_TIMEOUT);

// allure-js-commons v2 does not export standalone attachment/label functions (those are v3 API).
// In v2, labels are sent as metadata via this.attach(), and screenshots via this.attach() directly.
const ALLURE_METADATA = 'application/vnd.allure.metadata+json';

function allureLabel(world: CustomWorld, name: string, value: string): void {
  world.attach(JSON.stringify({ labels: [{ name, value }] }), ALLURE_METADATA);
}

// ─── Suite-level hooks ────────────────────────────────────────────────────

BeforeAll(async function () {
  const env = (process.env.ENV ?? 'QA') as EnvName;
  setEnvironment(env);
  logger.info(`===== Test Suite Starting — ENV: ${env} =====`);
});

AfterAll(async function () {
  logger.info('===== Test Suite Complete =====');
});

// ─── Scenario-level hooks — WEB / UI ─────────────────────────────────────

Before({ tags: '@web or @ui' }, async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  logger.info(`[Before @web] Scenario: "${scenario.pickle.name}"`);
  const { browser, context, page } = await launchBrowser({
    browserType: 'chromium',
    headless: process.env.HEADLESS === 'false',
  });
  this.browser = browser;
  this.context = context;
  this.page = page;
  setPage(page);
  setAttachFn((data, contentType) => this.attach(data, contentType));

  // Allure metadata
  allureLabel(this, 'suite', 'Web UI Tests');
  allureLabel(this, 'feature', scenario.pickle.uri.split('/').pop() ?? 'unknown');
});

After({ tags: '@web or @ui' }, async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const status = scenario.result?.status ?? 'UNKNOWN';
  logger.info(`[After @web] Scenario: "${scenario.pickle.name}" — ${status}`);

  if (status === 'FAILED' && this.page) {
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      this.attach(screenshot, 'image/png');
      logger.error(`Failure screenshot captured for: "${scenario.pickle.name}"`);
    } catch (e) {
      logger.warn('Could not capture failure screenshot', e);
    }
  }

  setAttachFn(null);
  await closeBrowser();
});

// ─── Scenario-level hooks — API ───────────────────────────────────────────

Before({ tags: '@api' }, async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  logger.info(`[Before @api] Scenario: "${scenario.pickle.name}"`);
  this.apiContext = await createRequestContext({
    baseURL: getApiBaseURL(),
    ignoreHTTPSErrors: true,
  });

  allureLabel(this, 'suite', 'API Tests');
});

After({ tags: '@api' }, async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const status = scenario.result?.status ?? 'UNKNOWN';
  logger.info(`[After @api] Scenario: "${scenario.pickle.name}" — ${status}`);
  await disposeRequestContext();
});

// ─── Scenario-level hooks — Combined (no specific tag) ───────────────────

Before(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const tags = scenario.pickle.tags.map((t) => t.name);
  const isWeb = tags.some((t) => t === '@web' || t === '@ui');
  const isApi = tags.includes('@api');

  // Only run if NOT already handled by a more specific hook above
  if (!isWeb && !isApi) {
    logger.info(`[Before general] Scenario: "${scenario.pickle.name}"`);
    const { browser, context, page } = await launchBrowser({ browserType: 'chromium' });
    this.browser = browser;
    this.context = context;
    this.page = page;
    setPage(page);
    setAttachFn((data, contentType) => this.attach(data, contentType));

    this.apiContext = await createRequestContext({
      baseURL: getApiBaseURL(),
      ignoreHTTPSErrors: true,
    });
  }

  this.logScenario(scenario);
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const tags = scenario.pickle.tags.map((t) => t.name);
  const isWeb = tags.some((t) => t === '@web' || t === '@ui');
  const isApi = tags.includes('@api');

  if (!isWeb && !isApi) {
    const status = scenario.result?.status ?? 'UNKNOWN';

    if (status === 'FAILED' && this.page) {
      try {
        const screenshot = await this.page.screenshot({ fullPage: true });
        this.attach(screenshot, 'image/png');
      } catch (e) {
        logger.warn('Could not capture failure screenshot', e);
      }
    }

    setAttachFn(null);

    try {
      await closeBrowser();
    } catch (e) {
      logger.warn('Error closing browser in general After hook', e);
    }

    try {
      await disposeRequestContext();
    } catch (e) {
      logger.warn('Error disposing API context in general After hook', e);
    }
  }
});
