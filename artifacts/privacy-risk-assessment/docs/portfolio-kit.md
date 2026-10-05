# Portfolio and Interview Kit

## Resume bullets

- Built a privacy-focused assessment platform with a 51-question self-report flow, ten weighted risk categories, explainable findings, remediation guidance, and a score-improvement simulator.
- Implemented a privacy-minimizing API and PostgreSQL schema that stores only derived scores and finding types, applies 30-day retention, validates inputs, and rate-limits scoring requests.
- Generated a reproducible 1,000-record synthetic dataset and added 52 automated tests covering risk scoring, thresholds, validation, recommendations, and simulations.

## Two-line project description

Social Media Privacy Risk Assessment Framework is a defensive education tool that helps users review their own social-media exposure through a fixed-choice questionnaire. It calculates transparent category scores, provides prioritized privacy recommendations, and uses synthetic data for portfolio-safe dashboard analytics.

## LinkedIn project description

I built the Social Media Privacy Risk Assessment Framework as a defensive cybersecurity and privacy-awareness project. It helps users assess their own profile visibility, personal-information exposure, location-sharing habits, content settings, connections, tags, account controls, connected apps, social-engineering awareness, and digital footprint.

The app includes a 51-question self-assessment, ten weighted category scores, explainable findings, prioritized recommendations, a privacy-improvement simulator, report/checklist exports, and a dashboard based on 1,000 synthetic records. It uses a React and TypeScript frontend, an Express API, OpenAPI-generated validation/client hooks, PostgreSQL, Drizzle, and a reproducible Python dataset generator.

Privacy was part of the design: the tool does not scrape or inspect social accounts, does not request passwords or actual contact/location details, and stores only derived assessment summaries with a 30-day retention window. The framework is educational; its weights are not calibrated for real-world or consequential decisions.

## Technical skills demonstrated

- Defensive cybersecurity and security-awareness design
- Privacy risk assessment and Privacy by Design
- Data minimization, retention limitation, and least privilege
- TypeScript, React, Express, REST API design
- OpenAPI contracts, Zod validation, generated client hooks
- PostgreSQL, Drizzle ORM, data modeling
- Explainable weighted risk scoring
- Synthetic dataset generation and CSV
- Automated unit testing
- Threat modeling and ethical scope definition

## GitHub repository description

Privacy-focused cybersecurity framework for assessing social-media exposure, account-security practices, social-engineering risk, digital-footprint risk, and personalized privacy improvements using synthetic/self-reported data.

Suggested topics: `cybersecurity`, `privacy`, `social-media-privacy`, `privacy-risk`, `security-awareness`, `typescript`, `python`, `digital-footprint`, `risk-assessment`, `grc`, `privacy-by-design`, `defensive-security`.

## Interview questions and sample answers

### 1. Explain your project.

I built a Social Media Privacy Risk Assessment Framework that evaluates a person's social-media privacy practices without scraping or accessing their accounts. The user completes a fixed-choice questionnaire across ten areas. The app turns the responses into category scores, an overall score, findings, and prioritized recommendations. I also added a simulator that shows how selected changes affect the framework's score. The app uses synthetic dashboard data and stores only a minimized result summary.

### 2. What is the difference between privacy and security?

Privacy is about how information is collected, exposed, shared, and used. Security is about protecting systems and information from unauthorized access or misuse. They overlap but are not identical: MFA may protect sign-in while contact details or posts remain visible to a broad audience.

### 3. What is a digital footprint?

A digital footprint is information associated with someone's online presence and activities. It includes things they intentionally share, such as posts and comments, and may include other activity data depending on the service. My project assesses only self-reported practices, such as whether users review old public posts; it does not track activity.

### 4. How does your risk scoring system work?

Each answer maps to a normalized risk contribution. The system calculates a weighted average within each category and combines the category scores with configurable weights that total 100%. Scores range from 0 to 100, with higher scores meaning higher assessed exposure. The thresholds and weights are educational assumptions and need validation before professional use.

### 5. How can oversharing increase cybersecurity risk?

Public context about an employer, school, interests, travel, or family references can sometimes make fraudulent requests seem more believable. It can also create privacy exposure even if no attack happens. The framework explains these connections without generating attack messages or profiling a person.

### 6. Why is MFA included in a privacy project?

Privacy and account security overlap. If an account is taken over, private messages, photos, and contacts may become accessible. MFA adds another sign-in factor and can reduce some account-takeover risks, while remaining conceptually distinct from public-visibility controls.

### 7. What risks can third-party applications create?

Apps may retain permissions after a user stops using them. A user can review connected apps and revoke unnecessary access. This reflects least privilege: each app should receive only access needed for its legitimate purpose.

### 8. What is Privacy by Design, and how did you apply it?

Privacy by Design considers privacy throughout system development. This app asks whether a phone number is public instead of collecting the number itself, never requests passwords or exact locations, and stores derived scores and finding IDs rather than raw answers. It also has a deletion action and a retention window.

### 9. What does the improvement simulator show?

It replaces selected questionnaire answers with safer choices and recalculates the same scoring model. The difference is a model-based comparison, not proof that an account is safe or that a real incident will be prevented.

### 10. How did you make the project safe, and what would you improve?

I kept it self-report-only, used synthetic dashboard data, excluded scraping and account enumeration, validated all response IDs and values, rate-limited scoring endpoints, and avoided storing raw answers or identifying details. Future work could add platform-specific checklists, accessible localization, and careful model calibration. Before using it organizationally, I would add authentication, ownership controls, and a shared rate limiter.
