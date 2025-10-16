import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import {
  redis,
  publishEvent,
  subscribeToChannel,
  testConnection,
} from '@/lib/db/redis';
import type Redis from 'ioredis';

describe('Redis Integration', () => {
  const subscribers: Redis[] = [];

  beforeAll(async () => {
    // Wait for Redis connection
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    // Cleanup subscribers
    for (const subscriber of subscribers) {
      await subscriber.quit();
    }
    subscribers.length = 0;

    // Cleanup test keys
    const keys = await redis.keys('test:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });

  afterAll(async () => {
    // Disconnect from Redis
    await redis.quit();
  });

  test('connects to Redis successfully', async () => {
    const isConnected = await testConnection();
    expect(isConnected).toBe(true);
  });

  test('publishes and subscribes to channel', async () => {
    const channel = 'test:channel';
    const testData = {
      event: 'test_event',
      projectId: 'test-project-123',
      timestamp: new Date().toISOString(),
      payload: { message: 'Hello, Redis!' },
    };

    // Setup subscriber with promise to wait for message
    const messageReceived = new Promise<{
      raw: string;
      parsed: unknown;
    }>((resolve) => {
      subscribeToChannel(channel, (message, parsedData) => {
        resolve({ raw: message, parsed: parsedData });
      }).then((subscriber) => {
        subscribers.push(subscriber);
      });
    });

    // Wait a bit for subscription to be established
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Publish event
    const subscriberCount = await publishEvent(channel, testData);

    // Wait for message to be received
    const received = await messageReceived;

    expect(subscriberCount).toBeGreaterThan(0);
    expect(received.parsed).toEqual(testData);
  });

  test('handles multiple subscribers to same channel', async () => {
    const channel = 'test:multi-channel';
    const testData = { message: 'Broadcasting to multiple subscribers' };
    const receivedMessages: unknown[] = [];

    // Create multiple subscribers
    const subscriber1 = await subscribeToChannel(channel, (_, parsedData) => {
      receivedMessages.push(parsedData);
    });
    subscribers.push(subscriber1);

    const subscriber2 = await subscribeToChannel(channel, (_, parsedData) => {
      receivedMessages.push(parsedData);
    });
    subscribers.push(subscriber2);

    // Wait for subscriptions to be established
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Publish event
    await publishEvent(channel, testData);

    // Wait for messages to be received
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(receivedMessages).toHaveLength(2);
    expect(receivedMessages[0]).toEqual(testData);
    expect(receivedMessages[1]).toEqual(testData);
  });

  test('handles invalid JSON in subscribe handler', async () => {
    const channel = 'test:invalid-json';
    let receivedData: unknown = undefined;

    const subscriber = await subscribeToChannel(channel, (_, parsedData) => {
      receivedData = parsedData;
    });
    subscribers.push(subscriber);

    // Wait for subscription
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Publish invalid JSON directly via Redis client
    await redis.publish(channel, 'invalid-json{{{');

    // Wait for message
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should receive null when JSON parsing fails
    expect(receivedData).toBeNull();
  });

  test('sets and gets values', async () => {
    const key = 'test:simple-key';
    const value = 'test-value';

    await redis.set(key, value);
    const retrieved = await redis.get(key);

    expect(retrieved).toBe(value);
  });

  test('sets and gets JSON values', async () => {
    const key = 'test:json-key';
    const value = { foo: 'bar', count: 42 };

    await redis.set(key, JSON.stringify(value));
    const retrieved = await redis.get(key);
    const parsed = retrieved ? JSON.parse(retrieved) : null;

    expect(parsed).toEqual(value);
  });

  test('sets key with expiration', async () => {
    const key = 'test:expiring-key';
    const value = 'expires-soon';

    // Set with 1 second expiration
    await redis.set(key, value, 'EX', 1);

    // Key should exist immediately
    const immediate = await redis.get(key);
    expect(immediate).toBe(value);

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Key should be expired
    const afterExpiry = await redis.get(key);
    expect(afterExpiry).toBeNull();
  });

  test('deletes keys', async () => {
    const key = 'test:delete-key';
    const value = 'to-be-deleted';

    await redis.set(key, value);
    const beforeDelete = await redis.get(key);
    expect(beforeDelete).toBe(value);

    await redis.del(key);
    const afterDelete = await redis.get(key);
    expect(afterDelete).toBeNull();
  });

  test('increments counter', async () => {
    const key = 'test:counter';

    const count1 = await redis.incr(key);
    expect(count1).toBe(1);

    const count2 = await redis.incr(key);
    expect(count2).toBe(2);

    const count3 = await redis.incrby(key, 5);
    expect(count3).toBe(7);
  });
});
