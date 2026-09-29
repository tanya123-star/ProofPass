"use client";

import React, { useState } from "react";
import { User, AuditLog } from "@/lib/types";
import {
  ShieldAlert,
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Users,
  Database,
  Terminal,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface AdminPanelProps {
  currentUser: User;
  users: User[];
  auditLogs: AuditLog[];
  onRefreshData: () => void;
}

export default function AdminPanel({
  currentUser,
  users,
  auditLogs,
  onRefreshData,
}: AdminPanelProps) {
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === "ALL" || log.what === filterAction;
    const matchesQuery =
      log.who.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesQuery;
  });

  const handleResetData = async () => {
    if (!confirm("Are you sure you want to reset all test data to initial seed state?")) {
      return;
    }

    setResetting(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET" }),
      });
      if (res.ok) {
        setResetSuccess(true);
        onRefreshData();
        setTimeout(() => setResetSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">System Administration & Audit Log</h2>
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable audit trails, system security posture, role assignments, and database maintenance.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetData}
          disabled={resetting}
          className="flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-2.5 text-xs font-bold text-purple-300 hover:bg-purple-500/20 active:scale-95 transition-all"
        >
          <RotateCcw className={`h-4 w-4 ${resetting ? "animate-spin" : ""}`} />
          {resetting ? "Resetting..." : "Reset All Demo Data"}
        </button>
      </div>

      {resetSuccess && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Demo database restored to default seed state successfully!</span>
        </div>
      )}

      {/* Users Directory */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            Configured System Users & Roles
          </h3>
          <span className="text-xs text-slate-400 font-mono">{users.length} registered accounts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">{u.id}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                    u.role === "ADMIN"
                      ? "bg-purple-500/20 text-purple-300"
                      : u.role === "LITS"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-indigo-500/20 text-indigo-300"
                  }`}
                >
                  {u.role}
                </span>
              </div>
              <div className="font-bold text-white text-xs">{u.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
              {u.studentId && (
                <div className="text-[10px] text-slate-500">
                  {u.studentId} • {u.course} ({u.yearLevel})
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table (Section 25 of Spec) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              Auditable System Records
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanent trace of QR scanning, photo submissions, officer verifications, and evaluations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-48"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="SCAN_QR">SCAN_QR</option>
              <option value="UPLOAD_PHOTO">UPLOAD_PHOTO</option>
              <option value="VERIFY_ATTENDANCE">VERIFY_ATTENDANCE</option>
              <option value="REJECT_ATTENDANCE">REJECT_ATTENDANCE</option>
              <option value="SUBMIT_EVALUATION">SUBMIT_EVALUATION</option>
              <option value="REGISTER_EVENT">REGISTER_EVENT</option>
              <option value="PUBLISH_EVENT">PUBLISH_EVENT</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950 font-semibold text-slate-400">
              <tr>
                <th className="p-3">Timestamp (WHEN)</th>
                <th className="p-3">Actor (WHO)</th>
                <th className="p-3">Action (WHAT)</th>
                <th className="p-3">Target (TARGET)</th>
                <th className="p-3">Result</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {formatDateTime(log.when)}
                  </td>
                  <td className="p-3 font-semibold text-white whitespace-nowrap">
                    {log.who}
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-indigo-300 font-bold">
                      {log.what}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 truncate max-w-xs">{log.target}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        log.result === "SUCCESS"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="p-3 font-sans text-slate-400 max-w-md truncate">
                    {log.details || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
