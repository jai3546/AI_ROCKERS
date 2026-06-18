import { chunkContent } from "@/services/content-chunker"
import type {
  Course,
  CourseGenerationOptions,
  CourseGenerationProgress,
  IngestedContent,
  Syllabus,
} from "@/types/course"
import { CourseGenerationOptionsSchema } from "@/types/course"
import { extractConceptsFromChunks } from "./extract"
import { synthesizeCourse } from "./synthesize"

export type ProgressCallback = (progress: CourseGenerationProgress) => void

export async function generateCourseFromContent(
  content: IngestedContent,
  options: Partial<CourseGenerationOptions> & { syllabus: Syllabus },
  onProgress?: ProgressCallback
): Promise<Course> {
  const resolvedOptions = CourseGenerationOptionsSchema.parse({
    subject: options.subject ?? "General",
    syllabus: options.syllabus,
    maxModules: options.maxModules ?? 6,
    targetAudience: options.targetAudience ?? "K-12",
  })

  onProgress?.({
    stage: "chunking",
    message: "Analyzing content structure...",
    progress: 5,
  })

  const chunks = chunkContent(content.text)
  if (chunks.length === 0) {
    throw new Error("No processable content found.")
  }

  onProgress?.({
    stage: "extracting",
    message: `Extracting concepts from ${chunks.length} section${chunks.length > 1 ? "s" : ""}...`,
    progress: 15,
  })

  const extractions = await extractConceptsFromChunks(
    chunks,
    resolvedOptions,
    (current, total) => {
      const pct = 15 + Math.round((current / total) * 45)
      onProgress?.({
        stage: "extracting",
        message: `Analyzing section ${current} of ${total}...`,
        progress: pct,
      })
    }
  )

  onProgress?.({
    stage: "synthesizing",
    message: "Building course modules and lessons...",
    progress: 65,
  })

  const course = await synthesizeCourse(
    extractions,
    resolvedOptions,
    content.sourceType,
    options.syllabus,
    content.sourceName
  )

  const sourceChunks = Object.fromEntries(chunks.map((chunk) => [chunk.id, chunk.text]))

  onProgress?.({
    stage: "validating",
    message: "Validating learning path and ordering...",
    progress: 85,
  })

  onProgress?.({
    stage: "complete",
    message: "Course generated successfully!",
    progress: 100,
  })

  return {
    ...course,
    sourceText: content.text.slice(0, 50000),
    sourceChunks,
  }
}

export { validateAndOrderCourse, buildLearningPath, validatePrerequisiteOrder } from "./validate"
export { chunkContent } from "@/services/content-chunker"
