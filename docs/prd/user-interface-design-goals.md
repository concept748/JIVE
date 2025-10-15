# User Interface Design Goals

## Overall UX Vision

The JIVE Dashboard embodies a **"Mission Control"** aesthetic - providing at-a-glance situational awareness with actionable intelligence. The interface prioritizes real-time information density while maintaining clarity and preventing cognitive overload. Users should feel like they're observing a living system where agents are active participants, not passive tools. The UX emphasizes:

- **Ambient Awareness:** Users can glance at the dashboard and instantly understand project health without drilling into details
- **Progressive Disclosure:** High-level portfolio view → project detail view → artifact/agent detail panels
- **Real-Time Feedback:** Visual animations and indicators communicate system activity (pulsing agent cards, sliding story cards, conflict alerts)
- **Action-Oriented:** Every screen provides clear next actions (resolve conflict, view artifact, switch project)
- **Zero-Latency Feel:** WebSocket updates create the perception of instantaneous synchronization between file system and dashboard

## Key Interaction Paradigms

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

## Core Screens and Views

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

## Accessibility: WCAG AA

- Semantic HTML with proper heading hierarchy
- Keyboard navigation support (tab order, focus indicators)
- Color contrast ratios meeting WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- ARIA labels for interactive elements (agent cards, project cards, buttons)
- Screen reader announcements for real-time updates (e.g., "Developer agent started working on authentication story")
- Focus management in modals (trap focus, return focus on close)
- Alt text for all visual indicators (status colors have accompanying text labels)

**Assumption:** Full WCAG AAA compliance is deferred to Phase 2 based on user feedback and accessibility testing

## Branding

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

## Target Device and Platforms: Web Responsive (Desktop-First)

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
