import { NextResponse } from "next/server"
import pdfParse from "pdf-parse"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        {
          error: "No image uploaded.",
        },
        {
          status: 400,
        }
      )
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Please upload a valid image file.",
        },
        {
          status: 400,
        }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Gemini API key is not configured.",
        },
        {
          status: 500,
        }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Extract all educational text from this image. Preserve headings, bullet points, numbered lists, formulas, tables, and paragraphs. Return only the extracted text without explanations.",
                },
                {
                  inline_data: {
                    mime_type: file.type,
                    data: base64,
                  },
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()

      return NextResponse.json(
        {
          error: `Gemini request failed: ${error}`,
        },
        {
          status: 500,
        }
      )
    }

    const data = await response.json()

    const extractedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""

    if (!extractedText) {
      return NextResponse.json(
        {
          error:
            "No readable text found in the uploaded image. Try a clearer image.",
        },
        {
          status: 400,
        }
      )
    }

    return NextResponse.json({
      success: true,
      text: extractedText.substring(0, 30000),
    })
  } catch (error) {
    console.error("Image Extraction Error:", error)

    return NextResponse.json(
      {
        error: "Failed to extract text from image.",
      },
      {
        status: 500,
      }
    )
  }
}