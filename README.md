# 🏥 AegisCare AI

**Care. Connect. Protect.** — An accessible, elderly-first healthcare, medication adherence, and connected family care ecosystem built for real-world deployment.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?style=flat-square&logo=framer)

---

## 🌟 Overview

Managing daily prescriptions, doctor visits, and emergency readiness for senior citizens often breaks down due to complex interfaces and disconnected communication between patients, family members, and caretakers. 

**AegisCare AI** solves this with a shared **Care Circle Ecosystem**. A single shared passcode connects an elderly patient with their family and nurses in real time—combining high-contrast clinical accessibility, voice-guided medication schedules, proactive email escalation, AI clinical safety checks, and a 1-Tap SOS GPS dispatch system.

---

## ✨ Key Features

### 1. Elderly-First Accessibility & Dual-Theme UI
* **Clinical Light Mode & High-Contrast Dark Mode:** Instant theme switching designed for aging eyes with clear typography, high-contrast status badges, and zero visual clutter.
* **Voice Mode (`ON / OFF` Toggle):** Built-in Web Speech synthesis reads pending medications, dosages, and dietary instructions aloud with a single tap—and halts immediately when toggled off.
* **3-Stage Scroll-Zoom Portal:** Interactive Framer Motion hero transition that zooms directly into the patient's live health hub.

### 2. Multi-User Care Circle & Authentication
* **Shared Passcode Ecosystem:** Family members, caretakers, and patients collaborate on a unified profile using a simple Care Circle Passcode (default demo code: `CARE26`).
* **Full Account Registration & Persistence:** Create new elderly patient profiles with custom passcodes, blood group, baseline vitals, and emergency contacts—persisted automatically via the `/api/accounts` backend store.
* **Cloudflare Turnstile Protection:** Bot-resistant verification integrated into login and account registration workflows.

### 3. Medication Adherence & Appointment Management
* **Interactive Dose Tracking:** Mark doses as **Taken** or **Missed** to dynamically recalculate daily adherence percentages and decrement pill inventory.
* **Full Schedule CRUD:** Add, edit, or remove medications and doctor appointments with instant Care Circle synchronization.

### 4. Proactive Email Watchdog (Zero-Config SMTP)
* **Automated Escalations:** Marking a medication as **Missed**, scheduling a new appointment, or triggering SOS automatically dispatches a formatted HTML alert email to family caretakers.
* **Live Inbox Inspection:** Powered by Nodemailer & Ethereal Cloud SMTP—generates a clickable webmail URL right inside the dashboard log to inspect delivered emails live.

### 5. 1-Tap SOS Emergency Call & Live GPS Dispatch
* **Multi-Channel Emergency Response:** Synthesizes an outgoing phone ringback tone, locks onto the device's live GPS coordinates (`navigator.geolocation`), dispatches an urgent email packet, and provides direct **Phone Dialer (`tel:`)
