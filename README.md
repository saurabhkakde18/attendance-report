# Attendance Report - Smart GPS Attendance & Statutory Payroll Management System

A production-ready, cloud-based Employee Attendance and Payroll Management System featuring GPS-based automatic geofencing, real-time manual check-in/out, color-coded monthly attendance calendar, statutory salary calculations, official PDF salary slips, and full mobile APK support.

---

## 🌟 Key System Capabilities

1. **Android Employee Application (`android-app/`)**:
   - Built with **Kotlin** and **Jetpack Compose**.
   - **Android Geofencing API** with 50-meter office perimeter detection at **OMSAIRAM**.
   - 10-minute exit grace period before automatic session closure.
   - **Fused Location Provider** & background location monitoring.
   - Offline-resilient **Room Database** with auto-sync via `WorkManager`.
   - Boot receiver to re-register geofences upon device restart.

2. **Web-Based Admin Dashboard (`admin-dashboard/`)**:
   - Built with **Next.js 14**, **React**, **TypeScript**, and **Tailwind CSS**.
   - Executive dashboard with live presence indicators and 10 real-time summary cards.
   - **Interactive Monthly Attendance Calendar**:
     - 6 status color codes: Present (Green), Absent (Red), Half Day (Yellow), Weekly Off (Blue), Holiday (Purple), Leave (Orange).
     - Day inspection modal with in/out timestamps, hours, and 50m GPS verification logs.
     - Month navigation & 1-click Excel/CSV export.
   - **Employee & Office Management**:
     - Dynamic office configuration with live device GPS auto-calibration.
     - Employee directory with custom deduction parameters.
   - **Authentication & Security**:
     - Role-based separation (Admin & Employee).
     - Forgot Password recovery & in-app Change Password for both Admin and Employee.
   - **Cloud Storage & Supabase**:
     - Storage buckets: `salary-slips` & `company-assets`.
     - In-dashboard connection test & auto-bucket creation.

3. **Statutory Salary & Payroll Engine**:
   - **Benchmark Example**:
     - Monthly Basic Salary: **₹18,000**
     - PF Deduction: **₹1,840** (12% ceiling cap)
     - ESIC Deduction: **₹120** (Applicable under ₹21,000 ceiling)
     - PT (Professional Tax): **₹200**
     - Total Fixed Deductions: **₹2,160**
     - **Base Net Salary: ₹15,840**
   - **Overtime**: Permanently disabled (0.00 extra compensation).
   - **Leave Policy**: 4 days monthly leave allowance (All leaves are unpaid).
   - Dynamic auto-calculation as salary is entered.
   - Instant PDF salary slip generation & Supabase cloud sync.

4. **Mobile APK Distribution**:
   - Standalone Android APK: `AttendanceReport.apk`.
   - 1-click in-browser download at `/AttendanceReport.apk`.
   - Progressive Web App (PWA) with installable WebAPK prompt on mobile Chrome/Edge.

---

## 📂 Repository Structure

```
ATTENDANCE/
├── AttendanceReport.apk                # Standalone Android APK for mobile installation
├── admin-dashboard/                    # Next.js 14 Web Dashboard
│   ├── public/                         # Public assets, manifest.json, APK download
│   ├── src/
│   │   ├── app/                        # App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/                 # UI components (Calendar, Dashboard, Geofence, etc.)
│   │   ├── lib/                        # Store, Supabase client, PDF & Excel generators
│   │   └── types/                      # TypeScript domain models
│   ├── tests/                          # Automated statutory verification tests (13/13 passing)
│   └── package.json
├── android-app/                        # Native Android Kotlin Jetpack Compose project
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/smartcorp/attendance/
│   │   │   ├── geofence/               # GeofenceManager, BroadcastReceiver, TransitionService
│   │   │   ├── data/                   # Room DB, AttendanceDao, Retrofit API
│   │   │   └── ui/screens/             # Jetpack Compose screens (Home, Attendance, Salary, etc.)
│   │   └── res/values/strings.xml      # App name: "Attendance Report"
│   └── build.gradle.kts
├── supabase/                           # PostgreSQL Backend & Database Migrations
│   ├── migrations/
│   │   ├── 20261125_init_schema.sql    # 17 tables, RLS policies, Haversine function
│   │   └── 20261126_storage_buckets.sql# salary-slips & company-assets storage buckets
│   └── seed.sql                        # Seed data (OMSAIRAM office)
├── scripts/                            # Build utilities (generate_apk.py)
└── .gitignore
```

---

## 🚀 Quick Start Guide

### 1. Web Dashboard
```bash
cd admin-dashboard
npm install
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Default Admin Login**: `admin@enterprise.com` / `admin123`
- **Default Employee Login**: `EMP001` / `emp123`
- **Download Mobile APK**: Navigate to `http://localhost:3000/AttendanceReport.apk` or click the download button in the dashboard.

### 2. Run System Verification Tests
```bash
node admin-dashboard/tests/verify-system.js
```
Runs 13 automated tests verifying statutory deductions, net salary math, 8-hour shift compliance, zero overtime, and 50m GPS geofencing accuracy.

---

## 📄 License
Proprietary Enterprise Software - Attendance Report System.
