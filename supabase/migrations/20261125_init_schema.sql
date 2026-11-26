-- ====================================================================
-- SMART GPS ATTENDANCE & PAYROLL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Compatible with PostgreSQL 15+ / Supabase PostgreSQL
-- Timezone: Asia/Kolkata (IST)
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set default timezone for session
SET timezone = 'Asia/Kolkata';

-- Clean up existing tables if any (for fresh migration)
DROP TABLE IF EXISTS attendance_corrections CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS salary_slips CASCADE;
DROP TABLE IF EXISTS payroll CASCADE;
DROP TABLE IF EXISTS salary_settings CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS attendance_events CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS offices CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- --------------------------------------------------------------------
-- 1. PROFILES (Authentication & Role-Based Access)
-- --------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE', 'HR_MANAGER')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 2. COMPANY SETTINGS (Leave, Work Hours & Payroll Policies)
-- --------------------------------------------------------------------
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'Enterprise Solutions Ltd',
    company_code VARCHAR(50) NOT NULL DEFAULT 'ESL',
    logo_url TEXT,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    required_work_hours NUMERIC(4, 2) DEFAULT 8.00, -- 8 Hours default
    break_duration_minutes INT DEFAULT 30,
    monthly_leave_allowance INT DEFAULT 4, -- 4 Days Leave Allowance
    paid_leave_allowance INT DEFAULT 0, -- 0 Paid Leaves (All leaves unpaid)
    default_exit_grace_period_minutes INT DEFAULT 10, -- 10 mins grace period
    overtime_enabled BOOLEAN DEFAULT FALSE, -- Overtime strictly disabled
    salary_divisor_type VARCHAR(50) DEFAULT 'CALENDAR_DAYS' CHECK (salary_divisor_type IN ('CALENDAR_DAYS', 'WORKING_DAYS', 'FIXED_30')),
    weekly_off_days INT[] DEFAULT ARRAY[0], -- 0 = Sunday
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 3. DEPARTMENTS
-- --------------------------------------------------------------------
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 4. OFFICES (Geofence Configuration)
-- --------------------------------------------------------------------
CREATE TABLE offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INT DEFAULT 50 CHECK (radius_meters >= 10), -- 50m default
    working_hours_start TIME DEFAULT '09:00:00',
    working_hours_end TIME DEFAULT '17:30:00',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 5. SHIFTS
-- --------------------------------------------------------------------
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '17:30:00',
    required_work_minutes INT NOT NULL DEFAULT 480, -- 8 hours = 480 mins
    break_minutes INT NOT NULL DEFAULT 30,
    grace_period_minutes INT NOT NULL DEFAULT 15,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 6. EMPLOYEES
-- --------------------------------------------------------------------
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    office_id UUID REFERENCES offices(id) ON DELETE SET NULL,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    designation VARCHAR(150) NOT NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    monthly_salary NUMERIC(12, 2) NOT NULL DEFAULT 18000.00,
    employment_status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED')),
    fcm_token TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 7. SALARY SETTINGS (Employee-specific Statutory Deductions & Config)
-- --------------------------------------------------------------------
CREATE TABLE salary_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    monthly_salary NUMERIC(12, 2) NOT NULL DEFAULT 18000.00,
    pf_amount NUMERIC(10, 2) NOT NULL DEFAULT 1840.00, -- Default PF
    esic_amount NUMERIC(10, 2) NOT NULL DEFAULT 120.00, -- Default ESIC
    pt_amount NUMERIC(10, 2) NOT NULL DEFAULT 200.00, -- Default Professional Tax
    monthly_leave_allowance INT DEFAULT 4,
    paid_leave_allowance INT DEFAULT 0,
    overtime_enabled BOOLEAN DEFAULT FALSE,
    salary_divisor_type VARCHAR(50) DEFAULT 'CALENDAR_DAYS' CHECK (salary_divisor_type IN ('CALENDAR_DAYS', 'WORKING_DAYS', 'FIXED_30')),
    effective_from DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 8. ATTENDANCE (Daily Summary Record)
-- --------------------------------------------------------------------
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    total_work_minutes INT DEFAULT 0,
    break_minutes INT DEFAULT 30,
    attendance_method VARCHAR(50) NOT NULL CHECK (attendance_method IN ('AUTOMATIC', 'MANUAL', 'ADMIN_ADJUSTED')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'WEEKLY_OFF', 'HOLIDAY', 'ON_LEAVE')),
    approval_status VARCHAR(50) DEFAULT 'APPROVED' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    is_late_arrival BOOLEAN DEFAULT FALSE,
    is_early_departure BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    CONSTRAINT unique_employee_daily_attendance UNIQUE (employee_id, attendance_date)
);

-- --------------------------------------------------------------------
-- 9. ATTENDANCE EVENTS (Raw Geofence & Check-In/Out Events)
-- --------------------------------------------------------------------
CREATE TABLE attendance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_id UUID REFERENCES attendance(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('GEOFENCE_ENTER', 'GEOFENCE_EXIT', 'MANUAL_CHECK_IN', 'MANUAL_CHECK_OUT', 'AUTO_CHECK_IN', 'AUTO_CHECK_OUT')),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy_meters DOUBLE PRECISION,
    distance_to_office_meters DOUBLE PRECISION,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    source VARCHAR(50) NOT NULL CHECK (source IN ('ANDROID_GEOFENCE', 'ANDROID_MANUAL', 'WEB_PORTAL', 'ADMIN_OVERRIDE')),
    verification_status VARCHAR(50) NOT NULL CHECK (verification_status IN ('VERIFIED', 'OUTSIDE_RADIUS', 'ACCURACY_POOR', 'FLAGGED')),
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 10. LEAVE REQUESTS
-- --------------------------------------------------------------------
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4, 1) NOT NULL CHECK (total_days > 0),
    leave_type VARCHAR(50) DEFAULT 'UNPAID_STANDARD' CHECK (leave_type IN ('UNPAID_STANDARD', 'CASUAL', 'SICK', 'EMERGENCY')),
    reason TEXT NOT NULL,
    approval_status VARCHAR(50) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    admin_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 11. LEAVE BALANCES (Monthly Allowance Tracking)
-- --------------------------------------------------------------------
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2024),
    monthly_allowance INT DEFAULT 4, -- 4 Days Leave Allowance
    leaves_used NUMERIC(4, 1) DEFAULT 0,
    unpaid_leaves_beyond_allowance NUMERIC(4, 1) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    CONSTRAINT unique_employee_monthly_leave_balance UNIQUE (employee_id, month, year)
);

-- --------------------------------------------------------------------
-- 12. HOLIDAYS
-- --------------------------------------------------------------------
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holiday_name VARCHAR(150) NOT NULL,
    holiday_date DATE UNIQUE NOT NULL,
    is_optional BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 13. PAYROLL
-- --------------------------------------------------------------------
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2024),
    basic_salary NUMERIC(12, 2) NOT NULL,
    calendar_days INT NOT NULL,
    working_days INT NOT NULL,
    present_days NUMERIC(4, 1) NOT NULL DEFAULT 0,
    absent_days NUMERIC(4, 1) NOT NULL DEFAULT 0,
    leave_days NUMERIC(4, 1) NOT NULL DEFAULT 0,
    half_days NUMERIC(4, 1) NOT NULL DEFAULT 0,
    holidays_count INT NOT NULL DEFAULT 0,
    weekly_offs_count INT NOT NULL DEFAULT 0,
    pf_amount NUMERIC(10, 2) NOT NULL DEFAULT 1840.00,
    esic_amount NUMERIC(10, 2) NOT NULL DEFAULT 120.00,
    pt_amount NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
    fixed_deductions NUMERIC(10, 2) NOT NULL DEFAULT 2160.00, -- 1840 + 120 + 200
    unpaid_leave_deduction NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    other_deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'DRAFT' CHECK (payment_status IN ('DRAFT', 'APPROVED', 'PAID', 'LOCKED')),
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    CONSTRAINT unique_employee_monthly_payroll UNIQUE (employee_id, month, year)
);

-- --------------------------------------------------------------------
-- 14. SALARY SLIPS
-- --------------------------------------------------------------------
CREATE TABLE salary_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_id UUID UNIQUE NOT NULL REFERENCES payroll(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    slip_number VARCHAR(100) UNIQUE NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    pdf_url TEXT,
    generated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 15. NOTIFICATIONS
-- --------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 16. AUDIT LOGS
-- --------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- --------------------------------------------------------------------
-- 17. ATTENDANCE CORRECTIONS
-- --------------------------------------------------------------------
CREATE TABLE attendance_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID REFERENCES attendance(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    correction_date DATE NOT NULL,
    proposed_check_in TIMESTAMPTZ,
    proposed_check_out TIMESTAMPTZ,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    review_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, attendance_date);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_events_employee ON attendance_events(employee_id, event_timestamp);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(approval_status);
CREATE INDEX idx_payroll_employee_month_year ON payroll(employee_id, month, year);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);

-- ====================================================================
-- BUSINESS LOGIC FUNCTIONS & PROCEDURES
-- ====================================================================

-- 1. Haversine Distance Calculation (Calculates distance between 2 GPS coordinates in meters)
CREATE OR REPLACE FUNCTION calculate_distance_meters(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 6371000; -- Earth radius in meters
    phi1 DOUBLE PRECISION;
    phi2 DOUBLE PRECISION;
    delta_phi DOUBLE PRECISION;
    delta_lambda DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN 9999999;
    END IF;

    phi1 := radians(lat1);
    phi2 := radians(lat2);
    delta_phi := radians(lat2 - lat1);
    delta_lambda := radians(lon2 - lon1);

    a := sin(delta_phi / 2) * sin(delta_phi / 2) +
         cos(phi1) * cos(phi2) *
         sin(delta_lambda / 2) * sin(delta_lambda / 2);
    c := 2 * atan2(sqrt(a), sqrt(1 - a));

    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Working Hours & Status Calculator (Strictly NO overtime, 8-Hour benchmark)
CREATE OR REPLACE FUNCTION calculate_daily_attendance_metrics(
    p_check_in TIMESTAMPTZ,
    p_check_out TIMESTAMPTZ,
    p_break_minutes INT DEFAULT 30
) RETURNS TABLE (
    total_minutes INT,
    work_status VARCHAR(50),
    is_late BOOLEAN,
    is_early BOOLEAN
) AS $$
DECLARE
    v_total_elapsed INT := 0;
    v_actual_work INT := 0;
    v_status VARCHAR(50) := 'PRESENT';
    v_late BOOLEAN := FALSE;
    v_early BOOLEAN := FALSE;
    v_checkin_time TIME;
    v_checkout_time TIME;
BEGIN
    IF p_check_in IS NOT NULL AND p_check_out IS NOT NULL THEN
        v_total_elapsed := EXTRACT(EPOCH FROM (p_check_out - p_check_in)) / 60;
        v_actual_work := GREATEST(0, v_total_elapsed - COALESCE(p_break_minutes, 30));
        
        -- Half-day threshold: Less than 240 minutes (4 hours) of work
        IF v_actual_work < 240 THEN
            v_status := 'HALF_DAY';
        ELSE
            v_status := 'PRESENT';
        END IF;

        v_checkin_time := (p_check_in AT TIME ZONE 'Asia/Kolkata')::TIME;
        v_checkout_time := (p_check_out AT TIME ZONE 'Asia/Kolkata')::TIME;

        -- Shift starts at 09:00 AM (grace 15 mins -> 09:15)
        IF v_checkin_time > '09:15:00'::TIME THEN
            v_late := TRUE;
        END IF;

        -- Shift ends at 17:30 (grace 15 mins early -> before 17:15)
        IF v_checkout_time < '17:15:00'::TIME THEN
            v_early := TRUE;
        END IF;
    ELSIF p_check_in IS NOT NULL THEN
        -- Checked in but not yet checked out
        v_status := 'PRESENT';
        v_checkin_time := (p_check_in AT TIME ZONE 'Asia/Kolkata')::TIME;
        IF v_checkin_time > '09:15:00'::TIME THEN
            v_late := TRUE;
        END IF;
    ELSE
        v_status := 'ABSENT';
    END IF;

    RETURN QUERY SELECT v_actual_work, v_status, v_late, v_early;
END;
$$ LANGUAGE plpgsql;

-- 3. Automatic Check-In Handler with Idempotency & Geofence Verification
CREATE OR REPLACE FUNCTION process_geofence_checkin(
    p_employee_id UUID,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_accuracy DOUBLE PRECISION,
    p_source VARCHAR(50) DEFAULT 'ANDROID_GEOFENCE'
) RETURNS JSONB AS $$
DECLARE
    v_office_record RECORD;
    v_distance DOUBLE PRECISION;
    v_allowed_radius INT;
    v_today DATE := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;
    v_now TIMESTAMPTZ := (NOW() AT TIME ZONE 'Asia/Kolkata');
    v_existing_attendance RECORD;
    v_attendance_id UUID;
    v_is_late BOOLEAN := FALSE;
    v_checkin_time TIME := (v_now)::TIME;
BEGIN
    -- 1. Fetch assigned office coordinates
    SELECT o.* INTO v_office_record
    FROM employees e
    JOIN offices o ON e.office_id = o.id
    WHERE e.id = p_employee_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Employee office configuration not found');
    END IF;

    v_allowed_radius := COALESCE(v_office_record.radius_meters, 50);

    -- 2. Validate distance from office
    v_distance := calculate_distance_meters(p_lat, p_lng, v_office_record.latitude, v_office_record.longitude);

    IF v_distance > (v_allowed_radius + COALESCE(p_accuracy, 10)) THEN
        -- Outside 50m radius (with accuracy buffer)
        INSERT INTO attendance_events (
            employee_id, event_type, latitude, longitude, accuracy_meters,
            distance_to_office_meters, event_timestamp, source, verification_status
        ) VALUES (
            p_employee_id, 'GEOFENCE_ENTER', p_lat, p_lng, p_accuracy,
            v_distance, v_now, p_source, 'OUTSIDE_RADIUS'
        );

        RETURN jsonb_build_object('success', false, 'message', 'Outside office geofence boundary', 'distance_meters', v_distance);
    END IF;

    -- 3. Check if attendance already exists today
    SELECT * INTO v_existing_attendance
    FROM attendance
    WHERE employee_id = p_employee_id AND attendance_date = v_today;

    IF FOUND AND v_existing_attendance.check_in IS NOT NULL THEN
        -- Session already open or completed today
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Check-in already recorded today',
            'attendance_id', v_existing_attendance.id,
            'check_in', v_existing_attendance.check_in
        );
    END IF;

    -- 4. Check late arrival (> 09:15 AM)
    IF v_checkin_time > '09:15:00'::TIME THEN
        v_is_late := TRUE;
    END IF;

    -- 5. Record Check-In
    IF FOUND THEN
        UPDATE attendance
        SET check_in = v_now,
            attendance_method = 'AUTOMATIC',
            status = 'PRESENT',
            is_late_arrival = v_is_late,
            updated_at = v_now
        WHERE id = v_existing_attendance.id
        RETURNING id INTO v_attendance_id;
    ELSE
        INSERT INTO attendance (
            employee_id, attendance_date, check_in, attendance_method, status, is_late_arrival
        ) VALUES (
            p_employee_id, v_today, v_now, 'AUTOMATIC', 'PRESENT', v_is_late
        ) RETURNING id INTO v_attendance_id;
    END IF;

    -- 6. Log Verified Attendance Event
    INSERT INTO attendance_events (
        employee_id, attendance_id, event_type, latitude, longitude, accuracy_meters,
        distance_to_office_meters, event_timestamp, source, verification_status
    ) VALUES (
        p_employee_id, v_attendance_id, 'AUTO_CHECK_IN', p_lat, p_lng, p_accuracy,
        v_distance, v_now, p_source, 'VERIFIED'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Automatic check-in successful',
        'attendance_id', v_attendance_id,
        'check_in', v_now,
        'distance_meters', v_distance
    );
END;
$$ LANGUAGE plpgsql;

-- 4. Automatic Check-Out Handler with Grace Period Support
CREATE OR REPLACE FUNCTION process_geofence_checkout(
    p_employee_id UUID,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_accuracy DOUBLE PRECISION,
    p_source VARCHAR(50) DEFAULT 'ANDROID_GEOFENCE'
) RETURNS JSONB AS $$
DECLARE
    v_today DATE := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;
    v_now TIMESTAMPTZ := (NOW() AT TIME ZONE 'Asia/Kolkata');
    v_existing RECORD;
    v_metrics RECORD;
    v_distance DOUBLE PRECISION := 0;
    v_office_record RECORD;
BEGIN
    SELECT * INTO v_existing
    FROM attendance
    WHERE employee_id = p_employee_id AND attendance_date = v_today;

    IF NOT FOUND OR v_existing.check_in IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'No active check-in session found today to check out');
    END IF;

    SELECT o.* INTO v_office_record
    FROM employees e
    JOIN offices o ON e.office_id = o.id
    WHERE e.id = p_employee_id;

    IF FOUND THEN
        v_distance := calculate_distance_meters(p_lat, p_lng, v_office_record.latitude, v_office_record.longitude);
    END IF;

    -- Calculate metrics
    SELECT * INTO v_metrics FROM calculate_daily_attendance_metrics(v_existing.check_in, v_now, v_existing.break_minutes);

    -- Update attendance
    UPDATE attendance
    SET check_out = v_now,
        total_work_minutes = v_metrics.total_minutes,
        status = v_metrics.work_status,
        is_early_departure = v_metrics.is_early,
        updated_at = v_now
    WHERE id = v_existing.id;

    -- Log event
    INSERT INTO attendance_events (
        employee_id, attendance_id, event_type, latitude, longitude, accuracy_meters,
        distance_to_office_meters, event_timestamp, source, verification_status
    ) VALUES (
        p_employee_id, v_existing.id, 'AUTO_CHECK_OUT', p_lat, p_lng, p_accuracy,
        v_distance, v_now, p_source, 'VERIFIED'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Checkout completed successfully',
        'attendance_id', v_existing.id,
        'check_out', v_now,
        'total_work_minutes', v_metrics.total_minutes,
        'status', v_metrics.work_status
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Exact Salary & Payroll Calculator (Adheres to Company Policy)
-- Base Example:
-- Basic: ₹18,000, PF: ₹1,840, ESIC: ₹120, PT: ₹200 -> Total Fixed Deductions: ₹2,160
-- Net base = ₹15,840. Overtime = DISABLED. Paid Leave = ZERO. Monthly leave allowance = 4.
CREATE OR REPLACE FUNCTION calculate_monthly_payroll(
    p_employee_id UUID,
    p_month INT,
    p_year INT
) RETURNS JSONB AS $$
DECLARE
    v_employee RECORD;
    v_settings RECORD;
    v_start_date DATE;
    v_end_date DATE;
    v_calendar_days INT;
    v_working_days INT := 0;
    v_present_days NUMERIC(4,1) := 0;
    v_absent_days NUMERIC(4,1) := 0;
    v_leave_days NUMERIC(4,1) := 0;
    v_half_days NUMERIC(4,1) := 0;
    v_holidays_count INT := 0;
    v_weekly_offs_count INT := 0;
    v_basic_salary NUMERIC(12,2) := 18000.00;
    v_pf NUMERIC(10,2) := 1840.00;
    v_esic NUMERIC(10,2) := 120.00;
    v_pt NUMERIC(10,2) := 200.00;
    v_fixed_deductions NUMERIC(10,2) := 2160.00;
    v_per_day_rate NUMERIC(12,2) := 0;
    v_unpaid_leave_deduction NUMERIC(12,2) := 0.00;
    v_net_salary NUMERIC(12,2) := 15840.00;
    v_divisor INT;
    v_payroll_id UUID;
    v_cur_date DATE;
    v_day_of_week INT;
    v_att_record RECORD;
BEGIN
    -- 1. Fetch employee details
    SELECT * INTO v_employee FROM employees WHERE id = p_employee_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Employee not found');
    END IF;

    -- 2. Fetch specific salary settings or fall back to company defaults
    SELECT * INTO v_settings FROM salary_settings WHERE employee_id = p_employee_id;
    IF FOUND THEN
        v_basic_salary := COALESCE(v_settings.monthly_salary, 18000.00);
        v_pf := COALESCE(v_settings.pf_amount, 1840.00);
        v_esic := COALESCE(v_settings.esic_amount, 120.00);
        v_pt := COALESCE(v_settings.pt_amount, 200.00);
    ELSE
        v_basic_salary := COALESCE(v_employee.monthly_salary, 18000.00);
    END IF;

    v_fixed_deductions := v_pf + v_esic + v_pt;

    -- 3. Calculate date range for the specified month
    v_start_date := MAKE_DATE(p_year, p_month, 1);
    v_end_date := (v_start_date + INTERVAL '1 MONTH - 1 DAY')::DATE;
    v_calendar_days := EXTRACT(DAY FROM v_end_date);

    -- 4. Calculate day breakdown by iterating each date
    v_cur_date := v_start_date;
    WHILE v_cur_date <= v_end_date LOOP
        v_day_of_week := EXTRACT(DOW FROM v_cur_date); -- 0 = Sunday

        -- Check if holiday
        IF EXISTS (SELECT 1 FROM holidays WHERE holiday_date = v_cur_date) THEN
            v_holidays_count := v_holidays_count + 1;
        -- Check if weekly off (Sunday default)
        ELSIF v_day_of_week = 0 THEN
            v_weekly_offs_count := v_weekly_offs_count + 1;
        ELSE
            v_working_days := v_working_days + 1;

            -- Fetch attendance record for this day
            SELECT * INTO v_att_record FROM attendance 
            WHERE employee_id = p_employee_id AND attendance_date = v_cur_date;

            IF FOUND THEN
                IF v_att_record.status = 'PRESENT' THEN
                    v_present_days := v_present_days + 1;
                ELSIF v_att_record.status = 'HALF_DAY' THEN
                    v_half_days := v_half_days + 1;
                    v_present_days := v_present_days + 0.5;
                ELSIF v_att_record.status = 'ON_LEAVE' THEN
                    v_leave_days := v_leave_days + 1;
                ELSIF v_att_record.status = 'ABSENT' THEN
                    v_absent_days := v_absent_days + 1;
                END IF;
            ELSE
                -- If past date with no record and employee joined before, treat as absent
                IF v_cur_date <= CURRENT_DATE AND v_cur_date >= v_employee.joining_date THEN
                    v_absent_days := v_absent_days + 1;
                END IF;
            END IF;
        END IF;

        v_cur_date := v_cur_date + 1;
    END LOOP;

    -- 5. Calculate Per-day salary divisor (Calendar days default, e.g. 30 or 31)
    IF v_settings.salary_divisor_type = 'WORKING_DAYS' AND v_working_days > 0 THEN
        v_divisor := v_working_days;
    ELSE
        v_divisor := v_calendar_days;
    END IF;

    v_per_day_rate := ROUND(v_basic_salary / v_divisor, 2);

    -- All leaves are UNPAID per company policy.
    -- Monthly leave allowance = 4 days. Leave beyond allowance or unapproved absences are deducted.
    -- Deduction = (unapproved absent days + leave days beyond allowance) * per_day_rate
    -- Half days count as 0.5 absent
    DECLARE
        v_chargeable_unpaid_days NUMERIC(4,1) := 0;
        v_monthly_allowance INT := COALESCE(v_settings.monthly_leave_allowance, 4);
    BEGIN
        -- Leaves taken beyond the 4-day allowance
        IF v_leave_days > v_monthly_allowance THEN
            v_chargeable_unpaid_days := v_chargeable_unpaid_days + (v_leave_days - v_monthly_allowance);
        END IF;

        -- Plus unapproved absences
        v_chargeable_unpaid_days := v_chargeable_unpaid_days + v_absent_days + (v_half_days * 0.5);

        v_unpaid_leave_deduction := ROUND(v_chargeable_unpaid_days * v_per_day_rate, 2);
    END;

    -- Final net salary calculation: Basic - Fixed Deductions (PF+ESIC+PT) - Unpaid Leave Deductions
    v_net_salary := GREATEST(0.00, v_basic_salary - v_fixed_deductions - v_unpaid_leave_deduction);

    -- 6. Upsert into payroll table
    INSERT INTO payroll (
        employee_id, month, year, basic_salary, calendar_days, working_days,
        present_days, absent_days, leave_days, half_days, holidays_count, weekly_offs_count,
        pf_amount, esic_amount, pt_amount, fixed_deductions, unpaid_leave_deduction,
        other_deductions, net_salary, payment_status
    ) VALUES (
        p_employee_id, p_month, p_year, v_basic_salary, v_calendar_days, v_working_days,
        v_present_days, v_absent_days, v_leave_days, v_half_days, v_holidays_count, v_weekly_offs_count,
        v_pf, v_esic, v_pt, v_fixed_deductions, v_unpaid_leave_deduction,
        0.00, v_net_salary, 'DRAFT'
    )
    ON CONFLICT (employee_id, month, year) DO UPDATE SET
        basic_salary = EXCLUDED.basic_salary,
        calendar_days = EXCLUDED.calendar_days,
        working_days = EXCLUDED.working_days,
        present_days = EXCLUDED.present_days,
        absent_days = EXCLUDED.absent_days,
        leave_days = EXCLUDED.leave_days,
        half_days = EXCLUDED.half_days,
        holidays_count = EXCLUDED.holidays_count,
        weekly_offs_count = EXCLUDED.weekly_offs_count,
        pf_amount = EXCLUDED.pf_amount,
        esic_amount = EXCLUDED.esic_amount,
        pt_amount = EXCLUDED.pt_amount,
        fixed_deductions = EXCLUDED.fixed_deductions,
        unpaid_leave_deduction = EXCLUDED.unpaid_leave_deduction,
        net_salary = EXCLUDED.net_salary,
        updated_at = (NOW() AT TIME ZONE 'Asia/Kolkata')
    RETURNING id INTO v_payroll_id;

    -- Update or create leave balance
    INSERT INTO leave_balances (
        employee_id, month, year, monthly_allowance, leaves_used, unpaid_leaves_beyond_allowance
    ) VALUES (
        p_employee_id, p_month, p_year, 4, v_leave_days, GREATEST(0, v_leave_days - 4)
    )
    ON CONFLICT (employee_id, month, year) DO UPDATE SET
        leaves_used = EXCLUDED.leaves_used,
        unpaid_leaves_beyond_allowance = EXCLUDED.unpaid_leaves_beyond_allowance,
        updated_at = (NOW() AT TIME ZONE 'Asia/Kolkata');

    RETURN jsonb_build_object(
        'success', true,
        'payroll_id', v_payroll_id,
        'employee_id', p_employee_id,
        'month', p_month,
        'year', p_year,
        'basic_salary', v_basic_salary,
        'pf', v_pf,
        'esic', v_esic,
        'pt', v_pt,
        'fixed_deductions', v_fixed_deductions,
        'unpaid_leave_deduction', v_unpaid_leave_deduction,
        'net_salary', v_net_salary,
        'present_days', v_present_days,
        'absent_days', v_absent_days,
        'leave_days', v_leave_days
    );
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is ADMIN
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('ADMIN', 'HR_MANAGER') AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Admin can view all; Users can view their own
CREATE POLICY profiles_admin_all ON profiles FOR ALL USING (is_admin());
CREATE POLICY profiles_user_read ON profiles FOR SELECT USING (id = auth.uid());

-- Employees: Admin can perform all operations; Employees can read only their own record
CREATE POLICY employees_admin_all ON employees FOR ALL USING (is_admin());
CREATE POLICY employees_self_read ON employees FOR SELECT USING (profile_id = auth.uid());

-- Attendance: Admin can view/modify all; Employees can view their own & insert check-ins
CREATE POLICY attendance_admin_all ON attendance FOR ALL USING (is_admin());
CREATE POLICY attendance_self_read ON attendance FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);
CREATE POLICY attendance_self_insert ON attendance FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);
CREATE POLICY attendance_self_update ON attendance FOR UPDATE USING (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);

-- Attendance Events: Admin can view all; Employees can view/insert their own events
CREATE POLICY events_admin_all ON attendance_events FOR ALL USING (is_admin());
CREATE POLICY events_self_all ON attendance_events FOR ALL USING (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);

-- Payroll: Strictly confidential. Admin all; Employee read only own
CREATE POLICY payroll_admin_all ON payroll FOR ALL USING (is_admin());
CREATE POLICY payroll_self_read ON payroll FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);

-- Salary Settings: Admin only
CREATE POLICY salary_settings_admin ON salary_settings FOR ALL USING (is_admin());
CREATE POLICY salary_settings_self_read ON salary_settings FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);

-- Salary Slips: Admin all; Employee read only own
CREATE POLICY slips_admin_all ON salary_slips FOR ALL USING (is_admin());
CREATE POLICY slips_self_read ON salary_slips FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);

-- Leave Requests: Admin all; Employee can insert and read own
CREATE POLICY leaves_admin_all ON leave_requests FOR ALL USING (is_admin());
CREATE POLICY leaves_self_read ON leave_requests FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);
CREATE POLICY leaves_self_insert ON leave_requests FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE profile_id = auth.uid())
);

-- Audit Logs: Admin read only
CREATE POLICY audit_logs_admin_read ON audit_logs FOR SELECT USING (is_admin());
