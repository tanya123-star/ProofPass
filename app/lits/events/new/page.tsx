"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Calendar, Clock, MapPin, Users, ArrowLeft, AlertCircle } from "lucide-react";
import { EventItem, EventStatus } from "@/lib/types";

export default function LitsCreateEventPage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("IT Building Auditorium, 4th Floor");
  const [eventDate, setEventDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [attendanceOpens, setAttendanceOpens] = useState("08:30");
  const [attendanceCloses, setAttendanceCloses] = useState("17:30");
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [status, setStatus] = useState<EventStatus>("PUBLISHED");
  const [bannerImage, setBannerImage] = useState(
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload: EventItem = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        title,
        description,
        bannerImage,
        venue,
        eventDate,
        startTime,
        endTime,
        registrationOpens: `${eventDate}T00:00:00Z`,
        registrationCloses: `${eventDate}T23:59:59Z`,
        attendanceOpens,
        attendanceCloses,
        maxParticipants: Number(maxParticipants),
        currentParticipants: 0,
        eligibility: { type: "open" },
        status,
        createdBy: "LITS Officer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      router.push(`/lits/events/${data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell allowedRoles={["LITS", "ADMIN"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/lits/events"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Events List
        </Link>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-xl font-bold text-white">Create New LITS Event</h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure title, venue, registration capacity, and attendance validation windows
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-950/50 border border-red-800/60 p-4 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Event Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Web Architecture DevCon"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event overview, agenda, speaker profiles..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Venue</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Attendance window */}
            <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-4 space-y-2">
              <span className="text-xs font-bold text-indigo-300 block">
                Official Attendance Window (Used for Photo Timestamp Validation)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Attendance Opens</label>
                  <input
                    type="time"
                    required
                    value={attendanceOpens}
                    onChange={(e) => setAttendanceOpens(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Attendance Closes</label>
                  <input
                    type="time"
                    required
                    value={attendanceCloses}
                    onChange={(e) => setAttendanceCloses(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Participant Capacity Limit
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 100)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Event Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ONGOING">ONGOING (Today)</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Banner Image URL
              </label>
              <input
                type="url"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Link
                href="/lits/events"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 text-center flex items-center justify-center hover:bg-slate-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Publishing Event..." : "Create & Publish Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
