"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle,
  ArrowRight,
  Filter,
} from "lucide-react";
import { EventItem, Registration } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function StudentEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "open" | "mine">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, regRes] = await Promise.all([
          fetch("/api/events").then((r) => r.json()),
          fetch("/api/registrations").then((r) => r.json()),
        ]);
        if (Array.isArray(evRes)) setEvents(evRes);
        if (Array.isArray(regRes)) setRegistrations(regRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const registeredEventIds = new Set(registrations.map((r) => r.eventId));

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      evt.venue.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "open") {
      return (
        evt.status === "PUBLISHED" ||
        (evt.status === "ONGOING" && evt.currentParticipants < evt.maxParticipants)
      );
    }
    if (filterTab === "mine") {
      return registeredEventIds.has(evt.id);
    }
    return true;
  });

  return (
    <AppShell allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">Campus Events</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Discover official IT workshops, symposiums, and tech competitions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-56"
              />
            </div>

            <div className="flex rounded-xl border border-slate-800 bg-slate-900/80 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === "all" ? "bg-indigo-600 text-white" : "text-slate-400"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab("open")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === "open" ? "bg-indigo-600 text-white" : "text-slate-400"
                }`}
              >
                Open Slots
              </button>
              <button
                onClick={() => setFilterTab("mine")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === "mine" ? "bg-indigo-600 text-white" : "text-slate-400"
                }`}
              >
                Registered ({registrations.length})
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => {
            const isRegistered = registeredEventIds.has(evt.id);
            const isFull = evt.currentParticipants >= evt.maxParticipants;
            const myReg = registrations.find((r) => r.eventId === evt.id);

            return (
              <div
                key={evt.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evt.bannerImage}
                      alt={evt.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          evt.status === "ONGOING"
                            ? "bg-emerald-500/90 text-white"
                            : evt.status === "PUBLISHED"
                            ? "bg-sky-500/90 text-white"
                            : "bg-slate-700/90 text-slate-200"
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{evt.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{formatDate(evt.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          {formatTime(evt.startTime)} – {formatTime(evt.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-cyan-400" />
                        <span>
                          {evt.currentParticipants} / {evt.maxParticipants} Registered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  {isRegistered && myReg ? (
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Registered
                      </span>
                      <Link
                        href={`/student/registrations/${myReg.id}/qr`}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                      >
                        View QR Code →
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={`/student/events/${evt.id}`}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-colors"
                    >
                      {isFull ? "View Details" : "Register Now"}
                    </Link>
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
