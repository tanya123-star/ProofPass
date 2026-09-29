"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { FileCheck, Lock, CheckCircle, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { EvaluationForm, EventItem, AttendanceRecord, EvaluationResponse } from "@/lib/types";

export default function StudentEvaluationsListPage() {
  const [evaluations, setEvaluations] = useState<EvaluationForm[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [myResponses, setMyResponses] = useState<EvaluationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evalsRes, evsRes, attRes, respRes] = await Promise.all([
          fetch("/api/evaluations").then((r) => r.json()),
          fetch("/api/events").then((r) => r.json()),
          fetch("/api/attendance").then((r) => r.json()),
          fetch("/api/evaluations?responsesFor=ALL").then((r) => r.json()),
        ]);

        if (Array.isArray(evalsRes)) setEvaluations(evalsRes);
        if (Array.isArray(evsRes)) setEvents(evsRes);
        if (Array.isArray(attRes)) setAttendance(attRes);
        if (Array.isArray(respRes)) setMyResponses(respRes);
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
          <h1 className="text-xl font-bold text-white sm:text-2xl">Event Evaluations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluations unlock automatically only after your physical presence is verified by a LITS Officer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluations.map((form) => {
            const event = events.find((e) => e.id === form.eventId);
            const att = attendance.find((a) => a.eventId === form.eventId);
            const isVerified = att?.verificationStatus === "VERIFIED";
            const isSubmitted = myResponses.some((r) => r.formId === form.id);

            return (
              <div
                key={form.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">
                        {form.id}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">
                        {event ? event.title : form.title}
                      </h3>
                    </div>
                    {isSubmitted ? (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                        COMPLETED
                      </span>
                    ) : isVerified ? (
                      <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800 text-slate-400 px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="h-3 w-3" /> LOCKED
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {form.description}
                  </p>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Attendance Verification Gate:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">
                        {att ? `Status: ${att.verificationStatus}` : "Not Checked-In"}
                      </span>
                      {isVerified ? (
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold text-[11px]">
                          Verification Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  {isSubmitted ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                      <CheckCircle className="h-4 w-4" />
                      Feedback successfully submitted!
                    </div>
                  ) : isVerified ? (
                    <Link
                      href={`/student/evaluations/${form.eventId}`}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
                    >
                      <FileCheck className="h-4 w-4" />
                      Complete Evaluation Now
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Locked Until Attendance Verified
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
