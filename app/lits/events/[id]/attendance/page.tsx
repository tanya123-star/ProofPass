"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import QRScannerModal from "@/components/officer/QRScannerModal";
import {
  QrCode,
  ArrowLeft,
  Camera,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
} from "lucide-react";
import { EventItem, AttendanceRecord, Registration } from "@/lib/types";
import { formatTime, formatDateTime } from "@/lib/utils";

export default function LitsEventAttendancePage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [evRes, attRes, regsRes] = await Promise.all([
        fetch(`/api/events?id=${eventId}`).then((r) => r.json()),
        fetch(`/api/attendance?eventId=${eventId}`).then((r) => r.json()),
        fetch(`/api/registrations?eventId=${eventId}`).then((r) => r.json()),
      ]);

      if (evRes && !evRes.error) setEvent(evRes);
      if (Array.isArray(attRes)) setAttendance(attRes);
      if (Array.isArray(regsRes)) setRegistrations(regsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [eventId]);

  const filtered = attendance.filter(
    (a) =>
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell allowedRoles={["LITS", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href={`/lits/events/${eventId}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Event Overview
            </Link>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Entrance Attendance & QR Scanner
            </h1>
            <p className="text-xs text-slate-400">
              {event?.title} • {attendance.length} students checked-in
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search attendee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-52"
              />
            </div>

            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
            >
              <QrCode className="h-4 w-4" />
              Open Live QR Scanner
            </button>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950 font-semibold text-slate-400">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5">Program & Year</th>
                <th className="p-3.5">QR Scan Time</th>
                <th className="p-3.5">Photo Status</th>
                <th className="p-3.5">Verification</th>
                <th className="p-3.5">Evaluation</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((att) => (
                <tr key={att.id} className="hover:bg-slate-900/40">
                  <td className="p-3.5 font-bold text-white">{att.studentName}</td>
                  <td className="p-3.5 font-mono text-slate-400">{att.studentId}</td>
                  <td className="p-3.5">
                    {att.course} — {att.yearLevel}
                  </td>
                  <td className="p-3.5 font-mono text-emerald-400 font-semibold">
                    {formatTime(att.checkInTimestamp)}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        att.photoStatus === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : att.photoStatus === "SUBMITTED"
                          ? "bg-amber-500/20 text-amber-300"
                          : att.photoStatus === "REJECTED"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {att.photoStatus}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        att.verificationStatus === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : att.verificationStatus === "UNDER_REVIEW"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : att.verificationStatus === "REJECTED"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {att.verificationStatus}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {att.evaluationUnlocked ? (
                      <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Locked</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {att.photoUrl ? (
                      <Link
                        href="/lits/verification"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-200 hover:bg-slate-700 font-semibold"
                      >
                        Inspect Photo →
                      </Link>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Awaiting Photo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QR Scanner Modal */}
        {event && (
          <QRScannerModal
            isOpen={scannerOpen}
            onClose={() => setScannerOpen(false)}
            selectedEvent={event}
            officerId="LITS-OFFICER"
            officerName="LITS Officer"
            registrations={registrations}
            onScanSuccess={() => {
              refreshData();
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
