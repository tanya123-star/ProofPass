"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Camera, Calendar, Clock, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { AttendanceRecord, EventItem } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function StudentAttendanceListPage() {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, evRes] = await Promise.all([
          fetch("/api/attendance").then((r) => r.json()),
          fetch("/api/events").then((r) => r.json()),
        ]);
        if (Array.isArray(attRes)) setAttendanceList(attRes);
        if (Array.isArray(evRes)) setEvents(evRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AppShell allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">Attendance & Verification</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track QR scan timestamps, submitted photos, and officer verification status
          </p>
        </div>

        {attendanceList.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-3">
            <Camera className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Check-In Records Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your entrance QR code has not been scanned for any events yet. Present your QR token to a LITS Officer at the door.
            </p>
            <Link
              href="/student/registrations"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
            >
              View My QR Codes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendanceList.map((att) => {
              const event = events.find((e) => e.id === att.eventId);
              return (
                <div
                  key={att.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-400 font-bold">
                        {att.id}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">
                        {event ? event.title : att.eventId}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        att.verificationStatus === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : att.verificationStatus === "UNDER_REVIEW"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : att.verificationStatus === "REJECTED"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {att.verificationStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">QR Check-In</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {formatTime(att.checkInTimestamp)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Photo Status</span>
                      <span className="text-slate-200 font-semibold">{att.photoStatus}</span>
                    </div>
                  </div>

                  {att.rejectionReason && (
                    <div className="rounded-xl bg-red-950/40 border border-red-800/40 p-2.5 text-xs text-red-300">
                      <span className="font-bold block text-[10px] uppercase">Rejection Reason:</span>
                      {att.rejectionReason}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/student/attendance/${att.id}`}
                      className="text-xs text-slate-400 hover:text-white font-medium"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/student/attendance/${att.id}/photo`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      {att.photoStatus === "SUBMITTED" ? "Re-upload Photo" : "Upload Verification Photo"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
