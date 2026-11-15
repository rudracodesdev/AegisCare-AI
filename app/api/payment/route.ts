import { NextResponse } from "next/server";
import crypto from "crypto";
import { sanitizeText } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawAmount = Number(body.amount);
    const itemName = sanitizeText(body.itemName || "Prescription Refill", 120);

    if (!Number.isFinite(rawAmount) || rawAmount <= 0 || rawAmount > 100000) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount. Must be between ₹1 and ₹1,00,000." },
        { status: 400 }
      );
    }

    const orderId = `AEGIS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    return NextResponse.json({
      success: true,
      orderId,
      amount: rawAmount,
      itemName,
      currency: "INR",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Malformed payment request payload." },
      { status: 400 }
    );
  }
}
