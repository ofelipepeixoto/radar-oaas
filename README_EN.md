# Radar OaaS — readiness assessment

[Português](README.md) · [Demo and case study](docs/portfolio/CASE_STUDY.md) · [Contributing](CONTRIBUTING.md)

Organize evidence and identify the next permitted experiment for an Outcome as a Service opportunity.

## Workflow

Open the synthetic reconciliation example → inspect inputs/evidence → generate the deterministic assessment.

## Current status

Experimental web application. The recorded demo uses browser-local synthetic data, without private authentication or a live AI provider.

## Run locally without an AI key

```sh
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run dev
```

Open http://localhost:3000/demo?exemplo=1. For Windows commands, installation requirements, private-mode configuration and the full operational reference, see the [Portuguese README](README.md). This is an English onboarding guide; it does not replace that reference.

## Reproducible verification

```sh
npm run test:unit
```

132 unit/AI tests passed in six files. These cover selected deterministic and simulated paths; they do not validate real authentication, Supabase RLS or a paid AI provider.

Evidence was reproduced from commit `f536e39cd69b0c5272f5567fc89c910590ea2096`. See the case study for scope and the recording procedure.

## Project contribution and attribution

Guided assessment journey, evidence organization, versioned deterministic rules, snapshots and local demonstration. The editorial framework and third-party libraries remain separately identified.

## Limits

A score is not certification or authorization. Missing data stays unknown. This recording does not test the private mode, payments or real customer outcomes.

No real customer data, credentials, measured business ROI or production certification is implied by the screenshots or test counts. Existing project license terms remain unchanged; public availability does not itself grant unrestricted reuse.
