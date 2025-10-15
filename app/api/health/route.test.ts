import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';

describe('Health API Endpoint', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('returns 200 status code', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('returns correct JSON structure', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('timestamp');
  });

  it('returns status as "ok"', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.status).toBe('ok');
  });

  it('returns version as "0.1.0"', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.version).toBe('0.1.0');
  });

  it('returns timestamp in ISO8601 format', async () => {
    const mockDate = new Date('2025-10-15T14:30:00.000Z');
    vi.setSystemTime(mockDate);

    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBe('2025-10-15T14:30:00.000Z');
    expect(() => new Date(data.timestamp)).not.toThrow();
  });
});
