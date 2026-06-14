import { NextResponse } from "next/server";
import { saveEmotionLog } from "@/services/db-service";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, emotion, confidence, attentionScore } = body;

    if (!studentId || !emotion || confidence === undefined || attentionScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const log = await saveEmotionLog({ studentId, emotion, confidence, attentionScore });
    return NextResponse.json(log);
  } catch (error: any) {
    console.error("POST /api/student/emotion-log Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save emotion log" }, { status: 500 });
  }
}
