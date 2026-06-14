import { NextResponse } from "next/server";
import { updateTopicMastery } from "@/services/db-service";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, topicId, masteryScore, revisionPriority } = body;

    if (!studentId || !topicId || masteryScore === undefined || revisionPriority === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const progress = await updateTopicMastery(studentId, topicId, masteryScore, revisionPriority);
    return NextResponse.json(progress);
  } catch (error: any) {
    console.error("POST /api/student/topic-mastery Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update topic mastery" }, { status: 500 });
  }
}
