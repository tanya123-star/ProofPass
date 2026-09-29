"use client";

import React, { useState } from "react";
import { EventItem, User, Registration } from "@/lib/types";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  currentUser: User;
  onRegistered: (newReg: Registration) => void;
}

export default function EventRegistrationModal({
  isOpen,
  onClose,
  event,
  currentUser,
  onRegistered,
}: EventRegistrationModalProps) {
  const [studentId, setStudentId] = useState(currentUser.studentId || "2024-BSIT-0145");
  const [name, setName] = useState(currentUser.name || "Juan Dela Cruz");
  const [email, setEmail] = useState(currentUser.email || "juan.delacruz@acdeducation.com");
  const [course, setCourse] = useState(currentUser.course || "BSIT");
  const [yearLevel, setYearLevel] = useState(currentUser.yearLevel || "3rd Year");
  const [contactNumber, setContactNumber] = useState("+63 917 123 4567");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const isFull = event.currentParticipants >= event.maxParticipants;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull) {
      setErrorMsg("This event has reached full capacity.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          studentId,
          studentName: name,
          studentEmail: email,
          course,
          yearLevel,
          contactNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      onRegistered(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register for event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-white">Event Registration</h3>
            <p className="text-xs text-slate-400">Quick Event Token Provisioning</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Event Quick Summary */}
        <div className="bg-slate-950/40 p-5 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white">{event.title}</h4>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              {formatDate(event.eventDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </span>
            <span className="flex items-center gap-1.5 col-span-2">
              <MapPin className="h-3.5 w-3.5 text-indigo-400" />
              {event.venue}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              Capacity: {event.currentParticipants} / {event.maxParticipants} slots filled
            </span>
            {isFull ? (
              <span className="rounded bg-red-500/20 text-red-400 px-2 py-0.5 text-[10px] font-bold">
                FULL CAPACITY
              </span>
            ) : (
              <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                SLOTS AVAILABLE
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student ID
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Program / Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="BSIT">BS Information Technology (BSIT)</option>
                <option value="BSCS">BS Computer Science (BSCS)</option>
                <option value="BSIS">BS Information Systems (BSIS)</option>
                <option value="BSEMC">BS Entertainment & Multimedia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Year Level
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3 text-xs text-indigo-300 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
            <span>
              Upon submission, a unique event attendance QR token is generated. No sensitive
              personal details are embedded directly inside the QR string.
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isFull}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Registering...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Confirm & Get QR
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
