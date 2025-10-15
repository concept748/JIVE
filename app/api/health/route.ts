import { NextResponse } from 'next/server';
import type { HealthResponse } from '@/types/health';

export async function GET() {
  const response: HealthResponse = {
    status: 'ok',
    version: '0.1.2',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
