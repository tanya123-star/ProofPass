"use client";

import React, { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import { EventItem, Registration, AttendanceRecord } from "@/lib/types";
import {
  X,
  Camera,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: EventItem;
  officerId: string;
  officerName: string;
  registrations: Registration[];
  onScanSuccess: (record: AttendanceRecord) => void;
}

export default function QRScannerModal({
  isOpen,
  onClose,
  selectedEvent,
  officerId,
  officerName,
  registrations,
  onScanSuccess,
}: QRScannerModalProps) {
  const [manualToken, setManualToken] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastScannedResult, setLastScannedResult] = useState<AttendanceRecord | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const eventRegs = registrations.filter((r) => r.eventId === selectedEvent.id);

  // Initialize camera stream when scanner opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setErrorMsg("");
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        scanFrame();
      }
    } catch (err: any) {
      // Camera permission might be denied or not present in headless/iframe
      console.warn("Camera could not be accessed:", err.message);
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        processToken(code.data);
        return; // Pause scanning while processing
      }
    }

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  const processToken = async (token: string) => {
    if (loading) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SCAN_QR",
          qrToken: token.trim(),
          officerId,
          officerName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Attendance verification failed");
      }

      setLastScannedResult(data);
      onScanSuccess(data);

      // Play success audio indicator
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880; // A5 tone
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch {
        // Audio might be muted
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Attendance scan failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">LITS Entrance QR Scanner</h3>
              <p className="text-xs text-slate-400">
                Event: {selectedEvent.title}
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

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Result Card */}
          {lastScannedResult && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  CHECK-IN CONFIRMED
                </span>
                <span className="font-mono text-[10px] text-emerald-300">
                  {lastScannedResult.id}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block">STUDENT</span>
                  <span className="font-semibold text-white">
                    {lastScannedResult.studentName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">STUDENT ID</span>
                  <span className="font-mono">{lastScannedResult.studentId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">PROGRAM & YEAR</span>
                  <span>{lastScannedResult.course} - {lastScannedResult.yearLevel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SERVER TIMESTAMP</span>
                  <span className="font-mono text-emerald-400">
                    {formatTime(lastScannedResult.checkInTimestamp)}
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-800/40 text-[11px] text-emerald-300/90">
                Next required step: Student must upload attendance verification photo.
              </div>
            </div>
          )}

          {/* Camera Viewfinder */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-950 flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              className={`h-full w-full object-cover ${scanning ? "block" : "hidden"}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder Target Graphic */}
            {scanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.3)] relative">
                  <div className="absolute top-0 left-0 h-4 w-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm -mt-0.5 -ml-0.5" />
                  <div className="absolute top-0 right-0 h-4 w-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm -mt-0.5 -mr-0.5" />
                  <div className="absolute bottom-0 left-0 h-4 w-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm -mb-0.5 -ml-0.5" />
                  <div className="absolute bottom-0 right-0 h-4 w-4 border-b-4 border-r-4 border-emerald-400 rounded-br-sm -mb-0.5 -mr-0.5" />
                  <div className="h-0.5 w-full bg-emerald-400/60 animate-pulse mt-24" />
                </div>
              </div>
            )}

            {!scanning && (
              <div className="p-6 text-center text-slate-400 text-xs">
                <Camera className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">Live Camera Standby / Permission Needed</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  You can use the simulated instant check-in buttons below to test without a physical QR code!
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  <RefreshCw className="h-3 w-3" />
                  Enable / Retry Camera
                </button>
              </div>
            )}
          </div>

          {/* Quick Simulate Scan Buttons (Crucial for testability in browser iframe!) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Simulate QR Scan (Instant Test)
              </span>
              <span className="text-[10px] text-slate-400">Click student to scan:</span>
            </div>

            <div className="space-y-1.5">
              {eventRegs.slice(0, 4).map((reg) => (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => processToken(reg.qrToken)}
                  disabled={loading}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-left text-xs transition-colors hover:border-slate-700 hover:bg-slate-800"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{reg.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {reg.studentId} • {reg.course} • {reg.id}
                    </div>
                  </div>
                  <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 text-[10px] font-bold text-indigo-400">
                    Scan This Student QR
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Token Entry Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualToken) processToken(manualToken);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Paste or enter QR token (e.g. PROOFLY:REG:REG-2026-0145:EVT-001)..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !manualToken}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
            >
              Verify Token
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
