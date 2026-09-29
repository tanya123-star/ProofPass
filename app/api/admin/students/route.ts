import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { serverDb } from "@/lib/serverDb";

export async function GET(req: NextRequest) {
  try {
    const user = getApiUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin authorization required." },
        { status: 403 }
      );
    }
    const roster = serverDb.getStudentRoster();
    return NextResponse.json(roster);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getApiUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only an authorized Administrator can add students to roster." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, studentId, name, course, yearLevel } = body;

    if (!email || !studentId || !name || !course || !yearLevel) {
      return NextResponse.json(
        { error: "All student roster fields are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.endsWith("@acdeducation.com")) {
      return NextResponse.json(
        { error: "Student email must end with the institutional domain (@acdeducation.com)." },
        { status: 400 }
      );
    }

    const newStudent = serverDb.addStudentToRoster({
      email: cleanEmail,
      studentId: String(studentId).trim(),
      name: String(name).trim(),
      course,
      yearLevel,
      authorizedBy: user.email,
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
