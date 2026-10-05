import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  CATEGORIES,
  CATEGORY_WEIGHTS,
  QUESTIONS,
  calculatePrivacyRisk,
  extractPrivacyFeatures,
  riskLevelFor,
  simulateImprovements,
  validateAnswers,
  type AssessmentAnswerMap,
} from "./privacy-assessment.ts";

function safeAnswers(): AssessmentAnswerMap {
  return Object.fromEntries(
    QUESTIONS.map((question) => [
      question.id,
      question.kind === "visibility"
        ? "PRIVATE"
        : question.kind === "control"
          ? "YES"
          : "NEVER",
    ]),
  );
}

function exposedAnswers(): AssessmentAnswerMap {
  return Object.fromEntries(
    QUESTIONS.map((question) => [
      question.id,
      question.kind === "visibility"
        ? "PUBLIC"
        : question.kind === "control"
          ? "NO"
          : "OFTEN",
    ]),
  );
}

test("questionnaire contains at least 40 self-report questions", () => {
  assert.equal(QUESTIONS.length, 51);
});
test("questionnaire covers all ten risk categories", () => {
  assert.equal(CATEGORIES.length, 10);
  assert.deepEqual(new Set(QUESTIONS.map((question) => question.category)), new Set(CATEGORIES));
});
test("frontend questionnaire IDs and response kinds match the scoring engine", () => {
  const appSource = readFileSync(
    new URL("../../../privacy-risk-assessment/src/App.tsx", import.meta.url),
    "utf8",
  );
  const frontendQuestions: Array<[string, string]> = [
    ...appSource.matchAll(/\{\s*id:\s*'([^']+)'\s*,\s*prompt:\s*.*?,\s*kind:\s*'(visibility|control|behavior)'\s*\}/g),
  ].map((match) => [match[1]!, match[2]!]);
  assert.equal(frontendQuestions.length, QUESTIONS.length);
  assert.deepEqual(
    new Map(frontendQuestions),
    new Map(QUESTIONS.map((question) => [question.id, question.kind])),
  );
});
test("default category weights total 100", () => {
  assert.equal(Object.values(CATEGORY_WEIGHTS).reduce((sum, weight) => sum + weight, 0), 100);
});
test("fully private, fully controlled answers score zero", () => {
  assert.equal(calculatePrivacyRisk(safeAnswers()).overallScore, 0);
});
test("fully exposed answers score 100", () => {
  assert.equal(calculatePrivacyRisk(exposedAnswers()).overallScore, 100);
});
test("score 0 is LOW", () => assert.equal(riskLevelFor(0), "LOW"));
test("score 20 is LOW", () => assert.equal(riskLevelFor(20), "LOW"));
test("score 21 is MODERATE", () => assert.equal(riskLevelFor(21), "MODERATE"));
test("score 40 is MODERATE", () => assert.equal(riskLevelFor(40), "MODERATE"));
test("score 41 is HIGH", () => assert.equal(riskLevelFor(41), "HIGH"));
test("score 70 is HIGH", () => assert.equal(riskLevelFor(70), "HIGH"));
test("score 71 is CRITICAL", () => assert.equal(riskLevelFor(71), "CRITICAL"));
test("score 100 is CRITICAL", () => assert.equal(riskLevelFor(100), "CRITICAL"));
test("public profile visibility increases profile exposure", () => {
  const answers = safeAnswers();
  answers.profile_public = "PUBLIC";
  assert.ok(calculatePrivacyRisk(answers).categoryScores.find((item) => item.category === "Profile Exposure")!.score > 0);
});
test("friends-only visibility contributes less risk than public visibility", () => {
  const friends = safeAnswers();
  const publicAnswers = safeAnswers();
  friends.profile_public = "FRIENDS";
  publicAnswers.profile_public = "PUBLIC";
  assert.ok(
    calculatePrivacyRisk(friends).categoryScores[0].score <
      calculatePrivacyRisk(publicAnswers).categoryScores[0].score,
  );
});
test("private visibility has no visibility risk contribution", () => {
  const features = extractPrivacyFeatures(safeAnswers());
  assert.equal(features.phone_public.riskContribution, 0);
});
test("public phone visibility creates a finding", () => {
  const answers = safeAnswers();
  answers.phone_public = "PUBLIC";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "phone_public"));
});
test("public personal email visibility is scored", () => {
  const answers = safeAnswers();
  answers.email_public = "PUBLIC";
  assert.ok(calculatePrivacyRisk(answers).categoryScores.find((item) => item.category === "Personal Information")!.score > 0);
});
test("public full birthday visibility is scored", () => {
  const answers = safeAnswers();
  answers.birthday_public = "PUBLIC";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "birthday_public"));
});
test("real-time location behavior is scored", () => {
  const answers = safeAnswers();
  answers.live_location = "OFTEN";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "live_location"));
});
test("public travel plans create a finding", () => {
  const answers = safeAnswers();
  answers.travel_plans_public = "OFTEN";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "travel_plans_public"));
});
test("public workplace details are scored", () => {
  const answers = safeAnswers();
  answers.workplace_public = "PUBLIC";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "workplace_public"));
});
test("public education exposure has a corresponding question", () => {
  assert.ok(QUESTIONS.some((question) => question.id === "education_public"));
});
test("public posts increase content exposure", () => {
  const answers = safeAnswers();
  answers.posts_public = "PUBLIC";
  assert.ok(calculatePrivacyRisk(answers).categoryScores.find((item) => item.category === "Content Exposure")!.score > 0);
});
test("accepting unknown requests creates a finding", () => {
  const answers = safeAnswers();
  answers.unknown_requests_accepted = "OFTEN";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "unknown_requests_accepted"));
});
test("disabled tag review creates a finding", () => {
  const answers = safeAnswers();
  answers.tag_review_enabled = "NO";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "tag_review_enabled"));
});
test("disabled MFA creates a finding", () => {
  const answers = safeAnswers();
  answers.mfa_enabled = "NO";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "mfa_enabled"));
});
test("disabled login alerts create a finding", () => {
  const answers = safeAnswers();
  answers.login_alerts_enabled = "NO";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "login_alerts_enabled"));
});
test("password reuse awareness is covered without requesting a password", () => {
  assert.ok(QUESTIONS.some((question) => question.id === "password_unique"));
});
test("unreviewed third-party apps create a finding", () => {
  const answers = safeAnswers();
  answers.third_party_apps_reviewed = "NO";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "third_party_apps_reviewed"));
});
test("unexpected links not checked create a finding", () => {
  const answers = safeAnswers();
  answers.unexpected_links_checked = "NO";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "unexpected_links_checked"));
});
test("unreviewed historical posts create a finding", () => {
  const answers = safeAnswers();
  answers.old_posts_reviewed = "NO";
  assert.ok(calculatePrivacyRisk(answers).findings.some((finding) => finding.id === "old_posts_reviewed"));
});
test("privacy-settings review is included", () => {
  assert.ok(QUESTIONS.some((question) => question.id === "privacy_settings_reviewed"));
});
test("feature extraction returns one feature per question", () => {
  assert.equal(Object.keys(extractPrivacyFeatures(safeAnswers())).length, QUESTIONS.length);
});
test("feature extraction maps questions to their correct category", () => {
  assert.equal(extractPrivacyFeatures(safeAnswers()).mfa_enabled.category, "Account Security");
});
test("feature extraction reports maximum exposure for public visibility", () => {
  const answers = safeAnswers();
  answers.phone_public = "PUBLIC";
  assert.equal(extractPrivacyFeatures(answers).phone_public.riskContribution, 1);
});
test("no findings are returned for a fully safe response set", () => {
  assert.equal(calculatePrivacyRisk(safeAnswers()).findings.length, 0);
});
test("findings produce actionable recommendations", () => {
  const answers = safeAnswers();
  answers.mfa_enabled = "NO";
  assert.ok(calculatePrivacyRisk(answers).recommendations.some((item) => item.id === "mfa_enabled" && item.action.length > 10));
});
test("highest-priority findings can be marked immediate", () => {
  const answers = safeAnswers();
  answers.phone_public = "PUBLIC";
  assert.equal(calculatePrivacyRisk(answers).recommendations.find((item) => item.id === "phone_public")?.priority, "IMMEDIATE");
});
test("all five account-security controls are counted when enabled", () => {
  assert.equal(calculatePrivacyRisk(safeAnswers()).securityControlsEnabled, 5);
});
test("disabled account controls are not counted as enabled", () => {
  const answers = safeAnswers();
  answers.mfa_enabled = "NO";
  assert.equal(calculatePrivacyRisk(answers).securityControlsEnabled, 4);
});
test("simulation of improvements reduces or preserves score", () => {
  const answers = exposedAnswers();
  const result = simulateImprovements(answers, ["phone_public", "mfa_enabled"]);
  assert.ok(result.simulated.overallScore <= result.current.overallScore);
  assert.ok(result.riskReduction >= 0);
});
test("simulation of all improvements reaches the safe baseline", () => {
  const answers = exposedAnswers();
  const result = simulateImprovements(answers, QUESTIONS.map((question) => question.id));
  assert.equal(result.simulated.overallScore, 0);
});
test("simulation rejects unknown improvement identifiers", () => {
  assert.throws(() => simulateImprovements(safeAnswers(), ["unknown"]), /unknown improvement/i);
});
test("simulation with no changes has no score reduction", () => {
  const answers = exposedAnswers();
  assert.equal(simulateImprovements(answers, []).riskReduction, 0);
});
test("complete valid answers pass validation", () => {
  assert.equal(validateAnswers(safeAnswers()), null);
});
test("missing answers fail validation", () => {
  const answers = safeAnswers();
  delete answers.mfa_enabled;
  assert.match(validateAnswers(answers) ?? "", /answer all/i);
});
test("extra answer fields fail validation", () => {
  const answers = { ...safeAnswers(), actual_phone_number: "should-not-be-accepted" };
  assert.match(validateAnswers(answers) ?? "", /answer all/i);
});
test("invalid response values fail validation", () => {
  const answers = safeAnswers();
  answers.profile_public = "BENGALURU";
  assert.match(validateAnswers(answers) ?? "", /invalid response/i);
});
test("unknown question identifiers fail validation", () => {
  const answers = safeAnswers();
  answers.unknown_item = "YES";
  assert.notEqual(validateAnswers(answers), null);
});
test("category scores stay in the 0–100 range", () => {
  const result = calculatePrivacyRisk(exposedAnswers());
  assert.ok(result.categoryScores.every((item) => item.score >= 0 && item.score <= 100));
});
test("category weighting is configurable", () => {
  const answers = safeAnswers();
  answers.phone_public = "PUBLIC";
  const standard = calculatePrivacyRisk(answers);
  const heavierPersonal = calculatePrivacyRisk(answers, {
    ...CATEGORY_WEIGHTS,
    "Personal Information": 50,
  });
  assert.ok(heavierPersonal.overallScore >= standard.overallScore);
});
