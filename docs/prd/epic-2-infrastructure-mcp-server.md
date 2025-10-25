# Epic 2: Infrastructure & MCP Server

**Goal:** Establish the three-service Railway architecture with PostgreSQL/Redis persistence, secure MCP server for IDE integration, and orchestrator worker for background job processing.

**Business Value:** Enables Cursor/Codex IDE agents to query JIVE status, provides persistent data storage for multi-project portfolio, and sets foundation for real-time conflict detection and artifact scanning.

**Target Completion:** Week 2-3 (Sprint 2-3 of 6-week timeline)

---

## User Stories

**Note on Story Splits (2025-10-25):** Stories 2.3 and 2.4 have been split into sub-stories (2.3a/2.3b and 2.4a/2.4b) to reduce complexity and enable clearer development workflow. See `docs/stories/STORY-SPLITS-EPIC-2.md` for detailed split rationale.

**Story 2.1: Database & Redis Setup**

```
As a System
I want PostgreSQL and Redis deployed on Railway with Prisma ORM configured
So that I can persist project data and enable background job processing

Acceptance Criteria:
✓ Prisma schema created with Project, Artifact, WebhookEvent, MCPAuditLog models
✓ Initial migration generated and applied locally
✓ Railway Postgres provisioned and connected
✓ Railway Redis provisioned and connected
✓ Prisma Client generated with TypeScript types
✓ Database connection tested with health check query
✓ Redis pub/sub tested with sample publish/subscribe
✓ Environment variables configured (.env.example updated)
```

**Story 2.2: Initialize MCP Server Service**

```
As a Developer
I want a standalone MCP server running on Railway
So that IDE agents can securely invoke JIVE tools

Acceptance Criteria:
✓ Node.js HTTP server created in lib/mcp/server.ts
✓ Express or Fastify framework configured for HTTP/2 support
✓ Health endpoint GET /mcp/health returns 200 with status
✓ Railway deployment configured for MCP service (port 4000)
✓ railway.json updated for multi-service deployment
✓ MCP service accessible at https://jive-mcp-staging.railway.app
✓ CORS configured to allow localhost (dev) and web service (prod)
✓ Basic middleware: logging, error handling, request ID
```

**Story 2.3a: MCP JWT Authentication**

```
As a Security Engineer
I want MCP tool invocations authenticated via JWT with scope-based authorization
So that only authorized IDE agents can access JIVE data with appropriate permissions

Acceptance Criteria:
✓ JWT verification middleware created (verifies signature, expiry, issuer)
✓ Scope-based authorization implemented (requireScope() function)
✓ Unauthorized requests return 401 with error details
✓ Insufficient scope returns 403 with required scope in error message
✓ Unit tests for auth middleware (valid/invalid tokens, expired tokens, scope checks)
✓ Integration test: MCP tool call with valid JWT succeeds, invalid JWT fails
✓ All tests pass
```

**Story 2.3b: MCP Rate Limiting & Audit Logging**

```
As a System Administrator
I want MCP tool invocations rate-limited and audited
So that I can prevent abuse and track all access to JIVE data

Acceptance Criteria (depends on Story 2.3a):
✓ Rate limiting via Redis token bucket (60 requests/minute per client)
✓ Audit logging to mcp_audit_logs table (actor, tool, scope, result, timestamp)
✓ Rate-limited requests return 429 with Retry-After header
✓ Audit logs capture all tool invocations (success and failure)
✓ Redis failure fails open (allows request if Redis unavailable)
✓ Unit tests for rate limiter and audit logger
✓ Integration test: MCP tool call creates audit log entry
✓ All tests pass
```

**Story 2.4a: MCP Tool Registry + Core Read Tools**

```
As an IDE Agent (Cursor/Codex)
I want to discover and invoke JIVE tools via Model Context Protocol
So that I can query project status from my IDE

Acceptance Criteria:
✓ Tool discovery endpoint GET /mcp/tools returns tool schemas
✓ Tool invocation endpoint POST /mcp/invoke dispatches to handlers
✓ Tool registry pattern implemented (ToolRegistry class)
✓ 2 tools implemented: status.get, conflicts.list
✓ Each tool queries Prisma for data (placeholder data for now)
✓ Each tool logs to mcp_audit_logs via audit logger
✓ Integration tests for registry and 2 tools
✓ All tests pass
```

**Story 2.4b: MCP Remaining Phase 1 Tools**

```
As an IDE Agent (Cursor/Codex)
I want to invoke additional JIVE tools for task management and quality gates
So that I can manage stories and view gate status from my IDE

Acceptance Criteria (depends on Story 2.4a):
✓ 3 tools implemented: kanban.moveStory, gates.list, runs.list
✓ kanban.moveStory updates story markdown file status field (with path validation)
✓ gates.list returns quality gate statuses (placeholder)
✓ runs.list returns agent run history (placeholder)
✓ Integration tests for all 3 tools
✓ Postman collection documented for all 5 tools
✓ curl examples documented for all 5 tools
✓ All tests pass
✓ Deployed to Railway
```

**Story 2.5: Initialize Orchestrator Worker**

```
As a System
I want a background worker that processes webhook events via BullMQ job queues
So that artifact scanning and conflict detection run asynchronously

Acceptance Criteria:
✓ Orchestrator worker created in lib/orchestrator/worker.ts
✓ BullMQ queue created: artifact-scan, conflict-detection, gate-evaluation
✓ Webhook handler enqueues artifact-scan job when push event received
✓ Worker processes artifact-scan job (placeholder implementation logs job)
✓ Redis pub/sub integrated: worker publishes events to project:{id} channel
✓ Railway deployment configured for orchestrator service
✓ Worker connects to Postgres and Redis on startup
✓ Health monitoring: worker logs heartbeat every 30 seconds
✓ Job retries configured (3 attempts with exponential backoff)
✓ Manual job enqueue test: POST /api/jobs/enqueue (dev endpoint)
```

---

## Technical Implementation Notes

**Architecture Decisions:**

- **Three-Service Railway Deployment:** Web (Next.js), MCP (Node.js HTTP), Orchestrator (Node.js worker)
- **Shared Database & Redis:** All services connect to same Railway Postgres and Redis instances
- **Job Queue Pattern:** BullMQ for background jobs, Redis for pub/sub real-time events
- **Security Model:** JWT authentication for MCP, HMAC-SHA256 for webhooks, Row-Level Security (RLS) for database

**Key Dependencies:**

- `prisma` (5+): Type-safe database ORM with migrations
- `@prisma/client` (auto-generated): TypeScript database client
- `redis` (4+): Redis client for pub/sub and rate limiting
- `bullmq` (4+): Redis-backed job queue with retries
- `express` or `fastify` (MCP server framework)
- `jsonwebtoken` (9+): JWT verification for MCP auth
- `zod` (3+): Runtime schema validation for API inputs

**Database Schema (Prisma):**

Epic 2 implements the following tables (from Architecture v1.1):

```prisma
model Project {
  id            String      @id @default(uuid())
  name          String
  repoUrl       String      @unique
  webhookSecret String      @db.Text
  config        Json        // ProjectConfig as JSONB
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  lastSeen      DateTime    @default(now())

  artifacts     Artifact[]
  webhookEvents WebhookEvent[]
  mcpAuditLogs  MCPAuditLog[]
}

model WebhookEvent {
  id           String        @id
  source       WebhookSource
  projectId    String
  eventType    String
  payloadHash  String
  processed    Boolean       @default(false)
  processedAt  DateTime?
  retryCount   Int           @default(0)
  errorMessage String?       @db.Text
  receivedAt   DateTime      @default(now())

  project      Project       @relation(fields: [projectId], references: [id])
}

model MCPAuditLog {
  id           String    @id @default(uuid())
  projectId    String
  actorType    String
  actorId      String
  actorName    String
  tool         String
  scope        String
  argsHash     String
  result       MCPResult
  errorMessage String?   @db.Text
  timestamp    DateTime  @default(now())
  ipAddress    String
  userAgent    String    @db.Text

  project      Project   @relation(fields: [projectId], references: [id])
}

// Additional models: Artifact, AgentStatus, Conflict, Gate, Run
// (Deferred to Epic 3 - not needed for Phase 1 MCP tools)
```

**Railway Multi-Service Configuration:**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

**Deployment Strategy:**

- **Web Service:** Already deployed (Stories 1.1-1.2)
- **MCP Service:** Deploy in Story 2.2, accessible at port 4000
- **Orchestrator Service:** Deploy in Story 2.5, no public port (background worker)
- **Postgres & Redis:** Provision via Railway dashboard, auto-inject connection strings

**File Structure:**

```
jive/
├── prisma/
│   ├── schema.prisma              # Story 2.1 creates this
│   └── migrations/
│       └── <timestamp>_init/
│           └── migration.sql      # Story 2.1 generates this
├── lib/
│   ├── mcp/
│   │   ├── server.ts              # Story 2.2: MCP HTTP server
│   │   ├── auth-middleware.ts     # Story 2.3: JWT verification
│   │   ├── rate-limiter.ts        # Story 2.3: Redis rate limiting
│   │   ├── audit-logger.ts        # Story 2.3: MCP audit logging
│   │   ├── tool-registry.ts       # Story 2.4: Tool registration
│   │   └── tools/                 # Story 2.4: Tool implementations
│   │       ├── status.ts
│   │       ├── conflicts.ts
│   │       ├── kanban.ts
│   │       ├── gates.ts
│   │       └── runs.ts
│   ├── orchestrator/
│   │   ├── worker.ts              # Story 2.5: BullMQ worker
│   │   ├── queues.ts              # Story 2.5: Queue definitions
│   │   └── jobs/                  # Story 2.5: Job handlers
│   │       ├── artifact-scan.ts
│   │       ├── conflict-detection.ts
│   │       └── gate-evaluation.ts
│   └── db/
│       └── prisma.ts              # Story 2.1: Prisma client singleton
├── tests/
│   ├── integration/
│   │   ├── mcp/
│   │   │   ├── auth.test.ts       # Story 2.3
│   │   │   └── tools.test.ts      # Story 2.4
│   │   └── orchestrator/
│   │       └── jobs.test.ts       # Story 2.5
│   └── unit/
│       └── mcp/
│           ├── auth-middleware.test.ts  # Story 2.3
│           └── rate-limiter.test.ts     # Story 2.3
└── .env.example                    # Update in Story 2.1
```

**Testing Strategy:**

- **Story 2.1:** Integration test for Prisma connection, Redis pub/sub
- **Story 2.2:** Health endpoint test, Railway deployment verification
- **Story 2.3:** Unit tests for auth middleware, integration test for full auth flow
- **Story 2.4:** Integration tests for all 5 MCP tools with test database
- **Story 2.5:** Job queue test with manual enqueue, verify worker processes job

**Risk Mitigation:**

- **Railway Service Limits:** Free tier supports 3 services, paid plan required for scaling
- **Database Migrations:** Test migrations locally before applying to staging/production
- **MCP Protocol Compatibility:** Verify MCP tools work with Cursor/Codex (may require adjustments)
- **Job Queue Failure:** BullMQ retries configured (3 attempts, exponential backoff)

---

## Dependencies

**Blocks:**

- Epic 3 (Agent Status Tracking) - requires database and MCP tools
- Epic 4 (Artifact Tracking) - requires orchestrator worker for scanning
- Epic 5 (Conflict Detection) - requires background job processing

**Depends On:**

- Epic 1 Stories 1.1-1.2 (Web service foundation) - ✅ COMPLETE
- Epic 1 Story 1.3 (Webhook handler) - ✅ DRAFTED
- Epic 1 Story 1.4 (BMAD detector) - ✅ DRAFTED

**External Dependencies:**

- Railway account with Postgres/Redis add-ons provisioned
- GitHub OAuth app credentials (for JWT issuing in web service)
- Node.js 18+ with pnpm for local development

---

## Definition of Done

✅ All 5 user stories completed with acceptance criteria met
✅ Database schema deployed to Railway Postgres (staging)
✅ MCP server deployed to Railway and accessible via HTTPS
✅ Orchestrator worker deployed and processing test jobs
✅ Unit test coverage >80% for MCP auth and tools
✅ Integration tests pass for MCP tool invocations
✅ Manual testing: Cursor IDE can invoke status.get tool successfully
✅ Code reviewed and merged to staging branch
✅ Documentation updated (README, MCP tool usage guide)

---

**Effort Estimate:** 7-9 days (1 developer, AI-assisted)

- Story 2.1: 1.5 days
- Story 2.2: 0.75 days
- Story 2.3a: 1 day
- Story 2.3b: 1 day
- Story 2.4a: 1.5 days
- Story 2.4b: 1 day
- Story 2.5: 2 days

**Priority:** P0 (Critical Path - blocks Epic 3+)
**Assigned To:** TBD

**Story Count:** 7 stories (split from original 5)

---

## Success Metrics

**Technical Metrics:**

- 3 Railway services deployed and healthy
- Database migrations applied without errors
- MCP server response time <200ms for tool invocations
- Job queue processing latency <5s for webhook events

**Business Metrics:**

- IDE agents can successfully query JIVE project status
- Audit logs capture 100% of MCP tool invocations
- Background jobs process without manual intervention
- Zero data loss in Postgres/Redis connections

---

## Notes

**P1 High-Priority from Architecture v1.1:**

This epic addresses the "Production-Ready MCP Server" gap identified in Architecture v1.1 alignment report (lines 240-244). The MCP server is essential for IDE integration and was marked as a high-priority addition.

**Relationship to Epic 1:**

Epic 2 runs in parallel with completing Epic 1 stories. While Epic 1 focuses on web service features (health check, project detection), Epic 2 builds out the multi-service architecture required for the full JIVE vision.

**Epic Scope Change (2025-10-25):**

This epic was separated from the original "Multi-Project Portfolio Dashboard" PRD. Frontend portfolio features (project cards, add/remove UI, portfolio grid) moved to Epic 7. Epic 2 now focuses exclusively on backend infrastructure (database, MCP server, orchestrator) to enable clearer separation of concerns and parallel development tracks.

**Phase 2 Enhancements (Deferred):**

- Mutual-TLS authentication for MCP (enterprise security)
- Advanced MCP tools (artifact.update, conflict.resolve, gate.override)
- Orchestrator horizontal scaling (multiple worker instances)
- Database sharding for multi-tenant isolation
- Real-time WebSocket notifications from orchestrator to web service
