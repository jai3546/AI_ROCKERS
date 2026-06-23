import { NextResponse } from "next/server"
import pdfParse from "pdf-parse/lib/pdf-parse"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const file = formData.get("file") as File | null

    // Check if file exists
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No PDF file uploaded.",
        },
        {
          status: 400,
        }
      )
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a valid PDF file.",
        },
        {
          status: 400,
        }
      )
    }

    // Convert uploaded file to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Extract text using pdf-parse
    const data = await pdfParse(buffer)

    // Validate extracted text
    if (!data.text || !data.text.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to extract text from this PDF. It may be scanned or image-based.",
        },
        {
          status: 400,
        }
      )
    }

    // Clean extracted text
    const cleanedText = data.text
      .replace(/\r/g, "")
      .replace(/\t/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    // Check cleaned text
    if (cleanedText.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to extract readable text from this PDF. It may be scanned or image-based.",
        },
        {
          status: 400,
        }
      )
    }

    // Limit size sent to Gemini
    return NextResponse.json({
      success: true,
      pages: data.numpages,
      text: cleanedText.substring(0, 20000),
    })
  } catch (error) {
    console.error("PDF Extraction Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to extract PDF content.",
      },
      {
        status: 500,
      }
    )
  }
}