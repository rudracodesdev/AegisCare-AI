# AegisCare AI — Connected Elderly Care & Medication Management Ecosystem

**Live Deployment:** https://aegis-care-ai.vercel.app/  
**GitHub Repository:** https://github.com/rudracodesdev/AegisCare-AI  
**Demo Care Circle Passcode:** `CARE26`

## 1. Chosen Vertical
**Elderly Care & Medication Management Platform** serving three connected user personas:
- **Elderly Patient (Age 65+):** High-contrast typography, zero-password passcode login, voice read-aloud schedule, and 1-tap SOS emergency dispatch.
- **Family Member:** Real-time adherence monitoring, automatic missed-dose email alerts, and remote UPI QR pharmacy refill checkout.
- **Authorized Caretaker / Nurse:** Time-of-day routine filtering (`Morning`, `Afternoon`, `Evening`, `Night`), geriatric vitals threshold monitoring, and 1-click JSON clinical report exports.

## 2. Approach and Logic
- **Context-Aware Clinical Engine (`lib/care-engine.ts`):** Evaluates blood pressure, heart rate, and fasting blood glucose (`evaluateVitalsSafety`) into `NORMAL`, `ELEVATED`, or `CRITICAL` states, and adapts AI pharmacist recommendations (`analyzeDrugInteractions`) based on active persona role, patient age, missed doses, CYP3A4 drug interactions, and low pill inventory (`<= 5` pills).
- **Proactive Escalation Watchdog (`app/api/reminders/route.ts`):** Automatically dispatches sanitized HTML email alerts via cached Ethereal SMTP whenever a medication is marked `Missed` or `1-Tap SOS` is triggered.

## 3. How the Solution Works
1. **Shared Care Circle Authentication:** Users join or register an elderly patient profile using a shared alphanumeric passcode (`CARE26`) protected by Cloudflare Turnstile and HMAC-SHA256 hashing (`lib/security.ts`).
2. **Medication & Inventory Lifecycle:** Marking a dose `Taken` decrements stock in O(1) time and syncs via `/api/accounts`; low stock unlocks doorstep refill checkout via `/api/payment`.
3. **Accessibility & OWASP Security:** Features WCAG 2.1 AA landmarks, `A / A+ / A++` font scaling, `Voice Mode` Web Speech synthesis, and Edge Middleware (`middleware.ts`) enforcing CSP, HSTS, X-Frame-Options, and sliding-window IP rate limiting (`429`).

## 4. Assumptions Made
- **Passcode Usability:** Senior patients benefit from a shared Care Circle passcode rather than complex passwords during medical emergencies.
- **Keyless Evaluation:** Ethereal SMTP creates live inspectable email inboxes on the fly without requiring private third-party credentials during grading.
- **Serverless Storage:** Uses an in-memory singleton cache backed by OS `/tmp` JSON persistence to stay well within the `< 10 MB` single-branch repository limit.

## 5. Run & Verify
```bash
npm install
npm test
npm run build

