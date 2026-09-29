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
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  QrCode,
  ArrowLeft,
} from "lucide-react";
import { EventItem, Registration } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function StudentEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [existingReg, setExistingReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, regsRes] = await Promise.all([
          fetch(`/api/events?id=${eventId}`).then((r) => r.json()),
          fetch(`/api/registrations?eventId=${eventId}`).then((r) => r.json()),
        ]);

        if (evRes && !evRes.error) setEvent(evRes);
        if (Array.isArray(regsRes) && regsRes.length > 0) {
          setExistingReg(regsRes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      setExistingReg(data);
      router.push(`/student/registrations/${data.id}/qr`);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <AppShell allowedRoles={["STUDENT"]}>
        <div className="p-12 text-center text-xs text-slate-500">Loading event details...</div>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell allowedRoles={["STUDENT"]}>
        <div className="p-12 text-center space-y-3">
          <p className="text-sm font-bold text-white">Event Not Found</p>
          <Link href="/student/events" className="text-xs text-indigo-400 font-semibold">
            ← Return to Events
          </Link>
        </div>
      </AppShell>
    );
  }

  const isFull = event.currentParticipants >= event.maxParticipants;

  return (
    <AppShell allowedRoles={["STUDENT"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/student/events"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Events
        </Link>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-950/50 border border-red-800/60 p-4 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl">
          {/* Banner */}
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.bannerImage}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className="rounded-full bg-slate-950/80 backdrop-blur px-3 py-1 text-xs font-bold text-white">
                {event.status}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white">{event.title}</h1>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Date</span>
                  <span className="text-white font-medium">{formatDate(event.eventDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Schedule</span>
                  <span className="text-white font-medium">
                    {formatTime(event.startTime)} – {formatTime(event.endTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Venue</span>
                  <span className="text-white font-medium">{event.venue}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Capacity</span>
                  <span className="text-white font-medium">
                    {event.currentParticipants} / {event.maxParticipants} slots taken
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Window Notice */}
            <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-4 text-xs text-indigo-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                Mandatory Attendance Rules
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Attendance window opens at <span className="font-semibold text-white">{formatTime(event.attendanceOpens)}</span> and closes at <span className="font-semibold text-white">{formatTime(event.attendanceCloses)}</span>. You must present your entrance QR to a LITS Officer and submit a timestamped verification photo in the hall to unlock the event evaluation.
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between">
              {existingReg ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    You are Registered!
                  </span>
                  <Link
                    href={`/student/registrations/${existingReg.id}/qr`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    <QrCode className="h-4 w-4" />
                    View My Entrance QR
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering || isFull}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                >
                  {registering ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Registering...
                    </>
                  ) : isFull ? (
                    "Event Capacity Reached"
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      Register for Event & Get QR
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
