"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Users, Plus, ArrowLeft, Search, CheckCircle, AlertCircle } from "lucide-react";
import { StudentRosterRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AdminStudentsRosterPage() {
  const [roster, setRoster] = useState<StudentRosterRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("BSIT");
  const [yearLevel, setYearLevel] = useState("1st Year");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");

  const fetchRoster = async () => {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (Array.isArray(data)) setRoster(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, studentId, name, course, yearLevel }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to enroll student");

      setSuccessMsg(`Successfully enrolled ${name} in student roster!`);
      setEmail("");
      setStudentId("");
      setName("");
      setShowAddModal(false);
      await fetchRoster();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to enroll student");
    } finally {
      setSaving(false);
    }
  };

  const filtered = roster.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
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
              Student Roster & Authorization
            </h1>
            <p className="text-xs text-slate-400">
              Students authenticate via Google using their official <span className="text-indigo-400 font-mono font-medium">@acdeducation.com</span> account
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search roster..."
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
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Enroll New Student
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 p-3.5 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950 font-semibold text-slate-400">
              <tr>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Google Email</th>
                <th className="p-3.5">Program</th>
                <th className="p-3.5">Year Level</th>
                <th className="p-3.5">Enrolled Date</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/40">
                  <td className="p-3.5 font-mono text-indigo-400 font-semibold">{s.studentId}</td>
                  <td className="p-3.5 font-bold text-white">{s.name}</td>
                  <td className="p-3.5 font-mono text-slate-400">{s.email}</td>
                  <td className="p-3.5">{s.course}</td>
                  <td className="p-3.5">{s.yearLevel}</td>
                  <td className="p-3.5 font-mono text-slate-400">{formatDateTime(s.createdAt)}</td>
                  <td className="p-3.5">
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                      ENROLLED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Enroll Student into Roster</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorizes this student Google account to log into the Student Portal
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleEnrollStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="2024-BSIT-0210"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-200">
                      Google Email (@acdeducation.com)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        let base = email.trim();
                        if (base.includes("@")) base = base.split("@")[0];
                        if (base) setEmail(`${base}@acdeducation.com`);
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono"
                    >
                      + @acdeducation.com
                    </button>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="student.name@acdeducation.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">
                    Must use official institutional domain @acdeducation.com
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">Course</label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="BSIT">BSIT</option>
                      <option value="BSCS">BSCS</option>
                      <option value="BSIS">BSIS</option>
                      <option value="BSEMC">BSEMC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Year Level
                    </label>
                    <select
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
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
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {saving ? "Enrolling..." : "Enroll in Roster"}
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
