# Defensive Threat Model

## Scope and assumptions

The fictional subject is a person reviewing their own social-media privacy practices. The framework receives only fixed questionnaire choices. It does not collect real account content, profile URLs, names, messages, passwords, addresses, contact values, or coordinates. This is an educational model, not a claim that every listed threat will occur.

## Assets

- Account access and recovery ability
- Identity and contact-information privacy
- Location and routine privacy
- Private content and family information
- Social relationships and connection lists
- Assessment summary and report ID

## Threats and mitigations

| Asset | Threat | Example exposure | Potential impact | Existing control | Recommended control |
| --- | --- | --- | --- | --- | --- |
| Account | Account takeover | MFA disabled or password reused | Unauthorized access to account content | Questionnaire never requests passwords; derived score only | Enable MFA, use unique passwords, review sessions and recovery settings |
| Identity information | Impersonation | Public profile context is visible | Trust abuse, unwanted contact, or confusion | No profile collection or account enumeration | Verify unusual requests through a separate channel |
| Contact information | Phishing or unwanted contact | Contact fields are public | More unsolicited messages or convincing lures | Questionnaire asks only whether contact data is visible | Restrict visibility and verify unexpected links |
| Location privacy | Oversharing or routine inference | Real-time tags or repeated location patterns | Unwanted attention or personal safety concerns | No geolocation, maps, or tracking | Avoid real-time location broadcasts; review past posts |
| Private content | Unwanted profiling | Old posts or tagged content remains broadly visible | Loss of control over context or audience | Raw post text and images are not accepted | Review audience, tag controls, and historical content |
| Social relationships | Third-party app exposure | Unused integration retains account permission | Excessive or outdated access | No third-party social integrations in the app | Revoke unused app access and apply least privilege |
| Assessment summary | Unauthorized report lookup | A report ID is shared or exposed | A person could see inferred risk categories | Random UUID; minimized summary; no raw answers; 30-day expiry; deletion action | Treat the report link as private; add login and ownership controls before organizational use |
| Assessment service | Request flooding | Repeated scoring or simulation requests | Temporary service degradation | JSON body cap and in-memory per-IP request limit | Use a shared rate limiter for multi-instance deployments; monitor service health |

## Trust boundaries and data flow

1. The browser sends 51 enumerated answer values to the API.
2. The API validates known IDs and allowed choices, then calculates category scores.
3. The API stores only scores, risk level, finding IDs, enabled-control count, timestamps, and expiry.
4. The answer map is not returned in a later report lookup and is not stored in the database.
5. Synthetic dashboard aggregates are generated from deterministic fictional responses and are separate from real assessments.

## Residual risk

Finding types can still reveal something about a person's self-reported practices, so report IDs should not be posted publicly. No login is implemented; the UUID is a bearer-style identifier, not per-user authorization. The in-memory rate limiter is local to one process. The framework does not verify actual platform settings, calibrate likelihood, or assess an account's real security posture.

## Ethical boundaries

Never extend this project to scrape profiles, bypass privacy controls, enumerate accounts, infer a real person's location, store private messages, identify people in photos, or create attack messages. Any organizational extension needs consent, purpose limitation, access control, retention policy, and a legal/privacy review.
