import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No image uploaded" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()

    const base64 = Buffer.from(bytes).toString("base64")

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Extract all educational content from this image. Preserve headings, formulas, bullet points and paragraphs. Return only the extracted text in English.",
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

    const data = await response.json()

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return NextResponse.json({
      text,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "Image extraction failed",
      },
      {
        status: 500,
      }
    )
  }
}