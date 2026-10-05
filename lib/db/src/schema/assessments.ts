import { createInsertSchema } from "drizzle-zod";
import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export type StoredCategoryScore = {
  category: string;
  score: number;
};

export const assessmentsTable = pgTable("privacy_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  overallScore: integer("overall_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  categoryScores: jsonb("category_scores").$type<StoredCategoryScore[]>().notNull(),
  findingTypes: text("finding_types").array().notNull(),
  securityControlsEnabled: integer("security_controls_enabled").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const insertAssessmentSchema = createInsertSchema(assessmentsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type StoredAssessment = typeof assessmentsTable.$inferSelect;
