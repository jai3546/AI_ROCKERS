import { ConceptNode } from "../data/learning-graph";

export interface Recommendations {
  weakConcepts: ConceptNode[];
  revisionPriorities: {
    node: ConceptNode;
    reason: string;
    priorityScore: number; // Higher means more urgent
  }[];
  nextTopics: {
    node: ConceptNode;
    reason: string;
  }[];
}

/**
 * Generate cognitive recommendations for a student based on their graph state
 */
export function generateRecommendations(graph: ConceptNode[]): Recommendations {
  // Classification
  const weakConcepts = graph.filter((node) => node.mastery > 0 && node.mastery < 50);
  const improvingConcepts = graph.filter((node) => node.mastery >= 50 && node.mastery <= 75);
  const strongConcepts = graph.filter((node) => node.mastery > 75);

  // Helper map for fast lookup
  const nodeMap = new Map<string, ConceptNode>();
  for (const node of graph) {
    nodeMap.set(node.id, node);
  }

  // 1. Calculate Revision Priorities
  // Priorities are based on: low retention, weak mastery, and being a prerequisite for other topics
  const revisionPriorities = graph
    .filter((node) => node.mastery > 0) // only concepts they have actually started
    .map((node) => {
      let priorityScore = 0;
      let reason = "";

      // Low retention penalty
      if (node.retention < 60) {
        priorityScore += (60 - node.retention) * 1.5;
        reason = "Retention has decayed due to lack of recent practice.";
      }

      // Weak mastery penalty
      if (node.mastery < 50) {
        priorityScore += (50 - node.mastery) * 2.0;
        reason = reason || "Mastery is low. Focus on strengthening foundations.";
      } else if (node.mastery < 70) {
        priorityScore += (70 - node.mastery) * 0.8;
        reason = reason || "Improving. Practice once more to lock in mastery.";
      }

      // Check if this is a prerequisite for other concepts that are locked or struggling
      const dependentNodes = graph.filter((d) => d.prerequisites.includes(node.id));
      const hasUnmetDependents = dependentNodes.some((d) => d.mastery < 50);

      if (dependentNodes.length > 0) {
        priorityScore += dependentNodes.length * 10;
        if (hasUnmetDependents) {
          priorityScore += 15;
          reason = `Critical foundation. This is required for upcoming topics like ${dependentNodes.map(n => n.name).join(", ")}.`;
        }
      }

      return {
        node,
        reason: reason || "Scheduled review for spacing effect.",
        priorityScore: Math.round(priorityScore)
      };
    })
    .filter((item) => item.priorityScore > 10) // Filter out trivial priorities
    .sort((a, b) => b.priorityScore - a.priorityScore);

  // 2. Next Topic Suggestions
  // A topic is ready for study if:
  // - Current mastery is low (< 75)
  // - ALL prerequisites have decent mastery (>= 60)
  // - If it has no prerequisites and mastery is 0, it's a prime starting candidate
  const nextTopics = graph
    .filter((node) => node.mastery < 75)
    .map((node) => {
      // Check if all prerequisites are completed
      let prereqsMet = true;
      const unmetPrereqs: string[] = [];

      for (const reqId of node.prerequisites) {
        const reqNode = nodeMap.get(reqId);
        if (!reqNode || reqNode.mastery < 60) {
          prereqsMet = false;
          if (reqNode) {
            unmetPrereqs.push(reqNode.name);
          }
        }
      }

      if (!prereqsMet) return null;

      // Determine reason
      let reason = "";
      if (node.mastery === 0) {
        if (node.prerequisites.length > 0) {
          reason = `Recommended because you have mastered the prerequisites: ${node.prerequisites.map(id => nodeMap.get(id)?.name).join(", ")}.`;
        } else {
          reason = "Great starting point for this subject. No prerequisites needed.";
        }
      } else {
        reason = "Recommended because mastery is low and it is a prerequisite for upcoming topics.";
      }

      return {
        node,
        reason
      };
    })
    .filter((item): item is { node: ConceptNode; reason: string } => item !== null)
    // Prioritize topics that are prerequisites for other locked topics (enables unlocking paths)
    .sort((a, b) => {
      const dependentsA = graph.filter((n) => n.prerequisites.includes(a.node.id)).length;
      const dependentsB = graph.filter((n) => n.prerequisites.includes(b.node.id)).length;
      return dependentsB - dependentsA;
    })
    .slice(0, 4); // Limit to top 4 recommendations

  return {
    weakConcepts,
    revisionPriorities,
    nextTopics
  };
}
