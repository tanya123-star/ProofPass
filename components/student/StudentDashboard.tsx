"use client";

import React, { useState } from "react";
import {
  User,
  EventItem,
  Registration,
  AttendanceRecord,
  EvaluationForm,
  EvaluationResponse,
} from "@/lib/types";
import {
  QrCode,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Camera,
  FileCheck,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  ChevronRight,
  Eye,
  Info,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import QRCodeModal from "./QRCodeModal";
import PhotoUploadModal from "./PhotoUploadModal";
import EvaluationFormModal from "./EvaluationFormModal";
import EventRegistrationModal from "./EventRegistrationModal";

interface StudentDashboardProps {
  currentUser: User;
  events: EventItem[];
  registrations: Registration[];
  attendanceList: AttendanceRecord[];
  evaluations: EvaluationForm[];
  evaluationResponses: EvaluationResponse[];
  onRefreshData: () => void;
  onOpenOfficerScanner: () => void;
}

export default function StudentDashboard({
  currentUser,
  events,
  registrations,
  attendanceList,
  evaluations,
  evaluationResponses,
  onRefreshData,
  onOpenOfficerScanner,
}: StudentDashboardProps) {
  // Filter registrations for current student
  const studentRegs = registrations.filter(
    (r) =>
      r.studentEmail === currentUser.email ||
      (currentUser.studentId && r.studentId === currentUser.studentId)
  );

  // Active / Selected event state
  const [selectedEventId, setSelectedEventId] = useState<string>(
    studentRegs[0]?.eventId || events[0]?.id || "EVT-001"
  );

  // Modals state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeRegForQr, setActiveRegForQr] = useState<Registration | null>(null);
  const [activeEventForQr, setActiveEventForQr] = useState<EventItem | null>(null);

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [activeAttForPhoto, setActiveAttForPhoto] = useState<AttendanceRecord | null>(null);
  const [activeEventForPhoto, setActiveEventForPhoto] = useState<EventItem | null>(null);

  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [activeEvalForm, setActiveEvalForm] = useState<EvaluationForm | null>(null);

  const [regModalOpen, setRegModalOpen] = useState(false);
  const [eventToRegister, setEventToRegister] = useState<EventItem | null>(null);

  // Find attendance record for selected event
  const currentReg = studentRegs.find((r) => r.eventId === selectedEventId);
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const currentAttendance = attendanceList.find(
    (a) =>
      a.eventId === selectedEventId &&
      (a.studentId === currentUser.studentId || a.studentName === currentUser.name)
  );

  const currentEvalForm = evaluations.find((e) => e.eventId === selectedEventId);
  const hasSubmittedEval = evaluationResponses.some(
    (resp) =>
      resp.eventId === selectedEventId &&
      (resp.studentId === currentUser.studentId || resp.studentName === currentUser.name)
  );

  // Calculate status steps for visual tracker
  const isRegistered = !!currentReg;
  const isCheckedIn = !!currentAttendance;
  const isPhotoSubmitted = currentAttendance?.photoStatus === "SUBMITTED" || currentAttendance?.photoStatus === "VERIFIED";
  const isVerified = currentAttendance?.verificationStatus === "VERIFIED";
  const isEvaluationUnlocked = currentAttendance?.evaluationUnlocked === true;

  const handleOpenQr = (reg: Registration, evt: EventItem) => {
    setActiveRegForQr(reg);
    setActiveEventForQr(evt);
    setQrModalOpen(true);
  };

  const handleOpenPhoto = (att: AttendanceRecord, evt: EventItem) => {
    setActiveAttForPhoto(att);
    setActiveEventForPhoto(evt);
    setPhotoModalOpen(true);
  };

  const handleOpenEval = (form: EvaluationForm) => {
    setActiveEvalForm(form);
    setEvalModalOpen(true);
  };

  const handleOpenRegister = (evt: EventItem) => {
    setEventToRegister(evt);
    setRegModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Student Profile Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-lg font-bold">
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{currentUser.name}</h2>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                Student ID: {currentUser.studentId || "2024-BSIT-0145"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentUser.course || "BSIT"} • {currentUser.yearLevel || "3rd Year"} •{" "}
              {currentUser.email}
            </p>
          </div>
        </div>

        {/* Quick Testing helper hint */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenOfficerScanner}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <Camera className="h-3.5 w-3.5" />
            Switch to Officer Scanner to Test Check-In
          </button>
        </div>
      </div>

      {/* Main Focus: Active Event & Attendance Workflow Tracker */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Active Attendance Lifecycle
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">{currentEvent.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                {formatDate(currentEvent.eventDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                {formatTime(currentEvent.startTime)} – {formatTime(currentEvent.endTime)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                {currentEvent.venue}
              </span>
            </div>
          </div>

          {/* Event selector if student has multiple registrations */}
          {studentRegs.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Select Event:</span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {studentRegs.map((r) => {
                  const ev = events.find((e) => e.id === r.eventId);
                  return (
                    <option key={r.id} value={r.eventId}>
                      {ev ? ev.title : r.eventId}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* 5-Step Visual Progress Bar */}
        <div className="mt-8">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Mandatory Verification Progression</span>
            <span className="text-[11px] font-mono text-indigo-300">
              {isEvaluationUnlocked
                ? "5/5 Fully Verified ✓"
                : isVerified
                ? "4/5 Evaluation Ready"
                : isPhotoSubmitted
                ? "3/5 Under Review"
                : isCheckedIn
                ? "2/5 Photo Required"
                : isRegistered
                ? "1/5 QR Ready"
                : "0/5 Not Registered"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Step 1: Registration */}
            <div
              className={`rounded-2xl border p-4 transition-all ${
                isRegistered
                  ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                  : "border-slate-800 bg-slate-900/40 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Step 1</span>
                {isRegistered ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-700" />
                )}
              </div>
              <h4 className="mt-2 text-xs font-bold text-white">Event Registration</h4>
              <p className="mt-1 text-[11px] text-slate-400">
                {isRegistered ? `Registered (${currentReg?.id})` : "Registration needed"}
              </p>
              {isRegistered && currentReg && (
                <button
                  onClick={() => handleOpenQr(currentReg, currentEvent)}
                  className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <QrCode className="h-3 w-3" />
                  View QR Code
                </button>
              )}
            </div>

            {/* Step 2: QR Check-In Scan */}
            <div
              className={`rounded-2xl border p-4 transition-all ${
                isCheckedIn
                  ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                  : isRegistered
                  ? "border-indigo-500/40 bg-indigo-950/20 text-indigo-300"
                  : "border-slate-800 bg-slate-900/40 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Step 2</span>
                {isCheckedIn ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-700" />
                )}
              </div>
              <h4 className="mt-2 text-xs font-bold text-white">Officer QR Scan</h4>
              <p className="mt-1 text-[11px] text-slate-400">
                {isCheckedIn
                  ? `Checked in at ${formatTime(currentAttendance!.checkInTimestamp)}`
                  : "Present QR to officer"}
              </p>
              {!isCheckedIn && isRegistered && (
                <span className="mt-3 inline-block rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] text-indigo-400 font-mono">
                  Pending Scan
                </span>
              )}
            </div>

            {/* Step 3: Mandatory Attendance Photo */}
            <div
              className={`rounded-2xl border p-4 transition-all ${
                isPhotoSubmitted
                  ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                  : isCheckedIn
                  ? "border-amber-500/40 bg-amber-950/20 text-amber-300 ring-1 ring-amber-500/30"
                  : "border-slate-800 bg-slate-900/40 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Step 3</span>
                {isPhotoSubmitted ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : isCheckedIn ? (
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-700" />
                )}
              </div>
              <h4 className="mt-2 text-xs font-bold text-white">Mandatory Photo</h4>
              <p className="mt-1 text-[11px] text-slate-400">
                {isPhotoSubmitted
                  ? `Uploaded (${formatTime(currentAttendance!.photoTimestamp || "")})`
                  : isCheckedIn
                  ? "Photo Required Now"
                  : "Unlocks after QR scan"}
              </p>
              {isCheckedIn && (
                <button
                  onClick={() => handleOpenPhoto(currentAttendance!, currentEvent)}
                  className="mt-3 flex items-center gap-1 rounded-lg bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/30"
                >
                  <Camera className="h-3 w-3" />
                  {isPhotoSubmitted ? "Re-upload / View" : "Upload Photo"}
                </button>
              )}
            </div>

            {/* Step 4: LITS Officer Verification */}
            <div
              className={`rounded-2xl border p-4 transition-all ${
                isVerified
                  ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                  : currentAttendance?.verificationStatus === "REJECTED"
                  ? "border-red-500/40 bg-red-950/20 text-red-300"
                  : isPhotoSubmitted
                  ? "border-amber-500/40 bg-amber-950/20 text-amber-300"
                  : "border-slate-800 bg-slate-900/40 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Step 4</span>
                {isVerified ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-700" />
                )}
              </div>
              <h4 className="mt-2 text-xs font-bold text-white">Photo Verification</h4>
              <p className="mt-1 text-[11px] text-slate-400">
                {isVerified
                  ? "Officially Approved ✓"
                  : currentAttendance?.verificationStatus === "REJECTED"
                  ? "Photo Rejected"
                  : isPhotoSubmitted
                  ? "Under Review by Officer"
                  : "Awaiting photo upload"}
              </p>
              {currentAttendance?.verificationStatus === "REJECTED" && (
                <div className="mt-2 rounded bg-red-500/10 p-1.5 text-[10px] text-red-300">
                  {currentAttendance.rejectionReason}
                </div>
              )}
            </div>

            {/* Step 5: Event Evaluation */}
            <div
              className={`rounded-2xl border p-4 transition-all ${
                hasSubmittedEval
                  ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                  : isEvaluationUnlocked
                  ? "border-indigo-500/40 bg-indigo-950/20 text-indigo-300 ring-1 ring-indigo-500"
                  : "border-slate-800 bg-slate-900/40 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Step 5</span>
                {hasSubmittedEval ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : isEvaluationUnlocked ? (
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-slate-600" />
                )}
              </div>
              <h4 className="mt-2 text-xs font-bold text-white">Event Evaluation</h4>
              <p className="mt-1 text-[11px] text-slate-400">
                {hasSubmittedEval
                  ? "Evaluation Submitted ✓"
                  : isEvaluationUnlocked
                  ? "Available to Answer!"
                  : "Locked until verified"}
              </p>
              {currentEvalForm && (
                <button
                  onClick={() => handleOpenEval(currentEvalForm)}
                  className={`mt-3 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all ${
                    isEvaluationUnlocked
                      ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {isEvaluationUnlocked ? (
                    <>
                      <FileCheck className="h-3 w-3" />
                      {hasSubmittedEval ? "View Completed" : "Start Evaluation"}
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      Locked
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Callout depending on current state */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          {!isRegistered ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 className="text-sm font-bold text-white">
                  You are not yet registered for this event
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register now to receive your unique event QR token and secure your attendance slot.
                </p>
              </div>
              <button
                onClick={() => handleOpenRegister(currentEvent)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
              >
                Register Now
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : !isCheckedIn ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-indigo-400" />
                  Your QR Code is Ready for Entrance Scanning
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Present your QR code to the LITS Officer at the door. Attendance window:{" "}
                  <span className="text-emerald-400 font-semibold font-mono">
                    {formatTime(currentEvent.attendanceOpens)} – {formatTime(currentEvent.attendanceCloses)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenQr(currentReg!, currentEvent)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Show My QR Code
                </button>
                <button
                  onClick={onOpenOfficerScanner}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
                  title="Simulate scanning this QR code as an officer"
                >
                  Scan as Officer
                </button>
              </div>
            </div>
          ) : !isPhotoSubmitted ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  QR Scanned! Mandatory Attendance Photo Required
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check-in server timestamp was recorded at{" "}
                  <span className="font-mono text-emerald-400">
                    {formatTime(currentAttendance!.checkInTimestamp)}
                  </span>
                  . Upload your verification photo taken in the hall to proceed.
                </p>
              </div>
              <button
                onClick={() => handleOpenPhoto(currentAttendance!, currentEvent)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/25"
              >
                <Camera className="h-3.5 w-3.5" />
                Upload Attendance Photo
              </button>
            </div>
          ) : !isVerified ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Photo Submitted — Awaiting LITS Officer Review
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your photo timestamp was recorded. Once a LITS Officer approves it in their
                  verification desk, your evaluation will unlock immediately.
                </p>
              </div>
              <button
                onClick={onOpenOfficerScanner}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
              >
                Switch to Officer Desk to Verify
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : !hasSubmittedEval ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Attendance Confirmed & Verified! Evaluation Unlocked
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  You are officially marked present. Please complete the event evaluation form to
                  finish your participation.
                </p>
              </div>
              {currentEvalForm && (
                <button
                  onClick={() => handleOpenEval(currentEvalForm)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                >
                  <FileCheck className="h-4 w-4" />
                  Answer Evaluation Form
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">
                  Event Journey 100% Complete!
                </h5>
                <p className="text-xs text-slate-400">
                  Registration, QR Check-in, Timestamped Photo Verification, and Evaluation all
                  successfully concluded.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available & Upcoming Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">All Events</h3>
            <p className="text-xs text-slate-400">
              Browse campus tech conferences, workshops, and symposiums
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {events.map((evt) => {
            const isReg = studentRegs.some((r) => r.eventId === evt.id);
            const isFull = evt.currentParticipants >= evt.maxParticipants;
            const isSelected = evt.id === selectedEventId;

            return (
              <div
                key={evt.id}
                className={`overflow-hidden rounded-2xl border transition-all ${
                  isSelected
                    ? "border-indigo-500/80 bg-slate-900/90 ring-1 ring-indigo-500/50 shadow-xl"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                {/* Banner */}
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

                {/* Event Details */}
                <div className="p-4 space-y-3">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{evt.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
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

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between">
                    {isReg ? (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          Registered
                        </span>
                        <button
                          onClick={() => setSelectedEventId(evt.id)}
                          className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
                        >
                          View Tracker
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenRegister(evt)}
                        disabled={isFull}
                        className="w-full rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isFull ? "Capacity Reached" : "Register for Event"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Dialogs */}
      {activeRegForQr && activeEventForQr && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          registration={activeRegForQr}
          event={activeEventForQr}
        />
      )}

      {activeAttForPhoto && activeEventForPhoto && (
        <PhotoUploadModal
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          attendance={activeAttForPhoto}
          event={activeEventForPhoto}
          onPhotoUploaded={() => {
            onRefreshData();
          }}
        />
      )}

      {activeEvalForm && (
        <EvaluationFormModal
          isOpen={evalModalOpen}
          onClose={() => setEvalModalOpen(false)}
          form={activeEvalForm}
          attendance={currentAttendance}
          hasAlreadySubmitted={hasSubmittedEval}
          onSubmitted={() => {
            onRefreshData();
          }}
        />
      )}

      {eventToRegister && (
        <EventRegistrationModal
          isOpen={regModalOpen}
          onClose={() => setRegModalOpen(false)}
          event={eventToRegister}
          currentUser={currentUser}
          onRegistered={(newReg) => {
            onRefreshData();
            setSelectedEventId(newReg.eventId);
            // Open QR code right away!
            handleOpenQr(newReg, eventToRegister);
          }}
        />
      )}
    </div>
  );
}
