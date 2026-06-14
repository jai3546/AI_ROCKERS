import { NextResponse } from "next/server";
import { recordQuizAttempt } from "@/services/db-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, quizId, score } = body;

    if (!studentId || !quizId || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const attempt = await recordQuizAttempt(studentId, quizId, score);
    return NextResponse.json(attempt);
  } catch (error: any) {
    console.error("POST /api/student/quiz-attempt Error:", error);
    return NextResponse.json({ error: error.message || "Failed to record quiz attempt" }, { status: 500 });
  }
}
