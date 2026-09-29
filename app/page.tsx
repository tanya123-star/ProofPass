"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRoute = async () => {
      try {
        const storedEmail =
          typeof window !== "undefined" ? localStorage.getItem("questlog_email") : null;
        const res = await fetch("/api/auth/session", {
          headers: storedEmail ? { Authorization: `Bearer ${storedEmail}` } : {},
        });
        if (!res.ok) {
          router.push("/auth/login");
          return;
        }

        const data = await res.json();
        if (data.authenticated && data.user) {
          if (data.user.role === "ADMIN") {
            window.location.href = "/admin";
          } else if (data.user.role === "LITS") {
            window.location.href = "/lits";
          } else {
            window.location.href = "/student";
          }
        } else {
          router.push("/auth/login");
        }
      } catch {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRoute();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <h2 className="text-sm font-bold text-white">Loading QuestLog...</h2>
        <p className="text-xs text-slate-500">Checking authenticated Google session...</p>
      </div>
    </div>
  );
}
