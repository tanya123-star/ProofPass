"use client";

import React, { useState, useEffect } from "react";
import { AttendanceRecord, EventItem } from "@/lib/types";
import {
  X,
  Camera,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { formatTime, validatePhotoTimestamp } from "@/lib/utils";

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: AttendanceRecord;
  event: EventItem;
  onPhotoUploaded: (updatedAttendance: AttendanceRecord) => void;
}

const SAMPLE_ATTENDANCE_PHOTOS = [
  {
    name: "Auditorium Participant Selfie",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    desc: "Selfie in event hall during session",
  },
  {
    name: "Technical Workshop Coding Photo",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    desc: "Hands-on participation at lab table",
  },
  {
    name: "Badge & Auditorium Stage Photo",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    desc: "Stage view with event backdrop",
  },
];

export default function PhotoUploadModal({
  isOpen,
  onClose,
  attendance,
  event,
  onPhotoUploaded,
}: PhotoUploadModalProps) {
  const [photoUrl, setPhotoUrl] = useState<string>(attendance.photoUrl || "");
  const [photoTime, setPhotoTime] = useState<string>("");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    flags: string[];
    notes: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize photo timestamp to now or 3 minutes after QR scan
  useEffect(() => {
    if (!isOpen) return;

    if (attendance.photoTimestamp) {
      setPhotoTime(attendance.photoTimestamp.slice(0, 19));
    } else {
      const d = new Date();
      // Format as local datetime-local string (YYYY-MM-DDTHH:mm:ss)
      const offset = d.getTimezoneOffset() * 60000;
      const localIso = new Date(d.getTime() - offset).toISOString().slice(0, 19);
      setPhotoTime(localIso);
    }

    if (attendance.photoUrl) {
      setPhotoUrl(attendance.photoUrl);
    } else {
      setPhotoUrl(SAMPLE_ATTENDANCE_PHOTOS[0].url);
    }
  }, [isOpen, attendance]);

  // Recalculate validation whenever photoTime changes
  useEffect(() => {
    if (!photoTime) return;
    try {
      const val = validatePhotoTimestamp(
        photoTime,
        event.attendanceOpens,
        event.attendanceCloses,
        attendance.checkInTimestamp
      );
      setValidationResult(val);
    } catch {
      setValidationResult(null);
    }
  }, [photoTime, event, attendance.checkInTimestamp]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read lastModified timestamp from file
    if (file.lastModified) {
      const fileDate = new Date(file.lastModified);
      const offset = fileDate.getTimezoneOffset() * 60000;
      const localIso = new Date(fileDate.getTime() - offset).toISOString().slice(0, 19);
      setPhotoTime(localIso);
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (typeof uploadEvent.target?.result === "string") {
        setPhotoUrl(uploadEvent.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) {
      setErrorMsg("Please select or upload an attendance photo.");
      return;
    }
    if (!photoTime) {
      setErrorMsg("Please provide the timestamp when the photo was taken.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_PHOTO",
          attendanceId: attendance.id,
          photoUrl,
          photoTimestamp: new Date(photoTime).toISOString(),
          studentName: attendance.studentName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit photo");
      }

      onPhotoUploaded(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit attendance photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mandatory Attendance Photo</h3>
              <p className="text-xs text-slate-400">
                Photo & Timestamp Verification (Required by LITS)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* System Notice explaining the requirement */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-300">
            <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              Why is this photo required?
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Per LITS event security rules, check-in QR scan must be backed by a timestamped photo
              taken inside the venue during the official attendance window (
              <span className="text-indigo-300 font-semibold">
                {formatTime(event.attendanceOpens)} – {formatTime(event.attendanceCloses)}
              </span>
              ). Once approved by an officer, your event evaluation will automatically unlock.
            </p>
          </div>

          {/* Check-in timestamp reference */}
          <div className="grid grid-cols-2 gap-2 text-xs rounded-xl bg-slate-950/40 border border-slate-800/80 p-3">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Server QR Check-In Time</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {formatTime(attendance.checkInTimestamp)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Attendance Window</span>
              <span className="text-slate-300">
                {formatTime(event.attendanceOpens)} to {formatTime(event.attendanceCloses)}
              </span>
            </div>
          </div>

          {/* Photo Preview & Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Select or Upload Attendance Photo
            </label>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center group">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Attendance proof"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <Camera className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Click below or upload an image file</p>
                </div>
              )}

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:bg-indigo-500">
                  <Upload className="h-3.5 w-3.5" />
                  Upload from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Quick Sample Photos for immediate testing */}
            <div className="mt-3">
              <span className="text-[10px] text-slate-400 font-medium block mb-1.5">
                Quick Test Samples (Click to select):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_ATTENDANCE_PHOTOS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoUrl(item.url)}
                    className={`rounded-lg border p-1 text-left transition-all ${
                      photoUrl === item.url
                        ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500"
                        : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                    }`}
                  >
                    <div className="aspect-video w-full rounded overflow-hidden mb-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-200 truncate">
                      {item.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Timestamp Input (Mandatory) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                Photo Timestamp (Mandatory)
              </label>
              <span className="text-[10px] rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 font-medium">
                Participant Supplied
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={photoTime}
                onChange={(e) => setPhotoTime(e.target.value)}
                required
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  const offset = d.getTimezoneOffset() * 60000;
                  setPhotoTime(new Date(d.getTime() - offset).toISOString().slice(0, 19));
                }}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-[11px] font-medium text-slate-300 hover:bg-slate-700"
              >
                Set to Now
              </button>
            </div>

            {/* Validation Feedback */}
            {validationResult && (
              <div
                className={`rounded-xl p-2.5 text-xs flex items-start gap-2 ${
                  validationResult.isValid
                    ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-300"
                    : "bg-amber-950/40 border border-amber-800/40 text-amber-300"
                }`}
              >
                {validationResult.isValid ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {validationResult.isValid
                      ? "Timestamp Validated Within Attendance Window ✓"
                      : "Timestamp Anomaly Detected (Will be flagged for Officer Review)"}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {validationResult.notes}
                  </div>
                </div>
              </div>
            )}

            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Server upload timestamp is stamped on submission</span>
              <span className="font-mono text-slate-400">Authoritative: Server Time</span>
            </div>
          </div>

          {/* Action buttons */}
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
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Submit Verification Photo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
