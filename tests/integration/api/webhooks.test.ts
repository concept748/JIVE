import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { createHmac } from 'crypto';

describe('POST /api/webhooks/github', () => {
  const testSecret = 'test-webhook-secret-for-integration';
  let originalSecret: string | undefined;

  // Helper function to generate valid HMAC signature
  function generateSignature(payload: string, secret: string): string {
    const hmac = createHmac('sha256', secret);
    hmac.update(payload, 'utf8');
    return `sha256=${hmac.digest('hex')}`;
  }

  beforeAll(() => {
    // Set test secret
    originalSecret = process.env.GITHUB_WEBHOOK_SECRET;
    process.env.GITHUB_WEBHOOK_SECRET = testSecret;
  });

  afterAll(() => {
    // Restore original secret
    if (originalSecret !== undefined) {
      process.env.GITHUB_WEBHOOK_SECRET = originalSecret;
    } else {
      delete process.env.GITHUB_WEBHOOK_SECRET;
    }
  });

  test('returns 401 for missing signature header', async () => {
    const payload = JSON.stringify({
      repository: {
        id: 123,
        name: 'test-repo',
        full_name: 'user/test-repo',
        owner: { login: 'user', id: 1 },
      },
    });

    const response = await fetch('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Delivery': 'test-delivery-1',
        'X-GitHub-Event': 'push',
      },
      body: payload,
    });

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('MISSING_SIGNATURE');
  });

  test('returns 400 for missing delivery ID header', async () => {
    const payload = JSON.stringify({
      repository: {
        id: 123,
        name: 'test-repo',
        full_name: 'user/test-repo',
        owner: { login: 'user', id: 1 },
      },
    });
    const signature = generateSignature(payload, testSecret);

    const response = await fetch('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
        'X-GitHub-Event': 'push',
      },
      body: payload,
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('MISSING_DELIVERY_ID');
  });

  test('returns 401 for invalid signature', async () => {
    const payload = JSON.stringify({
      repository: {
        id: 123,
        name: 'test-repo',
        full_name: 'user/test-repo',
        owner: { login: 'user', id: 1 },
      },
    });
    const invalidSignature = 'sha256=invalidhash';

    const response = await fetch('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': invalidSignature,
        'X-GitHub-Delivery': 'test-delivery-2',
        'X-GitHub-Event': 'push',
      },
      body: payload,
    });

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('INVALID_SIGNATURE');
  });

  test('returns 202 for valid signature and new delivery', async () => {
    const payload = JSON.stringify({
      repository: {
        id: 123,
        name: 'test-repo',
        full_name: 'user/test-repo',
        owner: { login: 'user', id: 1 },
      },
      ref: 'refs/heads/main',
    });
    const signature = generateSignature(payload, testSecret);
    const deliveryId = `test-delivery-${Date.now()}`;

    const response = await fetch('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
        'X-GitHub-Delivery': deliveryId,
        'X-GitHub-Event': 'push',
      },
      body: payload,
    });

    expect(response.status).toBe(202);

    const data = await response.json();
    expect(data.message).toBeDefined();
    expect(data.deliveryId).toBe(deliveryId);
    expect(data.event).toBe('push');
    expect(data.duplicate).toBe(false);
  });

  test('handles idempotency correctly for duplicate deliveries', async () => {
    const payload = JSON.stringify({
      repository: {
        id: 456,
        name: 'test-repo-2',
        full_name: 'user/test-repo-2',
        owner: { login: 'user', id: 1 },
      },
      ref: 'refs/heads/develop',
    });
    const signature = generateSignature(payload, testSecret);
    const deliveryId = `test-delivery-idempotent-${Date.now()}`;

    // First request
    const firstResponse = await fetch(
      'http://localhost:3000/api/webhooks/github',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': signature,
          'X-GitHub-Delivery': deliveryId,
          'X-GitHub-Event': 'push',
        },
        body: payload,
      },
    );

    expect(firstResponse.status).toBe(202);
    const firstData = await firstResponse.json();
    expect(firstData.duplicate).toBe(false);

    // Second request with same delivery ID
    const secondResponse = await fetch(
      'http://localhost:3000/api/webhooks/github',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': signature,
          'X-GitHub-Delivery': deliveryId,
          'X-GitHub-Event': 'push',
        },
        body: payload,
      },
    );

    expect(secondResponse.status).toBe(202);
    const secondData = await secondResponse.json();
    expect(secondData.duplicate).toBe(true);
    expect(secondData.message).toContain('already processed');
  });

  test('handles different event types', async () => {
    const payload = JSON.stringify({
      repository: {
        id: 789,
        name: 'test-repo-3',
        full_name: 'user/test-repo-3',
        owner: { login: 'user', id: 1 },
      },
      action: 'opened',
    });
    const signature = generateSignature(payload, testSecret);
    const deliveryId = `test-delivery-pr-${Date.now()}`;

    const response = await fetch('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
        'X-GitHub-Delivery': deliveryId,
        'X-GitHub-Event': 'pull_request',
      },
      body: payload,
    });

    expect(response.status).toBe(202);

    const data = await response.json();
    expect(data.event).toBe('pull_request');
    expect(data.deliveryId).toBe(deliveryId);
  });
});
