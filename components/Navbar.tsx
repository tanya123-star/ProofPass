"use client";

import React, { useState } from "react";
import { User, Role } from "@/lib/types";
import { INITIAL_USERS } from "@/lib/store";
import {
  ShieldCheck,
  QrCode,
  UserCheck,
  Settings,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  activeTab: "student" | "officer" | "admin" | "workflow";
  onTabChange: (tab: "student" | "officer" | "admin" | "workflow") => void;
  unreadCount?: number;
}

export default function Navbar({
  currentUser,
  onSwitchUser,
  activeTab,
  onTabChange,
  unreadCount = 0,
}: NavbarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Proofly
              </span>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-indigo-300 uppercase">
                LITS Quick Event
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verified Attendance & Evaluation System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => onTabChange("student")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "student"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            Student Portal
          </button>
          <button
            onClick={() => onTabChange("officer")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "officer"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            LITS Officer Desk
          </button>
          <button
            onClick={() => onTabChange("admin")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "admin"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            System Audit & Admin
          </button>
          <button
            onClick={() => onTabChange("workflow")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "workflow"
                ? "bg-slate-800 text-cyan-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            Workflow Spec
          </button>
        </nav>

        {/* User Role Switcher & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Role switcher pill */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-left text-xs transition-colors hover:border-slate-600"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  {currentUser.name}
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                      currentUser.role === "LITS"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : currentUser.role === "ADMIN"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentUser.role === "STUDENT"
                    ? `${currentUser.course || "BSIT"} • ${currentUser.studentId || ""}`
                    : currentUser.email}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowUserDropdown(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Test Account / Role
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Test the complete verification workflow from different perspectives:
                  </div>
                </div>

                <div className="space-y-1">
                  {INITIAL_USERS.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user);
                        if (user.role === "STUDENT") onTabChange("student");
                        else if (user.role === "LITS") onTabChange("officer");
                        else if (user.role === "ADMIN") onTabChange("admin");
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                        currentUser.id === user.id
                          ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 font-medium"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{user.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {user.role === "STUDENT" ? `${user.studentId} • ${user.course}` : user.email}
                        </div>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          user.role === "LITS"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : user.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-indigo-500/20 text-indigo-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex md:hidden border-t border-slate-800 bg-slate-950 px-2 py-1 justify-around text-xs">
        <button
          onClick={() => onTabChange("student")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium ${
            activeTab === "student" ? "bg-indigo-600 text-white" : "text-slate-400"
          }`}
        >
          <QrCode className="h-3.5 w-3.5" />
          Student
        </button>
        <button
          onClick={() => onTabChange("officer")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium ${
            activeTab === "officer" ? "bg-indigo-600 text-white" : "text-slate-400"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Officer
        </button>
        <button
          onClick={() => onTabChange("admin")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium ${
            activeTab === "admin" ? "bg-indigo-600 text-white" : "text-slate-400"
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          Admin
        </button>
        <button
          onClick={() => onTabChange("workflow")}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-lg font-medium ${
            activeTab === "workflow" ? "bg-slate-800 text-cyan-300" : "text-slate-400"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Spec
        </button>
      </div>
    </header>
  );
}
