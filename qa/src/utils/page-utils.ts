/**
 * Page factory: set and get current Playwright Page.
 * Used by all utils to operate on the active page.
 */
import type { BrowserContext, Page, Response } from '@playwright/test';
import { expect } from '@playwright/test';
import { getDefaultLoadState } from './constants';
import type { GotoOptions, NavigationOptions, SwitchPageOptions, WaitForLoadStateOptions } from './types';
import { SMALL_TIMEOUT } from './constants';

let page: Page;

// ─── Allure attach singleton ──────────────────────────────────────────────
// allure-js-commons v2 has no standalone attachment() function.
// We store the Cucumber world's this.attach() here so utility modules can
// attach screenshots without needing direct access to the world instance.
type AttachFn = (data: Buffer, contentType: string) => void;
let attachFn: AttachFn | null = null;

export function setAttachFn(fn: AttachFn | null): void {
  attachFn = fn;
}

export function getAttachFn(): AttachFn | null {
  return attachFn;
}
// ─────────────────────────────────────────────────────────────────────────

export function hasPage(): boolean {
  return !!page;
}

export function getPage(): Page {
  if (!page) throw new Error('Page is not set. Ensure hooks have run (e.g. beforeEach).');
  return page;
}

export function getContext(): BrowserContext {
  return getPage().context();
}

export function setPage(pageInstance: Page): void {
  page = pageInstance;
}

export function getAllPages(): Page[] {
  return getPage().context().pages();
}

export async function switchPage(winNum: number, options?: SwitchPageOptions): Promise<void> {
  const timeoutInMs = options?.timeout ?? SMALL_TIMEOUT;
  const startTime = Date.now();
  while (getAllPages().length < winNum && Date.now() - startTime < timeoutInMs) {
    await new Promise((r) => setTimeout(r, 100));
  }
  expect(
    getAllPages().length,
    `Page number ${winNum} not found after ${timeoutInMs}ms`,
  ).toBeGreaterThanOrEqual(winNum);
  const pageInstance = getAllPages()[winNum - 1];
  await pageInstance.waitForLoadState(options?.loadState ?? getDefaultLoadState());
  setPage(pageInstance);
}

export async function switchToDefaultPage(): Promise<void> {
  const allPages = getAllPages();
  if (allPages.length > 0) {
    await allPages[0].bringToFront();
    setPage(allPages[0]);
  }
}

export async function closePage(winNum?: number): Promise<void> {
  if (!winNum) {
    await getPage().close();
    await switchToDefaultPage();
    return;
  }
  expect(winNum).toBeGreaterThan(0);
  const allPages = getAllPages();
  if (allPages.length >= winNum) {
    await allPages[winNum - 1].close();
  }
  await switchToDefaultPage();
}

export async function gotoURL(
  path: string,
  options: GotoOptions = { waitUntil: getDefaultLoadState() },
): Promise<null | Response> {
  return getPage().goto(path, options);
}

export const navigateTo = gotoURL;

export async function getURL(options: NavigationOptions = { waitUntil: 'load' }): Promise<string> {
  await waitForPageLoadState(options);
  return getPage().url();
}

export async function waitForPageLoadState(options?: NavigationOptions): Promise<void> {
  let waitUntil: WaitForLoadStateOptions = getDefaultLoadState();
  if (options?.waitUntil && options.waitUntil !== 'commit') waitUntil = options.waitUntil;
  await getPage().waitForLoadState(waitUntil);
}

export async function reloadPage(options?: NavigationOptions): Promise<void> {
  await Promise.all([getPage().reload(options), getPage().waitForEvent('framenavigated')]);
  await waitForPageLoadState(options);
}

export async function goBack(options?: NavigationOptions): Promise<void> {
  await Promise.all([getPage().goBack(options), getPage().waitForEvent('framenavigated')]);
  await waitForPageLoadState(options);
}

export async function wait(ms: number): Promise<void> {
  await getPage().waitForTimeout(ms);
}

export async function getWindowSize(): Promise<{ width: number; height: number }> {
  return getPage().evaluate(() => {
    const w = globalThis as unknown as { innerWidth: number; innerHeight: number };
    return { width: w.innerWidth, height: w.innerHeight };
  });
}

export async function saveStorageState(
  filePath?: string,
): Promise<ReturnType<BrowserContext['storageState']>> {
  return getPage().context().storageState({ path: filePath });
}
