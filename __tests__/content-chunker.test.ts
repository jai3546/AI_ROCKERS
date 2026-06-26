import { describe, it, expect } from "vitest"
import { chunkContent, estimateReadingMinutes } from "@/services/content-chunker"

describe("chunkContent", () => {
  it("returns empty array for empty text", () => {
    expect(chunkContent("")).toEqual([])
    expect(chunkContent("   ")).toEqual([])
  })

  it("returns single chunk for short content", () => {
    const text = "This is a short piece of content for testing."
    const chunks = chunkContent(text)
    expect(chunks).toHaveLength(1)
    expect(chunks[0].id).toBe("chunk-0")
    expect(chunks[0].text).toBe(text)
    expect(chunks[0].index).toBe(0)
  })

  it("splits large content into multiple chunks", () => {
    const paragraph = "Lorem ipsum dolor sit amet. ".repeat(50)
    const text = Array(10).fill(paragraph).join("\n\n")
    const chunks = chunkContent(text, 2000, 100)
    expect(chunks.length).toBeGreaterThan(1)
    chunks.forEach((chunk, i) => {
      expect(chunk.id).toBe(`chunk-${i}`)
      expect(chunk.index).toBe(i)
      expect(chunk.text.length).toBeGreaterThan(0)
    })
  })

  it("preserves all content across chunks for large input", () => {
    const text = "Word ".repeat(5000).trim()
    const chunks = chunkContent(text, 3000, 200)
    const combined = chunks.map((c) => c.text).join(" ")
    const originalWords = text.split(/\s+/).length
    const combinedWords = combined.split(/\s+/).filter(Boolean).length
    expect(combinedWords).toBeGreaterThanOrEqual(originalWords * 0.9)
  })
})

describe("estimateReadingMinutes", () => {
  it("returns at least 1 minute", () => {
    expect(estimateReadingMinutes("hello")).toBe(1)
  })

  it("estimates based on word count", () => {
    const words = Array(400).fill("word").join(" ")
    expect(estimateReadingMinutes(words)).toBe(2)
  })
})
