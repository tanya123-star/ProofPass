"use client";

import React, { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Settings, ArrowLeft, RotateCcw, CheckCircle, ShieldCheck } from "lucide-react";
import { BOOTSTRAP_ADMIN_EMAIL } from "@/lib/store";

export default function AdminSettingsPage() {
  const [resetting, setResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleResetData = async () => {
    if (!confirm("Are you sure you want to reset the database to default seed state?")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET" }),
      });
      if (res.ok) {
        setSuccessMsg("Database successfully reset to initial seed state!");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Overview
        </Link>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-xl font-bold text-white">System Security & Configuration</h1>
            <p className="text-xs text-slate-400 mt-1">
              Admin bootstrap parameters, institutional security policies, and environment controls
            </p>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 p-3.5 text-xs text-emerald-300">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Bootstrap Admin Status */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              Active Bootstrap Admin
            </div>
            <p className="text-xs text-slate-300">
              Configured Bootstrap Email: <span className="font-mono text-purple-300 font-bold">{BOOTSTRAP_ADMIN_EMAIL}</span>
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When authenticating via Google OAuth with this email address, administrative role authority is automatically granted and validated against the server-side security baseline.
            </p>
          </div>

          {/* Database Maintenance */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Database Maintenance & Seeding
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reset all events, student registrations, attendance checks, and verification queues back to the pristine seed demonstration state.
            </p>
            <button
              onClick={handleResetData}
              disabled={resetting}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20 disabled:opacity-50"
            >
              <RotateCcw className={`h-4 w-4 ${resetting ? "animate-spin" : ""}`} />
              {resetting ? "Resetting Database..." : "Reset All Demo Data"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
