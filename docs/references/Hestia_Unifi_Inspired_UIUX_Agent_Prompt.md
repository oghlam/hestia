# Hestia Care Command Center — UniFi-Inspired UI/UX Implementation Prompt

## ROLE

Act as a **Senior Web Application Architect, Senior Frontend Engineer, and Senior UI/UX Designer**.

You are implementing the Hestia web application as a production-quality **Care Command Center**, not a generic healthcare dashboard.

Use the existing Hestia architecture and design specification as the source of truth for product capabilities, modules, technology stack, and existing terminology. The existing specification defines Hestia as an AI-powered Care Command Center integrating real-time computer vision, ambient biometric telemetry, spatial room mapping, AI care triage, resident/care-team management, and auditable safety rules into a unified web application shell.

Reference source requirements:
- Preserve Hestia's existing React 19 + Vite + Vanilla CSS architecture.
- Preserve the existing Hestia modules and terminology.
- Preserve the existing semantic care statuses: Normal, Watch, Help, Critical.
- Preserve the existing spatial/floorplan and AI-monitoring concepts.
- Do not replace the existing Hestia product architecture with a generic template.

The existing architecture specifies a SPA with React 19, Vite, Vanilla CSS/CSS Custom Properties, responsive desktop/mobile behavior, and modular views including Dashboard, Floorplan, Residents, Care Team, Rules, AI Inference Pipeline Studio, and Database Studio.

---

# 1. PRIMARY OBJECTIVE

Redesign and implement the Hestia interface using the **interaction model and information architecture principles of a professional UniFi Controller / UniFi Site Manager**, adapted specifically for elder-care operations.

Do NOT clone UniFi visually or copy its branding.

The goal is to reproduce the underlying UX principles:

- persistent application shell
- compact technical navigation
- context-aware workspace
- decision-first interfaces
- progressive disclosure
- operational monitoring
- dense but readable data presentation
- topology/spatial visualization
- contextual side drawers
- status-driven UI
- table-based operational views
- minimal decorative UI
- functional animation
- fast operator comprehension

Hestia should feel like:

> **A professional Care Control Plane for a smart residence.**

It should NOT feel like:

> a generic medical SaaS dashboard, a marketing website, or a collection of disconnected analytics cards.

---

# 2. EXISTING HESTIA PRODUCT MODEL

Use this conceptual model as the foundation:

```text
HESTIA
│
├── Care Command Center
│
├── Residents
│
├── Rooms / Spatial Floorplan
│
├── Devices
│   ├── Ring
│   ├── Camera
│   ├── Sensor
│   └── Other telemetry sources
│
├── AI Inference
│
├── Care Team
│
├── Alerts / Incidents
│
├── Safety Rules
│
└── Database / Storage
```

Hestia's core value is not simply displaying information.

It must help an operator answer:

```text
WHO needs attention?
WHERE is the event?
WHAT happened?
HOW serious is it?
WHAT detected it?
WHAT should happen next?
```

These questions must drive the information hierarchy.

---

# 3. UNI FI-INSPIRED APPLICATION SHELL

Create a persistent desktop-first application shell.

```text
┌─────────────────────────────────────────────────────────────┐
│ TOPBAR                                                      │
├───────┬─────────────────────────────────────────────────────┤
│       │                                                     │
│ ICON  │                 MAIN WORKSPACE                      │
│ RAIL  │                                                     │
│       │                                                     │
│       │                                                     │
│       │                                                     │
└───────┴─────────────────────────────────────────────────────┘
```

Existing Hestia architecture contains:
- Sidebar Navigation
- Topbar Header
- Main Viewport
- Resident Quick Switcher
- Search
- System Online Status
- Notifications
- Profile

Retain these concepts, but redesign the shell toward a compact infrastructure-control-plane pattern.

---

# 4. SIDEBAR / ICON RAIL

Desktop navigation should become compact and information-dense.

Target width:

```text
48–64px collapsed/icon rail
```

Allow an expanded navigation state when required.

Primary navigation:

```text
Overview
Floorplan
Residents
Devices
AI Inference
Care Team
Alerts
Rules
Database
Settings
```

Use clear monochrome icons.

Active navigation must have:
- subtle background
- clear indicator
- strong contrast
- no oversized pill
- no excessive color

Avoid a large marketing-style sidebar.

The navigation should visually communicate:

> "control system"

rather than:

> "SaaS product menu".

---

# 5. TOPBAR

Create a compact global topbar.

Target height:

```text
60–68px
```

Structure:

```text
[ Hestia ] [ Residence Selector ▼ ] [ Current Context ]

                         [ Search ]
                         [ System Online ]
                         [ Alerts ]
                         [ User ]
```

Components:

- Mobile menu
- Residence/site selector
- Global search
- System health
- Notification center
- User/profile

The residence selector is conceptually equivalent to a network Site Selector.

Example:

```text
Residence
├── Main Residence
├── East Wing
├── Assisted Living
└── Test Environment
```

Changing residence/context must update all relevant spatial, resident, device, and alert information without destroying the application shell.

---

# 6. HESTIA "SITE" CONCEPT

Adapt UniFi's site-centric mental model to Hestia.

Use:

```text
Residence
    ↓
Rooms
    ↓
Devices / Sensors
    ↓
Residents
    ↓
Events
    ↓
Care Actions
```

The operator should always know the active context.

Example:

```text
Main Residence
/
Kitchen
/
Live Monitoring
```

Avoid forcing the user through multiple pages merely to understand context.

---

# 7. OVERVIEW / COMMAND CENTER

The Dashboard Overview must behave like an operational command center.

Do NOT make it a collection of giant KPI cards.

Priority order:

```text
1. Critical / Help events
2. Active resident situations
3. Spatial state
4. Device/system health
5. Recent events
6. Care team state
7. Secondary analytics
```

The dashboard should answer the user's questions within a few seconds.

Recommended structure:

```text
┌─────────────────────────────────────────────────────────────┐
│ Residence Overview                            System ● Online│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ACTIVE CARE STATE                                           │
│                                                             │
│ [ Critical 1 ] [ Help 2 ] [ Watch 4 ] [ Normal 18 ]       │
│                                                             │
├──────────────────────────────────┬──────────────────────────┤
│                                  │                          │
│ LIVE SPATIAL VIEW                │ ACTIVE INCIDENTS         │
│                                  │                          │
│ Floorplan                        │ Critical / Help / Watch  │
│                                  │                          │
├──────────────────────────────────┴──────────────────────────┤
│ DEVICE / SYSTEM HEALTH                                      │
├─────────────────────────────────────────────────────────────┤
│ RECENT CARE EVENTS                                          │
└─────────────────────────────────────────────────────────────┘
```

The spatial view and active incidents should dominate the operational dashboard.

---

# 8. CARE STATUS SYSTEM

Use Hestia's existing four-level status model:

```text
NORMAL
WATCH
HELP
CRITICAL
```

Semantic hierarchy:

### NORMAL
Stable / no action required.

### WATCH
Potential anomaly or condition requiring observation.

### HELP
Assistance may be required.

### CRITICAL
Immediate attention required.

Do not use status colors everywhere.

Use status color only on:
- status indicator
- alert badge
- critical value
- event marker
- selected state

Keep the rest of the UI neutral.

---

# 9. STATUS VISUAL LANGUAGE

Base visual system:

```text
Background:
#f8fafc

Surface:
#ffffff

Deep Navy:
#14233d
#0f172a

Cobalt / Interactive:
#005cf5
#0284c7

Normal:
#15803d
#10b981
#eaf8ef

Watch:
#b45309
#f59e0b
#fef3c7

Help:
#b91c1c
#dc2626
#fee2e2

Critical:
#991b1b
#ef4444
```

These values follow the existing Hestia design specification.

Use semantic colors carefully.

Do not make the whole application red/yellow/green.

---

# 10. SPATIAL FLOORPLAN AS THE HESTIA TOPOLOGY

The most important UniFi concept to adapt is topology.

For Hestia, replace:

```text
Network topology
```

with:

```text
Care topology / spatial topology
```

Example:

```text
                    RESIDENCE
                        │
              ┌─────────┴─────────┐
              │                   │
           BEDROOM              KITCHEN
              │                   │
          Ring Camera         Ring / Sensor
              │                   │
           Resident             Resident
              │                   │
          AI Events           AI Events
```

But the actual UI should use the floorplan as the primary spatial representation.

Example:

```text
┌───────────────────────────────────────────────┐
│ LIVE FLOORPLAN                                │
│                                               │
│  ┌───────────┐       ┌───────────────────┐   │
│  │ BEDROOM   │       │     KITCHEN       │   │
│  │           │       │                   │   │
│  │    ●      │       │       ●           │   │
│  │ Resident  │       │    Ring Device    │   │
│  └───────────┘       └───────────────────┘   │
│                                               │
│  ● Normal   ● Watch   ● Help   ● Critical   │
└───────────────────────────────────────────────┘
```

The floorplan must be interactive.

---

# 11. FLOORPLAN INTERACTION

Users must be able to:

- click a room
- click a device
- click a resident marker
- click an incident marker
- zoom
- pan
- filter status
- show/hide device layers
- show/hide resident layer
- show/hide AI detection overlays

Click behavior:

```text
Floorplan marker
        ↓
Highlight marker
        ↓
Open contextual drawer
        ↓
Keep floorplan visible
```

Do NOT navigate away immediately.

---

# 12. CONTEXTUAL RIGHT DRAWER

Use the UniFi-style contextual side panel as a core Hestia interaction pattern.

When the user clicks:
- resident
- room
- Ring device
- camera
- alert
- event

open a right-side drawer.

Example:

```text
┌────────────────────────────────────┐
│ Kitchen                       ×     │
├────────────────────────────────────┤
│ ● WATCH                            │
│                                    │
│ Current Activity                   │
│ Movement detected                  │
│                                    │
├────────────────────────────────────┤
│ DEVICES                            │
│ Ring Camera             ● Online   │
│ Ambient Sensor           ● Online  │
│                                    │
├────────────────────────────────────┤
│ AI EVENTS                          │
│ 20:31 Movement detected            │
│ 20:28 Voice activity               │
│                                    │
├────────────────────────────────────┤
│ [ View Live ] [ Inspect ]          │
└────────────────────────────────────┘
```

The background workspace remains visible.

This is a major requirement.

---

# 13. RESIDENT CONTEXT DRAWER

Resident drawer:

```text
Resident
Status
Current room

Safety state

Recent activity

AI detections

Emergency / medical tags

Assigned caregiver

Recent incidents

Actions
```

Do not expose every piece of data immediately.

Use progressive disclosure.

---

# 14. DEVICE DRAWER

Device drawer:

```text
Device
Model
Connection
Status

Telemetry
- signal
- battery
- connectivity
- last seen

AI capability
- camera
- audio
- vision
- sensor

Recent events

Actions
```

Use compact metrics.

---

# 15. ALERT / INCIDENT SYSTEM

Create an operational incident list.

Example:

```text
ACTIVE INCIDENTS

● CRITICAL
Bedroom
Resident fall detected
2 min ago

● HELP
Kitchen
Distress vocal cue detected
6 min ago

● WATCH
Living Room
Unusual inactivity
14 min ago
```

Each row is clickable.

Click:

```text
Incident
 ↓
Incident Drawer
 ↓
Related Resident
 ↓
Related Room
 ↓
Related Device
 ↓
AI Evidence
 ↓
Care Action
```

This establishes traceability.

---

# 16. AI CARE TRIAGE

Hestia already defines AI-driven care triage.

Represent AI inference as an operational pipeline.

Example:

```text
CAMERA / RING
      ↓
VISION / AUDIO
      ↓
EVENT DETECTION
      ↓
CONTEXT ENGINE
      ↓
CARE TRIAGE
      ↓
NORMAL / WATCH / HELP / CRITICAL
      ↓
RULE ENGINE
      ↓
CARE TEAM / ALERT / WEBHOOK
```

Do not make this look like a developer-only pipeline.

Provide two modes:

### Operator mode
Simple:

```text
Fall detected
↓
Confidence 94%
↓
Bedroom
↓
CRITICAL
```

### Technical mode
Detailed:

```text
source
model
confidence
timestamp
inference
rule
action
```

Use progressive disclosure.

---

# 17. AI EVENT CARD

Example:

```text
┌──────────────────────────────────────┐
│ CRITICAL                             │
│ Elder Fall & Distress Priority Guard │
├──────────────────────────────────────┤
│ Location: Bedroom                    │
│ Source: Ring Camera                  │
│ Detection: Ground-level posture      │
│ Confidence: 94%                      │
│ Distress cue: Detected               │
│                                      │
│ 21:42:16                              │
│                                      │
│ [ View Evidence ] [ Respond ]        │
└──────────────────────────────────────┘
```

The visual evidence should be accessible without losing operational context.

---

# 18. OPERATIONAL TABLES

Use dense tables for management screens.

Tables are preferred for:

- devices
- residents
- care team
- events
- rules
- alerts
- system health

Example:

```text
DEVICES

Device       Room       Status     Last Seen     Health
Ring-01      Bedroom    ● Online   2 sec         99%
Ring-02      Kitchen    ● Online   3 sec         98%
Camera-03    Living     ● Warning  12 sec        74%
```

Use compact rows.

Target:

```text
32–40px row height
```

Avoid oversized cards.

---

# 19. COMPACT METRIC BARS

When displaying a numeric health value, combine number + visual encoding.

Example:

```text
Device Health
█████████░  94%

Battery
███████░░░  71%

Signal
████████░░  82%
```

The bar supplements the number.

Never hide the actual numeric value.

---

# 20. CARE TEAM VIEW

Adapt operational device-management patterns for caregivers.

Example:

```text
CARE TEAM

Caregiver      Status       Active Cases
Sarah          ● Available  2
Michael        ● On Duty    4
Anna           ● Away       0
```

Clicking a caregiver opens a contextual drawer.

Drawer:

```text
Caregiver
Availability
Assigned residents
Current incidents
Recent actions
```

---

# 21. SAFETY RULE ENGINE

Use the existing Hestia concept of auditable safety rules.

Display rules as operational configuration.

Example:

```text
RULES

Elder Fall & Distress Priority Guard

WHEN
impact detected
AND
ground-level posture detected
AND
distress vocal cue detected

THEN
set severity = CRITICAL
notify care team
trigger configured alert
create audit event
```

Rules should be understandable to operators.

Provide technical details only when expanded.

---

# 22. RULE BUILDER UX

Use:

```text
WHEN
[ Detection ▼ ]
[ Condition ▼ ]
[ Threshold ]

AND
[ Condition ]

THEN
[ Set Care Status ▼ ]
[ Notify Team ▼ ]
[ Trigger Action ▼ ]
```

Avoid a developer-centric code editor as the default interface.

---

# 23. EVENTS / AUDIT LOG

Create an auditable event timeline.

Each event:

```text
timestamp
severity
resident
room
source
AI inference
rule
action
operator
result
```

Example:

```text
21:42:16  CRITICAL
Bedroom
Fall detected
Ring Camera
Rule: Elder Fall & Distress Priority Guard
Action: Care team notification
Status: Delivered
```

This supports Hestia's requirement for auditable safety rules.

---

# 24. RESPONSIVE DESIGN

Existing Hestia specification:

Desktop:
- ≥1180px
- fixed sidebar
- 67px topbar
- multi-column workspace

Tablet/mobile:
- <900px
- off-canvas navigation
- stacked metric grids
- minimum 44px touch targets

Preserve these requirements.

For desktop, prioritize operational density.

For mobile:
- collapse navigation
- stack workspace
- preserve critical alerts
- allow horizontal table scrolling
- use full-width contextual drawers or bottom sheets where appropriate

---

# 25. TYPOGRAPHY

Preserve Hestia's existing typography system:

- DM Sans
- Playfair Display where appropriate for brand/editorial emphasis

However, operational screens should primarily use DM Sans.

Approximate hierarchy:

```text
Page title       20–24px
Section title    14–16px
Body             13–14px
Metadata         11–12px
Table text       12–13px
KPI              24–32px
```

Avoid oversized typography in operational areas.

---

# 26. SPACING

Use a compact spacing scale:

```text
4px
8px
12px
16px
24px
32px
```

Use 24–32px workspace padding on desktop.

Operational tables should remain dense.

---

# 27. CARDS

Cards are allowed, but only where they improve grouping.

Good:

```text
Active Incident
Device Health
Resident Status
AI Event
```

Bad:

```text
Card around every field
Card inside card inside card
Huge decorative KPI card
```

Do not turn the application into a grid of floating cards.

---

# 28. MOTION

Animation must communicate state or transition.

Allowed:

```text
drawer slide
status transition
topology connection activity
floorplan marker pulse
table update
loading transition
```

Avoid:

```text
constant floating
large decorative transitions
continuous chart animation
unnecessary parallax
marketing animation
```

Critical alerts may use a subtle pulse, but never make the entire screen flash.

---

# 29. SYSTEM STATES

Every major component must support:

```text
loading
success
empty
warning
error
offline
stale
```

Examples:

Camera disconnected:

```text
Camera Offline
Last frame received 42 sec ago
```

No residents:

```text
No residents configured
```

No incidents:

```text
No active care incidents
System stable
```

Do not leave blank empty containers.

---

# 30. ACCESSIBILITY

Preserve the existing WCAG AA requirement.

Ensure:

- keyboard navigation
- visible focus
- adequate contrast
- minimum touch target 44px on mobile
- semantic buttons
- accessible status labels
- no status communicated by color alone
- screen-reader labels for icons

---

# 31. PERFORMANCE

Hestia is a high-performance SPA.

Avoid unnecessary re-rendering.

Use:

- React component boundaries
- memoization where justified
- virtualized long event/device lists where required
- lazy loading for heavy views
- lightweight SVG/canvas for topology/floorplan visualization
- efficient state updates

Do not sacrifice responsiveness for decorative effects.

---

# 32. COMPONENT ARCHITECTURE

Build reusable components:

```text
AppShell
IconRail
TopBar
ResidenceSelector
GlobalSearch
SystemStatus
NotificationCenter

CareStatusBadge
SeverityIndicator
MetricCard
MetricBar

FloorplanCanvas
RoomNode
ResidentMarker
DeviceMarker
IncidentMarker
SpatialLayerControl

IncidentList
IncidentRow
IncidentDrawer

ResidentTable
ResidentDrawer

DeviceTable
DeviceRow
DeviceDrawer

CareTeamTable
CaregiverDrawer

AIEventCard
InferencePipeline
EvidencePanel

RuleList
RuleBuilder
RuleDetailDrawer

EventTimeline
AuditLog

DataTable
FilterBar
SearchCommand
EmptyState
LoadingState
ErrorState
```

Keep components reusable and composable.

---

# 33. DATA MODEL

Use a domain model similar to:

```typescript
Organization
  └── Residence
       ├── Rooms
       │    ├── Devices
       │    ├── Residents
       │    └── Events
       │
       ├── CareTeam
       ├── Incidents
       ├── AIInferences
       ├── Rules
       └── AuditEvents
```

Example Resident:

```typescript
{
  id,
  name,
  room,
  status,
  emergencyTags,
  assignedCaregiver,
  currentActivity,
  lastSeen,
  recentEvents
}
```

Example Device:

```typescript
{
  id,
  name,
  type,
  room,
  status,
  health,
  lastSeen,
  capabilities,
  telemetry
}
```

Example Incident:

```typescript
{
  id,
  severity,
  residentId,
  roomId,
  deviceId,
  source,
  detection,
  confidence,
  timestamp,
  ruleId,
  actions,
  status
}
```

---

# 34. INTERACTION CONTRACT

Implement these interactions as first-class behaviors.

## Navigation

```text
Sidebar click
→ update route/view
→ preserve AppShell
```

## Residence selection

```text
Residence selector
→ change active residence
→ refresh contextual data
→ preserve current module
```

## Floorplan marker

```text
Marker click
→ highlight marker
→ open drawer
→ preserve floorplan
```

## Incident

```text
Incident click
→ open IncidentDrawer
→ highlight room
→ highlight resident
→ highlight device
```

## Device

```text
Device click
→ open DeviceDrawer
→ show telemetry
→ show recent events
```

## Resident

```text
Resident click
→ open ResidentDrawer
→ show care context
→ show active incidents
```

---

# 35. COMMAND CENTER INFORMATION HIERARCHY

Every screen should follow this hierarchy:

```text
CONTEXT
  ↓
CURRENT STATE
  ↓
EXCEPTION / ALERT
  ↓
EVIDENCE
  ↓
DETAIL
  ↓
ACTION
```

For example:

```text
Bedroom
  ↓
CRITICAL
  ↓
Fall detected
  ↓
Ring Camera evidence
  ↓
AI inference
  ↓
Care response
```

This hierarchy is more important than decorative styling.

---

# 36. DESIGN PRINCIPLES

Follow these rules throughout the application:

1. Operational information has priority over decoration.
2. Critical state must be visible immediately.
3. Preserve context when opening details.
4. Prefer contextual drawers over unnecessary page navigation.
5. Use tables for operational management.
6. Use spatial visualization for location-dependent information.
7. Use color semantically.
8. Use compact controls.
9. Use progressive disclosure.
10. Keep the UI calm even when the underlying event is critical.
11. Never hide critical information behind multiple interactions.
12. Avoid visual noise.
13. Avoid generic SaaS dashboard patterns.
14. Keep the interface original; do not copy UniFi branding or proprietary visual assets.
15. Design for professional operators first.

---

# 37. VISUAL QUALITY BAR

The final interface should feel like a combination of:

```text
Enterprise Network Controller
+
Mission Control
+
Spatial Monitoring System
+
Care Operations Console
```

The visual result should communicate:

```text
precision
trust
situational awareness
operational control
clarity
calm
```

Avoid:

```text
generic healthcare SaaS
marketing landing page
overly soft medical UI
dashboard template
excessive glassmorphism
excessive gradients
giant rounded cards
excessive shadows
rainbow charts
decorative 3D graphics
```

---

# 38. IMPLEMENTATION STRATEGY

Do not rebuild the application blindly.

First inspect the existing Hestia codebase.

Identify:

```text
existing components
existing routes
existing CSS
existing data structures
existing floorplan
existing mock data
existing assets
existing state management
```

Then refactor incrementally.

Do not delete working Hestia functionality simply to achieve the new visual style.

Preserve existing business logic where possible.

Separate:

```text
domain/data
    ↓
state
    ↓
UI components
    ↓
layout
    ↓
visual design
```

---

# 39. IMPLEMENTATION PHASES

Execute in this order:

### Phase 1 — App Shell

Implement:

- IconRail
- TopBar
- ResidenceSelector
- responsive shell
- global status
- routing/view state

### Phase 2 — Command Center

Implement:

- care status summary
- active incidents
- spatial floorplan
- recent events
- device health

### Phase 3 — Contextual Interaction

Implement:

- IncidentDrawer
- ResidentDrawer
- DeviceDrawer
- RoomDrawer

### Phase 4 — Operational Modules

Implement:

- Devices table
- Residents table
- Care Team table
- Events / audit table
- Rules management

### Phase 5 — AI Operations

Implement:

- AI inference view
- inference pipeline
- AI event cards
- evidence panel
- confidence / detection metadata

### Phase 6 — Polish

Implement:

- loading states
- empty states
- error states
- offline states
- transitions
- accessibility
- responsive behavior
- performance optimization

---

# 40. ACCEPTANCE CRITERIA

The implementation is successful when:

### Visual

- Hestia no longer looks like a generic SaaS dashboard.
- Navigation is compact and controller-like.
- Operational screens are information-dense but readable.
- Spatial monitoring is a primary visual element.
- Status hierarchy is immediately understandable.
- Tables are compact and professional.
- Drawers preserve context.

### Functional

- Navigation works.
- Residence switching works.
- Floorplan interaction works.
- Resident selection works.
- Device selection works.
- Incident selection works.
- Contextual drawers work.
- Filtering/search works.
- Loading/error/empty states work.
- Responsive behavior works.

### UX

An operator should be able to determine within a few seconds:

```text
Is anyone in danger?
Where?
What happened?
How severe?
What detected it?
What is the current response?
```

without navigating through multiple unrelated screens.

---

# 41. FINAL DIRECTIVE TO THE AGENT

Do not treat this task as a visual reskin.

Treat it as a **UX architecture transformation**.

Use the UniFi-inspired principles of:

```text
persistent shell
site/context selection
decision-first setup
compact configuration
operational tables
topology/spatial visualization
contextual drawers
semantic status
progressive disclosure
```

and translate them into the Hestia domain:

```text
Residence
Rooms
Residents
Devices
AI Detection
Incidents
Care Team
Safety Rules
Care Actions
Audit Events
```

The resulting application must remain unmistakably **Hestia**.

The goal is:

> **UniFi-style control-plane UX architecture adapted into an AI-powered Elder Care Command Center.**

Do not copy UniFi branding, logo, proprietary assets, or exact visual implementation.

Build an original, production-quality Hestia interface using the existing React 19 + Vite + Vanilla CSS architecture and the existing Hestia design tokens wherever they remain appropriate.
