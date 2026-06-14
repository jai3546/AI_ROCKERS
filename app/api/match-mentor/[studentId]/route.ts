import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type StudentResponse = {
  id: string;
  name: string;
  emotional_state: string;
  subject_need: string;
  available_time: string;
  region: string;
  language: string;
  performance_level: 'high' | 'medium' | 'low';
  behavior: 'excellent' | 'good' | 'challenging';
  learning_style: 'visual' | 'auditory' | 'kinesthetic';
  class: string;
};

type MentorResponse = {
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
  student_performance_focus: 'high' | 'medium' | 'low';
  behavior_management: 'strict' | 'balanced' | 'lenient';
  bio: string;
};

type MatchResponse = {
  student: StudentResponse;
  best_match: MentorResponse;
  alternatives: MentorResponse[];
};

function normalize(value: string): string {
  return (value || '').trim().toLowerCase();
}

function includesNormalized(values: string[], target: string): boolean {
  const normalizedTarget = normalize(target);
  return (values || []).some((value) => normalize(value) === normalizedTarget);
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

function buildMatchResult(student: StudentResponse, mentors: MentorResponse[]): MatchResponse {
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
  console.log('[match-mentor] Querying database for studentId:', studentId);

  if (!studentId) {
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
  }

  try {
    // 1. Fetch student from database
    const dbStudent = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: { user: true }
    });

    if (!dbStudent) {
      return NextResponse.json({ error: 'Student not found in database' }, { status: 404 });
    }

    // Map database student to student response type
    const student: StudentResponse = {
      id: dbStudent.userId,
      name: dbStudent.user.name,
      emotional_state: dbStudent.emotionalState || 'happy',
      subject_need: dbStudent.subjectNeed || 'math',
      available_time: dbStudent.availableTime || 'morning',
      region: dbStudent.region || 'general',
      language: dbStudent.language || 'english',
      performance_level: (dbStudent.performanceLevel as any) || 'medium',
      behavior: (dbStudent.behavior as any) || 'good',
      learning_style: (dbStudent.learningStyle as any) || 'visual',
      class: dbStudent.class || '8A'
    };

    // 2. Fetch all teachers from database
    const dbTeachers = await prisma.teacherProfile.findMany({
      include: { user: true }
    });

    const mentors: MentorResponse[] = dbTeachers.map(t => ({
      id: t.userId,
      name: t.user.name,
      avatar: t.avatar || 'MT',
      expertise: t.expertise,
      available_time: t.availableTime,
      region: t.region,
      language: t.language,
      specialization: t.specialization,
      experience_years: t.experienceYears,
      teaching_style: t.teachingStyle || 'interactive',
      student_performance_focus: (t.studentPerformanceFocus as any) || 'medium',
      behavior_management: (t.behaviorManagement as any) || 'balanced',
      bio: t.bio || ''
    }));

    if (mentors.length === 0) {
      return NextResponse.json({ error: 'No mentors found in database' }, { status: 404 });
    }

    // 3. Compute match result
    const result = buildMatchResult(student, mentors);
    console.log('[match-mentor] Returning database match result', {
      studentId,
      bestMatchId: result.best_match.id,
      alternativesCount: result.alternatives.length,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[match-mentor] Failed to compute database match result', { studentId, error });
    const message = error instanceof Error ? error.message : 'Failed to compute mentor matches';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
