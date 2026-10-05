import { Router, type IRouter } from "express";
import { and, eq, gt, lt } from "drizzle-orm";
import {
  CreateAssessmentBody,
  CreateAssessmentResponse,
  DeleteAssessmentParams,
  GetAssessmentParams,
  GetAssessmentRecommendationsParams,
  GetAssessmentRecommendationsResponse,
  GetAssessmentResponse,
  GetDashboardStatsResponse,
  GetPrivacyChecklistResponse,
  SimulateImprovementBody,
  SimulateImprovementResponse,
} from "@workspace/api-zod";
import { assessmentsTable, db } from "@workspace/db";
import { assessmentRateLimit } from "../middlewares/rate-limit";
import {
  CATEGORIES,
  PRIVACY_CHECKLIST,
  QUESTIONS,
  calculatePrivacyRisk,
  riskLevelFor,
  simulateImprovements,
  syntheticDashboardStats,
  validateAnswers,
  type AssessmentAnswerMap,
  type RiskCategory,
  type RiskLevel,
} from "../lib/privacy-assessment";

const router: IRouter = Router();
const RETENTION_DAYS = 30;

function makeReport(
  id: string,
  createdAt: Date,
  summary: {
    overallScore: number;
    riskLevel: string;
    categoryScores: Array<{ category: string; score: number }>;
    findingTypes: string[];
    securityControlsEnabled: number;
  },
) {
  const scores = new Map(summary.categoryScores.map((item) => [item.category, item.score]));
  const questionMap = new Map(QUESTIONS.map((question) => [question.id, question]));
  const findings = summary.findingTypes.flatMap((findingId) => {
    const question = questionMap.get(findingId);
    if (!question) return [];
    const score = scores.get(question.category) ?? 0;
    return [{
      id: question.id,
      category: question.category,
      title: question.title,
      detail: `This response indicates a potential ${question.category.toLowerCase()} exposure.`,
      severity: riskLevelFor(score),
    }];
  });
  const recommendations = summary.findingTypes.flatMap((findingId) => {
    const question = questionMap.get(findingId);
    if (!question) return [];
    const score = scores.get(question.category) ?? 0;
    return [{
      id: question.id,
      category: question.category,
      title: question.title,
      action: question.recommendation,
      priority:
        question.priority === 1 && score >= 60
          ? "IMMEDIATE"
          : question.priority <= 2
            ? "IMPORTANT"
            : "GOOD PRACTICE",
    }];
  });
  return {
    assessmentId: id,
    assessmentDate: createdAt.toISOString(),
    overallScore: summary.overallScore,
    riskLevel: summary.riskLevel,
    categoryScores: summary.categoryScores,
    findings,
    recommendations,
    securityControlsEnabled: summary.securityControlsEnabled,
  };
}

function buildSimulatedResponse(answers: AssessmentAnswerMap, improvements: string[]) {
  const result = simulateImprovements(answers, improvements);
  return {
    currentScore: result.current.overallScore,
    currentLevel: result.current.riskLevel,
    simulatedScore: result.simulated.overallScore,
    simulatedLevel: result.simulated.riskLevel,
    riskReduction: result.riskReduction,
    categoryScores: result.simulated.categoryScores,
  };
}

router.post("/assessment", assessmentRateLimit, async (req, res): Promise<void> => {
  const parsed = CreateAssessmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide one valid response for each questionnaire item." });
    return;
  }
  const answers = parsed.data.answers as AssessmentAnswerMap;
  const validationError = validateAnswers(answers);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const result = calculatePrivacyRisk(answers);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await db.delete(assessmentsTable).where(lt(assessmentsTable.expiresAt, createdAt));
  const [saved] = await db.insert(assessmentsTable).values({
    overallScore: result.overallScore,
    riskLevel: result.riskLevel,
    categoryScores: result.categoryScores,
    findingTypes: result.findings.map((finding) => finding.id),
    securityControlsEnabled: result.securityControlsEnabled,
    expiresAt,
  }).returning();
  if (!saved) {
    res.status(500).json({ error: "The assessment could not be saved." });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.status(201).json(CreateAssessmentResponse.parse(makeReport(saved.id, saved.createdAt, saved)));
});

router.get("/assessment/:id", async (req, res): Promise<void> => {
  const params = GetAssessmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid assessment ID." });
    return;
  }
  const now = new Date();
  await db.delete(assessmentsTable).where(lt(assessmentsTable.expiresAt, now));
  const [saved] = await db.select().from(assessmentsTable).where(
    and(eq(assessmentsTable.id, params.data.id), gt(assessmentsTable.expiresAt, now)),
  ).limit(1);
  if (!saved) {
    res.status(404).json({ error: "Assessment not found or expired." });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.json(GetAssessmentResponse.parse(makeReport(saved.id, saved.createdAt, saved)));
});

router.get("/assessment/:id/recommendations", async (req, res): Promise<void> => {
  const params = GetAssessmentRecommendationsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid assessment ID." });
    return;
  }
  const now = new Date();
  const [saved] = await db.select().from(assessmentsTable).where(
    and(eq(assessmentsTable.id, params.data.id), gt(assessmentsTable.expiresAt, now)),
  ).limit(1);
  if (!saved) {
    res.status(404).json({ error: "Assessment not found or expired." });
    return;
  }
  const report = makeReport(saved.id, saved.createdAt, saved);
  res.setHeader("Cache-Control", "no-store");
  res.json(GetAssessmentRecommendationsResponse.parse(report.recommendations));
});

router.delete("/assessment/:id", async (req, res): Promise<void> => {
  const params = DeleteAssessmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid assessment ID." });
    return;
  }
  const [deleted] = await db.delete(assessmentsTable).where(eq(assessmentsTable.id, params.data.id)).returning({
    id: assessmentsTable.id,
  });
  if (!deleted) {
    res.status(404).json({ error: "Assessment not found." });
    return;
  }
  res.sendStatus(204);
});

router.post("/assessment/simulate-improvement", assessmentRateLimit, (req, res): void => {
  const parsed = SimulateImprovementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide valid assessment responses and improvement selections." });
    return;
  }
  const answers = parsed.data.answers as AssessmentAnswerMap;
  const validationError = validateAnswers(answers);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  try {
    const result = buildSimulatedResponse(answers, parsed.data.improvements);
    res.setHeader("Cache-Control", "no-store");
    res.json(SimulateImprovementResponse.parse(result));
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "The simulation could not be calculated.",
    });
  }
});

router.get("/dashboard/stats", (_req, res): void => {
  res.setHeader("Cache-Control", "no-store");
  res.json(GetDashboardStatsResponse.parse(syntheticDashboardStats()));
});

router.get("/privacy-checklist", (_req, res): void => {
  res.json(GetPrivacyChecklistResponse.parse(PRIVACY_CHECKLIST));
});

export default router;
