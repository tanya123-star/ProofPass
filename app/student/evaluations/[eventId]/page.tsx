"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import AppShell from "@/components/AppShell";
import {
  FileCheck,
  Lock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Send,
} from "lucide-react";
import { EvaluationForm, EventItem, AttendanceRecord } from "@/lib/types";

export default function StudentEventEvaluationFormPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [form, setForm] = useState<EvaluationForm | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, evRes, attRes] = await Promise.all([
          fetch(`/api/evaluations?eventId=${eventId}`).then((r) => r.json()),
          fetch(`/api/events?id=${eventId}`).then((r) => r.json()),
          fetch(`/api/attendance?eventId=${eventId}`).then((r) => r.json()),
        ]);

        if (formRes && !formRes.error) setForm(formRes);
        if (evRes && !evRes.error) setEvent(evRes);
        if (Array.isArray(attRes) && attRes.length > 0) {
          setAttendance(attRes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const isVerified = attendance?.verificationStatus === "VERIFIED";

  const handleAnswerChange = (questionId: string, val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !attendance) return;

    for (const q of form.questions) {
      if (q.required && (!answers[q.id] || answers[q.id] === "")) {
        setErrorMsg(`Please answer the required question: "${q.questionText}"`);
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const formattedAnswers = form.questions.map((q) => ({
        questionId: q.id,
        questionText: q.questionText,
        value: answers[q.id] ?? "",
      }));

      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT",
          formId: form.id,
          eventId: form.eventId,
          studentId: attendance.studentId,
          studentName: attendance.studentName,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit evaluation");
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell allowedRoles={["STUDENT"]}>
        <div className="p-12 text-center text-xs text-slate-500">Loading evaluation...</div>
      </AppShell>
    );
  }

  if (!form || !event) {
    return (
      <AppShell allowedRoles={["STUDENT"]}>
        <div className="p-12 text-center space-y-3">
          <p className="text-sm font-bold text-white">Evaluation Not Available</p>
          <Link href="/student/evaluations" className="text-xs text-indigo-400 font-semibold">
            ← Return to Evaluations
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell allowedRoles={["STUDENT"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/student/evaluations"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Evaluations
        </Link>

        {/* LOCKED STATE IF NOT VERIFIED */}
        {!isVerified ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">🔒 Evaluation Locked</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your attendance for <span className="text-white font-semibold">{event.title}</span> has not been officially verified by a LITS Officer yet. You must present your QR code and submit a verified physical presence photo to unlock this form.
            </p>
            <div className="pt-2">
              <Link
                href="/student/attendance"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"
              >
                Check Attendance Verification Status
              </Link>
            </div>
          </div>
        ) : submitted ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Evaluation Submitted Successfully!</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Thank you for completing the feedback form for {event.title}. Your attendance and participation history is now officially finalized.
            </p>
            <div className="pt-2">
              <Link
                href="/student/history"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"
              >
                View Participation History
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                ATTENDANCE VERIFIED ✓
              </span>
              <h1 className="text-xl font-bold text-white mt-2">{form.title}</h1>
              <p className="text-xs text-slate-400 mt-1">{form.description}</p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-950/50 border border-red-800/60 p-4 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {form.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
                >
                  <label className="block text-xs font-semibold text-slate-200">
                    <span className="text-indigo-400 font-bold mr-1.5">{idx + 1}.</span>
                    {q.questionText}
                    {q.required && <span className="text-red-400 ml-1">*</span>}
                  </label>

                  {q.questionType === "rating" && (
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleAnswerChange(q.id, num)}
                          className={`flex h-10 flex-1 flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                            answers[q.id] === num
                              ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                              : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <span className="text-sm">{num}</span>
                          <span className="text-[8px] font-normal opacity-70">
                            {num === 1 ? "Poor" : num === 5 ? "Excellent" : ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {q.questionType === "multiple_choice" && (
                    <div className="space-y-1.5 pt-1">
                      {q.options?.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-3 rounded-xl border p-2.5 text-xs cursor-pointer transition-colors ${
                            answers[q.id] === opt
                              ? "border-indigo-500 bg-indigo-950/30 text-white"
                              : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => handleAnswerChange(q.id, opt)}
                            className="text-indigo-600 focus:ring-0"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.questionType === "short_answer" && (
                    <input
                      type="text"
                      placeholder="Your feedback..."
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  )}

                  {q.questionType === "long_answer" && (
                    <textarea
                      rows={3}
                      placeholder="Detailed comments and suggestions..."
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <Link
                  href="/student/evaluations"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 text-center flex items-center justify-center hover:bg-slate-700"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Participant Evaluation"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
