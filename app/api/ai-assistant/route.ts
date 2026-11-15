import { NextResponse } from "next/server";
import { analyzeDrugInteractions, Medication } from "@/lib/care-engine";
import { sanitizeText } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const medications: Medication[] = Array.isArray(body.medications)
      ? body.medications.slice(0, 30)
      : [];
    const question = sanitizeText(body.question || "", 200);

    const reply = analyzeDrugInteractions(medications, question);
    return NextResponse.json({ success: true, reply });
  } catch {
    return NextResponse.json(
      {
        success: false,
        reply: "• **Safety Notice:** Unable to parse medication list. Please consult your prescribing physician.",
      },
      { status: 400 }
    );
  }
}
