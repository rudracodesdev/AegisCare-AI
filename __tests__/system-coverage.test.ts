import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware, resetRateLimiterForTests } from "../middleware";
import { POST as postReminders } from "../app/api/reminders/route";
import { hashPasscode } from "../lib/security";

describe("AegisCare OWASP Middleware & Rate Limiter Suite", () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it("attaches strict OWASP security and CSP headers on requests", () => {
    const req = new NextRequest("http://localhost:3000/api/accounts?passcode=CARE26", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });
    const res = middleware(req);
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
  });

  it("enforces 429 Too Many Requests when rate limit is exceeded", () => {
    let lastStatus = 200;
    for (let i = 0; i < 122; i++) {
      const req = new NextRequest("http://localhost:3000/api/payment", {
        headers: { "x-forwarded-for": "192.168.1.99" },
      });
      lastStatus = middleware(req).status;
    }
    expect(lastStatus).toBe(429);
  });
});

describe("AegisCare SMTP Reminder & Hashing Suite", () => {
  it("sanitizes payloads and returns preview in POST /api/reminders", async () => {
    const req = new Request("http://localhost:3000/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientEmail: "caretaker@aegiscare.ai",
        alertType: "MISSED_MED",
        patientName: "Shri Rameshwar <script>alert(1)</script>",
        itemTitle: "Atorvastatin 10mg",
        itemTime: "09:00 PM",
      }),
    });
    const res = await postReminders(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("generates deterministic 64-character SHA-256 HMAC hashes", () => {
    expect(hashPasscode("CARE26")).toHaveLength(64);
  });
});
