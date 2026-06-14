if (typeof global.DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class {};
}

import { NextResponse } from "next/server";
// @ts-ignore
import officeParser from "officeparser";

function normalizeOfficeParserOutput(parsed: any): string {
  if (typeof parsed === "string") {
    try {
      const maybeJson = JSON.parse(parsed);

      if (Array.isArray(maybeJson?.content)) {
        return maybeJson.content
          .map((page: any) => page?.text || "")
          .filter(Boolean)
          .join("\n\n");
      }

      return parsed;
    } catch {
      return parsed;
    }
  }

  if (Array.isArray(parsed?.content)) {
    return parsed.content
      .map((page: any) => page?.text || "")
      .filter(Boolean)
      .join("\n\n");
  }

  return String(parsed || "");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds the 15MB limit." },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name.toLowerCase();

    let parsed: any;

    if (filename.endsWith(".pdf")) {
      parsed = await officeParser.parseOffice(buffer, { fileType: "pdf" });
    } else if (filename.endsWith(".pptx") || filename.endsWith(".ppt")) {
      parsed = await officeParser.parseOffice(buffer, {
        fileType: filename.endsWith(".pptx") ? "pptx" : "ppt",
      });
    } else if (filename.endsWith(".txt")) {
      parsed = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, PPT, PPTX or TXT file." },
        { status: 400 }
      );
    }

    const text = normalizeOfficeParserOutput(parsed);

    if (!text.trim()) {
      return NextResponse.json(
        {
          error:
            "No readable text could be extracted. This may be a scanned/image-based PDF.",
        },
        { status: 422 }
      );
    }

    const sanitized = text
      .replace(/\r\n/g, "\n")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    const words = sanitized.split(/\s+/).filter(Boolean);
    const maxWords = 10000;

    const processedText =
      words.length > maxWords
        ? words.slice(0, maxWords).join(" ") +
          "\n\n... [Document content truncated to 10,000 words]"
        : sanitized;

    return NextResponse.json({
      text: processedText,
      filename: file.name,
      wordCount: words.length,
    });
  } catch (error: any) {
    console.error("[parse-document] Document parsing failed:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to extract text from the document.",
      },
      { status: 500 }
    );
  }
}
