import { NextResponse } from 'next/server';
import { webhookHandler } from '@/lib/services/webhook-handler';
import { randomUUID } from 'crypto';

/**
 * GitHub Webhook Handler API Endpoint
 *
 * Receives and processes GitHub webhook events (push, pull_request, etc.)
 * Verifies HMAC-SHA256 signatures and checks for duplicate deliveries.
 *
 * @see https://docs.github.com/en/webhooks
 */
export async function POST(req: Request) {
  const requestId = randomUUID();

  try {
    // Extract required headers
    const signature = req.headers.get('x-hub-signature-256');
    const deliveryId = req.headers.get('x-github-delivery');
    const event = req.headers.get('x-github-event');

    // Validate required headers
    if (!signature) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_SIGNATURE',
            message: 'Missing X-Hub-Signature-256 header',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 401 },
      );
    }

    if (!deliveryId) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_DELIVERY_ID',
            message: 'Missing X-GitHub-Delivery header',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 400 },
      );
    }

    // Get webhook secret from environment
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
      console.error('GITHUB_WEBHOOK_SECRET environment variable not set');
      return NextResponse.json(
        {
          error: {
            code: 'SERVER_CONFIGURATION_ERROR',
            message: 'Webhook processing unavailable',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 500 },
      );
    }

    // Read raw body
    const payload = await req.text();

    // Handle webhook with verification
    const result = await webhookHandler.handleWebhook(
      payload,
      signature,
      deliveryId,
      secret,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_SIGNATURE',
            message: result.error || 'Webhook signature verification failed',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 401 },
      );
    }

    // Return 202 Accepted for both new and duplicate deliveries
    return NextResponse.json(
      {
        message: result.isDuplicate
          ? 'Webhook delivery already processed'
          : 'Webhook received and queued for processing',
        deliveryId,
        event,
        duplicate: result.isDuplicate || false,
        timestamp: new Date().toISOString(),
        requestId,
      },
      { status: 202 },
    );
  } catch (error) {
    console.error('Webhook processing error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while processing the webhook',
          details:
            error instanceof Error
              ? { message: error.message }
              : { message: 'Unknown error' },
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: 500 },
    );
  }
}
