# Social Media Privacy Risk Assessment Framework

A defensive, educational application for reviewing social-media privacy practices. It uses answers a person voluntarily gives about settings and habits; it does not connect to accounts, inspect profiles, or collect contact details.

> This framework is for awareness and learning. Its scores are not a prediction or guarantee about compromise, stalking, fraud, or safety. Weights and thresholds are transparent educational assumptions, not a professional risk standard.

## What it does

- Guides a user through a 51-question self-assessment across ten privacy and security categories.
- Converts answers into explainable category scores and an overall 0–100 exposure score.
- Creates findings, prioritized remediation steps, and a privacy checklist.
- Simulates selected changes and shows the score difference.
- Provides aggregate charts made only from 1,000 reproducible synthetic records.
- Exports a report or checklist for printing/saving.
- Stores only a random assessment ID, category scores, overall score and level, finding types, control count, timestamps, and expiry. Raw answers are not stored.

## Ethical scope

This project does **not** scrape social platforms, enumerate accounts, bypass settings, analyze private accounts, identify or track people, upload profile exports, or process private messages. It never asks for a real phone number, email address, full birthday, home address, password, exact location, or identity. Do not add those fields when extending the project.

Only assess your own practices or a profile you are authorized to assess. Dashboard statistics and CSV records are synthetic—not real user data. Assessment records expire after 30 days and can be deleted immediately using the report's delete action.

## Privacy and security concepts

### Simple explanation

- **Social-media privacy** is control over who can see personal information and how it can be shared or used.
- **Digital footprint** is the information connected to online activity. An active footprint includes things a person chooses to post; other data may be produced by service interactions.
- **Personal-information exposure** means details such as contact information, education, or relationships are visible to a wider audience than intended.
- **Oversharing** is publishing more context than needed, including audience, location, routines, or travel timing.
- **Social engineering** uses trust or context to persuade someone to reveal information, click a link, or approve an action.
- **Identity-related risk** can increase when separate details can be combined to impersonate or target someone.
- **Location exposure** can reveal current presence, travel timing, or repeated routines. Sharing a location-related photo after leaving may reduce immediate exposure compared with posting it in real time.
- **Historical posts** can remain visible after a person's circumstances or audience have changed.
- **MFA** adds another proof of identity at sign-in and can reduce some account-takeover risks.
- **Privacy and security are related, not interchangeable.** A strong password can protect an account that still exposes a phone number or public posts.

### Technical explanation

The app accepts a fixed map of questionnaire IDs to enumerated responses. Input validation rejects missing, unknown, or invalid answers. Each answer becomes a normalized risk contribution from 0 to 1. Question contributions are weighted within their category and converted to a 0–100 category score. Category scores are combined using the configurable default weights below. Findings map risky responses to plain-language actions. The server persists only derived summaries and finding IDs—not the submitted answer map.

```text
User → 51-question self-assessment → validation → feature extraction
     → category scoring → weighted overall score → risk level
     → findings and recommendations → dashboard/report
```

## Risk categories and default weights

| Category | Weight |
| --- | ---: |
| Profile Exposure | 10% |
| Personal Information | 15% |
| Location Exposure | 15% |
| Content Exposure | 10% |
| Connection Risk | 10% |
| Tagging Risk | 5% |
| Account Security | 15% |
| Third-Party Apps | 5% |
| Social Engineering | 10% |
| Digital Footprint | 5% |
| **Total** | **100%** |

Visibility answers are `PUBLIC`, `FRIENDS`, `PRIVATE`, or `NOT_SURE`. Control answers are `YES`, `NO`, `SOMETIMES`, or `NOT_SURE`. Behavior answers are `OFTEN`, `SOMETIMES`, `RARELY`, `NEVER`, or `NOT_SURE`. Higher contributions indicate more assessed exposure. `NOT_SURE` receives a middle-high contribution so the report can recommend checking the setting.

| Score | Level |
| ---: | --- |
| 0–20 | LOW |
| 21–40 | MODERATE |
| 41–70 | HIGH |
| 71–100 | CRITICAL |

The score answers “where should I review first?” It does not measure the probability of a real incident. A public profile is not automatically unsafe; audience, context, and user preference matter.

## Privacy by Design

- **Data minimization:** Questions ask whether a detail is visible, never for the detail itself.
- **Purpose limitation:** Answers are used only to calculate the requested assessment.
- **Least privilege:** Connected services and permissions are reviewed for unnecessary access.
- **Privacy by default:** The assessment is self-reported; no external profiles or uploads are fetched.
- **Transparency and control:** Scoring weights, response mappings, limitations, delete action, and expiry are documented.
- **Retention limitation:** Stored summaries expire after 30 days and can be deleted earlier.
- **Secure processing:** JSON inputs are size-limited and validated; assessment and simulation endpoints are rate-limited. User answers are not written to request logs.

Assessment IDs are random UUIDs. Treat a report link as private because someone with its ID can retrieve its minimized result. The API does not implement user accounts or per-user authorization; add authentication and ownership controls before using it for an organization or storing sensitive assessments.

## System architecture

```text
React + Vite frontend
  ├── questionnaire, dashboard, report, awareness/checklist
  └── typed client generated from the OpenAPI contract
             ↓ /api
Express API
  ├── input validation and rate limiting
  ├── explainable scoring, findings, and simulations
  └── synthetic-only dashboard statistics
             ↓
PostgreSQL
  └── score/category summary, finding IDs, timestamps, expiry
```

### Technology

- React, TypeScript, Vite, Wouter, TanStack Query
- Express 5 and TypeScript
- PostgreSQL and Drizzle ORM
- OpenAPI 3.1, Orval-generated request hooks and Zod schemas
- Python 3 and the standard library for the deterministic synthetic CSV
- Node's built-in test runner for scorer tests

This is a modern web stack that works well for a student portfolio because it demonstrates API contracts, typed frontend/backend integration, database design, data minimization, explainable scoring, and automated tests. The Python generator is kept dependency-free and approachable. A Flask/SQLite rewrite could be a useful separate learning exercise, but would duplicate the app rather than improve this implementation.

## API

The API base path is `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/assessment` | Validate responses, score them, and store a minimized summary |
| `GET` | `/assessment/{id}` | Retrieve a report summary using its random ID |
| `GET` | `/assessment/{id}/recommendations` | Retrieve prioritized remediation actions |
| `DELETE` | `/assessment/{id}` | Delete an assessment |
| `POST` | `/assessment/simulate-improvement` | Compare the current score with selected changes |
| `GET` | `/dashboard/stats` | Read synthetic-cohort aggregate metrics |
| `GET` | `/privacy-checklist` | Retrieve the printable checklist |
| `GET` | `/healthz` | Check API health |

Request bodies contain only questionnaire choice values. Invalid or incomplete input returns HTTP 400; missing/expired assessment IDs return 404; over-limit scoring requests return 429. The framework does not have login/accounts; a random report ID is a bearer-style link. Do not use this API for employee screening or decisions about individuals.

## Synthetic dataset

`data/generate_dataset.py` creates exactly 1,000 fictional records in `data/social_media_privacy_assessments.csv` using a fixed random seed. It includes assessment response flags, category-independent sample fields, and the generated score/level. No names, usernames, contact values, exact locations, posts, or account identifiers appear in the records. The generator uses no external libraries.

To regenerate it from the workspace root:

```bash
python3 artifacts/privacy-risk-assessment/data/generate_dataset.py
```

Changing the generator seed or count is supported through `generate_dataset(output, count, seed)` when imported from Python.

## Run in Replit

The app and API server are configured as separate workflows. Use Replit's Preview for the app. From the workspace root, the commands below are available for local development in separate terminals:

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/privacy-risk-assessment run dev
```

`DATABASE_URL` must be available to the API server. In Replit it is provided by the managed PostgreSQL environment. For a local clone, use a local environment manager to inject the value shown in `.env.example`; the API command does not automatically load that example file. Never commit a real `.env`.

The app is mounted at `/`. The API is served through `/api`. The API and frontend need to be running at the same time. The dashboard independently generates its synthetic aggregate cohort; it does not query or merge individual assessment reports.

## Generate a report

1. Open **Start assessment** and answer all 51 questions.
2. Review the score, category breakdown, findings, and recommended actions.
3. Select changes in the improvement simulator to compare framework scores.
4. Use the report export/print action to save or print the summary.
5. Delete the assessment when no longer needed.

The simulation applies selected responses to the scoring model. It is not a guarantee that changing a setting will prevent harm.

## Testing

Run the scoring suite:

```bash
pnpm --filter @workspace/api-server run test
```

The suite covers the 51-question schema, all categories, safe and fully exposed profiles, category scoring, configurable weights, risk thresholds, input validation, findings, recommendation priorities, account controls, and improvement simulations. The tested scoring engine is the same TypeScript module used by the API.

Run the 11 dependency-free dataset-generator tests:

```bash
python3 -m unittest discover -s artifacts/privacy-risk-assessment/tests -v
```

Typecheck the shared packages and API:

```bash
pnpm run typecheck:libs
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/privacy-risk-assessment run typecheck
```

The app does not run tests against real profiles, scrape accounts, enumerate handles, or test access to private data.

## Threat model

See [`docs/threat-model.md`](docs/threat-model.md) for assets, threats, impacts, and controls. This is a learning threat model, not a formal security assessment.

## Limitations and future work

- Self-reported responses may be mistaken or incomplete.
- Weights and thresholds have not been calibrated against a validated benchmark.
- Platform settings change and are not automatically checked.
- Findings are generic coaching, not account-specific instructions.
- The in-memory rate limiter is per server process; use a shared limiter before multi-instance production.
- Authentication, organizational access controls, and audit roles are not included.
- Dashboard statistics are synthetic and must not be represented as real-user data.

Safe future work includes platform-specific checklists, a privacy-awareness quiz, accessibility/localization improvements, model calibration with consented and carefully anonymized study data, and optional client-only scoring. Do not add scraping, tracking, invasive monitoring, or account enumeration.

## GitHub setup

Suggested repository name: `Social-Media-Privacy-Risk-Assessment`

Description: “Privacy-focused cybersecurity framework for assessing social-media exposure, account-security practices, social-engineering risk, digital-footprint risk, and personalized privacy improvements using synthetic/self-reported data.”

Suggested topics: `cybersecurity`, `privacy`, `social-media-privacy`, `privacy-risk`, `security-awareness`, `typescript`, `python`, `digital-footprint`, `risk-assessment`, `grc`, `privacy-by-design`, `defensive-security`.

```bash
git init
git add .
git commit -m "Initialize social media privacy risk assessment"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
```

Suggested incremental commits: create the assessment architecture; add the questionnaire; generate the synthetic dataset; implement feature extraction and scoring; add findings and recommendations; build the simulator; create the dashboard; add report export; document privacy-by-design controls; add automated tests; complete the project documentation.

## Portfolio proof checklist

Capture screenshots (use synthetic/demo data) with clear filenames such as:

1. `01-dashboard-overview.png`
2. `02-questionnaire-profile-visibility.png`
3. `03-questionnaire-location-privacy.png`
4. `04-questionnaire-account-security.png`
5. `05-assessment-overall-score.png`
6. `06-assessment-category-breakdown.png`
7. `07-assessment-findings.png`
8. `08-improvement-simulation-before-after.png`
9. `09-privacy-checklist.png`
10. `10-printable-report.png`
11. `11-synthetic-csv-preview.png`
12. `12-test-results.png`
13. `13-project-architecture.png`
14. `14-readme-preview.png`

For LinkedIn and resume wording, see [`docs/portfolio-kit.md`](docs/portfolio-kit.md). The report template is in [`docs/project-report.md`](docs/project-report.md).

## Ethical disclaimer

This project is designed for defensive cybersecurity and privacy education. It uses synthetic or voluntarily provided assessment responses and does not scrape, track, or profile real social-media users.
