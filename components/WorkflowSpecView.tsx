"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle,
  FileCheck,
  Camera,
  QrCode,
  Lock,
  Clock,
  ArrowRight,
  Database,
  KeyRound,
} from "lucide-react";

export default function WorkflowSpecView() {
  const steps = [
    {
      num: 1,
      title: "Student Registration",
      desc: "Student registers for an available event with student ID, course, and year level. System enforces capacity and prevents duplicates.",
      role: "Student",
    },
    {
      num: 2,
      title: "Unique QR Token Generation",
      desc: "Cryptographically secure random token generated and mapped to registration. No sensitive student info exposed inside the QR.",
      role: "System",
    },
    {
      num: 3,
      title: "Officer QR Entrance Scan",
      desc: "Authorized LITS Officer scans the QR at the door. Live camera with jsQR and server-side token resolution.",
      role: "Officer",
    },
    {
      num: 4,
      title: "Server-Side Check-in Timestamp",
      desc: "Authoritative server timestamp stamped on the attendance record. Client devices cannot forge check-in time.",
      role: "System",
    },
    {
      num: 5,
      title: "Mandatory Attendance Photo",
      desc: "Student must upload a photo proving active physical presence in the hall. Status shifts to PHOTO_PENDING.",
      role: "Student",
    },
    {
      num: 6,
      title: "Photo Timestamp Validation",
      desc: "Photo capture time is validated against the event attendance window. Flagged if taken outside window or before QR scan.",
      role: "System",
    },
    {
      num: 7,
      title: "Officer Photo Verification",
      desc: "Officer reviews submitted photo, compares QR scan vs photo time vs upload time vs window, and approves or rejects with reason.",
      role: "Officer",
    },
    {
      num: 8,
      title: "Attendance Confirmation",
      desc: "Upon officer approval, status transitions to VERIFIED. Participant is officially recorded present.",
      role: "System",
    },
    {
      num: 9,
      title: "Automatic Evaluation Unlocking",
      desc: "Hard business constraint: Evaluation is strictly locked until attendance is VERIFIED. Unlocks instantly upon confirmation.",
      role: "System",
    },
    {
      num: 10,
      title: "Evaluation Submission",
      desc: "Student completes rating scale and question items. One submission per verified attendee enforced.",
      role: "Student",
    },
    {
      num: 11,
      title: "Reporting & Audit Trail",
      desc: "Every step is logged to immutable audit records. Officer exports CSV reports for participants, attendance, and feedback.",
      role: "Admin & Officer",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Spec Hero */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 mb-3">
            <ShieldCheck className="h-4 w-4" />
            LITS Quick Event Design Specification
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            11-Step Attendance & Verification Lifecycle
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Proofly enforces a zero-trust attendance verification paradigm designed for student
            organizations. Evaluations cannot be accessed by registering alone; they require
            cryptographic QR verification, server timestamp recording, and verified photographic proof.
          </p>
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div
            key={s.num}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-300 font-bold text-xs border border-indigo-500/40">
                {s.num}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                  s.role === "Student"
                    ? "bg-indigo-500/20 text-indigo-300"
                    : s.role === "Officer"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-cyan-500/20 text-cyan-300"
                }`}
              >
                {s.role}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white pt-1">{s.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Security Architecture Highlights */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-emerald-400" />
          Core Security & Architecture Invariants
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
            <span className="font-bold text-white block">Server-Side Authority</span>
            <p className="text-slate-400 leading-relaxed">
              Check-in timestamps, attendance windows, evaluation locking, and verification decisions
              are computed server-side via Next.js API routes, preventing client-side bypass.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
            <span className="font-bold text-white block">Separation of Timestamps</span>
            <p className="text-slate-400 leading-relaxed">
              System explicitly distinguishes client participant-supplied photo timestamp from the
              authoritative server upload timestamp and the server QR check-in timestamp.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
            <span className="font-bold text-white block">Mandatory Evaluation Gate</span>
            <p className="text-slate-400 leading-relaxed">
              The evaluation form is strictly inaccessible until a designated LITS Officer reviews
              and verifies the photo submission, eliminating blind evaluation inflation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
