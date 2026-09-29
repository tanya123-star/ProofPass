"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  ShieldAlert,
  UserCheck,
  Users,
  Terminal,
  Settings,
  Calendar,
  CheckCircle,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";
import { User, LitsUser, StudentRosterRecord, EventItem, AuditLog } from "@/lib/types";

export default function AdminDashboardPage() {
  const [litsUsers, setLitsUsers] = useState<LitsUser[]>([]);
  const [roster, setRoster] = useState<StudentRosterRecord[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [litsRes, rosterRes, evRes, auditRes] = await Promise.all([
          fetch("/api/admin/lits-users").then((r) => r.json()),
          fetch("/api/admin/students").then((r) => r.json()),
          fetch("/api/events").then((r) => r.json()),
          fetch("/api/audit").then((r) => r.json()),
        ]);

        if (Array.isArray(litsRes)) setLitsUsers(litsRes);
        if (Array.isArray(rosterRes)) setRoster(rosterRes);
        if (Array.isArray(evRes)) setEvents(evRes);
        if (Array.isArray(auditRes)) setAuditLogs(auditRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                System Administration & Security
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage authorized LITS accounts, student roster, role security, and immutable audit trails
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/users/lits"
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 transition-all"
            >
              <UserCheck className="h-4 w-4" />
              Manage LITS Authorization
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Active LITS Officers
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {litsUsers.filter((u) => u.isActive).length}
            </div>
            <span className="text-[10px] text-emerald-400">Authorized Accounts</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Student Roster
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">{roster.length}</div>
            <span className="text-[10px] text-indigo-400">Enrolled Students</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Total Events
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">{events.length}</div>
            <span className="text-[10px] text-slate-500">Campus Events</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Security Audit Logs
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">{auditLogs.length}</div>
            <span className="text-[10px] text-cyan-400">Recorded Actions</span>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/users/lits"
            className="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-5 hover:border-purple-500/50 hover:bg-purple-950/30 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <UserCheck className="h-6 w-6 text-purple-400" />
              <ArrowRight className="h-4 w-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-base font-bold text-white">Authorize LITS Users</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Grant or revoke LITS event management and verification privileges by Google email.
            </p>
          </Link>

          <Link
            href="/admin/users/students"
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Users className="h-6 w-6 text-indigo-400" />
              <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-base font-bold text-white">Student Roster</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pre-authorize student Google accounts for portal registration and QR generation.
            </p>
          </Link>

          <Link
            href="/admin/audit"
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Terminal className="h-6 w-6 text-cyan-400" />
              <ArrowRight className="h-4 w-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-base font-bold text-white">Security Audit Trail</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Immutable logs tracking QR scans, photo verifications, role updates, and evaluations.
            </p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
