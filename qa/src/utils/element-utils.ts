/**
 * Element wait/state utilities (stability, attached, visibility).
 */
import type { Locator } from '@playwright/test';
import { getLocator } from './locator-utils';
import type { TimeoutOption } from './types';
import { STANDARD_TIMEOUT, CUCUMBER_STEP_TIMEOUT } from './constants';

export async function waitForElementToBeStable(
  input: string | Locator,
  options?: TimeoutOption,
): Promise<void> {
  const locator = getLocator(input);
  // Priority: 1) caller-supplied timeout  2) Cucumber step ceiling  3) STANDARD_TIMEOUT
  const timeout = options?.timeout ?? CUCUMBER_STEP_TIMEOUT ?? STANDARD_TIMEOUT;
  await locator.waitFor({ state: 'visible', timeout });
  await locator.evaluate(
    () =>
      new Promise<void>((r) => {
        const raf = (globalThis as unknown as { requestAnimationFrame: (cb: () => void) => number })
          .requestAnimationFrame;
        raf(() => raf(() => r()));
      }),
  );
}

export async function waitForFirstElementToBeAttached(
  input: string | Locator,
  options?: TimeoutOption,
): Promise<void> {
  const locator = getLocator(input);
  // Priority: 1) caller-supplied timeout  2) Cucumber step ceiling  3) STANDARD_TIMEOUT
  const timeout = options?.timeout ?? CUCUMBER_STEP_TIMEOUT ?? STANDARD_TIMEOUT;
  await locator.first().waitFor({ state: 'attached', timeout });
}

export async function waitForElement(
  input: string | Locator,
  state: 'attached' | 'detached' | 'visible' | 'hidden' = 'visible',
  options?: TimeoutOption,
): Promise<Locator> {
  const locator = getLocator(input);
  /**
   * Timeout priority (highest → lowest):
   *  1. options?.timeout  — explicit per-call override; always wins.
   *  2. CUCUMBER_STEP_TIMEOUT — mirrors setDefaultTimeout() so the fallback
   *     aligns with the maximum time a step is allowed to run.
   *  3. STANDARD_TIMEOUT — last-resort safety net (should never be reached in practice).
   */
  const timeout = options?.timeout ?? CUCUMBER_STEP_TIMEOUT ?? STANDARD_TIMEOUT;
  await locator.waitFor({ state, timeout });
  return locator;
}
