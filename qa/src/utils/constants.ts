/**
 * Framework constants (timeouts, load state, etc.).
 */

export const STANDARD_TIMEOUT = 30_000;
export const SMALL_TIMEOUT = 5_000;
/**
 * Must match the value passed to setDefaultTimeout() in hooks.ts.
 * Used as the secondary fallback in waitForElement when no per-call timeout is provided.
 */
export const CUCUMBER_STEP_TIMEOUT = 60_000;
export const DEFAULT_LOAD_STATE = 'domcontentloaded' as const;

export function getDefaultLoadState(): 'load' | 'domcontentloaded' | 'networkidle' {
  return DEFAULT_LOAD_STATE;
}
