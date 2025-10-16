import { createHmac } from 'crypto';
import type {
  WebhookVerificationResult,
  GitHubWebhookPayload,
} from '@/types/webhook';

/**
 * WebhookHandler service for processing GitHub webhook events
 *
 * Handles signature verification and idempotency checking for incoming webhooks.
 * Uses HMAC-SHA256 signature verification per GitHub webhook specifications.
 */
export class WebhookHandler {
  private processedDeliveryIds: Set<string>;

  constructor() {
    this.processedDeliveryIds = new Set();
  }

  /**
   * Verifies the HMAC-SHA256 signature of a webhook payload
   *
   * @param payload - Raw webhook payload as string
   * @param signature - X-Hub-Signature-256 header value (format: "sha256=<hash>")
   * @param secret - Webhook secret for HMAC verification
   * @returns true if signature is valid, false otherwise
   */
  async verifySignature(
    payload: string,
    signature: string,
    secret: string,
  ): Promise<boolean> {
    try {
      // GitHub sends signature as "sha256=<hash>"
      if (!signature.startsWith('sha256=')) {
        return false;
      }

      const expectedSignature = signature.slice(7); // Remove "sha256=" prefix

      // Compute HMAC-SHA256 of payload with secret
      const hmac = createHmac('sha256', secret);
      hmac.update(payload, 'utf8');
      const computedSignature = hmac.digest('hex');

      // Constant-time comparison to prevent timing attacks
      if (computedSignature.length !== expectedSignature.length) {
        return false;
      }

      let isValid = true;
      for (let i = 0; i < computedSignature.length; i++) {
        if (computedSignature[i] !== expectedSignature[i]) {
          isValid = false;
        }
      }

      return isValid;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Checks if a webhook delivery ID has already been processed
   *
   * @param deliveryId - X-GitHub-Delivery header value
   * @returns true if this is a new delivery, false if duplicate
   */
  checkIdempotency(deliveryId: string): boolean {
    if (this.processedDeliveryIds.has(deliveryId)) {
      return false; // Duplicate
    }
    this.processedDeliveryIds.add(deliveryId);
    return true; // New delivery
  }

  /**
   * Handles a GitHub webhook event
   *
   * @param payload - Raw webhook payload as string
   * @param signature - X-Hub-Signature-256 header value
   * @param deliveryId - X-GitHub-Delivery header value
   * @param secret - Webhook secret
   * @returns Verification result indicating success/failure
   */
  async handleWebhook(
    payload: string,
    signature: string,
    deliveryId: string,
    secret: string,
  ): Promise<WebhookVerificationResult> {
    // Step 1: Verify signature
    const isValidSignature = await this.verifySignature(
      payload,
      signature,
      secret,
    );

    if (!isValidSignature) {
      return {
        success: false,
        error: 'Invalid webhook signature',
      };
    }

    // Step 2: Check idempotency
    const isNewDelivery = this.checkIdempotency(deliveryId);

    if (!isNewDelivery) {
      return {
        success: true,
        isDuplicate: true,
      };
    }

    // Step 3: Parse payload
    try {
      const parsedPayload = JSON.parse(payload) as GitHubWebhookPayload;

      // Validation: ensure repository exists
      if (!parsedPayload.repository) {
        return {
          success: false,
          error: 'Invalid payload: missing repository',
        };
      }

      // TODO (future story): Enqueue artifact-scan job to BullMQ
      // For now, just acknowledge receipt

      return {
        success: true,
        isDuplicate: false,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to parse payload',
      };
    }
  }

  /**
   * Clears the idempotency cache (useful for testing)
   */
  clearIdempotencyCache(): void {
    this.processedDeliveryIds.clear();
  }
}

// Export singleton instance
export const webhookHandler = new WebhookHandler();
