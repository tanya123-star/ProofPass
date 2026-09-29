"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Resolving Google account authorization...");

  useEffect(() => {
    const email = searchParams.get("email");
    if (!email) {
      router.push("/auth/login");
      return;
    }

    const verifyCallback = async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (!res.ok) {
          const reason = data.code === "INVALID_STUDENT_DOMAIN" ? "domain" : "unauthorized";
          const domain = data.requiredDomain || "@acdeducation.com";
          router.push(
            `/auth/unauthorized?email=${encodeURIComponent(email)}&reason=${reason}&requiredDomain=${encodeURIComponent(domain)}`
          );
          return;
        }

        setStatus(`Authorization resolved. Redirecting to ${data.redirectUrl}...`);
        router.push(data.redirectUrl);
      } catch {
        router.push("/auth/login");
      }
    };

    verifyCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <h2 className="text-base font-bold text-white">Authenticating with Google OAuth</h2>
        <p className="text-xs text-slate-400">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-400 p-8 text-center text-xs">Processing callback...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
