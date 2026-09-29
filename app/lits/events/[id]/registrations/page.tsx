"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Users, ArrowLeft, Search, CheckCircle } from "lucide-react";
import { EventItem, Registration } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function LitsEventRegistrationsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, regsRes] = await Promise.all([
          fetch(`/api/events?id=${eventId}`).then((r) => r.json()),
          fetch(`/api/registrations?eventId=${eventId}`).then((r) => r.json()),
        ]);

        if (evRes && !evRes.error) setEvent(evRes);
        if (Array.isArray(regsRes)) setRegistrations(regsRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const filtered = registrations.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase()) ||
      r.course.toLowerCase().includes(search.toLowerCase())
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
              Registered Participants Roster
            </h1>
            <p className="text-xs text-slate-400">
              {event?.title} • {registrations.length} students confirmed
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search student or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950 font-semibold text-slate-400">
              <tr>
                <th className="p-3.5">Registration ID</th>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Program & Year</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Registered At</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40">
                  <td className="p-3.5 font-mono text-indigo-400 font-semibold">{r.id}</td>
                  <td className="p-3.5 font-mono">{r.studentId}</td>
                  <td className="p-3.5 font-bold text-white">{r.studentName}</td>
                  <td className="p-3.5">
                    {r.course} — {r.yearLevel}
                  </td>
                  <td className="p-3.5 text-slate-400">{r.studentEmail}</td>
                  <td className="p-3.5 font-mono text-slate-400">
                    {formatDateTime(r.registeredAt)}
                  </td>
                  <td className="p-3.5">
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
