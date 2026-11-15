import { NextResponse } from "next/server";
import { sanitizePasscode, sanitizeText, hashPasscode } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = sanitizeText(body.token || "", 512);
    const passcode = sanitizePasscode(body.passcode || "");
    const role = sanitizeText(body.role || "Family Member", 40);
    const memberName = sanitizeText(body.memberName || "Caretaker", 80);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing Turnstile verification token." },
        { status: 400 }
      );
    }

    if (!passcode || passcode.length < 4) {
      return NextResponse.json(
        { success: false, error: "Passcode must be at least 4 alphanumeric characters." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verifiedRole: role,
      memberName,
      passcodeHash: hashPasscode(passcode),
      verifiedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Verification request failed." },
      { status: 400 }
    );
  }
}
