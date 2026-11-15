import crypto from "crypto";

/**
 * Escapes unsafe characters to prevent XSS and HTML injection in emails and DOM output.
 */
export function escapeHtml(unsafe: unknown): string {
  if (typeof unsafe !== "string") return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes user input strings by trimming, stripping control chars, and enforcing length bounds.
 */
export function sanitizeText(input: unknown, maxLength = 200): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and normalizes a Care Circle passcode (alphanumeric only, prevents prototype pollution).
 */
export function sanitizePasscode(code: unknown): string {
  if (typeof code !== "string") return "";
  const cleaned = code.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
  const forbidden = ["__PROTO__", "CONSTRUCTOR", "PROTOTYPE"];
  if (forbidden.includes(cleaned)) return "";
  return cleaned;
}

/**
 * Hashes passcodes using SHA-256 with an application salt for secure verification audit logs.
 */
export function hashPasscode(passcode: string): string {
  const salt = process.env.CARE_CIRCLE_SALT || "aegiscare-clinical-v1-salt";
  return crypto.createHmac("sha256", salt).update(passcode).digest("hex");
}

/**
 * Validates email format safely without catastrophic backtracking regex.
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string" || email.length > 120) return false;
  const parts = email.split("@");
  return parts.length === 2 && parts[0].length > 0 && parts[1].includes(".");
}
