"use client";

import React, { useState } from "react";
import { EvaluationForm, EvaluationResponse, AttendanceRecord } from "@/lib/types";
import confetti from "canvas-confetti";
import {
  X,
  Lock,
  CheckCircle2,
  Star,
  Send,
  AlertCircle,
  Sparkles,
  FileCheck,
} from "lucide-react";

interface EvaluationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: EvaluationForm;
  attendance?: AttendanceRecord;
  hasAlreadySubmitted: boolean;
  onSubmitted: (response: EvaluationResponse) => void;
}

export default function EvaluationFormModal({
  isOpen,
  onClose,
  form,
  attendance,
  hasAlreadySubmitted,
  onSubmitted,
}: EvaluationFormModalProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const isVerified = attendance?.verificationStatus === "VERIFIED";

  const handleAnswerChange = (questionId: string, val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendance) return;

    // Check required questions
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

      // Fire confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSuccess(true);
      onSubmitted(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              isVerified
                ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {isVerified ? <FileCheck className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Event Evaluation</h3>
              <p className="text-xs text-slate-400">
                {isVerified ? "Attendance Confirmed & Unlocked" : "Attendance Verification Required"}
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

        {/* LOCKED STATE (Section 19 of Spec) */}
        {!isVerified && (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Lock className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-lg font-bold text-white">🔒 Evaluation Locked</h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Your attendance must be officially verified by a LITS Officer before you can
                complete this evaluation.
              </p>
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Current Attendance Status
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">
                    {attendance ? attendance.verificationStatus : "NOT REGISTERED / CHECKED IN"}
                  </span>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                    Locked
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-800 px-6 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ALREADY SUBMITTED STATE */}
        {isVerified && hasAlreadySubmitted && !success && (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Evaluation Already Completed</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have already submitted your official feedback for this event. Thank you for your
              participation!
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {success && (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Thank You for Your Feedback!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your evaluation response has been recorded. Your participation record is now complete!
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* UNLOCKED FORM STATE */}
        {isVerified && !hasAlreadySubmitted && !success && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-white">{form.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{form.description}</p>
            </div>

            {/* Questions List */}
            <div className="space-y-5">
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

                  {/* Rating scale (1-5) */}
                  {q.questionType === "rating" && (
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const isSelected = answers[q.id] === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleAnswerChange(q.id, num)}
                            className={`flex h-10 flex-1 flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <span className="text-sm">{num}</span>
                            <span className="text-[8px] font-normal opacity-70">
                              {num === 1 ? "Poor" : num === 5 ? "Excellent" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple choice */}
                  {q.questionType === "multiple_choice" && (
                    <div className="space-y-1.5 pt-1">
                      {q.options?.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-3 rounded-xl border p-2.5 text-xs cursor-pointer transition-colors ${
                            answers[q.id] === opt
                              ? "border-indigo-500/80 bg-indigo-950/30 text-white"
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

                  {/* Short answer */}
                  {q.questionType === "short_answer" && (
                    <input
                      type="text"
                      placeholder="Your answer..."
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  )}

                  {/* Long answer */}
                  {q.questionType === "long_answer" && (
                    <textarea
                      rows={3}
                      placeholder="Enter detailed suggestions or feedback..."
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Submit Bar */}
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
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Submit Evaluation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
