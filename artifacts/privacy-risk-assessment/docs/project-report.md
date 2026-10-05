# Social Media Privacy Risk Assessment Framework — Project Report

## Abstract

This project implements a defensive educational framework that helps people review self-reported social-media privacy and account-security practices. A 51-question questionnaire covers ten categories. The scoring engine normalizes answers into category scores, produces an overall 0–100 exposure score, and creates findings and prioritized coaching actions. A simulator estimates how selected answers affect this framework's score. A dashboard presents aggregate statistics computed from synthetic records. The system does not scrape platforms or store raw answers and identifying personal information.

## Introduction and problem statement

People may unintentionally disclose contact details, location context, daily routines, workplace or education information, family information, or security practices through profile settings and posts. These disclosures can increase unwanted contact, identity-related risk, or the credibility of social-engineering attempts. Users need practical, understandable guidance without having to provide private data to a scanner.

The problem addressed is the lack of a simple, explainable self-review workflow that connects privacy settings to prioritized improvement steps while minimizing the data collected by the assessment itself.

## Objectives

1. Provide a structured self-assessment with at least 40 questions.
2. Translate fixed-choice responses into ten transparent category scores.
3. Explain detected weaknesses and suggest practical remediation.
4. Let users compare current and simulated scores.
5. Provide printable checklist and report views.
6. Demonstrate privacy-by-design in the storage and processing model.
7. Use synthetic data for dashboard demonstration and dataset generation.

## Background

### Social-media privacy and digital footprint

Privacy concerns how information is collected, exposed, shared, and used. A digital footprint includes deliberately shared posts and profile details, as well as activity-generated data depending on the service. Old posts and public comments can remain accessible after their original audience or context changes.

### Privacy versus security

Security protects accounts, systems, and information from unauthorized access. Privacy concerns control over information exposure and use. A strong password and MFA may protect account access while a profile still publicly exposes contact details or content.

### Social engineering and location exposure

Public context about an employer, school, interests, family references, or travel can sometimes make fraudulent requests seem more plausible. Real-time geotags, check-ins, and repeated place/time patterns may expose location context. Sharing a location-related update after leaving can reduce immediate exposure compared with broadcasting while present.

## Proposed framework and architecture

```text
React questionnaire
       ↓
OpenAPI-validated Express endpoint
       ↓
Feature extraction and weighted category scoring
       ↓
Findings, recommendations, simulation, and report
       ↓
Minimized PostgreSQL summary / synthetic-only analytics
```

The frontend uses generated API hooks. The backend uses generated Zod schemas at request and response boundaries. Assessment responses are transient; the database contains only derived summary fields and expires rows after 30 days.

## Questionnaire design

The 51 fixed-choice questions are organized as follows:

- Profile Exposure
- Personal Information
- Location Exposure
- Content Exposure
- Connection Risk
- Tagging Risk
- Account Security
- Third-Party Apps
- Social Engineering
- Digital Footprint

Questions ask about visibility or behavior, not the sensitive value itself. For example, the app asks whether a phone number is publicly visible; it never asks the user to enter a phone number.

## Synthetic dataset

The standard-library Python generator produces 1,000 fictional rows with a fixed seed. Each row contains enumerated self-assessment-style flags, risk score, and risk level. No personal names, real handles, contact values, exact locations, posts, or profile identifiers are present. The dashboard uses deterministic synthetic aggregate summaries.

## Feature engineering and scoring

An answer is converted to a normalized risk contribution between 0 and 1. Public visibility contributes more than friends-only visibility; private visibility contributes no visibility exposure. For controls, enabled/practiced controls contribute less risk. For behavior questions, frequent risky behavior contributes more risk. “Not sure” is an explicit middle-high contribution to encourage a settings review.

For category `c`, the score is:

```text
category_score(c) =
  round(100 × sum(answer_risk_i × question_weight_i) / sum(question_weight_i))
```

The overall score is a weighted mean of the ten category scores. Default category weights sum to 100%. Categories and overall scores range from 0 to 100, where a higher score means higher assessed exposure. Risk levels are LOW (0–20), MODERATE (21–40), HIGH (41–70), and CRITICAL (71–100).

Weights and thresholds are educational assumptions. They have not been validated against observed incidents or a representative benchmark and should not drive employment, school, insurance, or other consequential decisions.

## Findings and recommendation engine

Responses with a meaningful risk contribution map to a question ID and explanatory finding. Each finding maps to a specific remediation recommendation, such as limiting contact visibility, enabling MFA, reviewing third-party application access, or checking photo backgrounds and metadata. Priority is based on question importance and contribution.

## Improvement simulator

The simulator temporarily replaces selected response values with safer choices, reruns the same model, and compares the resulting score. The current and simulated category scores remain within 0–100. The calculation is a framework simulation and does not guarantee improved real-world safety.

## Account security, third-party applications, location, and footprint

The questionnaire includes MFA, unique passwords, password-manager use, login alerts, and session/recovery review. It never requests or processes an actual password. Connected application questions focus on review, unnecessary access, older integrations, and least privilege. Location questions ask only about behaviors and visibility—not coordinates. Digital-footprint questions focus on old posts, comments, unused accounts, linked profiles, and recurring privacy-setting review.

## Dashboard and report

The dashboard shows synthetic cohort scores, category comparisons, risk distribution, common synthetic weaknesses, and security-control coverage. Individual reports show an assessment ID/date, overall risk, category scores, finding types, recommendations, and priority actions. Report data excludes the original answer map.

## Privacy by Design

- Data minimization: no identifying value fields in the questionnaire.
- Purpose limitation: response choices are used for the requested score only.
- Least privilege: recommendations encourage reviewing connected-app permissions.
- Privacy by default: no scraping, external profile import, or image upload.
- Transparency: scoring assumptions and disclaimers are available to users.
- User control: the report can be deleted by its holder.
- Retention limitation: database rows expire after 30 days.
- Secure processing: schema validation, a JSON size limit, rate limiting, and no request-body logging.

## Testing and security checks

The automated TypeScript suite includes 53 tests for frontend/API questionnaire parity, question coverage, all categories, safe and maximum-exposure scores, category mapping, response validation, risk-level boundaries, weighted scoring, findings, recommendations, controls, and simulations. Eleven Python tests cover deterministic generation, CSV shape, synthetic-only fields, and score boundaries. Additional operational checks include typechecking, the synthetic CSV record count, and API endpoint verification.

## Results

The project demonstrates a functioning assessment engine, typed API contract, minimized storage schema, fixed-choice questionnaire, synthetic 1,000-row data generator, report/recommendation flow, and automated scoring tests. The score is explainable: each category's value derives from explicit question contributions and a documented weight.

## Limitations

- The questionnaire relies on user memory and self-report.
- Scores are not empirically calibrated.
- Platform settings and product interfaces change.
- No live settings verification is performed.
- The app has no login or individual ownership controls.
- Assessment IDs act like private bearer links.
- The process-local rate limiter does not coordinate multiple server instances.
- Synthetic cohort statistics do not describe actual users.

## Future scope

Safe additions could include platform-specific checklists, awareness quizzes, organizational policy templates using synthetic or aggregated data, accessible localization, and transparent calibration studies based on voluntary consent. Invasive monitoring, scraping, account enumeration, and individual surveillance are outside the scope.

## Conclusion

The framework demonstrates how a cybersecurity project can translate privacy awareness into clear, explainable actions without collecting the sensitive facts it is designed to protect. It is suitable as an educational prototype and portfolio demonstration, not as a validated risk-scoring service.
