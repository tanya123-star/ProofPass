"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User, Role, SystemNotification } from "@/lib/types";
import {
  ShieldCheck,
  Calendar,
  QrCode,
  Camera,
  FileCheck,
  History,
  Users,
  UserCheck,
  Settings,
  Terminal,
  Bell,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function AppShell({ children, allowedRoles }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [noticeBanner, setNoticeBanner] = useState<{ message: string; attempted?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const notice = searchParams.get("notice");
      const attempted = searchParams.get("attempted");
      if (notice === "role_restricted" || notice === "access_denied") {
        setNoticeBanner({
          message: "You were redirected to your authorized portal because the requested page is invalid or restricted for your role.",
          attempted: attempted || undefined,
        });
        // Clean URL cleanly without triggering re-render
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const storedEmail =
          typeof window !== "undefined" ? localStorage.getItem("questlog_email") : null;
        const res = await fetch("/api/auth/session", {
          headers: storedEmail ? { Authorization: `Bearer ${storedEmail}` } : {},
        });
        if (!res.ok) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("questlog_email");
            localStorage.removeItem("questlog_user");
            localStorage.removeItem("questlog_role");
          }
          window.location.href = "/auth/login";
          return;
        }
        const data = await res.json();
        if (!data.authenticated || !data.user) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("questlog_email");
            localStorage.removeItem("questlog_user");
            localStorage.removeItem("questlog_role");
          }
          window.location.href = "/auth/login";
          return;
        }

        // Enforce RBAC
        if (allowedRoles && !allowedRoles.includes(data.user.role)) {
          // Block unauthorized role and redirect to role-specific portal with notice
          const attempted = typeof window !== "undefined" ? window.location.pathname : "";
          if (data.user.role === "STUDENT") {
            window.location.href = `/student?notice=role_restricted&attempted=${encodeURIComponent(attempted)}`;
          } else if (data.user.role === "LITS") {
            window.location.href = `/lits?notice=role_restricted&attempted=${encodeURIComponent(attempted)}`;
          } else if (data.user.role === "ADMIN") {
            window.location.href = `/admin?notice=role_restricted&attempted=${encodeURIComponent(attempted)}`;
          }
          return;
        }

        setCurrentUser(data.user);

        // Fetch notifications
        const notifRes = await fetch("/api/notifications");
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData);
        }
      } catch {
        window.location.href = "/auth/login";
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [allowedRoles]);

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("questlog_email");
        localStorage.removeItem("questlog_user");
        localStorage.removeItem("questlog_role");
      }
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    window.location.href = "/auth/login";
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-xs text-slate-400 font-medium">Verifying QuestLog session...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo & Portal title */}
          <div className="flex items-center gap-3">
            <Link
              href={
                currentUser.role === "ADMIN"
                  ? "/admin"
                  : currentUser.role === "LITS"
                  ? "/lits"
                  : "/student"
              }
              className="flex items-center gap-3 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">
                    QuestLog
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      currentUser.role === "ADMIN"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : currentUser.role === "LITS"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {currentUser.role} PORTAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">ACD Campus Life & Engagement Hub</p>
              </div>
            </Link>
          </div>

          {/* Role Navigation Strip (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 text-xs font-semibold">
            {currentUser.role === "STUDENT" && (
              <>
                <Link
                  href="/student"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/student" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <Link
                  href="/student/events"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/student/events") ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Events
                </Link>
                <Link
                  href="/student/registrations"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/student/registrations") ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  My QR Codes
                </Link>
                <Link
                  href="/student/attendance"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/student/attendance") ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Attendance
                </Link>
                <Link
                  href="/student/evaluations"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/student/evaluations") ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  Evaluations
                </Link>
                <Link
                  href="/student/history"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/student/history" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  History
                </Link>
              </>
            )}

            {currentUser.role === "LITS" && (
              <>
                <Link
                  href="/lits"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/lits" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/lits/verification"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/lits/verification") ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Verification Queue
                </Link>
                <Link
                  href="/lits/events"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/lits/events") ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Events
                </Link>
                <Link
                  href="/lits/reports"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/lits/reports") ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Reports
                </Link>
              </>
            )}

            {currentUser.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/admin" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Overview
                </Link>
                <Link
                  href="/admin/users/lits"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/admin/users/lits") ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Authorize LITS
                </Link>
                <Link
                  href="/admin/users/students"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/admin/users/students") ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Student Roster
                </Link>
                <Link
                  href="/admin/audit"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/admin/audit") ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Audit Trail
                </Link>
                <Link
                  href="/admin/settings"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/admin/settings") ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
              </>
            )}
          </nav>

          {/* User & Notifications */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Flyout */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-2xl z-50 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Notifications
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {unreadCount} unread
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            handleMarkNotificationRead(n.id);
                            if (n.link) router.push(n.link);
                            setShowNotifs(false);
                          }}
                          className={`rounded-xl p-2 text-xs transition-colors cursor-pointer ${
                            n.read ? "bg-slate-950/40 text-slate-400" : "bg-indigo-950/30 border border-indigo-500/30 text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">{n.title}</span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {formatTime(n.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Sign Out */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-left text-xs transition-colors hover:border-slate-700"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-white leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{currentUser.email}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Active Account
                    </span>
                    <span className="text-xs font-bold text-white block truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {currentUser.email}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex lg:hidden overflow-x-auto border-t border-slate-800 bg-slate-950 px-3 py-1.5 gap-1 text-xs">
          {currentUser.role === "STUDENT" && (
            <>
              <Link href="/student" className={`px-2.5 py-1 rounded-lg ${pathname === "/student" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"}`}>
                Dashboard
              </Link>
              <Link href="/student/events" className={`px-2.5 py-1 rounded-lg ${pathname.startsWith("/student/events") ? "bg-indigo-600 text-white font-bold" : "text-slate-400"}`}>
                Events
              </Link>
              <Link href="/student/registrations" className={`px-2.5 py-1 rounded-lg ${pathname.startsWith("/student/registrations") ? "bg-indigo-600 text-white font-bold" : "text-slate-400"}`}>
                My QR
              </Link>
              <Link href="/student/attendance" className={`px-2.5 py-1 rounded-lg ${pathname.startsWith("/student/attendance") ? "bg-indigo-600 text-white font-bold" : "text-slate-400"}`}>
                Attendance
              </Link>
              <Link href="/student/evaluations" className={`px-2.5 py-1 rounded-lg ${pathname.startsWith("/student/evaluations") ? "bg-indigo-600 text-white font-bold" : "text-slate-400"}`}>
                Evaluations
              </Link>
              <Link href="/student/history" className={`px-2.5 py-1 rounded-lg ${pathname === "/student/history" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"}`}>
                History
              </Link>
            </>
          )}

          {currentUser.role === "LITS" && (
            <>
              <Link href="/lits" className={`px-2.5 py-1 rounded-lg ${pathname === "/lits" ? "bg-emerald-600 text-white font-bold" : "text-slate-400"}`}>
                Dashboard
              </Link>
              <Link href="/lits/verification" className={`px-2.5 py-1 rounded-lg ${pathname.startsWith("/lits/verification") ? "bg-emerald-600 text-white font-bold" : "text-slate-400"}`}>
                Verification Queue
              </Link>
              <Link href="/lits/events" className={`px-2.5 py-1 rounded-lg ${pathname.startsWith("/lits/events") ? "bg-emerald-600 text-white font-bold" : "text-slate-400"}`}>
                Events
              </Link>
              <Link href="/lits/reports" className={`px-2.5 py-1 rounded-lg ${pathname.startsWith("/lits/reports") ? "bg-emerald-600 text-white font-bold" : "text-slate-400"}`}>
                Reports
              </Link>
            </>
          )}

          {currentUser.role === "ADMIN" && (
            <>
              <Link href="/admin" className={`px-2.5 py-1 rounded-lg ${pathname === "/admin" ? "bg-purple-600 text-white font-bold" : "text-slate-400"}`}>
                Overview
              </Link>
              <Link href="/admin/users/lits" className={`px-2.5 py-1 rounded-lg ${pathname.startsWith("/admin/users/lits") ? "bg-purple-600 text-white font-bold" : "text-slate-400"}`}>
                Authorize LITS
              </Link>
              <Link href="/admin/users/students" className={`px-2.5 py-1 rounded-lg ${pathname.startsWith("/admin/users/students") ? "bg-purple-600 text-white font-bold" : "text-slate-400"}`}>
                Roster
              </Link>
              <Link href="/admin/audit" className={`px-2.5 py-1 rounded-lg ${pathname.startsWith("/admin/audit") ? "bg-purple-600 text-white font-bold" : "text-slate-400"}`}>
                Audit
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {noticeBanner && (
          <div className="flex items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-xs text-amber-200 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-white">
                  Access Notice: Safely Routed to {currentUser.role} Portal
                </p>
                <p className="text-[11px] text-amber-200/90 mt-0.5">
                  {noticeBanner.message}{" "}
                  {noticeBanner.attempted && (
                    <span className="font-mono text-amber-300 underline underline-offset-2">
                      ({noticeBanner.attempted})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setNoticeBanner(null)}
              className="shrink-0 rounded-lg bg-amber-900/50 hover:bg-amber-900/80 px-2.5 py-1 text-[11px] font-semibold text-amber-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>QuestLog — ACD Gamified Campus Life & Engagement Hub</span>
          <span className="font-mono text-slate-600">
            Authenticated via Google OAuth • Role: {currentUser.role}
          </span>
        </div>
      </footer>
    </div>
  );
}
