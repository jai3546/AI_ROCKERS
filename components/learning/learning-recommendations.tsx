"use client";

import React from "react";
import { ConceptNode } from "../../data/learning-graph";
import { Recommendations } from "../../services/recommendation-engine";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BookOpen, Sparkles, AlertTriangle, Play, HelpCircle, ArrowRight } from "lucide-react";

interface LearningRecommendationsProps {
  recommendations: Recommendations;
  onSelectConcept?: (conceptId: string) => void;
  onActionClick?: (conceptId: string, actionType: "quiz" | "flashcard" | "tutor") => void;
}

export function LearningRecommendations({
  recommendations,
  onSelectConcept,
  onActionClick
}: LearningRecommendationsProps) {
  const { weakConcepts, revisionPriorities, nextTopics } = recommendations;

  const handleAction = (conceptId: string, type: "quiz" | "flashcard" | "tutor") => {
    if (onActionClick) {
      onActionClick(conceptId, type);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Next Best Topics */}
      <Card className="border border-border/80 shadow-sm bg-card flex flex-col">
        <CardHeader className="bg-indigo-50/20 dark:bg-indigo-950/10 pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles size={18} />
            Next Topic Suggestions
          </CardTitle>
          <CardDescription>
            Unlocked learning paths ready for you to explore.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-4 space-y-4">
          {nextTopics.length > 0 ? (
            nextTopics.map(({ node, reason }) => (
              <div
                key={node.id}
                className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-border flex flex-col justify-between space-y-2 hover:border-indigo-500/30 transition-colors cursor-pointer"
                onClick={() => onSelectConcept && onSelectConcept(node.id)}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs leading-tight text-foreground line-clamp-1">
                      {node.name}
                    </span>
                    <Badge variant="outline" className="text-[9px] capitalize px-1 py-0 scale-90 origin-top-right">
                      {node.subject}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {reason}
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-2 text-indigo-600 dark:text-indigo-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(node.id, "tutor");
                    }}
                  >
                    Ask Tutor
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 text-[10px] px-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(node.id, "quiz");
                    }}
                  >
                    Start Quiz
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground text-xs">
              All concepts are currently mastered or in progress!
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Revision Priorities */}
      <Card className="border border-border/80 shadow-sm bg-card flex flex-col">
        <CardHeader className="bg-amber-50/20 dark:bg-amber-950/10 pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <BookOpen size={18} />
            Revision Priorities
          </CardTitle>
          <CardDescription>
            Keep your retention high by practicing these concepts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-4 space-y-4">
          {revisionPriorities.length > 0 ? (
            revisionPriorities.slice(0, 4).map(({ node, reason }) => (
              <div
                key={node.id}
                className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-border flex flex-col justify-between space-y-2 hover:border-amber-500/30 transition-colors cursor-pointer"
                onClick={() => onSelectConcept && onSelectConcept(node.id)}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs leading-tight text-foreground line-clamp-1">
                      {node.name}
                    </span>
                    <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600 px-1 py-0 scale-90 origin-top-right">
                      {node.mastery}% Mastery
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {reason}
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-2 text-amber-600 dark:text-amber-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(node.id, "tutor");
                    }}
                  >
                    Tutor Explain
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 text-[10px] px-2 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(node.id, "flashcard");
                    }}
                  >
                    Review Cards
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground text-xs">
              Spacing interval looks great! No pending revisions.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Weak Concepts */}
      <Card className="border border-border/80 shadow-sm bg-card flex flex-col">
        <CardHeader className="bg-rose-50/20 dark:bg-rose-950/10 pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle size={18} />
            Mastery Alerts (Weak Concepts)
          </CardTitle>
          <CardDescription>
            Foundational concepts with mastery scores below 50%.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-4 space-y-4">
          {weakConcepts.length > 0 ? (
            weakConcepts.slice(0, 4).map((node) => (
              <div
                key={node.id}
                className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-border flex flex-col justify-between space-y-2 hover:border-rose-500/30 transition-colors cursor-pointer"
                onClick={() => onSelectConcept && onSelectConcept(node.id)}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs leading-tight text-foreground line-clamp-1">
                      {node.name}
                    </span>
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 scale-90 origin-top-right">
                      {node.mastery}%
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Recommended because mastery is low and it is a prerequisite for upcoming topics.
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-2 text-rose-600 dark:text-rose-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(node.id, "tutor");
                    }}
                  >
                    Simplifier
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 text-[10px] px-2 bg-rose-600 hover:bg-rose-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(node.id, "quiz");
                    }}
                  >
                    Practice Quiz
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
              <Sparkles className="text-emerald-500 animate-bounce" size={24} />
              <p>Excellent job! You have no concepts below 50% mastery.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
