import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { getApiUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const event = serverDb.getEventById(id);
      if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
      return NextResponse.json(event);
    }
    const events = serverDb.getEvents();
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getApiUser(req);
    // Only LITS or ADMIN can create/edit events
    if (user && user.role !== "LITS" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Students cannot create or modify events." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const saved = serverDb.saveEvent(body, user?.email || "lits.officer@acd.edu.ph");
    return NextResponse.json(saved);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save event" }, { status: 400 });
  }
}
