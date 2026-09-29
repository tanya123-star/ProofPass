"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  UserCheck,
  Plus,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ShieldAlert,
} from "lucide-react";
import { LitsUser } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AdminLitsUsersPage() {
  const [litsUsers, setLitsUsers] = useState<LitsUser[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("LITS Technical & Events Committee");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");

  const fetchLitsUsers = async () => {
    try {
      const res = await fetch("/api/admin/lits-users");
      const data = await res.json();
      if (Array.isArray(data)) setLitsUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLitsUsers();
  }, []);

  const handleAddLits = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/lits-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, department, notes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to authorize LITS user");

      setSuccessMsg(`Successfully authorized ${email} as a LITS Officer!`);
      setEmail("");
      setName("");
      setNotes("");
      setShowAddModal(false);
      await fetchLitsUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authorize LITS user");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to deactivate LITS access for ${userEmail}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/lits-users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "DEACTIVATE" }),
      });

      if (res.ok) {
        setSuccessMsg(`Deactivated LITS privileges for ${userEmail}.`);
        await fetchLitsUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = litsUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase())
  );

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
              Authorized LITS Officers Management
            </h1>
            <p className="text-xs text-slate-400">
              Only authorized Google accounts listed here can access the LITS Officer Desk
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search LITS user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-52"
              />
            </div>

            <button
              onClick={() => {
                setShowAddModal(true);
                setErrorMsg("");
              }}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500"
            >
              <Plus className="h-4 w-4" />
              Authorize New LITS User
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 p-3.5 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LITS Users Table */}
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950 font-semibold text-slate-400">
              <tr>
                <th className="p-3.5">Officer Name</th>
                <th className="p-3.5">Google Email (Login)</th>
                <th className="p-3.5">Department / Role</th>
                <th className="p-3.5">Authorized By</th>
                <th className="p-3.5">Authorized At</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="p-3.5 font-bold text-white">{u.name}</td>
                  <td className="p-3.5 font-mono text-purple-300">{u.email}</td>
                  <td className="p-3.5">{u.department}</td>
                  <td className="p-3.5 text-slate-400">{u.authorizedBy}</td>
                  <td className="p-3.5 font-mono text-slate-400">
                    {formatDateTime(u.authorizedAt)}
                  </td>
                  <td className="p-3.5">
                    {u.isActive ? (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                        DEACTIVATED
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {u.isActive ? (
                      <button
                        onClick={() => handleDeactivate(u.id, u.email)}
                        className="rounded-lg border border-red-800/60 bg-red-950/30 px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-900/40"
                      >
                        Deactivate Access
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add LITS Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Authorize Google Account as LITS</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allows this exact Google account to authenticate and access /lits
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddLits} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Google Account Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="officer@acd.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Officer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carlos Mendoza"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Committee / Department
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Administrative Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reason for authorization or designated events..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-purple-500 disabled:opacity-50"
                  >
                    {saving ? "Authorizing..." : "Grant LITS Access"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
