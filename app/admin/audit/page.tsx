"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Terminal, ArrowLeft, Search, Filter } from "lucide-react";
import { AuditLog } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AdminAuditTrailPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await fetch("/api/audit");
        const data = await res.json();
        if (Array.isArray(data)) setAuditLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  const filtered = auditLogs.filter((log) => {
    const matchesAction = filterAction === "ALL" || log.what === filterAction;
    const matchesSearch =
      log.who.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Overview
            </Link>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              System Audit & Security Trail
            </h1>
            <p className="text-xs text-slate-400">
              Auditable log of QR scanning, photo verification, role authorizations, and evaluations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-52"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="AUTHORIZE_LITS_USER">AUTHORIZE_LITS_USER</option>
              <option value="DEACTIVATE_LITS_USER">DEACTIVATE_LITS_USER</option>
              <option value="ENROLL_STUDENT">ENROLL_STUDENT</option>
              <option value="SCAN_QR">SCAN_QR</option>
              <option value="UPLOAD_PHOTO">UPLOAD_PHOTO</option>
              <option value="VERIFY_ATTENDANCE">VERIFY_ATTENDANCE</option>
              <option value="REJECT_ATTENDANCE">REJECT_ATTENDANCE</option>
              <option value="SUBMIT_EVALUATION">SUBMIT_EVALUATION</option>
              <option value="REGISTER_EVENT">REGISTER_EVENT</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950 font-semibold text-slate-400">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor (WHO)</th>
                <th className="p-3.5">Action (WHAT)</th>
                <th className="p-3.5">Target</th>
                <th className="p-3.5">Result</th>
                <th className="p-3.5">Audit Record Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    {formatDateTime(log.when)}
                  </td>
                  <td className="p-3.5 font-bold text-white whitespace-nowrap">{log.who}</td>
                  <td className="p-3.5">
                    <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-indigo-300 font-bold">
                      {log.what}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 truncate max-w-xs">{log.target}</td>
                  <td className="p-3.5">
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
                  <td className="p-3.5 font-sans text-slate-400 max-w-md truncate">
                    {log.details || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
