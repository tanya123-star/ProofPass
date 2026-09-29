"use client";

import React, { useState } from "react";
import { EvaluationForm, EvaluationQuestion, QuestionType, EventItem } from "@/lib/types";
import { X, Plus, Trash2, CheckCircle2, AlertCircle, FileCheck } from "lucide-react";

interface EvaluationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  existingForm?: EvaluationForm | null;
  onSaved: (form: EvaluationForm) => void;
}

export default function EvaluationBuilderModal({
  isOpen,
  onClose,
  event,
  existingForm,
  onSaved,
}: EvaluationBuilderModalProps) {
  const [title, setTitle] = useState(
    existingForm?.title || `${event.title} — Participant Evaluation`
  );
  const [description, setDescription] = useState(
    existingForm?.description ||
      "Please provide your honest feedback regarding this event to help the LITS Officers improve future gatherings."
  );
  const [isPublished, setIsPublished] = useState(existingForm?.isPublished ?? true);
  const [questions, setQuestions] = useState<EvaluationQuestion[]>(
    existingForm?.questions || [
      {
        id: "Q1",
        questionText: "How would you rate the overall event organization and flow?",
        questionType: "rating",
        required: true,
      },
      {
        id: "Q2",
        questionText: "How relevant were the technical workshop topics?",
        questionType: "rating",
        required: true,
      },
      {
        id: "Q3",
        questionText: "What aspects of the event could be improved for next time?",
        questionType: "short_answer",
        required: false,
      },
    ]
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newQ: EvaluationQuestion = {
      id: `Q${questions.length + 1}_${Date.now().toString().slice(-4)}`,
      questionText: "",
      questionType: "rating",
      required: true,
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx: number, updates: Partial<EvaluationQuestion>) => {
    setQuestions(
      questions.map((q, i) => (i === idx ? { ...q, ...updates } : q))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      setErrorMsg("Please add at least one question.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const formPayload: EvaluationForm = {
        id: existingForm?.id || `EVAL-${event.id}`,
        eventId: event.id,
        title,
        description,
        isPublished,
        questions,
        createdAt: existingForm?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_FORM",
          form: formPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save evaluation form");

      onSaved(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save evaluation form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Evaluation Form Builder</h3>
              <p className="text-xs text-slate-400">Event: {event.title}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Form Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Instructions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Questions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Evaluation Questions ({questions.length})
              </label>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1 rounded-lg bg-indigo-600/30 border border-indigo-500/40 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/40"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Question
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-400">
                      Question #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Enter prompt (e.g. How useful was the workshop session?)"
                    value={q.questionText}
                    onChange={(e) =>
                      handleUpdateQuestion(idx, { questionText: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Type:</span>
                      <select
                        value={q.questionType}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, {
                            questionType: e.target.value as QuestionType,
                            options:
                              e.target.value === "multiple_choice" ||
                              e.target.value === "checkbox"
                                ? ["Strongly Agree", "Agree", "Neutral", "Disagree"]
                                : undefined,
                          })
                        }
                        className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="rating">Rating Scale (1 - 5)</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="short_answer">Short Answer</option>
                        <option value="long_answer">Long Feedback</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, { required: e.target.checked })
                        }
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                      />
                      <span>Required field</span>
                    </label>
                  </div>

                  {/* Options editor for multiple choice */}
                  {(q.questionType === "multiple_choice" || q.questionType === "checkbox") && (
                    <div className="pt-1 text-[11px] text-slate-400">
                      <span className="block mb-1">Comma-separated choices:</span>
                      <input
                        type="text"
                        value={q.options?.join(", ") || ""}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, {
                            options: e.target.value.split(",").map((s) => s.trim()),
                          })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Saving Form..." : "Save Evaluation Form"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
