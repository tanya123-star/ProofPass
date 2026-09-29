"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import AppShell from "@/components/AppShell";
import {
  QrCode,
  Calendar,
  Clock,
  MapPin,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Registration, EventItem } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function StudentQrCodePage() {
  const params = useParams();
  const participantId = params.participantId as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regRes = await fetch(`/api/registrations?participantId=${participantId}`).then((r) =>
          r.json()
        );
        if (regRes && !regRes.error) {
          setRegistration(regRes);
          const evRes = await fetch(`/api/events?id=${regRes.eventId}`).then((r) => r.json());
          if (evRes && !evRes.error) setEvent(evRes);

          // Generate QR code data URL
          QRCode.toDataURL(
            regRes.qrToken,
            {
              width: 320,
              margin: 2,
              color: { dark: "#0f172a", light: "#ffffff" },
              errorCorrectionLevel: "H",
            },
            (err, url) => {
              if (!err && url) setQrDataUrl(url);
            }
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [participantId]);

  const handleCopy = () => {
    if (!registration) return;
    navigator.clipboard.writeText(registration.qrToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl || !registration) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-${registration.id}-${registration.studentName.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  if (loading) {
    return (
      <AppShell allowedRoles={["STUDENT"]}>
        <div className="p-12 text-center text-xs text-slate-500">Loading QR Token...</div>
      </AppShell>
    );
  }

  if (!registration || !event) {
    return (
      <AppShell allowedRoles={["STUDENT"]}>
        <div className="p-12 text-center space-y-3">
          <p className="text-sm font-bold text-white">Registration Not Found</p>
          <Link href="/student/registrations" className="text-xs text-indigo-400 font-semibold">
            ← Return to Registrations
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell allowedRoles={["STUDENT"]}>
      <div className="max-w-xl mx-auto space-y-6">
        <Link
          href="/student/registrations"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Registrations
        </Link>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div>
            <span className="inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
              Registration Token: {registration.id}
            </span>
            <h1 className="text-xl font-bold text-white mt-2">{event.title}</h1>
            <div className="mt-1 flex items-center justify-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                {formatDate(event.eventDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                {event.venue}
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative mx-auto flex w-64 h-64 items-center justify-center rounded-2xl border-4 border-slate-800 bg-white p-3 shadow-2xl">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Entrance QR Code"
                className="h-full w-full object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-2" />
                Generating token...
              </div>
            )}
          </div>

          {/* Student Info Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block">STUDENT NAME</span>
                <span className="font-semibold text-white">{registration.studentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">STUDENT ID</span>
                <span className="font-mono text-slate-200">{registration.studentId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">PROGRAM & YEAR</span>
                <span>{registration.course} — {registration.yearLevel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">ATTENDANCE WINDOW</span>
                <span className="text-emerald-400 font-semibold">
                  {formatTime(event.attendanceOpens)} – {formatTime(event.attendanceCloses)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[280px]">
                {registration.qrToken}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:bg-slate-700"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy Token"}
              </button>
            </div>
          </div>

          {/* Instructions Notice */}
          <div className="flex items-start gap-2 rounded-2xl bg-indigo-950/30 border border-indigo-800/30 p-3 text-left text-xs text-indigo-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Present this QR screen to an authorized LITS Officer at the venue entrance. Following QR check-in, you must upload your mandatory physical presence photo inside the hall to unlock the event evaluation.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              Download QR Image
            </button>
            <Link
              href="/student"
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 text-center flex items-center justify-center"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
