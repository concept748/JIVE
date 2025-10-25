import { NextResponse } from 'next/server';
import type { HealthResponse } from '@/types/health';
import packageJson from '@/package.json';
import { testConnection as testDatabaseConnection } from '@/lib/db/prisma';
import { testConnection as testRedisConnection } from '@/lib/db/redis';

async function checkEnvironment(url: string): Promise<{
  postgres: boolean;
  redis: boolean;
}> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 0 }, // Don't cache
    });
    if (!response.ok) {
      return { postgres: false, redis: false };
    }
    const data = await response.json();
    return {
      postgres: data.database || false,
      redis: data.redis || false,
    };
  } catch (error) {
    console.error(`Failed to check ${url}:`, error);
    return { postgres: false, redis: false };
  }
}

export async function GET(request: Request) {
  // Test local database connection
  const databaseHealthy = await testDatabaseConnection();

  // Test local Redis connection
  const redisHealthy = await testRedisConnection();

  // Check if this is a recursive call (skip environment checks to prevent infinite loop)
  const url = new URL(request.url);
  const skipEnvChecks = url.searchParams.get('local') === 'true';

  let environments:
    | {
        staging: { postgres: boolean; redis: boolean };
        production: { postgres: boolean; redis: boolean };
      }
    | undefined;

  if (!skipEnvChecks) {
    // Check staging and production environments (add ?local=true to prevent recursion)
    const [staging, production] = await Promise.all([
      checkEnvironment(
        (process.env.NEXT_PUBLIC_STAGING_URL ||
          'https://jive-staging.up.railway.app') + '/api/health?local=true',
      ),
      checkEnvironment(
        (process.env.NEXT_PUBLIC_PRODUCTION_URL ||
          'https://jive-production.up.railway.app') + '/api/health?local=true',
      ),
    ]);

    environments = {
      staging,
      production,
    };
  }

  const response: HealthResponse = {
    status: 'ok',
    version: packageJson.version,
    timestamp: new Date().toISOString(),
    database: databaseHealthy,
    redis: redisHealthy,
    environments,
  };

  return NextResponse.json(response);
}
