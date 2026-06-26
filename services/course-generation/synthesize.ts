import { getApiKey, safeJsonParse } from "@/services/gemini-api"
import type {
  ChunkExtractionResult,
  Course,
  CourseGenerationOptions,
  CourseModule,
  SourceType,
  Syllabus,
} from "@/types/course"
import { buildSynthesizePrompt } from "./prompts"
import { validateAndOrderCourse } from "./validate"

async function callGeminiJson(prompt: string): Promise<unknown | null> {
  const requestBody = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  }

  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) return null

  try {
    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    return safeJsonParse(rawText)
  } catch {
    return null
  }
}

function generateId(): string {
  return `course-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function heuristicSynthesize(
  extractions: ChunkExtractionResult[],
  options: CourseGenerationOptions,
  sourceType: SourceType,
  syllabus: Syllabus,
  sourceName?: string
): Course {
  const allConcepts = extractions.flatMap((e) => e.concepts)
  const complexityOrder = { beginner: 0, intermediate: 1, advanced: 2 }

  const sortedConcepts = [...allConcepts].sort(
    (a, b) => complexityOrder[a.complexity] - complexityOrder[b.complexity]
  )

  const lessonsPerModule = 3
  const moduleCount = Math.min(
    options.maxModules,
    Math.max(1, Math.ceil(sortedConcepts.length / lessonsPerModule))
  )

  const modules: CourseModule[] = []
  let conceptIdx = 0

  for (let m = 0; m < moduleCount; m++) {
    const moduleLessons = []
    const complexity =
      m === 0 ? "beginner" as const : m < moduleCount - 1 ? "intermediate" as const : "advanced" as const

    for (let l = 0; l < lessonsPerModule && conceptIdx < sortedConcepts.length; l++) {
      const concept = sortedConcepts[conceptIdx]
      const lessonId = `lesson-${m + 1}-${l + 1}`
      moduleLessons.push({
        id: lessonId,
        title: concept.title,
        order: l + 1,
        summary: concept.summary,
        keyConcepts: concept.keyConcepts,
        prerequisites: l > 0 ? [`lesson-${m + 1}-${l}`] : [],
        sourceChunkIds: concept.sourceChunkIds,
        isEssential: concept.isEssential ?? m === 0,
      })
      conceptIdx++
    }

    if (moduleLessons.length > 0) {
      modules.push({
        id: `mod-${m + 1}`,
        title: `Module ${m + 1}: ${moduleLessons[0].title}`,
        order: m + 1,
        complexity,
        lessons: moduleLessons,
        prerequisites: m > 0 ? [`mod-${m}`] : [],
      })
    }
  }

  const title = sourceName
    ? `Course: ${sourceName.replace(/\.[^.]+$/, "").slice(0, 60)}`
    : `Structured Course: ${options.subject}`

  const course: Course = {
    id: generateId(),
    title,
    description: `A structured learning path covering ${sortedConcepts.length} topics from your uploaded content, organized from foundational to advanced concepts.`,
    subject: options.subject,
    syllabus,
    sourceType,
    modules,
    learningPath: [],
    essentialTopics: [],
    createdAt: new Date().toISOString(),
  }

  return validateAndOrderCourse(course)
}

function normalizeSynthesizedCourse(
  parsed: Record<string, unknown>,
  options: CourseGenerationOptions,
  sourceType: SourceType,
  syllabus: Syllabus
): Course | null {
  if (!parsed.title || !Array.isArray(parsed.modules) || parsed.modules.length === 0) {
    return null
  }

  const modules: CourseModule[] = (parsed.modules as Record<string, unknown>[]).map((mod, mi) => ({
    id: String(mod.id || `mod-${mi + 1}`),
    title: String(mod.title || `Module ${mi + 1}`),
    order: Number(mod.order) || mi + 1,
    complexity: (["beginner", "intermediate", "advanced"].includes(String(mod.complexity))
      ? mod.complexity
      : "beginner") as CourseModule["complexity"],
    prerequisites: Array.isArray(mod.prerequisites) ? mod.prerequisites.map(String) : [],
    lessons: Array.isArray(mod.lessons)
      ? (mod.lessons as Record<string, unknown>[]).map((lesson, li) => ({
          id: String(lesson.id || `lesson-${mi + 1}-${li + 1}`),
          title: String(lesson.title || `Lesson ${li + 1}`),
          order: Number(lesson.order) || li + 1,
          summary: String(lesson.summary || ""),
          keyConcepts: Array.isArray(lesson.keyConcepts) ? lesson.keyConcepts.map(String) : [],
          prerequisites: Array.isArray(lesson.prerequisites) ? lesson.prerequisites.map(String) : [],
          sourceChunkIds: Array.isArray(lesson.sourceChunkIds) ? lesson.sourceChunkIds.map(String) : [],
          isEssential: Boolean(lesson.isEssential),
        }))
      : [],
  })).filter((m) => m.lessons.length > 0)

  if (modules.length === 0) return null

  const course: Course = {
    id: generateId(),
    title: String(parsed.title),
    description: String(parsed.description || "AI-generated structured course from your content."),
    subject: options.subject,
    syllabus,
    sourceType,
    modules,
    learningPath: [],
    essentialTopics: [],
    createdAt: new Date().toISOString(),
  }

  return validateAndOrderCourse(course)
}

export async function synthesizeCourse(
  extractions: ChunkExtractionResult[],
  options: CourseGenerationOptions,
  sourceType: SourceType,
  syllabus: Syllabus,
  sourceName?: string
): Promise<Course> {
  const extractionSummary = JSON.stringify(
    extractions.map((e) => ({
      chunkId: e.chunkId,
      concepts: e.concepts,
      boundaries: e.boundaries,
    })),
    null,
    2
  )

  if (getApiKey()) {
    try {
      const prompt = buildSynthesizePrompt(extractionSummary, options, sourceName)
      const parsed = await callGeminiJson(prompt)
      if (parsed && typeof parsed === "object") {
        const course = normalizeSynthesizedCourse(
          parsed as Record<string, unknown>,
          options,
          sourceType,
          syllabus
        )
        if (course) return course
      }
    } catch (e) {
      console.warn("AI synthesis failed, using heuristic:", e)
    }
  }

  return heuristicSynthesize(extractions, options, sourceType, syllabus, sourceName)
}
