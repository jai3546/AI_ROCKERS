import { CONCEPT_DEFINITIONS } from "./concepts";

export interface ConceptNode {
  id: string;
  name: string;
  subject: string;
  mastery: number;
  confidence: number;
  retention: number;
  lastPracticed: string; // ISO date string
  prerequisites: string[];
  accuracy?: number;
  engagement?: number;
}

export const getInitialLearningGraph = (): ConceptNode[] => {
  // Let's create initial mock values for a typical student (e.g. S001)
  const initialValues: Record<string, { mastery: number; confidence: number; retention: number; lastPracticedOffsetDays: number }> = {
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

  return CONCEPT_DEFINITIONS.map((def) => {
    const mockVals = initialValues[def.id];
    let lastPracticedDate = "";
    
    if (mockVals) {
      const date = new Date(now);
      date.setDate(now.getDate() - mockVals.lastPracticedOffsetDays);
      lastPracticedDate = date.toISOString();
    } else {
      // Concept has not been practiced yet
      const date = new Date(now);
      date.setDate(now.getDate() - 30); // 30 days ago
      lastPracticedDate = date.toISOString();
    }

    return {
      id: def.id,
      name: def.name,
      subject: def.subject,
      mastery: mockVals ? mockVals.mastery : 0,
      confidence: mockVals ? mockVals.confidence : 0,
      retention: mockVals ? mockVals.retention : 0,
      lastPracticed: lastPracticedDate,
      prerequisites: def.prerequisites,
      accuracy: mockVals ? Math.round(mockVals.mastery * 0.9) : 0,
      engagement: mockVals ? 75 : 0,
    };
  });
};
