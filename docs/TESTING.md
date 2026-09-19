# HESTIA Testing

> Status: all suites passing. Last verified: `npm test` → 11/11 suites, `npm run build` → 0 errors.

## Current implementation status

Automated suite `tests/hestia.test.ts` (run via `tsx`, no framework) covers the full vertical slice:
scene classification, validator state machine, Ring webhook HMAC, store repository,
Bedrock Nova Micro context, vision/face recognition, settings & maintenance,
modular menus & CRUD, DynamoDB sync, pipeline feed ingestion, and complete E2E.

## Test commands

```text
Install dependencies: npm install
Run unit tests:       npm test          # tsx tests/hestia.test.ts → 11/11 suites passing
Run integration tests: npm test         # E2E vertical-slice suite included
Run frontend (dev):   npm run dev       # http://127.0.0.1:5173
Run backend (dev):    npm run api       # http://127.0.0.1:8787
Run lint/typecheck:   npm run build     # tsc -b && vite build → 0 errors
Init DynamoDB tables: npm run db:init   # production cloud store (us-east-1)
```

## MVP verification checklist

- [x] Ring event ingestion — `POST /webhooks/ring` (HMAC `X-Signature`) + `tests/hestia.test.ts` Ring adapter suite
- [x] Event normalization — Ring payload v1.1 adapter, `meta.request_id` dedup (`server/ring-adapter.ts`)
- [x] Scene Engine S1 NORMAL — classification suite (`src/domain/scene-engine.ts`)
- [x] Scene Engine S2 WATCH — classification suite; unknown visitors stay S2, no siren
- [x] Scene Engine S3 HELP — classification suite; demo alert `S3_HELP · Elder`
- [x] Scene Engine S4 CRITICAL — classification suite + validator `critical` tag path
- [x] Known/unknown face recognition behavior — vision suite: 64-d cosine ≥ 0.75, 3-angle templates; non-target → `unknown`
- [x] Bedrock context — Nova Micro suite: structured text metadata only, deterministic fallback (`server/bedrock-service.ts`)
- [x] Dashboard state — OverviewView polling `/api/scenes`, `/api/alerts` (4s); map, feed, heatmap, telemetry update
- [x] Validator OK / COMING / SIREN — state machine suite + `?view=validator` manual pass
- [x] CARE IN PROGRESS / I'VE ARRIVED / ALERT HANDLED — `I_HAVE_ARRIVED` → HANDLED, family reassurance, audit logged
- [x] Notification flow — family push on COMING + reassurance on HANDLED (localStorage + `/api/alerts/:id/actions`)
- [x] Audit/resolution — handled record persisted (`hestia_last_handled`), maintenance log rotation (`/api/maintenance/*`)
- [x] End-to-end vertical slice — E2E suite: event → context → validation → reassurance

## Manual verification (browser)

1. `npm run dev` + `npm run api`, open `http://127.0.0.1:5173`
2. Alert Simulator modal → fire S3 event → confirm dashboard + validator PWA update
3. `?view=validator`: tap COMING → CARE_IN_PROGRESS + ETA 5m → I'VE ARRIVED → ALERT HANDLED
4. Toggle light/dark theme → single logo in topbar and validator header
5. Check console: zero errors (Windows PowerShell, not WSL)

## Test fixtures

| Fixture | Expected result | Stored in |
|---|---|---|
| Demo event (`POST /demo/events`) | S3 HELP alert + scene + AI summary | `server/index.ts` demo fixture, localStorage `hestia_active_alert` |
| Handled record | `ALERT HANDLED`, family reassurance | localStorage `hestia_last_handled` |
| Resident face templates (0°/45°L/45°R) | 64-d embeddings, match ≥ 0.75 | `POST /api/residents/:id/faces` |
| HMAC webhook sample | `X-Signature` verifies, dedup by `request_id` | Ring adapter suite + Settings → Webhook Test |
