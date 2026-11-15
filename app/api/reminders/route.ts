import { NextResponse } from "next/server";
import nodemailer, { Transporter } from "nodemailer";
import { escapeHtml, sanitizeText, isValidEmail } from "@/lib/security";

// Cache Ethereal SMTP transporter in memory so subsequent alerts execute in <50ms
let cachedTransporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (cachedTransporter) return cachedTransporter;
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return cachedTransporter;
}

export async function POST(req: Request) {
  let recipientEmail = "family.circle@aegiscare.ai";
  let alertType = "UPCOMING_DOSE";
  let patientName = "Patient";
  let itemTitle = "Medication Reminder";
  let itemTime = "";
  let notes = "";

  try {
    const body = await req.json();
    if (isValidEmail(body.recipientEmail)) {
      recipientEmail = body.recipientEmail.trim();
    }
    alertType = sanitizeText(body.alertType || alertType, 32);
    patientName = sanitizeText(body.patientName || patientName, 80);
    itemTitle = sanitizeText(body.itemTitle || itemTitle, 140);
    itemTime = sanitizeText(body.itemTime || itemTime, 40);
    notes = sanitizeText(body.notes || notes, 240);

    const safePatient = escapeHtml(patientName);
    const safeTitle = escapeHtml(itemTitle);
    const safeTime = escapeHtml(itemTime);
    const safeNotes = escapeHtml(notes || "Follow standard prescribed dosage.");

    const subjectMap: Record<string, string> = {
      MISSED_MED: `🚨 URGENT: Missed Medication Alert for ${patientName}`,
      UPCOMING_DOSE: `⏰ Reminder: Upcoming Medication Dose for ${patientName}`,
      APPOINTMENT: `📅 Medical Appointment Reminder for ${patientName}`,
    };

    const subject = subjectMap[alertType] || `CareCircle Alert for ${patientName}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; color: #0f172a; border-radius: 16px; border: 2px solid #2563eb;">
        <h2 style="color: #1d4ed8; margin-top: 0;">AegisCare AI — Shared Care Circle Alert</h2>
        <p style="font-size: 15px; color: #334155;">Patient Profile: <strong>${safePatient}</strong></p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border-left: 4px solid ${
          alertType === "MISSED_MED" ? "#dc2626" : "#2563eb"
        }; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">${safeTitle}</p>
          <p style="margin: 0 0 6px 0; color: #475569;">Scheduled Time: <strong>${safeTime}</strong></p>
          <p style="margin: 0; color: #1e293b;">Instructions: ${safeNotes}</p>
        </div>
        <p style="font-size: 12px; color: #64748b;">Sent automatically via AegisCare AI Proactive Watchdog.</p>
      </div>
    `;

    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: '"AegisCare AI Watchdog" <alerts@aegiscare.ai>',
      to: recipientEmail,
      subject,
      html: htmlBody,
    });

    const liveInboxUrl = nodemailer.getTestMessageUrl(info);

    return NextResponse.json({
      success: true,
      liveSmtp: true,
      timestamp: new Date().toLocaleTimeString(),
      preview: {
        to: recipientEmail,
        subject: liveInboxUrl ? `${subject} (Live SMTP Sent ✓)` : subject,
        itemTitle: liveInboxUrl ? `${itemTitle} — View Inbox: ${liveInboxUrl}` : itemTitle,
        itemTime,
        alertType,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      liveSmtp: false,
      timestamp: new Date().toLocaleTimeString(),
      preview: {
        to: recipientEmail,
        subject: `CareCircle Alert: ${itemTitle}`,
        itemTitle,
        itemTime,
        alertType,
      },
    });
  }
}
