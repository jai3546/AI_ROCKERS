import { ConceptNode, getInitialLearningGraph } from "../data/learning-graph";
import { decayRetention, processActivity, ActivityPayload } from "./mastery-engine";
import { generateRecommendations, Recommendations } from "./recommendation-engine";

const GRAPH_STORAGE_KEY = "vidyai_learning_graph_";
const TIMELINE_STORAGE_KEY = "vidyai_learning_timeline_";

export interface TimelinePoint {
  date: string;          // Format: "MM/DD" or "YYYY-MM-DD"
  averageMastery: number;
  mathMastery: number;
  scienceMastery: number;
  socialMastery: number;
  englishMastery: number;
}

/**
 * Checks if the current user is a demo/guest user who should fall back to localStorage
 */
const isDemoUser = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem("demoUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.isDemo !== false; // defaults to true (isDemo)
    }
  } catch (e) {
    console.error("Failed to parse user session in memory service:", e);
  }
  return true;
};

/**
 * Main service interface for components to query/update personalized memory graph.
 * Supports both SQLite Database (authenticated users) and LocalStorage (demo/guest).
 */
export class LearningMemoryService {
  /**
   * Retrieves the student's concept node graph.
   */
  static async getConceptGraph(studentId: string = "S001"): Promise<ConceptNode[]> {
    if (typeof window === "undefined") return [];

    if (isDemoUser()) {
      const key = `${GRAPH_STORAGE_KEY}${studentId}`;
      const stored = localStorage.getItem(key);

      let graph: ConceptNode[];
      if (stored) {
        try {
          graph = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse stored learning graph, resetting:", e);
          graph = getInitialLearningGraph();
        }
      } else {
        graph = getInitialLearningGraph();
      }

      // Run dynamic decay calculations when graph is loaded
      let updated = false;
      const decayedGraph = graph.map((node) => {
        if (node.mastery === 0 || !node.lastPracticed) return node;

        const newRetention = decayRetention(node.lastPracticed, node.retention);
        if (newRetention !== node.retention) {
          updated = true;
          const accuracy = node.accuracy !== undefined ? node.accuracy : (node.mastery * 0.8);
          const engagement = node.engagement !== undefined ? node.engagement : 50;

          const score = accuracy * 0.5 + node.confidence * 0.2 + newRetention * 0.2 + engagement * 0.1;
          const newMastery = Math.min(100, Math.max(0, Math.round(score)));

          return {
            ...node,
            retention: newRetention,
            mastery: newMastery
          };
        }
        return node;
      });

      if (updated) {
        this.saveConceptGraph(studentId, decayedGraph);
        return decayedGraph;
      }

      return graph;
    } else {
      // Authenticated Database Path
      try {
        const response = await fetch(`/api/learning-memory/graph?studentId=${studentId}`);
        if (!response.ok) throw new Error("Graph API request failed");
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch graph from API, falling back to initial default:", error);
        return getInitialLearningGraph();
      }
    }
  }

  /**
   * Direct save helper (for demo mode / local caching).
   */
  static saveConceptGraph(studentId: string, graph: ConceptNode[]): void {
    if (typeof window === "undefined") return;
    const key = `${GRAPH_STORAGE_KEY}${studentId}`;
    localStorage.setItem(key, JSON.stringify(graph));
  }

  /**
   * Logs a learning activity and updates concept mastery metrics.
   */
  static async recordActivity(
    studentId: string,
    conceptId: string,
    activity: ActivityPayload
  ): Promise<ConceptNode[]> {
    if (isDemoUser()) {
      const graph = await this.getConceptGraph(studentId);
      
      const updatedGraph = graph.map((node) => {
        if (node.id === conceptId) {
          const updates = processActivity(node, activity);
          return {
            ...node,
            ...updates
          };
        }
        return node;
      });

      this.saveConceptGraph(studentId, updatedGraph);
      this.createTimelineSnapshot(studentId, updatedGraph);

      return updatedGraph;
    } else {
      // Authenticated Database Path
      try {
        const response = await fetch("/api/learning-memory/activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            conceptId,
            activity,
          }),
        });
        if (!response.ok) throw new Error("Activity API request failed");
        
        // Fetch and return the updated graph
        return await this.getConceptGraph(studentId);
      } catch (error) {
        console.error("Failed to record activity in DB backend:", error);
        return [];
      }
    }
  }

  /**
   * Retrieves recommended concepts for the student.
   */
  static async getRecommendations(studentId: string = "S001"): Promise<Recommendations> {
    if (isDemoUser()) {
      const graph = await this.getConceptGraph(studentId);
      return generateRecommendations(graph);
    } else {
      // Authenticated Database Path
      try {
        const response = await fetch(`/api/learning-memory/recommendations?studentId=${studentId}`);
        if (!response.ok) throw new Error("Recommendations API request failed");
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch recommendations from DB backend:", error);
        return {
          weakConcepts: [],
          revisionPriorities: [],
          nextTopics: []
        };
      }
    }
  }

  /**
   * Resets graph to initial state.
   */
  static async resetGraph(studentId: string = "S001"): Promise<ConceptNode[]> {
    if (isDemoUser()) {
      const freshGraph = getInitialLearningGraph();
      this.saveConceptGraph(studentId, freshGraph);
      
      if (typeof window !== "undefined") {
        const key = `${TIMELINE_STORAGE_KEY}${studentId}`;
        localStorage.removeItem(key);
      }
      this.createTimelineSnapshot(studentId, freshGraph);
      return freshGraph;
    } else {
      // Authenticated Database Path
      try {
        const response = await fetch("/api/learning-memory/reset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentId }),
        });
        if (!response.ok) throw new Error("Reset API request failed");
        
        return await this.getConceptGraph(studentId);
      } catch (error) {
        console.error("Failed to reset graph in DB backend:", error);
        return getInitialLearningGraph();
      }
    }
  }

  /**
   * Gets timeline history points for Recharts.
   */
  static async getTimelineHistory(studentId: string = "S001"): Promise<TimelinePoint[]> {
    if (typeof window === "undefined") return [];

    if (isDemoUser()) {
      const key = `${TIMELINE_STORAGE_KEY}${studentId}`;
      const stored = localStorage.getItem(key);

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.length > 0) return parsed;
        } catch (e) {
          console.error("Failed to parse timeline history:", e);
        }
      }

      // Seed mock history
      const graph = await this.getConceptGraph(studentId);
      const currentAverages = this.calculateSubjectAverages(graph);
      const history: TimelinePoint[] = [];

      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const mm = (date.getMonth() + 1).toString().padStart(2, "0");
        const dd = date.getDate().toString().padStart(2, "0");
        const dateStr = `${mm}/${dd}`;

        const progressFactor = (6 - i) / 6;
        history.push({
          date: dateStr,
          averageMastery: Math.round(currentAverages.average * (0.7 + progressFactor * 0.3)),
          mathMastery: Math.round(currentAverages.math * (0.65 + progressFactor * 0.35)),
          scienceMastery: Math.round(currentAverages.science * (0.75 + progressFactor * 0.25)),
          socialMastery: Math.round(currentAverages.social * (0.7 + progressFactor * 0.3)),
          englishMastery: Math.round(currentAverages.english * (0.8 + progressFactor * 0.2))
        });
      }

      localStorage.setItem(key, JSON.stringify(history));
      return history;
    } else {
      // Authenticated Database Path
      try {
        const response = await fetch(`/api/learning-memory/history?studentId=${studentId}`);
        if (!response.ok) throw new Error("History API request failed");
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch timeline history from DB backend:", error);
        return [];
      }
    }
  }

  /**
   * Records a snapshot of the current average mastery scores in the timeline (local-only).
   */
  private static async createTimelineSnapshot(studentId: string, graph: ConceptNode[]): Promise<void> {
    if (typeof window === "undefined") return;

    const key = `${TIMELINE_STORAGE_KEY}${studentId}`;
    const history = await this.getTimelineHistory(studentId);
    const averages = this.calculateSubjectAverages(graph);

    const now = new Date();
    const mm = (now.getMonth() + 1).toString().padStart(2, "0");
    const dd = now.getDate().toString().padStart(2, "0");
    const todayStr = `${mm}/${dd}`;

    const newPoint: TimelinePoint = {
      date: todayStr,
      averageMastery: averages.average,
      mathMastery: averages.math,
      scienceMastery: averages.science,
      socialMastery: averages.social,
      englishMastery: averages.english
    };

    const existingIndex = history.findIndex((pt) => pt.date === todayStr);
    if (existingIndex !== -1) {
      history[existingIndex] = newPoint;
    } else {
      history.push(newPoint);
    }

    if (history.length > 15) {
      history.shift();
    }

    localStorage.setItem(key, JSON.stringify(history));
  }

  /**
   * Helper to calculate overall and subject-level averages.
   */
  static calculateSubjectAverages(graph: ConceptNode[]): {
    average: number;
    math: number;
    science: number;
    social: number;
    english: number;
  } {
    const subjects = {
      Math: { total: 0, count: 0 },
      Science: { total: 0, count: 0 },
      "Social Studies": { total: 0, count: 0 },
      English: { total: 0, count: 0 }
    };

    let overallTotal = 0;
    let overallCount = 0;

    for (const node of graph) {
      const subj = node.subject as keyof typeof subjects;
      if (subjects[subj] !== undefined) {
        subjects[subj].total += node.mastery;
        subjects[subj].count++;
      }
      overallTotal += node.mastery;
      overallCount++;
    }

    return {
      average: overallCount > 0 ? Math.round(overallTotal / overallCount) : 0,
      math: subjects.Math.count > 0 ? Math.round(subjects.Math.total / subjects.Math.count) : 0,
      science: subjects.Science.count > 0 ? Math.round(subjects.Science.total / subjects.Science.count) : 0,
      social: subjects["Social Studies"].count > 0 ? Math.round(subjects["Social Studies"].total / subjects["Social Studies"].count) : 0,
      english: subjects.English.count > 0 ? Math.round(subjects.English.total / subjects.English.count) : 0
    };
  }

  /**
   * Synchronizes offline localStorage learning states to the cloud database.
   */
  static async syncLocalStorageToCloud(studentId: string): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const key = `${GRAPH_STORAGE_KEY}${studentId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const localGraph = JSON.parse(stored);
        
        const response = await fetch("/api/learning-memory/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            localGraph,
          }),
        });

        if (response.ok) {
          const syncResult = await response.json();
          console.log("[syncLocalStorageToCloud] Sync success:", syncResult);
          localStorage.removeItem(key); // clear local storage graph on successful sync
        }
      }
    } catch (e) {
      console.error("[syncLocalStorageToCloud] Error during sync:", e);
    }
  }
}
