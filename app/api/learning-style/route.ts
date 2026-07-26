import { NextResponse } from "next/server";
import {
  getLearningStyleProfile,
  saveLearningStyleProfile,
} from "@/services/db-service";

export const dynamic = 'force-dynamic';

/**
 * GET /api/learning-style?studentId=<id>&domainType=<optional>
 *
 * Returns the persisted learning-style scores for a student.
 *
 * Response body:
 *   {
 *     visualScore: 53,
 *     auditoryScore: 24,
 *     kinestheticScore: 23,
 *     lastUpdated: "2026-07-26T10:42:00.000Z",
 *     found: true
 *   }
 *
 * When nothing has been persisted yet the endpoint returns `found: false` with
 * the zero-scores defaults so the client can fall back to its own
 * `initialLearningStyleProfile` constant without an extra round-trip.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const domainType = searchParams.get("domainType") ?? "default";

    if (!studentId || studentId.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing required query parameter: studentId" },
        { status: 400 },
      );
    }

    const profile = await getLearningStyleProfile(studentId, domainType);

    if (!profile) {
      return NextResponse.json(
        {
          visualScore: 0,
          auditoryScore: 0,
          kinestheticScore: 0,
          lastUpdated: null,
          found: false,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        visualScore: profile.visualScore,
        auditoryScore: profile.auditoryScore,
        kinestheticScore: profile.kinestheticScore,
        lastUpdated: profile.lastUpdated,
        found: true,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("GET /api/learning-style Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load learning style profile" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/learning-style
 *
 * Body: { studentId, visualScore, auditoryScore, kinestheticScore, domainType? }
 *
 * Persists the three learning-style scores for a student. Use `upsert`
 * semantics — first save creates the row with default level/xp, subsequent
 * saves update the three score columns only.
 *
 * The caller is expected to pass already-normalised scores (0-100, summing to
 * approximately 100). The endpoint clamps + rounds defensively.
 *
 * Response body: { lastUpdated: "...", saved: true }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      visualScore,
      auditoryScore,
      kinestheticScore,
      domainType = "default",
    } = body ?? {};

    if (
      !studentId ||
      typeof studentId !== "string" ||
      studentId.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required field: studentId" },
        { status: 400 },
      );
    }

    if (
      typeof visualScore !== "number" ||
      typeof auditoryScore !== "number" ||
      typeof kinestheticScore !== "number"
    ) {
      return NextResponse.json(
        {
          error:
            "Scores must be numbers: visualScore, auditoryScore, kinestheticScore",
        },
        { status: 400 },
      );
    }

    const result = await saveLearningStyleProfile(
      studentId,
      { visualScore, auditoryScore, kinestheticScore },
      domainType,
    );

    return NextResponse.json(
      { lastUpdated: result.lastUpdated, saved: true },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("POST /api/learning-style Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save learning style profile" },
      { status: 500 },
    );
  }
}
