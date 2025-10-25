# Epic List

## Proposed Epic Structure

**Epic 1: Core Infrastructure & Project Discovery**

- Goal: Establish Next.js application foundation with webhook handling and basic project detection, delivering a deployable health-check page and BMAD project detection capabilities.

**Epic 2: Infrastructure & MCP Server**

- Goal: Establish three-service Railway architecture with PostgreSQL/Redis persistence, secure MCP server for IDE integration, and orchestrator worker for background job processing.

**Epic 3: Real-Time Agent Status Monitoring**

- Goal: Implement agent activity tracking with real-time WebSocket updates, enabling users to see which agents (Analyst, PM, Architect, SM, Dev, QA) are working on which artifacts.

**Epic 4: Artifact Tracking & Version Management**

- Goal: Create artifact tree visualization with version tracking and dependency mapping, providing complete visibility into PRDs, architecture docs, and stories.

**Epic 5: Conflict Detection & Phase Progress Visualization**

- Goal: Implement proactive conflict detection for version mismatches and BMAD phase progress tracking, delivering mission-critical coordination intelligence.

**Epic 6: Quality Gates & Agent Run Tracking**

- Goal: Implement quality gate evaluation system (unit tests, integration tests, type-check, lint) with automated pass/fail tracking and agent execution run history for full development lifecycle visibility.

**Epic 7: Multi-Project Portfolio Dashboard**

- Goal: Build portfolio management interface allowing users to add, view, and navigate between multiple BMAD projects from a unified dashboard.

---

## Epic Priority & Dependencies

**Critical Path (P0):**

- Epic 1 → Epic 2 → Epic 3 → Epic 4 → Epic 5 → Epic 6

**Parallel Track (P1):**

- Epic 7 (depends on Epic 1, 2 for data models; can run parallel to Epic 3-6)

**Notes:**

- Epic 2 was split from original PRD v1 to separate backend infrastructure from frontend portfolio
- Epic 7 contains original Epic 2 portfolio stories (7.1-7.6)
- Epic 6 added to match Architecture v1.1 gate evaluation system
