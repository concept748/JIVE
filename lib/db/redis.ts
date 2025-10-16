/**
 * Redis Client Singleton
 * Provides Redis connection for pub/sub, rate limiting, and job queues
 */

import Redis from 'ioredis';

// Construct Redis URL from environment variables
// Support both REDIS_URL and individual components (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD)
const redisUrl =
  process.env.REDIS_URL ||
  (process.env.REDIS_HOST
    ? `redis://${process.env.REDIS_PASSWORD ? `default:${process.env.REDIS_PASSWORD}@` : ''}${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
    : 'redis://localhost:6379');

// Create singleton Redis client
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableReadyCheck: true,
  lazyConnect: true, // Don't connect immediately - wait for first command
  connectTimeout: 10000, // 10 second timeout
});

// Handle connection errors
redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

/**
 * Publish an event to a Redis channel
 * @param channel - The channel name to publish to
 * @param data - The data to publish (will be JSON stringified)
 * @returns Promise<number> - Number of subscribers that received the message
 */
export async function publishEvent(
  channel: string,
  data: Record<string, unknown>,
): Promise<number> {
  try {
    const message = JSON.stringify(data);
    return await redis.publish(channel, message);
  } catch (error) {
    console.error(`Failed to publish to channel ${channel}:`, error);
    throw error;
  }
}

/**
 * Subscribe to a Redis channel and handle messages
 * @param channel - The channel name to subscribe to
 * @param handler - Callback function to handle incoming messages
 * @returns Promise<Redis> - The subscriber Redis instance
 */
export async function subscribeToChannel(
  channel: string,
  handler: (message: string, parsedData: unknown) => void,
): Promise<Redis> {
  // Create a new Redis client for subscription (required by Redis pub/sub)
  const subscriber = new Redis(redisUrl);

  subscriber.on('message', (ch, message) => {
    if (ch === channel) {
      try {
        const parsedData = JSON.parse(message);
        handler(message, parsedData);
      } catch (error) {
        console.error('Failed to parse message from Redis:', error);
        handler(message, null);
      }
    }
  });

  await subscriber.subscribe(channel);
  console.log(`Subscribed to channel: ${channel}`);

  return subscriber;
}

/**
 * Test Redis connection with PING command
 * @returns Promise<boolean> - true if connection successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    console.log(
      'Testing Redis connection with URL:',
      redisUrl.replace(/:[^:@]+@/, ':****@'),
    );

    // Add 10 second timeout to allow for connection + ping
    const response = await Promise.race([
      redis.ping(),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Redis ping timeout')), 10000),
      ),
    ]);

    console.log('Redis ping response:', response);
    return response === 'PONG';
  } catch (error) {
    console.error('Redis connection test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return false;
  }
}
