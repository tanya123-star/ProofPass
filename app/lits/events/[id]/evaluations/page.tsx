"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import EvaluationBuilderModal from "@/components/officer/EvaluationBuilderModal";
import {
  FileCheck,
  ArrowLeft,
  Plus,
  Star,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { EventItem, EvaluationForm, EvaluationResponse } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function LitsEventEvaluationsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [form, setForm] = useState<EvaluationForm | null>(null);
  const [responses, setResponses] = useState<EvaluationResponse[]>([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [evRes, formRes, respRes] = await Promise.all([
        fetch(`/api/events?id=${eventId}`).then((r) => r.json()),
        fetch(`/api/evaluations?eventId=${eventId}`).then((r) => r.json()),
        fetch(`/api/evaluations?responsesFor=${eventId}`).then((r) => r.json()),
      ]);

      if (evRes && !evRes.error) setEvent(evRes);
      if (formRes && !formRes.error) setForm(formRes);
      if (Array.isArray(respRes)) setResponses(respRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [eventId]);

  return (
    <AppShell allowedRoles={["LITS", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href={`/lits/events/${eventId}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Event Overview
            </Link>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Evaluation Management & Responses
            </h1>
            <p className="text-xs text-slate-400">
              {event?.title} • {responses.length} responses recorded
            </p>
          </div>

          <button
            onClick={() => setBuilderOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Customize Questions
          </button>
        </div>

        {/* Responses Display */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-cyan-400" />
            Participant Feedback Submissions ({responses.length})
          </h2>

          {responses.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No evaluations submitted yet. Submissions unlock once student attendance is verified.
            </p>
          ) : (
            <div className="space-y-3">
              {responses.map((resp) => (
                <div
                  key={resp.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{resp.studentName}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {formatDateTime(resp.submittedAt)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    {resp.answers.map((a, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {a.questionText}
                        </span>
                        <span className="text-indigo-300 font-medium mt-0.5 block">
                          {Array.isArray(a.value) ? a.value.join(", ") : String(a.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Builder Modal */}
        {event && (
          <EvaluationBuilderModal
            isOpen={builderOpen}
            onClose={() => setBuilderOpen(false)}
            event={event}
            existingForm={form}
            onSaved={() => {
              refreshData();
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
