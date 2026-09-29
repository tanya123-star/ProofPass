import { NextRequest, NextResponse } from "next/server";
import { getApiUser, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getApiUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
