# Epic 4: Artifact Tracking & Version Management

**Goal:** Create artifact tree visualization with version tracking and dependency mapping, providing complete visibility into PRDs, architecture docs, and stories.

**Business Value:** Enables the "artifact version tracking" value proposition. This epic provides the critical data layer that powers conflict detection (Epic 5) and gives users visibility into what artifacts exist, who created them, and what versions are in play.

**Target Completion:** Week 4-5 (Sprint 4-5 of 6-week timeline)

---

## User Stories

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

## Technical Implementation Notes

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

## Dependencies

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

## Definition of Done

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
