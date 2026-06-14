import { NextResponse } from "next/server";
import { saveTutorConversation } from "@/services/db-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, sessionId, prompt, response } = body;

    if (!studentId || !sessionId || !prompt || !response) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const conversation = await saveTutorConversation({ studentId, sessionId, prompt, response });
    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error("POST /api/student/tutor-conversation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save tutor conversation" }, { status: 500 });
  }
}
