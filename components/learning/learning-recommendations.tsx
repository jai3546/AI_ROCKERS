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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Next Best Topics */}
      <Card className="border border-indigo-100 dark:border-indigo-950 shadow-md bg-card flex flex-col hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border-t-4 border-t-indigo-500">
        <CardHeader className="bg-indigo-50/30 dark:bg-indigo-950/15 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black">
            <Sparkles size={20} className="animate-spin-slow" />
            New Adventures to Explore
          </CardTitle>
          <CardDescription className="text-xs">
            Unlocked study paths ready for you to start now!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-5 space-y-4">
          {nextTopics.length > 0 ? (
            nextTopics.map(({ node, reason }, index) => (
              <div
                key={node.id}
                className="p-4 bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between space-y-3 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all cursor-pointer relative group"
                onClick={() => onSelectConcept && onSelectConcept(node.id)}
              >
                {index === 0 && (
                  <Badge className="absolute -top-2.5 right-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold text-[9px] px-2 py-0.5 shadow-sm uppercase tracking-wider flex items-center gap-0.5 border-none">
                    <span>⭐</span> Recommended Next Step
                  </Badge>
                )}
                <div>
                  <div className="flex justify-between items-start gap-2 pt-1">
                    <span className="font-extrabold text-sm leading-snug text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {node.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] capitalize px-2 py-0 shrink-0 font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                      {node.subject}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {reason}
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs px-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(node.id, "tutor");
                    }}
                  >
                    Ask Tutor
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
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
            <div className="text-center py-12 text-muted-foreground text-sm">
              All concepts are currently mastered or in progress!
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Revision Priorities */}
      <Card className="border border-amber-100 dark:border-amber-950 shadow-md bg-card flex flex-col hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border-t-4 border-t-amber-500">
        <CardHeader className="bg-amber-50/30 dark:bg-amber-950/15 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-500 font-black">
            <BookOpen size={20} />
            Topics to Review
          </CardTitle>
          <CardDescription className="text-xs">
            Keep your memory sharp by reviewing these topics.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-5 space-y-4">
          {revisionPriorities.length > 0 ? (
            revisionPriorities.slice(0, 3).map(({ node, reason }) => (
              <div
                key={node.id}
                className="p-4 bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between space-y-3 hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all cursor-pointer group"
                onClick={() => onSelectConcept && onSelectConcept(node.id)}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-extrabold text-sm leading-snug text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                      {node.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold border-amber-300 text-amber-600 dark:text-amber-400 bg-amber-500/5 px-2 py-0 shrink-0">
                      {node.mastery}% Learned
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {reason}
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs px-3 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(node.id, "tutor");
                    }}
                  >
                    Tutor Explain
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm"
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
            <div className="text-center py-12 text-muted-foreground text-sm">
              Your spacing intervals look great! No pending reviews.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Weak Concepts (Needs Revision) */}
      <Card className="border border-rose-100 dark:border-rose-950 shadow-md bg-card flex flex-col hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border-t-4 border-t-rose-500">
        <CardHeader className="bg-rose-50/30 dark:bg-rose-950/15 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black">
            <AlertTriangle size={20} />
            Needs Revision
          </CardTitle>
          <CardDescription className="text-xs">
            Topics with progress scores below 50% that need extra focus.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-5 space-y-4">
          {weakConcepts.length > 0 ? (
            weakConcepts.slice(0, 3).map((node) => (
              <div
                key={node.id}
                className="p-4 bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between space-y-3 hover:border-rose-500/30 dark:hover:border-rose-500/30 transition-all cursor-pointer group"
                onClick={() => onSelectConcept && onSelectConcept(node.id)}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-extrabold text-sm leading-snug text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {node.name}
                    </span>
                    <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0 shrink-0 bg-rose-500 hover:bg-rose-500 text-white">
                      {node.mastery}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Recommended because your progress is currently low, and this is a prerequisite for upcoming topics.
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(node.id, "tutor");
                    }}
                  >
                    Simplify Concept
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm"
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
            <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center gap-3">
              <Sparkles className="text-emerald-500 animate-bounce" size={32} />
              <p className="font-semibold text-foreground">Awesome Job!</p>
              <p className="text-xs max-w-[200px]">All your active topics have progress scores above 50%!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
