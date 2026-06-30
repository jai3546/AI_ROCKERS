import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decayRetention } from "@/services/mastery-engine";
import { generateRecommendations } from "@/services/recommendation-engine";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get("studentId") || "S001";

    // 1. Fetch user masteries
    const masteries = await prisma.userConceptMastery.findMany({
      where: { userId: studentId },
      include: {
        concept: {
          include: {
            prerequisites: true,
          },
        },
      },
    });

    if (masteries.length === 0) {
      return NextResponse.json({
        weakConcepts: [],
        revisionPriorities: [],
        nextTopics: [],
      });
    }

    // 2. Apply retention decay so recommendations are based on decayed values
    const updatedMasteries = await Promise.all(
      masteries.map(async (m) => {
        if (m.mastery === 0 || !m.lastPracticed) return m;

        const newRetention = decayRetention(m.lastPracticed.toISOString(), m.retention);
        if (newRetention !== m.retention) {
          const accuracy = m.accuracy !== 0 ? m.accuracy : Math.round(m.mastery * 0.8);
          const engagement = m.engagement !== 0 ? m.engagement : 50;

          const score = accuracy * 0.5 + m.confidence * 0.2 + newRetention * 0.2 + engagement * 0.1;
          const newMastery = Math.min(100, Math.max(0, Math.round(score)));

          return prisma.userConceptMastery.update({
            where: { id: m.id },
            data: {
              retention: newRetention,
              mastery: newMastery,
            },
            include: {
              concept: {
                include: {
                  prerequisites: true,
                },
              },
            },
          });
        }
        return m;
      })
    );

    // 3. Map to ConceptNode list structure
    const graphNodes = updatedMasteries.map((m) => ({
      id: m.conceptId,
      name: m.concept.name,
      subject: m.concept.subject,
      mastery: m.mastery,
      confidence: m.confidence,
      retention: m.retention,
      lastPracticed: m.lastPracticed.toISOString(),
      prerequisites: m.concept.prerequisites.map((p) => p.fromConceptId),
      accuracy: m.accuracy,
      engagement: m.engagement,
    }));

    // 4. Generate recommendations
    const recommendations = generateRecommendations(graphNodes);

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("GET /api/learning-memory/recommendations Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate recommendations" }, { status: 500 });
  }
}
