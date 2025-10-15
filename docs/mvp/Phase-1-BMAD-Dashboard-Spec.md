# Phase 1: BMAD Dashboard MVP - Technical Specification

**Date:** October 13, 2025
**Version:** 1.0
**Timeline:** 6 weeks
**Status:** Ready for Implementation

---

## Executive Summary

**Phase 1 Goal:** Build the BMAD orchestration dashboard with **human-driven workflows** (no AI agents yet).

**What We're Building:**

- Visual dashboard for Build → Map → Analyze → Deploy workflow
- Story/artifact management with version tracking
- Phase gates and manual approvals
- Real-time updates and collaboration
- Plugin system architecture (foundation for Phase 2)

**What We're NOT Building (Phase 2):**

- AI agents (OpenAI Agents SDK integration comes later)
- Agent orchestration and coordination
- Agent marketplace

**Success Criteria:**

- Team can manage software projects through BMAD phases
- Real-time visibility into project status
- Manual phase transitions with gate checks
- Foundation ready for agent integration (Phase 2)

---

## Table of Contents

1. [BMAD Methodology Overview](#bmad-methodology-overview)
2. [Phase 1 Scope](#phase-1-scope)
3. [Data Model](#data-model)
4. [Dashboard UI/UX](#dashboard-uiux)
5. [Technical Architecture](#technical-architecture)
6. [Features Breakdown](#features-breakdown)
7. [6-Week Roadmap](#6-week-roadmap)
8. [Technology Stack](#technology-stack)

---

## BMAD Methodology Overview

### The BMAD Workflow

**BMAD** = **Build → Map → Analyze → Deploy**

A structured methodology for software development where work flows through four phases:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  BUILD   │───▶│   MAP    │───▶│ ANALYZE  │───▶│  DEPLOY  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Phase Definitions

#### **1. BUILD Phase**

**Purpose:** Define requirements and project vision

**Activities:**

- Product Owner writes PRD (Product Requirements Document)
- Business Analyst creates project brief
- Stakeholder alignment

**Artifacts:**

- `docs/prd.md` - Product requirements
- `docs/project-brief.md` - Business case
- User stories (high-level)

**Gate:** PRD Approval

- Criteria: Stakeholders approve PRD, requirements are clear
- Who approves: Product Owner, PM, Stakeholders

---

#### **2. MAP Phase**

**Purpose:** Design technical architecture and break down work

**Activities:**

- Architect designs system architecture
- Break PRD into epics and stories
- Define technical specifications

**Artifacts:**

- `docs/architecture.md` - System design, data models, API contracts
- `docs/epics/*.md` - Epic definitions
- `docs/stories/*.md` - User story details with acceptance criteria

**Gate:** Architecture & Stories Approval

- Criteria: Architecture reviewed, stories have acceptance criteria, no missing dependencies
- Who approves: Architect, Tech Lead, PM

---

#### **3. ANALYZE Phase**

**Purpose:** Implement features and write code

**Activities:**

- Developers implement stories
- Write tests (unit, integration)
- Code reviews and refactoring

**Artifacts:**

- Code commits
- Pull requests
- Test suites
- `docs/stories/*.md` - Updated with implementation notes

**Gate:** Code Complete & QA Ready

- Criteria: All stories implemented, tests passing, code reviewed, builds green
- Who approves: Tech Lead, Dev Team

---

#### **4. DEPLOY Phase**

**Purpose:** Test, validate, and ship to production

**Activities:**

- QA Engineer tests features
- Performance and security testing
- Deployment to staging → production
- Monitoring and validation

**Artifacts:**

- `docs/qa/*.md` - Test plans, QA reports
- Deployment logs
- Release notes

**Gate:** Production Deployment

- Criteria: QA approved, no blocking bugs, smoke tests pass, rollback plan ready
- Who approves: QA Engineer, Tech Lead, Product Owner

---

### Story Lifecycle

Stories flow through BMAD phases:

```
Story S12-04: "Implement user signup flow"
├─ BUILD phase: Requirements defined in PRD
├─ MAP phase: Story created with acceptance criteria
├─ ANALYZE phase: Developer implements + tests
└─ DEPLOY phase: QA validates, deploys to production
```

**Story States:**

- `backlog` - Not started
- `in-progress` - Being worked on
- `blocked` - Waiting for dependency or decision
- `review` - Waiting for approval (gate check)
- `completed` - Done and merged/deployed

---

## Phase 1 Scope

### What We're Building

**Core Features:**

1. **BMAD Workflow Visualization**
   - Visual representation of 4 phases (Build, Map, Analyze, Deploy)
   - Stories/artifacts moving through phases
   - Phase progress indicators

2. **Story & Artifact Management**
   - Create, edit, delete stories
   - Markdown-based artifacts (PRD, architecture, stories)
   - Front-matter metadata (`bmad.version`, `bmad.story.*`, `bmad.phase`)
   - Version tracking

3. **Phase Gates (Manual)**
   - Define gate criteria per phase
   - Manual approval workflow (checkboxes + approve button)
   - Gate status visualization (passed, failed, pending)

4. **Dashboard UI**
   - Kanban view (columns = phases)
   - Story cards with metadata
   - Drag-and-drop to move stories between phases
   - Real-time updates (WebSocket)

5. **File System Integration**
   - Watch `docs/` folder for changes
   - Parse front-matter from markdown files
   - Sync file changes to dashboard

6. **Basic GitHub Integration (Read-Only)**
   - Show GitHub PR status on story cards
   - Link stories to GitHub issues
   - Display CI/CD status (optional)

7. **Plugin System Foundation**
   - Plugin registry
   - Plugin manifest schema
   - Mount points for future plugins
   - Basic plugin loading

### What We're NOT Building (Phase 2)

- ❌ AI agents (no agent orchestration)
- ❌ Conflict detection (comes with agents in Phase 2)
- ❌ Portfolio intelligence (requires historical data)
- ❌ Agent marketplace
- ❌ Advanced integrations (Jira, Linear, Slack)
- ❌ Story autopsy / forensics (agent-specific feature)

---

## Data Model

### Core Entities

#### **Project**

```typescript
interface Project {
  id: string; // "jive-dashboard"
  name: string; // "JIVE Dashboard"
  description: string;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;

  // BMAD configuration
  bmadConfig: {
    phases: Phase[]; // Build, Map, Analyze, Deploy
    gates: Gate[];
  };

  // File system
  rootPath: string; // "C:/Users/cfede/Dev/JIVE"
  docsPath: string; // "docs/"
}
```

---

#### **Phase**

```typescript
interface Phase {
  id: string; // "build", "map", "analyze", "deploy"
  name: string; // "Build", "Map", "Analyze", "Deploy"
  description: string;
  order: number; // 1, 2, 3, 4

  // Artifacts expected in this phase
  artifacts: string[]; // ["prd.md", "project-brief.md"]

  // Gate for this phase
  gate: Gate;

  // Stories currently in this phase
  stories: Story[];
}
```

---

#### **Gate**

```typescript
interface Gate {
  id: string; // "prd-approval"
  name: string; // "PRD Approval"
  phase: string; // "build"

  // Criteria (manual checkboxes for Phase 1)
  criteria: GateCriterion[];

  // Approval state
  status: 'pending' | 'approved' | 'failed';
  approvedBy?: string; // User who approved
  approvedAt?: Date;
  notes?: string; // Approval notes
}

interface GateCriterion {
  id: string;
  description: string; // "PRD is complete and reviewed"
  checked: boolean; // Manual checkbox
  required: boolean; // Must be checked to pass gate
}
```

---

#### **Story**

```typescript
interface Story {
  id: string; // "S12-04"
  title: string; // "Implement user signup flow"
  description: string;

  // BMAD metadata
  phase: string; // Current phase: "build" | "map" | "analyze" | "deploy"
  status: 'backlog' | 'in-progress' | 'blocked' | 'review' | 'completed';

  // Story details
  acceptanceCriteria: string[];
  dependencies: string[]; // Other story IDs
  assignee?: string; // Human assignee (no agents yet)

  // File reference
  filePath?: string; // "docs/stories/S12-04-signup-flow.md"

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Version tracking
  version: number; // From front-matter: bmad.version

  // GitHub integration (optional)
  github?: {
    prUrl?: string;
    prStatus?: 'open' | 'merged' | 'closed';
    issueNumber?: number;
  };
}
```

---

#### **Artifact**

```typescript
interface Artifact {
  id: string; // "prd"
  name: string; // "Product Requirements Document"
  type: 'prd' | 'architecture' | 'story' | 'epic' | 'qa-report';

  // File reference
  filePath: string; // "docs/prd.md"

  // Content (parsed from markdown)
  content: string;
  frontMatter: Record<string, any>; // YAML front-matter

  // Version tracking
  version: number; // From front-matter: bmad.version

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}
```

---

### File System Structure

```
project-root/
├── docs/
│   ├── prd.md                    # Product Requirements (BUILD phase)
│   ├── project-brief.md          # Business case (BUILD phase)
│   ├── architecture.md           # System design (MAP phase)
│   ├── epics/
│   │   ├── epic-1-auth.md        # Epic: User authentication
│   │   └── epic-2-dashboard.md   # Epic: Dashboard UI
│   ├── stories/
│   │   ├── S12-01-login.md       # Story: Login feature
│   │   ├── S12-02-signup.md      # Story: Signup feature
│   │   └── S12-04-dashboard.md   # Story: Dashboard layout
│   └── qa/
│       └── test-plan.md          # QA test plan (DEPLOY phase)
├── .jive/
│   ├── config.yaml               # JIVE configuration
│   ├── gates.yaml                # Gate definitions
│   └── db.json                   # Local database (stories, metadata)
└── README.md
```

---

### Front-Matter Schema

All markdown files use YAML front-matter for metadata:

```yaml
---
# Story front-matter example
bmad:
  story:
    id: S12-04
    phase: analyze
    status: in-progress
    assignee: john@example.com
    version: 1
  dependencies:
    - S12-01
    - S12-02
  github:
    pr: https://github.com/org/repo/pull/42
    issue: 123
---

# Story: Implement Dashboard Layout

## Description
Create the main dashboard layout with sidebar navigation...

## Acceptance Criteria
- [ ] Sidebar with navigation links
- [ ] Main content area
- [ ] Responsive design (mobile + desktop)

## Implementation Notes
...
```

---

## Dashboard UI/UX

### Main Dashboard View

```
┌─────────────────────────────────────────────────────────────┐
│  JIVE Dashboard                    [Settings] [Help] [User] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Project: JIVE Dashboard                  Phase Progress:  │
│  ┌──────┬──────┬──────┬──────┐            [████░░] 60%    │
│  │BUILD │ MAP  │ANALYZE│DEPLOY│                            │
│  │  ✓   │  ✓   │  →   │  ☐   │                            │
│  └──────┴──────┴──────┴──────┘                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    BMAD KANBAN VIEW                         │
├────────────┬────────────┬────────────┬────────────────────┤
│   BUILD    │    MAP     │  ANALYZE   │     DEPLOY         │
├────────────┼────────────┼────────────┼────────────────────┤
│            │            │            │                    │
│ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │ ┌────────┐        │
│ │ S12-01 │ │ │ S12-02 │ │ │ S12-04 │ │ │ S12-03 │        │
│ │ Login  │ │ │ Signup │ │ │Dashbrd │ │ │ Deploy │        │
│ │        │ │ │        │ │ │  WIP   │ │ │ Testing│        │
│ │ ✓ Done │ │ │ ✓ Done │ │ │ 🔵 Dev │ │ │ 🟢 QA  │        │
│ └────────┘ │ └────────┘ │ └────────┘ │ └────────┘        │
│            │            │            │                    │
│            │            │ ┌────────┐ │                    │
│            │            │ │ S12-05 │ │                    │
│            │            │ │ API    │ │                    │
│            │            │ │🔴Blocked│ │                    │
│            │            │ └────────┘ │                    │
│            │            │            │                    │
├────────────┴────────────┴────────────┴────────────────────┤
│ Gate: Architecture Approval    [Review Criteria] [Approve]│
└─────────────────────────────────────────────────────────────┘
```

### Story Card Design

```
┌────────────────────────────┐
│ S12-04                     │
│ Dashboard Layout           │
├────────────────────────────┤
│ 🔵 In Progress             │
│ 👤 john@example.com        │
│ 🔗 PR #42 (open)           │
│ 📦 v1                      │
├────────────────────────────┤
│ Depends on: S12-01, S12-02 │
│ ⏱ Started 2 days ago       │
└────────────────────────────┘
```

**Card Elements:**

- Story ID + Title
- Status indicator (color-coded)
- Assignee (human, for now)
- GitHub PR link (if exists)
- Version number
- Dependencies
- Time tracking

---

### Gate Approval Modal

```
┌─────────────────────────────────────────┐
│  Gate: Architecture Approval            │
├─────────────────────────────────────────┤
│                                         │
│  Phase: MAP → ANALYZE                   │
│                                         │
│  Criteria:                              │
│  ☑ Architecture doc is complete         │
│  ☑ Data models defined                  │
│  ☑ API contracts specified              │
│  ☐ Security review completed            │
│  ☑ Tech lead approved                   │
│                                         │
│  Status: 4/5 criteria met               │
│                                         │
│  Notes:                                 │
│  ┌─────────────────────────────────┐   │
│  │ Security review scheduled for   │   │
│  │ next week. Otherwise ready.     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ Cancel ]        [ Approve Gate ]    │
└─────────────────────────────────────────┘
```

---

### Story Detail View

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Dashboard                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Story S12-04: Dashboard Layout                         │
│  Phase: ANALYZE    Status: In Progress    Version: 1   │
│                                                         │
│  Assignee: john@example.com                             │
│  GitHub PR: #42 (open) ✓ CI passing                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Description:                                           │
│  Create the main dashboard layout with sidebar...      │
│                                                         │
│  Acceptance Criteria:                                   │
│  ☑ Sidebar with navigation links                        │
│  ☑ Main content area                                    │
│  ☐ Responsive design (mobile + desktop)                │
│                                                         │
│  Dependencies:                                          │
│  • S12-01 (Login) - ✓ Completed                        │
│  • S12-02 (Signup) - ✓ Completed                       │
│                                                         │
│  Implementation Notes:                                  │
│  Using Tailwind CSS for responsive grid...             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Actions:                                               │
│  [Edit Story] [Move to Deploy] [Block] [Delete]        │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Next.js Frontend                   │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ Dashboard  │  │   Story    │  │     Gate     │  │
│  │   View     │  │   Detail   │  │   Approval   │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
                     │ WebSocket (real-time)
                     │ REST API (CRUD)
                     ▼
┌─────────────────────────────────────────────────────┐
│              Next.js API Routes (Backend)           │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Project   │  │   Story    │  │     Gate     │  │
│  │   API      │  │    API     │  │     API      │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  Data Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  JSON DB   │  │    File    │  │   GitHub     │  │
│  │ (.jive/db) │  │   Watcher  │  │     API      │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              File System (docs/)                    │
│  prd.md, architecture.md, stories/*.md, qa/*.md     │
└─────────────────────────────────────────────────────┘
```

---

### Component Architecture

```
app/
├── dashboard/
│   ├── page.tsx                 # Main dashboard (Kanban view)
│   ├── components/
│   │   ├── KanbanBoard.tsx      # BMAD columns
│   │   ├── StoryCard.tsx        # Story cards (draggable)
│   │   ├── PhaseColumn.tsx      # Single phase column
│   │   ├── GateModal.tsx        # Gate approval modal
│   │   └── PhaseProgress.tsx    # Progress indicator
│   └── layout.tsx
├── story/
│   └── [id]/
│       └── page.tsx             # Story detail view
├── api/
│   ├── projects/
│   │   └── route.ts             # GET /api/projects
│   ├── stories/
│   │   ├── route.ts             # GET/POST /api/stories
│   │   └── [id]/
│   │       └── route.ts         # GET/PUT/DELETE /api/stories/:id
│   ├── gates/
│   │   └── [id]/
│   │       └── approve/
│   │           └── route.ts     # POST /api/gates/:id/approve
│   └── ws/
│       └── route.ts             # WebSocket endpoint
└── layout.tsx
```

---

### Data Flow

#### **1. Load Dashboard**

```
User opens dashboard
  → Next.js renders KanbanBoard component
  → Fetch stories: GET /api/stories
  → Fetch gates: GET /api/gates
  → Display Kanban columns (Build, Map, Analyze, Deploy)
  → Render story cards in respective columns
  → WebSocket connection established for real-time updates
```

#### **2. Move Story Between Phases**

```
User drags story S12-04 from MAP to ANALYZE
  → Frontend: optimistic UI update (move card)
  → API call: PUT /api/stories/S12-04 { phase: "analyze" }
  → Backend:
    - Update .jive/db.json
    - Update docs/stories/S12-04.md front-matter
  → WebSocket broadcast: story_updated event
  → All connected clients update UI
```

#### **3. Approve Gate**

```
User clicks "Approve Gate" for MAP phase gate
  → Open GateModal
  → User checks criteria checkboxes
  → Click "Approve"
  → API call: POST /api/gates/map-approval/approve
  → Backend:
    - Update .jive/gates.yaml (status: approved)
    - Emit gate_approved event
  → All stories in MAP can now move to ANALYZE
```

#### **4. File System Sync**

```
User edits docs/stories/S12-04.md directly in VS Code
  → File watcher detects change (chokidar)
  → Parse markdown + front-matter
  → Update .jive/db.json
  → WebSocket broadcast: story_updated event
  → Dashboard UI refreshes (story card updates)
```

---

## Features Breakdown

### Feature 1: BMAD Kanban Board

**Description:** Visual board with 4 columns (Build, Map, Analyze, Deploy) showing stories in each phase.

**User Stories:**

- As a PM, I can see all stories organized by BMAD phase
- As a developer, I can drag-and-drop stories between phases
- As a team, we can see project progress at a glance

**Technical Details:**

- React component: `KanbanBoard.tsx`
- Drag-and-drop: `react-beautiful-dnd` library
- Data: Fetch stories from `/api/stories`, group by `story.phase`
- Real-time: WebSocket updates when stories move

**Acceptance Criteria:**

- ✅ 4 columns visible (Build, Map, Analyze, Deploy)
- ✅ Stories render as cards in correct column
- ✅ Drag-and-drop works (story moves, API updates)
- ✅ Real-time updates (other users see changes)

---

### Feature 2: Story Cards

**Description:** Visual cards representing stories with metadata.

**User Stories:**

- As a user, I can see story ID, title, status, assignee, dependencies
- As a developer, I can click card to open detail view
- As a PM, I can see GitHub PR status on cards

**Technical Details:**

- React component: `StoryCard.tsx`
- Props: `{ story: Story }`
- Display: ID, title, status badge, assignee avatar, GitHub icon
- Click handler: Navigate to `/story/[id]`

**Acceptance Criteria:**

- ✅ Card shows: ID, title, status, assignee
- ✅ Status color-coded (green=completed, blue=in-progress, red=blocked)
- ✅ GitHub PR link (if exists)
- ✅ Dependencies listed
- ✅ Click opens story detail page

---

### Feature 3: Phase Gates

**Description:** Manual approval gates between phases.

**User Stories:**

- As a PM, I can define gate criteria (checklist)
- As a team lead, I can approve/reject gates
- As a developer, I know when gate is blocking progress

**Technical Details:**

- Data model: `Gate` with `GateCriterion[]`
- UI: `GateModal.tsx` (modal dialog)
- API: `POST /api/gates/[id]/approve`
- Persistence: `.jive/gates.yaml`

**Acceptance Criteria:**

- ✅ Gate criteria defined in YAML
- ✅ Modal shows checklist of criteria
- ✅ User can check/uncheck items
- ✅ "Approve" button enabled when all required criteria met
- ✅ Approval blocks story movement until gate passes

---

### Feature 4: Story Detail View

**Description:** Full-page view of a single story with all metadata.

**User Stories:**

- As a user, I can view full story description
- As a developer, I can edit acceptance criteria
- As a PM, I can see dependencies and blockers

**Technical Details:**

- Route: `/story/[id]`
- Component: `app/story/[id]/page.tsx`
- Data: Fetch from `/api/stories/[id]`
- Actions: Edit, Delete, Move Phase, Block

**Acceptance Criteria:**

- ✅ Shows full story content (parsed from markdown)
- ✅ Displays: description, acceptance criteria, dependencies, notes
- ✅ Links to GitHub PR (if exists)
- ✅ "Edit" button opens markdown editor
- ✅ "Move to [Phase]" buttons

---

### Feature 5: File System Integration

**Description:** Sync markdown files (docs/) with dashboard state.

**User Stories:**

- As a developer, I can edit stories in VS Code and see updates in dashboard
- As a PM, changes in dashboard update markdown files
- As a team, we have single source of truth (markdown files + dashboard)

**Technical Details:**

- Library: `chokidar` (file watcher)
- Watch: `docs/**/*.md`
- Parse: `gray-matter` (front-matter) + `marked` (markdown)
- Sync: Two-way (file → DB, DB → file)

**Acceptance Criteria:**

- ✅ Dashboard loads stories from `docs/stories/*.md`
- ✅ Editing markdown file updates dashboard (within 1 sec)
- ✅ Moving story in dashboard updates front-matter
- ✅ No conflicts (last write wins for now, conflict detection in Phase 2)

---

### Feature 6: GitHub Integration (Read-Only)

**Description:** Display GitHub PR status on story cards.

**User Stories:**

- As a developer, I can see PR status without leaving dashboard
- As a PM, I know which stories have open PRs
- As a team, we link stories to GitHub issues

**Technical Details:**

- GitHub API: REST API (fetch PR status)
- Authentication: Personal Access Token (stored in .env)
- Data: Store `github.prUrl` and `github.issueNumber` in story front-matter
- Display: Icon on story card (green checkmark = merged, blue = open)

**Acceptance Criteria:**

- ✅ Story front-matter includes `github.pr` and `github.issue`
- ✅ Dashboard fetches PR status from GitHub API
- ✅ Story card shows PR status icon
- ✅ Click icon opens PR in new tab
- ✅ Read-only (no write operations to GitHub yet)

---

### Feature 7: Plugin System Foundation

**Description:** Basic plugin architecture for future extensions.

**User Stories:**

- As a developer, I can install plugins (future)
- As JIVE team, we have infrastructure for Phase 2 agent plugins
- As a user, I see plugin mount points in UI

**Technical Details:**

- Plugin registry: `PluginRegistry` class
- Plugin loader: Scan `.jive/plugins/` folder
- Mount points: Sidebar, right drawer, bottom tray
- API: `registerPlugin(manifest)`

**Acceptance Criteria:**

- ✅ Plugin registry implemented
- ✅ Mount points render in dashboard UI (empty for now)
- ✅ Sample plugin loads and displays "Hello from Plugin"
- ✅ Foundation ready for Phase 2 agent plugins

---

## 6-Week Roadmap

### Week 1: Foundation & Setup

**Goal:** Project scaffolding, data models, file system integration

**Tasks:**

- [x] Initialize Next.js project with TypeScript
- [x] Set up Tailwind CSS
- [x] Define data models (Project, Phase, Story, Gate, Artifact)
- [x] Implement file watcher (chokidar)
- [x] Parse markdown with front-matter (gray-matter)
- [x] Create `.jive/` folder structure
- [x] Initial JSON database (`.jive/db.json`)

**Deliverable:** Stories load from `docs/stories/*.md` into memory

---

### Week 2: Kanban Board UI

**Goal:** Visual dashboard with BMAD columns

**Tasks:**

- [ ] Create `KanbanBoard` component
- [ ] Create `PhaseColumn` component (4 instances)
- [ ] Create `StoryCard` component
- [ ] Implement drag-and-drop (react-beautiful-dnd)
- [ ] API route: `GET /api/stories`
- [ ] Display stories in correct columns

**Deliverable:** Working Kanban board with stories in 4 phases

---

### Week 3: Story Management

**Goal:** CRUD operations for stories

**Tasks:**

- [ ] API routes:
  - `POST /api/stories` (create story)
  - `PUT /api/stories/[id]` (update story)
  - `DELETE /api/stories/[id]` (delete story)
- [ ] Story detail page (`/story/[id]`)
- [ ] Edit story modal (markdown editor)
- [ ] Update front-matter when story moves
- [ ] Two-way sync (dashboard ↔ file system)

**Deliverable:** Full story lifecycle (create, view, edit, move, delete)

---

### Week 4: Phase Gates

**Goal:** Manual approval gates between phases

**Tasks:**

- [ ] Define gate schema (`.jive/gates.yaml`)
- [ ] Create `GateModal` component
- [ ] API route: `POST /api/gates/[id]/approve`
- [ ] Gate criteria checklist UI
- [ ] Block story movement until gate approved
- [ ] Gate status indicator on dashboard

**Deliverable:** Working gate approval workflow

---

### Week 5: Real-Time & GitHub Integration

**Goal:** WebSocket updates and GitHub PR status

**Tasks:**

- [ ] Set up WebSocket server (Next.js API route)
- [ ] Broadcast events (story moved, gate approved)
- [ ] Real-time UI updates (all clients sync)
- [ ] GitHub API integration (fetch PR status)
- [ ] Display PR status on story cards
- [ ] Link stories to GitHub issues

**Deliverable:** Real-time collaboration + GitHub integration

---

### Week 6: Polish & Plugin Foundation

**Goal:** UI/UX improvements and plugin system

**Tasks:**

- [ ] Phase progress indicator (% complete)
- [ ] Search/filter stories
- [ ] Keyboard shortcuts (create story, move phase)
- [ ] Plugin registry implementation
- [ ] Plugin mount points in UI
- [ ] Sample plugin (proof-of-concept)
- [ ] Documentation (README, setup guide)
- [ ] Deploy to Vercel

**Deliverable:** Production-ready Phase 1 MVP

---

## Technology Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Drag-and-Drop:** react-beautiful-dnd
- **State Management:** React Context + Zustand
- **Real-Time:** WebSocket (native)

### Backend

- **API:** Next.js API Routes
- **Database:** JSON file (`.jive/db.json`) for Phase 1 (migrate to PostgreSQL in Phase 2)
- **File System:** Node.js `fs` + `chokidar` (file watcher)
- **Markdown:** `gray-matter` (front-matter) + `marked` (parser)

### Integrations

- **GitHub:** REST API (read-only)
- **Version Control:** Git (for docs/)

### DevOps

- **Hosting:** Vercel (Next.js deployment)
- **Environment:** Node.js 18+
- **Package Manager:** pnpm

### Future (Phase 2)

- **AI Agents:** OpenAI Agents SDK
- **Database:** PostgreSQL + Prisma
- **Event Bus:** Redis or NATS (for agent coordination)
- **Observability:** Logging + tracing infrastructure

---

## Success Metrics

### Phase 1 MVP Success Criteria

1. **Functional:**
   - ✅ Dashboard displays BMAD Kanban board
   - ✅ Stories move between phases (drag-and-drop)
   - ✅ Gates block phase transitions (manual approval)
   - ✅ File system sync works (edit markdown → see in dashboard)
   - ✅ GitHub PR status visible on cards

2. **Performance:**
   - Page load < 2 seconds
   - Real-time updates < 500ms latency
   - Supports 50+ stories without lag

3. **Usability:**
   - First-time user can create story in < 5 minutes
   - No bugs blocking core workflow
   - Mobile-responsive (optional for Phase 1)

4. **Technical:**
   - Plugin system foundation implemented
   - Clean code (TypeScript, no `any` types)
   - Documentation complete (README + architecture)

---

## Next Steps (Phase 2)

After Phase 1 MVP ships, we'll add:

1. **OpenAI Agents SDK Integration**
   - Implement BMAD agents (Analyst, Architect, Dev, QA)
   - Agent handoffs and routines
   - Real-time agent status on dashboard

2. **Agent Orchestration**
   - Conflict detection (version-aware artifacts)
   - Agent coordination (handoffs between phases)
   - Story autopsy (timeline replay)

3. **Advanced Features**
   - Portfolio intelligence (cross-project analytics)
   - Predictive confidence engine
   - Agent marketplace

---

**Phase 1 Timeline: 6 weeks**
**Phase 1 Scope: BMAD Dashboard (human-driven workflow)**
**Phase 2: Add AI agents with OpenAI Agents SDK**

---

_End of Phase 1 Specification_
