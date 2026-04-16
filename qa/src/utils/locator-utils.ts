/**
 * Locator utilities: get locators by selector, role, text, frame, etc.
 */
import type { Frame, FrameLocator, Locator } from '@playwright/test';
import { selectors } from '@playwright/test';
import { getPage } from './page-utils';
import type {
  FrameOptions,
  GetByPlaceholderOptions,
  GetByRoleOptions,
  GetByRoleTypes,
  GetByTextOptions,
  LocatorOptions,
  LocatorWaitOptions,
} from './types';

const defaultVisibleOnly = { onlyVisible: true };

export function getLocator(input: string | Locator, options?: LocatorOptions): Locator {
  const locator = typeof input === 'string' ? getPage().locator(input, options) : input;
  return options?.onlyVisible ? locator.locator('visible=true') : locator;
}

export function getVisibleLocator(input: string | Locator, options?: LocatorOptions): Locator {
  return getLocator(input, { ...defaultVisibleOnly, ...options });
}

export function getLocatorByTestId(testId: string | RegExp, attributeName?: string): Locator {
  if (attributeName) selectors.setTestIdAttribute(attributeName);
  return getPage().getByTestId(testId);
}

export function getLocatorByText(text: string | RegExp, options?: GetByTextOptions): Locator {
  return getPage().getByText(text, options);
}

export function getLocatorByRole(role: GetByRoleTypes, options?: GetByRoleOptions): Locator {
  return getPage().getByRole(role, options);
}

export function getLocatorByLabel(text: string | RegExp, options?: GetByRoleOptions): Locator {
  return getPage().getByLabel(text, options);
}

export function getLocatorByPlaceholder(
  text: string | RegExp,
  options?: GetByPlaceholderOptions,
): Locator {
  return getPage().getByPlaceholder(text, options);
}

export async function getAllLocators(
  input: string | Locator,
  options?: LocatorOptions & LocatorWaitOptions,
): Promise<Locator[]> {
  const locator = typeof input === 'string' ? getPage().locator(input, options) : input;
  const timeout = options?.timeout ?? 30_000;
  await locator.first().waitFor({ state: 'attached', timeout });
  return locator.all();
}

export function getFrame(frameSelector: FrameOptions, options = { force: false }): Frame | null {
  const frame = getPage().frame(frameSelector);
  if (options.force) return frame;
  if (!frame) throw new Error(`Frame not found: ${JSON.stringify(frameSelector)}`);
  return frame;
}

export function getFrameLocator(frameInput: string | FrameLocator): FrameLocator {
  return typeof frameInput === 'string' ? getPage().frameLocator(frameInput) : frameInput;
}

export function getLocatorInFrame(
  frameInput: string | FrameLocator,
  input: string | Locator,
): Locator {
  return getFrameLocator(frameInput).locator(input as string);
}
