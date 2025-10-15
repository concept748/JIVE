import { NextResponse } from 'next/server';
import type { HealthResponse } from '@/types/health';

export async function GET() {
  const response: HealthResponse = {
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
