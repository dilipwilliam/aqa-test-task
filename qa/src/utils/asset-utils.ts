/**
 * Screenshot and asset utilities (screenshots, file paths for upload).
 */
import path from 'path';
import { getPage } from './page-utils';
import { getLogger } from './logger';

const logger = getLogger();

export async function takeScreenshot(name?: string): Promise<Buffer> {
  const page = getPage();
  const safeName = name ? name.replace(/[^a-zA-Z0-9-_]/g, '_') : `screenshot_${Date.now()}`;
  const buffer = await page.screenshot({
    path: path.join(process.cwd(), 'test-results', `${safeName}.png`),
    fullPage: false,
  });
  logger.debug(`Screenshot taken: ${safeName}`);
  return buffer;
}

export async function takeFullPageScreenshot(name?: string): Promise<Buffer> {
  const page = getPage();
  const safeName = name ? name.replace(/[^a-zA-Z0-9-_]/g, '_') : `full_${Date.now()}`;
  const buffer = await page.screenshot({
    path: path.join(process.cwd(), 'test-results', `${safeName}.png`),
    fullPage: true,
  });
  logger.debug(`Full page screenshot: ${safeName}`);
  return buffer;
}

/**
 * Resolve path for upload (relative to project or absolute).
 * Relative paths are resolved to src/upload-file/ folder.
 */
export function resolveUploadPath(relativeOrAbsolute: string): string {
  if (path.isAbsolute(relativeOrAbsolute)) return relativeOrAbsolute;
  return path.resolve(process.cwd(), 'src', 'upload-file', relativeOrAbsolute);
}
