export enum WebhookSource {
  GITHUB = 'github',
  GITLAB = 'gitlab',
  BITBUCKET = 'bitbucket',
}

export interface WebhookEvent {
  id: string;
  source: WebhookSource;
  projectId: string;
  eventType: string;
  payloadHash: string;
  processed: boolean;
  processedAt: Date | null;
  retryCount: number;
  errorMessage?: string;
  receivedAt: Date;
}

export interface GitHubWebhookPayload {
  ref?: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
      id: number;
    };
  };
  pusher?: {
    name: string;
    email: string;
  };
  commits?: Array<{
    id: string;
    message: string;
    timestamp: string;
    author: {
      name: string;
      email: string;
    };
  }>;
}

export interface WebhookVerificationResult {
  success: boolean;
  error?: string;
  isDuplicate?: boolean;
}
