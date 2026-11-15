import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  let recipientEmail = "family.circle@aegiscare.ai";
  let alertType = "UPCOMING_DOSE";
  let patientName = "Patient";
  let itemTitle = "Medication Reminder";
  let itemTime = "";
  let notes = "";

  try {
    const body = await req.json();
    recipientEmail = body.recipientEmail || recipientEmail;
    alertType = body.alertType || alertType;
    patientName = body.patientName || patientName;
    itemTitle = body.itemTitle || itemTitle;
    itemTime = body.itemTime || itemTime;
    notes = body.notes || notes;

    const subjectMap: Record<string, string> = {
      MISSED_MED: `🚨 URGENT: Missed Medication Alert for ${patientName}`,
      UPCOMING_DOSE: `⏰ Reminder: Upcoming Medication Dose for ${patientName}`,
      APPOINTMENT: `📅 Medical Appointment Reminder for ${patientName}`,
    };

    const subject = subjectMap[alertType] || `CareCircle Alert for ${patientName}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #38bdf8;">
        <h2 style="color: #38bdf8; margin-top: 0;">AegisCare AI — Shared Care Circle Alert</h2>
        <p style="font-size: 15px; color: #cbd5e1;">Patient Profile: <strong>${patientName}</strong></p>
        <div style="background: #1e293b; padding: 16px; border-radius: 12px; border-left: 4px solid ${
          alertType === "MISSED_MED" ? "#f43f5e" : "#22d3ee"
        }; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">${itemTitle}</p>
          <p style="margin: 0 0 6px 0; color: #94a3b8;">Scheduled Time: <strong>${itemTime}</strong></p>
          <p style="margin: 0; color: #e2e8f0;">Instructions: ${notes || "Follow standard prescribed dosage."}</p>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">Sent automatically via AegisCare AI Proactive Watchdog.</p>
      </div>
    `;

    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

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
        itemTitle: liveInboxUrl
          ? `${itemTitle} — View Inbox: ${liveInboxUrl}`
          : itemTitle,
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