"use client";

import React from "react";
import {
  QrCode,
  ShieldCheck,
  Camera,
  FileCheck,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface HeroBannerProps {
  onStartStudent: () => void;
  onStartOfficer: () => void;
  stats: {
    activeEvents: number;
    checkedIn: number;
    pendingReviews: number;
    verified: number;
  };
}

export default function HeroBanner({
  onStartStudent,
  onStartOfficer,
  stats,
}: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-10 shadow-2xl">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 mb-4">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <span>Proofly Verified Attendance Engine</span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          LITS Quick Event
          <span className="block bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
            Verified Attendance & Evaluation
          </span>
        </h1>

        <p className="mt-4 text-base text-slate-300 sm:text-lg max-w-2xl leading-relaxed">
          Eliminate proxy attendance and paper sheets. Experience tamper-proof QR check-in,
          mandatory timestamped photo validation against official event windows, and automated
          evaluation unlocking.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={onStartStudent}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40 active:scale-95"
          >
            <QrCode className="h-4 w-4" />
            Open Student QR & Attendance
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onStartOfficer}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-700/80 active:scale-95"
          >
            <Camera className="h-4 w-4 text-emerald-400" />
            LITS Officer QR Scanner & Verification Desk
          </button>
        </div>

        {/* Metrics Row */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-slate-800/80">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              Active Events
            </div>
            <div className="mt-1 text-2xl font-bold text-white">
              {stats.activeEvents}
            </div>
            <div className="text-[11px] text-slate-500">Live & Scheduled</div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <QrCode className="h-3.5 w-3.5 text-sky-400" />
              Checked-In Today
            </div>
            <div className="mt-1 text-2xl font-bold text-white">
              {stats.checkedIn}
            </div>
            <div className="text-[11px] text-slate-500">Server timestamped</div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              Photos Under Review
            </div>
            <div className="mt-1 text-2xl font-bold text-amber-300">
              {stats.pendingReviews}
            </div>
            <div className="text-[11px] text-amber-500/80">Awaiting officer review</div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              Confirmed Verified
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-400">
              {stats.verified}
            </div>
            <div className="text-[11px] text-emerald-500/80">Evaluations Unlocked</div>
          </div>
        </div>
      </div>
    </div>
  );
}
