-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "avatar" TEXT NOT NULL DEFAULT '👦🏽',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "userId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "xpPoints" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "emotionalState" TEXT,
    "subjectNeed" TEXT,
    "availableTime" TEXT,
    "region" TEXT,
    "language" TEXT,
    "performanceLevel" TEXT,
    "behavior" TEXT,
    "learningStyle" TEXT,
    "class" TEXT,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "userId" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availableTime" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "region" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "language" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specialization" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "teachingStyle" TEXT,
    "studentPerformanceFocus" TEXT,
    "behaviorManagement" TEXT,
    "bio" TEXT,
    "avatar" TEXT,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "EmotionLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "attentionScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "averageAttention" DOUBLE PRECISION NOT NULL,
    "averageEngagement" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "LearningSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficultyLevel" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTopicProgress" (
    "studentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "masteryScore" DOUBLE PRECISION NOT NULL,
    "revisionPriority" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentTopicProgress_pkey" PRIMARY KEY ("studentId","topicId")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "questions" TEXT,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AITutorConversation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AITutorConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAchievement" (
    "studentId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentAchievement_pkey" PRIMARY KEY ("studentId","achievementId")
);

-- CreateTable
CREATE TABLE "LearningProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domainType" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "currentXP" INTEGER NOT NULL DEFAULT 0,
    "dailyStreak" INTEGER NOT NULL DEFAULT 0,
    "lastLoginDate" TIMESTAMP(3),
    "syllabusPreference" TEXT NOT NULL DEFAULT 'General',
    "targetGoal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "domainType" TEXT NOT NULL,
    "levelGroup" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptRelationship" (
    "fromConceptId" TEXT NOT NULL,
    "toConceptId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'STRICT_PREREQUISITE',

    CONSTRAINT "ConceptRelationship_pkey" PRIMARY KEY ("fromConceptId","toConceptId")
);

-- CreateTable
CREATE TABLE "UserConceptMastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "retention" INTEGER NOT NULL DEFAULT 0,
    "accuracy" INTEGER NOT NULL DEFAULT 0,
    "engagement" INTEGER NOT NULL DEFAULT 0,
    "lastPracticed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserConceptMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "score" INTEGER,
    "totalScore" INTEGER,
    "responseTime" INTEGER,
    "confusionDetected" BOOLEAN NOT NULL DEFAULT false,
    "engagementScore" INTEGER NOT NULL DEFAULT 50,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasteryHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "averageMastery" INTEGER NOT NULL DEFAULT 0,
    "mathMastery" INTEGER NOT NULL DEFAULT 0,
    "scienceMastery" INTEGER NOT NULL DEFAULT 0,
    "socialMastery" INTEGER NOT NULL DEFAULT 0,
    "englishMastery" INTEGER NOT NULL DEFAULT 0,
    "customMasteryData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasteryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "recType" TEXT NOT NULL,
    "reason" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProfile_userId_domainType_key" ON "LearningProfile"("userId", "domainType");

-- CreateIndex
CREATE UNIQUE INDEX "UserConceptMastery_userId_conceptId_key" ON "UserConceptMastery"("userId", "conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "MasteryHistory_userId_date_key" ON "MasteryHistory"("userId", "date");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionLog" ADD CONSTRAINT "EmotionLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningSession" ADD CONSTRAINT "LearningSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTopicProgress" ADD CONSTRAINT "StudentTopicProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTopicProgress" ADD CONSTRAINT "StudentTopicProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITutorConversation" ADD CONSTRAINT "AITutorConversation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAchievement" ADD CONSTRAINT "StudentAchievement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAchievement" ADD CONSTRAINT "StudentAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProfile" ADD CONSTRAINT "LearningProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptRelationship" ADD CONSTRAINT "ConceptRelationship_fromConceptId_fkey" FOREIGN KEY ("fromConceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptRelationship" ADD CONSTRAINT "ConceptRelationship_toConceptId_fkey" FOREIGN KEY ("toConceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConceptMastery" ADD CONSTRAINT "UserConceptMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConceptMastery" ADD CONSTRAINT "UserConceptMastery_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningActivity" ADD CONSTRAINT "LearningActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningActivity" ADD CONSTRAINT "LearningActivity_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryHistory" ADD CONSTRAINT "MasteryHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedRecommendation" ADD CONSTRAINT "CachedRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedRecommendation" ADD CONSTRAINT "CachedRecommendation_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;
