import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decayRetention } from "@/services/mastery-engine";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get("studentId") || "S001";

    // 1. Fetch user. If not exists, initialize user and initial values
    let user = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: studentId,
          name: studentId.startsWith("demo-") ? "Demo Student" : "Student User",
          role: "student",
        },
      });

      // Initialize learning profile
      await prisma.learningProfile.create({
        data: {
          userId: studentId,
          domainType: "SCHOOL",
        },
      });

      // Get all concepts to seed mastery records
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
    }

    // 2. Fetch masteries
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

    // 3. Apply retention decay calculations
    const now = new Date();
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

    // 4. Map to ConceptNode response structure
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

    return NextResponse.json(graphNodes);
  } catch (error: any) {
    console.error("GET /api/learning-memory/graph Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch graph" }, { status: 500 });
  }
}
