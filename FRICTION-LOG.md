# HESTIA Friction Log

> Real implementation and hackathon workflow friction encountered during Ring integration, AWS Bedrock prompt engineering, and hybrid local-cloud pipeline construction.

## Entries

| ID | Area | Friction | Impact | Workaround / Resolution | Status |
|---|---|---|---|---|---|
| **F-001** | **Ring Webhook Signatures** | Express parsed JSON body before signature verification, mutating the raw payload and failing HMAC verification. | Webhook rejected with 401 Unauthorized. | Captured `req.rawBody` buffer directly during `express.json({ verify })` middleware and verified constant-time `crypto.timingSafeEqual`. | ✅ Resolved |
| **F-002** | **Bedrock Model Latency / Offline** | Cloud inference calls can introduce variable network latency during critical real-time alerts. | UI temporarily stalled if AWS endpoint had jitter. | Implemented deterministic rule-based fallback summary alongside asynchronous Amazon Nova Micro prompt generation. | ✅ Resolved |
| **F-003** | **Vision Service Privacy & Hardware** | Cloud vision APIs require uploading private video frames to third-party endpoints. | Privacy concerns and bandwidth consumption for continuous monitoring. | Built lightweight local OpenCV & 64-d cosine embedding matcher running directly on edge/local server with zero cloud image storage. | ✅ Resolved |
| **F-004** | **Floor Plan Coordinate Calibration** | Custom blueprint images had varying aspect ratios causing device pins to drift on screen resize. | Inaccurate camera placement on floor map. | Fixed floor map container to strict 16:10 aspect ratio and normalized pin positions to responsive percentage coordinates (`x%, y%`). | ✅ Resolved |

## Categories

- **Ring Developer Setup & Ingestion**: HMAC-SHA256 signature verification, deduplication, and v1.1 payload normalization.
- **AWS Bedrock Integration**: Structured text prompt templates for Amazon Nova Micro with fast deterministic fallback.
- **Biometric Edge Vision**: Local Python/OpenCV face embedding extraction with strict known-target vs unknown visitor separation.
- **Validator Mobile PWA**: Fast Action Interface with right-sidebar drawer for live updates and SLA auto-escalation.

