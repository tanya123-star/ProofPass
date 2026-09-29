"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  Calendar,
  QrCode,
  Camera,
  FileCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Lock,
} from "lucide-react";
import { EventItem, Registration, AttendanceRecord, EvaluationForm } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function StudentDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, regRes, attRes, evalRes] = await Promise.all([
          fetch("/api/events").then((r) => r.json()),
          fetch("/api/registrations").then((r) => r.json()),
          fetch("/api/attendance").then((r) => r.json()),
          fetch("/api/evaluations").then((r) => r.json()),
        ]);

        if (Array.isArray(evRes)) setEvents(evRes);
        if (Array.isArray(regRes)) setRegistrations(regRes);
        if (Array.isArray(attRes)) setAttendance(attRes);
        if (Array.isArray(evalRes)) setEvaluations(evalRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeEvent = events.find((e) => e.status === "ONGOING") || events[0];
  const activeReg = registrations.find((r) => r.eventId === activeEvent?.id);
  const activeAtt = attendance.find((a) => a.eventId === activeEvent?.id);
  const activeEval = evaluations.find((e) => e.eventId === activeEvent?.id);

  const isCheckedIn = !!activeAtt;
  const isPhotoSubmitted =
    activeAtt?.photoStatus === "SUBMITTED" || activeAtt?.photoStatus === "VERIFIED";
  const isVerified = activeAtt?.verificationStatus === "VERIFIED";

  return (
    <AppShell allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-0.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Student Engagement Portal
            </div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Welcome to QuestLog
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Register for official campus events, receive entrance QR credentials, complete
              mandatory photo attendance verification, and unlock evaluations.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <Link
                href="/student/events"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
              >
                <Calendar className="h-4 w-4" />
                Browse Events
              </Link>
              {activeReg && (
                <Link
                  href={`/student/registrations/${activeReg.id}/qr`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
                >
                  <QrCode className="h-4 w-4 text-emerald-400" />
                  View Entrance QR
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Active Event Lifecycle Box */}
        {activeEvent && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Active Event Lifecycle
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{activeEvent.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    {formatDate(activeEvent.eventDate)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    {formatTime(activeEvent.startTime)} – {formatTime(activeEvent.endTime)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    {activeEvent.venue}
                  </span>
                </div>
              </div>

              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-bold">
                {activeEvent.status}
              </span>
            </div>

            {/* 5-Step Process Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* 1. Register */}
              <div
                className={`rounded-2xl border p-4 ${
                  activeReg
                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Step 1</span>
                  {activeReg && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                </div>
                <h4 className="font-bold text-xs text-white mt-1">Registration</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {activeReg ? `Confirmed (${activeReg.id})` : "Not Registered"}
                </p>
                {activeReg && (
                  <Link
                    href={`/student/registrations/${activeReg.id}/qr`}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-indigo-400 font-bold"
                  >
                    View QR <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>

              {/* 2. QR Scan */}
              <div
                className={`rounded-2xl border p-4 ${
                  isCheckedIn
                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                    : activeReg
                    ? "border-indigo-500/40 bg-indigo-950/20 text-indigo-300"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Step 2</span>
                  {isCheckedIn && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                </div>
                <h4 className="font-bold text-xs text-white mt-1">Entrance Scan</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isCheckedIn
                    ? `Scanned at ${formatTime(activeAtt.checkInTimestamp)}`
                    : "Scan by LITS Officer"}
                </p>
              </div>

              {/* 3. Mandatory Photo */}
              <div
                className={`rounded-2xl border p-4 ${
                  isPhotoSubmitted
                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                    : isCheckedIn
                    ? "border-amber-500/40 bg-amber-950/20 text-amber-300 ring-1 ring-amber-500"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Step 3</span>
                  {isPhotoSubmitted && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                </div>
                <h4 className="font-bold text-xs text-white mt-1">Hall Photo</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isPhotoSubmitted ? "Photo Submitted" : isCheckedIn ? "Required Now" : "Pending Scan"}
                </p>
                {isCheckedIn && (
                  <Link
                    href={`/student/attendance/${activeAtt.id}/photo`}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold"
                  >
                    Upload Photo <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>

              {/* 4. Verification */}
              <div
                className={`rounded-2xl border p-4 ${
                  isVerified
                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                    : activeAtt?.verificationStatus === "REJECTED"
                    ? "border-red-500/40 bg-red-950/20 text-red-300"
                    : isPhotoSubmitted
                    ? "border-amber-500/40 bg-amber-950/20 text-amber-300"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Step 4</span>
                  {isVerified && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                </div>
                <h4 className="font-bold text-xs text-white mt-1">LITS Approval</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isVerified
                    ? "Verified & Approved"
                    : activeAtt?.verificationStatus === "REJECTED"
                    ? "Photo Rejected"
                    : isPhotoSubmitted
                    ? "Under Review"
                    : "Pending"}
                </p>
              </div>

              {/* 5. Evaluation */}
              <div
                className={`rounded-2xl border p-4 ${
                  isVerified
                    ? "border-indigo-500/40 bg-indigo-950/20 text-indigo-300"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Step 5</span>
                  {isVerified ? (
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </div>
                <h4 className="font-bold text-xs text-white mt-1">Evaluation</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isVerified ? "Unlocked & Ready" : "Locked Until Verified"}
                </p>
                {isVerified && activeEval && (
                  <Link
                    href={`/student/evaluations/${activeEvent.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold"
                  >
                    Start Form <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Links Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/student/events"
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-900"
          >
            <Calendar className="h-6 w-6 text-indigo-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Event Catalogs</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore available tech workshops and symposiums.
            </p>
          </Link>

          <Link
            href="/student/registrations"
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-900"
          >
            <QrCode className="h-6 w-6 text-emerald-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Registered QR Codes</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Access your unique check-in entrance tokens.
            </p>
          </Link>

          <Link
            href="/student/evaluations"
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-900"
          >
            <FileCheck className="h-6 w-6 text-cyan-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Evaluations Hub</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit feedback after your attendance is verified.
            </p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
