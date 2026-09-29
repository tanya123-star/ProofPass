"use client";

import React, { useState } from "react";
import { AttendanceRecord, EventItem } from "@/lib/types";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  ShieldCheck,
  User,
  QrCode,
  Camera,
  Info,
} from "lucide-react";
import { formatTime, formatDateTime } from "@/lib/utils";

interface PhotoVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: AttendanceRecord;
  event: EventItem;
  officerName: string;
  officerId: string;
  onVerified: () => void;
}

export default function PhotoVerificationModal({
  isOpen,
  onClose,
  attendance,
  event,
  officerName,
  officerId,
  onVerified,
}: PhotoVerificationModalProps) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    "Photo does not clearly show active event participation or hall presence."
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleDecision = async (decision: "APPROVE" | "REJECT") => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY",
          attendanceId: attendance.id,
          officerId,
          officerName,
          decision,
          rejectionReason: decision === "REJECT" ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process verification decision");
      }

      onVerified();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit verification decision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Attendance Photo Verification</h3>
              <p className="text-xs text-slate-400">
                Officer Inspection & Timestamp Audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student & Event Summary */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 font-bold text-sm">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{attendance.studentName}</h4>
                <p className="text-xs text-slate-400">
                  {attendance.studentId} • {attendance.course} {attendance.yearLevel}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Event</span>
              <span className="text-xs font-semibold text-slate-200">{event.title}</span>
            </div>
          </div>

          {/* Full Resolution Photo View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-amber-400" />
                Submitted Attendance Photo
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ID: {attendance.id}
              </span>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-950">
              {attendance.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attendance.photoUrl}
                  alt="Student attendance proof"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  No photo attached
                </div>
              )}
            </div>
          </div>

          {/* Timestamp Comparison Grid (Crucial requirement from Section 14, 15, 16) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              Timestamp Validation & Verification Matrix
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* QR Scan Server Timestamp */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">
                  1. QR Scan Timestamp
                </span>
                <span className="mt-1 block font-mono text-sm font-bold text-emerald-400">
                  {formatTime(attendance.checkInTimestamp)}
                </span>
                <span className="text-[10px] text-slate-400">Server Recorded</span>
              </div>

              {/* Photo Timestamp */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">
                  2. Photo Timestamp
                </span>
                <span className="mt-1 block font-mono text-sm font-bold text-amber-300">
                  {attendance.photoTimestamp ? formatTime(attendance.photoTimestamp) : "N/A"}
                </span>
                <span className="text-[10px] text-amber-500/80">Participant Stated</span>
              </div>

              {/* Upload Server Timestamp */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">
                  3. Upload Timestamp
                </span>
                <span className="mt-1 block font-mono text-sm font-bold text-sky-400">
                  {attendance.photoUploadTimestamp
                    ? formatTime(attendance.photoUploadTimestamp)
                    : "N/A"}
                </span>
                <span className="text-[10px] text-slate-400">Server Authoritative</span>
              </div>
            </div>

            {/* Attendance Window Comparison */}
            <div className="rounded-xl bg-slate-900 p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">CONFIGURED ATTENDANCE WINDOW</span>
                <span className="font-semibold text-slate-200">
                  {formatTime(event.attendanceOpens)} to {formatTime(event.attendanceCloses)}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    attendance.photoTimestampValid !== false
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {attendance.photoTimestampValid !== false ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Within Window
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Outside Window Flag
                    </>
                  )}
                </span>
              </div>
            </div>

            {attendance.photoTimestampValidationNotes && (
              <p className="text-[11px] text-slate-400 italic">
                Note: {attendance.photoTimestampValidationNotes}
              </p>
            )}
          </div>

          {/* Rejection Reason Input Drawer */}
          {rejecting && (
            <div className="rounded-2xl border border-red-800/60 bg-red-950/20 p-4 space-y-3 animate-in fade-in">
              <label className="block text-xs font-bold text-red-300">
                Specify Reason for Rejection
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason explaining why attendance verification is rejected..."
                className="w-full rounded-xl border border-red-800 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
                >
                  Cancel Rejection
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDecision("REJECT")}
                  className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-500 shadow-md shadow-red-600/30"
                >
                  Confirm Reject Attendance
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!rejecting && (
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-800/80 bg-red-950/40 py-2.5 text-xs font-bold text-red-300 hover:bg-red-900/40 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Reject Photo
              </button>
              <button
                type="button"
                onClick={() => handleDecision("APPROVE")}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve & Unlock Evaluation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
