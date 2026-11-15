import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { sanitizePasscode, sanitizeText, hashPasscode } from "@/lib/security";
import type { PatientProfile, Medication, Appointment } from "@/lib/care-engine";

interface AccountRecord {
  passcode: string;
  passcodeHash: string;
  patientProfile: PatientProfile;
  medications: Medication[];
  appointments: Appointment[];
  updatedAt: string;
}

const DB_PATH = path.join(os.tmpdir(), "care-accounts-db.json");

const INITIAL_ACCOUNTS: Record<string, AccountRecord> = {
  CARE26: {
    passcode: "CARE26",
    passcodeHash: hashPasscode("CARE26"),
    updatedAt: new Date().toISOString(),
    patientProfile: {
      name: "Shri Rameshwar Nath (Age 72)",
      bloodGroup: "O+",
      passcode: "CARE26",
      emergencyContact: "+919876543210",
      emergencyDisplay: "+91 98765 43210",
      careEmail: "family.circle@gmail.com",
      vitals: { bp: "124/82 mmHg", heartRate: "74 BPM", glucose: "112 mg/dL" },
    },
    medications: [
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
    ],
    appointments: [
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
    ],
  },
};

const globalStore = globalThis as unknown as {
  __aegisAccountsCache?: Record<string, AccountRecord>;
};

async function getDb(): Promise<Record<string, AccountRecord>> {
  if (globalStore.__aegisAccountsCache) {
    return globalStore.__aegisAccountsCache;
  }
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, AccountRecord>;
    globalStore.__aegisAccountsCache = { ...INITIAL_ACCOUNTS, ...parsed };
  } catch {
    globalStore.__aegisAccountsCache = { ...INITIAL_ACCOUNTS };
  }
  return globalStore.__aegisAccountsCache;
}

async function persistDb(db: Record<string, AccountRecord>): Promise<void> {
  globalStore.__aegisAccountsCache = db;
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    // Serverless read-only fallback handled via in-memory cache
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = sanitizePasscode(searchParams.get("passcode") || "");
  const db = await getDb();

  if (!code) {
    return NextResponse.json({
      success: true,
      totalProfiles: Object.keys(db).length,
    });
  }

  const account = Object.prototype.hasOwnProperty.call(db, code) ? db[code] : undefined;
  if (!account) {
    return NextResponse.json(
      {
        success: false,
        error: `No Care Circle found with passcode "${code}". Please check your code or Register a New Care Profile.`,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, account });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = sanitizePasscode(body.passcode);

    if (!code || code.length < 4) {
      return NextResponse.json(
        { success: false, error: "Passcode must be 4-24 alphanumeric characters." },
        { status: 400 }
      );
    }

    const db = await getDb();

    if (body.action === "REGISTER") {
      if (Object.prototype.hasOwnProperty.call(db, code)) {
        return NextResponse.json(
          { success: false, error: `Passcode "${code}" is already registered.` },
          { status: 409 }
        );
      }

      const rawProfile = body.patientProfile || {};
      const emergencyRaw = sanitizeText(rawProfile.emergencyContact || "+91 98765 43210", 25);

      const newAccount: AccountRecord = {
        passcode: code,
        passcodeHash: hashPasscode(code),
        updatedAt: new Date().toISOString(),
        patientProfile: {
          name: sanitizeText(rawProfile.name || "Senior Patient", 80),
          bloodGroup: sanitizeText(rawProfile.bloodGroup || "O+", 10),
          passcode: code,
          emergencyContact: emergencyRaw.replace(/\s+/g, ""),
          emergencyDisplay: emergencyRaw,
          careEmail: sanitizeText(rawProfile.careEmail || "family@aegiscare.ai", 100),
          vitals: {
            bp: sanitizeText(rawProfile.bp || "120/80 mmHg", 25),
            heartRate: sanitizeText(rawProfile.heartRate || "72 BPM", 25),
            glucose: sanitizeText(rawProfile.glucose || "105 mg/dL", 25),
          },
        },
        medications: Array.isArray(body.medications) ? body.medications.slice(0, 50) : [],
        appointments: Array.isArray(body.appointments) ? body.appointments.slice(0, 50) : [],
      };

      db[code] = newAccount;
      await persistDb(db);
      return NextResponse.json({ success: true, account: newAccount }, { status: 201 });
    }

    if (Object.prototype.hasOwnProperty.call(db, code)) {
      const existing = db[code];
      db[code] = {
        ...existing,
        updatedAt: new Date().toISOString(),
        patientProfile: body.patientProfile ?? existing.patientProfile,
        medications: Array.isArray(body.medications)
          ? body.medications.slice(0, 50)
          : existing.medications,
        appointments: Array.isArray(body.appointments)
          ? body.appointments.slice(0, 50)
          : existing.appointments,
      };
      await persistDb(db);
      return NextResponse.json({ success: true, account: db[code] });
    }

    return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
