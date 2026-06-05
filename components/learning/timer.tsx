'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface TimerProps {
  question: string;
  initialTime?: number;
  onSubmit: (answer: string) => void;
  onTimeUp: () => void;
}

export default function Timer({
  question,
  initialTime = 45,
  onSubmit,
  onTimeUp,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [answer, setAnswer] = useState('');
  
  // Create a ref to always hold the latest answer without triggering re-renders
  const answerRef = useRef(answer);

  // Keep the ref updated whenever the user types
  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  // Reset timer and answer when a new question loads
  useEffect(() => {
    setTimeLeft(initialTime);
    setAnswer('');
  }, [question, initialTime]);

  // Timer logic and auto-submit
  // Timer logic and auto-submit
  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);
  
  // Handle time up separately to avoid infinite loops
  // Handle time up separately to avoid infinite loops
  useEffect(() => {
    if (timeLeft === 0) {
      if (answerRef.current.trim()) {
        onSubmit(answerRef.current);
      }
      onTimeUp();
    }
  }, [timeLeft, onSubmit, onTimeUp, answerRef]);

  // Dynamic User Experience: Determine urgency based on time remaining
  const isTimeRunningOut = timeLeft <= 10;

  const handleSubmit = () => {
    onSubmit(answer);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Timer Display */}
      <div
        className={`text-center mb-6 p-4 rounded-lg transition-all ${
          isTimeRunningOut
            ? 'bg-red-100 border-2 border-red-500'
            : 'bg-blue-100 border-2 border-blue-500'
        }`}
      >
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Time Remaining
        </p>
        <div
          className={`text-4xl font-bold ${
            isTimeRunningOut ? 'text-red-600 animate-pulse' : 'text-blue-600'
          }`}
        >
          {timeLeft}s
        </div>
      </div>

      {/* Question Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-800 font-medium">{question}</p>
      </div>

      {/* Answer Input */}
      <div className="mb-6">
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
          Your Answer
        </label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={timeLeft <= 0}
          placeholder="Type your answer here..."
          className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            timeLeft <= 0 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          rows={4}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={timeLeft <= 0 || !answer.trim()}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Submit Answer
        </Button>
      </div>

      {/* Time Warning Message */}
      {isTimeRunningOut && timeLeft > 0 && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-500 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ Hurry up! Only {timeLeft} seconds left!
          </p>
        </div>
      )}

      {/* Time's Up Message */}
      {timeLeft <= 0 && (
        <div className="mt-4 p-3 bg-red-100 border border-red-500 rounded-lg">
          <p className="text-sm font-semibold text-red-800">
            ⏰ Time's up! {answerRef.current.trim() ? "Your answer has been submitted." : "No answer was submitted."}
          </p>
        </div>
      )}
    </div>
  );
}
