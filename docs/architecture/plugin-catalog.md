# JIVE Plugin Catalog

**Date:** October 13, 2025
**Version:** 1.0
**Total Plugins:** 35+ concepts from brainstorming session

---

## Overview

This catalog organizes all features from the brainstorming session as **installable plugins**. Each plugin can be developed independently, installed on-demand, and monetized through the marketplace.

**Plugin Status Legend:**

- 🟢 **Core** - Ships with JIVE (Tier 0)
- 🔵 **Official** - Built by JIVE team (Tier 1-2)
- 🟣 **Community** - Open to community developers
- 🟡 **Premium** - Paid marketplace plugin

---

## Quick Reference: Plugin Matrix

| Plugin Name             | Category      | Status       | Tier   | Price      | Complexity |
| ----------------------- | ------------- | ------------ | ------ | ---------- | ---------- |
| Agent Dashboard         | Visualization | 🟢 Core      | Tier 0 | Free       | Medium     |
| BMAD Workflow           | Workflow      | 🟢 Core      | Tier 0 | Free       | High       |
| Conflict Detector       | Intelligence  | 🔵 Official  | Tier 1 | Free       | High       |
| GitHub Connector        | Integration   | 🔵 Official  | Tier 0 | Free       | Medium     |
| Story Autopsy           | Observability | 🔵 Official  | Tier 1 | Free       | High       |
| Executive Dashboard     | Visualization | 🔵 Official  | Tier 1 | Free       | Medium     |
| Portfolio Analytics     | Intelligence  | 🔵 Official  | Tier 2 | Free       | Very High  |
| Jira Connector          | Integration   | 🟣 Community | Tier 1 | Free       | Medium     |
| Linear Connector        | Integration   | 🟣 Community | Tier 1 | Free       | Medium     |
| Slack ChatOps           | Integration   | 🔵 Official  | Tier 1 | Free       | Low        |
| Predictive Confidence   | Intelligence  | 🔵 Official  | Tier 2 | 🟡 Premium | Very High  |
| Portfolio Constellation | Visualization | 🔵 Official  | Tier 2 | Free       | Medium     |
| Bottleneck Detector     | Intelligence  | 🔵 Official  | Tier 1 | Free       | Medium     |
| Telemetry Gates         | Workflow      | 🔵 Official  | Tier 1 | Free       | Medium     |
| Attention Queue         | Workflow      | 🔵 Official  | Tier 2 | Free       | Medium     |
| Dynamic Lanes           | Workflow      | 🔵 Official  | Tier 1 | Free       | Low        |
| Multimedia Artifacts    | Utility       | 🟣 Community | Tier 2 | 🟡 Premium | High       |
| AI Summarizer           | Utility       | 🟣 Community | Tier 2 | 🟡 Premium | Medium     |
| Auto-Documentation      | Utility       | 🟣 Community | Tier 2 | 🟡 Premium | High       |
| Notion Sync             | Integration   | 🟣 Community | Tier 1 | Free       | Medium     |
| LangSmith Importer      | Observability | 🟣 Community | Tier 1 | Free       | Low        |
| Datadog Exporter        | Observability | 🟣 Community | Tier 1 | Free       | Low        |

_(Plus 13 more plugins documented below)_

---

## Category 1: Visualization Plugins

### 🟢 Agent Dashboard

**ID:** `@jive/agent-dashboard`
**Status:** Core (ships with JIVE)
**Tier:** Tier 0 (6 weeks)

**Description:**
Live view of all agents + their current tasks, with status indicators and artifact connections.

**Features:**

- Agent list with status chips (IDLE, RUNNING, BLOCKED, WAITING)
- Connection lines from agents → artifacts they're working on
- Timeline scrubber showing agent activity over time
- Color coding: Green (active), Amber (waiting), Red (blocked/error)
- Bottom timeline with playback animation

**Tech Stack:**

- React + TypeScript
- D3.js for connection lines
- WebSocket for real-time updates

**Pricing:** Free (core feature)

**Installation:**

```bash
# Pre-installed with JIVE core
```

---

### 🔵 Executive Dashboard

**ID:** `@jive/exec-dashboard`
**Status:** Official plugin
**Tier:** Tier 1 (3 months)

**Description:**
High-level KPIs and metrics for leadership to understand project health at a glance.

**Features:**

- **7 Core Metrics:**
  1. Delivery Confidence Index (0-100 gauge)
  2. Phase Progress (% completion for Build→Map→Analyze→Deploy)
  3. Risk & Blocker Heatmap
  4. Cycle Time Trend (line chart)
  5. Quality Stability (QA pass rate)
  6. Velocity vs. Commitment (planned vs. delivered)
  7. Agent Utilization (active vs. idle time)
- AI-generated narrative summary
- Milestone tracker (gate icons with dates)
- Risk feed with action suggestions
- Budget & effort overlay (compute credits consumed)
- Amber glow header when risk index > 0.3
- Top 3 attention areas with one-click actions

**Tech Stack:**

- React + recharts (data visualization)
- LLM integration for narrative summaries
- Real-time metric computation

**Pricing:** Free (official plugin)

**Installation:**

```bash
jive install @jive/exec-dashboard
```

---

### 🔵 Portfolio Constellation

**ID:** `@jive/portfolio-view`
**Status:** Official plugin
**Tier:** Tier 2 (6 months)

**Description:**
Galaxy map visualization of all projects, sized by complexity and colored by health.

**Features:**

- Force-directed graph (D3.js) showing all projects as nodes
- Nodes sized by scope (story count, complexity)
- Color-coded by health (green = healthy, amber = at-risk, red = critical)
- Click-through to project detail board
- Hover tooltips with project summary
- Filter by team, status, risk level
- Export as PNG/SVG

**Tech Stack:**

- D3.js force simulation
- React for UI controls
- GraphQL for data fetching

**Pricing:** Free (official plugin)

**Installation:**

```bash
jive install @jive/portfolio-view
```

---

### 🟣 Custom Metrics Dashboard

**ID:** `@acme/custom-metrics` _(example community plugin)_
**Status:** Community plugin
**Tier:** N/A (community-developed)

**Description:**
Build your own dashboard with custom widgets and metrics.

**Features:**

- Drag-and-drop widget builder
- Connect to JIVE GraphQL API
- Chart types: line, bar, pie, gauge, heatmap
- Save dashboard templates
- Share with team

**Tech Stack:**

- React + react-grid-layout
- Chart.js or recharts
- Custom GraphQL queries

**Pricing:** 🟡 $29/month (Premium)

**Installation:**

```bash
jive install @acme/custom-metrics
```

---

## Category 2: Intelligence Plugins

### 🔵 Conflict Detector

**ID:** `@jive/conflict-detector`
**Status:** Official plugin
**Tier:** Tier 1 (3 months)

**Description:**
Detects conflicting artifacts when agents work against stale/incompatible versions.

**Features:**

- **Detection System:**
  - Artifact diffs indexer (monitors all document changes)
  - Front-matter version bumps (`bmad.version`) trigger checks
  - Dependency graph: ARCH → Epics → Stories → Runs
  - Heuristics: structural changes, contract changes, concurrent edits

- **Visualization:**
  - Red conflict ribbons on affected story cards
  - Amber badges on agents working against old versions
  - Topology overlay with red graph lines (version mismatches)
  - Side-by-side semantic diffs in right drawer
  - Global banner with impact summary

- **Warning System (3 levels):**
  - Info: Upstream doc edited, no breaking change
  - Warning: Potential contract change, some stories may be stale
  - Critical: Confirmed breaking change, running work incompatible

- **Resolution Workflows:**
  1. Auto-Rebase Stories (update front-matter, inject migration tasks)
  2. Create Migration Plan (generate `migrations/ARCH-v7->v8.md`)
  3. Dual-Track Branching (keep sprint on v7, incubate v8 on branch)
  4. Rollback (revert architecture, auto-close migration)

- **Decision Support:**
  - Impact analysis panel (scope, effort, risk)
  - What-if preview (simulate resolution strategies)
  - Recommended defaults based on change size

**Tech Stack:**

- Markdown diff library (diff-match-patch)
- Graph database (dependency tracking)
- LLM for semantic diff analysis

**Pricing:** Free (official plugin)

**Installation:**

```bash
jive install @jive/conflict-detector
```

---

### 🔵 Predictive Confidence Engine

**ID:** `@jive/predictor`
**Status:** Official plugin
**Tier:** Tier 2 (6 months)

**Description:**
Forward-looking confidence scores and risk predictions.

**Features:**

- Monte Carlo simulation (run 1000+ scenarios)
- Historical velocity analysis (past cycle times)
- Current WIP and blockers factored in
- Team capacity and PTO adjustments
- Known technical debt and dependency risks
- Output: "80% chance on-time; main risk: migration CP"
- Confidence intervals (P10, P50, P90)
- What-if scenario modeling (add/remove stories, adjust capacity)

**Tech Stack:**

- Python backend (Monte Carlo simulation)
- Historical data warehouse
- Real-time metrics ingestion

**Pricing:** 🟡 $49/month (Premium - requires compute resources)

**Installation:**

```bash
jive install @jive/predictor
```

---

### 🔵 Portfolio Intelligence

**ID:** `@jive/portfolio-analytics`
**Status:** Official plugin
**Tier:** Tier 2+ (9 months, requires data collection period)

**Description:**
Cross-project learning and organizational brain that improves over time.

**Features:**

- **Data Collection:**
  - Aggregate telemetry from all projects
  - Normalized schema (project, epic, story, run, artifact, gate)
  - Anonymized for privacy

- **Portfolio Dashboard:**
  1. Portfolio Health Heatmap (rows = projects, columns = BMAD phases)
  2. Cross-Project KPIs (7 metrics):
     - Cycle Efficiency Index
     - QA Failure Rate by Story Type
     - Agent Learning Curve
     - Resource Utilization Efficiency
     - Cross-Team Dependencies
     - Gate Stability
     - Innovation Velocity

- **Learning & Optimization:**
  - Pattern mining ("42% of failures = schema mismatches")
  - Predictive alerts ("Project Vega: 65% regression risk")
  - Benchmarking ("Project Nova: 2.3 days/feature, Top 10%")
  - Optimization suggestions ("Reassign idle Architect to Project M")
  - Auto-tuning (adjust agent prompts/weights for faster convergence)

- **Organizational Memory:**
  - BMAD Meta-DB storing all telemetry
  - Versioned prompt stacks and configurations
  - Auto-generated playbooks ("Optimal Build→Map ratio for mobile apps")

**Tech Stack:**

- Data warehouse (PostgreSQL + TimescaleDB)
- ML pipeline (scikit-learn, TensorFlow)
- Analytics UI (React + recharts)

**Pricing:** 🟡 $99/month (Premium - ML infrastructure costs)

**Installation:**

```bash
jive install @jive/portfolio-analytics
```

---

### 🔵 Bottleneck Detector

**ID:** `@jive/bottleneck-detector`
**Status:** Official plugin
**Tier:** Tier 1 (3 months)

**Description:**
Identifies workflow slowdowns and agent idle time.

**Features:**

- Queue depth analysis (stories piling up in phase)
- Agent idle time tracking (IDLE state duration)
- Gate hold-up detection (stories waiting for approval)
- Dependency blocking visualization
- Recommended interventions ("Add QA agent", "Parallelize stories")
- Historical bottleneck trends

**Tech Stack:**

- Real-time event stream analysis
- Threshold-based alerting
- UI visualization (bar charts, timelines)

**Pricing:** Free (official plugin)

**Installation:**

```bash
jive install @jive/bottleneck-detector
```

---

## Category 3: Integration Plugins

### 🔵 GitHub Connector

**ID:** `@jive/github`
**Status:** Official plugin (read-only in Tier 0, bidirectional in Tier 1)
**Tier:** Tier 0 (MVP), Tier 1 (full features)

**Description:**
Bidirectional sync between JIVE stories and GitHub issues/PRs.

**Features:**

- **Tier 0 (Read-Only):**
  - Webhook listener (PRs, issues, commits, checks)
  - Parse and normalize GitHub events
  - Identity map (JIVE story ID ↔ GitHub issue #)
  - Display GitHub data in JIVE dashboard
  - Filter and search

- **Tier 1 (Bidirectional):**
  - Auto-create GitHub issues from JIVE stories
  - Link JIVE stories in GitHub PR comments
  - Update story status when PR merged
  - Auto-create branches for stories (`feature/S12-04-signup-flow`)
  - Sync assignees, labels, milestones

**Tech Stack:**

- GitHub App (OAuth, webhooks)
- REST + GraphQL GitHub API
- Identity mapping database

**Pricing:** Free (official plugin)

**Installation:**

```bash
jive install @jive/github

# Setup
jive github auth  # OAuth flow
jive github config --repo=owner/repo
```

---

### 🟣 Jira Connector

**ID:** `@jive/jira` _(can be community or official)_
**Status:** Official or Community
**Tier:** Tier 1 (3 months)

**Description:**
Sync JIVE stories with Jira issues.

**Features:**

- Bidirectional sync (status, assignee, description, comments)
- Source-of-truth policy engine (per-field precedence)
- Conflict resolution (if both sides update, JIVE wins OR Jira wins based on policy)
- Webhook-based updates (real-time)
- Identity map (JIVE story ID ↔ Jira issue key)
- Sync epics and sprints
- Custom field mapping

**Tech Stack:**

- Jira REST API
- Webhook listener
- Conflict resolution state machine

**Pricing:** Free (official) or 🟡 $19/month (premium features)

**Installation:**

```bash
jive install @jive/jira

# Setup
jive jira auth  # Enter API token
jive jira config --project=PROJ
```

---

### 🟣 Linear Connector

**ID:** `@jive/linear`
**Status:** Community plugin
**Tier:** Tier 1 (3 months)

**Description:**
Integrate with Linear for task management.

**Features:**

- GraphQL API sync (Linear's native protocol)
- Status mapping (JIVE phases → Linear states)
- Cycle/sprint synchronization
- Webhooks for real-time updates
- Identity map (JIVE story ID ↔ Linear issue ID)
- Team and project mapping

**Tech Stack:**

- Linear GraphQL API
- Webhook subscriptions
- Real-time sync engine

**Pricing:** Free (community plugin)

**Installation:**

```bash
jive install @jive/linear

# Setup
jive linear auth  # OAuth flow
jive linear config --team=TEAM
```

---

### 🔵 Slack ChatOps

**ID:** `@jive/slack`
**Status:** Official plugin
**Tier:** Tier 1 (3 months)

**Description:**
Control JIVE from Slack, no need to leave chat.

**Features:**

- **Commands:**
  - `/jive status` - project health summary
  - `/jive move S12-04 QA` - change story phase
  - `/jive conflicts` - list current conflicts
  - `/jive assign S12-04 dev-3` - reassign story
  - `/jive agents` - list agent statuses
  - `/jive risk` - show top 3 risks

- **Interactive Buttons:**
  - "Approve Gate" (click to pass)
  - "Pause Agent" (stop agent execution)
  - "Reassign to QA-2" (change assignee)

- **Notifications:**
  - Gate failed alerts
  - Conflict detected warnings
  - Story completed updates
  - Agent blocked notifications

**Tech Stack:**

- Slack Events API
- Slash commands
- Interactive actions (Block Kit)

**Pricing:** Free (official plugin)

**Installation:**

```bash
jive install @jive/slack

# Setup
jive slack auth  # OAuth flow
jive slack config --channel=#jive-updates
```

---

### 🟣 Notion Sync

**ID:** `@jive/notion`
**Status:** Community plugin
**Tier:** Tier 1+ (4 months)

**Description:**
Sync PRDs and architecture docs with Notion.

**Features:**

- Bidirectional sync (JIVE docs ↔ Notion pages)
- Change detection (trigger gate checks on Notion edits)
- Front-matter mapping (YAML ↔ Notion properties)
- Link preservation (cross-references maintained)
- Media embedding (images, videos)
- Table sync (databases)

**Tech Stack:**

- Notion REST API
- Markdown ↔ Notion block conversion
- Webhook listener

**Pricing:** 🟡 $19/month (Premium)

**Installation:**

```bash
jive install @jive/notion

# Setup
jive notion auth  # Enter integration token
jive notion config --database-id=abc123
```

---

## Category 4: Workflow Plugins

### 🟢 BMAD Workflow Engine

**ID:** `@jive/bmad-workflow`
**Status:** Core (ships with JIVE)
**Tier:** Tier 0 (6 weeks)

**Description:**
Build → Map → Analyze → Deploy phase management.

**Features:**

- **Phase Definitions:**
  - Each phase has: gates, agents, artifacts, completion criteria
  - Configurable via YAML (`bmad.phases.yaml`)

- **Phase Transitions:**
  - Automatic (when criteria met) or manual (require approval)
  - Transition hooks (trigger actions on phase change)

- **Gate Policies as Code:**
  - Define gates in YAML (e.g., `min_coverage: 85`)
  - Compute gate status from telemetry
  - Human override capability

- **Agent Assignment Rules:**
  - Automatic assignment based on phase (Build → Architect, Map → PM, etc.)
  - Manual reassignment allowed

- **Phase Completion Criteria:**
  - All stories in phase complete
  - All gates passed
  - No blocking conflicts

**Tech Stack:**

- YAML parser
- State machine (phase transitions)
- Gate evaluation engine

**Pricing:** Free (core feature)

**Installation:**

```bash
# Pre-installed with JIVE core
```

---

### 🔵 Telemetry Gates

**ID:** `@jive/telemetry-gates`
**Status:** Official plugin
**Tier:** Tier 1 (3 months)

**Description:**
Auto-pass/fail gates based on measurable signals (no manual approval needed).

**Features:**

- **Policy Definitions (YAML):**

  ```yaml
  gate.qa:
    min_coverage: 85
    zero_blocking_tests: true
    performance_threshold: 200ms
    max_error_rate: 0.01
  ```

- **Compute Gate Status:**
  - Pull metrics from CI (coverage, test results, performance)
  - Pull metrics from MCP events (agent runs, errors)
  - Evaluate against policy
  - Auto-pass if all criteria met, auto-fail if any violated

- **Human Override:**
  - If gate fails, PM can manually approve (with reason)
  - Override logged in audit trail

- **Gate History:**
  - Track all gate evaluations over time
  - See trends (improving or degrading)

- **Signals Supported:**
  - Test coverage percentage
  - Test pass rate
  - Performance regression thresholds
  - PR review state (approved by N reviewers)
  - Zero critical bugs/blockers
  - Deployment smoke test results

**Tech Stack:**

- YAML policy parser
- Metrics collector (CI webhooks, MCP events)
- Evaluation engine

**Pricing:** Free (official plugin)

**Installation:**

```bash
jive install @jive/telemetry-gates

# Setup
jive gates init  # Scaffold gate policies
```

---

### 🔵 Dynamic Lanes

**ID:** `@jive/dynamic-lanes`
**Status:** Official plugin
**Tier:** Tier 1+ (4 months)

**Description:**
Policy-driven Kanban lanes that appear/disappear based on context.

**Features:**

- **Rules Engine:**
  - `if migration_cp_open → spawn "Migration" lane, cap WIP to N`
  - `if experiment_flag_active → spawn "Experiment" lane`
  - `if critical_bug_filed → spawn "Hotfix" lane (WIP=1)`
  - `if tech_debt > threshold → spawn "Tech Debt" lane`

- **Lane Templates:**
  - Hotfix (appears when P0 bug filed)
  - Migration (appears during architecture transitions)
  - Experiment (for A/B tests and feature flags)
  - Tech Debt (visible when debt threshold exceeded)

- **WIP Limits Per Lane:**
  - Configurable (e.g., Hotfix lane: WIP=1, blocks other work)
  - Visual indicators when limit reached

- **Auto-Collapse:**
  - Lanes disappear when empty (no clutter)

**Tech Stack:**

- Rules engine (policy evaluation)
- Kanban state management
- Real-time lane rendering

**Pricing:** Free (official plugin)

**Installation:**

```bash
jive install @jive/dynamic-lanes

# Setup
jive lanes config  # Define lane rules
```

---

### 🔵 Attention Queue

**ID:** `@jive/attention-queue`
**Status:** Official plugin
**Tier:** Tier 2 (6 months)

**Description:**
Prioritized notification queue per role/exec (reduce notification fatigue).

**Features:**

- **Scoring Algorithm:**

  ```
  score = severity(0-10) × urgency(0-10) × ownership(0-1)
          + recency_decay - noise_penalty
  ```

- **Top 3 Items with Actions:**
  - Show only highest-priority items
  - Each item has explicit action button:
    - "Approve Migration" (one-click)
    - "Pause dev-3" (stop agent)
    - "Escalate QA Issue" (notify team)

- **Role-Based Queues:**
  - PM queue: stories waiting for approval, conflicts needing decision
  - Dev queue: blocked stories, code review requests
  - QA queue: stories ready for testing
  - Exec queue: high-level risks, budget alerts

- **Notification Suppression:**
  - Focus mode (Do Not Disturb) - batch updates during focus time
  - Summary notification at end of focus block

**Tech Stack:**

- Event scoring engine
- Priority queue (heap)
- Role-based filtering

**Pricing:** Free (official plugin)

**Installation:**

```bash
jive install @jive/attention-queue

# Setup
jive attention config --focus-hours="9am-12pm,2pm-5pm"
```

---

## Category 5: Observability Plugins

### 🔵 Story Autopsy

**ID:** `@jive/story-autopsy`
**Status:** Official plugin
**Tier:** Tier 1 (3 months)

**Description:**
Timeline replay with causality analysis - "Debugging through time."

**Features:**

- **Visual Design:**
  - Color-coded timeline nodes (Blue=Build/Map, Green=Analyze/Dev, Purple=QA, Red=failures)
  - Hover tooltips with run details (agent, phase, tool, started, input, output, gate status)
  - Right drawer tabs: Changes, Conversation, Gates, Artifacts
  - Bottom playback slider with animation
  - "Pause here" opens workspace snapshot (time-travel)

- **Intelligence Features:**
  - AI Root Cause Summaries (plain English: "Story failed because X, caused by Y")
  - Causality Lens ("Why did this fail?" button shows causal paths)
  - Semantic Filters (filter by agent, artifact type, gate, phase)
  - Conflict Visualization (version deltas showing when/why sync broke)
  - "Simulate Fix" What-If Replay (show alternate timeline if action taken)

- **Audit & Export:**
  - Immutable trace events (hash + timestamp)
  - Story Replay Bundle export (compliance-ready)
  - "Git + Slack + Jira composited into one living replay"

**Use Cases:**

- Developer: see exactly when build went stale
- PM: pinpoint coordination breakdown between Architect and QA
- Product Owner: read plain-English postmortem
- AI Governance Team: audit autonomous decision-making

**Tech Stack:**

- Event sourcing (immutable log)
- Timeline visualization (D3.js)
- LLM for root cause analysis

**Pricing:** Free (official plugin)

**Installation:**

```bash
jive install @jive/story-autopsy
```

---

### 🟣 LangSmith Trace Importer

**ID:** `@langchain/jive-langsmith`
**Status:** Community plugin (by LangChain team)
**Tier:** N/A

**Description:**
Import LangSmith traces into JIVE Story Autopsy.

**Features:**

- LangSmith API integration
- Trace normalization (LangSmith format → JIVE events)
- Link traces to JIVE stories
- Display in Story Autopsy timeline
- Filter by LangSmith session ID

**Tech Stack:**

- LangSmith REST API
- Event transformation pipeline

**Pricing:** Free (open-source)

**Installation:**

```bash
jive install @langchain/jive-langsmith

# Setup
jive langsmith auth --api-key=YOUR_KEY
```

---

### 🟣 Datadog Telemetry Exporter

**ID:** `@datadog/jive-exporter`
**Status:** Community plugin (by Datadog or 3rd party)
**Tier:** N/A

**Description:**
Export JIVE metrics to Datadog for unified observability.

**Features:**

- Agent metrics (utilization, latency, error rate)
- Story metrics (cycle time, throughput, quality)
- Custom dashboards in Datadog
- Alerts based on JIVE data (e.g., "Agent utilization < 50% for 1 hour")

**Tech Stack:**

- Datadog REST API
- Metrics exporter (Prometheus-compatible)

**Pricing:** Free (open-source) + Datadog subscription costs

**Installation:**

```bash
jive install @datadog/jive-exporter

# Setup
jive datadog auth --api-key=YOUR_KEY --app-key=YOUR_APP_KEY
```

---

## Category 6: Utility Plugins

### 🟣 Multimedia Artifacts

**ID:** `@jive/multimedia`
**Status:** Community plugin
**Tier:** Tier 2+ (6 months)

**Description:**
Embed videos, voice memos, prototypes in PRDs and architecture docs.

**Features:**

- `/record explainer` action in artifact drawer (record 90-sec video)
- Media storage alongside docs (S3 or local)
- Auto-transcription for searchability (Whisper API)
- Embed in markdown (video players, audio controls)
- Supported formats: MP4, WebM, MP3, WAV

**Tech Stack:**

- Browser MediaRecorder API
- Transcription service (Whisper, Azure Speech)
- S3 or local file storage

**Pricing:** 🟡 $29/month (Premium - transcription costs)

**Installation:**

```bash
jive install @jive/multimedia

# Setup
jive multimedia config --storage=s3 --bucket=jive-media
```

---

### 🟣 AI Summarizer

**ID:** `@jive/ai-summary`
**Status:** Community plugin
**Tier:** Tier 2+ (6 months)

**Description:**
Auto-generate summaries, reports, and video briefings.

**Features:**

- **Weekly Executive Video Briefing:**
  - LLM generates script from metrics
  - TTS reads it (ElevenLabs, Azure TTS)
  - Chart PNGs rendered via D3
  - Output MP4 posted to Slack/Notion
  - Structure: Opening (15s) + Highlights (30s) + Risks (30s) + Outlook (15s)

- **Sprint Retrospective Auto-Generation:**
  - Aggregate all story traces for completed sprint
  - LLM extracts patterns (repeated blockers, velocity shifts)
  - Generate markdown + embedded video clips
  - Post to `/retro` Slack channel

- **Story Completion Summaries:**
  - On story complete, generate summary: context, implementation, validation, lessons

**Tech Stack:**

- LLM (GPT-4, Claude)
- TTS (ElevenLabs, Azure)
- Video generation (ffmpeg)

**Pricing:** 🟡 $49/month (Premium - LLM/TTS costs)

**Installation:**

```bash
jive install @jive/ai-summary

# Setup
jive ai-summary config --llm=openai --tts=elevenlabs
```

---

### 🟣 Auto-Documentation

**ID:** `@jive/auto-docs`
**Status:** Community plugin
**Tier:** Tier 2+ (6 months)

**Description:**
Generate documentation from completed stories and push to Confluence/Notion.

**Features:**

- **On Story Complete:**
  - Trigger documentation pipeline
  - Render story summary with:
    - Story Context (PRD link, acceptance criteria, dependencies)
    - Implementation (agent(s), commits, files changed, key decisions)
    - Validation (QA results, test coverage delta, deployment notes)
    - Lessons (gotchas encountered, decisions that worked/didn't)

- **Export to Docs Platform:**
  - Push to Confluence via REST API
  - Push to Notion via REST API
  - Format as wiki page or knowledge base article

- **Media Inclusion:**
  - Code diff GIFs
  - Architecture diagrams
  - Mini-video of changes

**Tech Stack:**

- Markdown generator
- Confluence/Notion REST API
- Media rendering (code screenshot tools)

**Pricing:** 🟡 $29/month (Premium)

**Installation:**

```bash
jive install @jive/auto-docs

# Setup
jive auto-docs config --platform=confluence --space=PROJ
```

---

## Category 7: Agent Plugins

### 🟣 Dev Agent (Reference Implementation)

**ID:** `@jive/dev-agent`
**Status:** Reference implementation (open-source)
**Tier:** N/A

**Description:**
Software development agent that implements stories.

**Capabilities:**

- Implement stories from acceptance criteria
- Write tests (unit, integration)
- Refactor code
- Debug failures
- Code review assistance

**Framework:** Can use LangChain, CrewAI, or custom

**Tech Stack:**

- LLM (GPT-4, Claude)
- Code execution sandbox
- Git integration

**Pricing:** Free (open-source reference)

**Installation:**

```bash
jive install @jive/dev-agent

# Setup
jive dev-agent config --llm=anthropic --model=claude-3.5-sonnet
```

---

### 🟣 QA Agent

**ID:** `@jive/qa-agent`
**Status:** Reference implementation
**Tier:** N/A

**Description:**
Quality assurance testing agent.

**Capabilities:**

- Generate test plans
- Write automated tests (Playwright, Jest, pytest)
- Execute test suites
- Report defects with screenshots and logs
- Regression testing

**Framework:** Custom or LangChain-based

**Pricing:** Free (open-source reference)

**Installation:**

```bash
jive install @jive/qa-agent

# Setup
jive qa-agent config --test-framework=playwright
```

---

### 🟣 Architect Agent

**ID:** `@jive/architect-agent`
**Status:** Reference implementation
**Tier:** N/A

**Description:**
Software architecture design agent.

**Capabilities:**

- Create architecture documents
- Design data models (ERD, schema)
- Define API contracts (OpenAPI, GraphQL schema)
- Review technical decisions
- Generate C4 diagrams

**Framework:** Custom or LangChain-based

**Pricing:** Free (open-source reference)

**Installation:**

```bash
jive install @jive/architect-agent

# Setup
jive architect-agent config --diagram-tool=mermaid
```

---

## Plugin Marketplace: Coming Soon

### Marketplace Features

**Discovery:**

- Browse by category (Visualization, Intelligence, Integration, etc.)
- Search by keyword ("GitHub", "analytics", "dashboard")
- Filter by ratings (4+ stars), popularity (100+ installs), price (Free/Paid)

**Plugin Listings:**

- Name, description, screenshots, demo video
- Author info, version, changelog
- Ratings and reviews (5-star, written feedback)
- Install count (social proof)
- Permissions required (transparency)
- Pricing (Free / Paid / Freemium)

**Security:**

- Signed manifests (verified authors via code signing)
- Sandboxed execution (Docker containers or WASM)
- Permission approval flow (user consents before install)
- Admin controls (organization allowlist/blocklist)

**Monetization:**

- Free (open-source community plugins)
- Paid (one-time purchase: $29-$99)
- Subscription ($9-$99/month for premium features)
- Freemium (free tier + paid upgrades)
- Revenue share: JIVE takes 20%, developer gets 80%

---

## How to Build a Plugin

### Quick Start

```bash
# 1. Install SDK
pnpm add @jive/plugin-sdk

# 2. Scaffold plugin
pnpm dlx jive create-plugin my-awesome-plugin

# 3. Develop locally
cd my-awesome-plugin
pnpm dev  # Hot reload with JIVE dev server

# 4. Test
pnpm test  # Run unit + integration tests

# 5. Build
pnpm build  # Bundle for production

# 6. Publish
pnpm dlx jive publish  # Upload to marketplace
```

### Developer Resources

- **Plugin SDK Docs:** https://docs.jive.dev/plugin-sdk
- **API Reference:** https://docs.jive.dev/api
- **Example Plugins:** https://github.com/jive/plugins
- **Community Forum:** https://community.jive.dev
- **Plugin Bounties:** https://bounties.jive.dev

---

## Conclusion

**The plugin architecture transforms JIVE from a monolithic product into an extensible platform:**

- ✅ **Reduces MVP scope** - Ship minimal core in 6 weeks
- ✅ **Enables community** - Developers extend JIVE without bottleneck
- ✅ **Drives adoption** - Users install only what they need
- ✅ **Creates marketplace** - Revenue opportunities for plugin developers
- ✅ **Accelerates innovation** - Features ship independently

**Next Steps:**

1. Finalize Plugin SDK API
2. Build 3 reference plugins (Dashboard, GitHub, Conflict Detector)
3. Launch beta marketplace (10 plugin developers)
4. Open ecosystem to community

---

_End of Plugin Catalog_
