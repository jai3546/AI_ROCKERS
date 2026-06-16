import { ConceptNode } from "../data/learning-graph";

/**
 * Standard mastery formula:
 * mastery = accuracy * 0.5 + confidence * 0.2 + retention * 0.2 + engagement * 0.1
 * Clamped between 0 and 100.
 */
export function calculateMastery(
  accuracy: number,
  confidence: number,
  retention: number,
  engagement: number
): number {
  const score = accuracy * 0.5 + confidence * 0.2 + retention * 0.2 + engagement * 0.1;
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Applies forgetting curve logic.
 * Concepts lose retention dynamically over time (default 2% per day of inactivity).
 */
export function decayRetention(
  lastPracticedIso: string,
  currentRetention: number,
  decayRatePerDay: number = 2.0
): number {
  if (!lastPracticedIso) return currentRetention;

  const lastPracticed = new Date(lastPracticedIso);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastPracticed.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // If practiced less than an hour ago, no decay
  if (diffDays < 0.04) return currentRetention;

  const decayAmount = diffDays * decayRatePerDay;
  const newRetention = Math.max(0, currentRetention - decayAmount);

  return Math.round(newRetention);
}

export interface ActivityPayload {
  activityType: "quiz" | "flashcard" | "tutor" | "reading";
  score?: number;            // For quiz: points/questions correct
  total?: number;            // For quiz: total points/questions
  isKnown?: boolean;         // For flashcard: true if marked known
  confusionDetected?: boolean; // From emotion tracking
  responseTime?: number;     // In seconds
  repeatedMistakes?: number; // Mistake count
  engagement?: number;       // Custom engagement score (0-100)
}

/**
 * Processes a learning activity on a concept and returns the updated metrics.
 */
export function processActivity(
  node: ConceptNode,
  activity: ActivityPayload
): Partial<ConceptNode> {
  let accuracy = node.mastery === 0 ? 0 : (node.mastery * 0.8); // fallback initialization
  // Let's deduce prior accuracy from mastery or default
  if (node.mastery > 0) {
    // We try to approximate prior accuracy
    accuracy = node.mastery; 
  }
  
  let confidence = node.confidence;
  let retention = 100; // Reset retention to 100 on active practice
  let engagement = node.engagement !== undefined ? (node.engagement as number) : 50;

  const now = new Date().toISOString();

  switch (activity.activityType) {
    case "quiz":
      if (activity.score !== undefined && activity.total !== undefined && activity.total > 0) {
        const quizPct = (activity.score / activity.total) * 100;
        // Smoothed moving average for quiz accuracy
        accuracy = Math.round(accuracy * 0.4 + quizPct * 0.6);

        // Update confidence based on quiz performance
        if (quizPct >= 80) {
          confidence = Math.min(100, confidence + 12);
        } else if (quizPct < 50) {
          confidence = Math.max(0, confidence - 15);
        } else {
          confidence = Math.min(100, Math.max(0, confidence + 5));
        }

        // Adjust for response time and repeated mistakes
        if (activity.responseTime && activity.responseTime > 30) {
          // Slow response indicating struggle
          confidence = Math.max(0, confidence - 5);
        }
        if (activity.repeatedMistakes && activity.repeatedMistakes > 0) {
          confidence = Math.max(0, confidence - (activity.repeatedMistakes * 6));
        }
      }
      // Engagement for quiz is high
      engagement = Math.min(100, Math.max(60, (activity.engagement || 85)));
      break;

    case "flashcard":
      if (activity.isKnown !== undefined) {
        if (activity.isKnown) {
          confidence = Math.min(100, confidence + 10);
          accuracy = Math.min(100, accuracy * 0.7 + 30);
        } else {
          confidence = Math.max(0, confidence - 10);
          accuracy = Math.max(0, accuracy * 0.8);
        }
      }
      engagement = Math.min(100, Math.max(40, (activity.engagement || 75)));
      break;

    case "tutor":
      // AI Tutor interaction raises retention and provides engagement
      engagement = Math.min(100, Math.max(50, (activity.engagement || 80)));
      // Tutor sessions reinforce knowledge slightly increasing accuracy
      accuracy = Math.min(100, accuracy * 0.9 + 10);
      confidence = Math.min(100, confidence + 5);
      break;

    case "reading":
      engagement = Math.min(100, Math.max(30, (activity.engagement || 60)));
      accuracy = Math.min(100, accuracy * 0.95 + 5);
      break;
  }

  // Inject emotional confusion signals
  if (activity.confusionDetected) {
    confidence = Math.max(0, confidence - 15); // Reduce confidence
    // In addition, confusion signals decay retention slightly due to cognitive load
    retention = Math.max(50, retention - 20);
  }

  // Recalculate overall mastery
  const mastery = calculateMastery(accuracy, confidence, retention, engagement);

  return {
    accuracy,
    confidence,
    retention,
    engagement,
    mastery,
    lastPracticed: now,
  };
}
