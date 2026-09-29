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
  Camera,
  QrCode,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileCheck,
  Plus,
  Edit,
  Eye,
  FileSpreadsheet,
  Users,
  Search,
  CheckCircle2,
  Filter,
  Sparkles,
} from "lucide-react";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";
import PhotoVerificationModal from "./PhotoVerificationModal";
import QRScannerModal from "./QRScannerModal";
import EventEditorModal from "./EventEditorModal";
import EvaluationBuilderModal from "./EvaluationBuilderModal";
import ReportsModal from "./ReportsModal";

interface OfficerDashboardProps {
  currentUser: User;
  events: EventItem[];
  registrations: Registration[];
  attendanceList: AttendanceRecord[];
  evaluations: EvaluationForm[];
  evaluationResponses: EvaluationResponse[];
  onRefreshData: () => void;
  onOpenStudentView: () => void;
}

export default function OfficerDashboard({
  currentUser,
  events,
  registrations,
  attendanceList,
  evaluations,
  evaluationResponses,
  onRefreshData,
  onOpenStudentView,
}: OfficerDashboardProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events[0]?.id || "EVT-001"
  );
  const [officerTab, setOfficerTab] = useState<
    "queue" | "attendance" | "events" | "evaluations"
  >("queue");

  // Filter attendance records
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const eventAttendance = attendanceList.filter((a) => a.eventId === selectedEventId);
  const eventRegs = registrations.filter((r) => r.eventId === selectedEventId);
  const pendingPhotos = attendanceList.filter(
    (a) => a.verificationStatus === "UNDER_REVIEW" || a.photoStatus === "SUBMITTED"
  );

  // Modals state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [activeAttForVerify, setActiveAttForVerify] = useState<AttendanceRecord | null>(null);

  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);

  const [evalBuilderOpen, setEvalBuilderOpen] = useState(false);

  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenVerify = (record: AttendanceRecord) => {
    setActiveAttForVerify(record);
    setVerifyModalOpen(true);
  };

  const handleCreateEvent = () => {
    setEventToEdit(null);
    setEventModalOpen(true);
  };

  const handleEditEvent = (evt: EventItem) => {
    setEventToEdit(evt);
    setEventModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Officer Header & Quick Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">LITS Officer Control Center</h2>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                ACTIVE OFFICER: {currentUser.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify attendance photos, scan entrance QR tokens, configure events, and unlock evaluations.
            </p>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setScannerModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 active:scale-95 transition-all"
          >
            <QrCode className="h-4 w-4" />
            Launch QR Scanner
          </button>

          <button
            onClick={handleCreateEvent}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-400" />
            New Event
          </button>

          <button
            onClick={() => setReportsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Selected Event Focus Banner & Tabs */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
        {/* Event Selector Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Managing Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              {formatDate(selectedEvent.eventDate)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              Window: {formatTime(selectedEvent.attendanceOpens)} –{" "}
              {formatTime(selectedEvent.attendanceCloses)}
            </span>
            <span>•</span>
            <button
              onClick={() => handleEditEvent(selectedEvent)}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <Edit className="h-3 w-3" />
              Edit Details
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setOfficerTab("queue")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
              officerTab === "queue"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera className="h-4 w-4" />
            Photo Verification Queue
            {pendingPhotos.length > 0 && (
              <span className="rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-mono">
                {pendingPhotos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setOfficerTab("attendance")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
              officerTab === "attendance"
                ? "border-indigo-500 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4" />
            Attendance Roster & Scans ({eventAttendance.length})
          </button>

          <button
            onClick={() => setOfficerTab("events")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
              officerTab === "events"
                ? "border-indigo-500 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="h-4 w-4" />
            All Events Management ({events.length})
          </button>

          <button
            onClick={() => setOfficerTab("evaluations")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
              officerTab === "evaluations"
                ? "border-sky-400 text-sky-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCheck className="h-4 w-4" />
            Evaluation Builder & Results
          </button>
        </div>

        {/* Tab 1: Photo Verification Queue (Primary Business Workflow) */}
        {officerTab === "queue" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="h-4 w-4 text-amber-400" />
                  Mandatory Attendance Photo Review Queue
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review student verification photos against server timestamps and attendance windows
                  to unlock event evaluations.
                </p>
              </div>

              {pendingPhotos.length > 0 && (
                <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  {pendingPhotos.length} photo(s) awaiting verification
                </span>
              )}
            </div>

            {pendingPhotos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">All Submitted Photos Verified!</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  There are no pending student photos awaiting officer inspection right now.
                  You can use the Student Portal to submit a new test photo.
                </p>
                <button
                  onClick={onOpenStudentView}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
                >
                  Switch to Student to Upload Photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPhotos.map((att) => {
                  const ev = events.find((e) => e.id === att.eventId) || selectedEvent;
                  return (
                    <div
                      key={att.id}
                      className="rounded-2xl border border-amber-500/40 bg-slate-950/70 p-4 space-y-3 shadow-lg"
                    >
                      {/* Student info & status */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{att.studentName}</h4>
                          <span className="text-xs text-slate-400">
                            {att.studentId} • {att.course} {att.yearLevel}
                          </span>
                        </div>
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                          PENDING REVIEW
                        </span>
                      </div>

                      {/* Photo Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                        {att.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={att.photoUrl}
                            alt="Student attendance preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-500">
                            No photo
                          </div>
                        )}
                      </div>

                      {/* Timestamp Badges */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-500 block">QR SCAN TIME</span>
                          <span className="font-mono text-emerald-400">
                            {formatTime(att.checkInTimestamp)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">PHOTO TIME</span>
                          <span className="font-mono text-amber-300">
                            {att.photoTimestamp ? formatTime(att.photoTimestamp) : "N/A"}
                          </span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Event Window:</span>
                          <span className="font-semibold text-slate-300">
                            {formatTime(ev.attendanceOpens)} - {formatTime(ev.attendanceCloses)}
                          </span>
                        </div>
                      </div>

                      {/* Inspect & Verify Button */}
                      <button
                        onClick={() => handleOpenVerify(att)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Inspect & Verify Photo
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Attendance Roster & Scans */}
        {officerTab === "attendance" && (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search student or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-56"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScannerModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  Scan Next QR
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950 font-semibold text-slate-400">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Course / Year</th>
                    <th className="p-3">QR Check-In</th>
                    <th className="p-3">Photo Status</th>
                    <th className="p-3">Verification</th>
                    <th className="p-3">Evaluation</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {eventAttendance
                    .filter(
                      (a) =>
                        a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.studentId.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((a) => (
                      <tr key={a.id} className="hover:bg-slate-900/40">
                        <td className="p-3">
                          <div className="font-bold text-white">{a.studentName}</div>
                          <div className="text-[10px] font-mono text-slate-500">{a.studentId}</div>
                        </td>
                        <td className="p-3">
                          <span>{a.course}</span>
                          <span className="text-slate-500 block text-[10px]">{a.yearLevel}</span>
                        </td>
                        <td className="p-3 font-mono text-emerald-400">
                          {formatTime(a.checkInTimestamp)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              a.photoStatus === "VERIFIED"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : a.photoStatus === "SUBMITTED"
                                ? "bg-amber-500/20 text-amber-300"
                                : a.photoStatus === "REJECTED"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {a.photoStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              a.verificationStatus === "VERIFIED"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : a.verificationStatus === "UNDER_REVIEW"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : a.verificationStatus === "REJECTED"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {a.verificationStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          {a.evaluationUnlocked ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Unlocked
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Locked</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {a.photoUrl && (
                            <button
                              onClick={() => handleOpenVerify(a)}
                              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700"
                            >
                              Inspect Photo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: All Events Management */}
        {officerTab === "events" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Event Catalogs & Schedules</h4>
                <p className="text-xs text-slate-400">Create, publish, and monitor events</p>
              </div>
              <button
                onClick={handleCreateEvent}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">
                        {evt.id}
                      </span>
                      <h5 className="text-sm font-bold text-white mt-0.5">{evt.title}</h5>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        evt.status === "ONGOING"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : evt.status === "PUBLISHED"
                          ? "bg-sky-500/20 text-sky-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block">DATE & VENUE</span>
                      <span className="text-white">{formatDate(evt.eventDate)}</span>
                      <span className="block truncate text-[10px] text-slate-400">{evt.venue}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">PARTICIPANTS</span>
                      <span className="text-white font-bold">
                        {evt.currentParticipants} / {evt.maxParticipants}
                      </span>
                      <span className="block text-[10px] text-slate-400">Capacity</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => handleEditEvent(evt)}
                      className="text-xs text-indigo-400 font-semibold hover:text-indigo-300"
                    >
                      Configure Event
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        setOfficerTab("attendance");
                      }}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700"
                    >
                      View Attendees
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Evaluation Builder & Results */}
        {officerTab === "evaluations" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">Event Evaluation Management</h4>
                <p className="text-xs text-slate-400">
                  Build questionnaires and review feedback submitted by verified attendees.
                </p>
              </div>
              <button
                onClick={() => setEvalBuilderOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Customize Questions
              </button>
            </div>

            {/* Responses Summary */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Responses Received ({evaluationResponses.filter((r) => r.eventId === selectedEventId).length})
                </h5>

                <div className="space-y-3">
                  {evaluationResponses
                    .filter((r) => r.eventId === selectedEventId)
                    .map((resp) => (
                      <div
                        key={resp.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{resp.studentName}</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {formatDateTime(resp.submittedAt)}
                          </span>
                        </div>
                        <div className="space-y-1 text-slate-300">
                          {resp.answers.map((ans, idx) => (
                            <div key={idx} className="bg-slate-950/40 p-2 rounded-lg">
                              <span className="text-[10px] text-slate-400 block font-medium">
                                {ans.questionText}
                              </span>
                              <span className="font-semibold text-indigo-300">
                                {Array.isArray(ans.value) ? ans.value.join(", ") : String(ans.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeAttForVerify && (
        <PhotoVerificationModal
          isOpen={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          attendance={activeAttForVerify}
          event={selectedEvent}
          officerId={currentUser.id}
          officerName={currentUser.name}
          onVerified={() => {
            onRefreshData();
          }}
        />
      )}

      <QRScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        selectedEvent={selectedEvent}
        officerId={currentUser.id}
        officerName={currentUser.name}
        registrations={registrations}
        onScanSuccess={() => {
          onRefreshData();
        }}
      />

      <EventEditorModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        eventToEdit={eventToEdit}
        officerId={currentUser.id}
        onSaved={() => {
          onRefreshData();
        }}
      />

      <EvaluationBuilderModal
        isOpen={evalBuilderOpen}
        onClose={() => setEvalBuilderOpen(false)}
        event={selectedEvent}
        existingForm={evaluations.find((e) => e.eventId === selectedEventId)}
        onSaved={() => {
          onRefreshData();
        }}
      />

      <ReportsModal
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
        event={selectedEvent}
        registrations={registrations}
        attendanceList={attendanceList}
        evaluationResponses={evaluationResponses}
      />
    </div>
  );
}
