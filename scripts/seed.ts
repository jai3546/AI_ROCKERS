import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { allQuizQuestions } from "../data/quiz-questions";
import { allFlashcards } from "../data/flashcards";
import { CONCEPT_DEFINITIONS } from "../data/concepts";
import * as fs from "fs";
import * as path from "path";

// Initialize Prisma client with adapter-pg for PostgreSQL compatibility in scripts
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is required to run the seed script.");
  process.exit(1);
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Mock data helpers
const demoCredentials = {
  "Class 6": [
    { id: "demo-6-1", name: "Arjun Kumar", role: "student", avatar: "👦🏽" },
    { id: "demo-6-2", name: "Priya Singh", role: "student", avatar: "👧🏽" },
  ],
  "Class 7": [
    { id: "demo-7-1", name: "Rahul Sharma", role: "student", avatar: "👦🏽" },
    { id: "demo-7-2", name: "Ananya Patel", role: "student", avatar: "👧🏽" },
  ],
  "Class 8": [
    { id: "demo-8-1", name: "Vikram Reddy", role: "student", avatar: "👦🏽" },
    { id: "demo-8-2", name: "Meera Gupta", role: "student", avatar: "👧🏽" },
  ],
  "Class 9": [
    { id: "demo-9-1", name: "Aditya Verma", role: "student", avatar: "👦🏽" },
    { id: "demo-9-2", name: "Sneha Desai", role: "student", avatar: "👧🏽" },
  ],
  "Class 10": [
    { id: "demo-10-1", name: "Rohan Malhotra", role: "student", avatar: "👦🏽" },
    { id: "demo-10-2", name: "Neha Kapoor", role: "student", avatar: "👧🏽" },
  ],
  "Class 11": [
    { id: "demo-11-1", name: "Karthik Iyer", role: "student", avatar: "👦🏽" },
    { id: "demo-11-2", name: "Divya Nair", role: "student", avatar: "👧🏽" },
  ],
  "Class 12": [
    { id: "demo-12-1", name: "Aryan Choudhury", role: "student", avatar: "👦🏽" },
    { id: "demo-12-2", name: "Riya Mehta", role: "student", avatar: "👧🏽" },
  ],
  "Teacher": [
    { id: "demo-t-1", name: "Mr. Rajesh Kumar", role: "teacher", avatar: "👨🏽‍🏫" },
    { id: "demo-t-2", name: "Mrs. Sunita Sharma", role: "teacher", avatar: "👩🏽‍🏫" },
  ],
};

const studentProfilesMock: Record<string, any> = {
  S001: { name: 'Rahul Singh', performance_level: 'high', behavior: 'excellent', learning_style: 'visual', class: '8A', grade: "Class 8", school: "VidyAi Academy" },
  S002: { name: 'Ananya Patel', performance_level: 'medium', behavior: 'good', learning_style: 'auditory', class: '7B', grade: "Class 7", school: "VidyAi Academy" },
  S003: { name: 'Vikram Mehta', performance_level: 'medium', behavior: 'good', learning_style: 'kinesthetic', class: '9C', grade: "Class 9", school: "VidyAi Academy" },
  S004: { name: 'Priya Sharma', performance_level: 'low', behavior: 'challenging', learning_style: 'visual', class: '6A', grade: "Class 6", school: "VidyAi Academy" },
  S005: { name: 'Arjun Kumar', performance_level: 'high', behavior: 'excellent', learning_style: 'auditory', class: '10B', grade: "Class 10", school: "VidyAi Academy" },
  S006: { name: 'Neha Kapoor', performance_level: 'low', behavior: 'challenging', learning_style: 'kinesthetic', class: '8A', grade: "Class 8", school: "VidyAi Academy" },
  S007: { name: 'Rohan Malhotra', performance_level: 'medium', behavior: 'good', learning_style: 'visual', class: '9A', grade: "Class 9", school: "VidyAi Academy" },
  S008: { name: 'Divya Nair', performance_level: 'high', behavior: 'excellent', learning_style: 'auditory', class: '7A', grade: "Class 7", school: "VidyAi Academy" },
  S009: { name: 'Sanjay Reddy', performance_level: 'medium', behavior: 'good', learning_style: 'auditory', class: '8B', grade: "Class 8", school: "VidyAi Academy" },
};

const mentorProfilesMock: Record<string, any> = {
  M001: {
    name: 'Dr. Rajesh Kumar',
    avatar: 'RK',
    specialization: ['algebra', 'calculus', 'physics'],
    experience_years: 15,
    teaching_style: 'structured',
    student_performance_focus: 'high',
    behavior_management: 'strict',
    bio: 'Dr. Kumar is a former university professor with a PhD in Mathematics. He specializes in helping high-performing students excel in competitive exams and advanced topics.',
    school: "VidyAi Academy",
    department: "Mathematics"
  },
  M002: {
    name: 'Priya Venkatesh',
    avatar: 'PV',
    specialization: ['biology', 'chemistry', 'literature'],
    experience_years: 8,
    teaching_style: 'interactive',
    student_performance_focus: 'medium',
    behavior_management: 'balanced',
    bio: 'Priya is a patient and encouraging mentor who excels at helping average students improve their grades through interactive learning methods.',
    school: "VidyAi Academy",
    department: "Science"
  },
  M003: {
    name: 'Arun Sharma',
    avatar: 'AS',
    specialization: ['world history', 'creative writing', 'grammar'],
    experience_years: 10,
    teaching_style: 'storytelling',
    student_performance_focus: 'low',
    behavior_management: 'lenient',
    bio: 'Arun specializes in making difficult subjects engaging through storytelling. He has a special talent for helping struggling students build confidence and improve gradually.',
    school: "VidyAi Academy",
    department: "Social Studies"
  },
  M004: {
    name: 'Dr. Meera Patel',
    avatar: 'MP',
    specialization: ['geometry', 'physics', 'ancient history'],
    experience_years: 20,
    teaching_style: 'analytical',
    student_performance_focus: 'high',
    behavior_management: 'strict',
    bio: 'Dr. Patel has extensive experience preparing students for competitive exams. She demands excellence and has a proven track record with high-performing students.',
    school: "VidyAi Academy",
    department: "Physics"
  },
  M005: {
    name: 'Vikram Malhotra',
    avatar: 'VM',
    specialization: ['literature', 'essay writing', 'modern history'],
    experience_years: 12,
    teaching_style: 'discussion-based',
    student_performance_focus: 'medium',
    behavior_management: 'balanced',
    bio: "Vikram uses discussion-based learning to help students develop critical thinking skills. He's particularly good with students who have behavioral challenges.",
    school: "VidyAi Academy",
    department: "English"
  },
  M006: {
    name: 'Dr. Lakshmi Narayan',
    avatar: 'LN',
    specialization: ['physics', 'chemistry', 'algebra'],
    experience_years: 14,
    teaching_style: 'interactive',
    student_performance_focus: 'medium',
    behavior_management: 'balanced',
    bio: 'Dr. Narayan is a dedicated mentor experienced in science and math, focusing on interactive teaching and improving student engagement.',
    school: "VidyAi Academy",
    department: "Science"
  },
  M007: {
    name: 'Ms. Anjali Rao',
    avatar: 'AR',
    specialization: ['algebra', 'history', 'conceptual learning'],
    experience_years: 9,
    teaching_style: 'supportive',
    student_performance_focus: 'medium',
    behavior_management: 'balanced',
    bio: 'Ms. Rao blends practical examples with steady guidance to help students build confidence across multiple subjects.',
    school: "VidyAi Academy",
    department: "Mathematics"
  },
  M008: {
    name: 'Prof. Suresh Iyer',
    avatar: 'SI',
    specialization: ['science communication', 'literature', 'social studies'],
    experience_years: 18,
    teaching_style: 'exploratory',
    student_performance_focus: 'high',
    behavior_management: 'balanced',
    bio: 'Prof. Iyer is known for connecting concepts across disciplines and helping students learn through discussion and exploration.',
    school: "VidyAi Academy",
    department: "Social Studies"
  },
};

const achievementsMock = [
  { id: "quiz-bronze", title: "Quiz Novice", description: "Complete 1 quiz with a score of 60% or higher", xpReward: 50 },
  { id: "quiz-silver", title: "Quiz Apprentice", description: "Complete 3 quizzes with a score of 70% or higher", xpReward: 100 },
  { id: "quiz-gold", title: "Quiz Master", description: "Complete 5 quizzes with a score of 80% or higher", xpReward: 200 },
  { id: "science-bronze", title: "Science Novice", description: "Complete a Science quiz with 70% or higher", xpReward: 75 },
  { id: "math-bronze", title: "Math Novice", description: "Complete a Math quiz with 70% or higher", xpReward: 75 },
  { id: "flashcard-bronze", title: "Flashcard Beginner", description: "Review 10 flashcards", xpReward: 30 },
  { id: "flashcard-silver", title: "Flashcard Enthusiast", description: "Review 50 flashcards", xpReward: 100 },
  { id: "streak-bronze", title: "3-Day Streak", description: "Log in for 3 consecutive days", xpReward: 30 },
  { id: "streak-silver", title: "7-Day Streak", description: "Log in for 7 consecutive days", xpReward: 100 },
  { id: "streak-gold", title: "30-Day Streak", description: "Log in for 30 consecutive days", xpReward: 300 }
];

async function main() {
  console.log("Seeding PostgreSQL Database...");

  // 1. Seed Achievements
  console.log("Seeding achievements...");
  for (const ach of achievementsMock) {
    await prisma.achievement.upsert({
      where: { id: ach.id },
      update: { title: ach.title, description: ach.description, xpReward: ach.xpReward },
      create: { id: ach.id, title: ach.title, description: ach.description, xpReward: ach.xpReward }
    });
  }

  // 2. Seed Topics (from concepts.ts)
  console.log("Seeding topics...");
  for (const concept of CONCEPT_DEFINITIONS) {
    // Map subject to make difficulty level readable
    let difficulty = "medium";
    if (concept.id.includes("foundations") || concept.id.includes("basic") || concept.id.includes("syntax")) {
      difficulty = "easy";
    } else if (concept.id.includes("advanced") || concept.id.includes("quadratic")) {
      difficulty = "hard";
    }
    
    await prisma.topic.upsert({
      where: { id: concept.id },
      update: {
        name: concept.name,
        description: concept.description,
        difficultyLevel: difficulty
      },
      create: {
        id: concept.id,
        name: concept.name,
        description: concept.description,
        difficultyLevel: difficulty
      }
    });

    // Seed compatibility Concept model too
    await prisma.concept.upsert({
      where: { id: concept.id },
      update: { name: concept.name, description: concept.description, subject: concept.subject, domainType: "SCHOOL" },
      create: { id: concept.id, name: concept.name, description: concept.description, subject: concept.subject, domainType: "SCHOOL" }
    });
  }

  // Seed compatibility prerequisites
  for (const concept of CONCEPT_DEFINITIONS) {
    for (const prereqId of concept.prerequisites) {
      await prisma.conceptRelationship.upsert({
        where: {
          fromConceptId_toConceptId: {
            fromConceptId: prereqId,
            toConceptId: concept.id
          }
        },
        update: {},
        create: {
          fromConceptId: prereqId,
          toConceptId: concept.id,
          relationType: "STRICT_PREREQUISITE"
        }
      });
    }
  }

  // 3. Seed Flashcards
  console.log("Seeding flashcards...");
  // Mapping helpers to match flashcard to correct topicId
  const getTopicIdForFlashcard = (fc: typeof allFlashcards[number]) => {
    const question = fc.front.toLowerCase();
    if (question.includes("photosynthesis")) return "photosynthesis";
    if (question.includes("states of matter")) return "states-of-matter";
    if (question.includes("area of a circle")) return "advanced-geometry";
    if (question.includes("pythagorean")) return "advanced-geometry";
    if (question.includes("parts of speech")) return "grammar-syntax";
    if (question.includes("metaphor") || question.includes("simile")) return "grammar-syntax";
    if (question.includes("rivers in andhra")) return "geography-rivers";
    if (question.includes("state animal of andhra")) return "ap-history";
    if (question.includes("state bird of andhra")) return "ap-history";
    if (question.includes("state flower of andhra")) return "ap-history";
    if (question.includes("crops grown in andhra")) return "ap-history";
    if (question.includes("state animal of telangana")) return "telangana-history";
    if (question.includes("state bird of telangana")) return "telangana-history";
    if (question.includes("state flower of telangana")) return "telangana-history";
    if (question.includes("state tree of telangana")) return "telangana-history";
    if (question.includes("festivals celebrated in telangana")) return "telangana-history";
    if (question.includes("chemical changes")) return "chemistry-foundations";
    if (question.includes("fundamental rights")) return "indian-history";
    if (question.includes("energy")) return "physics-foundations";
    if (question.includes("democracy")) return "indian-history";
    
    // Fallbacks
    if (fc.subject === "Science") return "states-of-matter";
    if (fc.subject === "Math") return "algebra-foundations";
    if (fc.subject === "English") return "grammar-syntax";
    return "geography-rivers";
  };

  for (const fc of allFlashcards) {
    const topicId = getTopicIdForFlashcard(fc);
    await prisma.flashcard.upsert({
      where: { id: fc.id },
      update: {
        question: fc.front,
        answer: fc.back,
        topicId: topicId
      },
      create: {
        id: fc.id,
        question: fc.front,
        answer: fc.back,
        topicId: topicId
      }
    });
  }

  // 4. Seed Quizzes
  console.log("Seeding quizzes...");
  // Group questions by unique topic
  const questionsByTopic: Record<string, typeof allQuizQuestions> = {};
  for (const q of allQuizQuestions) {
    if (!questionsByTopic[q.topic]) {
      questionsByTopic[q.topic] = [];
    }
    questionsByTopic[q.topic].push(q);
  }

  // Map topic text name to Topic model ID
  const mapTopicTextToId = (topicText: string): string => {
    const text = topicText.toLowerCase();
    if (text.includes("photosynthesis")) return "photosynthesis";
    if (text.includes("space") || text.includes("astronomy")) return "space-astronomy";
    if (text.includes("human anatomy")) return "human-anatomy";
    if (text.includes("geometry")) return "basic-geometry";
    if (text.includes("literature")) return "literature";
    if (text.includes("rivers") || text.includes("geography & rivers")) return "geography-rivers";
    if (text.includes("art") || text.includes("culture")) return "art-culture";
    if (text.includes("temples")) return "art-culture";
    if (text.includes("agriculture")) return "plant-biology";
    if (text.includes("history")) return "indian-history";
    if (text.includes("zoology")) return "plant-biology";
    if (text.includes("irrigation")) return "geography-rivers";
    if (text.includes("chemistry")) return "chemistry-foundations";
    if (text.includes("algebra")) return "algebra-foundations";
    if (text.includes("physics")) return "physics-foundations";
    return "states-of-matter";
  };

  let quizIndex = 1;
  for (const [topicText, questions] of Object.entries(questionsByTopic)) {
    const topicId = mapTopicTextToId(topicText);
    const quizId = `quiz-${topicId}`;
    await prisma.quiz.upsert({
      where: { id: quizId },
      update: {
        title: `${topicText} Quiz`,
        topicId: topicId,
        questions: JSON.stringify(questions)
      },
      create: {
        id: quizId,
        title: `${topicText} Quiz`,
        topicId: topicId,
        questions: JSON.stringify(questions)
      }
    });
    quizIndex++;
  }

  // 5. Seed Students & Mentors (mock data)
  console.log("Seeding students and mentors...");

  // Seed students S001-S009 from students.json
  const studentsPath = path.join(process.cwd(), "data", "students.json");
  const mentorsPath = path.join(process.cwd(), "data", "mentors.json");

  let studentsData = [];
  let mentorsData = [];

  if (fs.existsSync(studentsPath)) {
    studentsData = JSON.parse(fs.readFileSync(studentsPath, "utf-8"));
  }
  if (fs.existsSync(mentorsPath)) {
    mentorsData = JSON.parse(fs.readFileSync(mentorsPath, "utf-8"));
  }

  for (const student of studentsData) {
    const profileMock = studentProfilesMock[student.id] || {
      name: `Student ${student.id}`,
      grade: "Class 8",
      school: "VidyAi Academy",
      class: "8A"
    };

    // Create User
    await prisma.user.upsert({
      where: { id: student.id },
      update: {
        name: profileMock.name,
        email: `${student.id.toLowerCase()}@vidyai.com`,
        role: "student",
        preferredLanguage: student.language || "en"
      },
      create: {
        id: student.id,
        name: profileMock.name,
        email: `${student.id.toLowerCase()}@vidyai.com`,
        role: "student",
        preferredLanguage: student.language || "en"
      }
    });

    // Create StudentProfile
    await prisma.studentProfile.upsert({
      where: { userId: student.id },
      update: {
        grade: profileMock.grade,
        school: profileMock.school,
        class: profileMock.class,
        emotionalState: student.emotional_state,
        subjectNeed: student.subject_need,
        availableTime: student.available_time,
        region: student.region,
        language: student.language,
        performanceLevel: profileMock.performance_level || "medium",
        behavior: profileMock.behavior || "good",
        learningStyle: profileMock.learning_style || "visual",
        xpPoints: 300,
        currentLevel: 2
      },
      create: {
        userId: student.id,
        grade: profileMock.grade,
        school: profileMock.school,
        class: profileMock.class,
        emotionalState: student.emotional_state,
        subjectNeed: student.subject_need,
        availableTime: student.available_time,
        region: student.region,
        language: student.language,
        performanceLevel: profileMock.performance_level || "medium",
        behavior: profileMock.behavior || "good",
        learningStyle: profileMock.learning_style || "visual",
        xpPoints: 300,
        currentLevel: 2
      }
    });
  }

  // Seed mentors M001-M008
  for (const mentor of mentorsData) {
    const profileMock = mentorProfilesMock[mentor.id] || {
      name: `Mentor ${mentor.id}`,
      school: "VidyAi Academy",
      department: "General Studies",
      avatar: "MT",
      bio: "Coaching and training students."
    };

    // Create User
    await prisma.user.upsert({
      where: { id: mentor.id },
      update: {
        name: profileMock.name,
        email: `${mentor.id.toLowerCase()}@vidyai.com`,
        role: "teacher"
      },
      create: {
        id: mentor.id,
        name: profileMock.name,
        email: `${mentor.id.toLowerCase()}@vidyai.com`,
        role: "teacher"
      }
    });

    // Create TeacherProfile
    await prisma.teacherProfile.upsert({
      where: { userId: mentor.id },
      update: {
        school: profileMock.school,
        department: profileMock.department,
        expertise: mentor.expertise,
        availableTime: mentor.available_time,
        region: mentor.region,
        language: mentor.language,
        specialization: profileMock.specialization || [],
        experienceYears: profileMock.experience_years || 5,
        teachingStyle: profileMock.teaching_style || "interactive",
        studentPerformanceFocus: profileMock.student_performance_focus || "medium",
        behaviorManagement: profileMock.behavior_management || "balanced",
        bio: profileMock.bio,
        avatar: profileMock.avatar
      },
      create: {
        userId: mentor.id,
        school: profileMock.school,
        department: profileMock.department,
        expertise: mentor.expertise,
        availableTime: mentor.available_time,
        region: mentor.region,
        language: mentor.language,
        specialization: profileMock.specialization || [],
        experienceYears: profileMock.experience_years || 5,
        teachingStyle: profileMock.teaching_style || "interactive",
        studentPerformanceFocus: profileMock.student_performance_focus || "medium",
        behaviorManagement: profileMock.behavior_management || "balanced",
        bio: profileMock.bio,
        avatar: profileMock.avatar
      }
    });
  }

  // Seed Demo Users (for login screen role selections)
  console.log("Seeding demo login users...");
  for (const [classGroup, users] of Object.entries(demoCredentials)) {
    for (const u of users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {
          name: u.name,
          email: `${u.id.toLowerCase()}@vidyai.com`,
          role: u.role,
          avatar: u.avatar
        },
        create: {
          id: u.id,
          name: u.name,
          email: `${u.id.toLowerCase()}@vidyai.com`,
          role: u.role,
          avatar: u.avatar
        }
      });

      if (u.role === "student") {
        await prisma.studentProfile.upsert({
          where: { userId: u.id },
          update: {
            grade: classGroup,
            school: "Demo Public School",
            class: "A",
            streakCount: 5,
            xpPoints: 750,
            currentLevel: 5,
            availableTime: "morning",
            region: "punjab",
            language: "english",
            performanceLevel: "medium",
            behavior: "good",
            learningStyle: "visual"
          },
          create: {
            userId: u.id,
            grade: classGroup,
            school: "Demo Public School",
            class: "A",
            streakCount: 5,
            xpPoints: 750,
            currentLevel: 5,
            availableTime: "morning",
            region: "punjab",
            language: "english",
            performanceLevel: "medium",
            behavior: "good",
            learningStyle: "visual"
          }
        });
      } else if (u.role === "teacher") {
        await prisma.teacherProfile.upsert({
          where: { userId: u.id },
          update: {
            school: "Demo Public School",
            department: classGroup === "Teacher" ? "Science" : classGroup,
            expertise: ["math", "science", "english"],
            availableTime: ["morning", "afternoon"],
            region: ["punjab"],
            language: ["english", "hindi"]
          },
          create: {
            userId: u.id,
            school: "Demo Public School",
            department: classGroup === "Teacher" ? "Science" : classGroup,
            expertise: ["math", "science", "english"],
            availableTime: ["morning", "afternoon"],
            region: ["punjab"],
            language: ["english", "hindi"]
          }
        });
      }
    }
  }

  console.log("Database seeded successfully! 🌱");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
