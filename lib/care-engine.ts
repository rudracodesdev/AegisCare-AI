export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  period: "Morning" | "Afternoon" | "Evening" | "Night";
  instructions: string;
  status: "Taken" | "Pending" | "Missed";
  pillsLeft: number;
}

export interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  notes: string;
}

export interface PatientVitals {
  bp: string;
  heartRate: string;
  glucose: string;
}

export interface PatientProfile {
  name: string;
  bloodGroup: string;
  passcode: string;
  emergencyContact: string;
  emergencyDisplay: string;
  careEmail: string;
  vitals: PatientVitals;
}

export interface AdherenceSummary {
  totalMeds: number;
  takenMeds: number;
  missedMeds: number;
  pendingMeds: number;
  lowStockCount: number;
  adherenceRate: number;
}

export function calculateAdherenceSummary(medications: Medication[]): AdherenceSummary {
  let takenMeds = 0;
  let missedMeds = 0;
  let pendingMeds = 0;
  let lowStockCount = 0;

  for (const med of medications) {
    if (med.status === "Taken") takenMeds++;
    else if (med.status === "Missed") missedMeds++;
    else pendingMeds++;
    if (med.pillsLeft <= 5) lowStockCount++;
  }

  const totalMeds = medications.length;
  const adherenceRate = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;
  return { totalMeds, takenMeds, missedMeds, pendingMeds, lowStockCount, adherenceRate };
}

export function evaluateVitalsSafety(vitals: PatientVitals): {
  status: "NORMAL" | "ELEVATED" | "CRITICAL";
  advisory: string;
} {
  const [systolicStr, diastolicStr] = (vitals.bp || "120/80").split("/");
  const systolic = parseInt(systolicStr, 10) || 120;
  const diastolic = parseInt(diastolicStr, 10) || 80;
  const hr = parseInt(vitals.heartRate, 10) || 72;
  const glucose = parseInt(vitals.glucose, 10) || 100;

  if (systolic >= 160 || diastolic >= 100 || glucose >= 200 || glucose < 70 || hr >= 115 || hr < 50) {
    return {
      status: "CRITICAL",
      advisory: "Vitals outside safe geriatric range. Immediate caretaker review or SOS consult advised.",
    };
  }
  if (systolic >= 135 || diastolic >= 85 || glucose >= 130 || hr >= 95) {
    return {
      status: "ELEVATED",
      advisory: "Slightly elevated readings detected. Ensure morning antihypertensive/diabetic doses are taken on time.",
    };
  }
  return {
    status: "NORMAL",
    advisory: "All vital signs are within healthy geriatric target ranges.",
  };
}

export function analyzeDrugInteractions(
  medications: Medication[],
  question = "",
  context?: { patientAge?: number; role?: string; vitals?: PatientVitals }
): string {
  const names = medications.map((m) => m.name.toLowerCase());
  const notes: string[] = [];
  const role = context?.role || "Family Member";
  const age = context?.patientAge || 72;

  if (context?.vitals) {
    const vitalsCheck = evaluateVitalsSafety(context.vitals);
    if (vitalsCheck.status !== "NORMAL") {
      notes.push(`• **Context-Aware Vitals Alert (${vitalsCheck.status}):** ${vitalsCheck.advisory}`);
    }
  }

  const missedList = medications.filter((m) => m.status === "Missed");
  if (missedList.length > 0) {
    notes.push(
      `• **Missed Dose Escalation (${role} View):** ${missedList.map((m) => m.name).join(", ")} marked missed. Do not double the next dose.`
    );
  }

  if (names.some((n) => n.includes("statin")) && names.some((n) => n.includes("amlodipine"))) {
    notes.push(
      "• **Food & Enzyme Warning:** Avoid grapefruit juice while taking Atorvastatin and Amlodipine due to CYP3A4 interaction."
    );
  }
  if (names.some((n) => n.includes("metformin"))) {
    notes.push(
      "• **GI & Glycemic Safety:** Take Metformin immediately after meals and monitor fasting blood glucose."
    );
  }

  const lowStock = medications.filter((m) => m.pillsLeft <= 5);
  if (lowStock.length > 0) {
    notes.push(
      `• **Low Inventory Alert:** ${lowStock.map((m) => `${m.name} (${m.pillsLeft} left)`).join(", ")} — trigger Pharmacy Auto-Refill.`
    );
  }

  if (question.trim()) {
    notes.push(
      `• **Clinical Guidance (${question.trim()} • Age ${age}):** Never double up on a missed dose; take within 2 hours after food or log for the Care Circle.`
    );
  }

  return notes.length > 0
    ? notes.join("\n")
    : "• **Safe Regimen:** No severe direct contraindications detected in the active schedule.";
}
