# Epic 1: Core Infrastructure & Project Discovery

**Goal:** Establish Next.js application foundation with file system monitoring and basic project detection, delivering a deployable health-check page and single-project view.

**Business Value:** Provides the technical foundation for all other epics. Validates core architecture decisions (Next.js monolith, chokidar file watching) and de-risks deployment to Vercel early in the project timeline.

**Target Completion:** Week 1-2 (Sprint 1-2 of 6-week timeline)

---

## User Stories

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

## Technical Implementation Notes

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

## Dependencies

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

## Definition of Done

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
