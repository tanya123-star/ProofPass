"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { History, Calendar, CheckCircle2, Award, FileCheck } from "lucide-react";
import { AttendanceRecord, EventItem } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function StudentHistoryPage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, evRes] = await Promise.all([
          fetch("/api/attendance").then((r) => r.json()),
          fetch("/api/events").then((r) => r.json()),
        ]);

        if (Array.isArray(attRes)) setAttendance(attRes);
        if (Array.isArray(evRes)) setEvents(evRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completed = attendance.filter((a) => a.verificationStatus === "VERIFIED");

  return (
    <AppShell allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">Event Participation History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified campus events and earned participation records
          </p>
        </div>

        {completed.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-3">
            <History className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Completed Events Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once your attendance photos are verified by a LITS Officer, your verified event history records will be archived here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map((rec) => {
              const event = events.find((e) => e.id === rec.eventId);
              return (
                <div
                  key={rec.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        OFFICIALLY VERIFIED ✓
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">
                        {event ? event.title : rec.eventId}
                      </h3>
                    </div>
                    <Award className="h-6 w-6 text-emerald-400" />
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 pt-1">
                    {event && <div>Date: {formatDate(event.eventDate)}</div>}
                    <div>Check-in: {formatTime(rec.checkInTimestamp)}</div>
                    <div>Verified by: {rec.checkedInByOfficerName || "LITS Officer"}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Attendance Confirmed
                    </span>
                    <Link
                      href={`/student/evaluations/${rec.eventId}`}
                      className="text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      View Evaluation →
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
