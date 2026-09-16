Build a professional enterprise network management dashboard inspired by the information architecture and interaction model of the UniFi Controller / UniFi Site Manager.

The goal is NOT to create a pixel-perfect clone of UniFi.

Instead, reproduce the underlying UX principles:

- dense but clean enterprise interface
- clear network hierarchy
- site-centric management
- device-centric interaction
- topology visualization
- contextual side panels
- compact information hierarchy
- restrained use of color
- functional motion
- fast navigation
- minimal visual decoration

## 1. APPLICATION STRUCTURE

Create a persistent application shell:

AppShell
├── Sidebar
├── TopBar
├── MainContent
└── ContextualDrawer

Sidebar navigation:

- Overview
- Devices
- Clients
- Topology
- Networks
- Site Magic
- Insights
- Events
- Settings

The sidebar must support collapsed and expanded states.

The active navigation item must be visually obvious but subtle.

Do not use oversized navigation elements.

## 2. GLOBAL TOP BAR

Create:

- application/site identity
- Site Selector
- global search
- notification indicator
- system health indicator
- user/settings menu

Site Selector example:

Home
Office
Warehouse
Branch Jakarta
Branch Surabaya

Changing the active site must update all site-scoped data without destroying the global application shell.

## 3. DASHBOARD

The Overview page must answer:

"What is the current state of my network?"

Primary KPI cards:

- Network Health
- Devices
- Clients
- Internet
- Active Alerts

Keep cards compact.

Use status colors only for semantic state:

- healthy
- warning
- critical
- offline

Do not use colors as decoration.

## 4. DEVICE MODEL

Support:

- Gateway
- Switch
- Access Point
- Camera
- Other network devices

Each DeviceCard contains:

- device icon
- device name
- model
- online/offline state
- CPU
- memory
- traffic
- connected clients
- last seen
- action

Clicking a device must NOT navigate immediately to a new page.

Instead:

1. highlight the device
2. open a right-side contextual drawer
3. show detailed metrics
4. preserve the current dashboard/topology behind the drawer

## 5. TOPOLOGY

Topology is a primary visualization.

Represent:

Internet
↓
Gateway
↓
Switch
↓
Access Points / Cameras / Clients

Example:

Internet
    │
    ▼
Gateway
    │
 ┌──┴─────┐
 ▼        ▼
Switch    Site Magic
 │
 ├── AP
 ├── AP
 └── Camera

Topology nodes must be interactive.

Clicking a node:

- highlights the node
- opens contextual detail drawer
- displays connection information
- preserves the topology view

Connections should visually communicate:

- online
- degraded
- offline
- VPN/site-to-site

## 6. SITE MAGIC

Create a dedicated Site Magic view.

Primary visual:

multiple network sites connected through secure logical links.

Example:

SURABAYA
Gateway
   │
   └──────────────────────┐
                          │
                    secure tunnel
                          │
   ┌──────────────────────┘
   │
JAKARTA
Gateway

Show:

- connection status
- latency
- throughput
- tunnel state
- connected sites
- last synchronization
- errors/warnings

Use subtle animated traffic particles on active connections.

Animation must communicate network activity, not act as decoration.

## 7. CONTEXTUAL DRAWER

Use a right-side drawer rather than large modal dialogs.

Structure:

Header
- device/site name
- status
- close button

Summary
- model
- uptime
- health

Metrics
- CPU
- memory
- traffic
- clients

Connectivity
- WAN
- LAN
- VPN
- latency

Actions
- configure
- restart
- inspect
- view events

The underlying dashboard/topology must remain visible.

## 8. EVENTS / ALERTS

Create a compact event stream.

Example:

● 2m
Gateway latency increased

● 8m
AP-03 went offline

● 14m
New client connected

Events must be clickable.

Clicking an event should:

- open contextual details
- identify the related device
- highlight the device in topology where applicable

## 9. VISUAL DESIGN

Use an enterprise network-console visual language.

Characteristics:

- neutral background
- subtle borders
- compact typography
- restrained shadows
- minimal decoration
- compact cards
- technical visual hierarchy
- monochrome icons
- semantic status colors

Avoid:

- marketing dashboard aesthetics
- oversized hero sections
- excessive gradients
- glassmorphism
- excessive rounded cards
- excessive shadows
- giant typography
- decorative illustrations
- unnecessary 3D objects
- excessive chart colors

The UI must feel like a real network controller rather than a generic SaaS analytics application.

## 10. TYPOGRAPHY

Use approximately:

Page title: 20–24px
Section title: 14–16px
Body: 13–14px
Metadata: 11–12px
KPI: 24–32px

Maintain strong information hierarchy.

## 11. SPACING

Use a consistent spacing scale:

4
8
12
16
24
32 px

Cards:

4–8px radius

Avoid excessive rounding.

## 12. MOTION

Motion must be functional.

Topology:

node → connection → traffic flow

Drawer:

slide from right

Status:

healthy → subtle indicator
warning → subtle pulse
offline → static

Avoid continuous decorative animation.

## 13. RESPONSIVENESS

Desktop is the primary target.

Minimum useful layouts:

1440px desktop
1920px desktop
1280px laptop
tablet fallback

The topology should remain usable at large desktop resolutions.

## 14. COMPONENT ARCHITECTURE

Create reusable components:

AppShell
Sidebar
TopBar
SiteSelector
StatusIndicator
MetricCard
DeviceCard
DeviceDrawer
TopologyCanvas
TopologyNode
TopologyConnection
SiteMagicMap
SiteCard
AlertList
EventList
MetricChart
NetworkHealth
ClientList
SearchCommand
NotificationCenter

Keep data and presentation separated.

## 15. DATA MODEL

Use:

Organization
└── Sites
    ├── Devices
    ├── Clients
    ├── Networks
    ├── Connections
    └── Events

Device:

{
  id,
  name,
  type,
  model,
  status,
  health,
  cpu,
  memory,
  traffic,
  clients,
  lastSeen
}

Site:

{
  id,
  name,
  location,
  status,
  gateway,
  devices,
  clients,
  connections
}

Connection:

{
  sourceSite,
  destinationSite,
  status,
  latency,
  throughput,
  packetLoss
}

## 16. INTERACTION RULES

Navigation:

sidebar click
→ update active route
→ preserve application shell

Site change:

site selector
→ change active site
→ update all site-scoped widgets
→ preserve current section

Device click:

device
→ highlight device
→ open contextual drawer

Topology click:

node
→ highlight node
→ open device/site drawer

Alert click:

alert
→ open event details
→ highlight related resource

## 17. IMPORTANT UX PRINCIPLE

The interface should allow an administrator to understand the network state within a few seconds.

Prioritize:

1. health
2. connectivity
3. devices
4. clients
5. alerts
6. topology
7. detailed metrics

Do not expose every piece of information at the same visual priority.

Use progressive disclosure.

## 18. IMPLEMENTATION PRINCIPLE

Build the UI as a real interactive controller prototype, not a static mockup.

Use realistic mock network data.

All major interactions must work:

- site switching
- sidebar navigation
- device selection
- topology selection
- drawer opening/closing
- alert interaction
- filtering
- search
- status changes

The final result should visually and behaviorally feel like an enterprise network controller inspired by UniFi Controller / Site Manager, while remaining an original implementation.