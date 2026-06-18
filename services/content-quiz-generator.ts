function splitSourceSections(sourceContent: string): string[] {
  const sections = sourceContent
    .split(/\n{2,}|(?=^#{1,3}\s)/m)
    .map((section) => section.replace(/^#+\s*/, "").trim())
    .filter((section) => section.length > 30)

  if (sections.length > 0) return sections

  const sentences = sourceContent
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 25)

  return sentences.length > 0 ? sentences : [sourceContent.trim().slice(0, 500)]
}

function sectionTitle(section: string): string {
  const line = section.split(/\n/)[0].trim()
  const sentence = line.split(/[.!?]/)[0].trim()
  return (sentence || line).slice(0, 80)
}

export function generateQuizFromSourceContent(
  subject: string,
  topic: string,
  sourceContent: string,
  syllabus: string,
  numQuestions: number
): Array<{
  id: string
  question: string
  options: Array<{ id: string; text: string; isCorrect: boolean }>
  points: number
  subject: string
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
  topic: string
}> {
  const sections = splitSourceSections(sourceContent)
  const resolvedTopic = topic.trim() || sectionTitle(sections[0])

  return sections.slice(0, numQuestions).map((section, index) => {
    const title = sectionTitle(section)
    const summary = section.replace(/\s+/g, " ").slice(0, 180)
    const distractorA = section.replace(/\s+/g, " ").slice(180, 320) || "A related detail from another section."

    return {
      id: `source-quiz-${index}-${Date.now()}`,
      question: `Based on your uploaded material about "${resolvedTopic}", which statement is supported by the content?`,
      options: [
        { id: "a", text: summary, isCorrect: true },
        { id: "b", text: "This concept is not mentioned anywhere in the uploaded material.", isCorrect: false },
        { id: "c", text: distractorA.slice(0, 120) + (distractorA.length > 120 ? "..." : ""), isCorrect: false },
        { id: "d", text: `The material states the opposite of: ${title.slice(0, 60)}`, isCorrect: false },
      ],
      points: 20,
      subject,
      syllabus: syllabus as "AP" | "Telangana" | "CBSE" | "General",
      topic: title || resolvedTopic,
    }
  })
}

export function generateFlashcardsFromSourceContent(
  subject: string,
  topic: string,
  sourceContent: string,
  syllabus: string,
  numFlashcards: number
): Array<{
  id: string
  front: string
  back: string
  subject: string
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
}> {
  const sections = splitSourceSections(sourceContent)
  const resolvedTopic = topic.trim() || sectionTitle(sections[0])

  return sections.slice(0, numFlashcards).map((section, index) => {
    const title = sectionTitle(section)
    return {
      id: `source-card-${index}-${Date.now()}`,
      front: `From your material on "${resolvedTopic}": What is "${title}"?`,
      back: section.replace(/\s+/g, " ").slice(0, 400),
      subject,
      syllabus: syllabus as "AP" | "Telangana" | "CBSE" | "General",
    }
  })
}
