# HESTIA Product Feedback

> Elder-Care Operating System feedback collected during iterative caregiver testing, Ring simulator sessions, and mobile validator evaluation.

## Session metadata

- **Date**: September 2026
- **Participant / tester**: Caregiver & Validator Team (Maria Vance, Family Circle Testers)
- **Build**: v0.1.0-mvp
- **Scenario tested**: Elder fall detection, night inactivity alerts, unknown visitor doorstep filter, mobile fast-action responses, and automatic family emergency notification dispatch.

## Feedback & Observations

| Observation | Impact | Follow-up | Status |
|---|---|---|---|
| **Raw AI logs felt overwhelming for elder caregivers** | Initial prompt output gave long paragraphs that delayed fast emergency response. | Replaced with compact, structured 2-sentence Amazon Nova Micro context ("Who, Where, Action Recommended"). | ✅ Resolved |
| **Unknown visitors triggered false alarms when using naive motion triggers** | Ring doorstep motion created anxiety for remote family members. | Created separate S2 WATCH / Access Log pathway for unrecognized visitors without sounding care sirens. | ✅ Resolved |
| **Caregiver mobile action buttons needed immediate tactile clarity** | Small text links in web view caused friction during urgent hand-off. | Designed large, high-contrast action buttons (OK / COMING / SIREN / I'VE ARRIVED) with top-positioned lite SVG icons. | ✅ Resolved |
| **Family members worry when primary caregiver is in transit or busy** | Remote family members lacked visibility until caregiver reached the resident. | Added automated background Family Circle push notifications (WhatsApp/SMS) on S3/S4 trigger and dynamic SLA countdown. | ✅ Resolved |

## Product decisions from feedback

1. **Human Decision Loop**: AI provides scene explanation; caregivers remain the sole authority for dispatching sirens or marking all-clear.
2. **Strict Resident Care Target Mapping**: Face recognition templates are restricted to registered resident targets (e.g. Eleanor) to protect visitor privacy.
3. **Automated Family Reassurance**: Every completed validation (`OK` / `I'VE ARRIVED`) automatically broadcasts reassurance confirmation to the family circle.

