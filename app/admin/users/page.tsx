"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Users, UserCheck, ShieldAlert, ArrowLeft, Search } from "lucide-react";
import { User } from "@/lib/types";

export default function AdminUsersOverviewPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/lits-users");
        // Combine with all users
        const allRes = await fetch("/api/admin/students");
        // Also fetch active sessions
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <AppShell allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Overview
          </Link>
          <h1 className="text-xl font-bold text-white sm:text-2xl">User Directory & Roles</h1>
          <p className="text-xs text-slate-400">
            RBAC Directory: Admins, Authorized LITS Officers, and Enrolled Students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/users/lits"
            className="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-6 hover:border-purple-500/50 hover:bg-purple-950/30 transition-all space-y-3 group"
          >
            <UserCheck className="h-8 w-8 text-purple-400" />
            <h2 className="text-lg font-bold text-white">LITS Officers Authorization</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorize Google accounts for event management, QR scanning, and photo verification.
            </p>
            <span className="text-purple-400 font-bold text-xs inline-block">
              Manage LITS Officers →
            </span>
          </Link>

          <Link
            href="/admin/users/students"
            className="rounded-3xl border border-indigo-500/30 bg-indigo-950/20 p-6 hover:border-indigo-500/50 hover:bg-indigo-950/30 transition-all space-y-3 group"
          >
            <Users className="h-8 w-8 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Student Roster Management</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enroll institutional student Google emails and Student IDs for event participation.
            </p>
            <span className="text-indigo-400 font-bold text-xs inline-block">
              Manage Student Roster →
            </span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
