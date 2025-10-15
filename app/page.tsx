'use client';

import { useEffect, useState } from 'react';
import type { HealthResponse } from '@/types/health';

export default function Home() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error('Health check failed');
        }
        const data: HealthResponse = await response.json();
        setHealthData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
  }, []);

  return (
    <div className="font-sans flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-left sm:text-5xl">
          JIVE Dashboard
        </h1>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Health Status</h2>

          {loading && (
            <p className="text-muted-foreground">Loading health status...</p>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              <p className="font-medium">Health check failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {healthData && !loading && !error && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {healthData.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Version
                </span>
                <span className="font-mono text-sm">{healthData.version}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Timestamp
                </span>
                <span className="font-mono text-sm">
                  {new Date(healthData.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-muted/50 p-6">
          <h2 className="mb-3 text-lg font-semibold">Welcome to JIVE</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            JIVE (Joint Interactive Virtual Environment) is your real-time
            multi-agent development monitoring platform. Track agent activities,
            view artifacts, and manage your development workflow all in one
            place.
          </p>
        </div>
      </main>
    </div>
  );
}
