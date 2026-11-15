import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "care-accounts-db.json");

const DEFAULT_DB: Record<string, unknown> = {
  CARE26: {
    passcode: "CARE26",
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

async function readDb() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
    return DEFAULT_DB;
  }
}

async function writeDb(data: Record<string, unknown>) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// GET ACCOUNT BY PASSCODE
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("passcode") || "").toUpperCase().trim();
  const db = await readDb();

  if (!code) {
    return NextResponse.json({
      success: true,
      accounts: Object.keys(db),
    });
  }

  const account = db[code];
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

// CREATE NEW ACCOUNT OR UPDATE EXISTING ACCOUNT DATA
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, passcode, patientProfile, medications, appointments } = body;
    const code = (passcode || "").toUpperCase().trim();

    if (!code || code.length < 4) {
      return NextResponse.json(
        { success: false, error: "Passcode must be at least 4 characters." },
        { status: 400 }
      );
    }

    const db = await readDb();

    if (action === "REGISTER") {
      if (db[code]) {
        return NextResponse.json(
          {
            success: false,
            error: `Passcode "${code}" is already taken. Please choose another passcode.`,
          },
          { status: 400 }
        );
      }

      const newAccount = {
        passcode: code,
        patientProfile: {
          name: patientProfile.name,
          bloodGroup: patientProfile.bloodGroup || "O+",
          passcode: code,
          emergencyContact: (patientProfile.emergencyContact || "+919876543210").replace(/\s+/g, ""),
          emergencyDisplay: patientProfile.emergencyContact || "+91 98765 43210",
          careEmail: patientProfile.careEmail || "family@aegiscare.ai",
          vitals: {
            bp: patientProfile.bp || "120/80 mmHg",
            heartRate: patientProfile.heartRate || "72 BPM",
            glucose: patientProfile.glucose || "105 mg/dL",
          },
        },
        medications: medications || [],
        appointments: appointments || [],
      };

      db[code] = newAccount;
      await writeDb(db);
      return NextResponse.json({ success: true, account: newAccount });
    }

    // SYNC / UPDATE EXISTING ACCOUNT
    if (db[code]) {
      db[code] = {
        ...db[code],
        patientProfile: patientProfile || db[code].patientProfile,
        medications: medications ?? db[code].medications,
        appointments: appointments ?? db[code].appointments,
      };
      await writeDb(db);
      return NextResponse.json({ success: true, account: db[code] });
    }

    return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}