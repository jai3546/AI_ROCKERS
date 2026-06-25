import { getApiKey, safeJsonParse } from "@/services/gemini-api"
import type { ChunkExtractionResult, ContentChunk, CourseGenerationOptions, ExtractedConcept } from "@/types/course"
import { ChunkExtractionResultSchema } from "@/types/course"
import { buildExtractPrompt } from "./prompts"

async function callGeminiJson(prompt: string): Promise<unknown | null> {
  const requestBody = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  }

  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) return null

  const data = await response.json()
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
  return safeJsonParse(rawText)
}

function heuristicExtractFromChunk(chunk: ContentChunk): ChunkExtractionResult {
  const sections = chunk.text
    .split(/\n{2,}|(?=^#{1,3}\s)/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 30)

  const concepts: ExtractedConcept[] = sections.slice(0, 5).map((section, i) => {
    const lines = section.split("\n").filter(Boolean)
    const titleLine = lines[0].replace(/^#+\s*/, "").slice(0, 80)
    const title = titleLine || `Topic ${i + 1}`
    const summary = lines.slice(1).join(" ").trim() || section.slice(0, 300)
    const words = summary.split(/\s+/).slice(0, 8).filter((w) => w.length > 4)

    return {
      title,
      summary: summary.slice(0, 500),
      keyConcepts: words.slice(0, 4),
      complexity: i === 0 ? "beginner" as const : i < 3 ? "intermediate" as const : "advanced" as const,
      prerequisites: i > 0 ? [sections[0]?.split("\n")[0].replace(/^#+\s*/, "").slice(0, 80) || "Topic 1"] : [],
      sourceChunkIds: [chunk.id],
      isEssential: i < 2,
    }
  })

  if (concepts.length === 0) {
    concepts.push({
      title: `Section from chunk ${chunk.index + 1}`,
      summary: chunk.text.slice(0, 400),
      keyConcepts: [],
      complexity: "beginner",
      prerequisites: [],
      sourceChunkIds: [chunk.id],
      isEssential: true,
    })
  }

  return { chunkId: chunk.id, concepts, boundaries: sections.map((s) => s.split("\n")[0].slice(0, 60)) }
}

export async function extractConceptsFromChunk(
  chunk: ContentChunk,
  options: CourseGenerationOptions
): Promise<ChunkExtractionResult> {
  if (getApiKey()) {
    try {
      const prompt = buildExtractPrompt(chunk, options)
      const parsed = await callGeminiJson(prompt)
      const validated = ChunkExtractionResultSchema.safeParse(parsed)
      if (validated.success && validated.data.concepts.length > 0) {
        return validated.data
      }
    } catch (e) {
      console.warn("AI extraction failed for chunk, using heuristic:", e)
    }
  }

  return heuristicExtractFromChunk(chunk)
}

export async function extractConceptsFromChunks(
  chunks: ContentChunk[],
  options: CourseGenerationOptions,
  onProgress?: (current: number, total: number) => void
): Promise<ChunkExtractionResult[]> {
  let completed = 0
  const promises = chunks.map(async (chunk) => {
    const result = await extractConceptsFromChunk(chunk, options)
    completed++
    onProgress?.(completed, chunks.length)
    return result
  })
  return Promise.all(promises)
}
}
