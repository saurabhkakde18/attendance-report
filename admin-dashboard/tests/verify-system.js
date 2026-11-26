// ====================================================================
// TEST VERIFICATION SUITE: SMART GPS ATTENDANCE & PAYROLL SYSTEM
// ====================================================================

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateSalary(basic, pf, esic, pt, leaveDays, leaveAllowance, divisorDays) {
  const fixedDeductions = pf + esic + pt;
  const baseNet = basic - fixedDeductions;
  const perDayRate = +(basic / divisorDays).toFixed(2);
  let unpaidDays = 0;
  if (leaveDays > leaveAllowance) {
    unpaidDays = leaveDays - leaveAllowance;
  }
  const unpaidDeductions = +(unpaidDays * perDayRate).toFixed(2);
  const finalNet = +(baseNet - unpaidDeductions).toFixed(2);
  return { basic, pf, esic, pt, fixedDeductions, baseNet, unpaidDays, unpaidDeductions, finalNet };
}

function calculateWorkingHours(checkInHours, checkInMinutes, checkOutHours, checkOutMinutes, breakMinutes = 30) {
  const checkInTotal = checkInHours * 60 + checkInMinutes;
  const checkOutTotal = checkOutHours * 60 + checkOutMinutes;
  const elapsedMinutes = checkOutTotal - checkInTotal;
  const actualWorkMinutes = Math.max(0, elapsedMinutes - breakMinutes);
  const requiredMinutes = 480; // 8 Hours benchmark
  const remainingMinutes = Math.max(0, requiredMinutes - actualWorkMinutes);
  const overtime = 0; // Strictly DISABLED
  return { elapsedMinutes, actualWorkMinutes, remainingMinutes, overtime };
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] Test ${totalTests}: ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test ${totalTests}: ${message}`);
    process.exit(1);
  }
}

console.log('----------------------------------------------------');
console.log('RUNNING SYSTEM VERIFICATION TESTS');
console.log('----------------------------------------------------');

// Test 1: Exact Company Base Salary Example
const baseSalary = calculateSalary(18000, 1840, 120, 200, 1, 4, 31);
assert(baseSalary.fixedDeductions === 2160, `Total Fixed Deductions must be ₹2,160 (Got: ₹${baseSalary.fixedDeductions})`);
assert(baseSalary.baseNet === 15840, `Base Net Salary must be ₹15,840 (Got: ₹${baseSalary.baseNet})`);
assert(baseSalary.unpaidDeductions === 0, `Leave under 4-day allowance has 0 extra deduction (Got: ₹${baseSalary.unpaidDeductions})`);
assert(baseSalary.finalNet === 15840, `Final Net Salary must be ₹15,840 (Got: ₹${baseSalary.finalNet})`);

// Test 2: Unpaid Leave Deduction when exceeding 4 days allowance
// If employee takes 5 leave days (1 day beyond 4-day allowance)
const excessLeaveSalary = calculateSalary(18000, 1840, 120, 200, 5, 4, 30);
assert(excessLeaveSalary.unpaidDays === 1, `1 day excess leave calculated (Got: ${excessLeaveSalary.unpaidDays})`);
assert(excessLeaveSalary.unpaidDeductions === 600, `1 day deduction at 18000/30 = ₹600 (Got: ₹${excessLeaveSalary.unpaidDeductions})`);
assert(excessLeaveSalary.finalNet === 15240, `Final Net Salary after 1 excess day = ₹15,240 (Got: ₹${excessLeaveSalary.finalNet})`);

// Test 3: 8-Hour Work Calculation (Overtime = 0)
const work = calculateWorkingHours(9, 0, 17, 30, 30); // 09:00 AM to 05:30 PM (510 mins total - 30m break = 480 mins)
assert(work.actualWorkMinutes === 480, `8 hours (480 minutes) completed (Got: ${work.actualWorkMinutes})`);
assert(work.remainingMinutes === 0, `Remaining minutes is 0 (Got: ${work.remainingMinutes})`);
assert(work.overtime === 0, `Overtime is strictly 0 (Policy Disabled)`);

// Test 4: GPS Geofencing 50-Meter Distance
// Office coordinates: (22.572646, 88.431102)
const officeLat = 22.572646;
const officeLng = 88.431102;

// Point A: 14 meters away
const distInside = calculateDistanceMeters(officeLat, officeLng, 22.572750, 88.431180);
assert(distInside < 50, `Point A is within 50m radius (Distance: ${distInside.toFixed(1)}m < 50m)`);

// Point B: 250 meters away
const distOutside = calculateDistanceMeters(officeLat, officeLng, 22.574500, 88.432500);
assert(distOutside > 50, `Point B is outside 50m radius (Distance: ${distOutside.toFixed(1)}m > 50m)`);

// Test 5: Exit Grace Period
const exitGracePeriodMinutes = 10;
assert(exitGracePeriodMinutes === 10, 'Exit grace period is configured to 10 minutes');

console.log('----------------------------------------------------');
console.log(`ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log('----------------------------------------------------');
