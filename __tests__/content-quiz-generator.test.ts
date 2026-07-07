import { describe, it, expect } from "vitest"
import {
  generateFlashcardsFromSourceContent,
  generateQuizFromSourceContent,
} from "@/services/content-quiz-generator"

const SAMPLE = `
Introduction to Photosynthesis

Photosynthesis is the process plants use to convert sunlight into chemical energy.
Chlorophyll in leaves absorbs light energy.

The Calvin Cycle

The Calvin cycle uses ATP and NADPH to fix carbon dioxide into glucose.
This happens in the stroma of chloroplasts.
`.trim()

describe("content-quiz-generator", () => {
  it("generates quiz questions from uploaded source text without AI", () => {
    const quiz = generateQuizFromSourceContent("Science", "Photosynthesis", SAMPLE, "General", 3)
    expect(quiz.length).toBeGreaterThan(0)
    expect(quiz[0].question).toContain("uploaded material")
    expect(quiz[0].options.some((option) => option.isCorrect)).toBe(true)
  })

  it("generates flashcards from uploaded source text without AI", () => {
    const cards = generateFlashcardsFromSourceContent("Science", "Photosynthesis", SAMPLE, "General", 2)
    expect(cards.length).toBe(2)
    expect(cards[0].back.length).toBeGreaterThan(20)
  })
})
