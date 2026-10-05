export const CATEGORIES = [
  "Profile Exposure",
  "Personal Information",
  "Location Exposure",
  "Content Exposure",
  "Connection Risk",
  "Tagging Risk",
  "Account Security",
  "Third-Party Apps",
  "Social Engineering",
  "Digital Footprint",
] as const;

export type RiskCategory = (typeof CATEGORIES)[number];
export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
type AnswerKind = "visibility" | "control" | "behavior";

type Question = {
  id: string;
  category: RiskCategory;
  title: string;
  kind: AnswerKind;
  priority: number;
  recommendation: string;
};

export const QUESTIONS: Question[] = [
  { id: "profile_public", category: "Profile Exposure", title: "Is your profile visible to everyone?", kind: "visibility", priority: 1, recommendation: "Limit profile visibility to the smallest audience that fits your needs." },
  { id: "profile_searchable", category: "Profile Exposure", title: "Have you disabled search-engine visibility for your social profile?", kind: "control", priority: 1, recommendation: "Review search-engine discoverability and disable it if you do not need it." },
  { id: "profile_followers_public", category: "Profile Exposure", title: "Can anyone view your followers or connections?", kind: "visibility", priority: 2, recommendation: "Restrict who can view your followers and connections where settings allow." },
  { id: "profile_friends_public", category: "Profile Exposure", title: "Can anyone view your friends list?", kind: "visibility", priority: 2, recommendation: "Hide your friends list or limit it to a trusted audience." },
  { id: "profile_activity_public", category: "Profile Exposure", title: "Have you limited activity-status and last-seen visibility to trusted contacts?", kind: "control", priority: 2, recommendation: "Limit activity-status and last-seen visibility to trusted contacts." },

  { id: "phone_public", category: "Personal Information", title: "Is your phone number publicly visible?", kind: "visibility", priority: 1, recommendation: "Hide your phone number from public profile and search settings." },
  { id: "email_public", category: "Personal Information", title: "Is a personal email address publicly visible?", kind: "visibility", priority: 1, recommendation: "Remove personal email visibility or use a separate public contact method." },
  { id: "birthday_public", category: "Personal Information", title: "Is your full birth date publicly visible?", kind: "visibility", priority: 1, recommendation: "Hide your full birth date; consider showing no date or month only." },
  { id: "workplace_public", category: "Personal Information", title: "Is your workplace or work location visible to everyone?", kind: "visibility", priority: 2, recommendation: "Limit workplace details to the audience that needs them." },
  { id: "education_public", category: "Personal Information", title: "Is your school, college, or education information visible to everyone?", kind: "visibility", priority: 2, recommendation: "Limit education and school details to the audience that needs them." },
  { id: "family_details_public", category: "Personal Information", title: "Are family or relationship details visible to everyone?", kind: "visibility", priority: 2, recommendation: "Review the audience for family and relationship details, including information about others." },

  { id: "live_location", category: "Location Exposure", title: "Do you share your live or current location with a broad audience?", kind: "behavior", priority: 1, recommendation: "Avoid broadcasting real-time location publicly; review app location permissions." },
  { id: "checkins_public", category: "Location Exposure", title: "Do you publicly share check-ins or location tags while you are there?", kind: "behavior", priority: 1, recommendation: "Consider sharing location-related posts after leaving and with a limited audience." },
  { id: "geotagging_enabled", category: "Location Exposure", title: "Do your posts or photos include location tags visible to a broad audience?", kind: "behavior", priority: 1, recommendation: "Review geotag settings and remove location tags from posts where they are unnecessary." },
  { id: "travel_plans_public", category: "Location Exposure", title: "Do you publicly post travel plans before or during a trip?", kind: "behavior", priority: 1, recommendation: "Share travel plans with trusted people privately and consider posting after returning." },
  { id: "routine_location_public", category: "Location Exposure", title: "Could repeated posts reveal places or times in your daily routine?", kind: "behavior", priority: 2, recommendation: "Avoid repeated public time-and-place patterns that reveal a routine." },

  { id: "posts_public", category: "Content Exposure", title: "Are your posts generally visible to everyone?", kind: "visibility", priority: 1, recommendation: "Choose the audience for each post and review the default audience setting." },
  { id: "children_photos_public", category: "Content Exposure", title: "Are photos of children or minors shared with a broad audience?", kind: "behavior", priority: 1, recommendation: "Use a limited audience for images involving children and consider whether sharing is necessary." },
  { id: "photo_background_checked", category: "Content Exposure", title: "Before posting, do you check photos for badges, documents, screens, or identifying background details?", kind: "control", priority: 2, recommendation: "Check photo backgrounds for documents, badges, screens, and identifying details before posting." },
  { id: "photo_metadata_reviewed", category: "Content Exposure", title: "Do you review photo metadata or location information before sharing?", kind: "control", priority: 2, recommendation: "Review photo metadata and use platform or device controls to remove location data when appropriate." },
  { id: "reposts_reviewed", category: "Content Exposure", title: "Do you review the audience and context before reposting content?", kind: "control", priority: 2, recommendation: "Check the audience and context before reposting content." },

  { id: "unknown_requests_accepted", category: "Connection Risk", title: "Do you often accept connection requests from people you do not recognize?", kind: "behavior", priority: 1, recommendation: "Verify unfamiliar requests through a trusted channel before accepting." },
  { id: "connections_reviewed", category: "Connection Risk", title: "Do you periodically review your followers or connections?", kind: "control", priority: 2, recommendation: "Review followers and connections periodically and remove accounts you no longer trust." },
  { id: "public_dms_open", category: "Connection Risk", title: "Have you restricted direct messages and message requests to people you know?", kind: "control", priority: 2, recommendation: "Restrict message requests to people you know where the platform supports it." },
  { id: "unknown_connections_verified", category: "Connection Risk", title: "Do you verify an unfamiliar account before sharing information or accepting a request?", kind: "control", priority: 1, recommendation: "Verify unfamiliar accounts independently before responding or sharing details." },
  { id: "follower_changes_reviewed", category: "Connection Risk", title: "Do you check for unexpected changes to followers or connections?", kind: "control", priority: 3, recommendation: "Review account connection changes and remove access you do not recognize." },

  { id: "tag_review_enabled", category: "Tagging Risk", title: "Do you approve tags before they appear on your profile?", kind: "control", priority: 1, recommendation: "Enable tag review before tagged posts appear on your profile." },
  { id: "mentions_restricted", category: "Tagging Risk", title: "Are mentions limited to people you trust?", kind: "control", priority: 2, recommendation: "Restrict who can mention or tag you." },
  { id: "tagged_posts_reviewed", category: "Tagging Risk", title: "Do you review posts you are tagged in?", kind: "control", priority: 2, recommendation: "Review tagged posts regularly and remove tags that expose more than intended." },
  { id: "auto_profile_tags_disabled", category: "Tagging Risk", title: "Have you turned off automatic display of tagged posts on your profile?", kind: "control", priority: 1, recommendation: "Turn off automatic profile display for tagged posts where possible." },
  { id: "tagging_notifications_enabled", category: "Tagging Risk", title: "Do you receive alerts when someone tags or mentions you?", kind: "control", priority: 3, recommendation: "Enable tag and mention alerts so you can review new exposure promptly." },

  { id: "mfa_enabled", category: "Account Security", title: "Is multi-factor authentication enabled on your social accounts?", kind: "control", priority: 1, recommendation: "Enable multi-factor authentication using the strongest supported method." },
  { id: "password_unique", category: "Account Security", title: "Do you use a unique password for each social account?", kind: "control", priority: 1, recommendation: "Use a unique password for every account; a password manager can help." },
  { id: "password_manager_used", category: "Account Security", title: "Do you use a password manager to create and manage unique passwords?", kind: "control", priority: 2, recommendation: "Consider a reputable password manager to support unique, strong passwords." },
  { id: "login_alerts_enabled", category: "Account Security", title: "Are login or unfamiliar-device alerts enabled?", kind: "control", priority: 2, recommendation: "Enable login alerts and review unfamiliar-device notifications promptly." },
  { id: "sessions_reviewed", category: "Account Security", title: "Do you review active sessions and recovery options periodically?", kind: "control", priority: 2, recommendation: "Review active sessions and recovery options; end sessions you do not recognize." },

  { id: "third_party_apps_reviewed", category: "Third-Party Apps", title: "Do you review apps connected to your social accounts?", kind: "control", priority: 1, recommendation: "Review connected applications and revoke access you no longer need." },
  { id: "unused_apps_removed", category: "Third-Party Apps", title: "Do you remove integrations you no longer use?", kind: "control", priority: 2, recommendation: "Remove unused or unfamiliar integrations." },
  { id: "app_permissions_reviewed", category: "Third-Party Apps", title: "Do you check what information connected apps can access?", kind: "control", priority: 2, recommendation: "Check each connected app's permissions and keep only what is necessary." },
  { id: "old_integrations_checked", category: "Third-Party Apps", title: "Have you reviewed older sign-in integrations recently?", kind: "control", priority: 3, recommendation: "Review older social sign-in connections and remove ones you no longer use." },
  { id: "least_privilege_used", category: "Third-Party Apps", title: "Do you limit connected apps to permissions required for their purpose?", kind: "control", priority: 2, recommendation: "Apply least privilege: grant only the access an app genuinely needs." },

  { id: "unexpected_links_checked", category: "Social Engineering", title: "Do you verify unexpected links before opening them?", kind: "control", priority: 1, recommendation: "Verify unexpected links through the official app or website instead of the message." },
  { id: "verification_codes_shared", category: "Social Engineering", title: "Have you ever shared a verification code in response to a message or call?", kind: "behavior", priority: 1, recommendation: "Never share verification codes; legitimate support staff should not ask for them." },
  { id: "suspicious_dms_reported", category: "Social Engineering", title: "Do you ignore, block, or report suspicious messages?", kind: "control", priority: 2, recommendation: "Use platform reporting and blocking tools for suspicious messages." },
  { id: "impersonation_verified", category: "Social Engineering", title: "Do you verify identity requests through a separate trusted channel?", kind: "control", priority: 1, recommendation: "Verify urgent or unusual requests through a separate, trusted channel." },
  { id: "personal_details_in_dms", category: "Social Engineering", title: "Do you share personal details with accounts you have not independently verified?", kind: "behavior", priority: 1, recommendation: "Do not share personal details with unverified accounts, even if the message seems familiar." },

  { id: "old_posts_reviewed", category: "Digital Footprint", title: "Do you periodically review old public posts and comments?", kind: "control", priority: 1, recommendation: "Review old public posts and comments; change visibility or remove anything no longer appropriate." },
  { id: "unused_accounts_reviewed", category: "Digital Footprint", title: "Do you review or close accounts you no longer use?", kind: "control", priority: 2, recommendation: "Close unused accounts or remove unnecessary personal details from them." },
  { id: "public_comments_reviewed", category: "Digital Footprint", title: "Do you check whether older comments are still visible publicly?", kind: "control", priority: 2, recommendation: "Review older public comments and their current audience settings." },
  { id: "privacy_settings_reviewed", category: "Digital Footprint", title: "Do you review privacy settings after platform changes?", kind: "control", priority: 1, recommendation: "Review privacy settings after major app updates and on a regular schedule." },
  { id: "linked_profiles_reviewed", category: "Digital Footprint", title: "Do you review which other profiles or sites are linked from your social bios?", kind: "control", priority: 2, recommendation: "Review linked profiles and pages for information you did not intend to make broadly discoverable." },
];

export const CATEGORY_WEIGHTS: Record<RiskCategory, number> = {
  "Profile Exposure": 10,
  "Personal Information": 15,
  "Location Exposure": 15,
  "Content Exposure": 10,
  "Connection Risk": 10,
  "Tagging Risk": 5,
  "Account Security": 15,
  "Third-Party Apps": 5,
  "Social Engineering": 10,
  "Digital Footprint": 5,
};

export const RESPONSE_OPTIONS = {
  visibility: ["PUBLIC", "FRIENDS", "PRIVATE", "NOT_SURE"],
  control: ["YES", "NO", "SOMETIMES", "NOT_SURE"],
  behavior: ["OFTEN", "SOMETIMES", "RARELY", "NEVER", "NOT_SURE"],
} as const;

export type AssessmentAnswerMap = Record<string, string>;
export type CategoryResult = { category: RiskCategory; score: number };

export type AssessmentResult = {
  overallScore: number;
  riskLevel: RiskLevel;
  categoryScores: CategoryResult[];
  findings: Array<{
    id: string;
    category: RiskCategory;
    title: string;
    detail: string;
    severity: RiskLevel;
  }>;
  recommendations: Array<{
    id: string;
    category: RiskCategory;
    title: string;
    action: string;
    priority: "IMMEDIATE" | "IMPORTANT" | "GOOD PRACTICE";
  }>;
  securityControlsEnabled: number;
};

const RISK_VALUE: Record<AnswerKind, Record<string, number>> = {
  visibility: { PUBLIC: 1, FRIENDS: 0.55, PRIVATE: 0, NOT_SURE: 0.65 },
  control: { YES: 0, NO: 1, SOMETIMES: 0.55, NOT_SURE: 0.65 },
  behavior: { OFTEN: 1, SOMETIMES: 0.55, RARELY: 0.25, NEVER: 0, NOT_SURE: 0.65 },
};

const SAFE_ANSWER: Record<AnswerKind, string> = {
  visibility: "PRIVATE",
  control: "YES",
  behavior: "NEVER",
};

export function validateAnswers(answers: AssessmentAnswerMap): string | null {
  const expected = new Map(QUESTIONS.map((question) => [question.id, question]));
  if (Object.keys(answers).length !== QUESTIONS.length) {
    return `Answer all ${QUESTIONS.length} questions before continuing.`;
  }
  for (const [id, answer] of Object.entries(answers)) {
    const question = expected.get(id);
    if (!question) return "The questionnaire contains an unknown answer field.";
    if (!(RESPONSE_OPTIONS[question.kind] as readonly string[]).includes(answer)) {
      return `Invalid response for question ${id}.`;
    }
  }
  return null;
}

export function riskLevelFor(score: number): RiskLevel {
  if (score <= 20) return "LOW";
  if (score <= 40) return "MODERATE";
  if (score <= 70) return "HIGH";
  return "CRITICAL";
}

export function extractPrivacyFeatures(answers: AssessmentAnswerMap) {
  return Object.fromEntries(
    QUESTIONS.map((question) => [
      question.id,
      {
        category: question.category,
        riskContribution: RISK_VALUE[question.kind][answers[question.id]],
        riskWeight: question.priority,
      },
    ]),
  );
}

export function calculatePrivacyRisk(
  answers: AssessmentAnswerMap,
  weights: Record<RiskCategory, number> = CATEGORY_WEIGHTS,
): AssessmentResult {
  const categoryScores = CATEGORIES.map((category) => {
    const members = QUESTIONS.filter((question) => question.category === category);
    const weightedRisk = members.reduce(
      (sum, question) => sum + RISK_VALUE[question.kind][answers[question.id]] * question.priority,
      0,
    );
    const maximum = members.reduce((sum, question) => sum + question.priority, 0);
    return { category, score: Math.round((weightedRisk / maximum) * 100) };
  });

  const totalWeight = CATEGORIES.reduce((sum, category) => sum + weights[category], 0);
  const overallScore = Math.round(
    categoryScores.reduce(
      (sum, categoryResult) => sum + categoryResult.score * weights[categoryResult.category],
      0,
    ) / totalWeight,
  );

  const findings = QUESTIONS.flatMap((question) => {
    const contribution = RISK_VALUE[question.kind][answers[question.id]];
    if (contribution < 0.5) return [];
    return [{
      id: question.id,
      category: question.category,
      title: question.title,
      detail: `This response indicates a potential ${question.category.toLowerCase()} exposure.`,
      severity: riskLevelFor(Math.round(contribution * 100)),
    }];
  });

  const recommendations = findings.map((finding) => {
    const question = QUESTIONS.find((item) => item.id === finding.id)!;
    const answer = answers[question.id];
    const contribution = RISK_VALUE[question.kind][answer];
    const priority: "IMMEDIATE" | "IMPORTANT" | "GOOD PRACTICE" =
      question.priority === 1 && contribution >= 0.7
        ? "IMMEDIATE"
        : question.priority <= 2 && contribution >= 0.5
          ? "IMPORTANT"
          : "GOOD PRACTICE";
    return {
      id: question.id,
      category: question.category,
      title: question.title,
      action: question.recommendation,
      priority,
    };
  });

  const securityQuestionIds = [
    "mfa_enabled",
    "password_unique",
    "password_manager_used",
    "login_alerts_enabled",
    "sessions_reviewed",
  ];

  return {
    overallScore,
    riskLevel: riskLevelFor(overallScore),
    categoryScores,
    findings,
    recommendations,
    securityControlsEnabled: securityQuestionIds.filter((id) => answers[id] === "YES").length,
  };
}

export function simulateImprovements(
  answers: AssessmentAnswerMap,
  improvementIds: string[],
): { current: AssessmentResult; simulated: AssessmentResult; riskReduction: number } {
  const updated = { ...answers };
  const allowed = new Set(QUESTIONS.map((question) => question.id));
  for (const id of improvementIds) {
    if (!allowed.has(id)) throw new Error("The simulation includes an unknown improvement.");
    const question = QUESTIONS.find((item) => item.id === id)!;
    updated[id] = SAFE_ANSWER[question.kind];
  }
  const current = calculatePrivacyRisk(answers);
  const simulated = calculatePrivacyRisk(updated);
  return {
    current,
    simulated,
    riskReduction: current.overallScore - simulated.overallScore,
  };
}

export function syntheticDashboardStats() {
  const sampleCount = 1_000;
  const randomFor = (seed: number) => {
    let value = seed >>> 0;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 0x1_0000_0000;
    };
  };
  const sampleAnswers = (seed: number): AssessmentAnswerMap => {
    const random = randomFor(seed);
    const choose = (values: readonly string[]) => values[Math.floor(random() * values.length)];
    return Object.fromEntries(
      QUESTIONS.map((question) => {
        let values: readonly string[];
        if (question.kind === "visibility") {
          values = ["PUBLIC", "PUBLIC", "FRIENDS", "FRIENDS", "PRIVATE", "PRIVATE", "NOT_SURE"];
        } else if (question.kind === "control") {
          values = ["YES", "YES", "YES", "YES", "NO", "NO", "SOMETIMES", "NOT_SURE"];
        } else {
          values = ["OFTEN", "SOMETIMES", "SOMETIMES", "RARELY", "RARELY", "NEVER", "NOT_SURE"];
        }
        return [question.id, choose(values)];
      }),
    );
  };

  const sums = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<RiskCategory, number>;
  const distribution: Record<RiskLevel, number> = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
  const weaknesses = new Map<string, number>();
  let overallSum = 0;
  let enabledSum = 0;
  let highRiskCategories = 0;

  for (let index = 0; index < sampleCount; index += 1) {
    const result = calculatePrivacyRisk(sampleAnswers(index + 7927));
    overallSum += result.overallScore;
    enabledSum += result.securityControlsEnabled;
    distribution[result.riskLevel] += 1;
    for (const item of result.categoryScores) {
      sums[item.category] += item.score;
      if (item.score >= 71) highRiskCategories += 1;
    }
    for (const finding of result.findings) {
      weaknesses.set(finding.id, (weaknesses.get(finding.id) ?? 0) + 1);
    }
  }

  return {
    syntheticRecords: sampleCount,
    averageScore: Math.round((overallSum / sampleCount) * 10) / 10,
    highRiskCategories: Math.round(highRiskCategories / sampleCount),
    securityControlsEnabled: Math.round((enabledSum / sampleCount) * 10) / 10,
    categoryScores: CATEGORIES.map((category) => ({
      category,
      score: Math.round(sums[category] / sampleCount),
    })),
    riskDistribution: (Object.entries(distribution) as Array<[RiskLevel, number]>).map(
      ([level, count]) => ({ level, count, percent: Math.round((count / sampleCount) * 1000) / 10 }),
    ),
    topWeaknesses: [...weaknesses.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        label: QUESTIONS.find((question) => question.id === id)?.title ?? id,
        count,
      })),
  };
}

export const PRIVACY_CHECKLIST = [
  ["Review profile visibility", "Profile Exposure"],
  ["Hide unnecessary contact information", "Personal Information"],
  ["Review birth-date visibility", "Personal Information"],
  ["Review location sharing and geotags", "Location Exposure"],
  ["Avoid unnecessary real-time location posts", "Location Exposure"],
  ["Review tagging and mention permissions", "Tagging Risk"],
  ["Review followers and connections", "Connection Risk"],
  ["Verify unfamiliar connection requests", "Connection Risk"],
  ["Enable multi-factor authentication", "Account Security"],
  ["Enable login alerts where available", "Account Security"],
  ["Review active sessions and recovery options", "Account Security"],
  ["Review connected apps and remove unused integrations", "Third-Party Apps"],
  ["Review old public posts and comments", "Digital Footprint"],
  ["Check photo backgrounds and metadata", "Content Exposure"],
  ["Verify unexpected links through a trusted channel", "Social Engineering"],
  ["Never share verification codes", "Social Engineering"],
  ["Review privacy settings periodically", "Digital Footprint"],
  ["Revisit settings after major platform changes", "Digital Footprint"],
].map(([label, category], index) => ({
  id: `privacy-check-${index + 1}`,
  label,
  category: category as RiskCategory,
}));
