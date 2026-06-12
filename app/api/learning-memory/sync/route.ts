import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, localGraph } = body;

    if (!studentId || !Array.isArray(localGraph)) {
      return NextResponse.json({ error: "Invalid sync request payload" }, { status: 400 });
    }

    let itemsUpdated = 0;

    for (const localNode of localGraph) {
      const dbMastery = await prisma.userConceptMastery.findUnique({
        where: {
          userId_conceptId: {
            userId: studentId,
            conceptId: localNode.id,
          },
        },
      });

      if (!dbMastery) {
        // If not present in DB, insert it
        await prisma.userConceptMastery.create({
          data: {
            userId: studentId,
            conceptId: localNode.id,
            mastery: localNode.mastery || 0,
            confidence: localNode.confidence || 0,
            retention: localNode.retention || 0,
            accuracy: localNode.accuracy || 0,
            engagement: localNode.engagement || 75,
            lastPracticed: localNode.lastPracticed ? new Date(localNode.lastPracticed) : new Date(),
          },
        });
        itemsUpdated++;
      } else if ((localNode.mastery || 0) > dbMastery.mastery) {
        // Conflict resolution: highest score wins!
        await prisma.userConceptMastery.update({
          where: { id: dbMastery.id },
          data: {
            mastery: localNode.mastery,
            confidence: localNode.confidence ?? dbMastery.confidence,
            retention: localNode.retention ?? dbMastery.retention,
            accuracy: localNode.accuracy ?? dbMastery.accuracy,
            engagement: localNode.engagement ?? dbMastery.engagement,
            lastPracticed: localNode.lastPracticed ? new Date(localNode.lastPracticed) : dbMastery.lastPracticed,
          },
        });
        itemsUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      synced: true,
      itemsUpdated,
    });
  } catch (error: any) {
    console.error("POST /api/learning-memory/sync Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync data" }, { status: 500 });
  }
}
