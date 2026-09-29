import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { serverDb } from "@/lib/serverDb";

export async function GET(req: NextRequest) {
  try {
    const user = getApiUser(req);
    // Only Admin can view/manage LITS roster
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin authorization required." },
        { status: 403 }
      );
    }
    const litsUsers = serverDb.getLitsUsers();
    return NextResponse.json(litsUsers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getApiUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only an authorized Administrator can grant LITS access." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, name, department, notes } = body;

    if (!email || !name || !department) {
      return NextResponse.json(
        { error: "Email, Name, and Department are required." },
        { status: 400 }
      );
    }

    const created = serverDb.addLitsUser({
      email,
      name,
      department,
      notes,
      authorizedBy: user.email,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getApiUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only an authorized Administrator can modify LITS access." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: "LITS User ID is required." }, { status: 400 });
    }

    if (action === "DEACTIVATE") {
      const updated = serverDb.deactivateLitsUser(id, user.email);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
