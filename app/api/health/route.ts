import { NextResponse } from 'next/server';
import type { HealthResponse } from '@/types/health';
import packageJson from '@/package.json';

export async function GET() {
  const response: HealthResponse = {
    status: 'ok',
    version: packageJson.version,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
