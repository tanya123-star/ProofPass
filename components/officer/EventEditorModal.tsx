"use client";

import React, { useState, useEffect } from "react";
import { EventItem, EventStatus } from "@/lib/types";
import { X, Calendar, Clock, MapPin, Users, Sparkles, AlertCircle } from "lucide-react";

interface EventEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventItem | null;
  officerId: string;
  onSaved: (event: EventItem) => void;
}

export default function EventEditorModal({
  isOpen,
  onClose,
  eventToEdit,
  officerId,
  onSaved,
}: EventEditorModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
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

  useEffect(() => {
    if (!isOpen) return;

    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      setVenue(eventToEdit.venue);
      setEventDate(eventToEdit.eventDate);
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
      setAttendanceOpens(eventToEdit.attendanceOpens);
      setAttendanceCloses(eventToEdit.attendanceCloses);
      setMaxParticipants(eventToEdit.maxParticipants);
      setStatus(eventToEdit.status);
      setBannerImage(eventToEdit.bannerImage);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setTitle("");
      setDescription("");
      setVenue("IT Building Auditorium, 4th Floor");
      setEventDate(today);
      setStartTime("09:00");
      setEndTime("17:00");
      setAttendanceOpens("08:30");
      setAttendanceCloses("17:30");
      setMaxParticipants(100);
      setStatus("PUBLISHED");
      setBannerImage(
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
      );
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload: EventItem = {
        id: eventToEdit?.id || `EVT-${Date.now()}`,
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
        currentParticipants: eventToEdit?.currentParticipants || 0,
        eligibility: {
          type: "open",
        },
        status,
        createdBy: officerId,
        createdAt: eventToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save event");

      onSaved(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {eventToEdit ? "Edit Event" : "Create New LITS Event"}
            </h3>
            <p className="text-xs text-slate-400">Configure attendance and registration windows</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LITS AI Build 2026: Next-Gen DevCon"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Topics
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide event details, objectives, speaker list..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Venue
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Auditorium, Multimedia Lab..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Event Date
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Attendance Window (Crucial for photo validation rules) */}
          <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-3.5 space-y-2">
            <span className="text-xs font-bold text-indigo-300 block">
              Official Attendance Window (For Photo Timestamp Validation)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Attendance Opens
                </label>
                <input
                  type="time"
                  required
                  value={attendanceOpens}
                  onChange={(e) => setAttendanceOpens(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Attendance Closes
                </label>
                <input
                  type="time"
                  required
                  value={attendanceCloses}
                  onChange={(e) => setAttendanceCloses(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Capacity Limit (Max)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 100)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ONGOING">ONGOING (Today)</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Banner Image URL
            </label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : eventToEdit ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
