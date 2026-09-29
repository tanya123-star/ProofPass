"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Registration, EventItem } from "@/lib/types";
import {
  X,
  QrCode as QrIcon,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Info,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration;
  event: EventItem;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  registration,
  event,
}: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || !registration.qrToken) return;

    // Generate high resolution QR code
    QRCode.toDataURL(
      registration.qrToken,
      {
        width: 320,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [isOpen, registration.qrToken]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(registration.qrToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-${registration.id}-${registration.studentName.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <QrIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Event Attendance QR</h3>
              <p className="text-[11px] text-slate-400">Proofly Security Token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-3">
            <span className="inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
              {registration.id}
            </span>
            <h4 className="mt-2 text-base font-bold text-white">{event.title}</h4>
            <div className="mt-1 flex items-center justify-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-500" />
                {formatDate(event.eventDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-500" />
                {event.venue}
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative mx-auto my-4 flex w-64 h-64 items-center justify-center rounded-2xl border-4 border-slate-800 bg-white p-3 shadow-inner">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Attendance QR Code"
                className="h-full w-full object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-2" />
                Generating secure token...
              </div>
            )}
          </div>

          {/* Student Info Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left text-xs">
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block">STUDENT NAME</span>
                <span className="font-semibold text-white">{registration.studentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">STUDENT ID</span>
                <span className="font-medium text-slate-200">{registration.studentId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">PROGRAM & YEAR</span>
                <span>{registration.course} — {registration.yearLevel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">ATTENDANCE WINDOW</span>
                <span className="text-emerald-400 font-medium">
                  {formatTime(event.attendanceOpens)} - {formatTime(event.attendanceCloses)}
                </span>
              </div>
            </div>

            {/* Token preview with copy */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <div className="truncate max-w-[240px] text-[10px] font-mono text-slate-400">
                {registration.qrToken}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:bg-slate-700"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy Token"}
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-indigo-950/30 border border-indigo-800/30 p-2.5 text-left text-[11px] text-indigo-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
            <p>
              Present this QR to an authorized LITS Officer. After scanning, you will be prompted
              to submit your mandatory attendance photo to unlock the event evaluation.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download QR Image
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
