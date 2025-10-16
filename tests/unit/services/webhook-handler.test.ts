import { describe, test, expect, beforeEach } from 'vitest';
import { WebhookHandler } from '@/lib/services/webhook-handler';
import { createHmac } from 'crypto';

describe('WebhookHandler', () => {
  let handler: WebhookHandler;
  const testSecret = 'test-webhook-secret';

  // Helper function to generate valid HMAC signature
  function generateSignature(payload: string, secret: string): string {
    const hmac = createHmac('sha256', secret);
    hmac.update(payload, 'utf8');
    return `sha256=${hmac.digest('hex')}`;
  }

  beforeEach(() => {
    handler = new WebhookHandler();
  });

  describe('verifySignature', () => {
    test('verifies valid HMAC-SHA256 signature', async () => {
      const payload = JSON.stringify({ event: 'push', ref: 'refs/heads/main' });
      const signature = generateSignature(payload, testSecret);

      const result = await handler.verifySignature(
        payload,
        signature,
        testSecret,
      );

      expect(result).toBe(true);
    });

    test('rejects invalid HMAC-SHA256 signature', async () => {
      const payload = JSON.stringify({ event: 'push', ref: 'refs/heads/main' });
      const invalidSignature = 'sha256=invalidsignaturehash';

      const result = await handler.verifySignature(
        payload,
        invalidSignature,
        testSecret,
      );

      expect(result).toBe(false);
    });

    test('rejects signature with wrong secret', async () => {
      const payload = JSON.stringify({ event: 'push', ref: 'refs/heads/main' });
      const signature = generateSignature(payload, 'wrong-secret');

      const result = await handler.verifySignature(
        payload,
        signature,
        testSecret,
      );

      expect(result).toBe(false);
    });

    test('rejects signature without sha256 prefix', async () => {
      const payload = JSON.stringify({ event: 'push' });
      const signature = 'invalidsignatureformat';

      const result = await handler.verifySignature(
        payload,
        signature,
        testSecret,
      );

      expect(result).toBe(false);
    });

    test('rejects modified payload with valid signature', async () => {
      const payload = JSON.stringify({ event: 'push', ref: 'refs/heads/main' });
      const signature = generateSignature(payload, testSecret);
      const modifiedPayload = JSON.stringify({
        event: 'push',
        ref: 'refs/heads/malicious',
      });

      const result = await handler.verifySignature(
        modifiedPayload,
        signature,
        testSecret,
      );

      expect(result).toBe(false);
    });
  });

  describe('checkIdempotency', () => {
    test('allows first delivery with new ID', () => {
      const deliveryId = 'delivery-123';

      const result = handler.checkIdempotency(deliveryId);

      expect(result).toBe(true);
    });

    test('detects duplicate delivery IDs', () => {
      const deliveryId = 'delivery-456';

      const firstResult = handler.checkIdempotency(deliveryId);
      const secondResult = handler.checkIdempotency(deliveryId);

      expect(firstResult).toBe(true); // New
      expect(secondResult).toBe(false); // Duplicate
    });

    test('allows different delivery IDs', () => {
      const deliveryId1 = 'delivery-789';
      const deliveryId2 = 'delivery-790';

      const result1 = handler.checkIdempotency(deliveryId1);
      const result2 = handler.checkIdempotency(deliveryId2);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    test('persists idempotency check across multiple checks', () => {
      const deliveryId = 'delivery-persistent';

      handler.checkIdempotency(deliveryId);
      const secondCheck = handler.checkIdempotency(deliveryId);
      const thirdCheck = handler.checkIdempotency(deliveryId);

      expect(secondCheck).toBe(false);
      expect(thirdCheck).toBe(false);
    });
  });

  describe('handleWebhook', () => {
    test('returns success for valid signature and new delivery', async () => {
      const payload = JSON.stringify({
        repository: {
          id: 123,
          name: 'test-repo',
          full_name: 'user/test-repo',
          owner: { login: 'user', id: 1 },
        },
      });
      const signature = generateSignature(payload, testSecret);
      const deliveryId = 'delivery-success';

      const result = await handler.handleWebhook(
        payload,
        signature,
        deliveryId,
        testSecret,
      );

      expect(result.success).toBe(true);
      expect(result.isDuplicate).toBe(false);
      expect(result.error).toBeUndefined();
    });

    test('returns error for invalid signature', async () => {
      const payload = JSON.stringify({
        repository: {
          id: 123,
          name: 'test-repo',
          full_name: 'user/test-repo',
          owner: { login: 'user', id: 1 },
        },
      });
      const invalidSignature = 'sha256=invalid';
      const deliveryId = 'delivery-invalid-sig';

      const result = await handler.handleWebhook(
        payload,
        invalidSignature,
        deliveryId,
        testSecret,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid webhook signature');
    });

    test('returns success with isDuplicate flag for duplicate delivery', async () => {
      const payload = JSON.stringify({
        repository: {
          id: 123,
          name: 'test-repo',
          full_name: 'user/test-repo',
          owner: { login: 'user', id: 1 },
        },
      });
      const signature = generateSignature(payload, testSecret);
      const deliveryId = 'delivery-duplicate';

      // First delivery
      const firstResult = await handler.handleWebhook(
        payload,
        signature,
        deliveryId,
        testSecret,
      );

      // Duplicate delivery
      const secondResult = await handler.handleWebhook(
        payload,
        signature,
        deliveryId,
        testSecret,
      );

      expect(firstResult.success).toBe(true);
      expect(firstResult.isDuplicate).toBe(false);

      expect(secondResult.success).toBe(true);
      expect(secondResult.isDuplicate).toBe(true);
    });

    test('returns error for invalid JSON payload', async () => {
      const invalidPayload = 'not-valid-json{';
      const signature = generateSignature(invalidPayload, testSecret);
      const deliveryId = 'delivery-invalid-json';

      const result = await handler.handleWebhook(
        invalidPayload,
        signature,
        deliveryId,
        testSecret,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toBeTruthy();
    });

    test('returns error for payload missing repository', async () => {
      const payload = JSON.stringify({ event: 'push' }); // Missing repository
      const signature = generateSignature(payload, testSecret);
      const deliveryId = 'delivery-no-repo';

      const result = await handler.handleWebhook(
        payload,
        signature,
        deliveryId,
        testSecret,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid payload: missing repository');
    });
  });

  describe('clearIdempotencyCache', () => {
    test('clears processed delivery IDs', () => {
      const deliveryId = 'delivery-to-clear';

      handler.checkIdempotency(deliveryId);
      const beforeClear = handler.checkIdempotency(deliveryId);

      handler.clearIdempotencyCache();
      const afterClear = handler.checkIdempotency(deliveryId);

      expect(beforeClear).toBe(false); // Was duplicate
      expect(afterClear).toBe(true); // Now new after clear
    });
  });
});
