"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { FileSpreadsheet, Download, Calendar, Users, CheckCircle, Star } from "lucide-react";
import { EventItem, Registration, AttendanceRecord, EvaluationResponse } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function LitsReportsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [evalResponses, setEvalResponses] = useState<EvaluationResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [reportType, setReportType] = useState<"attendance" | "participants" | "evaluations">("attendance");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, regsRes, attRes, evalRes] = await Promise.all([
          fetch("/api/events").then((r) => r.json()),
          fetch("/api/registrations").then((r) => r.json()),
          fetch("/api/attendance").then((r) => r.json()),
          fetch("/api/evaluations?responsesFor=ALL").then((r) => r.json()),
        ]);

        if (Array.isArray(evRes)) setEvents(evRes);
        if (Array.isArray(regsRes)) setRegistrations(regsRes);
        if (Array.isArray(attRes)) setAttendance(attRes);
        if (Array.isArray(evalRes)) setEvalResponses(evalRes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const downloadCsv = (filename: string, rows: (string | number)[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    const filterEv = selectedEventId === "ALL" ? null : selectedEventId;
    const evRegs = filterEv ? registrations.filter((r) => r.eventId === filterEv) : registrations;
    const evAtt = filterEv ? attendance.filter((a) => a.eventId === filterEv) : attendance;
    const evEvals = filterEv ? evalResponses.filter((e) => e.eventId === filterEv) : evalResponses;

    if (reportType === "participants") {
      const headers = [
        "Registration ID",
        "Event ID",
        "Student ID",
        "Full Name",
        "Email",
        "Course",
        "Year Level",
        "Registered At",
        "Status",
      ];
      const rows = evRegs.map((r) => [
        r.id,
        r.eventId,
        r.studentId,
        r.studentName,
        r.studentEmail,
        r.course,
        r.yearLevel,
        formatDateTime(r.registeredAt),
        r.status,
      ]);
      downloadCsv(`QuestLog-Participants-${selectedEventId}.csv`, [headers, ...rows]);
    } else if (reportType === "attendance") {
      const headers = [
        "Attendance ID",
        "Event ID",
        "Student ID",
        "Student Name",
        "Course",
        "Year Level",
        "QR Check-In Timestamp",
        "Photo Timestamp (Stated)",
        "Server Upload Timestamp",
        "Verification Status",
        "Photo Within Window?",
        "Evaluation Unlocked?",
        "Rejection Reason",
      ];
      const rows = evAtt.map((a) => [
        a.id,
        a.eventId,
        a.studentId,
        a.studentName,
        a.course,
        a.yearLevel,
        formatDateTime(a.checkInTimestamp),
        a.photoTimestamp ? formatDateTime(a.photoTimestamp) : "N/A",
        a.photoUploadTimestamp ? formatDateTime(a.photoUploadTimestamp) : "N/A",
        a.verificationStatus,
        a.photoTimestampValid ? "YES" : "NO/FLAGGED",
        a.evaluationUnlocked ? "UNLOCKED" : "LOCKED",
        a.rejectionReason || "None",
      ]);
      downloadCsv(`QuestLog-Attendance-${selectedEventId}.csv`, [headers, ...rows]);
    } else {
      const headers = ["Response ID", "Event ID", "Student ID", "Student Name", "Submitted At"];
      const questionCols = evEvals[0]?.answers.map((a) => a.questionText) || ["Responses"];
      const fullHeaders = [...headers, ...questionCols];

      const rows = evEvals.map((resp) => {
        const base = [
          resp.id,
          resp.eventId,
          resp.studentId,
          resp.studentName,
          formatDateTime(resp.submittedAt),
        ];
        const ans = resp.answers.map((a) =>
          Array.isArray(a.value) ? a.value.join("; ") : a.value
        );
        return [...base, ...ans];
      });

      downloadCsv(`QuestLog-Evaluations-${selectedEventId}.csv`, [fullHeaders, ...rows]);
    }
  };

  return (
    <AppShell allowedRoles={["LITS", "ADMIN"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">LITS Reports & CSV Export</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Download auditable participant, attendance check-in, and evaluation feedback datasets
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Select Scope / Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Events (Cumulative)</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Report Dataset Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="attendance">Attendance & Verification Audit</option>
                <option value="participants">Registered Participants Roster</option>
                <option value="evaluations">Evaluation Feedback & Ratings</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Dataset Details & Schema
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export includes permanent server check-in timestamps, photo stated capture times, authoritative server upload timestamps, verification status, and officer IDs.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
          >
            <Download className="h-4 w-4" />
            Download {reportType.toUpperCase()} CSV Export
          </button>
        </div>
      </div>
    </AppShell>
  );
}
