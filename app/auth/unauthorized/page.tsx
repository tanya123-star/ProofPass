"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  ArrowRight,
  LogOut,
  School,
  AlertTriangle,
  Play,
  Pause,
  Lock,
} from "lucide-react";
import { Role } from "@/lib/types";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "your Google account";
  const reason = searchParams.get("reason");
  const attempted = searchParams.get("attempted") || searchParams.get("from");
  const requiredRole = searchParams.get("requiredRole");
  const requiredDomain = searchParams.get("requiredDomain") || "@acdeducation.com";

  const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);
  const [countdown, setCountdown] = useState(4);
  const [isPaused, setIsPaused] = useState(false);

  const isDomainError = reason === "domain";
  const isRoleError = reason === "invalid_role" || reason === "role_forbidden";

  useEffect(() => {
    // Check if user has an active session
    const fetchSession = async () => {
      try {
        const storedEmail =
          typeof window !== "undefined" ? localStorage.getItem("questlog_email") : null;
        const res = await fetch("/api/auth/session", {
          headers: storedEmail ? { Authorization: `Bearer ${storedEmail}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUserRole(data.user.role);
          }
        }
      } catch {
        // Ignore
      }
    };

    fetchSession();
  }, []);

  const roleHome =
    currentUserRole === "ADMIN"
      ? "/admin"
      : currentUserRole === "LITS"
      ? "/lits"
      : currentUserRole === "STUDENT"
      ? "/student"
      : null;

  // Auto redirect countdown for role errors if user is logged in
  useEffect(() => {
    if (!isRoleError || !roleHome || isPaused) return;

    if (countdown <= 0) {
      router.push(roleHome);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isRoleError, roleHome, isPaused, router]);

  const handleReturnToLogin = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("questlog_email");
        localStorage.removeItem("questlog_user");
        localStorage.removeItem("questlog_role");
      }
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-red-900/60 bg-slate-900/90 p-8 shadow-2xl space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            {isDomainError
              ? "Institutional Domain Required"
              : isRoleError
              ? "Invalid Page for Your Role"
              : "Access Not Authorized"}
          </h2>

          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            {isDomainError ? (
              <>
                The Google account{" "}
                <span className="font-mono text-white font-semibold">{email}</span> cannot
                authenticate into the Student Portal because student sign-in strictly requires the
                official institutional domain{" "}
                <span className="font-mono text-indigo-300 font-semibold">{requiredDomain}</span>.
              </>
            ) : isRoleError ? (
              <>
                You do not have permission to access{" "}
                {attempted ? (
                  <span className="font-mono text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">
                    {attempted}
                  </span>
                ) : (
                  "this page"
                )}
                . {requiredRole ? `This area requires ${requiredRole} privileges.` : ""}
              </>
            ) : (
              <>
                The Google account{" "}
                <span className="font-mono text-white font-semibold">{email}</span> was
                successfully authenticated, but it is not enrolled in the QuestLog student roster
                nor authorized as a LITS Officer or Administrator.
              </>
            )}
          </p>
        </div>

        {/* If Role Error and user is logged in, show automatic redirect panel */}
        {isRoleError && roleHome && (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4 text-xs text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Role Protection Active
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {isPaused ? "Paused" : `Redirecting in ${countdown}s`}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Your active role is <strong className="text-white">{currentUserRole}</strong>.
              Redirecting you to your authorized dashboard.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => router.push(roleHome)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-bold text-white transition-colors"
              >
                <span>Return to {currentUserRole} Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
                title={isPaused ? "Resume Countdown" : "Pause Countdown"}
              >
                {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-left text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <School className="h-4 w-4 text-indigo-400" />
            Institutional Access & RBAC Rules
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-400">
            <li>
              <strong className="text-slate-200">Students:</strong> Must use Google accounts ending
              in <span className="font-mono text-indigo-300 font-bold">@acdeducation.com</span>.
            </li>
            <li>
              <strong className="text-slate-200">LITS Officers:</strong> Must be pre-authorized by
              an Administrator in the LITS authorization table.
            </li>
            <li>
              <strong className="text-slate-200">Administrators:</strong> Must authenticate via the
              configured system administrator account.
            </li>
          </ul>
        </div>

        <button
          onClick={handleReturnToLogin}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          {isDomainError
            ? "Sign In with Student Account (@acdeducation.com)"
            : "Sign In with Different Account"}
        </button>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-400 p-8 text-center text-xs">
          Loading authorization check...
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
