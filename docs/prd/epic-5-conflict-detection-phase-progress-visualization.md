# Epic 5: Conflict Detection & Phase Progress Visualization

**Goal:** Implement proactive conflict detection for version mismatches and BMAD phase progress tracking, delivering mission-critical coordination intelligence.

**Business Value:** Delivers the killer feature that differentiates JIVE from all competitors: proactive conflict detection that prevents agents from working against stale artifacts. This epic addresses the core problem from the background context (e.g., "Dev implementing features based on v2 architecture while Architect has updated to v4"). Combined with phase progress tracking, it provides complete situational awareness for multi-agent workflows.

**Target Completion:** Week 5-6 (Sprint 5-6 of 6-week timeline)

---

## User Stories

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

## Technical Implementation Notes

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

## Dependencies

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

## Definition of Done

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
