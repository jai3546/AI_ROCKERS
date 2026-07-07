import { z } from "zod"

export const SyllabusSchema = z.enum(["AP", "Telangana", "CBSE", "General"])
export type Syllabus = z.infer<typeof SyllabusSchema>

export const SourceTypeSchema = z.enum(["paste", "file", "url", "pdf"])
export type SourceType = z.infer<typeof SourceTypeSchema>

export const ComplexitySchema = z.enum(["beginner", "intermediate", "advanced"])
export type Complexity = z.infer<typeof ComplexitySchema>

export const CourseLessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  summary: z.string(),
  keyConcepts: z.array(z.string()),
  prerequisites: z.array(z.string()).optional(),
  sourceChunkIds: z.array(z.string()).optional(),
  isEssential: z.boolean().optional(),
})

export type CourseLesson = z.infer<typeof CourseLessonSchema>

export const CourseModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  complexity: ComplexitySchema,
  lessons: z.array(CourseLessonSchema),
  prerequisites: z.array(z.string()).optional(),
})

export type CourseModule = z.infer<typeof CourseModuleSchema>

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  subject: z.string(),
  syllabus: SyllabusSchema,
  sourceType: SourceTypeSchema,
  modules: z.array(CourseModuleSchema),
  learningPath: z.array(z.string()),
  essentialTopics: z.array(z.string()),
  createdAt: z.string(),
  /** Original ingested text, used for quiz/flashcard generation from uploaded material */
  sourceText: z.string().optional(),
  /** Chunk id → text map from course generation, for lesson-scoped quizzes */
  sourceChunks: z.record(z.string()).optional(),
})

export type Course = z.infer<typeof CourseSchema>

export const ContentChunkSchema = z.object({
  id: z.string(),
  text: z.string(),
  index: z.number(),
})

export type ContentChunk = z.infer<typeof ContentChunkSchema>

export const ExtractedConceptSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyConcepts: z.array(z.string()),
  complexity: ComplexitySchema,
  prerequisites: z.array(z.string()),
  sourceChunkIds: z.array(z.string()),
  isEssential: z.boolean().optional(),
})

export type ExtractedConcept = z.infer<typeof ExtractedConceptSchema>

export const ChunkExtractionResultSchema = z.object({
  chunkId: z.string(),
  concepts: z.array(ExtractedConceptSchema),
  boundaries: z.array(z.string()).optional(),
})

export type ChunkExtractionResult = z.infer<typeof ChunkExtractionResultSchema>

export const CourseGenerationOptionsSchema = z.object({
  subject: z.string().default("General"),
  syllabus: SyllabusSchema.default("General"),
  maxModules: z.number().min(1).max(12).default(6),
  targetAudience: z.enum(["K-12", "college", "self-study"]).default("K-12"),
})

export type CourseGenerationOptions = z.infer<typeof CourseGenerationOptionsSchema>

export const IngestedContentSchema = z.object({
  text: z.string(),
  sourceType: SourceTypeSchema,
  sourceName: z.string().optional(),
})

export type IngestedContent = z.infer<typeof IngestedContentSchema>

export type CourseGenerationProgress = {
  stage: "chunking" | "extracting" | "synthesizing" | "validating" | "complete" | "error"
  message: string
  progress: number
}
