"use client";

import { Card, CardContent } from "@/components/ui/card";

export interface ExportFlashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  syllabus: "AP" | "Telangana" | "CBSE" | "General";
}

interface FlashcardExportProps {
  cards: ExportFlashcard[];
}

const EXPORT_WIDTH = 900;
const EXPORT_HEIGHT = 600;

export function FlashcardExport({
    cards,
}: FlashcardExportProps) {
  return (
    <div
      data-export-container="flashcards"
      className="fixed -left-[99999px] top-0 pointer-events-none select-none"
    >
      {cards.map((card, index) => (
        <div
          key={card.id}
          className="page mb-10"
        >
          {/* FRONT */}

          <Card
            id={`front-${card.id}`}
            className="overflow-hidden border-2 rounded-2xl shadow-xl bg-white text-black"
            style={{
              width: EXPORT_WIDTH,
              height: EXPORT_HEIGHT,
            }}
          >
            <CardContent className="h-full flex flex-col justify-between p-10">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500">
                    {card.subject}
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    Question
                  </h2>
                </div>

                <div className="rounded-full bg-blue-600 text-white px-4 py-1 text-sm font-semibold">
                  Card {index + 1}
                </div>

              </div>

              <div className="flex-1 flex items-center justify-center px-8">

                <p className="text-4xl font-bold text-center leading-relaxed">
                  {card.front}
                </p>

              </div>

              <div className="flex justify-between text-gray-500 text-sm">

                <span>
                  {card.subject}
                </span>

                <span>
                  {card.syllabus}
                </span>

                <span>
                  AI Tutor Flashcards
                </span>

              </div>

            </CardContent>
          </Card>

          {/* BACK */}

          <Card
            id={`back-${card.id}`}
            className="overflow-hidden border-2 rounded-2xl shadow-xl bg-white text-black mt-8"
            style={{
              width: EXPORT_WIDTH,
              height: EXPORT_HEIGHT,
            }}
          >
            <CardContent className="h-full flex flex-col justify-between p-10">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500">
                    {card.subject}
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    Answer
                  </h2>
                </div>

                <div className="rounded-full bg-emerald-600 text-white px-4 py-1 text-sm font-semibold">
                  Card {index + 1}
                </div>

              </div>

              <div className="flex-1 flex items-center justify-center px-8">

                <p className="text-3xl text-center leading-relaxed">
                  {card.back}
                </p>

              </div>

              <div className="flex justify-between text-gray-500 text-sm">

                <span>
                  {card.subject}
                </span>

                <span>
                  {card.syllabus}
                </span>

                <span>
                  AI Tutor Flashcards
                </span>

              </div>

            </CardContent>
          </Card>

        </div>
      ))}
    </div>
  );
};