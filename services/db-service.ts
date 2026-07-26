import { prisma } from "../lib/prisma";

export interface StudentAnalytics {
  userId: string;
  name: string;
  grade: string;
  school: string;
  class: string | null;
  streakCount: number;
  xpPoints: number;
  currentLevel: number;
  emotionalState: string | null;
  
  // Averages
  averageAttention: number;
  averageEngagement: number;
  
  // Recent lists
  recentEmotions: Array<{
    id: string;
    emotion: string;
    confidence: number;
    attentionScore: number;
    createdAt: Date;
  }>;
  recentSessions: Array<{
    id: string;
    startTime: Date;
    endTime: Date | null;
    averageAttention: number;
    averageEngagement: number;
  }>;
  quizAttempts: Array<{
    id: string;
    quizId: string;
    quizTitle: string;
    score: number;
    completedAt: Date;
  }>;
  topicProgress: Array<{
    topicId: string;
    topicName: string;
    masteryScore: number;
    revisionPriority: number;
    lastReviewedAt: Date;
  }>;
  unlockedAchievements: Array<{
    achievementId: string;
    title: string;
    description: string;
    xpReward: number;
    unlockedAt: Date;
  }>;
}

/**
 * Compiles a comprehensive analytics overview for a student.
 */
export async function getStudentAnalytics(studentId: string): Promise<StudentAnalytics | null> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentId },
    include: {
      user: true,
      emotionLogs: {
        orderBy: { createdAt: "desc" },
        take: 10
      },
      learningSessions: {
        orderBy: { startTime: "desc" },
        take: 5
      },
      quizAttempts: {
        orderBy: { completedAt: "desc" },
        take: 5,
        include: {
          quiz: true
        }
      },
      topicProgress: {
        include: {
          topic: true
        }
      },
      achievements: {
        include: {
          achievement: true
        }
      }
    }
  });

  if (!student) {
    return null;
  }

  // Calculate session averages
  let totalAttention = 0;
  let totalEngagement = 0;
  const sessionCount = student.learningSessions.length;
  
  for (const session of student.learningSessions) {
    totalAttention += session.averageAttention;
    totalEngagement += session.averageEngagement;
  }

  const averageAttention = sessionCount > 0 ? Math.round(totalAttention / sessionCount) : 75;
  const averageEngagement = sessionCount > 0 ? Math.round(totalEngagement / sessionCount) : 80;

  return {
    userId: student.userId,
    name: student.user.name,
    grade: student.grade,
    school: student.school,
    class: student.class,
    streakCount: student.streakCount,
    xpPoints: student.xpPoints,
    currentLevel: student.currentLevel,
    emotionalState: student.emotionalState,
    averageAttention,
    averageEngagement,
    recentEmotions: student.emotionLogs.map((el: any) => ({
      id: el.id,
      emotion: el.emotion,
      confidence: el.confidence,
      attentionScore: el.attentionScore,
      createdAt: el.createdAt
    })),
    recentSessions: student.learningSessions.map((ls: any) => ({
      id: ls.id,
      startTime: ls.startTime,
      endTime: ls.endTime,
      averageAttention: ls.averageAttention,
      averageEngagement: ls.averageEngagement
    })),
    quizAttempts: student.quizAttempts.map((qa: any) => ({
      id: qa.id,
      quizId: qa.quizId,
      quizTitle: qa.quiz.title,
      score: qa.score,
      completedAt: qa.completedAt
    })),
    topicProgress: student.topicProgress.map((tp: any) => ({
      topicId: tp.topicId,
      topicName: tp.topic.name,
      masteryScore: tp.masteryScore,
      revisionPriority: tp.revisionPriority,
      lastReviewedAt: tp.lastReviewedAt
    })),
    unlockedAchievements: student.achievements.map((sa: any) => ({
      achievementId: sa.achievementId,
      title: sa.achievement.title,
      description: sa.achievement.description,
      xpReward: sa.achievement.xpReward,
      unlockedAt: sa.unlockedAt
    }))
  };
}

/**
 * Saves a new emotion log entry and updates the student's profile state.
 */
export async function saveEmotionLog(data: {
  studentId: string;
  emotion: string;
  confidence: number;
  attentionScore: number;
}) {
  // FIXED: Returning the transaction result directly eliminates the out-of-scope variable crash
  return await prisma.$transaction(async (tx) => {
    const log = await tx.emotionLog.create({
      data: {
        studentId: data.studentId,
        emotion: data.emotion,
        confidence: data.confidence,
        attentionScore: data.attentionScore
      }
    });

    await tx.studentProfile.update({
      where: { userId: data.studentId },
      data: { emotionalState: data.emotion }
    });

    return log;
  });
}

/**
 * Updates a student's topic mastery score and revision priority.
 * Also synchronizes UserConceptMastery for backward compatibility.
 */
export async function updateTopicMastery(
  studentId: string,
  topicId: string,
  masteryScore: number,
  revisionPriority: number
) {
  const progress = await prisma.studentTopicProgress.upsert({
    where: {
      studentId_topicId: {
        studentId,
        topicId
      }
    },
    update: {
      masteryScore,
      revisionPriority,
      lastReviewedAt: new Date()
    },
    create: {
      studentId,
      topicId,
      masteryScore,
      revisionPriority
    }
  });

  // Backward compatibility sync
  try {
    const concept = await prisma.concept.findUnique({
      where: { id: topicId }
    });

    if (concept) {
      const masteryInt = Math.round(masteryScore);
      await prisma.userConceptMastery.upsert({
        where: {
          userId_conceptId: {
            userId: studentId,
            conceptId: topicId
          }
        },
        update: {
          mastery: masteryInt,
          confidence: masteryInt,
          retention: masteryInt,
          accuracy: Math.round(masteryScore * 0.9),
          lastPracticed: new Date()
        },
        create: {
          userId: studentId,
          conceptId: topicId,
          mastery: masteryInt,
          confidence: masteryInt,
          retention: masteryInt,
          accuracy: Math.round(masteryScore * 0.9),
          engagement: 80
        }
      });
    }
  } catch (err) {
    console.error("[updateTopicMastery] Failed to sync concept mastery:", err);
  }

  return progress;
}

/**
 * Records a quiz attempt, awards XP, and handles student leveling up.
 */
export async function recordQuizAttempt(studentId: string, quizId: string, score: number) {
  // FIXED: Returning the transaction block results safely
  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.quizAttempt.create({
      data: {
        studentId,
        quizId,
        score
      }
    });

    const xpReward = Math.round(score * 10);
    const profile = await tx.studentProfile.findUnique({
      where: { userId: studentId }
    });

    if (profile) {
      let newXp = profile.xpPoints + xpReward;
      let newLevel = profile.currentLevel;
      let requiredXp = newLevel * 1000;

      while (newXp >= requiredXp) {
        newXp -= requiredXp;
        newLevel += 1;
        requiredXp = newLevel * 1000;
      }

      await tx.studentProfile.update({
        where: { userId: studentId },
        data: {
          xpPoints: newXp,
          currentLevel: newLevel
        }
      });
    }

    return attempt;
  });
}

/**
 * Stores a dialogue entry from the AI Tutor chat.
 */
export async function saveTutorConversation(data: {
  studentId: string;
  sessionId: string;
  prompt: string;
  response: string;
}) {
  return prisma.aITutorConversation.create({
    data: {
      studentId: data.studentId,
      sessionId: data.sessionId,
      prompt: data.prompt,
      response: data.response
    }
  });
}

/**
 * Grants an achievement to a student, giving them an XP reward.
 */
export async function awardAchievement(studentId: string, achievementId: string) {
  // Check if already unlocked
  const existing = await prisma.studentAchievement.findUnique({
    where: {
      studentId_achievementId: {
        studentId,
        achievementId
      }
    }
  });

  if (existing) {
    return null;
  }

  // FIXED: Returning the transaction result cleanly removes out-of-scope variables
  return await prisma.$transaction(async (tx) => {
    const unlock = await tx.studentAchievement.create({
      data: {
        studentId,
        achievementId
      },
      include: {
        achievement: true
      }
    });

    const profile = await tx.studentProfile.findUnique({
      where: { userId: studentId }
    });

    if (profile) {
      let newXp = profile.xpPoints + unlock.achievement.xpReward;
      let newLevel = profile.currentLevel;
      let requiredXp = newLevel * 1000;

      while (newXp >= requiredXp) {
        newXp -= requiredXp;
        newLevel += 1;
        requiredXp = newLevel * 1000;
      }

      await tx.studentProfile.update({
        where: { userId: studentId },
        data: {
          xpPoints: newXp,
          currentLevel: newLevel
        }
      });
    }

    return unlock;
  });
}

/**
 * Helper function to update student profile XP and process level ups.
 */
async function addXpToStudent(studentId: string, xpAmount: number) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: studentId }
  });

  if (!profile) return;

  let newXp = profile.xpPoints + xpAmount;
  let newLevel = profile.currentLevel;
  let requiredXp = newLevel * 1000;

  while (newXp >= requiredXp) {
    newXp -= requiredXp;
    newLevel += 1;
    requiredXp = newLevel * 1000;
  }

  await prisma.studentProfile.update({
    where: { userId: studentId },
    data: {
      xpPoints: newXp,
      currentLevel: newLevel
    }
  });
}

/**
 * Returns the persisted learning-style scores for a given student + domain,
 * or `null` when no row exists yet. The caller is expected to fall back to
 * `initialLearningStyleProfile` from `services/learning-style-service.ts`
 * in that case (see usage in `ai-tutor-chat.tsx`).
 *
 * @param userId   the student's user id
 * @param domainType the `LearningProfile.domainType` value (defaults to
 *                   `"default"` for the single-profile case)
 */
export async function getLearningStyleProfile(
  userId: string,
  domainType = "default",
): Promise<
  | {
      visualScore: number;
      auditoryScore: number;
      kinestheticScore: number;
      lastUpdated: Date;
    }
  | null
> {
  const profile = await prisma.learningProfile.findUnique({
    where: {
      userId_domainType: { userId, domainType },
    },
    select: {
      visualScore: true,
      auditoryScore: true,
      kinestheticScore: true,
      updatedAt: true,
    },
  });

  if (!profile) return null;
  return {
    visualScore: profile.visualScore,
    auditoryScore: profile.auditoryScore,
    kinestheticScore: profile.kinestheticScore,
    lastUpdated: profile.updatedAt,
  };
}

/**
 * Persists the three learning-style scores for the given student + domain.
 *
 * Uses `upsert` on the `(userId, domainType)` unique key so the first save
 * creates a row with defaults inherited from the Prisma schema
 * (`currentLevel=1`, `currentXP=0`, etc.) — keeping the
 * `LearningProfile` schema's other fields intact for callers that already use
 * the row for level/xp tracking.
 *
 * The caller is expected to pass validated, already-normalised scores
 * (the `updateLearningStyleProfile` helper in
 * `services/learning-style-service.ts` normalises them); this function does
 * not re-clamp or re-normalise.
 *
 * @param userId    the student's user id
 * @param scores    the three style scores (clamped to [0, 100] before write)
 * @param domainType the `LearningProfile.domainType` value (defaults to
 *                   `"default"` for the single-profile case)
 */
export async function saveLearningStyleProfile(
  userId: string,
  scores: { visualScore: number; auditoryScore: number; kinestheticScore: number },
  domainType = "default",
): Promise<{ lastUpdated: Date }> {
  const visualScore = Math.max(0, Math.min(100, Math.round(scores.visualScore)));
  const auditoryScore = Math.max(0, Math.min(100, Math.round(scores.auditoryScore)));
  const kinestheticScore = Math.max(0, Math.min(100, Math.round(scores.kinestheticScore)));

  // `upsert` works around the case where the unique row has not been created
  // yet (the very first time a student saves a learning-style profile). In
  // that case the `create` branch inherits the schema defaults for
  // currentLevel / currentXP / etc.
  const profile = await prisma.learningProfile.upsert({
    where: { userId_domainType: { userId, domainType } },
    update: {
      visualScore,
      auditoryScore,
      kinestheticScore,
    },
    create: {
      userId,
      domainType,
      visualScore,
      auditoryScore,
      kinestheticScore,
    },
    select: { updatedAt: true },
  });

  return { lastUpdated: profile.updatedAt };
}