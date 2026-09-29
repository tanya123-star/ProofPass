"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  Camera,
  FileCheck,
  ArrowLeft,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import { EventItem, Registration, AttendanceRecord } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function LitsEventOverviewPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, regsRes, attRes] = await Promise.all([
          fetch(`/api/events?id=${eventId}`).then((r) => r.json()),
          fetch(`/api/registrations?eventId=${eventId}`).then((r) => r.json()),
          fetch(`/api/attendance?eventId=${eventId}`).then((r) => r.json()),
        ]);

        if (evRes && !evRes.error) setEvent(evRes);
        if (Array.isArray(regsRes)) setRegistrations(regsRes);
        if (Array.isArray(attRes)) setAttendance(attRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  if (loading) {
    return (
      <AppShell allowedRoles={["LITS", "ADMIN"]}>
        <div className="p-12 text-center text-xs text-slate-500">Loading event overview...</div>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell allowedRoles={["LITS", "ADMIN"]}>
        <div className="p-12 text-center space-y-3">
          <p className="text-sm font-bold text-white">Event Not Found</p>
          <Link href="/lits/events" className="text-xs text-indigo-400 font-semibold">
            ← Return to Events
          </Link>
        </div>
      </AppShell>
    );
  }

  const verifiedCount = attendance.filter((a) => a.verificationStatus === "VERIFIED").length;
  const pendingPhotos = attendance.filter(
    (a) => a.verificationStatus === "UNDER_REVIEW" || a.photoStatus === "SUBMITTED"
  ).length;

  return (
    <AppShell allowedRoles={["LITS", "ADMIN"]}>
      <div className="space-y-6">
        <Link
          href="/lits/events"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Events
        </Link>

        {/* Event Header Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                {event.id}
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">{event.title}</h1>
              <p className="text-xs text-slate-400 max-w-2xl mt-1">{event.description}</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-bold">
              {event.status}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">
                Capacity Taken
              </span>
              <span className="text-xl font-bold text-white mt-1 block">
                {registrations.length} / {event.maxParticipants}
              </span>
              <span className="text-[10px] text-slate-400">Registered</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">
                QR Scanned Today
              </span>
              <span className="text-xl font-bold text-sky-400 mt-1 block">
                {attendance.length}
              </span>
              <span className="text-[10px] text-slate-400">Checked-In</span>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5">
              <span className="text-[10px] text-amber-400 block uppercase font-bold">
                Photos Pending Review
              </span>
              <span className="text-xl font-bold text-amber-300 mt-1 block">
                {pendingPhotos}
              </span>
              <span className="text-[10px] text-amber-500/80">Requires verification</span>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
              <span className="text-[10px] text-emerald-400 block uppercase font-bold">
                Verified Attendees
              </span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                {verifiedCount}
              </span>
              <span className="text-[10px] text-emerald-500/80">Evaluation unlocked</span>
            </div>
          </div>

          {/* Action Tabs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link
              href={`/lits/events/${event.id}/attendance`}
              className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 hover:border-emerald-500/50 hover:bg-emerald-950/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <QrCode className="h-6 w-6 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">
                    QR Check-In Scanner
                  </h4>
                  <p className="text-[10px] text-slate-400">Scan student entrance tokens</p>
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-xs">Open →</span>
            </Link>

            <Link
              href={`/lits/events/${event.id}/registrations`}
              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 hover:bg-slate-950 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">
                    Registrations Roster
                  </h4>
                  <p className="text-[10px] text-slate-400">{registrations.length} registered</p>
                </div>
              </div>
              <span className="text-indigo-400 font-bold text-xs">View →</span>
            </Link>

            <Link
              href={`/lits/events/${event.id}/evaluations`}
              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 hover:bg-slate-950 transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileCheck className="h-6 w-6 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">
                    Evaluation Questionnaire
                  </h4>
                  <p className="text-[10px] text-slate-400">Build questions & review answers</p>
                </div>
              </div>
              <span className="text-cyan-400 font-bold text-xs">Edit →</span>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
