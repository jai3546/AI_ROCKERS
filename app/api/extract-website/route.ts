import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import { Readability } from "@mozilla/readability"
import { JSDOM } from "jsdom"
import { lookup } from "dns/promises"

function isPrivateIP(ip: string): boolean {
  // IPv6 loopback
  if (ip === "::1") return true

  // Strip IPv6-mapped IPv4 prefix (::ffff:x.x.x.x)
  const ipv4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip

  const parts = ipv4.split(".").map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) return false

  const [a, b] = parts

  return (
    a === 10 ||                          // 10.0.0.0/8
    a === 127 ||                         // 127.0.0.0/8 loopback
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
    (a === 192 && b === 168) ||          // 192.168.0.0/16
    (a === 169 && b === 254) ||          // 169.254.0.0/16 link-local
    a === 0                              // 0.0.0.0/8
  )
}

async function validateUrl(rawUrl: string): Promise<{ valid: false; error: string } | { valid: true; parsed: URL }> {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { valid: false, error: "Invalid URL format" }
  }

  // Only allow http and https
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, error: "Only http and https URLs are allowed" }
  }

  const hostname = parsed.hostname

  // Block localhost by name
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return { valid: false, error: "Requests to localhost are not allowed" }
  }

  // Block numeric IPs that are private without even resolving
  if (isPrivateIP(hostname)) {
    return { valid: false, error: "Requests to private IP ranges are not allowed" }
  }

  // DNS-resolve the hostname and check the resolved IP
  try {
    const { address } = await lookup(hostname)
    if (isPrivateIP(address)) {
      return { valid: false, error: "Requests to private IP ranges are not allowed" }
    }
  } catch {
    return { valid: false, error: "Could not resolve hostname" }
  }

  return { valid: true, parsed }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    const validation = await validateUrl(url)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const response = await fetch(validation.parsed.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`)
    }

    const html = await response.text()

    // Try Mozilla Readability first (best for articles)
    try {
      const dom = new JSDOM(html, { url })
      const reader = new Readability(dom.window.document)
      const article = reader.parse()

      if (article && article.textContent && article.textContent.trim().length > 200) {
        const text = article.textContent
          .replace(/\s+/g, " ")
          .trim()

        return NextResponse.json({
          text: text.substring(0, 30000),
          title: article.title || "",
          method: "readability",
        })
      }
    } catch {
      // Readability failed, fall through to Cheerio
    }

    // Fallback: Cheerio extraction
    const $ = cheerio.load(html)
    $("script").remove()
    $("style").remove()
    $("noscript").remove()
    $("svg").remove()
    $("nav").remove()
    $("footer").remove()
    $("header").remove()

    // Try to get meaningful content tags first
    const articleText = $("article, main, .content, .post, .entry")
      .text()
      .replace(/\s+/g, " ")
      .trim()

    const text = articleText.length > 200
      ? articleText
      : $("body")
          .find("p, h1, h2, h3, h4, li")
          .map((_, el) => $(el).text())
          .get()
          .join("\n")
          .replace(/\s+/g, " ")
          .trim()

    if (text.length < 100) {
      return NextResponse.json(
        {
          error:
            "This website uses dynamic rendering (JavaScript). Please paste the article text manually or upload it as a PDF.",
          text: "",
        },
        { status: 422 }
      )
    }

    return NextResponse.json({
      text: text.substring(0, 30000),
      method: "cheerio",
    })
  } catch (error) {
    console.error("Website Extraction Error:", error)
    return NextResponse.json(
      { error: "Failed to extract website content" },
      { status: 500 }
    )
  }
}