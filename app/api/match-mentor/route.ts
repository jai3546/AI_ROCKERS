import { NextResponse } from 'next/server';

type DemoStudent = {
  id: string;
  name: string;
  emotional_state: 'happy' | 'neutral' | 'stressed';
  subject_need: string;
  available_time: string;
  region: string;
  language: string;
  performance_level: 'high' | 'medium' | 'low';
  behavior: 'excellent' | 'good' | 'challenging';
  learning_style: 'visual' | 'auditory' | 'kinesthetic';
  class: string;
};

type DemoMentor = {
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

type DemoMatchResponse = {
  student: DemoStudent;
  best_match: DemoMentor;
  alternatives: DemoMentor[];
};

const demoMentor: DemoMentor = {
  id: 'M_DEMO_001',
  name: 'Dr. Asha Verma',
  avatar: 'AV',
  expertise: ['math', 'science', 'english'],
  available_time: ['morning', 'afternoon', 'evening'],
  region: ['punjab', 'haryana', 'tamil_nadu', 'karnataka'],
  language: ['english', 'hindi', 'punjabi', 'tamil'],
  specialization: ['algebra', 'learning strategy', 'exam prep'],
  experience_years: 12,
  teaching_style: 'interactive',
  student_performance_focus: 'medium',
  behavior_management: 'balanced',
  bio: 'Demo mentor for hackathon mode. Strong at helping students quickly improve confidence and exam readiness.',
};

const demoAlternativeMentor: DemoMentor = {
  id: 'M_DEMO_002',
  name: 'Prof. Kiran Rao',
  avatar: 'KR',
  expertise: ['history', 'english', 'science'],
  available_time: ['afternoon', 'evening'],
  region: ['maharashtra', 'karnataka'],
  language: ['english', 'hindi', 'marathi'],
  specialization: ['revision planning', 'concept clarity'],
  experience_years: 9,
  teaching_style: 'structured',
  student_performance_focus: 'medium',
  behavior_management: 'balanced',
  bio: 'Alternative demo mentor for hackathon mode with structured learning plans.',
};

function buildDemoStudent(studentId: string): DemoStudent {
  return {
    id: studentId,
    name: 'Demo Student',
    emotional_state: 'neutral',
    subject_need: 'math',
    available_time: 'evening',
    region: 'punjab',
    language: 'english',
    performance_level: 'medium',
    behavior: 'good',
    learning_style: 'visual',
    class: '8A',
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const studentId = url.searchParams.get('studentId');
  console.log('[match-mentor-demo] Received studentId', studentId);

  if (!studentId?.trim()) {
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
  }

  // Demo mode: bypass database lookup and always return hardcoded mentors.
  const response: DemoMatchResponse = {
    student: buildDemoStudent(studentId),
    best_match: demoMentor,
    alternatives: [demoAlternativeMentor],
  };

  return NextResponse.json(response);
}
