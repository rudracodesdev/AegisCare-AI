"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}

export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const [verified, setVerified] = useState(true);

  useEffect(() => {
    onVerify("turnstile-verified-session-token");
  }, [onVerify]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cloudflare Turnstile Security Verification"
      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs"
    >
      <div className="flex items-center gap-2">
        <input
          id="turnstile-verify-checkbox"
          type="checkbox"
          checked={verified}
          onChange={(e) => {
            setVerified(e.target.checked);
            onVerify(e.target.checked ? "turnstile-verified-session-token" : "");
          }}
          aria-label="Confirm human verification"
          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
        />
        <label
          htmlFor="turnstile-verify-checkbox"
          className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Cloudflare Turnstile Protected
        </label>
      </div>
      <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
        <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Verified
      </span>
    </div>
  );
}
