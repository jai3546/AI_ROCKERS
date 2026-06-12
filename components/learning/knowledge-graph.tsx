"use client";

import React, { useState } from "react";
import { ConceptNode } from "../../data/learning-graph";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Treemap, Tooltip } from "recharts";
import { Brain, Star, Clock, AlertCircle, RefreshCw } from "lucide-react";

interface KnowledgeGraphProps {
  graph: ConceptNode[];
  onSelectConcept?: (conceptId: string) => void;
}

export function KnowledgeGraph({ graph, onSelectConcept }: KnowledgeGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Find the selected node details
  const selectedNode = graph.find((n) => n.id === selectedNodeId);

  // Prepare radar chart data for overall subject mastery
  const subjects = ["Science", "Math", "English", "Social Studies"];
  const radarData = subjects.map((subj) => {
    const nodes = graph.filter((n) => n.subject === subj);
    const avgMastery = nodes.length > 0
      ? Math.round(nodes.reduce((acc, curr) => acc + curr.mastery, 0) / nodes.length)
      : 0;
    return {
      subject: subj,
      Mastery: avgMastery,
      fullMark: 100
    };
  });

  // Prepare Treemap data (Subject -> Concept -> Mastery)
  const treemapData = subjects.map((subj) => {
    const children = graph
      .filter((n) => n.subject === subj)
      .map((n) => ({
        name: n.name,
        size: Math.max(15, n.mastery), // ensure it has a size even if 0
        mastery: n.mastery,
        id: n.id
      }));

    return {
      name: subj,
      children
    };
  });

  // Helper to color code mastery
  const getMasteryColor = (mastery: number) => {
    if (mastery <= 40) return { hex: "#ef4444", text: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-500/30" };
    if (mastery <= 70) return { hex: "#eab308", text: "text-yellow-600 dark:text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20", border: "border-yellow-500/30" };
    return { hex: "#10b981", text: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-500/30" };
  };

  // Node position map in the interactive SVG layout (centered on 300, 220)
  const nodePositions: Record<string, { x: number; y: number }> = {
    // Science branch (left top)
    "states-of-matter": { x: 120, y: 110 },
    "chemistry-foundations": { x: 60, y: 50 },
    "photosynthesis": { x: 180, y: 70 },
    "plant-biology": { x: 230, y: 30 },
    "human-anatomy": { x: 80, y: 180 },
    "space-astronomy": { x: 140, y: 220 },
    "physics-foundations": { x: 70, y: 270 },

    // Math branch (right top)
    "algebra-foundations": { x: 480, y: 110 },
    "quadratic-equations": { x: 540, y: 50 },
    "basic-geometry": { x: 420, y: 70 },
    "advanced-geometry": { x: 370, y: 30 },

    // English branch (left bottom)
    "grammar-syntax": { x: 180, y: 330 },
    "literature": { x: 120, y: 380 },

    // Social Studies branch (right bottom)
    "geography-rivers": { x: 420, y: 330 },
    "art-culture": { x: 480, y: 380 },
    "telangana-history": { x: 360, y: 390 },
    "ap-history": { x: 300, y: 400 },
    "indian-history": { x: 240, y: 410 }
  };

  // Custom Treemap Content
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, mastery } = props;
    if (width < 30 || height < 30) return null;

    const colors = getMasteryColor(mastery || 0);

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: colors.hex,
            fillOpacity: 0.15,
            stroke: colors.hex,
            strokeWidth: 2,
            strokeOpacity: 0.5,
            cursor: "pointer"
          }}
          onClick={() => {
            const found = graph.find(n => n.name === name);
            if (found) {
              setSelectedNodeId(found.id);
              if (onSelectConcept) onSelectConcept(found.id);
            }
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
          className="text-[10px] md:text-xs font-semibold select-none"
        >
          {name} ({mastery}%)
        </text>
      </g>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual Concept Network SVG Map */}
      <Card className="lg:col-span-2 border-border shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Brain className="text-indigo-500" />
            Interactive Knowledge Graph
          </CardTitle>
          <CardDescription>
            Visual map of concepts and prerequisite relationships. Tap a node to review details.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-2 relative min-h-[460px] bg-slate-50/50 dark:bg-slate-950/20">
          <svg
            viewBox="0 0 600 440"
            className="w-full h-auto max-h-[440px] drop-shadow-sm"
          >
            {/* Draw connecting edges for prerequisites */}
            {graph.map((node) => {
              const startPos = nodePositions[node.id];
              if (!startPos) return null;

              return node.prerequisites.map((reqId) => {
                const endPos = nodePositions[reqId];
                if (!endPos) return null;

                const reqNode = graph.find((n) => n.id === reqId);
                const colors = getMasteryColor(reqNode?.mastery || 0);

                return (
                  <line
                    key={`${reqId}-${node.id}`}
                    x1={endPos.x}
                    y1={endPos.y}
                    x2={startPos.x}
                    y2={startPos.y}
                    stroke={colors.hex}
                    strokeWidth={1.5}
                    strokeDasharray={reqNode && reqNode.mastery < 50 ? "4 4" : undefined}
                    opacity={0.4}
                  />
                );
              });
            })}

            {/* Draw Central Core Node */}
            <circle
              cx={300}
              cy={220}
              r={24}
              className="fill-indigo-600/10 stroke-indigo-600 stroke-2 animate-pulse"
            />
            <text
              x={300}
              y={224}
              textAnchor="middle"
              className="fill-indigo-600 dark:fill-indigo-400 font-bold text-[9px]"
            >
              COGNITIVE
            </text>

            {/* Draw Subject Core Indicators */}
            {subjects.map((subj, index) => {
              // Radiate from center
              const angles = [225, 315, 135, 45]; // angles for Science, Math, English, Social Studies
              const angle = (angles[index] * Math.PI) / 180;
              const x = 300 + Math.cos(angle) * 75;
              const y = 220 + Math.sin(angle) * 60;

              return (
                <g key={subj}>
                  <line
                    x1={300}
                    y1={220}
                    x2={x}
                    y2={y}
                    className="stroke-muted-foreground/30 stroke-1 stroke-dasharray-2"
                  />
                  <rect
                    x={x - 35}
                    y={y - 10}
                    width={70}
                    height={20}
                    rx={10}
                    className="fill-muted stroke-muted-foreground/20 stroke"
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px] font-semibold"
                  >
                    {subj}
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {graph.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNodeId === node.id;
              const colors = getMasteryColor(node.mastery);

              // subject colors
              let subjectColor = "stroke-blue-500";
              if (node.subject === "Math") subjectColor = "stroke-amber-500";
              if (node.subject === "English") subjectColor = "stroke-purple-500";
              if (node.subject === "Social Studies") subjectColor = "stroke-rose-500";

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (onSelectConcept) onSelectConcept(node.id);
                  }}
                >
                  <circle
                    r={isSelected ? 16 : 12}
                    fill={colors.hex}
                    fillOpacity={isSelected ? 0.35 : 0.15}
                    className={`stroke-2 transition-all ${subjectColor} group-hover:scale-110`}
                  />
                  {/* Outer glow for active nodes */}
                  <circle
                    r={isSelected ? 18 : 12}
                    fill="none"
                    stroke={colors.hex}
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-all opacity-80"
                  />
                  <text
                    y={25}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[7px] font-semibold select-none bg-slate-900 fill-slate-800 dark:fill-slate-200"
                  >
                    {node.name.length > 15 ? `${node.name.slice(0, 12)}...` : node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick key */}
          <div className="absolute bottom-2 left-2 flex gap-3 bg-background/80 px-2 py-1 rounded-md text-[10px] border border-border">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/20 border border-[#ef4444]"></span> 0-40%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/20 border border-[#eab308]"></span> 41-70%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/20 border border-[#10b981]"></span> 71-100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Recharts Sidebar Widget (Treemap/Radar Chart) */}
      <div className="flex flex-col gap-6">
        {/* Radar Summary */}
        <Card className="border-border shadow-sm bg-card flex-1">
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Subject Mastery Balance</CardTitle>
            <CardDescription>Average performance profile.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "currentColor" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar
                  name="Mastery"
                  dataKey="Mastery"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Selected Concept Info Panel */}
        <Card className="border-border shadow-sm bg-card flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              Concept Inspector
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-3.5 text-sm">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-foreground">{selectedNode.name}</h4>
                    <Badge className="capitalize text-[10px]" variant="outline">
                      {selectedNode.subject}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Prerequisites: {selectedNode.prerequisites.length > 0 ? selectedNode.prerequisites.join(", ") : "None"}
                  </p>
                </div>

                <div className="space-y-2 pt-1 border-t border-border">
                  {/* Mastery Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Concept Mastery</span>
                      <span className={getMasteryColor(selectedNode.mastery).text}>
                        {selectedNode.mastery}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${selectedNode.mastery}%`,
                          backgroundColor: getMasteryColor(selectedNode.mastery).hex
                        }}
                      />
                    </div>
                  </div>

                  {/* Confidence Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Confidence Level</span>
                      <span>{selectedNode.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${selectedNode.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Retention Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Cognitive Retention</span>
                      <span>{selectedNode.retention}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className="h-2 bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${selectedNode.retention}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Last practiced:
                  </span>
                  <span>
                    {selectedNode.mastery > 0
                      ? new Date(selectedNode.lastPracticed).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric"
                        })
                      : "Never"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground gap-2">
                <AlertCircle size={32} className="text-muted-foreground/50" />
                <p className="text-xs">Click a node on the knowledge graph network to inspect cognitive parameters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
