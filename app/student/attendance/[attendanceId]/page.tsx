"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  Camera,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  User,
  FileCheck,
} from "lucide-react";
import { AttendanceRecord, EventItem } from "@/lib/types";
import { formatTime, formatDateTime } from "@/lib/utils";

export default function StudentAttendanceDetailPage() {
  const params = useParams();
  const attendanceId = params.attendanceId as string;

  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attRes = await fetch(`/api/attendance?id=${attendanceId}`).then((r) => r.json());
        if (attRes && !attRes.error) {
          setRecord(attRes);
          const evRes = await fetch(`/api/events?id=${attRes.eventId}`).then((r) => r.json());
          if (evRes && !evRes.error) setEvent(evRes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attendanceId]);

  if (loading) {
    return (
      <AppShell allowedRoles={["STUDENT"]}>
        <div className="p-12 text-center text-xs text-slate-500">Loading attendance details...</div>
      </AppShell>
    );
  }

  if (!record || !event) {
    return (
      <AppShell allowedRoles={["STUDENT"]}>
        <div className="p-12 text-center space-y-3">
          <p className="text-sm font-bold text-white">Attendance Record Not Found</p>
          <Link href="/student/attendance" className="text-xs text-indigo-400 font-semibold">
            ← Return to Attendance
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell allowedRoles={["STUDENT"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/student/attendance"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Attendance List
        </Link>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">
                {record.id}
              </span>
              <h1 className="text-xl font-bold text-white mt-1">{event.title}</h1>
              <span className="text-xs text-slate-400 block mt-0.5">
                Registration: {record.registrationId}
              </span>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                record.verificationStatus === "VERIFIED"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : record.verificationStatus === "UNDER_REVIEW"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : record.verificationStatus === "REJECTED"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              }`}
            >
              {record.verificationStatus}
            </span>
          </div>

          {/* Timestamps Comparison Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              Recorded Audit Timestamps
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] text-slate-500 block uppercase">QR Check-In Time</span>
                <span className="font-mono text-emerald-400 font-bold mt-1 block">
                  {formatTime(record.checkInTimestamp)}
                </span>
                <span className="text-[10px] text-slate-500">Officer Scanned</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] text-slate-500 block uppercase">Photo Capture Time</span>
                <span className="font-mono text-amber-300 font-bold mt-1 block">
                  {record.photoTimestamp ? formatTime(record.photoTimestamp) : "Pending"}
                </span>
                <span className="text-[10px] text-slate-500">Participant Stated</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] text-slate-500 block uppercase">Upload Server Time</span>
                <span className="font-mono text-sky-400 font-bold mt-1 block">
                  {record.photoUploadTimestamp ? formatTime(record.photoUploadTimestamp) : "Pending"}
                </span>
                <span className="text-[10px] text-slate-500">Authoritative Server</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Official Attendance Window:</span>
              <span className="font-bold text-slate-200">
                {formatTime(event.attendanceOpens)} to {formatTime(event.attendanceCloses)}
              </span>
            </div>
          </div>

          {/* Photo Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-200 block">Submitted Presence Photo</span>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
              {record.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={record.photoUrl}
                  alt="Attendance proof"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-xs text-slate-500 p-4 text-center">
                  <Camera className="h-8 w-8 mb-2 opacity-50" />
                  <span>No verification photo uploaded yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Link
              href={`/student/attendance/${record.id}/photo`}
              className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 text-center flex items-center justify-center gap-1.5"
            >
              <Camera className="h-4 w-4" />
              {record.photoUrl ? "Re-upload Verification Photo" : "Upload Verification Photo"}
            </Link>

            {record.evaluationUnlocked && (
              <Link
                href={`/student/evaluations/${record.eventId}`}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 text-center flex items-center justify-center gap-1.5"
              >
                <FileCheck className="h-4 w-4" />
                Open Evaluation Form
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
