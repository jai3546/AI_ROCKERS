import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // 1. Delete all mastery records
    await prisma.userConceptMastery.deleteMany({
      where: { userId: studentId },
    });

    // 2. Delete mastery history timeline records
    await prisma.masteryHistory.deleteMany({
      where: { userId: studentId },
    });

    // 3. Re-seed masteries with initial values
    const allConcepts = await prisma.concept.findMany();

    const initialValues: Record<
      string,
      { mastery: number; confidence: number; retention: number; lastPracticedOffsetDays: number }
    > = {
      "states-of-matter": { mastery: 85, confidence: 90, retention: 88, lastPracticedOffsetDays: 2 },
      "chemistry-foundations": { mastery: 68, confidence: 75, retention: 70, lastPracticedOffsetDays: 3 },
      "photosynthesis": { mastery: 42, confidence: 45, retention: 50, lastPracticedOffsetDays: 6 },
      "basic-geometry": { mastery: 78, confidence: 80, retention: 82, lastPracticedOffsetDays: 1 },
      "advanced-geometry": { mastery: 30, confidence: 35, retention: 40, lastPracticedOffsetDays: 8 },
      "algebra-foundations": { mastery: 82, confidence: 85, retention: 80, lastPracticedOffsetDays: 4 },
      "grammar-syntax": { mastery: 64, confidence: 68, retention: 72, lastPracticedOffsetDays: 5 },
      "geography-rivers": { mastery: 48, confidence: 50, retention: 55, lastPracticedOffsetDays: 7 },
    };

    const now = new Date();
    await prisma.userConceptMastery.createMany({
      data: allConcepts.map((c) => {
        const mock = initialValues[c.id];
        let lastPracticedDate = new Date();
        lastPracticedDate.setDate(now.getDate() - 30); // 30 days ago default

        if (mock) {
          lastPracticedDate = new Date();
          lastPracticedDate.setDate(now.getDate() - mock.lastPracticedOffsetDays);
        }

        return {
          userId: studentId,
          conceptId: c.id,
          mastery: mock ? mock.mastery : 0,
          confidence: mock ? mock.confidence : 0,
          retention: mock ? mock.retention : 0,
          accuracy: mock ? Math.round(mock.mastery * 0.9) : 0,
          engagement: mock ? 75 : 0,
          lastPracticed: lastPracticedDate,
        };
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Reset completed successfully.",
    });
  } catch (error: any) {
    console.error("POST /api/learning-memory/reset Error:", error);
    return NextResponse.json({ error: error.message || "Failed to reset graph" }, { status: 500 });
  }
}
