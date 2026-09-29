"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Pause,
  Play,
  LogOut,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { User, Role } from "@/lib/types";

export default function NotFound() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [attemptedPath, setAttemptedPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAttemptedPath(window.location.pathname);
    }

    const checkSession = async () => {
      try {
        const storedEmail =
          typeof window !== "undefined" ? localStorage.getItem("questlog_email") : null;
        const res = await fetch("/api/auth/session", {
          headers: storedEmail ? { Authorization: `Bearer ${storedEmail}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch {
        // Fallback to unauthenticated
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Determine redirection target based on role
  const role: Role | "GUEST" = currentUser ? currentUser.role : "GUEST";
  const redirectTarget =
    role === "ADMIN"
      ? "/admin"
      : role === "LITS"
      ? "/lits"
      : role === "STUDENT"
      ? "/student"
      : "/auth/login";

  const targetLabel =
    role === "ADMIN"
      ? "Admin Console"
      : role === "LITS"
      ? "LITS Officer Desk"
      : role === "STUDENT"
      ? "Student Portal"
      : "QuestLog Sign In";

  // Countdown timer effect
  useEffect(() => {
    if (loading || isPaused) return;

    if (countdown <= 0) {
      router.push(redirectTarget);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, loading, isPaused, redirectTarget, router]);

  const handleImmediateRedirect = () => {
    router.push(redirectTarget);
  };

  const handleLogout = async () => {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6 text-center backdrop-blur-md relative z-10">
        {/* Animated Compass / Error Icon */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10">
          <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: "12s" }} />
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Status & Attempted Route */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300">
            <span>404 — Invalid Page</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Lost in QuestLog?
          </h1>

          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            The page{" "}
            {attemptedPath && (
              <span className="font-mono text-indigo-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                {attemptedPath}
              </span>
            )}{" "}
            does not exist or is invalid for your role.
          </p>
        </div>

        {/* Role Detection & Redirection Banner */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Role-Based Redirection
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                role === "ADMIN"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : role === "LITS"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : role === "STUDENT"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {role} ACCOUNT
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <span>Detecting user role and destination...</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-300">
                {currentUser ? (
                  <>
                    Logged in as <strong className="text-white">{currentUser.name}</strong> (
                    <span className="font-mono text-slate-400">{currentUser.email}</span>).
                  </>
                ) : (
                  <>You are currently not signed in to QuestLog.</>
                )}
              </p>
              <p className="text-[11px] text-slate-400">
                Automatically redirecting to your authorized home:{" "}
                <strong className="text-indigo-300">{targetLabel}</strong> (
                <span className="font-mono text-xs">{redirectTarget}</span>).
              </p>
            </div>
          )}

          {/* Progress Bar & Countdown */}
          {!loading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isPaused ? "Redirect paused" : `Redirecting in ${countdown}s...`}
                </span>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-3 w-3 text-emerald-400" /> Resume timer
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3 text-amber-400" /> Pause timer
                    </>
                  )}
                </button>
              </div>

              {/* Progress track */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{
                    width: `${Math.max(0, (countdown / 3) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleImmediateRedirect}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            <span>Return to {targetLabel} Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {currentUser ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out / Switch Google Account
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Go to QuestLog Login
            </Link>
          )}
        </div>

        {/* Footer Info */}
        <p className="text-[10px] text-slate-500">
          QuestLog Role-Based Access Control • ACD Campus Life
        </p>
      </div>
    </div>
  );
}
