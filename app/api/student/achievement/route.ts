import { NextResponse } from "next/server";
import { awardAchievement } from "@/services/db-service";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, achievementId } = body;

    if (!studentId || !achievementId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const unlock = await awardAchievement(studentId, achievementId);
    if (!unlock) {
      return NextResponse.json({ message: "Achievement already unlocked" }, { status: 200 });
    }

    return NextResponse.json(unlock);
  } catch (error: any) {
    console.error("POST /api/student/achievement Error:", error);
    return NextResponse.json({ error: error.message || "Failed to award achievement" }, { status: 500 });
  }
}
