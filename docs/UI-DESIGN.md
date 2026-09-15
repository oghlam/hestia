# HESTIA UI Design

The following references are implementation references, not merely inspiration:

- [Dashboard mockup](references/dashboard-mockup.png)
- [Validator mobile mockup](references/validator-mobile-mockup.png)

The current workdir contains these approved mockups, but does not yet contain the frontend implementation.

## UX philosophy

HESTIA should feel calm, trustworthy, human, and low-noise. It should help a caregiver move from understanding to action without exposing raw AI output as an interpretation task.

The information hierarchy is:

```text
Person → Activity → Scene → Care Action
```

## Visual direction

The visual direction is modern and inspired by UniFi / Ubiquiti Controller: flat, dynamic, elegant, clean, and information-dense without feeling noisy.

- Warm amber represents home and human care.
- Deep teal represents technology and system context.
- Green represents safe / normal.
- Muted red represents intervention.

Avoid excessive holograms, cyberpunk styling, glowing effects, and “AI dashboard” overload.

## Desktop dashboard

Desktop is the **Care Command Center**. The dashboard should preserve the mockup's information hierarchy, calm density, room/status cards, alert prominence, navigation structure, and semantic status treatment.

Its intended structure includes:

- left navigation;
- contextual header and greeting;
- home and resident status;
- room/status cards;
- active alerts;
- activity feed;
- home/floor map;
- care team;
- system/integration status.

The dashboard should answer: **Who? Where? What happened? How serious? Who is handling it?**

## Scene states

The same semantic treatment should be used across room cards, alerts, activity feed, and dashboard status:

```text
S1 NORMAL     Safe and calm
S2 WATCH      Needs observation
S3 HELP       Caregiver validation required
S4 CRITICAL   Immediate response required
```

S1 and S2 should not make the interface feel alarming. S3 and S4 should be clear and actionable without turning the entire product into an emergency display.

## Alert UX

Alerts should present:

```text
Person → Location → Event → Confidence → Required action
```

The caregiver should receive a useful care context rather than having to interpret raw model output.

## Validator mobile

Mobile is a **Fast Action Interface**, not a miniature dashboard. It should preserve the mockup's fast-action interaction, prominent alert state, resident/location context, OK / COMING / SIREN actions, care-in-progress state, and handled confirmation.

The intended flow is:

```text
🔴 HELP
Possible distress detected

Eleanor
Bedroom

[ OK ]
[ COMING ]
[ SIREN ]
```

Then:

```text
COMING
↓
CARE IN PROGRESS
↓
I'VE ARRIVED
↓
ALERT HANDLED
```

The purpose is to let a caregiver acknowledge responsibility in seconds while family receives reassurance that someone is handling the situation.

## Responsive behavior

```text
Desktop → Care Command Center
Mobile  → Fast Care Action / Validator
```

Mobile should prioritize immediate action rather than expose every dashboard feature.

## Current status

This is the approved UI direction for future implementation. Responsive behavior, loading/error/empty states, alert transitions, and visual consistency remain implementation and verification work tracked in the development documents.
