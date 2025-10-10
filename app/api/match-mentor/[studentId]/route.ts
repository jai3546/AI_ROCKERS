import { NextRequest, NextResponse } from 'next/server';

// Types for the mentor matching API
interface Student {
  id: string;
  name: string;
  emotional_state: "happy" | "neutral" | "stressed";
  subject_need: string;
  available_time: string;
  region: string;
  language: string;
  performance_level: "high" | "medium" | "low";
  behavior: "excellent" | "good" | "challenging";
  learning_style: "visual" | "auditory" | "kinesthetic";
  class: string;
}

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  available_time: string[];
  region: string[];
  language: string[];
  specialization: string[];
  experience_years: number;
  teaching_style: string;
  student_performance_focus: "high" | "medium" | "low";
  behavior_management: "strict" | "balanced" | "lenient";
  bio: string;
}

// Mock student data
const students: Student[] = [
  {
    id: "S001",
    name: "Rahul Singh",
    emotional_state: "happy",
    subject_need: "math",
    available_time: "morning",
    region: "punjab",
    language: "punjabi",
    performance_level: "high",
    behavior: "excellent",
    learning_style: "visual",
    class: "8A"
  },
  {
    id: "S002",
    name: "Ananya Patel",
    emotional_state: "stressed",
    subject_need: "science",
    available_time: "evening",
    region: "tamil_nadu",
    language: "tamil",
    performance_level: "medium",
    behavior: "good",
    learning_style: "auditory",
    class: "7B"
  },
  {
    id: "S003",
    name: "Vikram Mehta",
    emotional_state: "neutral",
    subject_need: "history",
    available_time: "afternoon",
    region: "karnataka",
    language: "kannada",
    performance_level: "medium",
    behavior: "good",
    learning_style: "kinesthetic",
    class: "9C"
  },
  {
    id: "S004",
    name: "Priya Sharma",
    emotional_state: "stressed",
    subject_need: "english",
    available_time: "night",
    region: "punjab",
    language: "punjabi",
    performance_level: "low",
    behavior: "challenging",
    learning_style: "visual",
    class: "6A"
  },
  {
    id: "S005",
    name: "Arjun Kumar",
    emotional_state: "happy",
    subject_need: "math",
    available_time: "evening",
    region: "kerala",
    language: "malayalam",
    performance_level: "high",
    behavior: "excellent",
    learning_style: "auditory",
    class: "10B"
  },
  {
    id: "S006",
    name: "Neha Kapoor",
    emotional_state: "stressed",
    subject_need: "science",
    available_time: "morning",
    region: "punjab",
    language: "punjabi",
    performance_level: "low",
    behavior: "challenging",
    learning_style: "kinesthetic",
    class: "8A"
  },
  {
    id: "S007",
    name: "Rohan Malhotra",
    emotional_state: "neutral",
    subject_need: "english",
    available_time: "afternoon",
    region: "maharashtra",
    language: "marathi",
    performance_level: "medium",
    behavior: "good",
    learning_style: "visual",
    class: "9A"
  },
  {
    id: "S008",
    name: "Divya Nair",
    emotional_state: "happy",
    subject_need: "history",
    available_time: "night",
    region: "gujarat",
    language: "gujarati",
    performance_level: "high",
    behavior: "excellent",
    learning_style: "auditory",
    class: "7A"
  }
];

// Mock mentor data
const mentors: Mentor[] = [
  {
    id: "M001",
    name: "Dr. Rajesh Kumar",
    avatar: "RK",
    expertise: ["math", "science"],
    specialization: ["algebra", "calculus", "physics"],
    available_time: ["morning", "afternoon"],
    region: ["punjab", "haryana"],
    language: ["punjabi", "english"],
    experience_years: 15,
    teaching_style: "structured",
    student_performance_focus: "high",
    behavior_management: "strict",
    bio: "Dr. Kumar is a former university professor with a PhD in Mathematics. He specializes in helping high-performing students excel in competitive exams and advanced topics."
  },
  {
    id: "M002",
    name: "Priya Venkatesh",
    avatar: "PV",
    expertise: ["science", "english"],
    specialization: ["biology", "chemistry", "literature"],
    available_time: ["evening", "night"],
    region: ["tamil_nadu", "kerala"],
    language: ["tamil", "malayalam", "english"],
    experience_years: 8,
    teaching_style: "interactive",
    student_performance_focus: "medium",
    behavior_management: "balanced",
    bio: "Priya is a patient and encouraging mentor who excels at helping average students improve their grades through interactive learning methods."
  },
  {
    id: "M003",
    name: "Arun Sharma",
    avatar: "AS",
    expertise: ["history", "english"],
    specialization: ["world history", "creative writing", "grammar"],
    available_time: ["afternoon", "evening"],
    region: ["karnataka", "maharashtra"],
    language: ["kannada", "marathi", "english"],
    experience_years: 10,
    teaching_style: "storytelling",
    student_performance_focus: "low",
    behavior_management: "lenient",
    bio: "Arun specializes in making difficult subjects engaging through storytelling. He has a special talent for helping struggling students build confidence and improve gradually."
  },
  {
    id: "M004",
    name: "Dr. Meera Patel",
    avatar: "MP",
    expertise: ["math", "science", "history"],
    specialization: ["geometry", "physics", "ancient history"],
    available_time: ["morning", "evening", "night"],
    region: ["punjab", "haryana", "karnataka"],
    language: ["punjabi", "kannada", "english", "hindi"],
    experience_years: 20,
    teaching_style: "analytical",
    student_performance_focus: "high",
    behavior_management: "strict",
    bio: "Dr. Patel has extensive experience preparing students for competitive exams. She demands excellence and has a proven track record with high-performing students."
  },
  {
    id: "M005",
    name: "Vikram Malhotra",
    avatar: "VM",
    expertise: ["english", "history"],
    specialization: ["literature", "essay writing", "modern history"],
    available_time: ["morning", "afternoon", "evening"],
    region: ["gujarat", "maharashtra"],
    language: ["gujarati", "marathi", "hindi"],
    experience_years: 12,
    teaching_style: "discussion-based",
    student_performance_focus: "medium",
    behavior_management: "balanced",
    bio: "Vikram uses discussion-based learning to help students develop critical thinking skills. He's particularly good with students who have behavioral challenges."
  }
];

// Calculate match score between student and mentor
function scoreMatch(student: Student, mentor: Mentor): number {
  let score = 0;

  // Subject match (+3)
  if (mentor.expertise.includes(student.subject_need)) {
    score += 3;

    // Additional points if mentor specializes in the subject
    if (mentor.specialization.some(spec => spec.includes(student.subject_need))) {
      score += 1;
    }
  }

  // Time match (+2)
  if (mentor.available_time.includes(student.available_time)) {
    score += 2;
  }

  // Region match (+1)
  if (mentor.region.includes(student.region)) {
    score += 1;
  }

  // Language match (+1)
  if (mentor.language.includes(student.language)) {
    score += 1;
  }

  // Performance level match (+3)
  // Match high-performing students with mentors who focus on high performance
  if (student.performance_level === mentor.student_performance_focus) {
    score += 3;
  } else if (
    (student.performance_level === "high" && mentor.student_performance_focus === "medium") ||
    (student.performance_level === "medium" && mentor.student_performance_focus === "high") ||
    (student.performance_level === "medium" && mentor.student_performance_focus === "low") ||
    (student.performance_level === "low" && mentor.student_performance_focus === "medium")
  ) {
    // Partial match
    score += 1;
  }

  // Behavior match (+2)
  // Match challenging behavior with appropriate management style
  if (student.behavior === "challenging" && mentor.behavior_management === "strict") {
    score += 2;
  } else if (student.behavior === "good" && mentor.behavior_management === "balanced") {
    score += 2;
  } else if (student.behavior === "excellent" && mentor.behavior_management === "lenient") {
    score += 2;
  }

  // Emotional state consideration (+1 if stressed)
  if (student.emotional_state === "stressed") {
    // Stressed students do better with balanced management
    if (mentor.behavior_management === "balanced") {
      score += 2;
    } else {
      score += 1;
    }
  }

  // Experience bonus (up to +2)
  // More experienced mentors get a slight advantage
  if (mentor.experience_years >= 15) {
    score += 2;
  } else if (mentor.experience_years >= 10) {
    score += 1;
  }

  return score;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;

    // Find the student by ID
    const student = students.find(s => s.id === studentId);
    if (!student) {
      return NextResponse.json(
        { error: `Student with ID ${studentId} not found` },
        { status: 404 }
      );
    }

    // Score all mentors
    const scoredMentors = mentors.map(mentor => ({
      mentor,
      score: scoreMatch(student, mentor)
    }));

    // Sort mentors by score (descending)
    scoredMentors.sort((a, b) => b.score - a.score);

    // Get the best match and top 2 alternatives
    const bestMatch = scoredMentors[0]?.mentor;
    const alternatives = scoredMentors.slice(1, 3).map(m => m.mentor);

    return NextResponse.json({
      student,
      best_match: bestMatch,
      alternatives
    });
  } catch (error) {
    console.error('Error in mentor matching API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
