import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processActivity, calculateMastery } from "@/services/mastery-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, conceptId, activity } = body;

    if (!studentId || !conceptId || !activity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch user concept mastery
    let masteryRecord = await prisma.userConceptMastery.findUnique({
      where: {
        userId_conceptId: {
          userId: studentId,
          conceptId,
        },
      },
      include: {
        concept: true,
      },
    });

    if (!masteryRecord) {
      // If it doesn't exist, create it with initial zero values
      const concept = await prisma.concept.findUnique({ where: { id: conceptId } });
      if (!concept) {
        return NextResponse.json({ error: "Concept not found" }, { status: 404 });
      }

      masteryRecord = await prisma.userConceptMastery.create({
        data: {
          userId: studentId,
          conceptId,
          mastery: 0,
          confidence: 0,
          retention: 0,
          accuracy: 0,
          engagement: 0,
          lastPracticed: new Date(),
        },
        include: {
          concept: true,
        },
      });
    }

    // 2. Map mastery record to ConceptNode expected by mastery-engine
    const nodeParam = {
      id: masteryRecord.conceptId,
      name: masteryRecord.concept.name,
      subject: masteryRecord.concept.subject,
      mastery: masteryRecord.mastery,
      confidence: masteryRecord.confidence,
      retention: masteryRecord.retention,
      lastPracticed: masteryRecord.lastPracticed.toISOString(),
      prerequisites: [], // not needed for processing activity
      accuracy: masteryRecord.accuracy,
      engagement: masteryRecord.engagement,
    };

    // 3. Process activity using standard mastery-engine
    const updates = processActivity(nodeParam, activity);

    // 4. Update concept mastery in database
    const updatedMastery = await prisma.userConceptMastery.update({
      where: { id: masteryRecord.id },
      data: {
        accuracy: updates.accuracy,
        confidence: updates.confidence,
        retention: updates.retention,
        engagement: updates.engagement,
        mastery: updates.mastery,
        lastPracticed: updates.lastPracticed ? new Date(updates.lastPracticed) : new Date(),
      },
    });

    // 5. Log the learning activity
    await prisma.learningActivity.create({
      data: {
        userId: studentId,
        conceptId,
        activityType: activity.activityType,
        score: activity.score,
        totalScore: activity.total,
        responseTime: activity.responseTime,
        confusionDetected: activity.confusionDetected || false,
        engagementScore: activity.engagement || 50,
      },
    });

    // 6. Create/Update timeline snapshot
    const allMasteries = await prisma.userConceptMastery.findMany({
      where: { userId: studentId },
      include: { concept: true },
    });

    const subjects = {
      Math: { total: 0, count: 0 },
      Science: { total: 0, count: 0 },
      "Social Studies": { total: 0, count: 0 },
      English: { total: 0, count: 0 },
    };

    let overallTotal = 0;
    let overallCount = 0;

    for (const m of allMasteries) {
      const subj = m.concept.subject as keyof typeof subjects;
      if (subjects[subj] !== undefined) {
        subjects[subj].total += m.mastery;
        subjects[subj].count++;
      }
      overallTotal += m.mastery;
      overallCount++;
    }

    const averages = {
      average: overallCount > 0 ? Math.round(overallTotal / overallCount) : 0,
      math: subjects.Math.count > 0 ? Math.round(subjects.Math.total / subjects.Math.count) : 0,
      science: subjects.Science.count > 0 ? Math.round(subjects.Science.total / subjects.Science.count) : 0,
      social: subjects["Social Studies"].count > 0 ? Math.round(subjects["Social Studies"].total / subjects["Social Studies"].count) : 0,
      english: subjects.English.count > 0 ? Math.round(subjects.English.total / subjects.English.count) : 0,
    };

    const now = new Date();
    const mm = (now.getMonth() + 1).toString().padStart(2, "0");
    const dd = now.getDate().toString().padStart(2, "0");
    const dateStr = `${mm}/${dd}`;

    await prisma.masteryHistory.upsert({
      where: {
        userId_date: {
          userId: studentId,
          date: dateStr,
        },
      },
      update: {
        averageMastery: averages.average,
        mathMastery: averages.math,
        scienceMastery: averages.science,
        socialMastery: averages.social,
        englishMastery: averages.english,
      },
      create: {
        userId: studentId,
        date: dateStr,
        averageMastery: averages.average,
        mathMastery: averages.math,
        scienceMastery: averages.science,
        socialMastery: averages.social,
        englishMastery: averages.english,
      },
    });

    return NextResponse.json({
      success: true,
      updatedMastery,
    });
  } catch (error: any) {
    console.error("POST /api/learning-memory/activity Error:", error);
    return NextResponse.json({ error: error.message || "Failed to log activity" }, { status: 500 });
  }
}
