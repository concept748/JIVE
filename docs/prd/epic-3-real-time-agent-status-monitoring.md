# Epic 3: Real-Time Agent Status Monitoring

**Goal:** Implement agent activity tracking with real-time WebSocket updates, enabling users to see which agents (Analyst, PM, Architect, SM, Dev, QA) are working on which artifacts.

**Business Value:** Delivers the core "visibility into agent activity" value proposition. This epic transforms JIVE from a static dashboard into a live mission control center, enabling users to instantly see what agents are doing and detect coordination issues as they happen.

**Target Completion:** Week 3-4 (Sprint 3-4 of 6-week timeline)

---

## User Stories

**Story 3.1: Agent Activity Inference Engine**

```
As a System
I want to infer which BMAD agent is active based on file system changes
So that I can display real-time agent status without requiring agent instrumentation

Acceptance Criteria:
✓ AgentInferenceEngine class created in /lib/agent-inference.ts
✓ Maps file paths to agents using rules:
  - docs/prd.md, docs/brief.md → PM (Product Manager)
  - docs/architecture.md, docs/architecture/* → Architect
  - docs/stories/*.md (write operations) → Scrum Master
  - src/**, lib/**, components/** → Developer
  - docs/qa/**, tests/** → QA Engineer
  - (research or analysis files) → Analyst
✓ Consumes file watcher events (file_created, file_modified, file_deleted)
✓ Emits agent activity events: { agent, status, artifact, timestamp, projectId }
✓ Status determination: RUNNING (file modified <30s ago), IDLE (>30s), ERROR (file watcher errors)
✓ Handles edge cases: multiple agents modifying files simultaneously (last write wins)
✓ Unit tests covering all agent mapping rules with mock file events
```

**Story 3.2: Agent Status State Management**

```
As a System
I want to maintain agent status state for all monitored projects
So that I can serve current agent status via API and WebSocket

Acceptance Criteria:
✓ AgentStatusStore class with in-memory state: Map<projectId, Map<agentId, AgentStatus>>
✓ AgentStatus type: { agent, status, taskDescription, artifact, lastUpdated, projectId }
✓ Methods: updateAgentStatus(), getAgentStatus(projectId, agentId), getAllAgents(projectId)
✓ Auto-transition RUNNING → IDLE after 30 seconds of inactivity (background timer)
✓ Persists last 100 activity events per project in circular buffer (for activity log)
✓ Thread-safe updates (prevent race conditions from concurrent file events)
✓ Unit tests covering state transitions and timeout logic
```

**Story 3.3: WebSocket Server Implementation**

```
As a System
I want a WebSocket server to broadcast agent status updates to connected clients
So that the dashboard receives real-time updates without polling

Acceptance Criteria:
✓ WebSocket server setup in Next.js custom server (or API route with upgrade)
✓ Endpoint: ws://localhost:3000/api/ws (or wss:// in production)
✓ Connection handling: accept connections, track connected clients per project
✓ Broadcast agent_status_changed events: { type, projectId, agent, status, artifact, timestamp }
✓ Heartbeat/ping every 30 seconds to detect disconnections
✓ Graceful disconnect handling (remove client from broadcast list)
✓ Integration test: connect client → trigger file change → verify event received <500ms
```

**Story 3.4: Agent Status Cards UI**

```
As a User
I want to see status cards for all 6 BMAD agents on the project dashboard
So that I can quickly see which agents are active and what they're working on

Acceptance Criteria:
✓ Project dashboard (/project/[id]) displays 6 agent cards in grid (2x3 or 3x2 layout)
✓ Agents: Analyst, PM, Architect, Scrum Master, Developer, QA Engineer
✓ Each card shows:
  - Agent name and icon
  - Status badge: IDLE (gray), RUNNING (blue, animated pulse), COMPLETED (green), BLOCKED (yellow), ERROR (red)
  - Current artifact (file path, truncated if long) or "—" if idle
  - Task description (e.g., "Updating PRD", "Implementing feature X") or "Idle"
  - Last updated timestamp (relative: "2 minutes ago")
✓ RUNNING status has animated pulse border (2-3s cycle, subtle)
✓ Cards use shadcn/ui card component with consistent styling
✓ Mobile responsive: stack vertically on small screens
```

**Story 3.5: WebSocket Client Integration**

```
As a Frontend
I want to establish a WebSocket connection and update agent cards in real-time
So that users see live agent status without refreshing the page

Acceptance Criteria:
✓ useWebSocket React hook created in /lib/hooks/useWebSocket.ts
✓ Connects to ws://localhost:3000/api/ws on component mount
✓ Automatically reconnects on disconnect (exponential backoff: 1s, 2s, 4s, 8s, max 30s)
✓ Subscribes to projectId context (only receive events for current project)
✓ On agent_status_changed event: update AgentStatusStore via React Context/Zustand
✓ Shows connection status indicator (connected/disconnected) in dashboard header
✓ Handles connection errors gracefully (shows "Offline" message, continues retrying)
✓ Component test: mock WebSocket → send event → verify card updates
```

**Story 3.6: Agent Activity Log**

```
As a User
I want to view a chronological activity log of all agent actions
So that I can understand the sequence of work and debug coordination issues

Acceptance Criteria:
✓ Activity log panel at bottom of project dashboard (collapsible tray or sidebar)
✓ Displays last 50 events in reverse chronological order (newest first)
✓ Each log entry shows:
  - Timestamp (HH:MM:SS format)
  - Agent name (color-coded badge)
  - Action description: "Started working on docs/prd.md" / "Completed src/components/Card.tsx"
  - Artifact link (click to open in artifact viewer - Phase 2)
✓ Auto-scroll to newest entry when new events arrive
✓ Filter by agent (dropdown: "All Agents" / "Developer" / "QA" / etc.)
✓ "Clear Log" button (clears display but keeps data in store)
✓ Infinite scroll to load older events (if more than 50)
```

**Story 3.7: Task Description Inference (Smart Labels)**

```
As a System
I want to generate human-readable task descriptions from file changes
So that users see meaningful activity labels like "Updating PRD" instead of raw file paths

Acceptance Criteria:
✓ inferTaskDescription(agent, filePath, eventType) function created
✓ Rules for generating descriptions:
  - PM editing docs/prd.md → "Updating Product Requirements"
  - Dev modifying src/components/Card.tsx → "Working on Card component"
  - QA creating docs/qa/test-plan.md → "Writing Test Plan"
  - SM editing docs/stories/story-1.md → "Refining User Story"
  - Architect updating docs/architecture.md → "Updating Architecture"
✓ Handles file_created vs file_modified (e.g., "Creating" vs "Updating")
✓ Truncates long file names intelligently (e.g., "...components/Card.tsx" not "src/...")
✓ Fallback: raw file path if no rule matches
✓ Unit tests covering all agent types and common file patterns
```

---

## Technical Implementation Notes

**Architecture Decisions:**

- **WebSocket over Server-Sent Events:** Chosen for bidirectional communication potential (Phase 2: pause agent, send commands)
- **In-Memory State:** Agent status stored in Node.js process memory (sufficient for single-server deployment to Vercel)
- **Heuristic-Based Inference:** No agent instrumentation required; infer activity from file changes (trade-off: less precise but zero integration cost)
- **30-Second Activity Window:** Agent marked RUNNING if file modified <30s ago (balances responsiveness with false positives)

**Key Dependencies:**

- `ws` (v8.0+): WebSocket server implementation
- `date-fns` (v2.30+): Timestamp formatting for activity log
- Native WebSocket API (browser): Client-side WebSocket

**File Structure:**

```
lib/
├── agent-inference.ts       # AgentInferenceEngine (file path → agent mapping)
├── agent-status-store.ts    # AgentStatusStore (in-memory state management)
├── websocket-server.ts      # WebSocket server setup and broadcasting
└── hooks/
    └── useWebSocket.ts      # React hook for WebSocket connection

app/
└── api/
    └── ws/
        └── route.ts         # WebSocket API route (connection upgrade)

components/
├── agent-status-card.tsx    # Individual agent card component
├── agent-status-grid.tsx    # Grid layout for all 6 agents
├── activity-log.tsx         # Activity log panel
└── connection-indicator.tsx # WebSocket connection status
```

**Testing Strategy:**

- Unit tests: AgentInferenceEngine (all mapping rules), task description inference
- Integration tests: File watcher → agent inference → WebSocket broadcast → client receives event
- Component tests: Render agent cards with mock status → verify visual states (IDLE, RUNNING, ERROR)
- Manual tests: Modify real BMAD files (edit PRD) → verify agent card updates in real-time

**Risk Mitigation:**

- **WebSocket on Vercel:** Vercel serverless functions have 10s timeout; WebSocket connections may not persist. Mitigation: Use Vercel Edge Functions or fallback to SSE/polling if needed
- **False Positives:** File saves by IDE (auto-save) may trigger spurious agent activity. Mitigation: 100ms debounce on file events, require minimum file size change
- **Concurrent Edits:** Two agents editing same file (e.g., Dev and Architect both updating architecture.md). Mitigation: Last-write-wins, display both agents as active if within 30s window

**Performance Considerations:**

- WebSocket broadcast: O(n) where n = connected clients per project (acceptable for <100 concurrent users)
- Agent status lookups: O(1) using Map data structure
- Activity log: Circular buffer with max 100 events (prevents unbounded memory growth)

---

## Dependencies

**Blocks:**

- Epic 4 (Artifact Tracking) - can leverage agent activity data (e.g., "Dev last modified this artifact")
- Epic 5 (Conflict Detection) - can use agent activity to trigger conflict checks

**Depends On:**

- Epic 1: FileWatcherService (file change events)
- Epic 2: Project selection (projectId context for filtering events)

**External Dependencies:**

- None (WebSocket library is standard npm package)

---

## Definition of Done

✅ All 7 user stories completed with acceptance criteria met
✅ Agent status cards display and update in real-time (<500ms latency) when files change
✅ WebSocket connection established on page load and auto-reconnects on disconnect
✅ Activity log displays chronological agent activity with smart task descriptions
✅ All 6 BMAD agents correctly inferred from file path patterns
✅ RUNNING agents auto-transition to IDLE after 30 seconds of inactivity
✅ Unit test coverage >80% for agent inference and status management
✅ Integration test validates end-to-end: file change → WebSocket event → UI update
✅ Manual testing with real BMAD project (edit PRD, create story, modify code) confirms accuracy
✅ Code reviewed and merged to main branch
✅ Feature deployed to Vercel (or fallback to SSE/polling if WebSocket unsupported)

---

**Effort Estimate:** 4-5 days (1 developer)
**Priority:** P0 (Critical Path)
**Assigned To:** TBD

---
