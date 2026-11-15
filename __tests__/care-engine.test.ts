import { describe, it, expect } from "vitest";
import {
  calculateAdherenceSummary,
  evaluateVitalsSafety,
  analyzeDrugInteractions,
  Medication,
} from "../lib/care-engine";
import {
  escapeHtml,
  sanitizeText,
  sanitizePasscode,
  isValidEmail,
} from "../lib/security";

describe("AegisCare Clinical Engine & Adherence Suite", () => {
  const sampleMeds: Medication[] = [
    {
      id: "1",
      name: "Amlodipine",
      dosage: "5 mg",
      time: "08:00 AM",
      period: "Morning",
      instructions: "After breakfast",
      status: "Taken",
      pillsLeft: 18,
    },
    {
      id: "2",
      name: "Metformin XR",
      dosage: "500 mg",
      time: "01:30 PM",
      period: "Afternoon",
      instructions: "After lunch",
      status: "Pending",
      pillsLeft: 4,
    },
    {
      id: "3",
      name: "Atorvastatin",
      dosage: "10 mg",
      time: "09:00 PM",
      period: "Night",
      instructions: "Before sleep",
      status: "Missed",
      pillsLeft: 12,
    },
  ];

  it("calculates daily medication adherence and low-stock counts accurately", () => {
    const summary = calculateAdherenceSummary(sampleMeds);
    expect(summary.totalMeds).toBe(3);
    expect(summary.takenMeds).toBe(1);
    expect(summary.missedMeds).toBe(1);
    expect(summary.pendingMeds).toBe(1);
    expect(summary.lowStockCount).toBe(1);
    expect(summary.adherenceRate).toBe(33);
  });

  it("returns 100% adherence when schedule is empty", () => {
    const summary = calculateAdherenceSummary([]);
    expect(summary.adherenceRate).toBe(100);
  });

  it("detects normal, elevated, and critical geriatric vitals accurately", () => {
    expect(
      evaluateVitalsSafety({ bp: "120/80 mmHg", heartRate: "72 BPM", glucose: "105 mg/dL" }).status
    ).toBe("NORMAL");
    expect(
      evaluateVitalsSafety({ bp: "142/88 mmHg", heartRate: "78 BPM", glucose: "115 mg/dL" }).status
    ).toBe("ELEVATED");
    expect(
      evaluateVitalsSafety({ bp: "175/105 mmHg", heartRate: "120 BPM", glucose: "240 mg/dL" }).status
    ).toBe("CRITICAL");
  });

  it("identifies CYP3A4 grapefruit interaction and low-stock alerts", () => {
    const report = analyzeDrugInteractions(sampleMeds, "Missed dose rule");
    expect(report).toContain("Food & Enzyme Warning");
    expect(report).toContain("Low Inventory Alert");
    expect(report).toContain("Metformin XR");
  });
});

describe("AegisCare Security & Input Sanitization Suite", () => {
  it("escapes XSS payloads in HTML strings", () => {
    const malicious = '<script>alert("xss")</script>';
    expect(escapeHtml(malicious)).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
  });

  it("blocks prototype pollution vectors in passcodes", () => {
    expect(sanitizePasscode("__proto__")).toBe("");
    expect(sanitizePasscode("constructor")).toBe("");
    expect(sanitizePasscode("care-26!")).toBe("CARE-26");
  });

  it("validates email addresses and strips control characters", () => {
    expect(isValidEmail("family.circle@aegiscare.ai")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
    expect(sanitizeText("  Telmisartan\u0000 40mg  ")).toBe("Telmisartan 40mg");
  });
});
