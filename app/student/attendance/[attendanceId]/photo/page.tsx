"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  Camera,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowLeft,
} from "lucide-react";
import { AttendanceRecord, EventItem } from "@/lib/types";
import { formatTime, validatePhotoTimestamp } from "@/lib/utils";

const SAMPLE_ATTENDANCE_PHOTOS = [
  {
    name: "Auditorium Participant Selfie",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Technical Workshop Coding Photo",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Badge & Auditorium Stage Photo",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
  },
];

export default function StudentPhotoUploadPage() {
  const params = useParams();
  const router = useRouter();
  const attendanceId = params.attendanceId as string;

  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoTime, setPhotoTime] = useState<string>("");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    flags: string[];
    notes: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attRes = await fetch(`/api/attendance?id=${attendanceId}`).then((r) => r.json());
        if (attRes && !attRes.error) {
          setRecord(attRes);
          if (attRes.photoUrl) setPhotoUrl(attRes.photoUrl);
          else setPhotoUrl(SAMPLE_ATTENDANCE_PHOTOS[0].url);

          const d = new Date();
          const offset = d.getTimezoneOffset() * 60000;
          const localIso = new Date(d.getTime() - offset).toISOString().slice(0, 19);
          setPhotoTime(attRes.photoTimestamp ? attRes.photoTimestamp.slice(0, 19) : localIso);

          const evRes = await fetch(`/api/events?id=${attRes.eventId}`).then((r) => r.json());
          if (evRes && !evRes.error) setEvent(evRes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attendanceId]);

  useEffect(() => {
    if (!photoTime || !event || !record) return;
    try {
      const val = validatePhotoTimestamp(
        photoTime,
        event.attendanceOpens,
        event.attendanceCloses,
        record.checkInTimestamp
      );
      setValidationResult(val);
    } catch {
      setValidationResult(null);
    }
  }, [photoTime, event, record]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    if (!photoUrl || !photoTime || !record) {
      setErrorMsg("Please upload a photo and provide the timestamp.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_PHOTO",
          attendanceId: record.id,
          photoUrl,
          photoTimestamp: new Date(photoTime).toISOString(),
          studentName: record.studentName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit photo");

      router.push(`/student/attendance/${record.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit attendance photo");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell allowedRoles={["STUDENT"]}>
        <div className="p-12 text-center text-xs text-slate-500">Loading upload form...</div>
      </AppShell>
    );
  }

  if (!record || !event) {
    return (
      <AppShell allowedRoles={["STUDENT"]}>
        <div className="p-12 text-center space-y-3">
          <p className="text-sm font-bold text-white">Record Not Found</p>
          <Link href="/student/attendance" className="text-xs text-indigo-400 font-semibold">
            ← Return to Attendance
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell allowedRoles={["STUDENT"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href={`/student/attendance/${record.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Record Details
        </Link>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-xl font-bold text-white">Submit Attendance Photo</h1>
            <p className="text-xs text-slate-400 mt-1">
              Event: {event.title} • Attendance Record: {record.id}
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-950/50 border border-red-800/60 p-4 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Info className="h-4 w-4 text-indigo-400" />
              Required Presence Verification
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Upload a clear photo proving your attendance inside the venue. The photo must be captured during the official event attendance window (
              <span className="font-semibold text-white">
                {formatTime(event.attendanceOpens)} to {formatTime(event.attendanceCloses)}
              </span>
              ).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo Selection */}
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                Verification Photo
              </label>

              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center group">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Attendance proof" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-10 w-10 text-slate-600 mb-2" />
                )}

                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-indigo-500">
                    <Upload className="h-4 w-4" />
                    Upload from Device
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Sample presets */}
              <div className="mt-3 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Quick Testing Presets:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_ATTENDANCE_PHOTOS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(item.url)}
                      className={`rounded-xl border p-1 text-left transition-all ${
                        photoUrl === item.url
                          ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500"
                          : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >
                      <div className="aspect-video w-full rounded-lg overflow-hidden mb-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <span className="text-[10px] text-slate-300 font-semibold block truncate">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timestamp input */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  Photo Timestamp (Participant Supplied)
                </label>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                  Required
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  required
                  value={photoTime}
                  onChange={(e) => setPhotoTime(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    const offset = d.getTimezoneOffset() * 60000;
                    setPhotoTime(new Date(d.getTime() - offset).toISOString().slice(0, 19));
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Set Now
                </button>
              </div>

              {validationResult && (
                <div
                  className={`rounded-xl p-3 text-xs flex items-start gap-2 ${
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
                    <span className="font-bold block">
                      {validationResult.isValid
                        ? "Photo Timestamp Validated Within Event Window ✓"
                        : "Photo Timestamp Anomaly (Will be flagged for Officer Review)"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      {validationResult.notes}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href={`/student/attendance/${record.id}`}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 text-center flex items-center justify-center hover:bg-slate-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? "Uploading..." : "Submit Photo Proof"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
