"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { QrCode, Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Registration, EventItem } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function StudentRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, evRes] = await Promise.all([
          fetch("/api/registrations").then((r) => r.json()),
          fetch("/api/events").then((r) => r.json()),
        ]);
        if (Array.isArray(regRes)) setRegistrations(regRes);
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
          <h1 className="text-xl font-bold text-white sm:text-2xl">My Registrations & QR Codes</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Access your unique entrance tokens for registered campus events
          </p>
        </div>

        {registrations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-3">
            <QrCode className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Event Registrations Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven’t registered for any upcoming events. Browse the event catalog to sign up and get your entrance QR code.
            </p>
            <Link
              href="/student/events"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
            >
              Browse Available Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrations.map((reg) => {
              const event = events.find((e) => e.id === reg.eventId);
              return (
                <div
                  key={reg.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-400 font-bold">
                        {reg.id}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">
                        {event ? event.title : reg.eventId}
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                      {reg.status}
                    </span>
                  </div>

                  {event && (
                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{formatDate(event.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          {formatTime(event.startTime)} – {formatTime(event.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                      {reg.qrToken}
                    </span>
                    <Link
                      href={`/student/registrations/${reg.id}/qr`}
                      className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      View QR Token
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
