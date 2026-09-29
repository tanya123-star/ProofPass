import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { serverDb } from "@/lib/serverDb";

export async function GET(req: NextRequest) {
  try {
    const user = getApiUser(req);
    const notifications = serverDb.getNotifications(user?.email);
    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }
    const updated = serverDb.markNotificationRead(id);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
