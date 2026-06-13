export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof Blob)) {
      return Response.json({ error: "PDF file is required" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    let text = ""

    try {
      const pdfParse = (await import("pdf-parse")).default
      const result = await pdfParse(buffer)
      text = (result.text || "").replace(/\s+/g, " ").trim()
    } catch (parseError) {
      console.warn("pdf-parse failed, attempting basic extraction:", parseError)
      const raw = buffer.toString("utf-8")
      const matches = raw.match(/\(([^)]+)\)/g) || []
      text = matches
        .map((m) => m.slice(1, -1))
        .filter((s) => s.length > 2 && /[a-zA-Z]/.test(s))
        .join(" ")
        .replace(/\\n/g, " ")
        .trim()
    }

    if (text.length < 50) {
      return Response.json(
        { error: "Could not extract enough readable text from the PDF. Try a text-based PDF or paste the content instead." },
        { status: 422 }
      )
    }

    return Response.json({
      text: text.slice(0, 100000),
      length: text.length,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "PDF extraction failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
