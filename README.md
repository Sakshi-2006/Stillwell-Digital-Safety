# Social Media Privacy Risk Assessment Framework

A defensive, educational application for evaluating social media privacy exposure, account security practices, and digital footprint risk. The tool helps a user answer a structured questionnaire about profile visibility, location sharing, third-party app access, authentication, and content habits, then turns those responses into explainable risk scores, findings, and personalized recommendations.

This project is designed for cybersecurity education and privacy awareness. It does not scrape real social media profiles, access private accounts, or process sensitive personal data. It uses consent-based self-reported inputs and synthetic demo data only.

## Project Overview

The framework provides a guided assessment experience that:

- reviews public profile exposure and privacy settings
- evaluates personal information visibility
- checks location and travel-related disclosure risks
- inspects content sharing patterns and historical posts
- reviews friend, follower, and tagging controls
- assesses account security controls such as MFA and login alerts
- analyzes third-party app permissions and social engineering exposure
- generates an overall score and category-level breakdown
- simulates the effect of privacy improvements before changes are made
- produces a privacy checklist and assessment summary for learning or portfolio use

## Key Features

- 51-question self-assessment covering privacy and security behaviors
- Overall risk score from 0 to 100 with risk level classification
- Category-wise scoring across the main privacy areas
- Findings and prioritized recommendations
- Improvement simulation for “what if I change this setting?” scenarios
- Synthetic dashboard statistics for demonstration and reporting
- Privacy-report generation based on minimized, non-sensitive results
- Data minimization and privacy-by-design principles throughout the workflow

## Ethical and Legal Scope

This project is intended for defensive privacy and cybersecurity education. It does not:

- scrape real social media profiles
- access private accounts or hidden content
- collect, store, or infer a user’s actual personal information
- identify or track real individuals
- perform social engineering or exploit workflows

The application is meant for self-assessment of voluntary, synthetic, or authorized data only.

## Repository Structure

- `lib/api-spec/` - OpenAPI contract and generated API types
- `lib/api-client-react/` - TypeScript client for the API
- `lib/api-zod/` - Zod validation schemas derived from the API contract
- `lib/db/` - PostgreSQL schema and database configuration
- `artifacts/privacy-risk-assessment/` - main project app, dataset generator, and docs
- `scripts/` - repository maintenance scripts
- `package.json` - workspace root configuration
- `pnpm-workspace.yaml` - monorepo package layout

## Tech Stack

- TypeScript
- Node.js
- pnpm workspaces
- Express 5 for the API layer
- PostgreSQL + Drizzle ORM
- Zod validation
- OpenAPI-based code generation
- React + Vite for the front end
- Python for synthetic dataset generation and tests

## Getting Started

### Prerequisites

- Node.js 24 or later
- pnpm
- PostgreSQL database for local or development use
- `DATABASE_URL` set in the environment

### Install dependencies

```bash
pnpm install
```

### Generate API artifacts and database schema

```bash
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db run push
```

### Run the application

Start the API server:

```bash
pnpm --filter @workspace/api-server run dev
```

Start the frontend app:

```bash
pnpm --filter @workspace/privacy-risk-assessment run dev
```

Run the full typecheck:

```bash
pnpm run typecheck
```

Run the build:

```bash
pnpm run build
```

## Privacy-by-Design Principles

This project follows several privacy-first design principles:

- Data minimization: the application asks about visibility and controls instead of collecting personal values
- Purpose limitation: assessment data is used only for scoring and coaching
- Transparency: scoring logic and thresholds are documented and explainable
- Retention control: stored summaries should be kept only as long as needed
- Ethical scope: the project does not monitor or profile real people

## Synthetic Dataset

The project includes a deterministic synthetic dataset generator that creates fictional privacy assessment records for dashboard examples and demonstration content.

To regenerate the dataset:

```bash
python3 artifacts/privacy-risk-assessment/data/generate_dataset.py
```

## Testing

Run the API scoring tests:

```bash
pnpm --filter @workspace/api-server run test
```

Run the Python dataset tests:

```bash
python3 -m unittest discover -s artifacts/privacy-risk-assessment/tests -v
```

## Risk Model Notes

The scoring model is educational and designed to support awareness, not to predict real-world compromise with certainty. Scores are based on self-reported behaviors and configurable assumptions. They are most valuable as a learning aid and a starting point for discussing safer privacy practices.

## License

This project is licensed under the MIT License.

## Summary

This repository brings together privacy education, defensive cybersecurity practice, and modern application development. It demonstrates a complete workflow for assessment, scoring, reporting, and dashboarding in a way that is both useful for learning and aligned with responsible privacy-first design.
