import { describe, it, expect } from "vitest"
import { ingestPastedText } from "@/services/content-ingestion"

describe("ingestPastedText", () => {
  it("accepts valid pasted text", async () => {
    const text = "Photosynthesis is the process by which plants convert light energy into chemical energy. ".repeat(3)
    const result = await ingestPastedText(text)
    expect(result.sourceType).toBe("paste")
    expect(result.text).toBe(text.trim())
  })

  it("rejects empty text", async () => {
    await expect(ingestPastedText("")).rejects.toThrow("Please paste some content")
  })

  it("rejects text that is too short", async () => {
    await expect(ingestPastedText("too short")).rejects.toThrow("too short")
  })
})
