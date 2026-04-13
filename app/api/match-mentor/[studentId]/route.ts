import { NextResponse } from 'next/server';
import studentsData from '../../../../data/students.json';
import mentorsData from '../../../../data/mentors.json';

type StudentData = (typeof studentsData)[number];
type MentorData = (typeof mentorsData)[number];

type StudentProfile = {
  name: string;
  performance_level: 'high' | 'medium' | 'low';
  behavior: 'excellent' | 'good' | 'challenging';
  learning_style: 'visual' | 'auditory' | 'kinesthetic';
  class: string;
};

type MentorProfile = {
  name: string;
  avatar: string;
  specialization: string[];
  experience_years: number;
  teaching_style: string;
  student_performance_focus: 'high' | 'medium' | 'low';
  behavior_management: 'strict' | 'balanced' | 'lenient';
  bio: string;
};

type StudentResponse = StudentData & StudentProfile;
type MentorResponse = MentorData & MentorProfile;

type MatchResponse = {
  student: StudentResponse;
  best_match: MentorResponse;
  alternatives: MentorResponse[];
};

const studentProfiles: Record<string, StudentProfile> = {
  S001: {
    name: 'Rahul Singh',
    performance_level: 'high',
    behavior: 'excellent',
    learning_style: 'visual',
    class: '8A',
  },
  S002: {
    name: 'Ananya Patel',
    performance_level: 'medium',
    behavior: 'good',
    learning_style: 'auditory',
    class: '7B',
  },
  S003: {
    name: 'Vikram Mehta',
    performance_level: 'medium',
    behavior: 'good',
    learning_style: 'kinesthetic',
    class: '9C',
  },
  S004: {
    name: 'Priya Sharma',
    performance_level: 'low',
    behavior: 'challenging',
    learning_style: 'visual',
    class: '6A',
  },
  S005: {
    name: 'Arjun Kumar',
    performance_level: 'high',
    behavior: 'excellent',
    learning_style: 'auditory',
    class: '10B',
  },
  S006: {
    name: 'Neha Kapoor',
    performance_level: 'low',
    behavior: 'challenging',
    learning_style: 'kinesthetic',
    class: '8A',
  },
  S007: {
    name: 'Rohan Malhotra',
    performance_level: 'medium',
    behavior: 'good',
    learning_style: 'visual',
    class: '9A',
  },
  S008: {
    name: 'Divya Nair',
    performance_level: 'high',
    behavior: 'excellent',
    learning_style: 'auditory',
    class: '7A',
  },
  S009: {
    name: 'Sanjay Reddy',
    performance_level: 'medium',
    behavior: 'good',
    learning_style: 'auditory',
    class: '8B',
  },
};

const mentorProfiles: Record<string, MentorProfile> = {
  M001: {
    name: 'Dr. Rajesh Kumar',
    avatar: 'RK',
    specialization: ['algebra', 'calculus', 'physics'],
    experience_years: 15,
    teaching_style: 'structured',
    student_performance_focus: 'high',
    behavior_management: 'strict',
    bio: 'Dr. Kumar is a former university professor with a PhD in Mathematics. He specializes in helping high-performing students excel in competitive exams and advanced topics.',
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
  },
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function includesNormalized(values: string[], target: string): boolean {
  const normalizedTarget = normalize(target);
  return values.some((value) => normalize(value) === normalizedTarget);
}

function getStudent(studentId: string): StudentResponse | null {
  const student = studentsData.find((entry) => entry.id === studentId);

  if (!student) {
    return null;
  }

  const profile = studentProfiles[student.id];

  if (!profile) {
    return null;
  }

  return { ...student, ...profile };
}

function getMentors(): MentorResponse[] {
  return mentorsData
    .map((mentor) => {
      const profile = mentorProfiles[mentor.id];

      if (!profile) {
        return null;
      }

      return { ...mentor, ...profile };
    })
    .filter((mentor): mentor is MentorResponse => mentor !== null);
}

function scoreMatch(student: StudentResponse, mentor: MentorResponse): number {
  let score = 0;

  if (includesNormalized(mentor.expertise, student.subject_need)) {
    score += 5;
  }

  if (mentor.specialization.some((specialization) => normalize(specialization).includes(normalize(student.subject_need)))) {
    score += 2;
  }

  if (includesNormalized(mentor.available_time, student.available_time)) {
    score += 2;
  }

  if (includesNormalized(mentor.region, student.region)) {
    score += 2;
  }

  if (includesNormalized(mentor.language, student.language)) {
    score += 4;
  }

  if (mentor.student_performance_focus === student.performance_level) {
    score += 2;
  }

  if (student.behavior === 'challenging' && mentor.behavior_management !== 'lenient') {
    score += 1;
  }

  if (student.learning_style === 'visual' && mentor.teaching_style === 'structured') {
    score += 1;
  }

  return score;
}

function buildMatchResult(student: StudentResponse): MatchResponse {
  const mentors = getMentors();
  const languageMatchedMentors = mentors.filter((mentor) => includesNormalized(mentor.language, student.language));
  const candidateMentors = languageMatchedMentors.length > 0 ? languageMatchedMentors : mentors;

  const rankedMentors = candidateMentors
    .map((mentor) => ({ mentor, score: scoreMatch(student, mentor) }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.mentor.id.localeCompare(right.mentor.id);
    });

  const [bestMatch, ...alternatives] = rankedMentors.map((entry) => entry.mentor);

  if (!bestMatch) {
    throw new Error('No mentors are configured for matching.');
  }

  return {
    student,
    best_match: bestMatch,
    alternatives,
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ studentId: string }> | { studentId: string } }
) {
  const params = await Promise.resolve(context.params);
  const studentId = params.studentId || new URL(request.url).searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
  }

  const student = getStudent(studentId);

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  try {
    return NextResponse.json(buildMatchResult(student));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to compute mentor matches';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
