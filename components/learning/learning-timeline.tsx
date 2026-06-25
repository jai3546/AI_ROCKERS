"use client";

import React from "react";
import { TimelinePoint } from "../../services/learning-memory-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface LearningTimelineProps {
  timelineData: TimelinePoint[];
}

export function LearningTimeline({ timelineData }: LearningTimelineProps) {
  return (
    <Card className="border border-border/80 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="text-emerald-500" />
          Cognitive Growth Timeline
        </CardTitle>
        <CardDescription>
          Mastery improvement tracked across subjects over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timelineData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "currentColor" }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "currentColor" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "#e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
            />
            <Line
              type="monotone"
              dataKey="averageMastery"
              name="Overall Mastery"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="scienceMastery"
              name="Science"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="mathMastery"
              name="Math"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="socialMastery"
              name="Social Studies"
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="englishMastery"
              name="English"
              stroke="#a855f7"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
