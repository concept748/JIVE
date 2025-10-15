# JIVE Dashboard Product Requirements Document (PRD)

---

## Goals and Background Context

### Goals

- Launch Phase 1 MVP in 6 weeks with production-ready dashboard deployed to Vercel
- Provide real-time visibility into BMAD agent activity (Analyst, PM, Architect, SM, Dev, QA)
- Detect and prevent conflicts when agents work against stale artifact versions
- Enable multi-project portfolio management from a unified dashboard
- Reduce agent coordination overhead by 30-40%
- Establish foundation for plugin ecosystem and extensibility
- Create the first turnkey orchestration dashboard for multi-agent workflows

### Background Context

JIVE Dashboard addresses critical coordination challenges faced by software development teams adopting AI agents in the BMAD METHOD™ framework. Currently, teams using BMAD agents (via Claude Code) lack visibility into agent activity, cannot detect when agents work against outdated artifact versions (e.g., Dev implementing features based on v2 architecture while Architect has updated to v4), and struggle to manage multiple projects efficiently. Existing solutions fall short: multi-agent frameworks (CrewAI, LangGraph) provide no UI; observability platforms (Langfuse, AgentOps) are reactive rather than proactive; traditional PM tools (Jira, Linear) are human-centric and not agent-aware.

JIVE fills this white space by providing real-time agent visualization, proactive conflict detection, and portfolio intelligence in a turnkey dashboard. With the AI orchestration market growing from $5.8B (2024) to projected $48.7B (2034) and a 12-18 month window before major competitors build similar solutions, now is the critical moment to establish category leadership in AI agent orchestration.

### Change Log

| Date       | Version | Description                             | Author  |
| ---------- | ------- | --------------------------------------- | ------- |
| 2025-10-14 | 1.0     | Initial PRD creation from Project Brief | PM John |

---

## Requirements

### Functional Requirements

**Multi-Project Management:**

- **FR1:** The system shall scan and detect BMAD projects by identifying `.bmad-core/` folders in configured directories
- **FR2:** The system shall display a portfolio dashboard showing all configured BMAD projects with project name, current phase, agent count, story count, and conflict count
- **FR3:** The system shall allow users to add new projects by specifying project root paths
- **FR4:** The system shall allow users to remove projects from the portfolio view
- **FR5:** Users shall be able to click a project card to navigate to the detailed project dashboard

**Agent Status Visualization:**

- **FR6:** The system shall display status cards for all 6 BMAD agents (Analyst, PM, Architect, Scrum Master, Developer, QA)
- **FR7:** Each agent card shall show current status: IDLE, RUNNING, COMPLETED, BLOCKED, or ERROR
- **FR8:** Each agent card shall display the current task description when the agent is active
- **FR9:** Each agent card shall display the current artifact being worked on (file path)
- **FR10:** The system shall infer agent activity by monitoring file changes in agent-specific directories (e.g., `docs/prd.md` → Analyst, `src/` → Dev, `docs/qa/` → QA)
- **FR11:** The system shall maintain an activity log showing timestamp, agent, action, and artifact for each agent activity

**Artifact Tracking & Version Management:**

- **FR12:** The system shall parse all markdown files in the `docs/` directory and extract YAML front-matter
- **FR13:** The system shall display an artifact tree view showing all PRDs, architecture documents, stories, and other artifacts
- **FR14:** Each artifact in the tree shall display its version number (from `bmad.version` front-matter field)
- **FR15:** Each artifact shall display which agent created it (from `bmad.createdBy` front-matter field)
- **FR16:** Each artifact shall display the last modification timestamp
- **FR17:** The system shall highlight artifacts that have been updated in the last 5 minutes with a visual indicator
- **FR18:** Users shall be able to click an artifact to view its full content in a detail panel

**Conflict Detection:**

- **FR19:** The system shall build a dependency graph by parsing artifact references (e.g., stories referencing architecture documents)
- **FR20:** The system shall detect version mismatches when a dependent artifact references an outdated version of its dependency
- **FR21:** The system shall display conflict cards listing the type (version-mismatch, concurrent-edit, dependency-broken), affected artifacts, involved agents, severity (info, warning, critical), and descriptive message
- **FR22:** Users shall be able to manually mark conflicts as resolved
- **FR23:** The system shall track conflict resolution timestamps and maintain conflict history

**BMAD Phase Progress:**

- **FR24:** The system shall calculate progress for each BMAD phase (Build, Map, Analyze, Deploy) based on artifact completion status
- **FR25:** The system shall display a phase progress visualization showing all 4 phases with percentage completion and current phase highlighted
- **FR26:** BUILD phase progress shall be calculated based on PRD and project brief completion
- **FR27:** MAP phase progress shall be calculated based on architecture documents and story creation completion
- **FR28:** ANALYZE phase progress shall be calculated based on code implementation and test coverage
- **FR29:** DEPLOY phase progress shall be calculated based on QA completion and deployment status

**File System Integration:**

- **FR30:** The system shall use file watching (chokidar) to monitor all configured project directories for file changes
- **FR31:** The system shall detect file creation, modification, and deletion events within 1 second
- **FR32:** The system shall broadcast real-time updates via WebSocket to all connected dashboard clients within 500ms of detecting file changes
- **FR33:** The system shall support two-way sync, allowing dashboard updates to trigger file system changes

**Real-Time Communication:**

- **FR34:** The system shall establish WebSocket connections with dashboard clients for real-time updates
- **FR35:** The system shall broadcast events for: agent status changes, artifact updates, conflict detection, and phase progress changes
- **FR36:** The system shall automatically reconnect WebSocket connections if they are interrupted

---

### Non-Functional Requirements

**Performance:**

- **NFR1:** Dashboard initial page load shall complete in under 2 seconds for projects with up to 50 stories
- **NFR2:** Real-time updates shall be delivered to clients with less than 500ms latency from file change detection
- **NFR3:** File system change detection shall occur within 1 second of the actual file modification
- **NFR4:** The system shall support concurrent monitoring of 5-10 projects without performance degradation
- **NFR5:** The system shall handle 50+ file changes per second without dropped events

**Usability:**

- **NFR6:** First-time project setup shall be completable in under 5 minutes
- **NFR7:** The dashboard UI shall be intuitive enough for users to navigate without documentation
- **NFR8:** The system shall provide clear error messages when project configuration fails
- **NFR9:** The dashboard shall be accessible via modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)

**Reliability:**

- **NFR10:** The file watcher shall automatically recover from temporary file system access failures
- **NFR11:** WebSocket connections shall automatically reconnect on network interruptions
- **NFR12:** The system shall gracefully handle missing or malformed YAML front-matter in markdown files
- **NFR13:** The system shall not crash when monitoring directories with permission restrictions

**Scalability:**

- **NFR14:** The system architecture shall support future addition of new agent types beyond the core 6 BMAD agents
- **NFR15:** The conflict detection engine shall be extensible to support new conflict types beyond version mismatches

**Maintainability:**

- **NFR16:** All code shall be written in TypeScript with strict type checking (no `any` types)
- **NFR17:** The codebase shall maintain separation of concerns with clear module boundaries
- **NFR18:** The system shall include comprehensive inline documentation for complex logic

**Security:**

- **NFR19:** File system access shall be restricted to explicitly configured project directories
- **NFR20:** The system shall not expose file system paths outside of configured project roots via API endpoints

**Deployment:**

- **NFR21:** The application shall be deployable to Vercel with zero configuration changes
- **NFR22:** The system shall run on Windows, macOS, and Linux operating systems

---

## User Interface Design Goals

### Overall UX Vision

The JIVE Dashboard embodies a **"Mission Control"** aesthetic - providing at-a-glance situational awareness with actionable intelligence. The interface prioritizes real-time information density while maintaining clarity and preventing cognitive overload. Users should feel like they're observing a living system where agents are active participants, not passive tools. The UX emphasizes:

- **Ambient Awareness:** Users can glance at the dashboard and instantly understand project health without drilling into details
- **Progressive Disclosure:** High-level portfolio view → project detail view → artifact/agent detail panels
- **Real-Time Feedback:** Visual animations and indicators communicate system activity (pulsing agent cards, sliding story cards, conflict alerts)
- **Action-Oriented:** Every screen provides clear next actions (resolve conflict, view artifact, switch project)
- **Zero-Latency Feel:** WebSocket updates create the perception of instantaneous synchronization between file system and dashboard

### Key Interaction Paradigms

**1. Card-Based Navigation:**

- Portfolio uses project cards; project dashboard uses agent cards, artifact cards, and conflict cards
- Click card → drill into details (project card → project dashboard, agent card → activity log, artifact → content viewer)
- Cards use color-coding for status (green = completed, blue = running, yellow = idle, red = blocked/conflict)

**2. Live Activity Indicators:**

- Pulsing/animated borders on active agent cards
- "Recently Updated" badges on artifacts (last 5 minutes)
- Real-time timeline showing agent activity stream

**3. Split-Pane Architecture:**

- Left pane: Agent status cards (fixed)
- Right pane: Artifacts & conflicts (scrollable)
- Bottom tray (optional): Activity log / timeline

**4. Keyboard-First Workflows:**

- Quick switch between projects (Cmd/Ctrl + K → project switcher)
- Jump to agent (Cmd/Ctrl + 1-6 for each agent)
- Search artifacts (Cmd/Ctrl + P)

**5. Contextual Actions:**

- Hover over conflict → "View Details" / "Resolve" buttons appear
- Right-click artifact → "Open in Editor" / "View History"

### Core Screens and Views

**1. Portfolio Dashboard (Home)**

- Grid of project cards showing: project name, phase progress bar, agent count, story count, conflict count
- "Add Project" button (prominent in empty state, subtle when projects exist)
- Search/filter projects bar

**2. Project Dashboard (Main View)**

- Top: BMAD Phase Progress visualization (Build → Map → Analyze → Deploy)
- Left panel: 6 Agent status cards (Analyst, PM, Architect, SM, Dev, QA)
- Right panel: Artifact tree view with versions and "Recently Updated" highlights
- Conflict alerts section (expandable when conflicts detected)

**3. Agent Detail Modal/Panel**

- Agent name and current status
- Current task and artifact being worked on
- Context (what the agent is reading/writing)
- Activity log with timestamps
- Actions: Pause, View Logs, Notify (Phase 2)

**4. Artifact Detail Modal/Panel**

- Full artifact content rendered (markdown → HTML)
- Version history sidebar
- Dependency graph visualization (what depends on this artifact)
- Agent attribution (created by, last modified by)

**5. Conflict Resolution Screen**

- Side-by-side diff view showing version mismatches
- Affected artifacts list
- Suggested actions (Phase 1: manual resolution; Phase 2: auto-rebase)
- "Mark Resolved" button with comment field

**6. Settings/Configuration**

- Project management (add/remove project paths)
- File watcher settings (ignored paths, polling interval)
- Notification preferences
- Theme toggle (light/dark mode)

### Accessibility: WCAG AA

- Semantic HTML with proper heading hierarchy
- Keyboard navigation support (tab order, focus indicators)
- Color contrast ratios meeting WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- ARIA labels for interactive elements (agent cards, project cards, buttons)
- Screen reader announcements for real-time updates (e.g., "Developer agent started working on authentication story")
- Focus management in modals (trap focus, return focus on close)
- Alt text for all visual indicators (status colors have accompanying text labels)

**Assumption:** Full WCAG AAA compliance is deferred to Phase 2 based on user feedback and accessibility testing

### Branding

**Design Language:**

- **Modern Dev Tool Aesthetic:** Inspired by VS Code, Linear, and Vercel dashboard
- **Color Palette:**
  - Primary: Deep blue (#0070F3) for actions and highlights
  - Success: Green (#10B981) for completed agents/tasks
  - Warning: Yellow (#F59E0B) for idle states and warnings
  - Error: Red (#EF4444) for blocked agents and conflicts
  - Neutral: Gray scale (#111827 → #F9FAFB) for backgrounds and text
- **Typography:**
  - Headings: Inter (sans-serif, medium weight)
  - Body: Inter (regular weight)
  - Code/Monospace: JetBrains Mono (for file paths, version numbers)
- **Iconography:** Lucide Icons (consistent, minimal, developer-friendly)
- **Visual Effects:**
  - Subtle shadows for cards (elevation)
  - Smooth transitions (200-300ms) for state changes
  - Pulsing animations for active agents (avoid seizure triggers - slow pulse, 2-3 second cycle)

**Logo/Identity:**

- "JIVE" wordmark with tagline "Mission Control for BMAD"
- Icon: Stylized hexagon grid representing agent coordination (TBD - not critical for Phase 1)

**Assumption:** No existing brand guidelines; creating new brand identity for JIVE

### Target Device and Platforms: Web Responsive (Desktop-First)

**Primary Target: Desktop Browsers**

- Optimized for 1920x1080 and 2560x1440 resolutions
- Minimum supported: 1280x720
- Tested on: Chrome, Firefox, Safari, Edge (last 2 versions)

**Secondary Target: Tablet (Landscape)**

- Responsive layout for iPad Pro and similar (1024x768+)
- Simplified layout with collapsible side panels

**Tertiary Target: Mobile (View-Only)**

- Portfolio dashboard and basic project status viewable on mobile
- Full project dashboard requires desktop (complex layout, dense information)
- Minimum width: 375px (iPhone SE)

**Not Supported in Phase 1:**

- Mobile app (native iOS/Android)
- Offline mode (requires server connection for real-time updates)

**Assumption:** Primary users are developers working on desktop/laptop; mobile is nice-to-have for quick status checks

---

## Technical Assumptions

### Repository Structure: Monorepo

**Decision:** Single repository containing all code (frontend, backend, shared utilities)

**Rationale:**

- Simplifies coordination for solo/small team (1-2 developers per Project Brief)
- Next.js naturally supports monolithic structure (all code in one project)
- Easier dependency management (single `package.json`, one `node_modules`)
- Faster iteration (no cross-repo synchronization or versioning complexity)
- Suitable for Phase 1 scope (no microservices complexity needed)

**Structure:**

```
jive-dashboard/
├── app/                    # Next.js App Router pages & API routes
│   ├── (routes)/          # Frontend pages (portfolio, project, settings)
│   └── api/               # Backend API endpoints
├── components/            # React components (agent cards, artifact tree)
├── lib/                   # Utilities (file watcher, parsers, WebSocket)
├── types/                 # TypeScript type definitions
├── public/                # Static assets
├── .jive/                 # Local data storage
└── package.json
```

**Future Consideration:** Could split into separate repos (frontend, backend, plugins) if team scales beyond 5 developers or microservices architecture becomes necessary (Phase 2+)

### Service Architecture: Monolith

**Decision:** Next.js monolith handling both frontend and backend in a single deployment

**Components:**

1. **Frontend (React + Next.js App Router):**
   - Server-rendered pages for SEO and fast initial load
   - Client components for real-time interactions (WebSocket updates)
   - Tailwind CSS + shadcn/ui for styling

2. **Backend (Next.js API Routes):**
   - RESTful API endpoints (`/api/projects`, `/api/agents`, `/api/artifacts`)
   - WebSocket server for real-time updates (using Next.js custom server or Vercel's edge functions)
   - File watcher service (chokidar running in Node.js process)

3. **Data Layer (Phase 1: JSON files):**
   - Local `.jive/data.json` for project configuration and state
   - No database server required (file system is source of truth)
   - Migration path to PostgreSQL in Phase 2 when multi-user access required

**Rationale:**

- Matches Project Brief's explicit architecture decision ("Phase 1: Monolith")
- Simplest deployment model (single Vercel deployment)
- Sufficient for MVP scope (no cross-service communication overhead)
- Next.js optimized for this pattern (co-located API routes and frontend)
- Enables rapid iteration (no service orchestration complexity)

**Trade-offs:**

- Limited horizontal scaling (single Node.js process)
- File watcher and WebSocket tied to single server instance
- Acceptable for Phase 1 target: 5-10 projects, small team usage

**Phase 2 Migration Path:** Extract file watcher and conflict detection engine into separate services if load increases or multi-tenancy required

### Testing Requirements: Unit + Integration (no E2E for Phase 1)

**Testing Strategy:**

1. **Unit Tests (Vitest):**
   - Test individual functions: markdown parser, dependency graph builder, conflict detector
   - Target: 80%+ coverage for critical business logic
   - Fast feedback loop (run on every save)

2. **Integration Tests (Vitest + Playwright for API):**
   - Test API endpoints (`/api/projects`, `/api/artifacts`)
   - Test file watcher integration (mock file system events → verify WebSocket broadcasts)
   - Test conflict detection end-to-end (create artifacts → modify versions → assert conflicts detected)

3. **Component Tests (React Testing Library):**
   - Test UI components in isolation (agent card, artifact tree, conflict alert)
   - Test user interactions (click project card → navigate to detail view)

4. **Manual Testing:**
   - Real BMAD project integration testing (dogfooding with JIVE project itself)
   - Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
   - Performance testing (50 stories, 5-10 projects)

**Not in Phase 1:**

- ❌ Full E2E tests with Playwright (deferred to Phase 2 to avoid setup complexity and slow test execution)
- ❌ Visual regression testing (UI still evolving rapidly)
- ❌ Load testing (not necessary for single-team usage)

**Rationale:**

- Balances quality with velocity (6-week timeline)
- Focuses testing effort on high-risk areas (file watching, conflict detection)
- Unit + integration tests catch 90%+ of bugs without E2E overhead
- Manual testing sufficient for MVP with limited user base
- Component tests ensure UI reliability without full E2E complexity

**Phase 2 Addition:** Add Playwright E2E tests for critical user journeys once UI stabilizes

### Additional Technical Assumptions and Requests

**Languages & Frameworks:**

- **Primary Language:** TypeScript (strict mode, no `any` types per NFR16)
- **Frontend Framework:** React 18+ via Next.js 14 (App Router)
- **Styling:** Tailwind CSS v3+ with shadcn/ui component library
- **State Management:** React Context for global state + Zustand for complex client state (if needed)

**Key Libraries:**

- **File Watching:** `chokidar` (cross-platform, battle-tested, 18K+ GitHub stars)
- **Markdown Parsing:** `gray-matter` (front-matter extraction) + `marked` (markdown → HTML)
- **WebSocket:** Native WebSocket API (no Socket.io to reduce dependencies)
- **Icons:** Lucide React (consistent with modern dev tool aesthetic)
- **Date Handling:** `date-fns` (lightweight alternative to moment.js)

**Build & Development:**

- **Package Manager:** `pnpm` (fast, disk-efficient)
- **Build Tool:** Next.js built-in (Webpack/Turbopack)
- **Linting:** ESLint with TypeScript rules
- **Formatting:** Prettier (integrated with ESLint)
- **Git Hooks:** Husky + lint-staged (pre-commit linting)

**Deployment:**

- **Hosting:** Vercel (zero-config Next.js deployment, edge functions, automatic HTTPS)
- **Domain:** TBD (e.g., `jive-dashboard.vercel.app` or custom domain)
- **Environment Variables:** Stored in Vercel dashboard (no `.env` in git)
- **CI/CD:** Vercel automatic deployments on git push (no separate CI pipeline needed)

**Data Storage:**

- **Phase 1:** JSON files in `.jive/` directory (git-ignored, local-only)
- **Phase 2:** Migrate to PostgreSQL with Prisma ORM when multi-user or cloud persistence needed

**File Watching Configuration:**

- Watch paths: `docs/`, `src/`, `.bmad-core/` within each configured project
- Ignored paths: `node_modules/`, `.git/`, `.next/`, build artifacts
- Polling fallback: Enable for network drives or file systems without native watch support
- Debounce: 100ms to batch rapid file changes

**WebSocket Configuration:**

- Heartbeat/ping: 30-second interval to detect disconnections
- Reconnection strategy: Exponential backoff (1s, 2s, 4s, 8s, max 30s)
- Event types: `agent_status_changed`, `artifact_updated`, `conflict_detected`, `phase_progress_changed`

**Cross-Platform Considerations:**

- File paths: Use `path.join()` and `path.resolve()` (avoid hardcoded `/` or `\`)
- Line endings: Normalize to LF in git (`.gitattributes: * text=auto eol=lf`)
- File watching: Test on Windows (NTFS), macOS (APFS), Linux (ext4)

**Security:**

- File system access: Validate all paths are within configured project roots (prevent path traversal)
- API endpoints: No authentication in Phase 1 (local app), add in Phase 2 for cloud deployment
- CORS: Restricted to localhost in development, Vercel domain in production

**Performance Assumptions:**

- File watching: chokidar can handle 1000+ files per project without performance degradation
- WebSocket: Single Next.js server can handle 100+ concurrent WebSocket connections (sufficient for team usage)
- JSON parsing: Markdown files <100KB each (typical for PRDs/stories)

**Architect Guidance:**

- Prioritize simplicity and clarity over premature optimization
- Use TypeScript strictly (enable all strict compiler flags)
- Follow Next.js App Router conventions (Server Components by default, Client Components only when needed)
- Co-locate related code (components, types, utilities in same directory)
- Document complex logic with inline comments (especially file watcher and conflict detection)

---

## Epic List

### Proposed Epic Structure

**Epic 1: Core Infrastructure & Project Discovery**

- Goal: Establish Next.js application foundation with file system monitoring and basic project detection, delivering a deployable health-check page and single-project view.

**Epic 2: Multi-Project Portfolio Dashboard**

- Goal: Build portfolio management interface allowing users to add, view, and navigate between multiple BMAD projects from a unified dashboard.

**Epic 3: Real-Time Agent Status Monitoring**

- Goal: Implement agent activity tracking with real-time WebSocket updates, enabling users to see which agents (Analyst, PM, Architect, SM, Dev, QA) are working on which artifacts.

**Epic 4: Artifact Tracking & Version Management**

- Goal: Create artifact tree visualization with version tracking and dependency mapping, providing complete visibility into PRDs, architecture docs, and stories.

**Epic 5: Conflict Detection & Phase Progress Visualization**

- Goal: Implement proactive conflict detection for version mismatches and BMAD phase progress tracking, delivering mission-critical coordination intelligence.

---

## Epic 1: Core Infrastructure & Project Discovery

**Goal:** Establish Next.js application foundation with file system monitoring and basic project detection, delivering a deployable health-check page and single-project view.

**Business Value:** Provides the technical foundation for all other epics. Validates core architecture decisions (Next.js monolith, chokidar file watching) and de-risks deployment to Vercel early in the project timeline.

**Target Completion:** Week 1-2 (Sprint 1-2 of 6-week timeline)

---

### User Stories

**Story 1.1: Initialize Next.js Application**

```
As a Developer
I want a TypeScript Next.js 14 project with App Router initialized
So that I have a production-ready foundation with proper tooling and configuration

Acceptance Criteria:
✓ Next.js 14+ project created with TypeScript (strict mode)
✓ Tailwind CSS configured with shadcn/ui setup
✓ ESLint, Prettier, Husky pre-commit hooks configured
✓ pnpm as package manager with lockfile
✓ Basic project structure: /app, /components, /lib, /types
✓ README with setup instructions
✓ Deployable to Vercel with one click
```

**Story 1.2: Health Check & Environment Validation**

```
As a Developer
I want a /health API endpoint and basic landing page
So that I can validate deployment and monitor application uptime

Acceptance Criteria:
✓ GET /api/health returns 200 with { status: 'ok', version: '1.0.0', timestamp: ISO8601 }
✓ Landing page at / displays "JIVE Dashboard" and health status
✓ Environment variables documented (.env.example)
✓ Vercel deployment successful (production URL accessible)
```

**Story 1.3: File System Watcher Service**

```
As a System
I want to monitor a BMAD project directory for file changes using chokidar
So that I can detect agent activity in real-time

Acceptance Criteria:
✓ FileWatcherService class created in /lib/file-watcher.ts
✓ Watches configured directories (docs/, src/, .bmad-core/)
✓ Ignores node_modules/, .git/, .next/
✓ Emits events: file_created, file_modified, file_deleted
✓ Includes file path, timestamp, event type in emitted events
✓ Handles errors gracefully (missing directories, permission issues)
✓ Unit tests with mock file system (90%+ coverage)
```

**Story 1.4: BMAD Project Detection**

```
As a User
I want the system to detect if a directory is a valid BMAD project
So that only legitimate projects are monitored

Acceptance Criteria:
✓ detectBMADProject(path) function created
✓ Returns true if .bmad-core/ directory exists with core-config.yaml
✓ Parses core-config.yaml and extracts: prdFile, architectureFile, devStoryLocation
✓ Returns project metadata: name (from path), configPaths, detected: true/false
✓ Handles invalid YAML gracefully (returns detected: false)
✓ Unit tests covering valid projects, missing .bmad-core/, malformed YAML
```

**Story 1.5: Single Project Configuration**

```
As a User
I want to configure a single BMAD project path via environment variable
So that I can view basic project data on the dashboard (MVP)

Acceptance Criteria:
✓ JIVE_PROJECT_PATH environment variable in .env
✓ On server startup, validate path and detect BMAD project
✓ Store project config in-memory (singleton pattern for Phase 1)
✓ API endpoint GET /api/project returns: { name, path, detected, config }
✓ Error handling if path invalid or not a BMAD project
✓ Frontend page /project displays project name and config (read-only)
```

**Story 1.6: Markdown Front-Matter Parser**

```
As a System
I want to parse YAML front-matter from markdown files
So that I can extract bmad.version, bmad.createdBy, and other metadata

Acceptance Criteria:
✓ parseFrontMatter(filePath) function using gray-matter library
✓ Returns { frontMatter, content, filePath, lastModified }
✓ Extracts bmad.version, bmad.createdBy, bmad.updatedAt if present
✓ Handles files without front-matter (returns empty object)
✓ Handles malformed YAML (logs warning, returns empty object)
✓ Unit tests covering: valid YAML, no front-matter, malformed YAML, missing file
```

---

### Technical Implementation Notes

**Architecture Decisions:**

- **Singleton Pattern for FileWatcherService:** Phase 1 supports single project; service initialized once on server startup
- **Event-Driven Design:** File watcher emits events consumed by downstream services (artifact parser, agent detector)
- **In-Memory State:** No database; project config and file metadata stored in Node.js process memory (acceptable for single-user MVP)

**Key Dependencies:**

- `chokidar` (v3.5+): File system watcher
- `gray-matter` (v4.0+): YAML front-matter parsing
- `js-yaml` (v4.1+): YAML parsing for core-config.yaml

**File Structure:**

```
lib/
├── file-watcher.ts          # FileWatcherService class
├── bmad-detector.ts         # BMAD project detection logic
├── markdown-parser.ts       # Front-matter parsing utilities
└── project-config.ts        # In-memory project config singleton

app/
├── api/
│   ├── health/route.ts      # Health check endpoint
│   └── project/route.ts     # Single project metadata endpoint
└── project/
    └── page.tsx             # Basic project view page
```

**Testing Strategy:**

- Unit tests for all lib/ utilities (Vitest)
- Mock file system using `memfs` for file watcher tests
- Integration test: create temp directory → add .bmad-core/ → verify detection

**Risk Mitigation:**

- **File watcher performance:** Test with 500+ files to ensure <1s detection latency
- **Cross-platform:** Run tests on Windows, macOS, Linux CI pipelines
- **Vercel compatibility:** File watcher must work in Vercel serverless environment (may require alternative approach if not supported)

---

### Dependencies

**Blocks:**

- Epic 2 (Multi-Project Portfolio) - requires project detection logic
- Epic 3 (Agent Status) - requires file watcher infrastructure
- Epic 4 (Artifact Tracking) - requires front-matter parser

**Depends On:**

- None (foundational epic)

**External Dependencies:**

- Vercel account provisioned
- GitHub repo created
- Node.js 18+ installed locally

---

### Definition of Done

✅ All 6 user stories completed with acceptance criteria met
✅ Unit test coverage >80% for lib/ modules
✅ Application deployed to Vercel with public URL
✅ /health endpoint returns 200
✅ Single BMAD project detected and displayed on /project page
✅ File watcher successfully detects file changes in local testing
✅ Code reviewed and merged to main branch
✅ Documentation updated (README, setup guide)

---

**Effort Estimate:** 3-5 days (1 developer)
**Priority:** P0 (Critical Path)
**Assigned To:** TBD

---

## Epic 2: Multi-Project Portfolio Dashboard

**Goal:** Build portfolio management interface allowing users to add, view, and navigate between multiple BMAD projects from a unified dashboard.

**Business Value:** Enables the core value proposition of multi-project visibility. Transforms JIVE from single-project monitor to portfolio intelligence platform, directly addressing the "manage multiple projects efficiently" goal from the PRD.

**Target Completion:** Week 2-3 (Sprint 2-3 of 6-week timeline)

---

### User Stories

**Story 2.1: Portfolio Data Model & Persistence**

```
As a System
I want to persist multiple project configurations in a JSON file
So that user-added projects survive application restarts

Acceptance Criteria:
✓ Create .jive/projects.json in user's home directory (or configured location)
✓ Data structure: { projects: [{ id, name, path, addedAt, lastSeen }] }
✓ ProjectStore class with methods: addProject(), removeProject(), listProjects(), getProjectById()
✓ Atomic writes (write to temp file → rename) to prevent corruption
✓ Migration: Convert JIVE_PROJECT_PATH env var to first project in projects.json
✓ Unit tests for ProjectStore (add, remove, list, concurrent access)
```

**Story 2.2: Add Project Flow (UI)**

```
As a User
I want to add a new BMAD project by specifying its root path
So that I can monitor multiple projects from one dashboard

Acceptance Criteria:
✓ Portfolio page (/) has "Add Project" button (prominent if empty state)
✓ Click opens modal/dialog with path input field
✓ Path input supports: manual typing, file picker (browser limitations noted), paste from clipboard
✓ Validates path on input: checks if directory exists and contains .bmad-core/
✓ Shows validation error if invalid: "Not a valid BMAD project" or "Path does not exist"
✓ On successful add: project appears in portfolio grid, modal closes
✓ Duplicate prevention: cannot add same path twice (shows error)
```

**Story 2.3: Portfolio Grid View**

```
As a User
I want to see all my BMAD projects in a grid of cards
So that I can quickly assess status across my portfolio

Acceptance Criteria:
✓ Portfolio page displays responsive grid (3 columns desktop, 2 tablet, 1 mobile)
✓ Each project card shows:
  - Project name (derived from directory name, e.g., "jive-dashboard")
  - Current BMAD phase (BUILD/MAP/ANALYZE/DEPLOY with color coding)
  - Agent count (e.g., "3 agents active")
  - Story count (e.g., "12 stories")
  - Conflict count (e.g., "2 conflicts" in red if >0)
✓ Empty state: "No projects yet. Add your first BMAD project to get started."
✓ Cards use design system colors (green=healthy, yellow=warnings, red=conflicts)
✓ Cards have hover effect (slight elevation, cursor pointer)
```

**Story 2.4: Navigate to Project Detail**

```
As a User
I want to click a project card to view its detailed dashboard
So that I can drill into agent activity and artifacts

Acceptance Criteria:
✓ Click project card navigates to /project/[projectId]
✓ URL includes project ID (e.g., /project/abc123)
✓ Project detail page displays: project name in header, back button to portfolio
✓ Placeholder content in Phase 1: "Project Dashboard - Agent Status Coming in Epic 3"
✓ Browser back button returns to portfolio view
✓ 404 page if projectId invalid or project not found
```

**Story 2.5: Remove Project**

```
As a User
I want to remove a project from my portfolio
So that I can clean up projects I'm no longer monitoring

Acceptance Criteria:
✓ Project card has "Remove" button (icon button, visible on hover or in card menu)
✓ Click shows confirmation dialog: "Remove [project name]? This will not delete any files."
✓ On confirm: project removed from projects.json and disappears from grid
✓ On cancel: dialog closes, no action taken
✓ API endpoint DELETE /api/projects/[id] handles removal
✓ Cannot remove last project (must have at least one - or allow empty state)
```

**Story 2.6: Portfolio Metadata & Statistics**

```
As a System
I want to calculate portfolio-wide statistics for each project card
So that users see actionable metrics in the portfolio view

Acceptance Criteria:
✓ For each project, scan files to calculate:
  - Agent count: count unique agents with activity in last 24 hours (stub: return 0 for Phase 1)
  - Story count: count .md files in devStoryLocation directory
  - Conflict count: run conflict detection (stub: return 0 for Phase 1)
  - Current phase: determine from phase progress logic (stub: return "BUILD" for Phase 1)
✓ API endpoint GET /api/projects returns array with enriched metadata
✓ Calculation runs async on page load (shows loading spinner if >1s)
✓ Cache results for 5 seconds to prevent excessive file system scans
```

---

### Technical Implementation Notes

**Architecture Decisions:**

- **Local JSON Storage:** Use `.jive/projects.json` in user's home directory for simplicity (no database setup required)
- **Incremental Feature Rollout:** Agent count, conflict count, and phase detection return stub values (0 or "BUILD") in Epic 2; actual implementation comes in Epic 3-5
- **Client-Side Navigation:** Use Next.js App Router with dynamic routes (`/project/[projectId]`)

**Key Dependencies:**

- `fs-extra` (v11.0+): Enhanced file system operations with promise support
- `uuid` (v9.0+): Generate unique project IDs

**File Structure:**

```
lib/
├── project-store.ts         # ProjectStore class (CRUD operations)
├── portfolio-stats.ts       # Portfolio statistics calculation (stubs for Phase 1)
└── paths.ts                 # Path utilities (home directory, .jive location)

app/
├── page.tsx                 # Portfolio dashboard (grid view)
├── project/[projectId]/
│   └── page.tsx             # Project detail page (placeholder in Phase 1)
└── api/
    └── projects/
        ├── route.ts         # GET (list), POST (add)
        └── [id]/
            └── route.ts     # GET (single), DELETE (remove)

components/
├── project-card.tsx         # Project card component
├── add-project-modal.tsx    # Add project dialog
└── empty-state.tsx          # Empty portfolio state
```

**Testing Strategy:**

- Unit tests for ProjectStore (mock file system)
- Integration test: Add project via API → verify in projects.json → list projects → remove → verify deleted
- Component tests: Render project card with mock data → verify metrics display
- Manual test: Add real BMAD project (e.g., JIVE itself) → verify story count accurate

**Risk Mitigation:**

- **File system permissions:** Handle cases where .jive/ directory cannot be created (show error, fallback to temp directory)
- **Large project count:** Test with 20+ projects to ensure grid renders performantly
- **Path resolution:** Use absolute paths only (resolve relative paths on input)

---

### Dependencies

**Blocks:**

- Epic 3 (Agent Status) - needs project selection context
- Epic 4 (Artifact Tracking) - needs project selection context
- Epic 5 (Conflict Detection) - needs portfolio-wide conflict aggregation

**Depends On:**

- Epic 1: BMAD project detection (detectBMADProject function)
- Epic 1: Project configuration parsing (core-config.yaml parsing)

**External Dependencies:**

- None (builds on Epic 1 foundation)

---

### Definition of Done

✅ All 6 user stories completed with acceptance criteria met
✅ User can add 3+ BMAD projects via UI
✅ Portfolio grid displays all projects with accurate story counts
✅ User can navigate to project detail page and back
✅ User can remove projects with confirmation
✅ projects.json persists data across application restarts
✅ Unit test coverage >80% for ProjectStore
✅ Integration tests validate full add/remove flow
✅ Code reviewed and merged to main branch
✅ Feature deployed to Vercel (production URL)

---

**Effort Estimate:** 3-4 days (1 developer)
**Priority:** P0 (Critical Path)
**Assigned To:** TBD

---

## Epic 3: Real-Time Agent Status Monitoring

**Goal:** Implement agent activity tracking with real-time WebSocket updates, enabling users to see which agents (Analyst, PM, Architect, SM, Dev, QA) are working on which artifacts.

**Business Value:** Delivers the core "visibility into agent activity" value proposition. This epic transforms JIVE from a static dashboard into a live mission control center, enabling users to instantly see what agents are doing and detect coordination issues as they happen.

**Target Completion:** Week 3-4 (Sprint 3-4 of 6-week timeline)

---

### User Stories

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

### Technical Implementation Notes

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

### Dependencies

**Blocks:**

- Epic 4 (Artifact Tracking) - can leverage agent activity data (e.g., "Dev last modified this artifact")
- Epic 5 (Conflict Detection) - can use agent activity to trigger conflict checks

**Depends On:**

- Epic 1: FileWatcherService (file change events)
- Epic 2: Project selection (projectId context for filtering events)

**External Dependencies:**

- None (WebSocket library is standard npm package)

---

### Definition of Done

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

## Epic 4: Artifact Tracking & Version Management

**Goal:** Create artifact tree visualization with version tracking and dependency mapping, providing complete visibility into PRDs, architecture docs, and stories.

**Business Value:** Enables the "artifact version tracking" value proposition. This epic provides the critical data layer that powers conflict detection (Epic 5) and gives users visibility into what artifacts exist, who created them, and what versions are in play.

**Target Completion:** Week 4-5 (Sprint 4-5 of 6-week timeline)

---

### User Stories

**Story 4.1: Artifact Discovery & Scanning**

```
As a System
I want to scan all markdown files in a project's docs/ directory
So that I can build a complete inventory of PRDs, architecture docs, and stories

Acceptance Criteria:
✓ ArtifactScanner class created in /lib/artifact-scanner.ts
✓ Scans configured directories from core-config.yaml:
  - prdFile (e.g., docs/prd.md)
  - prdShardedLocation (e.g., docs/prd/*.md)
  - architectureFile (e.g., docs/architecture.md)
  - architectureShardedLocation (e.g., docs/architecture/*.md)
  - devStoryLocation (e.g., docs/stories/*.md)
  - qaLocation (e.g., docs/qa/*.md)
✓ Returns list of artifacts: { id, path, type, name, lastModified }
✓ Type classification: PRD, ARCHITECTURE, STORY, QA, OTHER
✓ Ignores non-markdown files and common metadata files (README.md, CHANGELOG.md)
✓ Handles missing directories gracefully (returns empty array)
✓ Unit tests with mock file system and various project structures
```

**Story 4.2: YAML Front-Matter Extraction & Artifact Metadata**

```
As a System
I want to parse YAML front-matter from each artifact
So that I can extract version numbers, authorship, and dependencies

Acceptance Criteria:
✓ Extends parseFrontMatter() from Epic 1 to extract BMAD-specific fields:
  - bmad.version (e.g., "v4", "1.2.3")
  - bmad.createdBy (e.g., "PM", "Architect")
  - bmad.createdAt (ISO8601 timestamp)
  - bmad.updatedAt (ISO8601 timestamp)
  - bmad.dependencies (array of artifact references: ["docs/architecture.md@v3"])
✓ ArtifactMetadata type: { version, createdBy, createdAt, updatedAt, dependencies }
✓ Handles missing front-matter fields (returns null/undefined)
✓ Handles legacy version formats (e.g., "v1.0" vs "1.0")
✓ Unit tests covering: valid BMAD front-matter, partial fields, no front-matter
```

**Story 4.3: Artifact Tree Data Structure**

```
As a System
I want to organize artifacts into a hierarchical tree structure
So that I can display them in a navigable tree view UI

Acceptance Criteria:
✓ ArtifactTree class with methods: buildTree(artifacts), getNode(path), addArtifact(), removeArtifact()
✓ Tree structure:
  - Root: Project name
  - Level 1: Artifact categories (PRDs, Architecture, Stories, QA)
  - Level 2+: Individual files or sharded directories
✓ Example tree:
  docs/
  ├── PRDs/
  │   ├── prd.md (v4)
  │   └── prd/ (sharded)
  │       ├── goals.md
  │       └── requirements.md
  ├── Architecture/
  │   ├── architecture.md (v4)
  │   └── architecture/ (sharded)
  │       ├── tech-stack.md
  │       └── coding-standards.md
  └── Stories/
      ├── story-1-authentication.md (v1)
      └── story-2-dashboard.md (v1)
✓ Nodes include: path, name, type, version, childCount, isExpanded
✓ Unit tests covering: flat structure, deeply nested, sharded vs monolithic
```

**Story 4.4: Artifact Tree UI Component**

```
As a User
I want to see all project artifacts in a collapsible tree view
So that I can navigate and explore project documentation

Acceptance Criteria:
✓ Artifact tree component displayed in right panel of project dashboard
✓ Tree uses shadcn/ui Accordion or custom tree component
✓ Each node shows:
  - Icon based on type (📋 PRD, 🏗️ Architecture, 📖 Story, ✅ QA)
  - File/folder name (truncated if long)
  - Version badge (if bmad.version exists)
  - "Recently Updated" indicator (if modified <5 minutes ago)
✓ Click folder node → expand/collapse children
✓ Click file node → open artifact detail modal/panel
✓ Keyboard navigation: arrow keys to navigate, Enter to expand/open
✓ Search/filter input at top: filter by name or type
✓ Empty state: "No artifacts found. Create PRD or stories to get started."
```

**Story 4.5: Artifact Detail View**

```
As a User
I want to click an artifact to view its full content and metadata
So that I can read PRDs, stories, and architecture docs without leaving the dashboard

Acceptance Criteria:
✓ Click artifact in tree → opens detail panel (modal or slide-in panel from right)
✓ Detail panel displays:
  - Artifact name (full path in breadcrumb format: docs/prd/goals.md)
  - Version badge (prominently displayed)
  - Created by (agent name with icon)
  - Last updated (absolute timestamp: "Jan 15, 2025 3:45 PM")
  - Markdown content rendered as HTML (using marked library)
  - "Open in Editor" button (opens file in system default or VS Code if configured)
✓ Supports markdown features: headings, lists, code blocks, tables, links
✓ Code blocks have syntax highlighting (using highlight.js or Prism)
✓ Close button or click outside to dismiss panel
✓ Browser back button closes panel and returns to tree view
```

**Story 4.6: Recently Updated Artifacts Indicator**

```
As a System
I want to highlight artifacts modified in the last 5 minutes
So that users can quickly see what agents have been working on

Acceptance Criteria:
✓ File watcher integration: on file_modified event → mark artifact as "recently updated"
✓ Recently updated artifacts show visual indicator:
  - Pulsing dot or badge (green/blue color)
  - "Updated 2 min ago" label
  - Highlight background in tree (subtle color change)
✓ Indicator disappears after 5 minutes (background timer clears flag)
✓ WebSocket broadcasts artifact_updated event to connected clients
✓ Frontend updates tree view in real-time when event received
✓ Unit tests for timing logic (mark updated, auto-clear after 5min)
```

**Story 4.7: Dependency Graph Parsing**

```
As a System
I want to extract artifact dependencies from front-matter
So that I can detect when artifacts reference outdated versions (Epic 5)

Acceptance Criteria:
✓ DependencyGraphBuilder class created in /lib/dependency-graph.ts
✓ Parses bmad.dependencies from artifact front-matter:
  - Format: ["docs/architecture.md@v3", "docs/stories/story-1.md@v1"]
  - Alternative format: [{ path: "docs/architecture.md", version: "v3" }]
✓ Builds directed graph: nodes = artifacts, edges = dependency relationships
✓ Graph methods: getDependencies(artifactPath), getDependents(artifactPath)
✓ Example: Story 1 depends on Architecture v3 → edge from Story 1 to Architecture
✓ Handles circular dependencies (logs warning but doesn't crash)
✓ Handles missing dependencies (artifact references non-existent file)
✓ Unit tests with mock artifacts and various dependency patterns
```

**Story 4.8: Artifact API Endpoints**

```
As a Developer
I want REST API endpoints to retrieve artifact data
So that the frontend can fetch artifacts and metadata

Acceptance Criteria:
✓ GET /api/projects/[id]/artifacts → returns array of all artifacts with metadata
✓ GET /api/projects/[id]/artifacts/tree → returns hierarchical tree structure
✓ GET /api/projects/[id]/artifacts/[artifactId] → returns single artifact with full content
✓ Response includes: id, path, name, type, version, createdBy, lastModified, content, dependencies
✓ Supports query params: ?type=STORY (filter by type), ?recentlyUpdated=true
✓ Error handling: 404 if artifact not found, 400 if invalid project ID
✓ Integration tests: scan real BMAD project → fetch artifacts → verify response structure
```

---

### Technical Implementation Notes

**Architecture Decisions:**

- **File System as Source of Truth:** Artifact data read directly from file system on demand (no database duplication in Phase 1)
- **Lazy Loading:** Tree structure built on page load; full content loaded only when artifact opened (performance optimization)
- **Version Extraction:** Support multiple version formats (v1, 1.0, 1.0.0) with normalization to semver-like format
- **Dependency Format:** Flexible parsing to support both string and object formats in YAML

**Key Dependencies:**

- `marked` (v9.0+): Markdown to HTML rendering
- `highlight.js` (v11.0+): Syntax highlighting for code blocks
- `semver` (v7.5+): Version parsing and comparison (optional for advanced version logic)

**File Structure:**

```
lib/
├── artifact-scanner.ts      # Scan file system for artifacts
├── artifact-metadata.ts     # Parse front-matter and extract metadata
├── artifact-tree.ts         # Build hierarchical tree structure
├── dependency-graph.ts      # Parse and build dependency graph
└── markdown-renderer.ts     # Render markdown with syntax highlighting

app/
└── api/
    └── projects/
        └── [id]/
            └── artifacts/
                ├── route.ts       # GET (list)
                ├── tree/
                │   └── route.ts   # GET (tree structure)
                └── [artifactId]/
                    └── route.ts   # GET (single artifact)

components/
├── artifact-tree.tsx        # Tree view component
├── artifact-node.tsx        # Individual tree node
├── artifact-detail.tsx      # Detail panel/modal
├── artifact-search.tsx      # Search/filter input
└── markdown-viewer.tsx      # Rendered markdown display
```

**Testing Strategy:**

- Unit tests: Artifact scanner with mock file system, dependency graph builder
- Integration tests: Scan real BMAD project (JIVE itself) → verify artifact count, version extraction
- Component tests: Render tree with mock data → expand/collapse → verify UI state
- Manual tests: Open artifact detail → verify markdown rendering, syntax highlighting

**Risk Mitigation:**

- **Large Projects:** Test with 100+ artifacts to ensure tree rendering performs well (virtualize tree if needed)
- **Malformed YAML:** Gracefully handle invalid front-matter without crashing (log warning, show artifact anyway)
- **Version Mismatch Detection:** Foundation for Epic 5 conflict detection (dependency graph must be accurate)

**Performance Considerations:**

- Artifact scanning: O(n) where n = number of markdown files (acceptable for <500 files)
- Tree rendering: Use React virtualization if >100 visible nodes
- Content loading: Fetch full markdown content only on artifact open (not on tree load)

**UI/UX Considerations:**

- Tree should persist expand/collapse state in session storage (survive page refresh)
- Recently updated indicator should be subtle (not distracting if many updates)
- Artifact detail panel should support keyboard shortcuts (Esc to close, arrow keys to navigate)

---

### Dependencies

**Blocks:**

- Epic 5 (Conflict Detection) - requires dependency graph and version tracking

**Depends On:**

- Epic 1: Markdown front-matter parser (parseFrontMatter function)
- Epic 1: File watcher (detects artifact changes for "recently updated" indicator)
- Epic 2: Project selection (projectId context)
- Epic 3: WebSocket infrastructure (broadcasts artifact_updated events)

**External Dependencies:**

- None (markdown and highlighting libraries are standard npm packages)

---

### Definition of Done

✅ All 8 user stories completed with acceptance criteria met
✅ Artifact tree displays all PRDs, architecture docs, and stories for a project
✅ User can expand/collapse tree nodes and navigate hierarchy
✅ User can click artifact to view full content with rendered markdown
✅ Version badges display for artifacts with bmad.version front-matter
✅ Recently updated indicator appears and auto-clears after 5 minutes
✅ Dependency graph correctly parses bmad.dependencies references
✅ API endpoints return artifact data with proper error handling
✅ Unit test coverage >80% for scanner, tree builder, dependency graph
✅ Integration test validates scanning real BMAD project
✅ Markdown rendering supports code syntax highlighting
✅ Code reviewed and merged to main branch
✅ Feature deployed to Vercel

---

**Effort Estimate:** 4-5 days (1 developer)
**Priority:** P0 (Critical Path)
**Assigned To:** TBD

---

## Epic 5: Conflict Detection & Phase Progress Visualization

**Goal:** Implement proactive conflict detection for version mismatches and BMAD phase progress tracking, delivering mission-critical coordination intelligence.

**Business Value:** Delivers the killer feature that differentiates JIVE from all competitors: proactive conflict detection that prevents agents from working against stale artifacts. This epic addresses the core problem from the background context (e.g., "Dev implementing features based on v2 architecture while Architect has updated to v4"). Combined with phase progress tracking, it provides complete situational awareness for multi-agent workflows.

**Target Completion:** Week 5-6 (Sprint 5-6 of 6-week timeline)

---

### User Stories

**Story 5.1: Version Mismatch Detection Engine**

```
As a System
I want to detect when an artifact references an outdated version of its dependency
So that I can alert users before agents waste time on stale information

Acceptance Criteria:
✓ ConflictDetector class created in /lib/conflict-detector.ts
✓ Analyzes dependency graph from Epic 4 to find version mismatches
✓ For each artifact with dependencies:
  - Extract referenced version from bmad.dependencies (e.g., "docs/architecture.md@v3")
  - Compare to current version in dependency artifact's front-matter
  - If referenced version < current version → version mismatch conflict
✓ Conflict severity classification:
  - CRITICAL: Major version mismatch (v2 vs v4 = 2 versions behind)
  - WARNING: Minor version mismatch (v3 vs v4 = 1 version behind)
  - INFO: Patch version mismatch (v4.0 vs v4.1)
✓ Generates conflict objects: { id, type, severity, affectedArtifacts, message, detectedAt }
✓ Example conflict: "Story 1 references Architecture v2, but current is v4"
✓ Unit tests covering: no conflicts, single mismatch, multiple mismatches, circular dependencies
```

**Story 5.2: Concurrent Edit Detection**

```
As a System
I want to detect when multiple agents are modifying the same artifact simultaneously
So that users can coordinate and prevent merge conflicts

Acceptance Criteria:
✓ Tracks agent activity from Epic 3 (agent status store)
✓ Detects concurrent edits: 2+ agents marked RUNNING on same artifact within 60-second window
✓ Example: Dev and Architect both editing docs/architecture/tech-stack.md
✓ Creates conflict: { type: 'concurrent-edit', severity: 'WARNING', agents: ['Dev', 'Architect'], artifact: 'docs/architecture/tech-stack.md' }
✓ Message: "Dev and Architect are both editing tech-stack.md - coordinate to avoid conflicts"
✓ Auto-resolves when one agent becomes IDLE (conflict disappears)
✓ Unit tests with mock agent status updates
```

**Story 5.3: Broken Dependency Detection**

```
As a System
I want to detect when an artifact references a dependency that no longer exists
So that users can fix broken references

Acceptance Criteria:
✓ Analyzes dependency graph for missing dependencies
✓ Example: Story references "docs/architecture/old-design.md@v1" but file deleted
✓ Creates conflict: { type: 'dependency-broken', severity: 'CRITICAL', affectedArtifacts: ['docs/stories/story-1.md'], missingDependency: 'docs/architecture/old-design.md' }
✓ Message: "Story 1 references missing file: old-design.md"
✓ Unit tests covering: deleted files, renamed files, moved directories
```

**Story 5.4: Conflict Cards UI**

```
As a User
I want to see conflict alerts prominently on the project dashboard
So that I can address coordination issues immediately

Acceptance Criteria:
✓ Conflict section displayed on project dashboard (above or below agent cards)
✓ Shows count badge: "2 Conflicts Detected" (red if CRITICAL, yellow if WARNING, blue if INFO)
✓ Expandable accordion: click to show/hide conflict details
✓ Each conflict card displays:
  - Severity badge (CRITICAL/WARNING/INFO with color coding)
  - Conflict type icon (🔀 version mismatch, ⚠️ concurrent edit, 🔗 broken dependency)
  - Descriptive message (human-readable)
  - Affected artifacts (clickable links to artifact detail)
  - Involved agents (if applicable)
  - "Detected 5 min ago" timestamp
  - "Mark Resolved" button
✓ Empty state: "✅ No conflicts detected" (green checkmark, positive message)
✓ Conflicts sorted by severity (CRITICAL first, then WARNING, then INFO)
```

**Story 5.5: Conflict Resolution Flow**

```
As a User
I want to manually mark conflicts as resolved
So that I can track which issues I've addressed

Acceptance Criteria:
✓ "Mark Resolved" button on each conflict card
✓ Click → confirmation dialog: "Mark this conflict as resolved? This will hide the alert."
✓ On confirm:
  - Conflict removed from active conflicts list
  - Logged in conflict history: { conflictId, resolvedAt, resolvedBy: 'manual' }
  - WebSocket broadcasts conflict_resolved event to all clients
✓ Conflict history viewable in settings/logs (Phase 2: full history; Phase 1: last 20 resolved)
✓ Auto-resolution: If underlying issue fixed (e.g., version updated), conflict auto-resolves without manual action
✓ Unit tests for manual and auto-resolution logic
```

**Story 5.6: Real-Time Conflict Detection**

```
As a System
I want to run conflict detection on every artifact change
So that conflicts are detected immediately as they occur

Acceptance Criteria:
✓ File watcher integration: on file_modified event → trigger conflict detection
✓ Debounced execution: run detection max once per 5 seconds (batch multiple rapid changes)
✓ Conflict detection runs asynchronously (doesn't block file watcher)
✓ On new conflict detected:
  - Add to ConflictStore (in-memory state)
  - Broadcast conflict_detected event via WebSocket
  - Frontend displays new conflict card in real-time
✓ On conflict resolved (version updated):
  - Remove from ConflictStore
  - Broadcast conflict_resolved event
  - Frontend removes conflict card
✓ Performance: conflict detection completes in <500ms for projects with 50+ artifacts
```

**Story 5.7: BMAD Phase Progress Calculation**

```
As a System
I want to calculate completion percentage for each BMAD phase (Build, Map, Analyze, Deploy)
So that users can see high-level project progress

Acceptance Criteria:
✓ PhaseProgressCalculator class created in /lib/phase-progress.ts
✓ Phase progress rules:
  - BUILD (25%): PRD exists + PRD has version
  - MAP (25%): Architecture doc exists + 3+ stories created
  - ANALYZE (25%): Code files exist in src/ + test files exist
  - DEPLOY (25%): QA docs exist + deployment config exists (e.g., vercel.json)
✓ Returns: { build: 100, map: 75, analyze: 50, deploy: 0, currentPhase: 'ANALYZE' }
✓ Current phase = first incomplete phase (or DEPLOY if all complete)
✓ Calculation runs on project load and after artifact changes
✓ Unit tests covering: new project (0%), partially complete, fully complete (100% all phases)
```

**Story 5.8: Phase Progress Visualization UI**

```
As a User
I want to see BMAD phase progress at the top of the project dashboard
So that I can quickly understand overall project maturity

Acceptance Criteria:
✓ Phase progress component displayed at top of project dashboard (above agent cards)
✓ Visual design: horizontal progress bar or 4-step wizard/stepper component
✓ Shows all 4 phases: BUILD → MAP → ANALYZE → DEPLOY
✓ Each phase displays:
  - Phase name
  - Completion percentage (e.g., "BUILD: 100%")
  - Status indicator: ✅ complete (green), 🔄 in progress (blue), ⭕ not started (gray)
  - Current phase highlighted (bold, larger, or animated pulse)
✓ Hover over phase → tooltip with completion criteria and what's missing
✓ Example tooltip: "MAP Phase (75%): ✅ Architecture doc, ✅ 3+ stories, ⚠️ Missing epic definitions"
✓ Mobile responsive: stacks vertically or uses compact layout
```

**Story 5.9: Portfolio-Wide Conflict Aggregation**

```
As a User
I want to see total conflict count for each project in the portfolio view
So that I can prioritize which projects need attention

Acceptance Criteria:
✓ Portfolio project cards show conflict count badge (from Epic 2, now with real data)
✓ Conflict count aggregated per project: sum of all active conflicts
✓ Badge color: red if any CRITICAL conflicts, yellow if only WARNING/INFO
✓ Click project card with conflicts → navigate to project dashboard → conflicts section auto-expanded
✓ Portfolio API endpoint includes conflict count: GET /api/projects returns [{ id, name, conflictCount, criticalConflictCount, ... }]
✓ Conflicts recalculated on portfolio page load (cached for 10 seconds)
```

**Story 5.10: Conflict Detection API Endpoints**

```
As a Developer
I want REST API endpoints to retrieve conflicts and trigger detection
So that the frontend can display conflicts and manually refresh

Acceptance Criteria:
✓ GET /api/projects/[id]/conflicts → returns array of active conflicts
✓ POST /api/projects/[id]/conflicts/detect → manually triggers conflict detection (returns results)
✓ POST /api/projects/[id]/conflicts/[conflictId]/resolve → marks conflict as resolved
✓ Response format: { id, type, severity, message, affectedArtifacts, agents, detectedAt }
✓ Error handling: 404 if project not found, 400 if invalid conflict ID
✓ Integration tests: create version mismatch → detect via API → resolve → verify removed
```

---

### Technical Implementation Notes

**Architecture Decisions:**

- **Proactive Detection:** Run conflict detection on every file change (vs periodic polling) for instant feedback
- **In-Memory Conflict Store:** Conflicts stored in Node.js memory (ephemeral, recalculated on restart - acceptable for Phase 1)
- **Heuristic Phase Progress:** Use simple artifact presence checks (vs complex parsing of artifact content) for MVP speed
- **Auto-Resolution:** Conflicts automatically removed when underlying issue fixed (e.g., version updated, concurrent edit ended)

**Key Dependencies:**

- `semver` (v7.5+): Version comparison for mismatch detection
- No additional external dependencies (leverages existing libraries)

**File Structure:**

```
lib/
├── conflict-detector.ts     # Version mismatch, concurrent edit, broken dependency detection
├── conflict-store.ts        # In-memory conflict state management
├── phase-progress.ts        # BMAD phase progress calculation
└── conflict-resolver.ts     # Manual and auto-resolution logic

app/
└── api/
    └── projects/
        └── [id]/
            └── conflicts/
                ├── route.ts           # GET (list), POST (detect)
                ├── detect/
                │   └── route.ts       # POST (manual trigger)
                └── [conflictId]/
                    └── resolve/
                        └── route.ts   # POST (resolve)

components/
├── conflict-section.tsx     # Conflict cards container
├── conflict-card.tsx        # Individual conflict card
├── phase-progress.tsx       # Phase progress visualization
└── phase-tooltip.tsx        # Phase completion tooltip
```

**Testing Strategy:**

- Unit tests: ConflictDetector with mock dependency graph, various version mismatch scenarios
- Integration tests: Create artifacts with version mismatches → detect conflicts → update version → verify auto-resolution
- Component tests: Render conflict cards with mock data → verify severity colors, click "Mark Resolved"
- Manual tests: Real BMAD project (JIVE) → create version mismatch (edit story dependency) → verify conflict detected in <5s

**Risk Mitigation:**

- **False Positives:** Overly sensitive detection (e.g., patch version mismatch triggers CRITICAL). Mitigation: Tune severity thresholds based on user feedback
- **Performance:** Conflict detection on large projects (100+ artifacts) may slow down. Mitigation: Run asynchronously, cache dependency graph, debounce execution
- **Version Format Variations:** Different projects may use inconsistent version formats (v1, 1.0, version-1). Mitigation: Normalize versions using semver library, fallback to string comparison

**Performance Considerations:**

- Conflict detection: O(E) where E = edges in dependency graph (acceptable for <500 dependencies)
- Phase progress calculation: O(n) where n = number of artifacts (runs once per file change, acceptable)
- WebSocket broadcast: Only send conflict_detected/resolved events to clients viewing affected project (filter by projectId)

**UI/UX Considerations:**

- Conflicts should be visually prominent but not alarming (avoid red everywhere - use thoughtfully)
- Empty state ("No conflicts") should feel positive and reassuring, not just absence of errors
- Phase progress should be aspirational (show what's next) not just a status indicator
- Auto-resolution should provide feedback (toast notification: "Conflict auto-resolved: Story 1 now references Architecture v4")

---

### Dependencies

**Blocks:**

- None (final epic in Phase 1)

**Depends On:**

- Epic 1: File watcher (triggers conflict detection on file changes)
- Epic 2: Project selection (projectId context)
- Epic 3: Agent status store (detects concurrent edits)
- Epic 4: Dependency graph (analyzes version mismatches), artifact metadata (versions)

**External Dependencies:**

- None (semver already included for version comparison)

---

### Definition of Done

✅ All 10 user stories completed with acceptance criteria met
✅ Version mismatch conflicts detected when artifact references outdated dependency
✅ Concurrent edit conflicts detected when 2+ agents edit same file
✅ Broken dependency conflicts detected when referenced file missing
✅ Conflict cards display on project dashboard with severity, type, message, affected artifacts
✅ User can manually mark conflicts as resolved
✅ Conflicts auto-resolve when underlying issue fixed (e.g., version updated)
✅ Real-time conflict detection runs on file changes (<5s latency)
✅ BMAD phase progress (BUILD, MAP, ANALYZE, DEPLOY) calculated and displayed
✅ Phase progress visualization shows current phase and completion percentages
✅ Portfolio view shows conflict count per project
✅ Unit test coverage >80% for conflict detection and phase progress logic
✅ Integration test validates end-to-end: create mismatch → detect conflict → resolve → verify removed
✅ Manual testing with real BMAD project confirms accuracy and performance
✅ Code reviewed and merged to main branch
✅ Feature deployed to Vercel

---

**Effort Estimate:** 5-6 days (1 developer)
**Priority:** P0 (Critical Path - Killer Feature)
**Assigned To:** TBD

---

## PRD Status: COMPLETE ✅

All 5 epics defined with detailed user stories, acceptance criteria, technical implementation notes, dependencies, and definition of done. Ready for development kickoff.

**Next Steps:**

1. Review PRD with stakeholders for approval
2. Create epic tracking in project management tool (Jira, Linear, GitHub Projects)
3. Break down stories into tasks and estimate effort
4. Begin Sprint 1: Epic 1 (Core Infrastructure & Project Discovery)
5. Schedule weekly sync meetings for progress tracking and blockers

---
