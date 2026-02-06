/**
 * API client - typed fetch wrapper
 */
import { z } from 'zod';

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  async get<T>(path: string, schema?: z.ZodType<T>): Promise<T> {
    return this.request('GET', path, undefined, schema);
  }

  async post<T>(path: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    return this.request('POST', path, body, schema);
  }

  async put<T>(path: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    return this.request('PUT', path, body, schema);
  }

  async delete<T>(path: string, schema?: z.ZodType<T>): Promise<T> {
    return this.request('DELETE', path, undefined, schema);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    schema?: z.ZodType<T>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, url);
    }

    const data = await response.json();
    return schema ? schema.parse(data) : (data as T);
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string,
  ) {
    super(`API Error ${status}: ${statusText} (${url})`);
    this.name = 'ApiError';
  }
}

/** Default API client instance */
export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
});
