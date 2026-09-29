import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { getApiUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const responsesFor = searchParams.get("responsesFor");

    if (responsesFor) {
      const responses = serverDb.getEvaluationResponses(responsesFor === "ALL" ? undefined : responsesFor);
      return NextResponse.json(responses);
    }

    if (eventId) {
      const form = serverDb.getEvaluationByEventId(eventId);
      return NextResponse.json(form || null);
    }

    const forms = serverDb.getEvaluations();
    return NextResponse.json(forms);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch evaluations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getApiUser(req);
    const body = await req.json();
    const { action } = body;

    if (action === "SUBMIT") {
      const { formId, eventId, studentId, studentName, answers } = body;
      if (!formId || !eventId || !answers) {
        return NextResponse.json({ error: "Missing required submission fields" }, { status: 400 });
      }
      const response = serverDb.submitEvaluation({
        formId,
        eventId,
        studentId: user?.studentId || studentId || "STUDENT-ID",
        studentName: user?.name || studentName || "Student",
        answers,
      });
      return NextResponse.json(response, { status: 201 });
    }

    if (action === "SAVE_FORM") {
      if (user && user.role !== "LITS" && user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Only LITS Officers or Admins can modify evaluations." },
          { status: 403 }
        );
      }

      const { form } = body;
      if (!form) return NextResponse.json({ error: "Missing form data" }, { status: 400 });
      const saved = serverDb.saveEvaluation(form, user?.email || "lits.officer@acd.edu.ph");
      return NextResponse.json(saved);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 400 });
  }
}
