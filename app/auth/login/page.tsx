"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Check,
  School,
  GraduationCap,
  Users,
  CheckCircle2,
} from "lucide-react";
import { BOOTSTRAP_ADMIN_EMAIL, STUDENT_EMAIL_DOMAIN } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async (targetEmail: string) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === "INVALID_STUDENT_DOMAIN") {
          router.push(
            `/auth/unauthorized?email=${encodeURIComponent(
              targetEmail
            )}&reason=domain&requiredDomain=${encodeURIComponent(
              data.requiredDomain || STUDENT_EMAIL_DOMAIN
            )}`
          );
          return;
        }
        if (data.code === "ACCOUNT_NOT_AUTHORIZED") {
          router.push(`/auth/unauthorized?email=${encodeURIComponent(targetEmail)}`);
          return;
        }
        throw new Error(data.error || "Authentication failed");
      }

      // Persist session to localStorage for robust iframe support
      if (typeof window !== "undefined") {
        localStorage.setItem("questlog_email", data.user.email);
        localStorage.setItem("questlog_user", JSON.stringify(data.user));
        localStorage.setItem("questlog_role", data.user.role);
      }

      // Perform direct navigation to role portal
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed");
      setLoading(false);
    }
  };

  const isStudentDomain = emailInput.trim().toLowerCase().endsWith("@acdeducation.com");
  const isBootstrapAdmin = emailInput.trim().toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  const handleAppendDomain = () => {
    let base = emailInput.trim();
    if (base.includes("@")) {
      base = base.split("@")[0];
    }
    if (base) {
      setEmailInput(`${base}@acdeducation.com`);
    } else {
      setEmailInput("student@acdeducation.com");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-xl shadow-indigo-500/25">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            QuestLog
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            ACD Gamified Campus Life & Engagement Hub
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-300">
            <School className="h-3.5 w-3.5 text-indigo-400" />
            <span>Student Google Domain: <strong className="text-white font-mono">@acdeducation.com</strong></span>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-red-950/50 border border-red-800/60 p-3.5 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Authorized Google Accounts for Preview / Evaluation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                Select Student Google Account (@acdeducation.com)
              </span>
            </div>

            {/* Student 1 */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleGoogleLogin("juan.delacruz@acdeducation.com")}
              className="flex w-full items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3 text-left transition-all hover:bg-indigo-950/40 hover:border-indigo-500/50 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-300 font-bold text-xs">
                  JD
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Juan Dela Cruz (Student)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    juan.delacruz@acdeducation.com • 2024-BSIT-0145
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-bold text-indigo-300 uppercase">
                STUDENT
              </span>
            </button>

            {/* Student 2 */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleGoogleLogin("maria.santos@acdeducation.com")}
              className="flex w-full items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3 text-left transition-all hover:bg-indigo-950/40 hover:border-indigo-500/50 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-300 font-bold text-xs">
                  MS
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Maria Santos (Student)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    maria.santos@acdeducation.com • 2024-BSIT-0199
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-bold text-indigo-300 uppercase">
                STUDENT
              </span>
            </button>

            {/* Student 3 */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleGoogleLogin("mark.reyes@acdeducation.com")}
              className="flex w-full items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3 text-left transition-all hover:bg-indigo-950/40 hover:border-indigo-500/50 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-300 font-bold text-xs">
                  MR
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Mark Anthony Reyes (Student)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    mark.reyes@acdeducation.com • 2024-BSCS-0042
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-bold text-indigo-300 uppercase">
                STUDENT
              </span>
            </button>
          </div>

          {/* Staff Accounts Header */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Staff & Administration:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* LITS Officer */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleGoogleLogin("lits.officer@acd.edu.ph")}
                className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-left transition-all hover:bg-emerald-950/40 group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                    Carlos Mendoza
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono truncate max-w-[130px]">
                    lits.officer@acd.edu.ph
                  </div>
                </div>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[8px] font-bold text-emerald-300">
                  LITS
                </span>
              </button>

              {/* Admin */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleGoogleLogin(BOOTSTRAP_ADMIN_EMAIL)}
                className="flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-950/20 p-2.5 text-left transition-all hover:bg-purple-950/40 group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-300">
                    Tanya Fontanilla
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono truncate max-w-[130px]">
                    {BOOTSTRAP_ADMIN_EMAIL}
                  </div>
                </div>
                <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[8px] font-bold text-purple-300">
                  ADMIN
                </span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-slate-900 px-2 text-slate-500">
                Or Sign In with Any Student @acdeducation.com Account
              </span>
            </div>
          </div>

          {/* Custom Google Email Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (emailInput) handleGoogleLogin(emailInput);
            }}
            className="space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Google Account Email
                </label>
                <button
                  type="button"
                  onClick={handleAppendDomain}
                  className="text-[10px] font-mono font-semibold text-indigo-400 hover:text-indigo-300 underline"
                >
                  + @acdeducation.com
                </button>
              </div>

              <input
                type="email"
                required
                placeholder="your.name@acdeducation.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
              />

              {/* Dynamic feedback on domain */}
              {emailInput.length > 3 && (
                <div className="mt-1.5">
                  {isStudentDomain ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Valid student domain (@acdeducation.com)</span>
                    </div>
                  ) : isBootstrapAdmin ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-purple-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Authorized Administrator Account</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Students must use @acdeducation.com</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !emailInput}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Verifying Google Account...
                </>
              ) : (
                <>
                  <span>Sign In with Google</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400 space-y-1">
            <span className="text-white font-semibold block">Institutional Google Authentication:</span>
            <p>
              Students authenticate using their official institutional domain (<span className="text-indigo-300 font-mono font-medium">@acdeducation.com</span>). Server authorization resolves role and event privileges automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
