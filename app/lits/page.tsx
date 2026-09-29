"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  Camera,
  Calendar,
  Users,
  CheckCircle,
  FileCheck,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  QrCode,
  FileSpreadsheet,
} from "lucide-react";
import { EventItem, AttendanceRecord, Registration, EvaluationResponse } from "@/lib/types";

export default function LitsDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [evalResponses, setEvalResponses] = useState<EvaluationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, attRes, regRes, evalRes] = await Promise.all([
          fetch("/api/events").then((r) => r.json()),
          fetch("/api/attendance").then((r) => r.json()),
          fetch("/api/registrations").then((r) => r.json()),
          fetch("/api/evaluations?responsesFor=ALL").then((r) => r.json()),
        ]);

        if (Array.isArray(evRes)) setEvents(evRes);
        if (Array.isArray(attRes)) setAttendance(attRes);
        if (Array.isArray(regRes)) setRegistrations(regRes);
        if (Array.isArray(evalRes)) setEvalResponses(evalRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingPhotos = attendance.filter(
    (a) => a.verificationStatus === "UNDER_REVIEW" || a.photoStatus === "SUBMITTED"
  );
  const verifiedCount = attendance.filter((a) => a.verificationStatus === "VERIFIED").length;

  return (
    <AppShell allowedRoles={["LITS", "ADMIN"]}>
      <div className="space-y-6">
        {/* LITS Welcome & Quick Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">LITS Officer Desk</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Attendance verification, QR entrance scanning, event management & reports
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/lits/verification"
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-all"
            >
              <Camera className="h-4 w-4" />
              Verification Queue ({pendingPhotos.length})
            </Link>
            <Link
              href="/lits/events/new"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all"
            >
              <Plus className="h-4 w-4" />
              New Event
            </Link>
            <Link
              href="/lits/reports"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              Reports
            </Link>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Total Events
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">{events.length}</div>
            <span className="text-[10px] text-slate-500">Scheduled / Active</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Registrations
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">{registrations.length}</div>
            <span className="text-[10px] text-slate-500">Confirmed Students</span>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">
              Pending Photo Reviews
            </span>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              {pendingPhotos.length}
            </div>
            <span className="text-[10px] text-amber-500/80">Requires Officer Action</span>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">
              Verified Attendance
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {verifiedCount}
            </div>
            <span className="text-[10px] text-emerald-500/80">Evaluations Unlocked</span>
          </div>
        </div>

        {/* Priority Focus: Pending Verification Callout */}
        {pendingPhotos.length > 0 && (
          <div className="rounded-3xl border border-amber-500/40 bg-amber-950/20 p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="h-4 w-4" />
                Action Required: {pendingPhotos.length} Student Photos Awaiting Verification
              </span>
              <p className="text-xs text-slate-300 max-w-xl">
                Students have scanned their QR tokens and submitted mandatory presence photos. Inspect photo metadata, check-in timestamps, and approve to unlock their evaluations.
              </p>
            </div>
            <Link
              href="/lits/verification"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
            >
              Open Verification Queue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Events Overview */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Active & Upcoming Events
            </h2>
            <Link
              href="/lits/events"
              className="text-xs text-indigo-400 font-semibold hover:text-indigo-300"
            >
              View All Events →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">
                      {evt.id}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{evt.title}</h3>
                  </div>
                  <span className="rounded px-2 py-0.5 text-[9px] font-bold bg-slate-800 text-slate-300">
                    {evt.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>Venue: {evt.venue}</div>
                  <div>
                    Capacity: {evt.currentParticipants} / {evt.maxParticipants} students
                  </div>
                  <div>Attendance Window: {evt.attendanceOpens} to {evt.attendanceCloses}</div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <Link
                    href={`/lits/events/${evt.id}/attendance`}
                    className="text-emerald-400 font-bold hover:text-emerald-300"
                  >
                    Attendance & Scanner →
                  </Link>
                  <Link
                    href={`/lits/events/${evt.id}`}
                    className="text-slate-400 hover:text-white"
                  >
                    Manage Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
