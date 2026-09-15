# HESTIA Architecture

> Documentation status: template. Update this document only from the implemented source code, configuration, and deployment state.

## Current implementation status

No runnable backend, frontend, Ring integration, AWS deployment, or service configuration is currently present in this checkout. The sections below are the structure to complete as implementation progresses.

## Conceptual boundaries

```text
Ring = eyes
Face Recognition = who
Scene Engine = what is happening
Bedrock = explain/context
Validator = human decides
Notifications = ensure response
```

These are product boundaries from the MVP specification. Mark each boundary as implemented only after verifying the corresponding code path.

## Runtime flow

```text
Ring Camera
    ↓
Ring Cloud
    ↓
HESTIA Cloud
```

To be completed with the actual runtime components, deployment mechanism, and data flow.

## Components and APIs

| Component | Actual implementation | Evidence / file path |
|---|---|---|
| Frontend dashboard | TODO | TODO |
| Validator PWA | TODO | TODO |
| HESTIA API | TODO | TODO |
| Scene Engine | TODO | TODO |
| Vision Service | TODO | TODO |
| Persistence | TODO | TODO |
| Notifications | TODO | TODO |

## Storage and data contracts

Document only storage services and contracts that are actually used. Link to the implementation and tests for each one.

## Cloud runtime note

The intended model is that the developer PC is used for development, testing, and deployment only; it must not be required to remain online for HESTIA runtime. Confirm the deployed implementation before treating this statement as verified.

## Deferred decisions

Record only decisions that are needed by the actual MVP. Do not add EventBridge, Step Functions, Cognito, microservices, or other infrastructure unless implemented and justified.
