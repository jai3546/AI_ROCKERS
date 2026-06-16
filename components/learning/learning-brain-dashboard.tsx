"use client";

import React, { useState, useEffect } from "react";
import { LearningMemoryService, TimelinePoint } from "../../services/learning-memory-service";
import { ConceptNode } from "../../data/learning-graph";
import { Recommendations } from "../../services/recommendation-engine";
import { KnowledgeGraph } from "./knowledge-graph";
import { MasteryHeatmap } from "./mastery-heatmap";
import { LearningRecommendations } from "./learning-recommendations";
import { LearningTimeline } from "./learning-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useRouter } from "next/navigation";
import { Brain, Sparkles, RefreshCw, Undo, Award, Target, Flame, ChevronLeft } from "lucide-react";

interface LearningBrainDashboardProps {
  studentId?: string;
  studentName?: string;
}

export function LearningBrainDashboard({
  studentId = "S001",
  studentName = "Rahul"
}: LearningBrainDashboardProps) {
  const router = useRouter();
  const [graph, setGraph] = useState<ConceptNode[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendations>({
    weakConcepts: [],
    revisionPriorities: [],
    nextTopics: []
  });
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [activeTab, setActiveTab] = useState<string>("network");
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  // Load and refresh state
  const loadMemoryProfile = () => {
    // 1. Load concept graph (will automatically apply forgetting curve retention decay)
    const graphData = LearningMemoryService.getConceptGraph(studentId);
    setGraph(graphData);

    // 2. Load recommendations
    const recs = LearningMemoryService.getRecommendations(studentId);
    setRecommendations(recs);

    // 3. Load timeline history
    const timeline = LearningMemoryService.getTimelineHistory(studentId);
    setTimelineData(timeline);
  };

  useEffect(() => {
    loadMemoryProfile();
  }, [studentId]);

  // Reset progress handler
  const handleResetGraph = () => {
    if (confirm("Are you sure you want to reset your learning progress data? This will clear local history.")) {
      const fresh = LearningMemoryService.resetGraph(studentId);
      setGraph(fresh);
      loadMemoryProfile();
    }
  };

  // Helper action click: redirects to student-dashboard with search queries
  const handleActionClick = (conceptId: string, actionType: "quiz" | "flashcard" | "tutor") => {
    const node = graph.find(n => n.id === conceptId);
    const subject = node ? node.subject : "general";

    let path = "/student-dashboard";
    if (actionType === "quiz") {
      path += `?startQuiz=true&conceptId=${conceptId}&subject=${subject}`;
    } else if (actionType === "tutor") {
      path += `?startTutor=true&conceptId=${conceptId}&subject=${subject}`;
    } else if (actionType === "flashcard") {
      path += `?startFlashcards=true&conceptId=${conceptId}&subject=${subject}`;
    }

    router.push(path);
  };

  // Simulate study helper to make testing/evaluating visual features extremely fast
  const handleSimulateStudy = (conceptId: string) => {
    setIsSimulating(conceptId);
    
    // Simulate positive activity on selected concept
    setTimeout(() => {
      const isQuiz = Math.random() > 0.4;
      if (isQuiz) {
        // Log quiz success
        LearningMemoryService.recordActivity(studentId, conceptId, {
          activityType: "quiz",
          score: 8,
          total: 10,
          responseTime: 20,
          repeatedMistakes: 0,
          engagement: 95
        });
      } else {
        // Log tutor chat success
        LearningMemoryService.recordActivity(studentId, conceptId, {
          activityType: "tutor",
          engagement: 90
        });
      }
      
      loadMemoryProfile();
      setIsSimulating(null);
    }, 800);
  };

  // Stats summaries
  const averages = LearningMemoryService.calculateSubjectAverages(graph);
  const totalConcepts = graph.length;
  const masteredConcepts = graph.filter((n) => n.mastery > 75).length;
  const inProgressConcepts = graph.filter((n) => n.mastery >= 50 && n.mastery <= 75).length;
  const criticalConcepts = recommendations.weakConcepts.length;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/student-dashboard")}
            className="h-10 w-10 shrink-0"
          >
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span>🧠</span> My Learning Brain
            </h1>
            <p className="text-sm text-muted-foreground">
              Student Cognitive Profile & Spaced Repetition Memory Graph for <span className="font-semibold text-foreground">{studentName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMemoryProfile}
            className="flex items-center gap-1.5 h-9"
          >
            <RefreshCw size={14} />
            <span>Recalculate</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetGraph}
            className="flex items-center gap-1.5 h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <Undo size={14} />
            <span>Reset Data</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Core Mastery */}
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Avg Cognitive Score</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{averages.average}%</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Brain size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Mastered Topics */}
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Concepts Locked</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {masteredConcepts} <span className="text-xs font-normal text-muted-foreground">/ {totalConcepts}</span>
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award size={20} />
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Paths Improving</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-500">{inProgressConcepts}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
              <Target size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Foundations Deficit</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{criticalConcepts}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Flame size={20} className={criticalConcepts > 0 ? "animate-pulse" : ""} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Graph Area / Subject Heatmap */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-1">
          <TabsList className="bg-transparent h-auto p-0 gap-4">
            <TabsTrigger
              value="network"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-1 py-2 font-bold text-sm text-muted-foreground data-[state=active]:text-foreground h-auto"
            >
              Network Map
            </TabsTrigger>
            <TabsTrigger
              value="heatmap"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-1 py-2 font-bold text-sm text-muted-foreground data-[state=active]:text-foreground h-auto"
            >
              Subject Mastery Heatmap
            </TabsTrigger>
          </TabsList>

          {/* Quick study simulator panel */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Demo Simulator:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleSimulateStudy(e.target.value);
                  e.target.value = "";
                }
              }}
              disabled={isSimulating !== null}
              className="text-xs border border-border bg-background rounded px-2 py-1 focus:outline-none"
            >
              <option value="">-- Choose Concept --</option>
              {graph.map((n) => (
                <option key={n.id} value={n.id}>
                  Study: {n.name} ({n.mastery}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        <TabsContent value="network" className="mt-0 outline-none space-y-6">
          <KnowledgeGraph graph={graph} onSelectConcept={(id) => console.log("Selected node:", id)} />
          <LearningTimeline timelineData={timelineData} />
        </TabsContent>

        <TabsContent value="heatmap" className="mt-0 outline-none">
          <MasteryHeatmap graph={graph} onSelectConcept={(id) => console.log("Selected node:", id)} />
        </TabsContent>
      </Tabs>

      {/* Adaptive Recommendations Dashboard */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-indigo-500" />
          Adaptive Cognitive Recommendations
        </h2>
        <LearningRecommendations
          recommendations={recommendations}
          onSelectConcept={(id) => console.log("Inspect concept:", id)}
          onActionClick={handleActionClick}
        />
      </section>
    </div>
  );
}
