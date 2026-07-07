import { describe, it, expect } from "vitest"
import { chunkContent } from "@/services/content-chunker"
import type { ChunkExtractionResult } from "@/types/course"

const SAMPLE_CONTENT = `
# Introduction to Programming

Programming is the process of creating instructions for computers to execute.
Computers only understand binary code, but humans write in programming languages.

## Variables

Variables are named containers that store data values.
You can assign a value to a variable and change it later.
Common types include integers, strings, and booleans.

## Control Flow

Control flow determines the order in which code executes.
If statements let you run code conditionally.
Loops let you repeat code multiple times.

## Functions

Functions are reusable blocks of code that perform a specific task.
They accept parameters and can return values.
Functions help organize code and reduce duplication.

## Object-Oriented Programming

OOP organizes code into objects that contain data and methods.
Classes are blueprints for creating objects.
Inheritance allows classes to share properties and methods.
`

describe("course generation pipeline (heuristic path)", () => {
  it("chunks sample programming content", () => {
    const chunks = chunkContent(SAMPLE_CONTENT.trim())
    expect(chunks.length).toBeGreaterThanOrEqual(1)
    expect(chunks[0].text).toContain("Programming")
  })

  it("produces extraction-shaped data from content sections", () => {
    const chunks = chunkContent(SAMPLE_CONTENT.trim())
    const extractions: ChunkExtractionResult[] = chunks.map((chunk) => {
      const sections = chunk.text
        .split(/\n{2,}|(?=^#{1,3}\s)/m)
        .map((s) => s.trim())
        .filter((s) => s.length > 30)

      return {
        chunkId: chunk.id,
        concepts: sections.slice(0, 3).map((section, i) => ({
          title: section.split("\n")[0].replace(/^#+\s*/, ""),
          summary: section.slice(0, 200),
          keyConcepts: ["concept"],
          complexity: i === 0 ? "beginner" as const : "intermediate" as const,
          prerequisites: [],
          sourceChunkIds: [chunk.id],
          isEssential: i === 0,
        })),
      }
    })

    const totalConcepts = extractions.reduce((sum, e) => sum + e.concepts.length, 0)
    expect(totalConcepts).toBeGreaterThan(0)
  })
})
