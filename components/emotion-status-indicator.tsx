"use client";

import { useState, useEffect } from "react";
import { Activity, Brain, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type EmotionState } from "@/services/gemini-api";
import {
  getEnergyLevelLabel,
  getFocusLevelLabel,
  getLearnerStatusKey,
  getLearnerStatusLabel,
  getLearnerStatusTip,
  shouldShowLearnerStatus,
  type LearnerStatusLanguage,
} from "@/services/learner-status-service";

interface EmotionStatusIndicatorProps {
  emotionState?: EmotionState;
  trackingActive?: boolean;
  language?: LearnerStatusLanguage;
  className?: string;
}

const STATUS_BORDER: Record<
  NonNullable<ReturnType<typeof getLearnerStatusKey>>,
  string
> = {
  needsBreak: "border-l-amber-500",
  focusModerate: "border-l-blue-500",
  focusHigh: "border-l-green-500",
  focusTracking: "border-l-primary",
  learningSupport: "border-l-violet-500",
};

export function EmotionStatusIndicator({
  emotionState,
  trackingActive = false,
  language = "en",
  className = "",
}: EmotionStatusIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const visible = shouldShowLearnerStatus(emotionState, trackingActive);
  const statusKey = getLearnerStatusKey(emotionState);
  const statusLabel = getLearnerStatusLabel(emotionState, language);
  const statusTip = getLearnerStatusTip(emotionState, language);

  // Reset dismissed state whenever the emotion changes
  useEffect(() => {
    setDismissed(false);
  }, [emotionState?.emotion]);

  // Auto-dismiss after 6 seconds; pauses if details panel is open
  useEffect(() => {
    if (!visible || dismissed) return;
    const timer = setTimeout(() => {
      if (!showDetails) setDismissed(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [visible, dismissed, showDetails, emotionState?.emotion]);

  useEffect(() => {
    if (!visible) setShowDetails(false);
  }, [visible]);

  if (!visible || !emotionState || !statusKey || !statusLabel || dismissed)
    return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="emotion-indicator"
        initial={{ opacity: 0, x: 50 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
          },
        }}
        exit={{ opacity: 0, x: 50 }}
        className={`fixed top-20 right-6 z-40 ${className}`}
      >
        <Card
          className={`w-64 shadow-lg border-l-4 cursor-pointer overflow-hidden ${STATUS_BORDER[statusKey]}`}
          onClick={() => setShowDetails(!showDetails)}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="font-medium text-sm">{statusLabel}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {emotionState.fatigueScore !== undefined && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Activity size={12} aria-hidden="true" />
                          <span>
                            Energy Level:{" "}
                            {getEnergyLevelLabel(
                              emotionState.fatigueScore,
                              language,
                            )}
                          </span>
                        </div>
                        <span className="text-xs">
                          {100 - emotionState.fatigueScore}%
                        </span>
                      </div>
                      <Progress
                        value={100 - emotionState.fatigueScore}
                        className="h-1.5"
                        indicatorClassName={
                          emotionState.fatigueScore > 70
                            ? "bg-red-500"
                            : emotionState.fatigueScore > 40
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }
                      />
                    </div>
                  )}

                  {emotionState.attentionScore !== undefined && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Brain size={12} aria-hidden="true" />
                          <span>
                            Focus Level:{" "}
                            {getFocusLevelLabel(
                              emotionState.attentionScore,
                              language,
                            )}
                          </span>
                        </div>
                        <span className="text-xs">
                          {emotionState.attentionScore}%
                        </span>
                      </div>
                      <Progress
                        value={emotionState.attentionScore}
                        className="h-1.5"
                        indicatorClassName={
                          emotionState.attentionScore < 30
                            ? "bg-red-500"
                            : emotionState.attentionScore < 60
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }
                      />
                    </div>
                  )}

                  {statusTip && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {statusTip}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
