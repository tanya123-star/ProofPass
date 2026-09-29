"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Calendar, Plus, Users, Clock, MapPin, Search } from "lucide-react";
import { EventItem } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function LitsEventsListPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (Array.isArray(data)) setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell allowedRoles={["LITS", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">Event Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Create, configure, and monitor official LITS events and sessions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-52"
              />
            </div>

            <Link
              href="/lits/events/new"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="h-4 w-4" />
              New Event
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((evt) => (
            <div
              key={evt.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">
                    {evt.id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{evt.title}</h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    evt.status === "ONGOING"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : evt.status === "PUBLISHED"
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {evt.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">SCHEDULE</span>
                  <span className="text-white">{formatDate(evt.eventDate)}</span>
                  <span className="block text-[10px]">
                    {formatTime(evt.startTime)} - {formatTime(evt.endTime)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">ATTENDANCE WINDOW</span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {evt.attendanceOpens} to {evt.attendanceCloses}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <Link
                  href={`/lits/events/${evt.id}/attendance`}
                  className="text-emerald-400 font-bold hover:text-emerald-300"
                >
                  Attendance & Scanner →
                </Link>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/lits/events/${evt.id}/registrations`}
                    className="text-slate-400 hover:text-white"
                  >
                    Registrations ({evt.currentParticipants})
                  </Link>
                  <Link
                    href={`/lits/events/${evt.id}`}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-200 hover:bg-slate-700"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
