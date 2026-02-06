/**
 * Tests for API client
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { ApiClient, ApiError } from '../../src/services/api-client';

const mockFetch = vi.fn();

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    client = new ApiClient({ baseUrl: 'https://api.example.com' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should make a GET request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test' }),
    });

    const result = await client.get('/users/1');
    expect(result).toEqual({ id: 1, name: 'Test' });
    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/users/1', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    });
  });

  it('should make a POST request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 2, name: 'New User' }),
    });

    const result = await client.post('/users', { name: 'New User' });
    expect(result).toEqual({ id: 2, name: 'New User' });
    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New User' }),
    });
  });

  it('should make a PUT request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Updated' }),
    });

    const result = await client.put('/users/1', { name: 'Updated' });
    expect(result).toEqual({ id: 1, name: 'Updated' });
    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/users/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
  });

  it('should make a DELETE request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const result = await client.delete('/users/1');
    expect(result).toEqual({ success: true });
  });

  it('should throw ApiError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(client.get('/users/999')).rejects.toThrow(ApiError);
  });

  it('should include status info in ApiError', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(client.get('/users/999')).rejects.toMatchObject({
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('should validate response with Zod schema', async () => {
    const UserSchema = z.object({
      id: z.number(),
      name: z.string(),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Valid' }),
    });

    const result = await client.get('/users/1', UserSchema);
    expect(result).toEqual({ id: 1, name: 'Valid' });
  });

  it('should throw on Zod validation failure', async () => {
    const UserSchema = z.object({
      id: z.number(),
      name: z.string(),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'not-a-number', name: 123 }),
    });

    await expect(client.get('/users/1', UserSchema)).rejects.toThrow();
  });

  it('should strip trailing slash from baseUrl', () => {
    const c = new ApiClient({ baseUrl: 'https://api.example.com/' });
    expect(c).toBeDefined();
  });

  it('should merge custom headers', async () => {
    const authedClient = new ApiClient({
      baseUrl: 'https://api.example.com',
      headers: { Authorization: 'Bearer token123' },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await authedClient.get('/me');
    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token123',
      },
      body: undefined,
    });
  });
});

describe('ApiError', () => {
  it('should have correct properties', () => {
    const error = new ApiError(500, 'Internal Server Error', '/api/fail');
    expect(error.status).toBe(500);
    expect(error.statusText).toBe('Internal Server Error');
    expect(error.url).toBe('/api/fail');
    expect(error.name).toBe('ApiError');
    expect(error.message).toContain('500');
  });
});
