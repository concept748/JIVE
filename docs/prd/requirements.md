# Requirements

## Functional Requirements

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

## Non-Functional Requirements

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
