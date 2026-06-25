export const runtime = "nodejs"

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== "string") {
      return Response.json({ error: "URL is required" }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return Response.json({ error: "Invalid URL" }, { status: 400 })
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return Response.json({ error: "Only http and https URLs are supported" }, { status: 400 })
    }

    const hostname = parsed.hostname
    const isPrivateIp = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|169\.254\.|localhost$|::1$|::$|fe80:|fc[0-9a-f]{2}:)/i.test(hostname)
    if (isPrivateIp) {
      return Response.json({ error: "Access to private network addresses is not allowed" }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "VidyAI-CourseGenerator/1.0",
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return Response.json(
        { error: `Failed to fetch URL (status ${response.status})` },
        { status: 502 }
      )
    }

    const contentType = response.headers.get("content-type") || ""
    const body = await response.text()

    let text: string
    if (contentType.includes("text/html")) {
      text = stripHtml(body)
    } else {
      text = body.replace(/\s+/g, " ").trim()
    }

    if (text.length < 50) {
      return Response.json(
        { error: "Insufficient readable text found at this URL" },
        { status: 422 }
      )
    }

    return Response.json({
      text: text.slice(0, 100000),
      url,
      length: text.length,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "URL fetch failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
