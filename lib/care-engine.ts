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

/**
 * Computes real-time medication adherence and inventory metrics in a single O(N) pass.
 */
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

  return {
    totalMeds,
    takenMeds,
    missedMeds,
    pendingMeds,
    lowStockCount,
    adherenceRate,
  };
}

/**
 * Evaluates patient vitals for clinical warning thresholds in elderly patients.
 */
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

/**
 * Deterministic clinical drug-interaction analyzer used by API and unit tests.
 */
export function analyzeDrugInteractions(medications: Medication[], question = ""): string {
  const names = medications.map((m) => m.name.toLowerCase());
  const notes: string[] = [];

  const hasStatin = names.some((n) => n.includes("statin") || n.includes("atorvastatin") || n.includes("rosuvastatin"));
  const hasAmlodipine = names.some((n) => n.includes("amlodipine") || n.includes("cilnidipine"));
  const hasMetformin = names.some((n) => n.includes("metformin") || n.includes("glimepiride"));
  const hasBloodThinner = names.some((n) => n.includes("aspirin") || n.includes("warfarin") || n.includes("clopidogrel"));

  if (hasStatin && hasAmlodipine) {
    notes.push(
      "• **Food & Enzyme Warning:** Avoid grapefruit juice while taking Atorvastatin and Amlodipine, as CYP3A4 inhibition increases plasma drug concentration."
    );
  }
  if (hasMetformin) {
    notes.push(
      "• **GI & Glycemic Safety:** Take Metformin immediately after meals to minimize gastrointestinal discomfort and monitor fasting glucose."
    );
  }
  if (hasBloodThinner) {
    notes.push(
      "• **Bleeding Risk Precaution:** Avoid over-the-counter NSAIDs (like Ibuprofen) alongside antiplatelet/anticoagulant therapy without cardiologist approval."
    );
  }

  const lowStock = medications.filter((m) => m.pillsLeft <= 5);
  if (lowStock.length > 0) {
    notes.push(
      `• **Low Inventory Alert:** ${lowStock.map((m) => `${m.name} (${m.pillsLeft} left)`).join(", ")} — trigger Pharmacy Auto-Refill below.`
    );
  }

  if (question.trim()) {
    notes.push(
      `• **Clinical Guidance (${question.trim()}):** For geriatric patients (Age 65+), never double up on a missed dose; if within 2 hours of the scheduled window, take with water after food, otherwise skip and log for the Care Circle.`
    );
  }

  if (notes.length === 0) {
    notes.push("• **Safe Regimen:** No severe direct contraindications detected in the active schedule.");
  }

  return notes.join("\n");
}
