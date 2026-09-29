"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  ShieldCheck,
  Search,
} from "lucide-react";
import { AttendanceRecord, EventItem } from "@/lib/types";
import { formatTime, formatDateTime } from "@/lib/utils";

export default function LitsVerificationQueuePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedAtt, setSelectedAtt] = useState<AttendanceRecord | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    "Photo does not clearly show active event participation or hall presence."
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const refreshData = async () => {
    try {
      const [attRes, evRes] = await Promise.all([
        fetch("/api/attendance").then((r) => r.json()),
        fetch("/api/events").then((r) => r.json()),
      ]);
      if (Array.isArray(attRes)) {
        setAttendance(attRes);
        const pending = attRes.filter(
          (a) => a.verificationStatus === "UNDER_REVIEW" || a.photoStatus === "SUBMITTED"
        );
        if (pending.length > 0 && !selectedAtt) {
          setSelectedAtt(pending[0]);
        }
      }
      if (Array.isArray(evRes)) setEvents(evRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const pendingQueue = attendance.filter(
    (a) => a.verificationStatus === "UNDER_REVIEW" || a.photoStatus === "SUBMITTED"
  );
  const activeEvent = selectedAtt
    ? events.find((e) => e.id === selectedAtt.eventId)
    : events[0];

  const handleDecision = async (decision: "APPROVE" | "REJECT") => {
    if (!selectedAtt) return;
    setActionLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY",
          attendanceId: selectedAtt.id,
          decision,
          rejectionReason: decision === "REJECT" ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Decision failed");

      setSuccessMsg(
        decision === "APPROVE"
          ? `Verified ${selectedAtt.studentName} attendance! Evaluation unlocked.`
          : `Rejected attendance photo for ${selectedAtt.studentName}.`
      );

      setRejecting(false);
      setSelectedAtt(null);
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process verification");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppShell allowedRoles={["LITS", "ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            Attendance Photo Verification Queue
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect student physical presence photos, validate timestamps, and approve/reject attendance
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 p-3.5 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-950/40 border border-red-800/40 p-3.5 text-xs text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {pendingQueue.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Verification Queue is Clear</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All submitted student attendance photos have been reviewed and verified.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Queue List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Awaiting Review ({pendingQueue.length})
              </span>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {pendingQueue.map((att) => {
                  const ev = events.find((e) => e.id === att.eventId);
                  const isSelected = selectedAtt?.id === att.id;
                  return (
                    <button
                      key={att.id}
                      onClick={() => {
                        setSelectedAtt(att);
                        setRejecting(false);
                      }}
                      className={`w-full text-left rounded-2xl border p-3.5 transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-950/30 ring-1 ring-amber-500"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{att.studentName}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          {formatTime(att.checkInTimestamp)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {att.studentId} • {att.course} {att.yearLevel}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {ev ? ev.title : att.eventId}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Inspection Desk */}
            {selectedAtt && (
              <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                      Inspection Target: {selectedAtt.id}
                    </span>
                    <h2 className="text-lg font-bold text-white mt-1">
                      {selectedAtt.studentName}
                    </h2>
                    <span className="text-xs text-slate-400">
                      {selectedAtt.studentId} • {selectedAtt.course} {selectedAtt.yearLevel}
                    </span>
                  </div>
                  <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 text-xs font-bold">
                    UNDER REVIEW
                  </span>
                </div>

                {/* Photo Viewer */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-amber-400" />
                    Submitted Verification Photo
                  </span>

                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-950">
                    {selectedAtt.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedAtt.photoUrl}
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

                {/* Timestamps Comparison Matrix */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-400" />
                    Timestamp Audit Matrix
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <span className="text-[10px] text-slate-500 block uppercase">1. Server QR Scan</span>
                      <span className="font-mono text-emerald-400 font-bold mt-1 block">
                        {formatTime(selectedAtt.checkInTimestamp)}
                      </span>
                      <span className="text-[10px] text-slate-400">Server Stamped</span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <span className="text-[10px] text-slate-500 block uppercase">2. Photo Time</span>
                      <span className="font-mono text-amber-300 font-bold mt-1 block">
                        {selectedAtt.photoTimestamp ? formatTime(selectedAtt.photoTimestamp) : "N/A"}
                      </span>
                      <span className="text-[10px] text-slate-400">Participant Stated</span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <span className="text-[10px] text-slate-500 block uppercase">3. Server Upload</span>
                      <span className="font-mono text-sky-400 font-bold mt-1 block">
                        {selectedAtt.photoUploadTimestamp
                          ? formatTime(selectedAtt.photoUploadTimestamp)
                          : "N/A"}
                      </span>
                      <span className="text-[10px] text-slate-400">Authoritative Server</span>
                    </div>
                  </div>

                  {activeEvent && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">CONFIGURED EVENT WINDOW</span>
                        <span className="font-bold text-slate-200">
                          {formatTime(activeEvent.attendanceOpens)} to {formatTime(activeEvent.attendanceCloses)}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          selectedAtt.photoTimestampValid !== false
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {selectedAtt.photoTimestampValid !== false
                          ? "Within Window ✓"
                          : "Outside Window Flag"}
                      </span>
                    </div>
                  )}

                  {selectedAtt.photoTimestampValidationNotes && (
                    <p className="text-[11px] text-slate-400 italic">
                      Note: {selectedAtt.photoTimestampValidationNotes}
                    </p>
                  )}
                </div>

                {/* Reject drawer */}
                {rejecting && (
                  <div className="rounded-2xl border border-red-800/60 bg-red-950/20 p-4 space-y-3 animate-in fade-in">
                    <label className="block text-xs font-bold text-red-300">
                      Reason for Attendance Rejection
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full rounded-xl border border-red-800 bg-slate-900 p-2 text-xs text-white focus:outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRejecting(false)}
                        className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleDecision("REJECT")}
                        className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-500"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}

                {/* Decision controls */}
                {!rejecting && (
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setRejecting(true)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-800/80 bg-red-950/40 py-2.5 text-xs font-bold text-red-300 hover:bg-red-900/40 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision("APPROVE")}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Unlock Evaluation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
