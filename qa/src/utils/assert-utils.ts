/**
 * Assert utilities: every assertion captures screenshot, attaches to Allure, logs, and throws on failure.
 * CRITICAL: Every assertion method MUST wrap screenshot capture + Allure attachment.
 */
import assert from 'node:assert';
import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { hasPage, getAttachFn } from './page-utils';
import { getLocator } from './locator-utils';
import { takeScreenshot } from './asset-utils';
import { getLogger } from './logger';
import type { TimeoutOption } from './types';
import { STANDARD_TIMEOUT } from './constants';

const logger = getLogger();

async function captureAndAttachScreenshot(label: string): Promise<void> {
  if (!hasPage()) return;
  try {
    const buffer = await takeScreenshot(`assert_${label}_${Date.now()}`);
    getAttachFn()?.(buffer, 'image/png');
  } catch (e) {
    logger.warn('Screenshot capture failed', e);
  }
}

async function assertWithScreenshot<T>(assertionName: string, fn: () => Promise<T>): Promise<T> {
  try {
    const result = await fn();
    logger.info(`Assertion passed: ${assertionName}`);
    await captureAndAttachScreenshot(`PASS_${assertionName}`);
    return result;
  } catch (err) {
    await captureAndAttachScreenshot(`FAIL_${assertionName}`);
    logger.error(`Assertion failed: ${assertionName}`, err);
    throw err;
  }
}

export async function assertEquals<T>(actual: T, expected: T, message?: string): Promise<void> {
  await assertWithScreenshot('assertEquals', async () => {
    assert.deepStrictEqual(actual, expected, message);
  });
}

export async function assertNotEquals<T>(actual: T, expected: T, message?: string): Promise<void> {
  await assertWithScreenshot('assertNotEquals', async () => {
    assert.notDeepStrictEqual(actual, expected, message);
  });
}

export async function assertTrue(condition: boolean, message?: string): Promise<void> {
  await assertWithScreenshot('assertTrue', async () => {
    expect(condition, message ?? 'Expected condition to be true').toBe(true);
  });
}

export async function assertFalse(condition: boolean, message?: string): Promise<void> {
  await assertWithScreenshot('assertFalse', async () => {
    expect(condition, message ?? 'Expected condition to be false').toBe(false);
  });
}

export async function assertContains(
  haystack: string,
  needle: string,
  message?: string,
): Promise<void> {
  await assertWithScreenshot('assertContains', async () => {
    expect(haystack, message).toContain(needle);
  });
}

export async function assertElementVisible(
  input: string | Locator,
  options?: TimeoutOption,
): Promise<void> {
  const timeout = options?.timeout ?? STANDARD_TIMEOUT;
  await assertWithScreenshot('assertElementVisible', async () => {
    const locator = getLocator(input);
    await expect(locator).toBeVisible({ timeout });
  });
}

export async function assertElementHidden(
  input: string | Locator,
  options?: TimeoutOption,
): Promise<void> {
  const timeout = options?.timeout ?? STANDARD_TIMEOUT;
  await assertWithScreenshot('assertElementHidden', async () => {
    const locator = getLocator(input);
    await expect(locator).toBeHidden({ timeout });
  });
}

export async function assertElementCount(
  input: string | Locator,
  count: number,
  options?: TimeoutOption,
): Promise<void> {
  const timeout = options?.timeout ?? STANDARD_TIMEOUT;
  await assertWithScreenshot('assertElementCount', async () => {
    const locator = getLocator(input);
    await expect(locator).toHaveCount(count, { timeout });
  });
}

export async function assertStatusCode(
  response: { status: () => number },
  expected: number | number[],
  message?: string,
): Promise<void> {
  await assertWithScreenshot('assertStatusCode', async () => {
    const status = response.status();
    const allowed = Array.isArray(expected) ? expected : [expected];
    expect(allowed, message).toContain(status);
  });
}

export async function assertResponseBodyContains(
  response: { text: () => Promise<string> },
  expectedSubstring: string,
  message?: string,
): Promise<void> {
  await assertWithScreenshot('assertResponseBodyContains', async () => {
    const body = await response.text();
    expect(body, message).toContain(expectedSubstring);
  });
}

export async function assertGreaterThan(
  actual: number,
  expected: number,
  message?: string,
): Promise<void> {
  await assertWithScreenshot('assertGreaterThan', async () => {
    expect(actual, message).toBeGreaterThan(expected);
  });
}

export async function assertLessThan(
  actual: number,
  expected: number,
  message?: string,
): Promise<void> {
  await assertWithScreenshot('assertLessThan', async () => {
    expect(actual, message).toBeLessThan(expected);
  });
}

// ─── API-specific assertions ──────────────────────────────────────────────
// captureAndAttachScreenshot silently skips when no page is active (API context),
// so these are safe to call from pure API tests as well as hybrid Web+API tests.

export async function assertResponseOk(
  response: { ok: () => boolean; status: () => number },
  message?: string,
): Promise<void> {
  await assertWithScreenshot('assertResponseOk', async () => {
    expect(
      response.ok(),
      message ?? `Expected response to be OK (2xx) but got HTTP ${response.status()}`,
    ).toBeTruthy();
  });
}

export async function assertResponseNotOk(
  response: { ok: () => boolean; status: () => number },
  message?: string,
): Promise<void> {
  await assertWithScreenshot('assertResponseNotOk', async () => {
    expect(
      response.ok(),
      message ?? `Expected response to NOT be OK (non-2xx) but got HTTP ${response.status()}`,
    ).toBeFalsy();
  });
}

export async function assertResponseMatchesObject<T extends object>(
  response: { json: () => Promise<T> },
  expected: Partial<T>,
  message?: string,
): Promise<void> {
  await assertWithScreenshot('assertResponseMatchesObject', async () => {
    const body = (await response.json()) as Record<string, unknown>;
    const expectedEntries = Object.entries(expected as Record<string, unknown>);
    for (const [key, expectedVal] of expectedEntries) {
      assert.deepStrictEqual(
        body[key],
        expectedVal,
        message ?? `Response body key "${key}" does not match expected value`,
      );
    }
  });
}

export async function assertResponseEquals<T>(
  response: { json: () => Promise<T> },
  expected: T,
  message?: string,
): Promise<void> {
  await assertWithScreenshot('assertResponseEquals', async () => {
    const body = await response.json();
    assert.deepStrictEqual(
      body,
      expected,
      message ?? 'Response body does not deeply equal the expected value',
    );
  });
}

export async function assertElementEnabled(
  input: string | Locator,
  options?: TimeoutOption,
): Promise<void> {
  const timeout = options?.timeout ?? STANDARD_TIMEOUT;
  await assertWithScreenshot('assertElementEnabled', async () => {
    const locator = getLocator(input);
    await expect(locator).toBeEnabled({ timeout });
  });
}

export async function assertElementDisabled(
  input: string | Locator,
  options?: TimeoutOption,
): Promise<void> {
  const timeout = options?.timeout ?? STANDARD_TIMEOUT;
  await assertWithScreenshot('assertElementDisabled', async () => {
    const locator = getLocator(input);
    await expect(locator).toBeDisabled({ timeout });
  });
}

export async function assertTextEquals(
  input: string | Locator,
  expectedText: string | RegExp,
  options?: TimeoutOption,
): Promise<void> {
  const timeout = options?.timeout ?? STANDARD_TIMEOUT;
  await assertWithScreenshot('assertTextEquals', async () => {
    const locator = getLocator(input);
    await expect(locator).toHaveText(expectedText, { timeout });
  });
}

export async function assertURLContains(urlSubstring: string, message?: string): Promise<void> {
  await assertWithScreenshot('assertURLContains', async () => {
    const { getPage } = await import('./page-utils');
    expect(getPage().url(), message).toContain(urlSubstring);
  });
}
