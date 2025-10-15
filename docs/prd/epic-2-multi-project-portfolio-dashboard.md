# Epic 2: Multi-Project Portfolio Dashboard

**Goal:** Build portfolio management interface allowing users to add, view, and navigate between multiple BMAD projects from a unified dashboard.

**Business Value:** Enables the core value proposition of multi-project visibility. Transforms JIVE from single-project monitor to portfolio intelligence platform, directly addressing the "manage multiple projects efficiently" goal from the PRD.

**Target Completion:** Week 2-3 (Sprint 2-3 of 6-week timeline)

---

## User Stories

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

## Technical Implementation Notes

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

## Dependencies

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

## Definition of Done

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
