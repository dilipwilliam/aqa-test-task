/**
 * Browser launch/close and context utilities.
 * Supports Chromium, Firefox, WebKit with media permission handling.
 */
import type { Browser, BrowserContext, BrowserContextOptions, Page } from '@playwright/test';
import { chromium, firefox, webkit } from '@playwright/test';
import { setPage } from './page-utils';
import { getLogger } from './logger';

const logger = getLogger();

let browser: Browser;
let context: BrowserContext;

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export interface LaunchBrowserOptions {
  browserType?: BrowserType;
  headless?: boolean;
  slowMo?: number;
  viewport?: { width: number; height: number };
  ignoreHTTPSErrors?: boolean;
  contextOptions?: BrowserContextOptions;
  /**
   * Browser context permissions to grant (e.g. ['camera', 'microphone']).
   * When media permissions are included, Chrome fake-device launch args are automatically
   * injected so tests execute in both headed and headless/CI environments without real hardware.
   */
  permissions?: string[];
  /**
   * HTTP origins that Chrome should treat as secure (i.e. allow getUserMedia).
   * Required when the app under test is served over plain HTTP — Chrome blocks camera/mic
   * access on non-secure origins even with fake-device args enabled.
   * Maps to --unsafely-treat-insecure-origin-as-secure=<origin>.
   */
  insecureOrigins?: string[];
}

export async function launchBrowser(
  options: LaunchBrowserOptions = {},
): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  const {
    browserType = 'chromium',
    headless = process.env.HEADLESS !== 'false',
    slowMo = Number(process.env.SLOW_MO ?? 0),
    viewport = { width: 1920, height: 1080 },
    ignoreHTTPSErrors = true,
    contextOptions = {},
    permissions = [],
    insecureOrigins = [],
  } = options;

  // When media permissions are requested, inject Chrome fake-device args so that
  // getUserMedia (camera/mic) and getDisplayMedia (screen share) succeed in headless
  // and CI environments that have no physical devices or display server.
  const needsFakeMedia =
    browserType === 'chromium' &&
    permissions.some((p) => ['camera', 'microphone', 'display-capture'].includes(p));

  const chromiumBaseArgs = ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'];
  const chromiumMediaArgs = needsFakeMedia
    ? [
        '--use-fake-ui-for-media-stream', // auto-accepts permission prompts
        '--use-fake-device-for-media-stream', // provides a synthetic camera/mic stream
        '--auto-select-desktop-capture-source=Entire screen', // skips the screen-picker dialog
      ]
    : [];
  // getUserMedia is restricted to secure contexts (HTTPS/localhost) by Chrome.
  // For HTTP-hosted test environments, mark each origin as secure so that
  // camera/mic APIs are allowed even without TLS.
  const chromiumInsecureArgs =
    browserType === 'chromium' && insecureOrigins.length > 0
      ? [`--unsafely-treat-insecure-origin-as-secure=${insecureOrigins.join(',')}`]
      : [];

  const launchOptions = {
    headless,
    slowMo,
    args:
      browserType === 'chromium'
        ? [...chromiumBaseArgs, ...chromiumMediaArgs, ...chromiumInsecureArgs]
        : undefined,
  };

  if (browserType === 'firefox') {
    browser = await firefox.launch(launchOptions);
  } else if (browserType === 'webkit') {
    browser = await webkit.launch(launchOptions);
  } else {
    browser = await chromium.launch(launchOptions);
  }

  context = await browser.newContext({
    viewport,
    ignoreHTTPSErrors,
    ...(permissions.length > 0 ? { permissions } : {}),
    ...contextOptions,
  });

  const page = await context.newPage();
  setPage(page);
  logger.info(`Browser launched: ${browserType}, headless=${String(headless)}`);
  return { browser, context, page };
}

export async function closeBrowser(): Promise<void> {
  if (context) await context.close();
  if (browser) await browser.close();
  logger.info('Browser closed');
}

export function getBrowser(): Browser | undefined {
  return browser;
}

export function getBrowserContext(): BrowserContext | undefined {
  return context;
}
