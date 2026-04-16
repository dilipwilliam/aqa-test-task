/**
 * Shared optional parameter types for utils (enterprise typings).
 */
import type { Locator } from '@playwright/test';

export interface TimeoutOption {
  timeout?: number;
}

export interface VisibilityOption {
  onlyVisible?: boolean;
}

export interface StabilityOption {
  stable?: boolean;
}

export interface ActionOptions extends TimeoutOption, VisibilityOption, StabilityOption {
  loadState?: 'load' | 'domcontentloaded' | 'networkidle';
}

export interface ClickOptions extends ActionOptions {
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  force?: boolean;
}

export interface FillOptions extends ActionOptions {
  force?: boolean;
  noWaitAfter?: boolean;
}

export interface ClearOptions extends ActionOptions {}

export interface CheckOptions extends ActionOptions {
  force?: boolean;
}

export interface SelectOptions extends ActionOptions {
  force?: boolean;
}

export interface HoverOptions extends ActionOptions {
  force?: boolean;
  modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
}

export interface DoubleClickOptions extends ActionOptions {
  button?: 'left' | 'right' | 'middle';
  force?: boolean;
}

export interface DragOptions extends ActionOptions {
  force?: boolean;
  sourcePosition?: { x: number; y: number };
  targetPosition?: { x: number; y: number };
}

export interface UploadOptions extends ActionOptions {
  noWaitAfter?: boolean;
}

export type UploadValues = string | string[] | { name: string; mimeType: string; buffer: Buffer };

export interface PressSequentiallyOptions extends ActionOptions {
  delay?: number;
  noWaitAfter?: boolean;
}

export interface LocatorOptions extends TimeoutOption {
  onlyVisible?: boolean;
  has?: Locator;
  hasNot?: Locator;
  hasText?: string | RegExp;
  hasNotText?: string | RegExp;
}

export interface LocatorWaitOptions extends TimeoutOption {}

export interface FrameOptions {
  name?: string;
  url?: string | RegExp;
}

export type GetByRoleTypes =
  | 'alert'
  | 'button'
  | 'checkbox'
  | 'combobox'
  | 'dialog'
  | 'gridcell'
  | 'link'
  | 'listbox'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'option'
  | 'progressbar'
  | 'radio'
  | 'scrollbar'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'textbox'
  | 'heading'
  | 'treeitem';

export interface GetByRoleOptions {
  name?: string | RegExp;
  exact?: boolean;
}

export interface GetByTextOptions {
  exact?: boolean;
}

export interface GetByPlaceholderOptions {
  exact?: boolean;
}

export interface ExpectOptions extends TimeoutOption {
  soft?: boolean;
}

export interface ExpectTextOptions {
  useInnerText?: boolean;
  ignoreCase?: boolean;
}

export interface SoftOption {
  soft?: boolean;
}

export interface GotoOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
  timeout?: number;
}

export type WaitForLoadStateOptions = 'load' | 'domcontentloaded' | 'networkidle';

export interface NavigationOptions {
  waitUntil?: WaitForLoadStateOptions | 'commit';
  timeout?: number;
}

export interface SwitchPageOptions extends NavigationOptions {
  loadState?: WaitForLoadStateOptions;
}

export interface EnvConfig {
  baseURL: string;
  apiBaseURL: string;
  username: string;
  password: string;
  envName: string;
  [key: string]: string | undefined;
}
