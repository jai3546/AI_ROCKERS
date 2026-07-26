-- AlterTable
-- Adds explicit storage for the visual / auditory / kinesthetic learning-style
-- scores described in issue #106. Defaults match the `initialLearningStyleProfile`
-- exported from `services/learning-style-service.ts` (33/33/33) so freshly
-- created profiles reflect an "unknown" persona rather than 0 — preserving the
-- calculation bug fix from PR #114 (issue #103).
ALTER TABLE "LearningProfile" ADD COLUMN "visualScore" INTEGER NOT NULL DEFAULT 33;
ALTER TABLE "LearningProfile" ADD COLUMN "auditoryScore" INTEGER NOT NULL DEFAULT 33;
ALTER TABLE "LearningProfile" ADD COLUMN "kinestheticScore" INTEGER NOT NULL DEFAULT 33;
