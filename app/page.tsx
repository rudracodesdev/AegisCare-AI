"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  HeartPulse,
  Pill,
  Calendar,
  BellRing,
  ShieldCheck,
  Volume2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  CreditCard,
  Users,
  PhoneCall,
  PhoneOff,
  MapPin,
  Trash2,
  Edit3,
  Send,
  Lock,
  UserPlus,
  LogIn,
  LogOut,
  KeyRound,
  Sun,
  Moon,
} from "lucide-react";
import { PopOutElement } from "@/components/PopOutElement";
import { TurnstileWidget } from "@/components/TurnstileWidget";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  period: "Morning" | "Afternoon" | "Evening" | "Night";
  instructions: string;
  status: "Taken" | "Pending" | "Missed";
  pillsLeft: number;
}

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  notes: string;
}

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  itemTitle: string;
  timestamp: string;
  alertType: string;
}

interface PatientProfile {
  name: string;
  bloodGroup: string;
  passcode: string;
  emergencyContact: string;
  emergencyDisplay: string;
  careEmail: string;
  vitals: {
    bp: string;
    heartRate: string;
    glucose: string;
  };
}

export default function AegisCarePlatform() {
  // THEME TOGGLE STATE
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 1. 3-STAGE SCROLL PORTAL REFS
  const scrollTrackRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: scrollTrackRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.55, 1], [1, 2.75, 4.8]);
  const portalOpacity = useTransform(scrollYProgress, [0, 0.78, 1], [1, 1, 0]);
  const promptOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // 2. VOICE MODE ON/OFF STATE
  const [voiceMode, setVoiceMode] = useState(false);

  // 3. MULTI-USER AUTHENTICATION & REGISTRATION STATE
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeRole, setActiveRole] = useState<"Elderly Patient" | "Family Member" | "Caretaker">("Family Member");
  const [memberName, setMemberName] = useState("Rudra (Family Caretaker)");
  const [passcode, setPasscode] = useState("CARE26");
  const [turnstileToken, setTurnstileToken] = useState("demo-bypass-token");
  const [authStatus, setAuthStatus] = useState("Verified via Passcode CARE26");

  const [regForm, setRegForm] = useState({
    patientName: "",
    patientAge: "68",
    bloodGroup: "B+",
    bp: "120/80 mmHg",
    heartRate: "72 BPM",
    glucose: "105 mg/dL",
    emergencyContact: "+91 98765 43210",
    careEmail: "",
    newPasscode: "",
    creatorName: "",
    creatorRole: "Family Member" as "Elderly Patient" | "Family Member" | "Caretaker",
  });

  // 4. ACTIVE ELDERLY PATIENT PROFILE STATE
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    name: "Shri Rameshwar Nath (Age 72)",
    bloodGroup: "O+",
    passcode: "CARE26",
    emergencyContact: "+919876543210",
    emergencyDisplay: "+91 98765 43210",
    careEmail: "family.circle@gmail.com",
    vitals: { bp: "124/82 mmHg", heartRate: "74 BPM", glucose: "112 mg/dL" },
  });

  // 5. LIVE SOS EMERGENCY CALL STATE
  const [sosActive, setSosActive] = useState(false);
  const [sosStage, setSosStage] = useState<"DIALING" | "CONNECTED">("DIALING");
  const [callSeconds, setCallSeconds] = useState(0);
  const [gpsCoords, setGpsCoords] = useState("20.2961° N, 85.8245° E (Bhubaneswar, Odisha)");
  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 6. MEDICATIONS SCHEDULE STATE
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "med-1",
      name: "Amlodipine",
      dosage: "5 mg",
      time: "08:00 AM",
      period: "Morning",
      instructions: "Take 1 tablet after breakfast with water",
      status: "Taken",
      pillsLeft: 18,
    },
    {
      id: "med-2",
      name: "Metformin XR",
      dosage: "500 mg",
      time: "01:30 PM",
      period: "Afternoon",
      instructions: "Take immediately after lunch",
      status: "Pending",
      pillsLeft: 4,
    },
    {
      id: "med-3",
      name: "Atorvastatin",
      dosage: "10 mg",
      time: "09:00 PM",
      period: "Night",
      instructions: "Take before bedtime",
      status: "Missed",
      pillsLeft: 12,
    },
  ]);

  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    time: "09:00 AM",
    period: "Morning" as Medication["period"],
    instructions: "",
    pillsLeft: 30,
  });
  const [editingMedId, setEditingMedId] = useState<string | null>(null);

  // 7. MEDICAL APPOINTMENTS STATE
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "apt-1",
      doctor: "Dr. Ananya Mohanty",
      specialty: "Cardiologist",
      date: "2026-11-18",
      time: "10:30 AM",
      location: "Apollo Hospital, Bhubaneswar",
      notes: "Bring monthly BP log and ECG report",
    },
    {
      id: "apt-2",
      doctor: "Dr. S. K. Dash",
      specialty: "Endocrinology & Diabetes",
      date: "2026-11-24",
      time: "04:00 PM",
      location: "KIMS Medical Center",
      notes: "Fasting blood sugar check required",
    },
  ]);

  const [newApt, setNewApt] = useState({
    doctor: "",
    specialty: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  });

  // 8. PROACTIVE EMAIL REMINDERS STATE
  const [recipientEmail, setRecipientEmail] = useState("family.circle@gmail.com");
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([
    {
      id: "log-1",
      to: "family.circle@gmail.com",
      subject: "🚨 URGENT: Missed Medication Alert for Shri Rameshwar Nath",
      itemTitle: "Atorvastatin (10 mg) — 09:00 PM",
      timestamp: "09:15 PM",
      alertType: "MISSED_MED",
    },
  ]);
  const [sendingEmail, setSendingEmail] = useState(false);

  // 9. AI ASSISTANT STATE
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<string>(
    "• **Safe Combination:** Amlodipine, Metformin XR, and Atorvastatin have no severe direct contraindications.\n• **Grapefruit Warning:** Avoid grapefruit juice while taking Atorvastatin and Amlodipine as it alters liver metabolism.\n• **Low Inventory Alert:** Metformin XR has only 4 pills remaining—use the Pharmacy Auto-Refill portal below."
  );
  const [aiLoading, setAiLoading] = useState(false);

  // 10. PAYMENT GATEWAY STATE
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<{ name: string; amount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");

  // SYNC CHANGES TO BACKEND DATABASE AUTOMATICALLY
  const syncAccountToBackend = async (
    updatedProfile: PatientProfile,
    updatedMeds: Medication[],
    updatedApts: Appointment[]
  ) => {
    try {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SYNC",
          passcode: updatedProfile.passcode,
          patientProfile: updatedProfile,
          medications: updatedMeds,
          appointments: updatedApts,
        }),
      });
    } catch {
      // Ignore offline sync errors
    }
  };

  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.status === "Taken").length;
  const missedMeds = medications.filter((m) => m.status === "Missed").length;
  const adherenceRate = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;

  // SYNTHESIZE REAL PHONE RINGBACK TONE
  const playRingbackTone = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = 440;
      osc2.frequency.value = 480;
      gain.gain.value = 0.08;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      setTimeout(() => {
        osc1.stop();
        osc2.stop();
        ctx.close();
      }, 900);
    } catch {
      // Ignore audio restrictions
    }
  };

  const startSosCall = () => {
    setSosActive(true);
    setSosStage("DIALING");
    setCallSeconds(0);

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords(
            `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (Live GPS Locked)`
          );
        },
        () => {}
      );
    }

    playRingbackTone();
    ringIntervalRef.current = setInterval(playRingbackTone, 1600);

    triggerEmailReminder(
      "MISSED_MED",
      "🚨 EMERGENCY SOS CALL INITIATED BY PATIENT",
      new Date().toLocaleTimeString(),
      `Live Location: ${gpsCoords} • Dialing ${patientProfile.emergencyDisplay}`
    );

    setTimeout(() => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      setSosStage("CONNECTED");
      speakScheduleAloud(
        `Emergency SOS connected for ${patientProfile.name}. Your live GPS coordinates and vitals have been transmitted to ${patientProfile.emergencyDisplay}.`
      );
      callTimerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }, 3200);
  };

  const endSosCall = () => {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceMode(false);
    setSosActive(false);
  };

  useEffect(() => {
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);

  const speakScheduleAloud = (customText?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const pendingList = medications
      .filter((m) => m.status !== "Taken")
      .map((m) => `${m.name}, ${m.dosage} at ${m.time}. ${m.instructions}`)
      .join(". Next: ");

    const message =
      customText ||
      `Namaste ${patientProfile.name}. Your current medication adherence is ${adherenceRate} percent. ${
        pendingList
          ? `Remaining medications for today: ${pendingList}`
          : "Wonderful job! You have completed all your medications for today."
      }`;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.92;
    utterance.onend = () => setVoiceMode(false);
    utterance.onerror = () => setVoiceMode(false);

    setVoiceMode(true);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceMode = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (voiceMode) {
      window.speechSynthesis.cancel();
      setVoiceMode(false);
    } else {
      speakScheduleAloud();
    }
  };

  const triggerEmailReminder = async (
    alertType: "MISSED_MED" | "UPCOMING_DOSE" | "APPOINTMENT",
    itemTitle: string,
    itemTime: string,
    notes: string
  ) => {
    setSendingEmail(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail,
          alertType,
          patientName: patientProfile.name,
          itemTitle,
          itemTime,
          notes,
        }),
      });
      const data = await res.json();
      if (data.preview) {
        setEmailLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            to: data.preview.to,
            subject: data.preview.subject,
            itemTitle: data.preview.itemTitle || `${itemTitle} (${itemTime})`,
            timestamp: data.timestamp,
            alertType,
          },
          ...prev,
        ]);
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const updateMedStatus = (id: string, newStatus: Medication["status"]) => {
    setMedications((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          if (newStatus === "Missed") {
            triggerEmailReminder("MISSED_MED", `${m.name} (${m.dosage})`, m.time, m.instructions);
          }
          return {
            ...m,
            status: newStatus,
            pillsLeft:
              newStatus === "Taken" && m.status !== "Taken"
                ? Math.max(0, m.pillsLeft - 1)
                : m.pillsLeft,
          };
        }
        return m;
      });
      syncAccountToBackend(patientProfile, updated, appointments);
      return updated;
    });
  };

  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name.trim() || !newMed.dosage.trim()) return;

    if (editingMedId) {
      const updated = medications.map((m) => (m.id === editingMedId ? { ...m, ...newMed } : m));
      setMedications(updated);
      syncAccountToBackend(patientProfile, updated, appointments);
      setEditingMedId(null);
    } else {
      const created: Medication = { id: `med-${Date.now()}`, ...newMed, status: "Pending" };
      const updated = [...medications, created];
      setMedications(updated);
      syncAccountToBackend(patientProfile, updated, appointments);
      triggerEmailReminder("UPCOMING_DOSE", `${created.name} (${created.dosage})`, created.time, created.instructions);
    }
    setNewMed({ name: "", dosage: "", time: "09:00 AM", period: "Morning", instructions: "", pillsLeft: 30 });
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.doctor.trim() || !newApt.date) return;
    const created: Appointment = { id: `apt-${Date.now()}`, ...newApt };
    const updated = [...appointments, created];
    setAppointments(updated);
    syncAccountToBackend(patientProfile, medications, updated);
    triggerEmailReminder("APPOINTMENT", `${created.doctor} (${created.specialty})`, `${created.date} at ${created.time}`, created.location);
    setNewApt({ doctor: "", specialty: "", date: "", time: "", location: "", notes: "" });
  };

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const verifyRes = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken, passcode, role: activeRole, memberName }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setAuthError(verifyData.error || "Cloudflare Turnstile verification failed.");
        return;
      }

      const accRes = await fetch(`/api/accounts?passcode=${encodeURIComponent(passcode.trim())}`);
      const accData = await accRes.json();

      if (!accRes.ok || !accData.success) {
        setAuthError(accData.error || "Account not found. Try CARE26 or Register a New Profile.");
        return;
      }

      const { account } = accData;
      setPatientProfile(account.patientProfile);
      setMedications(account.medications || []);
      setAppointments(account.appointments || []);
      setRecipientEmail(account.patientProfile.careEmail || "family.circle@gmail.com");
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthStatus(`Verified (${activeRole}: ${memberName}) • Code: ${account.passcode}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const verifyRes = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: turnstileToken,
          passcode: regForm.newPasscode,
          role: regForm.creatorRole,
          memberName: regForm.creatorName,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setAuthError(verifyData.error || "Turnstile verification failed.");
        return;
      }

      const regRes = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REGISTER",
          passcode: regForm.newPasscode,
          patientProfile: {
            name: `${regForm.patientName} (Age ${regForm.patientAge})`,
            bloodGroup: regForm.bloodGroup,
            bp: regForm.bp,
            heartRate: regForm.heartRate,
            glucose: regForm.glucose,
            emergencyContact: regForm.emergencyContact,
            careEmail: regForm.careEmail,
          },
          medications: [],
          appointments: [],
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        setAuthError(regData.error || "Could not create account.");
        return;
      }

      const { account } = regData;
      setPatientProfile(account.patientProfile);
      setMedications([]);
      setAppointments([]);
      setRecipientEmail(account.patientProfile.careEmail);
      setPasscode(account.passcode);
      setActiveRole(regForm.creatorRole);
      setMemberName(regForm.creatorName);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthStatus(`New Profile Created (${regForm.creatorRole}: ${regForm.creatorName}) • Code: ${account.passcode}`);
      setAiResponse(
        `• **Welcome to AegisCare AI:** Profile for **${account.patientProfile.name}** is now active!\n• **Share Passcode:** Give passcode **${account.passcode}** to family members and caretakers so they can log in and collaborate.\n• **Get Started:** Add your first daily medication or doctor appointment using the forms above.`
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAskAi = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medications, question: aiQuestion, patientAge: 72 }),
      });
      const data = await res.json();
      setAiResponse(data.reply);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCarePayment = async (itemName: string, amount: number) => {
    setProcessingPayment(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, itemName }),
      });
      const data = await res.json();
      setPaymentSuccess(
        `Order #${data.orderId} Confirmed via ${paymentMethod}! ${itemName} (₹${amount}) scheduled for priority doorstep delivery.`
      );
      setMedications((prev) => {
        const updated = prev.map((m) => (m.pillsLeft < 10 ? { ...m, pillsLeft: m.pillsLeft + 30 } : m));
        syncAccountToBackend(patientProfile, updated, appointments);
        return updated;
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    // WRAP EVERYTHING IN A DIV THAT TOGGLES THE "dark" CLASS
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen font-sans bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white transition-colors duration-300 selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-cyan-500 dark:selection:text-black">
        
        {/* FIXED TOP NAVBAR */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex flex-wrap items-center justify-between px-6 py-3.5 bg-white/90 dark:bg-[#070b14]/85 backdrop-blur-md border-b border-slate-200 dark:border-cyan-500/20 shadow-sm dark:shadow-none transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 dark:bg-cyan-500 shadow-md dark:shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <HeartPulse className="w-5 h-5 text-white dark:text-black" />
            </div>
            <div>
              <span className="font-black text-lg tracking-wider text-blue-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:via-teal-300 dark:to-pink-400">
                AEGISCARE AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-emerald-500/20 text-slate-600 dark:text-emerald-300 border border-slate-300 dark:border-emerald-500/40">
                PASSCODE: {patientProfile.passcode}
              </span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-4">
            {[
              { label: "PORTAL", href: "#portal" },
              { label: "MEDICATIONS", href: "#medications" },
              { label: "APPOINTMENTS", href: "#appointments" },
              { label: "EMAIL WATCHDOG", href: "#reminders" },
              { label: "AI PHARMACIST", href: "#ai-care" },
              { label: "REFILL PAY", href: "#payment" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs font-bold tracking-wider text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 transition"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* THEME TOGGLE BUTTON */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition bg-white border-slate-300 text-indigo-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-amber-300 dark:hover:bg-slate-700"
              title="Toggle Light / Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleVoiceMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                voiceMode
                  ? "bg-blue-100 text-blue-800 border-blue-300 shadow-sm dark:bg-amber-400 dark:text-black dark:border-amber-300 dark:shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                  : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50 dark:bg-amber-500/20 dark:border-amber-400/60 dark:text-amber-300 dark:hover:bg-amber-500/30"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              {voiceMode ? "VOICE MODE: ON" : "VOICE MODE: OFF"}
            </button>

            <button
              onClick={() => {
                setAuthTab("REGISTER");
                setAuthError(null);
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 dark:border-cyan-400/60 dark:text-cyan-300 transition"
            >
              <UserPlus className="w-3.5 h-3.5" /> New Account
            </button>

            <button
              onClick={() => {
                setAuthTab("LOGIN");
                setAuthError(null);
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 border border-blue-700 text-white shadow-sm dark:bg-indigo-600/80 dark:hover:bg-indigo-500 dark:border-indigo-400 transition"
            >
              <Lock className="w-3.5 h-3.5" /> Switch / Login
            </button>

            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setAuthTab("LOGIN");
                  setShowAuthModal(true);
                }}
                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:border-rose-500/40 dark:text-rose-300 transition"
                title="Logout & Lock Profile"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </nav>

        {/* 1. 3-STAGE SCROLL-ZOOM PORTAL HERO */}
        <section id="portal" ref={scrollTrackRef} className="relative h-[260vh]">
          <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center transition-colors">
            {/* Background Transitions */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#f8fafc_0%,_#e2e8f0_100%)] dark:bg-[radial-gradient(circle_at_center,_#0f2942_0%,_#070b14_75%)] dark:opacity-90 transition-colors" />
            <div className="absolute inset-0 hidden dark:block bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-30" />

            <motion.div
              style={{ scale, opacity: portalOpacity, transformOrigin: "50% 46%" }}
              className="relative z-10 flex flex-col items-center mt-4"
            >
              <div className="w-[340px] sm:w-[440px] p-5 rounded-[2rem] dark:rounded-3xl bg-white border-4 border-slate-200 shadow-2xl dark:bg-gradient-to-b dark:from-slate-900 dark:via-indigo-950 dark:to-slate-950 dark:border-2 dark:border-cyan-400/60 dark:shadow-[0_0_70px_rgba(34,211,238,0.3)] transition-colors">
                
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-cyan-500/30 pb-2.5 mb-3 transition-colors">
                  <span className="font-black text-xl tracking-widest text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:to-pink-400">
                    AEGISCARE HUB
                  </span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-400/40">
                    CIRCLE CODE: {patientProfile.passcode}
                  </span>
                </div>

                <div className="w-full h-60 rounded-xl bg-slate-50 border border-slate-200 p-5 flex flex-col justify-between shadow-inner dark:bg-[#060d18] dark:border-cyan-400/80 dark:shadow-[inset_0_0_35px_rgba(34,211,238,0.25)] transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-600 dark:text-cyan-400 font-black text-2xl tracking-tight leading-none transition-colors">CARE.</p>
                      <p className="text-emerald-600 dark:text-pink-400 font-black text-2xl tracking-tight leading-none mt-1 transition-colors">CONNECT.</p>
                      <p className="text-teal-600 dark:text-emerald-400 font-black text-2xl tracking-tight leading-none mt-1 transition-colors">PROTECT.</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded font-mono bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 dark:bg-amber-400/20 dark:text-amber-300 dark:border-amber-400/40 transition-colors">
                        ELDERLY-FIRST AI
                      </span>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">{patientProfile.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-cyan-500/20 text-center font-mono transition-colors">
                    <div>
                      <div className="text-sm font-black text-blue-600 dark:text-emerald-400">{adherenceRate}%</div>
                      <div className="text-[8px] font-bold text-slate-500 dark:text-cyan-300">ADHERENCE</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-700 dark:text-white">{medications.length}</div>
                      <div className="text-[8px] font-bold text-slate-500 dark:text-cyan-300">DAILY MEDS</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-700 dark:text-pink-400">{appointments.length}</div>
                      <div className="text-[8px] font-bold text-slate-500 dark:text-cyan-300">DOCTOR VISITS</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-700 dark:text-amber-300">24/7</div>
                      <div className="text-[8px] font-bold text-slate-500 dark:text-cyan-300">EMAIL ALERTS</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse transition-colors" />
                    <span className="text-[11px] font-bold font-mono text-slate-500 dark:text-cyan-300 transition-colors">SECURE CONNECTION ACTIVE</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-pink-500 transition-colors" />
                    <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-cyan-400 transition-colors" />
                    <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-amber-400 transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: promptOpacity }}
              className="absolute bottom-6 z-20 px-6 py-2.5 rounded-full dark:rounded-md border border-slate-300 dark:border-cyan-400 bg-white dark:bg-cyan-950/90 text-slate-600 dark:text-cyan-300 font-bold dark:font-mono text-xs tracking-wider dark:tracking-[0.2em] shadow-lg dark:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-colors"
            >
              Scroll Down to Enter Care Ecosystem
            </motion.div>
          </div>
        </section>

        {/* STAGE 3: MAIN PLATFORM */}
        <main className="relative z-20 bg-slate-50 dark:bg-[#070b14] border-t border-slate-200 dark:border-cyan-500/30 px-4 sm:px-8 py-16 transition-colors">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* TOP PATIENT BANNER */}
            <PopOutElement>
              <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950/80 dark:to-slate-900 border border-slate-200 dark:border-cyan-500/30 shadow-lg dark:shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400/40 transition-colors">
                      SHARED CARE PROFILE • CODE: {patientProfile.passcode}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 transition-colors">
                      <ShieldCheck className="w-4 h-4" /> {authStatus}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white transition-colors">{patientProfile.name}</h1>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors">
                    Blood Group: <strong className="text-slate-900 dark:text-pink-400">{patientProfile.bloodGroup}</strong> • BP:{" "}
                    <strong className="text-slate-900 dark:text-cyan-300">{patientProfile.vitals.bp}</strong> • Heart Rate:{" "}
                    <strong className="text-slate-900 dark:text-emerald-300">{patientProfile.vitals.heartRate}</strong> • Glucose:{" "}
                    <strong className="text-slate-900 dark:text-amber-300">{patientProfile.vitals.glucose}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 transition-colors">
                    {(["Elderly Patient", "Family Member", "Caretaker"] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => setActiveRole(role)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                          activeRole === role ? "bg-white text-blue-700 shadow-sm dark:bg-cyan-500 dark:text-black dark:shadow-none" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={startSosCall}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-black text-xs tracking-wider uppercase shadow-md shadow-red-200 dark:shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-pulse transition"
                  >
                    <PhoneCall className="w-4 h-4" /> 1-Tap SOS Alert
                  </button>
                </div>
              </div>
            </PopOutElement>

            {/* STATS BAR */}
            <PopOutElement delay={0.1}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center py-6 px-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
                <div>
                  <div className="text-3xl font-black text-blue-600 dark:text-emerald-400">{adherenceRate}%</div>
                  <div className="text-xs font-bold font-mono text-slate-500 dark:text-cyan-400 mt-1">DAILY ADHERENCE</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-amber-400">
                    {takenMeds}/{totalMeds}
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-500 dark:text-cyan-400 mt-1">DOSES COMPLETED</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-red-500 dark:text-rose-400">{missedMeds}</div>
                  <div className="text-xs font-bold font-mono text-slate-500 dark:text-cyan-400 mt-1">MISSED ALERTS SENT</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-teal-600 dark:text-pink-400">{emailLogs.length}</div>
                  <div className="text-xs font-bold font-mono text-slate-500 dark:text-cyan-400 mt-1">PROACTIVE EMAILS</div>
                </div>
              </div>
            </PopOutElement>

            {/* 2. MEDICATION SCHEDULE */}
            <section id="medications" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <PopOutElement className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black flex items-center gap-2.5 text-slate-800 dark:text-cyan-400 transition-colors">
                    <Pill className="w-6 h-6 text-blue-600 dark:text-cyan-400" /> Daily Medication Schedule
                  </h2>
                  <span className="text-xs font-medium font-mono text-slate-500 dark:text-slate-400 transition-colors">Auto-synced to Passcode {patientProfile.passcode}</span>
                </div>

                {medications.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400 text-sm transition-colors">
                    No medications scheduled for {patientProfile.name} yet. Use the form on the right to add the first dose!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          med.status === "Taken"
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/40"
                            : med.status === "Missed"
                            ? "bg-red-50 border-red-200 dark:bg-rose-950/30 dark:border-rose-500/50"
                            : "bg-white border-slate-200 shadow-sm dark:bg-slate-900/90 dark:border-white/10 dark:shadow-none"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-slate-100 text-slate-600 border border-slate-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-transparent transition-colors">
                              {med.period} • {med.time}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">
                              {med.name} <span className="text-slate-500 dark:text-cyan-400 text-base font-medium transition-colors">({med.dosage})</span>
                            </h3>
                            {med.pillsLeft <= 5 ? (
                              <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-400/40 transition-colors">
                                Low Stock: {med.pillsLeft} left
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[11px] font-bold font-mono rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                                Stock: {med.pillsLeft} pills
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors">{med.instructions}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => updateMedStatus(med.id, "Taken")}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                              med.status === "Taken"
                                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 dark:hover:bg-emerald-500/30"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" /> Taken
                          </button>

                          <button
                            onClick={() => updateMedStatus(med.id, "Missed")}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                              med.status === "Missed"
                                ? "bg-red-600 text-white dark:bg-rose-500 dark:text-white"
                                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 dark:hover:bg-rose-500/30"
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" /> Missed
                          </button>

                          <button
                            onClick={() =>
                              speakScheduleAloud(`${med.name}, ${med.dosage}. Scheduled for ${med.time}. ${med.instructions}`)
                            }
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-cyan-300 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingMedId(med.id);
                              setNewMed({
                                name: med.name,
                                dosage: med.dosage,
                                time: med.time,
                                period: med.period,
                                instructions: med.instructions,
                                pillsLeft: med.pillsLeft,
                              });
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-amber-300 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              const updated = medications.filter((m) => m.id !== med.id);
                              setMedications(updated);
                              syncAccountToBackend(patientProfile, updated, appointments);
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-red-500 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-rose-900/60 dark:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PopOutElement>

              <PopOutElement delay={0.15}>
                <form onSubmit={handleSaveMedication} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/90 dark:border-cyan-500/30 dark:shadow-none space-y-4 transition-colors">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                    <Plus className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                    {editingMedId ? "Edit Medication" : "Add Medication"}
                  </h3>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Medication Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Telmisartan"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Dosage</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 40 mg"
                        value={newMed.dosage}
                        onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Scheduled Time</label>
                      <input
                        type="text"
                        required
                        placeholder="08:30 AM"
                        value={newMed.time}
                        onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Routine Period</label>
                      <select
                        value={newMed.period}
                        onChange={(e) => setNewMed({ ...newMed, period: e.target.value as Medication["period"] })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Pills in Stock</label>
                      <input
                        type="number"
                        value={newMed.pillsLeft}
                        onChange={(e) => setNewMed({ ...newMed, pillsLeft: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Special Instructions</label>
                    <input
                      type="text"
                      placeholder="Take after food with warm water"
                      value={newMed.instructions}
                      onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-teal-500 dark:text-black font-black text-sm transition shadow-sm dark:shadow-none"
                  >
                    {editingMedId ? "Update Medication" : "Save & Notify Care Circle"}
                  </button>
                </form>
              </PopOutElement>
            </section>

            {/* 3. APPOINTMENTS & EMAIL WATCHDOG */}
            <section id="appointments" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PopOutElement className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/90 dark:border-white/10 dark:shadow-none space-y-5 transition-colors">
                <h2 className="text-2xl font-black flex items-center gap-2.5 text-slate-800 dark:text-pink-400 transition-colors">
                  <Calendar className="w-6 h-6 text-teal-600 dark:text-pink-400" /> Doctor Appointments
                </h2>
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-pink-500/30 flex items-start justify-between gap-4 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg transition-colors">
                          {apt.doctor} <span className="text-xs font-bold font-mono text-slate-500 dark:text-pink-400">({apt.specialty})</span>
                        </h4>
                        <p className="text-xs font-bold font-mono text-teal-700 dark:text-cyan-300 mt-0.5 transition-colors">
                          📅 {apt.date} • ⏰ {apt.time} • 📍 {apt.location}
                        </p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 transition-colors">{apt.notes}</p>
                      </div>
                      <button
                        onClick={() =>
                          triggerEmailReminder("APPOINTMENT", `${apt.doctor} (${apt.specialty})`, `${apt.date} at ${apt.time}`, apt.location)
                        }
                        className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 dark:bg-pink-500/20 dark:border-pink-400/40 dark:text-pink-300 text-xs font-bold hover:bg-teal-100 dark:hover:bg-pink-500/30 shrink-0 transition-colors"
                      >
                        Email Reminder
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddAppointment} className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-white/10 transition-colors">
                  <input
                    type="text"
                    required
                    placeholder="Doctor Name"
                    value={newApt.doctor}
                    onChange={(e) => setNewApt({ ...newApt, doctor: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Specialty (e.g. Cardiology)"
                    value={newApt.specialty}
                    onChange={(e) => setNewApt({ ...newApt, specialty: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="date"
                    required
                    value={newApt.date}
                    onChange={(e) => setNewApt({ ...newApt, date: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Time (e.g. 11:00 AM)"
                    value={newApt.time}
                    onChange={(e) => setNewApt({ ...newApt, time: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Hospital / Clinic Location"
                    value={newApt.location}
                    onChange={(e) => setNewApt({ ...newApt, location: e.target.value })}
                    className="col-span-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button type="submit" className="col-span-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-pink-500 dark:hover:bg-pink-400 font-bold text-sm transition shadow-sm dark:shadow-none">
                    + Schedule Appointment & Email Caretakers
                  </button>
                </form>
              </PopOutElement>

              <PopOutElement delay={0.15} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/90 dark:border-amber-500/30 dark:shadow-none space-y-5 transition-colors">
                <div id="reminders" className="flex items-center justify-between">
                  <h2 className="text-2xl font-black flex items-center gap-2.5 text-slate-800 dark:text-amber-400 transition-colors">
                    <BellRing className="w-6 h-6 text-amber-500 dark:text-amber-400" /> Proactive Email Watchdog
                  </h2>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent transition-colors">AUTO-MONITORING ON</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Caretaker / Family Email"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    disabled={sendingEmail}
                    onClick={() =>
                      triggerEmailReminder("UPCOMING_DOSE", "Scheduled Medication Check", new Date().toLocaleTimeString(), "Ensure timely dose adherence.")
                    }
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-black font-bold text-sm flex items-center gap-1.5 shrink-0 transition"
                  >
                    <Send className="w-4 h-4" />
                    {sendingEmail ? "Sending..." : "Send Test Alert"}
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {emailLogs.map((log) => {
                    const urlMatch = log.itemTitle.match(/https:\/\/ethereal\.email\/message\/[^\s]+/);
                    return (
                      <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs space-y-1.5 transition-colors">
                        <div className="flex justify-between font-bold font-mono text-slate-500 dark:text-slate-400">
                          <span>To: {log.to}</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="font-bold text-slate-800 dark:text-amber-300 transition-colors">{log.subject}</p>
                        <p className="font-medium text-slate-600 dark:text-slate-300 transition-colors">{log.itemTitle}</p>
                        {urlMatch && (
                          <a
                            href={urlMatch[0]}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-1 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 dark:bg-cyan-500/20 dark:border-cyan-400/50 dark:text-cyan-300 font-bold font-mono text-[11px] hover:bg-blue-100 dark:hover:bg-cyan-500/30 transition-colors"
                          >
                            ↗ Open Delivered Email Inbox
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </PopOutElement>
            </section>

            {/* 4. AI CARE ADVISOR & PHARMACY PAYMENT */}
            <section id="ai-care" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PopOutElement className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-gradient-to-br dark:from-indigo-950/70 dark:to-slate-900 dark:border-cyan-400/40 dark:shadow-none space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800 dark:text-cyan-300 transition-colors">
                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-cyan-400 transition-colors" /> AI Drug-Interaction Advisor
                  </h2>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-transparent transition-colors">LIVE AI ENGINE</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 dark:bg-slate-950/90 dark:border-cyan-500/20 dark:text-slate-200 space-y-2 leading-relaxed transition-colors">
                  {aiResponse.split("\n").map((line, i) => (
                    <p key={i}>
                      {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={j} className="text-blue-700 dark:text-cyan-300 font-bold transition-colors">
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskAi();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ask about side effects, food interactions..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-cyan-400 dark:hover:bg-cyan-300 dark:text-black font-bold text-sm shrink-0 transition"
                  >
                    {aiLoading ? "Analyzing..." : "Ask AI"}
                  </button>
                </form>
              </PopOutElement>

              <PopOutElement delay={0.15} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/90 dark:border-emerald-500/30 dark:shadow-none space-y-4 transition-colors">
                <div id="payment" className="flex items-center justify-between">
                  <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800 dark:text-emerald-400 transition-colors">
                    <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Auto-Refill & Care Pay
                  </h2>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent transition-colors">SECURE CHECKOUT</span>
                </div>

                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors">
                  Low-stock medications are automatically flagged so family members can order doorstep refills remotely via UPI, Card, or Netbanking.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-amber-500/40 flex flex-col justify-between transition-colors">
                    <div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-transparent transition-colors">LOW STOCK REFILL</span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base mt-2 transition-colors">Prescription 30-Day Refill</h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">Express 2-hour pharmacy delivery to patient address.</p>
                    </div>
                    <button
                      disabled={processingPayment}
                      onClick={() => setCheckoutItem({ name: "30-Day Prescription Refill Pack", amount: 249 })}
                      className="mt-4 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-black font-bold text-sm transition"
                    >
                      Pay ₹249 & Auto-Refill
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-cyan-500/40 flex flex-col justify-between transition-colors">
                    <div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-transparent transition-colors">24/7 NURSE & TELE-CARE</span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base mt-2 transition-colors">AegisCare Plus Family Plan</h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">Weekly home vitals checkup + unlimited SMS/Email escalations.</p>
                    </div>
                    <button
                      disabled={processingPayment}
                      onClick={() => setCheckoutItem({ name: "AegisCare Plus Monthly Care Plan", amount: 499 })}
                      className="mt-4 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-cyan-400 dark:hover:bg-cyan-300 dark:text-black font-bold text-sm transition"
                    >
                      Pay ₹499 / Month
                    </button>
                  </div>
                </div>

                {paymentSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-400 dark:text-emerald-200 text-xs font-bold font-mono transition-colors">
                    ✅ {paymentSuccess}
                  </div>
                )}
              </PopOutElement>
            </section>
          </div>
        </main>

        {/* ===================================================================== */}
        {/* LIVE 1-TAP SOS EMERGENCY CALL & GPS DISPATCH MODAL                    */}
        {/* ===================================================================== */}
        {sosActive && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md rounded-3xl bg-white border border-red-200 dark:bg-slate-950 dark:border-2 dark:border-rose-500 shadow-2xl dark:shadow-[0_0_80px_rgba(225,29,72,0.6)] overflow-hidden transition-colors">
              <div className="p-6 bg-red-50 dark:bg-gradient-to-b dark:from-rose-950/90 dark:to-slate-950 text-center space-y-4 transition-colors">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-100 border-4 border-white dark:bg-rose-600/30 dark:border-2 dark:border-rose-400 shadow-sm dark:shadow-none flex items-center justify-center animate-pulse transition-colors">
                  <PhoneCall className="w-10 h-10 text-red-600 dark:text-rose-400 transition-colors" />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-white border border-red-200 text-red-600 dark:bg-rose-500/20 dark:border-rose-400/50 dark:text-rose-300 font-bold font-mono text-xs uppercase tracking-widest shadow-sm dark:shadow-none transition-colors">
                    {sosStage === "DIALING" ? "Dialing Emergency Contact..." : `Connected • ${formatTimer(callSeconds)}`}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-3 transition-colors">Family Caretaker & Dispatch</h3>
                  <p className="text-sm font-bold font-mono text-red-600 dark:text-cyan-300 mt-0.5 transition-colors">{patientProfile.emergencyDisplay}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/90 dark:border-white/10 text-left space-y-2 text-xs shadow-sm dark:shadow-none transition-colors">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-emerald-400 font-bold font-mono transition-colors">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{gpsCoords}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium transition-colors">
                    Patient: <strong className="text-slate-900 dark:text-white">{patientProfile.name}</strong> • Blood Group: <strong className="text-slate-900 dark:text-white">{patientProfile.bloodGroup}</strong>
                  </p>
                  <p className="text-emerald-700 dark:text-amber-300 font-bold font-mono text-[11px] transition-colors">
                    ✓ Urgent Email & Vitals Packet Dispatched to {recipientEmail}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <a
                    href={`tel:${patientProfile.emergencyContact}`}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm dark:shadow-none"
                  >
                    <PhoneCall className="w-4 h-4" /> Dial on Phone App
                  </a>
                  <a
                    href={`https://wa.me/${patientProfile.emergencyContact.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `🚨 EMERGENCY SOS from ${patientProfile.name}! Live Location: ${gpsCoords}. Need immediate check-in.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm dark:shadow-none"
                  >
                    <Send className="w-4 h-4" /> WhatsApp SOS
                  </a>
                </div>

                <button
                  onClick={endSosCall}
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-black text-sm flex items-center justify-center gap-2 transition shadow-md dark:shadow-none"
                >
                  <PhoneOff className="w-4 h-4" /> End Emergency Call
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* FULL MULTI-USER LOGIN & NEW ACCOUNT REGISTRATION PORTAL MODAL         */}
        {/* ===================================================================== */}
        {(showAuthModal || !isAuthenticated) && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto transition-colors">
            <div className="w-full max-w-lg p-6 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-cyan-400/50 space-y-4 shadow-2xl my-8 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                  <Users className="w-5 h-5 text-blue-600 dark:text-cyan-400 transition-colors" /> AegisCare Account Portal
                </h3>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="px-2.5 py-1 rounded bg-slate-100 text-xs font-bold text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white transition"
                  >
                    Close ✕
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 transition-colors">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("LOGIN");
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition ${
                    authTab === "LOGIN" ? "bg-white text-blue-700 shadow-sm dark:bg-cyan-400 dark:text-black dark:shadow-none" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <LogIn className="w-4 h-4" /> Join / Login Circle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("REGISTER");
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition ${
                    authTab === "REGISTER" ? "bg-blue-600 text-white shadow-sm dark:bg-pink-500 dark:text-white dark:shadow-none" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <UserPlus className="w-4 h-4" /> Create New Account
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-rose-950/70 dark:border-rose-500 dark:text-rose-200 font-bold text-xs transition-colors">
                  ⚠️ {authError}
                </div>
              )}

              {authTab === "LOGIN" ? (
                <form onSubmit={handlePasscodeLogin} className="space-y-3.5">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors">
                    Enter an existing <strong>Care Circle Passcode</strong> (e.g., <strong>CARE26</strong>) to access that elderly person&apos;s live healthcare profile.
                  </p>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Your Name</label>
                    <input
                      type="text"
                      required
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      placeholder="e.g., Rudra P Jena"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Select Your Role</label>
                    <select
                      value={activeRole}
                      onChange={(e) => setActiveRole(e.target.value as typeof activeRole)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                    >
                      <option value="Elderly Patient">Elderly Patient (Self-Management)</option>
                      <option value="Family Member">Family Member</option>
                      <option value="Caretaker">Authorized Caretaker / Nurse</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Shared Care Circle Passcode</label>
                    <input
                      type="text"
                      required
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter CARE26 or your custom code"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-blue-400 text-sm font-bold font-mono tracking-widest text-blue-700 uppercase focus:border-blue-600 focus:outline-none shadow-inner dark:bg-slate-950 dark:border-cyan-400/60 dark:text-cyan-300 transition-colors"
                    />
                  </div>

                  <div className="pt-1">
                    <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-gradient-to-r dark:from-cyan-400 dark:to-teal-400 dark:text-black font-black text-sm transition shadow-md dark:shadow-none"
                  >
                    {authLoading ? "Verifying & Loading Profile..." : "Verify Turnstile & Login to Care Circle"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterNewAccount} className="space-y-3">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors">
                    Register a new elderly person&apos;s profile and generate a unique <strong>Care Circle Passcode</strong> to share with family and caretakers.
                  </p>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Elderly Patient Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Smt. Kamala Devi"
                        value={regForm.patientName}
                        onChange={(e) => setRegForm({ ...regForm, patientName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Age</label>
                      <input
                        type="number"
                        required
                        value={regForm.patientAge}
                        onChange={(e) => setRegForm({ ...regForm, patientAge: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Blood Grp</label>
                      <input
                        type="text"
                        value={regForm.bloodGroup}
                        onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Blood Pressure</label>
                      <input
                        type="text"
                        value={regForm.bp}
                        onChange={(e) => setRegForm({ ...regForm, bp: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Heart Rate</label>
                      <input
                        type="text"
                        value={regForm.heartRate}
                        onChange={(e) => setRegForm({ ...regForm, heartRate: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Glucose</label>
                      <input
                        type="text"
                        value={regForm.glucose}
                        onChange={(e) => setRegForm({ ...regForm, glucose: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Emergency SOS Phone</label>
                      <input
                        type="text"
                        required
                        placeholder="+91 98765 43210"
                        value={regForm.emergencyContact}
                        onChange={(e) => setRegForm({ ...regForm, emergencyContact: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Caretaker / Family Email</label>
                      <input
                        type="email"
                        required
                        placeholder="family@gmail.com"
                        value={regForm.careEmail}
                        onChange={(e) => setRegForm({ ...regForm, careEmail: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={regForm.creatorName}
                        onChange={(e) => setRegForm({ ...regForm, creatorName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-950 dark:border-slate-700 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1 transition-colors">Create Circle Passcode</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          required
                          placeholder="e.g. CARE99"
                          value={regForm.newPasscode}
                          onChange={(e) => setRegForm({ ...regForm, newPasscode: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 rounded-xl bg-white border-2 border-emerald-400 text-xs font-bold font-mono text-emerald-700 uppercase focus:border-emerald-600 focus:outline-none dark:bg-slate-950 dark:border-pink-500/60 dark:text-pink-300 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setRegForm({
                              ...regForm,
                              newPasscode: `CARE${Math.floor(100 + Math.random() * 900)}`,
                            })
                          }
                          className="px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 shrink-0 transition dark:bg-slate-800 dark:border-slate-700 dark:text-cyan-300"
                          title="Generate Random Passcode"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-gradient-to-r dark:from-pink-500 dark:to-cyan-400 dark:text-black font-black text-sm transition shadow-md dark:shadow-none"
                  >
                    {authLoading ? "Creating Profile..." : "Create Elderly Care Profile & Unlock"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SCANNABLE UPI QR / CARD / NETBANKING PAYMENT MODAL                    */}
        {/* ===================================================================== */}
        {checkoutItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-emerald-400/50 overflow-hidden shadow-2xl transition-colors">
              <div className="p-5 bg-slate-50 border-b border-slate-200 dark:bg-gradient-to-r dark:from-emerald-600 dark:to-teal-700 dark:border-none text-slate-900 dark:text-white flex justify-between items-center transition-colors">
                <div>
                  <span className="text-[10px] font-bold uppercase font-mono tracking-widest bg-emerald-100 text-emerald-800 dark:bg-black/30 dark:text-white px-2 py-0.5 rounded border border-emerald-200 dark:border-transparent transition-colors">
                    AegisCare Secure Checkout
                  </span>
                  <h3 className="text-lg font-black mt-1">{checkoutItem.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold opacity-80">Total Payable</span>
                  <div className="text-2xl font-black">₹{checkoutItem.amount}</div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                  {(["UPI", "CARD", "NETBANKING"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 text-xs font-bold rounded-lg transition ${
                        paymentMethod === method ? "bg-white text-blue-700 shadow-sm dark:bg-emerald-500 dark:text-black dark:shadow-none" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod === "UPI" && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-3 text-center transition-colors">
                    <div className="w-40 h-40 mx-auto rounded-xl bg-white p-2.5 flex items-center justify-center border border-slate-200 shadow-sm dark:shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-colors">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          `upi://pay?pa=aegiscare.pharmacy@okaxis&pn=AegisCare%20AI%20Pharmacy&am=${checkoutItem.amount}&cu=INR`
                        )}`}
                        alt="Scannable UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400 transition-colors">
                      Scan with any UPI App (GPay, PhonePe, Paytm, FamPay)
                    </p>
                    <input
                      type="text"
                      defaultValue="family.care@okaxis"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 dark:bg-slate-900 dark:border-slate-700 text-xs text-slate-900 dark:text-white text-center font-bold font-mono focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {paymentMethod === "CARD" && (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      defaultValue="4532 •••• •••• 8891"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold font-mono focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" defaultValue="08/29" className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold font-mono focus:border-blue-500 focus:outline-none transition-colors" />
                      <input type="password" defaultValue="123" className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold font-mono focus:border-blue-500 focus:outline-none transition-colors" />
                    </div>
                  </div>
                )}

                {paymentMethod === "NETBANKING" && (
                  <select className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold focus:border-blue-500 focus:outline-none transition-colors">
                    <option>State Bank of India (SBI)</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutItem(null)}
                    className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={processingPayment}
                    onClick={async () => {
                      await handleCarePayment(checkoutItem.name, checkoutItem.amount);
                      setCheckoutItem(null);
                    }}
                    className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-black font-black text-sm transition shadow-md dark:shadow-none"
                  >
                    {processingPayment ? "Verifying Bank..." : `Pay ₹${checkoutItem.amount} Now`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}