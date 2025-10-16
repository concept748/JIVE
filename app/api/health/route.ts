import { NextResponse } from 'next/server';
import type { HealthResponse } from '@/types/health';
import packageJson from '@/package.json';
import { testConnection as testDatabaseConnection } from '@/lib/db/prisma';
import { testConnection as testRedisConnection } from '@/lib/db/redis';

export async function GET() {
  // Test database connection
  const databaseHealthy = await testDatabaseConnection();

  // Test Redis connection
  const redisHealthy = await testRedisConnection();

  const response: HealthResponse = {
    status: 'ok',
    version: packageJson.version,
    timestamp: new Date().toISOString(),
    database: databaseHealthy,
    redis: redisHealthy,
  };

  return NextResponse.json(response);
}
