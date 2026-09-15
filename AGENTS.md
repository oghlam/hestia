# HESTIA — Agent Handoff Guide

Dokumen ini adalah sumber konteks kerja untuk agen yang melanjutkan project setelah pekerjaan terhenti atau saat membuka session baru. Baca `README.md`, `HESTIA-SPRINT-MVP.md`, dan `HESTIA-PROGRESS.md` sebelum mengubah arsitektur atau UI.

## Product rules

- HESTIA adalah elder-care command center, bukan surveillance dashboard.
- Alur utama: `Ring event → scene context → caregiver validation → family reassurance`.
- Urutan informasi UI: `Person → Activity → Scene → Care Action`.
- Target berarti resident/orang yang dirawat. Jangan menjadikan semua orang yang tertangkap kamera sebagai target.
- Face recognition hanya memakai face template resident target yang terdaftar/terlatih.
- Orang non-target harus diperlakukan sebagai `unknown` atau visitor yang sesuai. Kehadiran unknown tidak boleh memicu siren hanya berdasarkan identitas.
- AI memberi context; caregiver tetap mengambil keputusan.
- Nova Micro hanya menerima structured text. Jangan gunakan Bedrock untuk image/video/face recognition.

## Visual & Architecture rules

- Ikuti mockup di `docs/references/dashboard-mockup.png` dan `docs/references/validator-mobile-mockup.png`.
- Gunakan aset resmi dari `docs/logo`; jangan membuat nama brand tambahan.
- Wordmark sidebar memakai `hestia_logo_full.png` dan tagline `ELDER CARE FOR RING` rata tengah di bawah logo.
- Dashboard: sidebar putih, navy text, aksen biru, greeting serif, summary cards, rooms, activity feed, home map, recent event, activity chart, system status, care team.
- Home Map menampilkan posisi Ring device. Signal aktif berkedip. Status normal hijau dan error merah.
- Mobile adalah Fast Action Interface untuk Validator, bukan mini dashboard.
- Komputer display di rumah bertindak sebagai klien tampilan web murni (tidak perlu menjalankan server lokal). Backend API dijalankan di server cloud (target AWS EC2 `kurusetra`).

## Current implementation status

- **Frontend Architecture**: Modular React + TypeScript + Vite.
  - **Modular Views (`src/views/`)**: `OverviewView`, `RoomsView`, `PeopleView`, `EventsView`, `CareTeamView`, `AutomationView`, `SettingsView`, `ValidatorView` (`?view=validator`).
  - **Domain Hooks (`src/hooks/`)**: `useRooms`, `useResidents`, `useCareTeam`, `useAutomationRules`, `useSceneEvents`, `useSystemSettings`, `useLocalStorage`.
  - **Modal Components (`src/components/modals/`)**: `RoomModal`, `FloorPlanModal`, `ResidentModal`, `FaceStudioModal`, `CareTeamModal`, `AutomationRuleModal`, `EventInspectionModal`, `AlertSimulatorModal`.
  - **State Synchronization**: Continuous real-time auto-polling to backend API endpoints (`API_BASE`) with optimistic local storage fallback.
- **Domain Engine**: `src/domain/contracts.ts` dan `src/domain/scene-engine.ts` (klasifikasi adegan S1–S4, state machine alert, dan validasi transisi).
- **Ring Webhook Adapter**: `server/ring-adapter.ts` (verifikasi tanda tangan HMAC-SHA256 constant-time `X-Signature`, deduplikasi `meta.request_id`, normalisasi Ring payload v1.1).
- **AWS Bedrock Context**: `server/bedrock-service.ts` (generator prompt teks terstruktur untuk Amazon Nova Micro dengan fallback cerdas deterministik).
- **Repository Store**: `server/store.ts` (`HestiaRepository` interface).
- **Backend API**: `server/index.ts` (Express server menangkap raw body untuk signature verification, memproses webhook Ring, demo fixture, CRUD rooms/residents/care-team/rules/settings, dan aksi validator).
- **Automated Tests**: `tests/hestia.test.ts` (8/8 test suites passing: Scene Classification, Validator State Machine, Ring Webhook Adapter/HMAC Signature, Store Repository, Settings/Maintenance, Modular Menus & CRUD, Bedrock Nova Micro, Vision Face Recognition, and Complete E2E Integration).

## Commands

```bash
npm install
npm run dev       # frontend web, http://127.0.0.1:5173
npm run api       # backend API, http://127.0.0.1:8787
npm test          # automated unit/integration test suite (8/8 suites passing)
npm run build     # required verification build (0 errors)
```

API endpoints:
- `GET /health`
- `POST /webhooks/ring` (Menerima raw body + verifikasi header `X-Signature: sha256=<hex>`)
- `POST /demo/events` (Memuat demo events dengan AI summary)
- `GET /api/scenes`
- `GET /api/alerts`
- `POST /api/alerts/:alertId/actions`
- `POST /api/pipeline/feed` (Local camera snapshot capture & dynamic zone simulation)
- `GET/POST/PUT/DELETE /api/rooms` & `GET/POST /api/home/map`
- `GET/POST/PUT/DELETE /api/residents` & `POST /api/residents/:id/faces`
- `GET/POST/PUT/DELETE /api/care-team` & `POST /api/care-team/:id/set-primary`
- `GET/POST/PUT/DELETE /api/rules` & `PATCH /api/rules/:id/toggle`
- `GET/POST /api/settings` & `POST /api/settings/db-test`
- `POST /api/maintenance/clear-logs`, `POST /api/maintenance/rotate-logs`, `POST /api/maintenance/check-update`

Validator demo: `http://127.0.0.1:5173/?view=validator`.

## State machine

- `VALIDATION_PENDING → RESOLVED` via `OK`.
- `VALIDATION_PENDING → CARE_IN_PROGRESS` via `COMING`.
- `VALIDATION_PENDING → ESCALATED` via `SIREN`.
- `CARE_IN_PROGRESS → HANDLED` via `I_HAVE_ARRIVED`.

## Dynamic CRUD Sub-Sprint Roadmap (All Completed)

1. **Sub-Sprint A — Dynamic Rooms, Devices & Floor Plan Map Upload** (Completed):
   - Dynamic room creation/update/deletion (`/api/rooms`).
   - Pairing with Ring Devices (Indoor Cam, Video Doorbell, Stick Up Cam).
   - Custom floor plan image upload (`POST /api/home/map`) + interactive camera pin placement (`x, y` coordinate mapping).

2. **Sub-Sprint B — Resident Target Profile, Health Record & Multi-Angle Face Registration** (Completed):
   - Resident care profile (`/api/residents`): Name, age, health conditions (fall risk, hypertension), hospital/doctor emergency contacts.
   - Multi-angle face image upload (`/api/residents/:id/faces`): Front, left angle, right angle extraction into normalized 64-d embeddings.

3. **Sub-Sprint C — Care Team & Validator Roster Management** (Completed):
   - Care team CRUD (`/api/care-team`): Family member vs Professional Nurse/Caregiver separation with contact channels (WhatsApp/Phone/Push) and validator dispatch order.

4. **Sub-Sprint D — Automation Rules Engine & Template Builder** (Completed):
   - Automation rules CRUD (`/api/rules`): Presets (Elder Fall Detection, Night Inactivity Guard, Unrecognized Visitor Doorbell) with confidence gates and SLA auto-escalation timeouts.

5. **Sub-Sprint E — Events Stream, Snapshot Viewer & Alert Simulator** (Completed):
   - Detailed event snapshot inspection modal with bounding box overlay and Nova Micro structured explanation.
   - Dynamic test simulator targeting any user-configured room/device.

6. **Sub-Sprint F — Home Settings, Ring & AWS Integration Config** (Completed):
   - Interactive home configuration (`/api/settings`): Home ID, webhook endpoints, HMAC-SHA256 credentials, Bedrock Nova Micro region.

7. **Sub-Sprint G — Validator Mobile PWA Detailed Visual & UX Alignment** (Completed):
   - Pixel-level alignment with `docs/references/validator-mobile-mockup.png`, timer badge, action buttons, alert handled view.

8. **Sub-Sprint H — Modular Architecture Refactoring & Full Menu Audit** (Completed):
   - Full hook separation, individual view modularization, dynamic CRUD & modal integrity checks across all 7 menus.

## Next sprint priorities

1. **End-to-End Verification & Final Compliance**: Live Demo Recording, Devpost Submission Prep, and AWS `kurusetra` deployment check.

## Handoff discipline

- **ATURAN UTAMA GIT & DEPLOYMENT**: JANGAN PERNAH melakukan `git commit`, `git push`, apalagi deploy ke server/cloud kecuali pengguna secara eksplisit meminta instruksi eksekusi tersebut.
- Pastikan selalu menjalankan `npm test && npm run build` sebelum dan sesudah perubahan kode.
- Jangan pernah menyertakan, mencetak, atau meng-commit secret, token Ring, atau AWS credentials ke dalam repositori atau log.
- AWS runtime target: instance `kurusetra` di us-east-1.
