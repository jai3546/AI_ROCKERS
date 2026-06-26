import type { ContentChunk, CourseGenerationOptions } from "@/types/course"

export function buildExtractPrompt(chunk: ContentChunk, options: CourseGenerationOptions): string {
  return `You are an educational content analyst. Analyze ONLY the provided source text chunk.
Extract distinct learning concepts present in this chunk. Do NOT invent content not found in the text.

Return a JSON object with:
{
  "chunkId": "${chunk.id}",
  "concepts": [
    {
      "title": "Concept title (3-8 words)",
      "summary": "2-4 sentence summary grounded in the source text",
      "keyConcepts": ["term1", "term2"],
      "complexity": "beginner" | "intermediate" | "advanced",
      "prerequisites": ["titles of concepts that must be learned first, from this chunk only"],
      "sourceChunkIds": ["${chunk.id}"],
      "isEssential": true or false
    }
  ],
  "boundaries": ["natural section break labels detected in text"]
}

Rules:
- Target audience: ${options.targetAudience}
- Extract 2-6 concepts per chunk depending on density
- Mark foundational concepts as isEssential: true
- prerequisites must reference concept titles from this analysis only
- Respond ONLY with valid JSON

SOURCE CHUNK:
${chunk.text}`
}

export function buildSynthesizePrompt(
  extractions: string,
  options: CourseGenerationOptions,
  sourceTitle?: string
): string {
  return `You are an expert curriculum designer. Using the extracted concepts below, build a structured course.

Return a JSON object:
{
  "title": "Course title",
  "description": "1-2 sentence course overview",
  "modules": [
    {
      "id": "mod-1",
      "title": "Module title",
      "order": 1,
      "complexity": "beginner" | "intermediate" | "advanced",
      "prerequisites": ["mod-id of prerequisite modules"],
      "lessons": [
        {
          "id": "lesson-1",
          "title": "Lesson title",
          "order": 1,
          "summary": "Educational summary grounded in source material",
          "keyConcepts": ["concept1"],
          "prerequisites": ["lesson-id of prerequisite lessons"],
          "sourceChunkIds": ["chunk-0"],
          "isEssential": true
        }
      ]
    }
  ]
}

Rules:
- Subject context: ${options.subject}
- Maximum ${options.maxModules} modules
- Organize beginner → intermediate → advanced
- Each module: 2-6 lessons
- Merge duplicate/overlapping concepts
- Foundational lessons first within each module
- prerequisites must use lesson/module ids you define
- Do NOT invent facts beyond the extracted concepts
- Respond ONLY with valid JSON

${sourceTitle ? `Source material title hint: ${sourceTitle}\n` : ""}
EXTRACTED CONCEPTS:
${extractions}`
}
