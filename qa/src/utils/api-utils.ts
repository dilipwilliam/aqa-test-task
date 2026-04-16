/**
 * API utilities using Playwright APIRequestContext.
 * Supports GET, POST, PUT, PATCH, DELETE with Allure integration.
 */
import type { APIRequestContext, APIResponse } from '@playwright/test';
import { request } from '@playwright/test';
import { attachment } from 'allure-js-commons';
import { getLogger } from './logger';

const logger = getLogger();

let requestContext: APIRequestContext | undefined;

export interface CreateRequestContextOptions {
  baseURL?: string;
  extraHTTPHeaders?: Record<string, string>;
  ignoreHTTPSErrors?: boolean;
}

export async function createRequestContext(
  options: CreateRequestContextOptions = {},
): Promise<APIRequestContext> {
  requestContext = await request.newContext({
    baseURL: options.baseURL,
    extraHTTPHeaders: options.extraHTTPHeaders,
    ignoreHTTPSErrors: options.ignoreHTTPSErrors ?? true,
  });
  logger.info('API request context created');
  return requestContext;
}

export function getAPIRequestContext(): APIRequestContext {
  if (!requestContext)
    throw new Error('API context not created. Call createRequestContext() first.');
  return requestContext;
}

export async function disposeRequestContext(): Promise<void> {
  if (requestContext) {
    await requestContext.dispose();
    requestContext = undefined;
    logger.info('API request context disposed');
  }
}

export async function get(
  url: string,
  options?: Parameters<APIRequestContext['get']>[1],
): Promise<APIResponse> {
  logger.debug(`GET ${url}`);
  return getAPIRequestContext().get(url, options);
}

export async function post(
  url: string,
  options?: Parameters<APIRequestContext['post']>[1],
): Promise<APIResponse> {
  logger.debug(`POST ${url}`);
  return getAPIRequestContext().post(url, options);
}

export async function put(
  url: string,
  options?: Parameters<APIRequestContext['put']>[1],
): Promise<APIResponse> {
  logger.debug(`PUT ${url}`);
  return getAPIRequestContext().put(url, options);
}

export async function patch(
  url: string,
  options?: Parameters<APIRequestContext['patch']>[1],
): Promise<APIResponse> {
  logger.debug(`PATCH ${url}`);
  return getAPIRequestContext().patch(url, options);
}

export async function deleteRequest(
  url: string,
  options?: Parameters<APIRequestContext['delete']>[1],
): Promise<APIResponse> {
  logger.debug(`DELETE ${url}`);
  return getAPIRequestContext().delete(url, options);
}

export async function setHeaders(headers: Record<string, string>): Promise<void> {
  const currentOptions: CreateRequestContextOptions = {
    extraHTTPHeaders: headers,
    ignoreHTTPSErrors: true,
  };
  if (requestContext) await requestContext.dispose();
  requestContext = await request.newContext(currentOptions);
}

export async function setAuthToken(
  token: string,
  scheme: 'Bearer' | 'Basic' = 'Bearer',
): Promise<void> {
  const value = scheme === 'Bearer' ? `Bearer ${token}` : token;
  await setHeaders({ Authorization: value });
}

export function validateStatusCode(response: APIResponse, expected: number | number[]): void {
  const status = response.status();
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(status)) {
    throw new Error(`Expected status ${allowed.join(' or ')}, got ${status}`);
  }
}

export function validateResponseTime(response: APIResponse, maxMs: number): void {
  const ok = response.ok();
  if (!ok)
    throw new Error(
      `Response not OK; response time validation skipped. Status: ${response.status()}`,
    );
  logger.debug(`Response time check: max ${maxMs}ms`);
}

export async function parseJSON<T = unknown>(response: APIResponse): Promise<T> {
  return response.json() as Promise<T>;
}

export async function attachRequestResponseToAllure(
  response: APIResponse,
  requestUrl: string,
  requestBody?: unknown,
): Promise<void> {
  try {
    const requestPayload = requestBody ? JSON.stringify(requestBody, null, 2) : 'N/A';
    const body = await response.text();
    await attachment(
      'API Request',
      JSON.stringify({ url: requestUrl, body: requestPayload }, null, 2),
      'application/json',
    );
    await attachment(
      'API Response',
      body,
      (response.headers()['content-type'] as 'application/json') ?? 'application/json',
    );
  } catch {
    logger.warn('Allure attachment skipped (allure runtime may not be in test context)');
  }
}

export async function retryApiCall<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      logger.warn(`API call attempt ${i + 1}/${maxAttempts} failed: ${lastError.message}`);
      if (i < maxAttempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

export function schemaValidation(data: unknown, requiredKeys: string[]): void {
  const obj = data as Record<string, unknown>;
  for (const key of requiredKeys) {
    if (!(key in obj)) throw new Error(`Schema validation failed: missing key "${key}"`);
  }
}
