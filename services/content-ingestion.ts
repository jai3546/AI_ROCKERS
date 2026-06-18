import type { IngestedContent, SourceType } from "@/types/course"

const PARSE_DOCUMENT_PATTERN = /\.(pdf|pptx?|txt)$/i

async function parseDocumentViaApi(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/parse-document", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Document extraction failed" }))
    throw new Error(error.error || "Failed to extract text from the document.")
  }

  const data = await response.json()
  const text = (data.text || "").trim()
  if (!text) {
    throw new Error("No readable text found in the document.")
  }

  return text
}

export async function ingestPastedText(text: string): Promise<IngestedContent> {
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error("Please paste some content to generate a course.")
  }
  if (trimmed.length < 50) {
    throw new Error("Content is too short. Please provide at least 50 characters.")
  }
  return { text: trimmed, sourceType: "paste" }
}

export async function ingestTextFile(file: File): Promise<IngestedContent> {
  if (!file.name.match(/\.(txt|md|markdown)$/i)) {
    throw new Error("Unsupported file type. Please upload a .txt or .md file.")
  }
  const text = (await file.text()).trim()
  if (!text) {
    throw new Error("The uploaded file is empty.")
  }
  return { text, sourceType: "file", sourceName: file.name }
}

/** PDF, PPT, PPTX, and TXT via server-side parser (same path as Study Summaries uploads). */
export async function ingestDocumentFile(file: File): Promise<IngestedContent> {
  const name = file.name.toLowerCase()

  if (name.match(/\.(md|markdown)$/i)) {
    return ingestTextFile(file)
  }

  if (!name.match(PARSE_DOCUMENT_PATTERN)) {
    throw new Error("Unsupported file type. Please upload PDF, PPT, PPTX, TXT, or MD.")
  }

  const text = await parseDocumentViaApi(file)
  const sourceType: SourceType = name.endsWith(".pdf") ? "pdf" : "file"

  return { text, sourceType, sourceName: file.name }
}

export async function ingestPdfFile(file: File): Promise<IngestedContent> {
  if (!file.name.match(/\.pdf$/i)) {
    throw new Error("Please upload a PDF file.")
  }
  return ingestDocumentFile(file)
}

export async function ingestUrl(url: string): Promise<IngestedContent> {
  const trimmed = url.trim()
  if (!trimmed) {
    throw new Error("Please enter a URL.")
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error("Invalid URL. Please enter a valid http or https link.")
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported.")
  }

  const response = await fetch("/api/content/fetch-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: trimmed }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "URL fetch failed" }))
    throw new Error(error.error || "Failed to fetch content from URL.")
  }

  const data = await response.json()
  const text = (data.text || "").trim()
  if (!text) {
    throw new Error("No readable text found at this URL.")
  }

  return { text, sourceType: "url", sourceName: trimmed }
}

export async function ingestContent(
  sourceType: SourceType,
  input: string | File
): Promise<IngestedContent> {
  switch (sourceType) {
    case "paste":
      if (typeof input !== "string") throw new Error("Expected text input.")
      return ingestPastedText(input)
    case "file":
      if (!(input instanceof File)) throw new Error("Expected a file.")
      return ingestTextFile(input)
    case "pdf":
      if (!(input instanceof File)) throw new Error("Expected a document file.")
      return ingestDocumentFile(input)
    case "url":
      if (typeof input !== "string") throw new Error("Expected a URL.")
      return ingestUrl(input)
    default:
      throw new Error(`Unsupported source type: ${sourceType}`)
  }
}
