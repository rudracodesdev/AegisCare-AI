import { describe, it, expect } from "vitest";
import { GET as getAccounts, POST as postAccounts } from "../app/api/accounts/route";
import { POST as postPayment } from "../app/api/payment/route";
import { POST as postAiAssistant } from "../app/api/ai-assistant/route";
import { POST as postVerifyTurnstile } from "../app/api/verify-turnstile/route";

describe("AegisCare Next.js API Route Integration Suite", () => {
  it("GET /api/accounts returns default CARE26 elderly patient profile", async () => {
    const req = new Request("http://localhost:3000/api/accounts?passcode=CARE26");
    const res = await getAccounts(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.account.passcode).toBe("CARE26");
  });

  it("GET /api/accounts returns 404 for unknown passcode", async () => {
    const req = new Request("http://localhost:3000/api/accounts?passcode=UNKNOWN99");
    const res = await getAccounts(req);
    expect(res.status).toBe(404);
  });

  it("POST /api/accounts registers a new elderly patient profile cleanly", async () => {
    const uniqueCode = `TEST${Math.floor(1000 + Math.random() * 8999)}`;
    const req = new Request("http://localhost:3000/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "REGISTER",
        passcode: uniqueCode,
        patientProfile: {
          name: "Smt. Saraswati Devi (Age 70)",
          bloodGroup: "A+",
          emergencyContact: "+919876543210",
          careEmail: "caretaker@aegiscare.ai",
        },
      }),
    });
    const res = await postAccounts(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.account.passcode).toBe(uniqueCode);
  });

  it("POST /api/payment validates amount bounds and generates order ID", async () => {
    const validReq = new Request("http://localhost:3000/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 249, itemName: "30-Day Refill" }),
    });
    const validRes = await postPayment(validReq);
    const validData = await validRes.json();
    expect(validRes.status).toBe(200);
    expect(validData.orderId).toMatch(/^AEGIS-/);

    const invalidReq = new Request("http://localhost:3000/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: -50, itemName: "Invalid" }),
    });
    const invalidRes = await postPayment(invalidReq);
    expect(invalidRes.status).toBe(400);
  });

  it("POST /api/ai-assistant returns clinical drug interaction guidance", async () => {
    const req = new Request("http://localhost:3000/api/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medications: [
          {
            id: "1",
            name: "Atorvastatin",
            dosage: "10mg",
            time: "09:00 PM",
            period: "Night",
            instructions: "Bedtime",
            status: "Pending",
            pillsLeft: 3,
          },
        ],
        question: "What if I miss a dose?",
      }),
    });
    const res = await postAiAssistant(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.reply).toContain("Low Inventory Alert");
  });

  it("POST /api/verify-turnstile enforces token and passcode length", async () => {
    const req = new Request("http://localhost:3000/api/verify-turnstile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "valid-token",
        passcode: "CARE26",
        role: "Caretaker",
        memberName: "Rudra",
      }),
    });
    const res = await postVerifyTurnstile(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.passcodeHash).toHaveLength(64);
  });
});
