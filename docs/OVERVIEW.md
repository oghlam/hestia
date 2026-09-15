# HESTIA Overview

## What HESTIA is

HESTIA is an elder-care command center / care operating system. It is not a Ring viewer and not a surveillance dashboard. Its purpose is to help caregivers understand a possible care situation, acknowledge responsibility quickly, and keep family members reassured.

## Target scenario

An older resident is at home while a caregiver or family member is elsewhere. A home event may need attention, but raw motion or camera output is not enough to decide what to do. HESTIA is intended to turn that event into a concise, human-readable care context.

## Product principle

> **AI provides context. Humans provide care decisions.**

The system may help identify a person, summarize signals, and classify a scene. A caregiver remains responsible for deciding whether to acknowledge, go to the home, escalate, or mark the situation handled.

## Target and face-recognition boundary

In HESTIA, **target** means the resident receiving care. It does not mean every person visible in a Ring event. Face recognition is intended to use trained/registered face templates for care targets only, with conservative confidence handling.

Other people must remain non-target identities (`unknown`, or a separately authorized known visitor where applicable). Their presence alone must not trigger a care siren. Identity enriches the care context; it does not replace caregiver validation or determine an emergency response by itself.

## Intended responsibilities

The following boundaries are part of the approved product design. They are not yet implemented in this checkout.

| Part | Intended role |
|---|---|
| Ring | Provides eyes: home activity, event, and snapshot signals |
| Face Recognition | Helps answer who is present, with conservative confidence handling |
| Scene Engine | Combines signals into S1–S4 care context |
| Bedrock | Explains structured scene context in human-readable language |
| Validator | Lets a caregiver make the human decision quickly |
| Notifications | Communicates alert and response status |

## Caregiver and family workflow

```text
Person → Activity → Scene → Care Action
```

The intended flow is:

1. A Ring event or demo fixture enters HESTIA.
2. The event is interpreted into a scene and care context.
3. A caregiver sees who and where, what happened, and how serious it may be.
4. The caregiver chooses OK, COMING, or SIREN.
5. A COMING response becomes CARE IN PROGRESS.
6. The caregiver chooses I'VE ARRIVED and the alert becomes ALERT HANDLED.
7. Family members can see that someone is handling the situation.

## Implementation status

This document records the approved product concept. The current workdir does not yet contain the application implementation or runtime integrations, so no Ring, face-recognition, Bedrock, notification, or Validator behavior should be treated as verified here.
