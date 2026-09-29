"use client";

import React, { useState } from "react";
import { EventItem, Registration, AttendanceRecord, EvaluationResponse } from "@/lib/types";
import { X, Download, FileSpreadsheet, Users, CheckCircle, Star } from "lucide-react";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  registrations: Registration[];
  attendanceList: AttendanceRecord[];
  evaluationResponses: EvaluationResponse[];
}

export default function ReportsModal({
  isOpen,
  onClose,
  event,
  registrations,
  attendanceList,
  evaluationResponses,
}: ReportsModalProps) {
  const [reportType, setReportType] = useState<"participants" | "attendance" | "evaluation">(
    "attendance"
  );

  if (!isOpen) return null;

  const eventRegs = registrations.filter((r) => r.eventId === event.id);
  const eventAtt = attendanceList.filter((a) => a.eventId === event.id);
  const eventEvals = evaluationResponses.filter((e) => e.eventId === event.id);

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
    if (reportType === "participants") {
      const headers = [
        "Registration ID",
        "Student ID",
        "Full Name",
        "Email",
        "Program/Course",
        "Year Level",
        "Registration Date",
        "Status",
      ];
      const rows = eventRegs.map((r) => [
        r.id,
        r.studentId,
        r.studentName,
        r.studentEmail,
        r.course,
        r.yearLevel,
        formatDateTime(r.registeredAt),
        r.status,
      ]);
      downloadCsv(`Participants-${event.id}-${event.title.replace(/\s+/g, "_")}.csv`, [
        headers,
        ...rows,
      ]);
    } else if (reportType === "attendance") {
      const headers = [
        "Attendance ID",
        "Student ID",
        "Full Name",
        "Program",
        "Year",
        "QR Check-In Server Time",
        "Photo Timestamp (Stated)",
        "Photo Upload Server Time",
        "Verification Status",
        "Photo Within Window?",
        "Evaluation Unlocked?",
        "Rejection Reason",
      ];
      const rows = eventAtt.map((a) => [
        a.id,
        a.studentId,
        a.studentName,
        a.course,
        a.yearLevel,
        formatDateTime(a.checkInTimestamp),
        a.photoTimestamp ? formatDateTime(a.photoTimestamp) : "N/A",
        a.photoUploadTimestamp ? formatDateTime(a.photoUploadTimestamp) : "N/A",
        a.verificationStatus,
        a.photoTimestampValid ? "YES" : "FLAGGED/NO",
        a.evaluationUnlocked ? "UNLOCKED" : "LOCKED",
        a.rejectionReason || "None",
      ]);
      downloadCsv(`Attendance-${event.id}-${event.title.replace(/\s+/g, "_")}.csv`, [
        headers,
        ...rows,
      ]);
    } else {
      const headers = ["Response ID", "Student ID", "Student Name", "Submission Timestamp"];
      // Collect question headers
      const questionCols =
        eventEvals[0]?.answers.map((ans) => ans.questionText) || ["Questions"];
      const fullHeaders = [...headers, ...questionCols];

      const rows = eventEvals.map((resp) => {
        const base = [
          resp.id,
          resp.studentId,
          resp.studentName,
          formatDateTime(resp.submittedAt),
        ];
        const answers = resp.answers.map((a) =>
          Array.isArray(a.value) ? a.value.join("; ") : a.value
        );
        return [...base, ...answers];
      });

      downloadCsv(`Evaluations-${event.id}-${event.title.replace(/\s+/g, "_")}.csv`, [
        fullHeaders,
        ...rows,
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Event Reports & Export</h3>
              <p className="text-xs text-slate-400">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Report Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setReportType("attendance")}
              className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                reportType === "attendance"
                  ? "border-emerald-500 bg-emerald-950/30 text-emerald-300 ring-1 ring-emerald-500"
                  : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
              }`}
            >
              <CheckCircle className="h-5 w-5 mb-1" />
              <span className="text-xs font-bold text-white">Attendance Audit</span>
              <span className="text-[10px] text-slate-400">{eventAtt.length} records</span>
            </button>

            <button
              onClick={() => setReportType("participants")}
              className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                reportType === "participants"
                  ? "border-indigo-500 bg-indigo-950/30 text-indigo-300 ring-1 ring-indigo-500"
                  : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs font-bold text-white">Registrations</span>
              <span className="text-[10px] text-slate-400">{eventRegs.length} participants</span>
            </button>

            <button
              onClick={() => setReportType("evaluation")}
              className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                reportType === "evaluation"
                  ? "border-sky-500 bg-sky-950/30 text-sky-300 ring-1 ring-sky-500"
                  : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Star className="h-5 w-5 mb-1" />
              <span className="text-xs font-bold text-white">Evaluation Responses</span>
              <span className="text-[10px] text-slate-400">{eventEvals.length} submissions</span>
            </button>
          </div>

          {/* Preview Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase">
                {reportType === "attendance"
                  ? "Attendance Audit Log Preview"
                  : reportType === "participants"
                  ? "Registered Participants Preview"
                  : "Evaluation Responses Preview"}
              </span>
              <span className="text-[10px] font-mono text-slate-400">CSV Export Format</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 max-h-48 text-[11px]">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  {reportType === "attendance" && (
                    <tr>
                      <th className="p-2">Student</th>
                      <th className="p-2">QR Scan</th>
                      <th className="p-2">Photo Time</th>
                      <th className="p-2">Status</th>
                    </tr>
                  )}
                  {reportType === "participants" && (
                    <tr>
                      <th className="p-2">Reg ID</th>
                      <th className="p-2">Student</th>
                      <th className="p-2">Course</th>
                      <th className="p-2">Year</th>
                    </tr>
                  )}
                  {reportType === "evaluation" && (
                    <tr>
                      <th className="p-2">Student</th>
                      <th className="p-2">Submitted</th>
                      <th className="p-2">Q1 Rating</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportType === "attendance" &&
                    eventAtt.map((a) => (
                      <tr key={a.id}>
                        <td className="p-2 font-medium text-white">{a.studentName}</td>
                        <td className="p-2 font-mono">{formatTime(a.checkInTimestamp)}</td>
                        <td className="p-2 font-mono">
                          {a.photoTimestamp ? formatTime(a.photoTimestamp) : "None"}
                        </td>
                        <td className="p-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              a.verificationStatus === "VERIFIED"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : a.verificationStatus === "UNDER_REVIEW"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {a.verificationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}

                  {reportType === "participants" &&
                    eventRegs.map((r) => (
                      <tr key={r.id}>
                        <td className="p-2 font-mono text-indigo-400">{r.id}</td>
                        <td className="p-2 font-medium text-white">{r.studentName}</td>
                        <td className="p-2">{r.course}</td>
                        <td className="p-2">{r.yearLevel}</td>
                      </tr>
                    ))}

                  {reportType === "evaluation" &&
                    eventEvals.map((resp) => (
                      <tr key={resp.id}>
                        <td className="p-2 font-medium text-white">{resp.studentName}</td>
                        <td className="p-2 font-mono">{formatTime(resp.submittedAt)}</td>
                        <td className="p-2 font-bold text-amber-400">
                          {resp.answers[0]?.value || "N/A"} ★
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500"
            >
              <Download className="h-4 w-4" />
              Download CSV Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
