import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get("studentId") || "S001";

    const history = await prisma.masteryHistory.findMany({
      where: { userId: studentId },
      orderBy: { date: "asc" },
      take: 15,
    });

    if (history.length === 0) {
      // Seed a mock initial history if database history is empty
      // Same logic as standard getTimelineHistory fallback in service
      const mockHistory = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const mm = (date.getMonth() + 1).toString().padStart(2, "0");
        const dd = date.getDate().toString().padStart(2, "0");
        const dateStr = `${mm}/${dd}`;

        const progressFactor = (6 - i) / 6;
        mockHistory.push({
          date: dateStr,
          averageMastery: Math.round(55 * (0.7 + progressFactor * 0.3)),
          mathMastery: Math.round(60 * (0.65 + progressFactor * 0.35)),
          scienceMastery: Math.round(50 * (0.75 + progressFactor * 0.25)),
          socialMastery: Math.round(48 * (0.7 + progressFactor * 0.3)),
          englishMastery: Math.round(62 * (0.8 + progressFactor * 0.2)),
        });
      }
      return NextResponse.json(mockHistory);
    }

    const timelineData = history.map((pt) => ({
      date: pt.date,
      averageMastery: pt.averageMastery,
      mathMastery: pt.mathMastery,
      scienceMastery: pt.scienceMastery,
      socialMastery: pt.socialMastery,
      englishMastery: pt.englishMastery,
    }));

    return NextResponse.json(timelineData);
  } catch (error: any) {
    console.error("GET /api/learning-memory/history Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch timeline history" }, { status: 500 });
  }
}
