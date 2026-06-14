import { NextResponse } from "next/server";
import { getStudentAnalytics } from "@/services/db-service";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || "S001";

    const analytics = await getStudentAnalytics(studentId);
    if (!analytics) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error("GET /api/student/analytics Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
