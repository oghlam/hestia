# HESTIA — Elder Care Command Center for Ring

## One-line Summary

HESTIA transforms Ring events into calm, actionable elder-care context so caregivers can validate incidents quickly and families can stay reassured.

## Problem

Families and caregivers often receive raw motion or camera alerts without enough context. These alerts can create anxiety, false alarms, and delayed action—especially when the person detected is an unknown visitor rather than the resident who needs care.

## Solution

HESTIA is an elder-care command center built around the flow:

`Ring event → scene context → caregiver validation → family reassurance`

It combines Ring event ingestion, resident-targeted local face matching, deterministic scene classification, Amazon Nova Micro text summaries, a desktop care dashboard, and a mobile-first validator interface.

## Why This Matters

HESTIA keeps the human caregiver in control while reducing noise. The system presents information in the order `Person → Activity → Scene → Care Action`, separates unknown visitors from resident-care alerts, and gives families a clear status after a caregiver responds.

## How We Used AI

- Amazon Bedrock Nova Micro receives structured text metadata about the resident, room, scene, confidence, and signals.
- Nova Micro generates a short, compassionate care-context summary for caregivers and families.
- Nova Micro is not used for image/video analysis or face recognition.
- Local vision processing uses face detection and resident-template matching to distinguish a registered care target from an unknown person.
- A deterministic fallback keeps the alert flow usable when cloud inference is unavailable or slow.

## How We Used Codex

Codex was used as the implementation collaborator for structuring the React/TypeScript frontend, backend API, domain scene engine, Ring adapter, Bedrock context flow, CRUD interfaces, validator state machine, test coverage, and documentation. It was also used to review the end-to-end flow, identify integration friction, and verify the project with the automated tests and production build.

## Key Features

- Ring webhook ingestion with raw-body HMAC-SHA256 signature verification and request deduplication.
- Scene classification across S1 Normal, S2 Watch, S3 Help, and S4 Critical.
- Resident profile management and multi-angle face template registration.
- Unknown-person access-log path that does not trigger a care siren based on identity alone.
- Desktop Care Command Center with rooms, home map, activity feed, event explorer, spatial heatmap, alerts, care team, and system status.
- Validator PWA with `OK`, `COMING`, `SIREN`, and `I HAVE ARRIVED` actions.
- Family reassurance and audit trail after alert transitions.
- Automation rules with confidence gates, trigger zones, active windows, and SLA escalation.
- Hybrid local-memory and Amazon DynamoDB persistence modes.
- Ring sandbox simulator and local camera pipeline for deterministic demonstrations.

## Architecture

HESTIA uses a modular React + TypeScript + Vite frontend and a Node.js + Express + TypeScript API. The backend normalizes Ring events, applies the deterministic scene engine, invokes the local vision matcher where needed, creates structured Nova Micro prompts, persists state, and exposes validator actions.

Production target and integration documentation are described in:

- [System architecture](docs/ARCHITECTURE.md)
- [Ring integration](docs/RING-INTEGRATION.md)
- [AWS integration](docs/AWS-INTEGRATION.md)

Privacy boundary: raw video and face matching remain local; Nova Micro receives structured text context only.

## Testing Instructions

Requirements: Node.js and npm.

```bash
npm install
npm test
npm run build
```

To run the local demo:

```bash
npm start
```

Open the dashboard at `http://127.0.0.1:5173`. The validator interface is available at `http://127.0.0.1:5173/?view=validator`.

Use the built-in Ring/event simulator or local camera pipeline to demonstrate a scene, inspect the generated context, and complete the validator action flow.

Detailed testing notes: [docs/TESTING.md](docs/TESTING.md) and [TESTING-INSTRUCTIONS.md](TESTING-INSTRUCTIONS.md).

## Public Demo Link

TODO: Verify and enter the active public demo URL.

Current documented deployment:

`https://<public-endpoint>/` (HTTPS public endpoint on AWS EC2, `us-east-1` — exact URL shared privately with reviewers)

Validator view:

`https://<public-endpoint>/?view=validator`

## Public Repository Link

`https://github.com/oghlam/hestia`

## Demo Video

Master demonstration video and studio narration generated from the official walkthrough script:

- **Local Video Master**: `docs/video/HESTIA-DEMO-VIDEO-FULL.mp4` (1080p Full HD, Duration: **2m 41s** / 161.1s)
- **Audio Track**: `docs/video/HESTIA-DEMO-NARRATION.mp3` (Studio-grade Neural Audio narration)
- **YouTube/Vimeo Public Link**: TODO — Upload `docs/video/HESTIA-DEMO-VIDEO-FULL.mp4` and insert the public link here.

## Screenshot Shot List

All seven screenshots have been captured and stored in `docs/screenshots/`:

1. **Dashboard Overview** (`docs/screenshots/01-dashboard-overview.png`): Care Command Center with greeting, home status, room cards, Home Map, and activity feed.
2. **Event Inspection with Nova Context** (`docs/screenshots/02-event-inspection-nova-context.png`): Event modal showing resident identity, scene classification (S3 Help), confidence score, and Amazon Nova Micro care-context explanation.
3. **Validator PWA Fast-Action Interface** (`docs/screenshots/03-validator-pwa-action.png`): Mobile validator view with alert context, action buttons (`OK`, `COMING`, `SIREN`, `I HAVE ARRIVED`), and emergency contact circle.
4. **Care In Progress & Family Reassurance** (`docs/screenshots/04-family-reassurance-resolved.png`): Dashboard showing alert status updated to "CARE IN PROGRESS · Responding" after caregiver action.
5. **Ring Integration Registry** (`docs/screenshots/05-ring-integration.png`): Ring device registry, webhook configuration, or integration diagnostics.
6. **Resident Face Studio** (`docs/screenshots/06-resident-face-studio.png`): Multi-angle facial template registration (0° Front, 45° Left, 45° Right) showing unique face recognition setup.
7. **Automation Rules Engine** (`docs/screenshots/07-automation-rules.png`): 2-column balanced parameter configuration (AI Confidence, Trigger Zone, Active Window, SLA Policy, Target Action, Family Reassurance).

## Submission Readiness Notes

Completed in the repository:

- Product description and setup instructions.
- Ring integration and webhook security documentation.
- AWS service and Bedrock usage documentation.
- Architecture and privacy boundaries.
- Testing instructions and automated verification.
- Demo scenario plan.
- Product feedback and technical friction logs.
- MIT open-source license.
- Seven comprehensive production-quality screenshots in `docs/screenshots/` ✅

Remaining before submitting:

- Record and upload the final demo video (< 3 minutes).
- Verify the public demo is reachable.
- Confirm the exact hackathon track and official form fields.
- Replace all TODO placeholders in this document.
- Run a final check for secrets before publishing or updating public assets.

## Known Limitations

- The Ring production path and cloud deployment still require final live verification for the target environment.
- The demo includes deterministic fixtures and simulator paths alongside hardware/cloud integrations.
- Local face matching uses a small registered template set and should not be treated as a general-purpose identity system.
- Notification providers and production authentication require further hardening for a broad real-world rollout.
- The current MVP is designed for one home and a focused elder-care vertical slice.

## TODO Official Form Fields

- Hackathon name: TODO — confirm from official Devpost requirements.
- Primary track: Ring — confirm exact official label.
- AWS challenge/mini-challenge: TODO — confirm exact official label.
- Team members: TODO.
- Project title: HESTIA — Elder Care Command Center for Ring.
- Repository URL: `https://github.com/oghlam/hestia`.
- Public demo URL: TODO — verify active URL.
- Demo video URL: TODO.
- Screenshots: TODO.
- Additional Devpost description fields: TODO — copy exact questions from the official form.
- Codex session ID: TODO only if the official form explicitly requests it.

## Supporting Documentation

- [README](README.md)
- [Demo plan](HESTIA-DEMO-PLAN.md)
- [Sprint MVP](HESTIA-SPRINT-MVP.md)
- [Implementation progress](HESTIA-PROGRESS.md)
- [Ring integration](docs/RING-INTEGRATION.md)
- [AWS integration](docs/AWS-INTEGRATION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Testing](docs/TESTING.md)
- [Product feedback](PRODUCT-FEEDBACK.md)
- [Friction log](FRICTION-LOG.md)
