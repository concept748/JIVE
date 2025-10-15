# Technical Assumptions

## Repository Structure: Monorepo

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

## Service Architecture: Monolith

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

## Testing Requirements: Unit + Integration (no E2E for Phase 1)

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

## Additional Technical Assumptions and Requests

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
