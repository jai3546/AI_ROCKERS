import { NextResponse } from "next/server"
import { YoutubeTranscript } from "youtube-transcript"

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json(
        {
          error: "No YouTube URL provided",
        },
        {
          status: 400,
        }
      )
    }

    console.log("YouTube URL:", url)

    // Pass the full YouTube URL
    const transcript = await YoutubeTranscript.fetchTranscript(url)

    // Validate transcript
    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        {
          error:
            "No transcript available for this video. It may not have captions enabled.",
        },
        {
          status: 404,
        }
      )
    }

    const text = transcript
      .map((item) => item.text)
      .join(" ")

    console.log("Transcript length:", text.length)

    return NextResponse.json({
      success: true,
      text,
    })
  } catch (error: any) {
    console.error("YouTube Error:", error)

    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch transcript",
      },
      {
        status: 500,
      }
    )
  }
}