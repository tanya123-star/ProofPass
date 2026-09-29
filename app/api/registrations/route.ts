import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { getApiUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getApiUser(req);
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId") || undefined;
    const participantId = searchParams.get("participantId");

    if (participantId) {
      const reg = serverDb.getRegistrationById(participantId);
      if (!reg) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      return NextResponse.json(reg);
    }

    // If student, filter to their own registrations unless LITS/ADMIN
    const filterEmail =
      user && user.role === "STUDENT" ? user.email : searchParams.get("studentEmail") || undefined;

    const registrations = serverDb.getRegistrations(eventId, filterEmail);
    return NextResponse.json(registrations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch registrations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getApiUser(req);
    const body = await req.json();

    const newReg = serverDb.registerStudentAtomic({
      eventId: body.eventId,
      studentId: user?.studentId || body.studentId,
      studentName: user?.name || body.studentName,
      studentEmail: user?.email || body.studentEmail,
      course: user?.course || body.course,
      yearLevel: user?.yearLevel || body.yearLevel,
      contactNumber: body.contactNumber || "+63 917 123 4567",
    });

    return NextResponse.json(newReg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 400 });
  }
}
