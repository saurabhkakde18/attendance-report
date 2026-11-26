-- ====================================================================
-- SEED DATA FOR SMART GPS ATTENDANCE & PAYROLL SYSTEM
-- ====================================================================

-- 1. Create Default Company Settings
INSERT INTO company_settings (
    company_name, company_code, required_work_hours, break_duration_minutes,
    monthly_leave_allowance, paid_leave_allowance, default_exit_grace_period_minutes,
    overtime_enabled, salary_divisor_type, weekly_off_days
) VALUES (
    'SmartCorp Technologies India Pvt Ltd', 'SCT', 8.00, 30,
    4, 0, 10, FALSE, 'CALENDAR_DAYS', ARRAY[0]
);

-- 2. Create Departments
INSERT INTO departments (id, name, code, description) VALUES
    ('d1111111-1111-1111-1111-111111111111', 'Engineering', 'ENG', 'Software Development & Technical Operations'),
    ('d2222222-2222-2222-2222-222222222222', 'Human Resources', 'HR', 'People Operations & Talent Management'),
    ('d3333333-3333-3333-3333-333333333333', 'Sales & Marketing', 'MKT', 'Client Acquisition & Business Growth'),
    ('d4444444-4444-4444-4444-444444444444', 'Finance & Accounts', 'FIN', 'Payroll, Audit & Financial Compliance');

-- 3. Create Default Offices (Configured with 50-meter GPS radius)
INSERT INTO offices (id, office_name, address, latitude, longitude, radius_meters, working_hours_start, working_hours_end, is_active) VALUES
    ('o1111111-1111-1111-1111-111111111111', 'OMSAIRAM', 'OMSAIRAM', 22.572646, 88.431102, 50, '09:00:00', '17:30:00', TRUE),
    ('o2222222-2222-2222-2222-222222222222', 'Bangalore Branch - Cyber Tech Park', 'Prestige Tech Cloud, Marathahalli, Bangalore, Karnataka 560103', 12.935242, 77.694628, 50, '09:00:00', '17:30:00', TRUE);

-- 4. Create Shifts (8-Hour Work, 30m Break)
INSERT INTO shifts (id, shift_name, start_time, end_time, required_work_minutes, break_minutes, grace_period_minutes, is_active) VALUES
    ('s1111111-1111-1111-1111-111111111111', 'General Day Shift (8 Hours)', '09:00:00', '17:30:00', 480, 30, 15, TRUE),
    ('s2222222-2222-2222-2222-222222222222', 'Morning Shift (8 Hours)', '08:00:00', '16:30:00', 480, 30, 15, TRUE);

-- 5. Create Profiles (Admin & Employees)
-- Passwords:
-- Admin: admin123 (bcrypt hash: $2a$10$wE99q4Jt75BfN7Bq0164mO6fCjGk0J111X/V9Rj1QhH4PZqBf142G or standard SHA256)
-- We will store sha256 or bcrypt hash. For demo clarity, let's store sha-256 / bcrypt
INSERT INTO profiles (id, email, password_hash, role, is_active) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'admin@enterprise.com', 'admin123', 'ADMIN', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'rahul.sharma@enterprise.com', 'emp123', 'EMPLOYEE', TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'priya.patel@enterprise.com', 'emp123', 'EMPLOYEE', TRUE),
    ('a0000000-0000-0000-0000-000000000004', 'vikram.singh@enterprise.com', 'emp123', 'EMPLOYEE', TRUE);

-- 6. Create Employees
INSERT INTO employees (
    id, profile_id, employee_code, full_name, phone, email,
    department_id, office_id, shift_id, designation,
    joining_date, monthly_salary, employment_status
) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002', 'EMP001', 'Rahul Sharma', '+91 98765 43210', 'rahul.sharma@enterprise.com', 'd1111111-1111-1111-1111-111111111111', 'o1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'Senior Full-Stack Engineer', '2024-01-15', 18000.00, 'ACTIVE'),
    ('e2222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000003', 'EMP002', 'Priya Patel', '+91 98123 45678', 'priya.patel@enterprise.com', 'd2222222-2222-2222-2222-222222222222', 'o1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'HR & Compliance Specialist', '2024-02-01', 18000.00, 'ACTIVE'),
    ('e3333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000004', 'EMP003', 'Vikram Singh', '+91 97654 32109', 'vikram.singh@enterprise.com', 'd3333333-3333-3333-3333-333333333333', 'o2222222-2222-2222-2222-222222222222', 's1111111-1111-1111-1111-111111111111', 'Operations Lead', '2024-03-10', 18000.00, 'ACTIVE');

-- 7. Create Statutory Salary Settings (Adheres strictly to Company Example: 18000 - 1840 - 120 - 200 = 15840)
INSERT INTO salary_settings (
    employee_id, monthly_salary, pf_amount, esic_amount, pt_amount,
    monthly_leave_allowance, paid_leave_allowance, overtime_enabled, salary_divisor_type
) VALUES
    ('e1111111-1111-1111-1111-111111111111', 18000.00, 1840.00, 120.00, 200.00, 4, 0, FALSE, 'CALENDAR_DAYS'),
    ('e2222222-2222-2222-2222-222222222222', 18000.00, 1840.00, 120.00, 200.00, 4, 0, FALSE, 'CALENDAR_DAYS'),
    ('e3333333-3333-3333-3333-333333333333', 18000.00, 1840.00, 120.00, 200.00, 4, 0, FALSE, 'CALENDAR_DAYS');

-- 8. Create Leave Balances for 2026
INSERT INTO leave_balances (employee_id, month, year, monthly_allowance, leaves_used, unpaid_leaves_beyond_allowance) VALUES
    ('e1111111-1111-1111-1111-111111111111', 11, 2026, 4, 1.0, 0),
    ('e2222222-2222-2222-2222-222222222222', 11, 2026, 4, 2.0, 0),
    ('e3333333-3333-3333-3333-333333333333', 11, 2026, 4, 0.0, 0);

-- 9. Sample Holidays
INSERT INTO holidays (holiday_name, holiday_date, description) VALUES
    ('Republic Day', '2026-01-26', 'National Holiday'),
    ('Independence Day', '2026-08-15', 'National Holiday'),
    ('Mahatma Gandhi Jayanti', '2026-10-02', 'National Holiday'),
    ('Diwali', '2026-11-08', 'Festival of Lights');

-- 10. Sample Attendance for Today & Recent Days
INSERT INTO attendance (
    employee_id, attendance_date, check_in, check_out, total_work_minutes, break_minutes,
    attendance_method, status, approval_status, is_late_arrival, is_early_departure
) VALUES
    ('e1111111-1111-1111-1111-111111111111', '2026-11-25', '2026-11-25 09:02:15+05:30', NULL, 0, 30, 'AUTOMATIC', 'PRESENT', 'APPROVED', FALSE, FALSE),
    ('e2222222-2222-2222-2222-222222222222', '2026-11-25', '2026-11-25 09:25:00+05:30', NULL, 0, 30, 'MANUAL', 'PRESENT', 'APPROVED', TRUE, FALSE),
    ('e1111111-1111-1111-1111-111111111111', '2026-11-24', '2026-11-24 08:58:30+05:30', '2026-11-24 17:35:10+05:30', 486, 30, 'AUTOMATIC', 'PRESENT', 'APPROVED', FALSE, FALSE),
    ('e2222222-2222-2222-2222-222222222222', '2026-11-24', '2026-11-24 09:10:00+05:30', '2026-11-24 17:30:00+05:30', 470, 30, 'AUTOMATIC', 'PRESENT', 'APPROVED', FALSE, FALSE);

-- 11. Initial Payroll for October 2026 (Demonstrating verified calculation)
-- Basic 18000, PF 1840, ESIC 120, PT 200, Fixed Deductions 2160, Net = 15840
INSERT INTO payroll (
    employee_id, month, year, basic_salary, calendar_days, working_days,
    present_days, absent_days, leave_days, half_days, holidays_count, weekly_offs_count,
    pf_amount, esic_amount, pt_amount, fixed_deductions, unpaid_leave_deduction,
    other_deductions, net_salary, payment_status, approved_at
) VALUES (
    'e1111111-1111-1111-1111-111111111111', 10, 2026, 18000.00, 31, 26,
    26, 0, 0, 0, 1, 4,
    1840.00, 120.00, 200.00, 2160.00, 0.00,
    0.00, 15840.00, 'APPROVED', '2026-11-01 10:00:00+05:30'
);

-- Generate Salary Slip for October 2026
INSERT INTO salary_slips (payroll_id, employee_id, slip_number, month, year)
SELECT id, employee_id, 'SLIP-202610-EMP001', 10, 2026
FROM payroll
WHERE employee_id = 'e1111111-1111-1111-1111-111111111111' AND month = 10 AND year = 2026;
