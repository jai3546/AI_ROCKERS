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

    // Pass FULL URL, not video ID
    const transcript =
      await YoutubeTranscript.fetchTranscript(url)

    const text = transcript
      .map((item) => item.text)
      .join(" ")

    console.log("Transcript length:", text.length)

    return NextResponse.json({
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