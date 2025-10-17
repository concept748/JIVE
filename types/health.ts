export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  database?: boolean;
  redis?: boolean;
  environments?: {
    staging?: {
      postgres?: boolean;
      redis?: boolean;
    };
    production?: {
      postgres?: boolean;
      redis?: boolean;
    };
  };
}
