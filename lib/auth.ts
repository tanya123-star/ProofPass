import { cookies } from "next/headers";
import { User, Role } from "./types";
import { serverDb } from "./serverDb";

export const SESSION_COOKIE_NAME = "questlog_session";

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: Role;
  expiresAt: number;
}

/**
 * Server-side role resolution from Google OAuth email.
 * Rules:
 * 1. Admin if matches BOOTSTRAP_ADMIN_EMAIL or admin table.
 * 2. LITS if active in lits_users table.
 * 3. Student if enrolled in student roster table.
 * 4. Otherwise returns null (unauthorized).
 */
export function resolveUserFromEmail(email: string): User | null {
  return serverDb.resolveUserByEmail(email);
}

/**
 * Retrieves the currently authenticated user from session cookie (server-side).
 * Enforces live database check so revoked LITS users are immediately locked out.
 */
export async function getServerSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;

    let parsed: SessionData;
    try {
      parsed = JSON.parse(decodeURIComponent(sessionCookie));
    } catch {
      return null;
    }

    if (parsed.expiresAt < Date.now()) {
      return null;
    }

    // Always re-resolve against database authority!
    const liveUser = serverDb.resolveUserByEmail(parsed.email);
    if (!liveUser) {
      return null;
    }

    return liveUser;
  } catch {
    return null;
  }
}

/**
 * Parses user from incoming NextRequest headers/cookies for API routes.
 */
export function getApiUser(req: Request): User | null {
  try {
    // Check Authorization header first
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const email = authHeader.replace("Bearer ", "").trim();
      const liveUser = serverDb.resolveUserByEmail(email);
      if (liveUser) return liveUser;
    }

    // Check cookie
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) return null;

    const match = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
    if (!match) return null;

    const raw = match.split("=")[1];
    const parsed: SessionData = JSON.parse(decodeURIComponent(raw));
    if (parsed.expiresAt < Date.now()) return null;

    return serverDb.resolveUserByEmail(parsed.email);
  } catch {
    return null;
  }
}
