import { NextResponse } from "next/server"
import mammoth from "mammoth"
import JSZip from "jszip"
import { XMLParser } from "fast-xml-parser"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        {
          error: "No file provided.",
        },
        {
          status: 400,
        }
      )
    }

    const fileName = file.name.toLowerCase()

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // ---------------- TXT ----------------

    if (fileName.endsWith(".txt")) {
      const text = new TextDecoder("utf-8").decode(buffer).trim()

      if (!text) {
        return NextResponse.json(
          {
            error: "Text file is empty.",
          },
          {
            status: 400,
          }
        )
      }

      return NextResponse.json({
        success: true,
        type: "txt",
        text: text.replace(/\s+/g, " ").substring(0, 20000),
      })
    }

    // ---------------- DOCX ----------------

    if (fileName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({
        buffer,
      })

      const text = result.value
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/\s+/g, " ")
        .trim()

      if (!text) {
        return NextResponse.json(
          {
            error: "Could not extract text from DOCX file.",
          },
          {
            status: 400,
          }
        )
      }

      return NextResponse.json({
        success: true,
        type: "docx",
        text: text.substring(0, 20000),
      })
    }

    // ---------------- PPTX ----------------

    if (fileName.endsWith(".pptx")) {
      const zip = await JSZip.loadAsync(buffer)

      const parser = new XMLParser({
        ignoreAttributes: false,
      })

      let extractedText = ""

      const slideFiles = Object.keys(zip.files)
        .filter((name) => name.startsWith("ppt/slides/slide"))
        .sort()

      for (const slide of slideFiles) {
        const xml = await zip.files[slide].async("text")

        const json = parser.parse(xml)

        const walk = (obj: any) => {
          if (!obj) return

          if (typeof obj === "string") {
            extractedText += obj + " "
            return
          }

          if (Array.isArray(obj)) {
            obj.forEach(walk)
            return
          }

          Object.values(obj).forEach(walk)
        }

        walk(json)
      }

      extractedText = extractedText
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/\s+/g, " ")
        .trim()

      if (!extractedText) {
        return NextResponse.json(
          {
            error: "Could not extract text from PPTX file.",
          },
          {
            status: 400,
          }
        )
      }

      return NextResponse.json({
        success: true,
        type: "pptx",
        text: extractedText.substring(0, 20000),
      })
    }

    // ---------------- Unsupported ----------------

    return NextResponse.json(
      {
        error:
          "Unsupported file type. Please upload .txt, .docx or .pptx files.",
      },
      {
        status: 400,
      }
    )
  } catch (error) {
    console.error("Document Extraction Error:", error)

    return NextResponse.json(
      {
        error: "Failed to extract document content.",
      },
      {
        status: 500,
      }
    )
  }
}