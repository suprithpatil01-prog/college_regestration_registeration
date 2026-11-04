# Northstar College Student Registration (Next.js Edition)

A modern, responsive student registration portal converted from PHP to **Next.js 14 (App Router) + React 18 + TypeScript**.

It features full client-side and server-side validation, live dynamic status calculation, real-time dashboard statistics, session-based record persistence, instant table search filtering, and one-click CSV export.

---

## Features

- **App Router Architecture**: Built with Next.js 14 App Router, React 18, and TypeScript.
- **Dual-Layer Validation**:
  - **Instant Client-Side Feedback**: Real-time USN formatting (auto-uppercase), live age classification (Minor vs. Adult), leap-year DOB checks, and field-level hints.
  - **Server-Side API Route**: `/api/records` handles secure server-side validation and record management.
- **Responsive Dashboard UI**: Sidebar navigation, dashboard metric cards, student details form, quick tips, and recent records table.
- **Live Search & Filter**: Real-time filtering of submitted student records by Name, USN, Email, or Course.
- **CSV Export**: Single-click browser download of admission records (`northstar-student-registrations.csv`).
- **Offline / Session Persistence**: Automatic synchronization with session storage so records remain available across browser refreshes.

---

## Validation Rules

- **Full Name**: Allows Unicode letters, spaces, apostrophes, and hyphens. Numbers are rejected.
- **University Seat Number (USN)**: Normalized to uppercase, strictly follows `\d[A-Z]{2}\d{2}[A-Z]{2}\d{3}` (e.g. `2KE24CS164`), with duplicate checking.
- **Email**: Strict format checking requiring valid alphabetic top-level domains (rejects malformed domains like `.co8`).
- **Mobile Number**: 10-digit Indian mobile number starting with 6–9 (accepts and cleans `+91` prefix, spaces, and hyphens).
- **Course**: Whitelist validation against the 8 offered courses.
- **Date of Birth**: DD/MM/YYYY format with calendar validation (checks leap years, rejects dates like 30 or 31 February, rejects future dates).
- **Age**: Integer from 1 to 100 that matches the exact calculated age from the entered Date of Birth.

---

## Getting Started

### 1. Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build

Build and start the production server:

```bash
npm run build
npm start
```

---

## Project Structure

```
├── app/
│   ├── api/
│   │   └── records/
│   │       └── route.ts          # Server API route for validation & records
│   ├── globals.css               # Modern CSS system & responsive layout
│   ├── layout.tsx                # App layout & font configurations
│   └── page.tsx                  # Main admissions portal page
├── components/
│   ├── QuickGuide.tsx            # Field tips & guideline component
│   ├── RecordsTable.tsx          # Live search records table
│   ├── RegistrationForm.tsx      # Registration form with dynamic age status
│   ├── Sidebar.tsx               # Navigation sidebar with dynamic counts
│   ├── StatsGrid.tsx             # Admission summary metric cards
│   ├── SuccessReceipt.tsx        # Registration confirmation receipt
│   └── Topbar.tsx                # Top header bar
├── lib/
│   ├── types.ts                  # TypeScript interfaces & course list
│   └── validation.ts             # Shared validation & date/age calculations
├── college-student-registration/ # Preserved original PHP version
├── package.json                  # Next.js & React dependencies
└── tsconfig.json                 # TypeScript configuration
```
