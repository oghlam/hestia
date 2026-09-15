# HESTIA AWS Integration

> Documentation status: Active. List only AWS services that are actually used by the implementation.

## Current implementation status

AWS Bedrock (Amazon Nova Micro) context generation service is implemented in `server/bedrock-service.ts` with deterministic fallback. Deployment target is configured for EC2 (`kurusetra`).

## Service inventory

| AWS service | Why HESTIA uses it | Sends / receives | Runtime location | Status |
|---|---|---|---|---|
| AWS Bedrock (Nova Micro) | Generates calm, structured natural-language scene summaries for families | Sends structured JSON text prompt; receives 1-2 sentence scene summary | Cloud (Bedrock API) | Active with Fallback |
| AWS EC2 (`kurusetra`) | Primary hosting for HESTIA backend API, webhook ingestion & web client | Receives Ring webhooks; serves API & web frontend to family & caregiver displays | us-east-1 (`kurusetra`) | Configured |

## Bedrock

- **Model used**: Amazon Nova Micro (`amazon.nova-micro-v1:0`).
- **Structured input**: Strictly text prompt built from structured event data (event type, room name, resident name, signals, scene code).
- **Important boundary**: Nova Micro receives structured text only. Nova Micro is **never** used for image, video, or face recognition.
- **Fallback behavior**: Deterministic elder-care summary generator activates automatically if Bedrock is in standby or offline.
- **Source reference**: `server/bedrock-service.ts`, `server/index.ts`.

## Configuration and secrets

- **Environment variables**: `BEDROCK_ENDPOINT`, `BEDROCK_API_KEY`, `BEDROCK_MODEL_ID`, `PORT`
- **Secrets rule**: Never commit or log API keys or AWS credentials. Secrets are loaded exclusively through environment variables.
