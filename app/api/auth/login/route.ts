import { NextRequest, NextResponse } from "next/server";
import { resolveUserFromEmail, SESSION_COOKIE_NAME, SessionData } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid Google email is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Server-side authorization check & role resolution
    const user = resolveUserFromEmail(cleanEmail);

    if (!user) {
      const isAcdDomain = cleanEmail.endsWith("@acdeducation.com");
      if (!isAcdDomain) {
        return NextResponse.json(
          {
            error:
              "Institutional Domain Restriction: Students must authenticate using their official @acdeducation.com Google account.",
            code: "INVALID_STUDENT_DOMAIN",
            requiredDomain: "@acdeducation.com",
            email: cleanEmail,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Unauthorized Google Account. This account is deactivated or not permitted to access QuestLog.",
          code: "ACCOUNT_NOT_AUTHORIZED",
          email: cleanEmail,
        },
        { status: 403 }
      );
    }

    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const redirectUrl =
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "LITS"
        ? "/lits"
        : "/student";

    const response = NextResponse.json({
      success: true,
      user,
      redirectUrl,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(sessionData)),
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
