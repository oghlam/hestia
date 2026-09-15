# HESTIA Ring Integration

> Documentation status: Active. Never add Ring tokens, credentials, cookies, or private URLs to this file.

## Current implementation status

Ring integration adapter and webhook signature verification are active in `server/ring-adapter.ts` and `server/index.ts`.

## Ring Developer setup

- Permissions: `camera:read`, `event:read`, `device:read`
- Callback/webhook URL: `/webhooks/ring` (HTTPS in production)
- Non-secret environment variable names: `RING_HMAC_SIGNING_KEY`, `RING_API_TOKEN`, `PORT`

## Runtime flow

```text
Ring Camera/Sensors → Ring Cloud → HESTIA Webhook Endpoint (/webhooks/ring)
  └─► HMAC-SHA256 Signature Verification (X-Signature)
  └─► Deduplication (meta.request_id)
  └─► Normalization to RingEvent
  └─► Scene Engine Classification (S1-S4)
  └─► Caregiver Alert / Validator Fast Action
```

## Event handling

- **Signature Validation**: HMAC-SHA256 constant-time comparison against raw request bytes (`X-Signature: sha256=<hex>`).
- **Idempotency**: Deduplicated using `meta.request_id`.
- **Event normalization**: Maps Ring v1.1 events (`motion_detected`, `button_press`, `device_online`, `device_offline`) to internal `RingEvent`.
- **Event persistence**: Stored via `HestiaRepository` interface in `server/store.ts`.

## Security

- Raw request bytes used directly for signature verification to prevent whitespace/serialization tampering.
- Secrets loaded exclusively via environment variables (`process.env`).
- Constant-time string comparison (`crypto.timingSafeEqual`) prevents timing attacks.
