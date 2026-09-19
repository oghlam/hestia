# HESTIA — Deployment Architecture & Access Model

This document specifies the deployment topology, runtime architecture, security boundaries, and network access points for the HESTIA Elder Care Command Center.

---

## 1. High-Level Deployment Topology

```text
       ┌─────────────────────────────────────────────────────────┐
       │                   RING HARDWARE / SIMULATOR              │
       │     (Indoor Cam, Video Doorbell, Stick Up Cam)          │
       └───────────────────────────┬─────────────────────────────┘
                                   │ HTTPS Webhook (HMAC-SHA256)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AWS CLOUD ENVIRONMENT (us-east-1)                        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
 │  │                EC2 RUNTIME (AWS EC2 · us-east-1)                     │  │
│  │                                                                       │  │
│  │  ┌──────────────────────┐  ┌────────────────────────────────────────┐ │  │
│  │  │ NGINX / Web Frontend │  │          HESTIA BACKEND API            │ │  │
│  │  │ (Port 80 / 443)      │  │          (Express / Node.js :8787)     │ │  │
│  │  │                      │  │                                        │ │  │
│  │  │ • Command Center     │  │  • /webhooks/ring (HMAC Verification)  │ │  │
│  │  │ • Validator PWA      │  │  • /api/pipeline/feed (Live Stream)    │ │  │
│  │  │ • Settings & Studio  │  │  • /api/rooms, /residents, /care-team  │ │  │
│  │  └──────────────────────┘  │  • /api/rules, /settings, /alerts      │ │  │
│  │                            └───────────────────┬────────────────────┘ │  │
│  │                                                │                      │  │
  │  │  ┌──────────────────────────────────────────┐  │                      │  │
  │  │  │      PYTHON VISION SERVICE (128-d)       │  │                      │  │
  │  │  │   • YuNet + SFace & Cosine Sim (0.50)    │◀─┤                      │  │
│  │  │   • Multi-Angle Face Matcher             │  │                      │  │
│  │  └──────────────────────────────────────────┘  │                      │  │
│  └────────────────────────────────────────────────┼──────────────────────┘  │
│                                                   │ Text-Only JSON Prompt   │
│                                                   ▼                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │             AMAZON BEDROCK (Amazon Nova Micro v1:0)                   │  │
│  │     • Structured Context Generation (Deterministic Fallback Engine)   │  │
│  │     • Zero Image/Video Transmission Policy                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                   ▲
                                   │ HTTP/HTTPS Auto-Polling (4s Interval)
       ┌───────────────────────────┴─────────────────────────────┐
       │                     USER ACCESS CLIENTS                 │
       │                                                         │
       │  • Home Display / Family Dashboard (Care Command Center)│
       │  • Caregiver Mobile Smartphone (Validator Fast PWA)     │
       └─────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture & Responsibilities

| Component | Technology | Role in Architecture |
|---|---|---|
| **Frontend Web Client** | React 19 + TypeScript + Vite | Care Command Center dashboard, multi-room floor plan canvas, resident care cards, and real-time activity stream. |
| **Validator Mobile PWA** | Modular React View (`?view=validator`) | Fast Action Interface for primary caregivers (OK / COMING / SIREN / I'VE ARRIVED transitions). |
| **Backend API Gateway** | Node.js + Express + TypeScript (`server/index.ts`) | Captures raw bodies for constant-time HMAC verification, handles REST CRUD, dispatches notifications, and tracks audit trails. |
| **Scene Engine** | Deterministic TypeScript Domain Engine (`src/domain/scene-engine.ts`) | Classifies signals into S1 (Normal), S2 (Watch), S3 (Help), and S4 (Critical) with confidence gating. |
| **Vision Face Matcher** | Python 3.14 + OpenCV 5 YuNet/SFace 128-d (`server/vision-service.ts`) | Local multi-angle facial template matching (0° Front, 45° Left, 45° Right) with cosine similarity threshold (≥ 0.50). |
| **AWS Bedrock Gateway** | Amazon Nova Micro (`server/bedrock-service.ts`) | Generates structured, calm scene explanations from text payloads; includes automated deterministic fallback. |
| **Data Repository** | In-Memory Store (`server/store.ts`) + DynamoDB Profile | Low-latency state tracking with optional Amazon DynamoDB cloud integration and 6-digit MFA authentication. |

---

## 3. Network Access & Live URLs

### Production Host: AWS EC2 (`us-east-1`)
- **Compute**: AWS EC2
- **Region**: `us-east-1`
- **Access**: HTTPS public endpoint (exact URL shared privately with reviewers)

### Public Endpoints (paths relative to the HTTPS public endpoint):

| Endpoint | Path | Method / Usage |
|---|---|---|
| **Dashboard UI** | `/` | Web browser interface for elder-care command center. |
| **Validator PWA** | `/?view=validator` | Fast-action validation screen optimized for caregiver smartphones. |
| **Ring Webhook** | `/webhooks/ring` | Ingestion endpoint for Ring developer sandbox & hardware events. |
| **Pipeline Feed** | `/api/pipeline/feed` | WebRTC webcam stream and snapshot feed ingestion. |
| **API Health** | `/health` | Service health probe returning `{ "ok": true, "service": "hestia-api" }`. |
| **Scene Results** | `/api/scenes` | Real-time scene history and telemetry stream. |
| **Alert Actions** | `/api/alerts/:id/actions` | State machine transition actions (`OK`, `COMING`, `SIREN`, `I_HAVE_ARRIVED`). |

---

## 4. Security, Identity & Privacy Boundaries

1. **HMAC-SHA256 Webhook Signature Verification**:
   - Every inbound Ring webhook must contain the `X-Signature: sha256=<hex>` header.
   - Verified using `crypto.timingSafeEqual` to prevent timing attacks.
2. **Event Deduplication**:
   - `meta.request_id` tracked in an in-memory window to eliminate duplicate webhook triggers.
3. **Elder Privacy & Zero-Cloud Image Leakage**:
    - Face template embeddings (128-dimensional SFace vectors) are generated locally.
   - Amazon Nova Micro **never receives raw images or video streams**; only sanitized JSON text prompts are transmitted.
4. **Target Identity vs. Visitor Protection**:
   - Only registered resident face templates (e.g., Elder) trigger care paths and emergency escalations.
   - Unrecognized visitors are recorded in the Access Log (`S2_WATCH`) without triggering false emergency sirens.
5. **Caregiver Governance**:
   - AI outputs context; the human caregiver always remains the decision authority.
