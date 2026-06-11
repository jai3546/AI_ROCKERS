"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { analyzeLearningMaterial } from "@/services/gemini-api"


export default function ContentUpload() {
  const [notes, setNotes] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleProcess = async () => {
    setLoading(true)
    setError("")

    try {
      let content = ""

      if (notes.trim()) {
        content = notes
      } else if (pdfFile) {
        const formData = new FormData()
        formData.append("file", pdfFile)

        const response = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error ||
            "Unable to extract text from this PDF. It may be scanned or image-based."
          )
        }

        content = data.text || ""

        console.log("PDF Pages:", data.pages)
        console.log("Extracted Text:")
        console.log(content.substring(0, 2000))

      } else if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const response = await fetch("/api/extract-image", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Image OCR failed")
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        content = data.text || ""
      } else if (documentFile) {
        const formData = new FormData()
        formData.append("file", documentFile)

        const response = await fetch("/api/extract-document", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Document extraction failed")
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        content = data.text || ""
      } else if (youtubeUrl.trim()) {
        const response = await fetch("/api/youtube-transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: youtubeUrl }),
        })

        if (!response.ok) {
          throw new Error("YouTube transcript extraction failed")
        }

        const data = await response.json()
        content = data.text || youtubeUrl
      } else if (websiteUrl.trim()) {
        const response = await fetch("/api/extract-website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: websiteUrl }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Website extraction failed")
        }

        const data = await response.json()
        content = data.text || ""
      }

      if (!content.trim()) {
        setAnalysis("No content available for analysis.")
        return
      }

      console.log("========== CONTENT ==========")
      console.log(content.substring(0, 3000))
      console.log("=============================")

      const result = await analyzeLearningMaterial(content)
      setAnalysis(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze learning material."
      console.error(err)
      setError(message)
      setAnalysis("")
    } finally {
      setLoading(false)
    }
  }

  const hasContent =
    notes.trim() ||
    pdfFile ||
    imageFile ||
    documentFile ||
    youtubeUrl.trim() ||
    websiteUrl.trim()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Upload Learning Material
      </h2>

      {loading && (
        <div className="border rounded-lg p-4 mb-4 bg-blue-50">
          <p className="text-blue-700">Analyzing learning material...</p>
        </div>
      )}

      {error && (
        <div className="border border-red-300 rounded-lg p-4 mb-4 bg-red-50">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="border rounded-lg p-4 bg-muted/30 mb-4">
          <h3 className="font-bold mb-3">AI Learning Analysis</h3>
          <div className="whitespace-pre-wrap text-sm">{analysis}</div>
        </div>
      )}

      <div className="space-y-6">
        {/* Notes */}
        <div>
          <label className="block mb-2 font-medium">
            📝 Notes / Text
          </label>
          <textarea
            className="w-full border rounded-lg p-3 min-h-[180px]"
            placeholder="Paste your study notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* PDF */}
        <div>
          <label className="block mb-2 font-medium">
            📄 PDF Upload
          </label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          />
          {pdfFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {pdfFile.name}
            </p>
          )}
        </div>

        {/* Image OCR */}
        <div>
          <label className="block mb-2 font-medium">
            🖼️ Image (OCR — extract text from image)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/bmp,image/tiff"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {imageFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {imageFile.name}
            </p>
          )}
        </div>

        {/* DOCX / TXT */}
        <div>
          <label className="block mb-2 font-medium">
            📚 Document (.docx or .txt)
          </label>
          <input
            type="file"
            accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
          />
          {documentFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {documentFile.name}
            </p>
          )}
        </div>

        {/* YouTube */}
        <div>
          <label className="block mb-2 font-medium">
            🎥 YouTube URL
          </label>
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block mb-2 font-medium">
            🌐 Website URL
          </label>
          <input
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full border rounded-lg p-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Works best with static sites (Wikipedia, MDN, GeeksforGeeks). Dynamic React/Next.js sites may not extract correctly.
          </p>
        </div>

        {/* Content Preview */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <h3 className="font-semibold text-lg mb-3">Content Preview</h3>

          {notes && <p className="text-sm mb-2">✅ Notes added</p>}
          {pdfFile && <p className="text-sm mb-2">✅ PDF: {pdfFile.name}</p>}
          {imageFile && <p className="text-sm mb-2">✅ Image: {imageFile.name}</p>}
          {documentFile && <p className="text-sm mb-2">✅ Document: {documentFile.name}</p>}
          {youtubeUrl && (
            <p className="text-sm mb-2 break-all">✅ YouTube: {youtubeUrl}</p>
          )}
          {websiteUrl && (
            <p className="text-sm break-all">✅ Website: {websiteUrl}</p>
          )}

          {!hasContent && (
            <p className="text-sm text-muted-foreground">
              No content added yet.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleProcess}
            disabled={loading || !hasContent}
          >
            {loading ? "Processing..." : "Process Learning Material"}
          </Button>
        </div>
      </div>
    </div>
  )
}