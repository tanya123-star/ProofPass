import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { getApiUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId") || undefined;
    const studentEmail = searchParams.get("studentEmail") || undefined;
    const id = searchParams.get("id");

    if (id) {
      const record = serverDb.getAttendanceById(id);
      if (!record) return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
      return NextResponse.json(record);
    }

    const attendance = serverDb.getAttendance(eventId, studentEmail);
    return NextResponse.json(attendance);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getApiUser(req);
    const body = await req.json();
    const { action } = body;

    if (action === "SCAN_QR") {
      // SECURITY: Must be authorized LITS or Admin
      if (user && user.role !== "LITS" && user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Only authorized LITS Officers or Admins can scan attendance QR codes." },
          { status: 403 }
        );
      }

      const { qrToken, officerId, officerName } = body;
      if (!qrToken) {
        return NextResponse.json({ error: "Missing QR code token" }, { status: 400 });
      }

      const record = serverDb.scanQrToken(
        qrToken,
        user?.id || officerId || "USR-LITS-001",
        user?.name || officerName || "LITS Officer"
      );
      return NextResponse.json(record);
    }

    if (action === "SUBMIT_PHOTO") {
      const { attendanceId, photoUrl, photoTimestamp, studentName } = body;
      if (!attendanceId || !photoUrl || !photoTimestamp) {
        return NextResponse.json(
          { error: "Missing required fields: attendanceId, photoUrl, or photoTimestamp" },
          { status: 400 }
        );
      }

      const record = serverDb.submitAttendancePhoto({
        attendanceId,
        photoUrl,
        photoTimestamp,
        studentName: user?.name || studentName || "Student",
        studentEmail: user?.email,
      });
      return NextResponse.json(record);
    }

    if (action === "VERIFY") {
      // SECURITY: Must be authorized LITS or Admin
      if (user && user.role !== "LITS" && user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Students cannot verify attendance or approve photos." },
          { status: 403 }
        );
      }

      const { attendanceId, officerId, officerName, decision, rejectionReason } = body;
      if (!attendanceId || !decision) {
        return NextResponse.json({ error: "Missing attendanceId or decision" }, { status: 400 });
      }

      const record = serverDb.verifyAttendancePhoto({
        attendanceId,
        officerId: user?.id || officerId || "USR-LITS-001",
        officerName: user?.name || officerName || "Carlos Mendoza (LITS)",
        decision,
        rejectionReason,
      });
      return NextResponse.json(record);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 400 });
  }
}
