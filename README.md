<div align="center">

<img src="docs/logo/hestia_logo_full.png" alt="HESTIA" width="340" />

### ELDER CARE COMMAND CENTER FOR RING

> A home that cares, even when you're away.

**Ring event → scene understanding → caregiver validation → family reassurance**

[![Tests](https://img.shields.io/badge/tests-11%2F11_passing-brightgreen?style=for-the-badge&logo=checkmarx&logoColor=white)](docs/TESTING.md)
[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)](docs/TESTING.md)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![PWA](https://img.shields.io/badge/validator-PWA_ready-purple?style=for-the-badge)](docs/ARCHITECTURE.md)

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2_%7C_Bedrock_%7C_DynamoDB-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Bedrock Nova Micro](https://img.shields.io/badge/Amazon_Nova_Micro-Bedrock-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)
![Python](https://img.shields.io/badge/Python-OpenCV_%7C_ArcFace-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Ring](https://img.shields.io/badge/Ring-Webhook_%7C_HMAC-red?style=for-the-badge&logo=ring&logoColor=white)

</div>

HESTIA is an elder-care command center concept for turning home activity into understandable care context and human response. The intended flow is **Ring event → scene understanding → caregiver validation → family reassurance**.

## Repository status

This repository contains the full, functional implementation of HESTIA:
- **Core Domain & Scene Engine**: Deterministic classification (S1–S4), confidence gates, and alert state machine.
- **Ring Webhook Adapter**: HMAC-SHA256 constant-time signature validation, deduplication, and normalized v1.1 payload handling.
- **AWS Bedrock Context**: Amazon Nova Micro structured natural-language explanation generation with intelligent fallback.
- **Vision & Biometric Face Matcher**: Local OpenCV 64-d cosine similarity matcher strictly separating registered care targets from unknown visitors.
- **Dynamic Operational Engine**: Full CRUD for Rooms, Ring Devices, Precision Floor Plan Mapping, Resident Care Profiles, Multi-Angle Face Studio (0°, 45°L, 45°R), Care Team Roster, and Automation Rules Engine.
- **Dynamic Device Pipeline**: Real-time camera streaming & snapshot ingestion supporting Local Webcams, Smartphone WebRTC, Ring Sandbox Simulator, and Live Ring Hardware.
- **Validator PWA**: Mobile fast-action interface (`OK`, `COMING`, `SIREN`, `I'VE ARRIVED`).

## Product intent

The problem is not simply seeing more camera events. Caregivers need to know who may need help, where they are, what happened, how serious it is, and whether someone is responding.

HESTIA is designed as a calm elder-care operating system rather than a surveillance dashboard. Ring is intended to provide home activity signals, while humans remain responsible for care decisions.

## Intended MVP

- Ring event or deterministic fixture ingestion.
- Scene states: S1 NORMAL, S2 WATCH, S3 HELP, and S4 CRITICAL.
- A desktop care command center.
- A mobile Validator fast-action interface.
- Human actions: OK, COMING, SIREN, and I'VE ARRIVED.
- Family-visible response status.

## Documentation

- [Product overview](docs/OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [UI design](docs/UI-DESIGN.md)
- [Ring integration](docs/RING-INTEGRATION.md)
- [AWS integration](docs/AWS-INTEGRATION.md)
- [Testing](docs/TESTING.md)
- [Friction log](FRICTION-LOG.md)

## References

- [Dashboard mockup](docs/references/dashboard-mockup.png)
- [Validator mobile mockup](docs/references/validator-mobile-mockup.png)

## Visual Gallery & Screenshots

Here is the visual walkthrough of the HESTIA platform across its core modules:

### 1. Care Command Center Overview
![Dashboard Overview Top](docs/screenshots/01-dashboard-overview-top-rooms.png)
![Dashboard Overview Bottom](docs/screenshots/01-dashboard-overview-bottom-rooms.png)
![Dashboard Default](docs/screenshots/00-Dasboard-Default.png)

### 2. Event Inspection & Amazon Nova Micro AI Context
![Event Inspection](docs/screenshots/02-event-inspection-nova-context.png)

### 3. Fast-Action Validator PWA
![Validator PWA](docs/screenshots/03-validator-pwa-action.png)
![Validator Confirm](docs/screenshots/03-validator-pwa-action-confirm.png)

### 4. Family Reassurance & Handled State
![Family Reassurance](docs/screenshots/04-family-reassurance-resolved.png)

### 5. Ring Hardware Registry & Webhook Integration
![Ring Integration](docs/screenshots/05-ring-integration.png)
![Care Topology](docs/screenshots/08-care-topology.png)

### 6. Resident Face Studio & Multi-Angle Biometrics
![Face Studio](docs/screenshots/06-resident-face-studio.png)
![Face Studio Camera](docs/screenshots/06-resident-face-studio-camera.png)

### 7. Automation Rules Engine & Insights
![Automation Rules](docs/screenshots/07-automation-rules.png)
![Insights](docs/screenshots/07-automation-rules-Insight.png)

## Running the project

Install dependencies and start the frontend shell:

```bash
npm install
npm run dev
```

Start the local API in a second terminal with `npm run api`. It exposes `GET /health`, `POST /webhooks/ring`, `POST /demo/events`, `GET /api/scenes`, `GET /api/alerts`, and `POST /api/alerts/:alertId/actions`. Create a production build with `npm run build`. The current shell uses the approved logo assets from `docs/logo` and copies the required web assets into `public/logo`.

Open the Validator demo at `http://127.0.0.1:5173/?view=validator` after creating a demo alert through the API.

No credentials or tokens belong in this repository's public documentation.

## License

Distributed under the [MIT License](LICENSE).
