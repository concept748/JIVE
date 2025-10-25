import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';

// Mock the database and Redis connection test functions
vi.mock('@/lib/db/prisma', () => ({
  testConnection: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/db/redis', () => ({
  testConnection: vi.fn().mockResolvedValue(true),
}));

// Mock global fetch to prevent real network calls
global.fetch = vi.fn();

describe('Health API Endpoint', () => {
  const createMockRequest = (
    url: string = 'http://localhost:3000/api/health',
  ) => {
    return new Request(url);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock fetch to return successful health checks for environment tests
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'ok',
        version: '0.1.2',
        timestamp: new Date().toISOString(),
        database: true,
        redis: true,
      }),
    });
  });

  it('returns 200 status code', async () => {
    const response = await GET(createMockRequest());
    expect(response.status).toBe(200);
  });

  it('returns correct JSON structure', async () => {
    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('timestamp');
  });

  it('returns status as "ok"', async () => {
    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data.status).toBe('ok');
  });

  it('returns version as "0.1.2"', async () => {
    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data.version).toBe('0.1.2');
  });

  it('returns timestamp in ISO8601 format', async () => {
    const mockDate = new Date('2025-10-15T14:30:00.000Z');
    vi.setSystemTime(mockDate);

    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data.timestamp).toBe('2025-10-15T14:30:00.000Z');
    expect(() => new Date(data.timestamp)).not.toThrow();
  });

  it('includes database health status', async () => {
    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data).toHaveProperty('database');
    expect(data.database).toBe(true);
  });

  it('includes Redis health status', async () => {
    const response = await GET(createMockRequest());
    const data = await response.json();

    expect(data).toHaveProperty('redis');
    expect(data.redis).toBe(true);
  });

  it('skips environment checks when local=true', async () => {
    const response = await GET(
      createMockRequest('http://localhost:3000/api/health?local=true'),
    );
    const data = await response.json();

    // When local=true, environments should be undefined
    expect(data.environments).toBeUndefined();
  });
});
