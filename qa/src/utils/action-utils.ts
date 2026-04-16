/**
 * Action utilities: click, type, select, hover, upload, drag, alert, iframe, etc.
 */
import type { Locator } from '@playwright/test';
import { getPage } from './page-utils';
import { getLocator, getVisibleLocator } from './locator-utils';
import { getFrameLocator } from './locator-utils';
import { waitForElementToBeStable, waitForElement as waitForElementState } from './element-utils';
import { resolveUploadPath } from './asset-utils';
import type {
  ActionOptions,
  ClickOptions,
  DoubleClickOptions,
  DragOptions,
  FillOptions,
  HoverOptions,
  PressSequentiallyOptions,
  SelectOptions,
  TimeoutOption,
  UploadOptions,
  UploadValues,
} from './types';
import { SMALL_TIMEOUT, STANDARD_TIMEOUT } from './constants';
import { getDefaultLoadState } from './constants';

async function getLocatorWithStableAndVisible(
  input: string | Locator,
  options?: ActionOptions,
): Promise<Locator> {
  const locator = getVisibleLocator(input, options);
  if (options?.stable) await waitForElementToBeStable(input, options);
  return locator;
}

export async function click(input: string | Locator, options?: ClickOptions): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.click(options);
}

export async function doubleClick(
  input: string | Locator,
  options?: DoubleClickOptions,
): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.dblclick(options);
}

export async function rightClick(input: string | Locator, options?: ClickOptions): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.click({ ...options, button: 'right' });
}

export async function typeText(
  input: string | Locator,
  value: string,
  options?: PressSequentiallyOptions,
): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.pressSequentially(value, options);
}

export async function clearAndType(
  input: string | Locator,
  value: string,
  options?: FillOptions,
): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.clear(options);
  await locator.fill(value, options);
}

export async function fill(
  input: string | Locator,
  value: string,
  options?: FillOptions,
): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.fill(value, options);
}

export async function clear(input: string | Locator, options?: ActionOptions): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.clear(options);
}

export async function getText(input: string | Locator, options?: TimeoutOption): Promise<string> {
  const locator = getLocator(input);
  return locator.innerText(options);
}

export async function getAttribute(
  input: string | Locator,
  name: string,
  options?: TimeoutOption,
): Promise<string | null> {
  const locator = getLocator(input);
  return locator.getAttribute(name, options);
}

export async function selectDropdownByValue(
  input: string | Locator,
  value: string,
  options?: SelectOptions,
): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.selectOption({ value }, options);
}

export async function selectDropdownByLabel(
  input: string | Locator,
  label: string,
  options?: SelectOptions,
): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.selectOption({ label }, options);
}

export async function hover(input: string | Locator, options?: HoverOptions): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.hover(options);
}

export async function uploadFile(
  input: string | Locator,
  filePath: UploadValues,
  options?: UploadOptions,
): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  const resolved = typeof filePath === 'string' ? resolveUploadPath(filePath) : filePath;
  await locator.setInputFiles(resolved as string, options);
}

export async function waitForElement(
  input: string | Locator,
  state: 'attached' | 'detached' | 'visible' | 'hidden' = 'visible',
  options?: TimeoutOption,
): Promise<Locator> {
  return waitForElementState(input, state, options);
}

export async function waitForResponse(
  urlOrPredicate:
    | string
    | RegExp
    | ((response: import('@playwright/test').Response) => boolean | Promise<boolean>),
  options?: TimeoutOption,
): Promise<import('@playwright/test').Response> {
  const timeout = options?.timeout ?? STANDARD_TIMEOUT;
  return getPage().waitForResponse(urlOrPredicate, { timeout });
}

export async function waitForNavigation(
  options?: TimeoutOption & {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  },
): Promise<import('@playwright/test').Response | null> {
  const timeout = options?.timeout ?? STANDARD_TIMEOUT;
  return getPage().waitForNavigation({
    timeout,
    waitUntil: options?.waitUntil ?? getDefaultLoadState(),
  });
}

export async function scrollToElement(
  input: string | Locator,
  options?: TimeoutOption,
): Promise<void> {
  const locator = getLocator(input);
  await locator.scrollIntoViewIfNeeded(options);
}

export async function dragAndDrop(
  source: string | Locator,
  target: string | Locator,
  options?: DragOptions,
): Promise<void> {
  const dragLocator = await getLocatorWithStableAndVisible(source, options);
  const dropLocator = await getLocatorWithStableAndVisible(target, options);
  await dragLocator.dragTo(dropLocator, options);
}

export function handleIframe(frameSelector: string): ReturnType<typeof getFrameLocator> {
  return getFrameLocator(frameSelector);
}

export async function handleAlert(accept: boolean, promptText?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    getPage().once('dialog', async (dialog) => {
      const msg = dialog.message();
      if (accept) await dialog.accept(promptText);
      else await dialog.dismiss();
      resolve(msg);
    });
    setTimeout(() => reject(new Error('No dialog appeared within timeout')), SMALL_TIMEOUT);
  });
}

export async function pressKey(key: string, options?: PressSequentiallyOptions): Promise<void> {
  await getPage().keyboard.press(key, options);
}

export async function pressKeyOnElement(
  input: string | Locator,
  key: string,
  options?: PressSequentiallyOptions,
): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.press(key, options);
}

export async function retryAction<T>(
  action: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 500,
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await action();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (i < maxAttempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

export async function customWait(ms: number): Promise<void> {
  await getPage().waitForTimeout(ms);
}

/**
 * Check if a checkbox or radio button is checked.
 */
export async function isChecked(input: string | Locator, options?: TimeoutOption): Promise<boolean> {
  const locator = getLocator(input);
  return locator.isChecked(options);
}

/**
 * Check a checkbox or radio button if not already checked.
 */
export async function check(input: string | Locator, options?: ActionOptions): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.check(options);
}

/**
 * Uncheck a checkbox if checked.
 */
export async function uncheck(input: string | Locator, options?: ActionOptions): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.uncheck(options);
}

/**
 * Tap on a mobile element.
 */
export async function tap(input: string | Locator, options?: ActionOptions): Promise<void> {
  const locator = await getLocatorWithStableAndVisible(input, options);
  await locator.tap(options);
}

/**
 * Focus on an element.
 */
export async function focus(input: string | Locator, options?: TimeoutOption): Promise<void> {
  const locator = getLocator(input);
  await locator.focus(options);
}

/**
 * Get all text content from a list of elements.
 */
export async function getAllTexts(
  input: string | Locator,
  options?: TimeoutOption,
): Promise<string[]> {
  const locator = getLocator(input);
  return locator.allInnerTexts();
}

/**
 * Wait for a URL pattern to be matched.
 */
export async function waitForURL(
  url: string | RegExp,
  options?: TimeoutOption & { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' },
): Promise<void> {
  await getPage().waitForURL(url, options);
}
