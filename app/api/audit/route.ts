import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";

export async function GET() {
  try {
    const logs = serverDb.getAuditLogs();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "RESET") {
      serverDb.resetToDefaults();
      return NextResponse.json({ message: "Database reset to initial demo state" });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 400 });
  }
}
