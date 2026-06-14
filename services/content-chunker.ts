import type { ContentChunk } from "@/types/course"

const DEFAULT_CHUNK_SIZE = 3500
const DEFAULT_OVERLAP = 200

export function chunkContent(
  text: string,
  maxChunkSize: number = DEFAULT_CHUNK_SIZE,
  overlap: number = DEFAULT_OVERLAP
): ContentChunk[] {
  const normalized = text.replace(/\r\n/g, "\n").trim()
  if (!normalized) return []

  if (normalized.length <= maxChunkSize) {
    return [{ id: "chunk-0", text: normalized, index: 0 }]
  }

  const chunks: ContentChunk[] = []
  let start = 0
  let index = 0

  while (start < normalized.length) {
    let end = Math.min(start + maxChunkSize, normalized.length)

    if (end < normalized.length) {
      const paragraphBreak = normalized.lastIndexOf("\n\n", end)
      const sentenceBreak = normalized.lastIndexOf(". ", end)
      const breakPoint = Math.max(paragraphBreak, sentenceBreak)

      if (breakPoint > start + maxChunkSize * 0.5) {
        end = breakPoint + (sentenceBreak === breakPoint ? 2 : 2)
      }
    }

    const chunkText = normalized.slice(start, end).trim()
    if (chunkText) {
      chunks.push({
        id: `chunk-${index}`,
        text: chunkText,
        index,
      })
      index++
    }

    if (end >= normalized.length) break
    const nextStart = end - overlap
    start = nextStart > start ? nextStart : end
  }

  return chunks
}

export function estimateReadingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
