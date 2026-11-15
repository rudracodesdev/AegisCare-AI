"use client";

import React from "react";
import Image from "next/image";
import { Activity, PhoneCall, PhoneOff, MapPin, Send } from "lucide-react";
import type { PatientProfile, PatientVitals } from "@/lib/care-engine";

interface VitalsModalProps {
  isOpen: boolean;
  vitalsDraft: PatientVitals;
  setVitalsDraft: React.Dispatch<React.SetStateAction<PatientVitals>>;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export function VitalsModal({
  isOpen,
  vitalsDraft,
  setVitalsDraft,
  onClose,
  onSave,
}: VitalsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vitals-modal-title"
      aria-describedby="vitals-modal-desc"
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3
            id="vitals-modal-title"
            className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"
          >
            <Activity className="w-5 h-5 text-blue-600 dark:text-cyan-400" aria-hidden="true" /> Log Patient Vitals
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close vitals modal"
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold"
          >
            Close ✕
          </button>
        </div>
        <p id="vitals-modal-desc" className="text-xs text-slate-600 dark:text-slate-400">
          Update geriatric blood pressure, heart rate, and fasting blood glucose for real-time anomaly detection.
        </p>
        <form onSubmit={onSave} className="space-y-3.5">
          <div>
            <label htmlFor="vital-bp" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Blood Pressure (Systolic/Diastolic)
            </label>
            <input
              id="vital-bp"
              type="text"
              required
              autoFocus
              value={vitalsDraft.bp}
              onChange={(e) => setVitalsDraft({ ...vitalsDraft, bp: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm"
            />
          </div>
          <div>
            <label htmlFor="vital-hr" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Heart Rate (BPM)
            </label>
            <input
              id="vital-hr"
              type="text"
              required
              value={vitalsDraft.heartRate}
              onChange={(e) => setVitalsDraft({ ...vitalsDraft, heartRate: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm"
            />
          </div>
          <div>
            <label htmlFor="vital-glucose" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Fasting Blood Glucose (mg/dL)
            </label>
            <input
              id="vital-glucose"
              type="text"
              required
              value={vitalsDraft.glucose}
              onChange={(e) => setVitalsDraft({ ...vitalsDraft, glucose: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm"
          >
            Save Vitals & Run Clinical Check
          </button>
        </form>
      </div>
    </div>
  );
}

interface SosEmergencyModalProps {
  sosActive: boolean;
  sosStage: "DIALING" | "CONNECTED";
  callSeconds: number;
  gpsCoords: string;
  patientProfile: PatientProfile;
  recipientEmail: string;
  onEndCall: () => void;
}

export function SosEmergencyModal({
  sosActive,
  sosStage,
  callSeconds,
  gpsCoords,
  patientProfile,
  recipientEmail,
  onEndCall,
}: SosEmergencyModalProps) {
  if (!sosActive) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
      aria-describedby="sos-modal-desc"
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-white border border-red-200 dark:bg-slate-950 dark:border-2 dark:border-rose-500 shadow-2xl overflow-hidden">
        <div className="p-6 bg-red-50 dark:bg-slate-950 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 border-4 border-white dark:bg-rose-600/30 flex items-center justify-center animate-pulse">
            <PhoneCall className="w-10 h-10 text-red-600 dark:text-rose-400" aria-hidden="true" />
          </div>

          <div>
            <span
              role="status"
              aria-live="assertive"
              className="px-3 py-1 rounded-full bg-white border border-red-200 text-red-700 dark:bg-rose-500/20 dark:text-rose-300 font-bold font-mono text-xs uppercase tracking-widest"
            >
              {sosStage === "DIALING" ? "Dialing Emergency Contact..." : `Connected • ${formatTimer(callSeconds)}`}
            </span>
            <h3 id="sos-modal-title" className="text-2xl font-black text-slate-900 dark:text-white mt-3">
              Family Caretaker & Dispatch
            </h3>
            <p id="sos-modal-desc" className="text-sm font-bold font-mono text-red-700 dark:text-cyan-300 mt-0.5">
              {patientProfile.emergencyDisplay}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 text-left space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-blue-800 dark:text-emerald-400 font-bold font-mono">
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{gpsCoords}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              Patient: <strong className="text-slate-900 dark:text-white">{patientProfile.name}</strong> • Blood Group:{" "}
              <strong className="text-slate-900 dark:text-white">{patientProfile.bloodGroup}</strong>
            </p>
            <p className="text-emerald-800 dark:text-amber-300 font-bold font-mono text-[11px]">
              ✓ Urgent Email & Vitals Packet Dispatched to {recipientEmail}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <a
              href={`tel:${patientProfile.emergencyContact}`}
              className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4" aria-hidden="true" /> Dial on Phone App
            </a>
            <a
              href={`https://wa.me/${patientProfile.emergencyContact.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `🚨 EMERGENCY SOS from ${patientProfile.name}! Live Location: ${gpsCoords}. Need immediate check-in.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" aria-hidden="true" /> WhatsApp SOS
            </a>
          </div>

          <button
            type="button"
            autoFocus
            onClick={onEndCall}
            className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center justify-center gap-2"
          >
            <PhoneOff className="w-4 h-4" aria-hidden="true" /> End Emergency Call
          </button>
        </div>
      </div>
    </div>
  );
}

interface CheckoutModalProps {
  checkoutItem: { name: string; amount: number } | null;
  paymentMethod: "UPI" | "CARD" | "NETBANKING";
  setPaymentMethod: React.Dispatch<React.SetStateAction<"UPI" | "CARD" | "NETBANKING">>;
  processingPayment: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function CheckoutModal({
  checkoutItem,
  paymentMethod,
  setPaymentMethod,
  processingPayment,
  onCancel,
  onConfirm,
}: CheckoutModalProps) {
  if (!checkoutItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      aria-describedby="checkout-modal-desc"
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-emerald-400/50 overflow-hidden shadow-2xl">
        <div className="p-5 bg-slate-50 border-b border-slate-200 dark:bg-emerald-800 text-slate-900 dark:text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase font-mono tracking-widest bg-emerald-100 text-emerald-900 dark:bg-black/30 dark:text-white px-2 py-0.5 rounded">
              AegisCare Secure Checkout
            </span>
            <h3 id="checkout-modal-title" className="text-lg font-black mt-1">
              {checkoutItem.name}
            </h3>
          </div>
          <div className="text-right">
            <span id="checkout-modal-desc" className="text-xs font-bold opacity-80">
              Total Payable
            </span>
            <div className="text-2xl font-black">₹{checkoutItem.amount}</div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div
            role="tablist"
            aria-label="Payment method"
            className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800"
          >
            {(["UPI", "CARD", "NETBANKING"] as const).map((method) => (
              <button
                key={method}
                type="button"
                role="tab"
                aria-selected={paymentMethod === method}
                onClick={() => setPaymentMethod(method)}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  paymentMethod === method
                    ? "bg-white text-blue-800 shadow-sm dark:bg-emerald-500 dark:text-black"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {paymentMethod === "UPI" && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-3 text-center">
              <div className="w-40 h-40 mx-auto rounded-xl bg-white p-2.5 flex items-center justify-center border border-slate-200">
                <Image
                  unoptimized
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `upi://pay?pa=aegiscare.pharmacy@okaxis&pn=AegisCare%20AI%20Pharmacy&am=${checkoutItem.amount}&cu=INR`
                  )}`}
                  alt={`Scannable UPI QR Code for Rupees ${checkoutItem.amount}`}
                  width={160}
                  height={160}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] font-bold font-mono text-emerald-700 dark:text-emerald-400">
                Scan with any UPI App (GPay, PhonePe, Paytm)
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              autoFocus
              disabled={processingPayment}
              onClick={onConfirm}
              className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-emerald-400 dark:text-black font-black text-sm"
            >
              {processingPayment ? "Verifying Bank..." : `Pay ₹${checkoutItem.amount} Now`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
