"use client";

import React from "react";
import { ConceptNode } from "../../data/learning-graph";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Star, Clock, Eye, Headphones, Activity } from "lucide-react";

interface MasteryHeatmapProps {
  graph: ConceptNode[];
  onSelectConcept?: (conceptId: string) => void;
}

export function MasteryHeatmap({ graph, onSelectConcept }: MasteryHeatmapProps) {
  // Group by subjects
  const subjects = Array.from(new Set(graph.map((node) => node.subject)));

  const getMasteryBadgeClass = (mastery: number) => {
    if (mastery === 0) return "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-800";
    if (mastery <= 40) return "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400";
    if (mastery <= 70) return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400";
    return "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400";
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "Science": return "border-l-4 border-l-blue-500";
      case "Math": return "border-l-4 border-l-amber-500";
      case "English": return "border-l-4 border-l-purple-500";
      case "Social Studies": return "border-l-4 border-l-rose-500";
      default: return "border-l-4 border-l-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((subject) => {
          const nodes = graph.filter((node) => node.subject === subject);
          const avgMastery = nodes.length > 0
            ? Math.round(nodes.reduce((acc, curr) => acc + curr.mastery, 0) / nodes.length)
            : 0;

          return (
            <Card
              key={subject}
              className={`border border-border/80 shadow-sm ${getSubjectColor(subject)} bg-card overflow-hidden`}
            >
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{subject}</CardTitle>
                  <CardDescription>
                    {nodes.length} concepts tracked
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-foreground">{avgMastery}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Avg Mastery</span>
                </div>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nodes.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => onSelectConcept && onSelectConcept(node.id)}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all flex flex-col justify-between h-24 ${getMasteryBadgeClass(node.mastery)}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-semibold text-xs leading-tight line-clamp-2">
                          {node.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-4 border-current font-black font-mono shrink-0"
                        >
                          {node.mastery}%
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-[10px] opacity-80 pt-2 border-t border-current/10">
                        {node.mastery > 0 ? (
                          <>
                            <span className="flex items-center gap-0.5">
                              <Star size={10} className="fill-current" /> Conf: {node.confidence}%
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock size={10} /> Ret: {node.retention}%
                            </span>
                          </>
                        ) : (
                          <span className="italic text-[9px] opacity-60">Not started yet</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
