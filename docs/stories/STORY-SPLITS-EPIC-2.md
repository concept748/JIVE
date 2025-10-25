# Epic 2 Story Split Summary

**Date:** 2025-10-25
**Author:** SM Bob
**Purpose:** Document the recommended splits for Stories 2.3 and 2.4 to reduce complexity and improve development flow

---

## Story 2.3 Split: Authentication vs Observability

### Original Story 2.3

- **Name:** MCP Authentication & Authorization
- **Size:** 14 tasks, ~2 days effort
- **Complexity:** High (auth + rate limiting + audit logging)

### Recommended Split

#### Story 2.3a: MCP JWT Authentication ✅ CREATED

- **File:** `docs/stories/2.3a.story.md`
- **Focus:** JWT verification and scope-based authorization only
- **Tasks:** 11 tasks
- **Effort:** 1 day
- **Acceptance Criteria:**
  1. JWT verification middleware created (verifies signature, expiry, issuer)
  2. Scope-based authorization implemented (requireScope() function)
  3. Unauthorized requests return 401 with error details
  4. Insufficient scope returns 403 with required scope in error message
  5. Unit tests for auth middleware (valid/invalid tokens, expired tokens, scope checks)
  6. Integration test: MCP tool call with valid JWT succeeds, invalid JWT fails
  7. All tests pass

**Key Files:**

- `lib/mcp/types/jwt.ts` - JWT payload types, scope constants
- `lib/mcp/auth-middleware.ts` - verifyMCPToken(), requireScope()
- `lib/mcp/test-utils/generate-token.ts` - Test utility
- `tests/unit/mcp/auth-middleware.test.ts`
- `tests/integration/mcp/auth.test.ts`

---

#### Story 2.3b: MCP Rate Limiting & Audit Logging (TO BE CREATED)

- **File:** `docs/stories/2.3b.story.md` (to be created)
- **Focus:** Redis token bucket rate limiting and audit trail
- **Dependencies:** Story 2.3a (requires JWT auth middleware)
- **Tasks:** 10 tasks (estimated)
- **Effort:** 1 day
- **Acceptance Criteria:**
  1. Rate limiting via Redis token bucket (60 requests/minute per client)
  2. Audit logging to `mcp_audit_logs` table (actor, tool, scope, result, timestamp)
  3. Rate-limited requests return 429 with `Retry-After` header
  4. Audit logs capture all tool invocations (success and failure)
  5. Redis failure fails open (allows request if Redis unavailable)
  6. Unit tests for rate limiter and audit logger
  7. Integration test: MCP tool call creates audit log entry
  8. All tests pass

**Key Files:**

- `lib/mcp/rate-limiter.ts` - Token bucket implementation
- `lib/mcp/audit-logger.ts` - logMCPAudit() function
- `tests/unit/mcp/rate-limiter.test.ts`
- `tests/unit/mcp/audit-logger.test.ts`
- `lib/mcp/server.ts` - UPDATE (integrate rate limiter + audit logger)

**Key Tasks:**

1. Create rate limiter with Redis token bucket (60 req/min)
2. Create audit logger (logs to mcp_audit_logs table)
3. Integrate rate limiter middleware into server
4. Integrate audit logger (post-request hook)
5. Write unit tests for rate limiter
6. Write unit tests for audit logger
7. Write integration test (full auth + rate limit + audit flow)
8. Deploy to Railway with Redis rate limiting enabled

---

## Story 2.4 Split: Infrastructure vs Tools

### Original Story 2.4

- **Name:** MCP Tool Registry & Phase 1 Tools
- **Size:** 15 tasks, ~2.5 days effort
- **Complexity:** High (registry + 5 tools, one with file system operations)

### Recommended Split

#### Story 2.4a: MCP Tool Registry + Core Read Tools (TO BE CREATED)

- **File:** `docs/stories/2.4a.story.md` (to be created)
- **Focus:** Tool infrastructure + 2 simple read-only tools
- **Tasks:** 9 tasks (estimated)
- **Effort:** 1.5 days
- **Acceptance Criteria:**
  1. Tool discovery endpoint `GET /mcp/tools` returns tool schemas
  2. Tool invocation endpoint `POST /mcp/invoke` dispatches to handlers
  3. Tool registry pattern implemented (ToolRegistry class)
  4. **2 tools implemented:** status.get, conflicts.list
  5. Each tool queries Prisma for data (placeholder data for now)
  6. Each tool logs to mcp_audit_logs via Story 2.3b audit logger
  7. Integration tests for registry and 2 tools
  8. All tests pass

**Key Files:**

- `lib/mcp/types/tool.ts` - Tool schema types
- `lib/mcp/tool-registry.ts` - ToolRegistry class
- `lib/mcp/tools/status.ts` - status.get tool
- `lib/mcp/tools/conflicts.ts` - conflicts.list tool
- `lib/mcp/server.ts` - UPDATE (add /mcp/tools and /mcp/invoke endpoints)
- `tests/integration/mcp/tools.test.ts` - Tool tests

**Key Tasks:**

1. Define tool schema types (MCPToolSchema, MCPToolParameter, MCPToolResult)
2. Create ToolRegistry class (register, get, getAll, invoke)
3. Implement status.get tool (queries project, returns agent statuses - placeholder)
4. Implement conflicts.list tool (queries project, returns conflicts - placeholder)
5. Create tool discovery endpoint GET /mcp/tools
6. Create tool invocation endpoint POST /mcp/invoke (with scope check + audit)
7. Register tools in tool registry
8. Write integration tests for tool discovery
9. Write integration tests for status.get and conflicts.list

---

#### Story 2.4b: MCP Remaining Phase 1 Tools (TO BE CREATED)

- **File:** `docs/stories/2.4b.story.md` (to be created)
- **Focus:** 3 additional tools (1 write operation, 2 read operations)
- **Dependencies:** Story 2.4a (requires tool registry)
- **Tasks:** 8 tasks (estimated)
- **Effort:** 1 day
- **Acceptance Criteria:**
  1. **3 tools implemented:** kanban.moveStory, gates.list, runs.list
  2. kanban.moveStory updates story markdown file status field
  3. gates.list returns quality gate statuses (placeholder)
  4. runs.list returns agent run history (placeholder)
  5. Integration tests for all 3 tools
  6. Postman collection documented for all 5 tools
  7. curl examples documented for all 5 tools
  8. All tests pass
  9. Deployed to Railway

**Key Files:**

- `lib/mcp/tools/kanban.ts` - kanban.moveStory tool (file system writes)
- `lib/mcp/tools/gates.ts` - gates.list tool
- `lib/mcp/tools/runs.ts` - runs.list tool
- `docs/postman/mcp-tools.postman_collection.json` - Postman collection
- `docs/mcp-tools-examples.md` - curl examples

**Key Tasks:**

1. Implement kanban.moveStory tool (reads story file, updates status, writes back)
2. Add path traversal security check for kanban.moveStory
3. Implement gates.list tool (placeholder data)
4. Implement runs.list tool (placeholder data with filters)
5. Register 3 new tools in registry
6. Write integration tests for all 3 tools
7. Create Postman collection with all 5 tools
8. Create curl examples documentation
9. Deploy to Railway and verify all tools work

**Security Note for 2.4b:**

- kanban.moveStory requires path traversal validation:
  ```typescript
  const resolvedPath = path.resolve(storyPath);
  const allowedDir = path.resolve(process.cwd(), storyLocation);
  if (!resolvedPath.startsWith(allowedDir)) {
    return { success: false, error: { code: 'INVALID_PATH', ... } };
  }
  ```

---

## Split Benefits

### Story 2.3 Split Benefits

✅ **Clear separation:** Auth-first approach (2.3a), then add observability (2.3b)
✅ **Enables early testing:** Can test JWT auth before rate limiting is ready
✅ **Reduces PR size:** Easier code review for focused auth changes
✅ **Risk isolation:** Auth bugs don't block rate limiting implementation
✅ **Parallel work:** If multiple devs, one can work on 2.3a while another preps 2.3b tests

### Story 2.4 Split Benefits

✅ **Proof of concept first:** Registry + 2 simple tools validates the pattern
✅ **Isolates risky operation:** File system writes (kanban.moveStory) isolated in 2.4b
✅ **Enables early MCP testing:** 2.4a delivers usable MCP server with 2 tools
✅ **Incremental value:** Can demo MCP tools after 2.4a without waiting for all 5
✅ **Clearer testing:** Tool infrastructure tests (2.4a) separate from tool-specific tests (2.4b)

---

## Implementation Order

**Recommended sequence:**

1. **Story 2.1:** Database & Redis Setup ✅ (infrastructure foundation)
2. **Story 2.2:** Initialize MCP Server Service ✅ (HTTP server foundation)
3. **Story 2.3a:** MCP JWT Authentication ✅ CREATED (auth foundation)
4. **Story 2.3b:** MCP Rate Limiting & Audit (observability layer)
5. **Story 2.4a:** MCP Tool Registry + Core Tools (tool infrastructure + 2 tools)
6. **Story 2.4b:** MCP Remaining Tools (3 additional tools + documentation)
7. **Story 2.5:** Initialize Orchestrator Worker ✅ (background jobs)

**Dependencies:**

- 2.3b depends on 2.3a (needs JWT auth middleware)
- 2.4a depends on 2.3b (needs audit logger)
- 2.4b depends on 2.4a (needs tool registry)
- 2.5 depends on 2.1 (needs database and Redis)

---

## Status

| Story | Status       | File Created                 | Notes                    |
| ----- | ------------ | ---------------------------- | ------------------------ |
| 2.3a  | ✅ READY     | `docs/stories/2.3a.story.md` | JWT auth only, 580 lines |
| 2.3b  | 📝 TO CREATE | `docs/stories/2.3b.story.md` | Rate limit + audit       |
| 2.4a  | 📝 TO CREATE | `docs/stories/2.4a.story.md` | Registry + 2 tools       |
| 2.4b  | 📝 TO CREATE | `docs/stories/2.4b.story.md` | 3 remaining tools        |

---

## Next Steps

**For SM (Bob):**

1. Create Story 2.3b markdown file following 2.3a template
2. Create Story 2.4a markdown file
3. Create Story 2.4b markdown file
4. Update PRD `epic-2-infrastructure-mcp-server.md` to reference split stories
5. Update story numbering: Keep 2.5 or renumber to 2.7?

**For Dev:**

1. Implement stories in order: 2.1 → 2.2 → 2.3a → 2.3b → 2.4a → 2.4b → 2.5
2. Each story is ~1-1.5 days of focused work
3. Each story has clear completion criteria and tests

---

**Approval:** Awaiting user confirmation to proceed with creating 2.3b, 2.4a, 2.4b story files.
