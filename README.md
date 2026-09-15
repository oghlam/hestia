# HESTIA

> A home that cares, even when you're away.

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

- [Demo & Device Testing Plan](HESTIA-DEMO-PLAN.md) — complete step-by-step testing guide
- [Product overview](docs/OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [UI design](docs/UI-DESIGN.md)
- [Ring integration](docs/RING-INTEGRATION.md)
- [AWS integration](docs/AWS-INTEGRATION.md)
- [Testing](docs/TESTING.md)
- [Product feedback](PRODUCT-FEEDBACK.md)
- [Friction log](FRICTION-LOG.md)
- [Implementation progress](HESTIA-PROGRESS.md) — sprint tracker & checklist

## References

- [Dashboard mockup](docs/references/dashboard-mockup.png)
- [Validator mobile mockup](docs/references/validator-mobile-mockup.png)

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
