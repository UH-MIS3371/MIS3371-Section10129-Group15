// backend/test-backend.js
// Runs processClockIn() against a named set of test requests (Week 8).
// Run locally with: node backend/test-backend.js
// Each test lists the expected outcome, then compares it to the actual result.

const { processClockIn } = require("./backend.js");

// A valid starting request. Each test copies it and changes only what it needs.
const baseRequest = {
  employeeId: "EMP-10492",
  employmentStatus: "Active",
  scheduledShiftDate: "2026-09-15",
  scheduledShiftStart: "08:00",
  clockInTime: "08:04",
  hasScheduledShift: true,
  hasOpenClockIn: false
};

// Test types: valid, invalid, boundary.
const tests = [
  // VALID cases
  {
    name: "Valid: on time (4 min late)",
    type: "valid",
    request: { ...baseRequest },
    expectedStatus: "Accepted"
  },
  {
    name: "Valid: 10 min early",
    type: "valid",
    request: { ...baseRequest, clockInTime: "07:50" },
    expectedStatus: "Accepted"
  },

  // INVALID cases (Rejected / Flagged)
  {
    name: "Invalid: inactive employee",
    type: "invalid",
    request: { ...baseRequest, employmentStatus: "Inactive" },
    expectedStatus: "Rejected"
  },
  {
    name: "Invalid: open clock-in already exists",
    type: "invalid",
    request: { ...baseRequest, hasOpenClockIn: true },
    expectedStatus: "Flagged"
  },
  {
    name: "Invalid: missing employee ID",
    type: "invalid",
    request: { ...baseRequest, employeeId: "" },
    expectedStatus: "Rejected"
  },
  {
    name: "Invalid: employee ID with special characters",
    type: "invalid",
    request: { ...baseRequest, employeeId: "EMP-10492!" },
    expectedStatus: "Rejected"
  },
  {
    name: "Invalid: employee ID with spaces",
    type: "invalid",
    request: { ...baseRequest, employeeId: "EMP 10492" },
    expectedStatus: "Rejected"
  },
  {
    name: "Invalid: missing scheduled shift",
    type: "invalid",
    request: { ...baseRequest, hasScheduledShift: false },
    expectedStatus: "Rejected"
  },
  {
    name: "Invalid: missing scheduled shift date",
    type: "invalid",
    request: { ...baseRequest, scheduledShiftDate: "" },
    expectedStatus: "Rejected"
  },
  {
    name: "Invalid: invalid scheduled shift date",
    type: "invalid",
    request: { ...baseRequest, scheduledShiftDate: "09-15-2026" },
    expectedStatus: "Rejected"
  },
  {
    name: "Invalid: invalid shift start time",
    type: "invalid",
    request: { ...baseRequest, scheduledShiftStart: "25:00" },
    expectedStatus: "Rejected"
  },
  {
    name: "Invalid: invalid clock-in time",
    type: "invalid",
    request: { ...baseRequest, clockInTime: "8:xx" },
    expectedStatus: "Rejected"
  },

  // BOUNDARY cases (around the 15 minute window)
  {
    name: "Boundary: 14 min late",
    type: "boundary",
    request: { ...baseRequest, clockInTime: "08:14" },
    expectedStatus: "Accepted"
  },
  {
    name: "Boundary: exactly 15 min late",
    type: "boundary",
    request: { ...baseRequest, clockInTime: "08:15" },
    expectedStatus: "Accepted"
  },
  {
    name: "Boundary: 16 min late",
    type: "boundary",
    request: { ...baseRequest, clockInTime: "08:16" },
    expectedStatus: "Flagged"
  },
  {
    name: "Boundary: 14 min early",
    type: "boundary",
    request: { ...baseRequest, clockInTime: "07:46" },
    expectedStatus: "Accepted"
  },
  {
    name: "Boundary: exactly 15 min early",
    type: "boundary",
    request: { ...baseRequest, clockInTime: "07:45" },
    expectedStatus: "Accepted"
  },
  {
    name: "Boundary: 16 min early",
    type: "boundary",
    request: { ...baseRequest, clockInTime: "07:44" },
    expectedStatus: "Flagged"
  }
];

let passed = 0;

for (const test of tests) {
  const result = processClockIn(test.request);
  const didPass = result.clockInStatus === test.expectedStatus;
  if (didPass) passed++;

  console.log("\n--- " + test.name + " [" + test.type + "] ---");
  console.log("Expected status: " + test.expectedStatus);
  console.log("Actual status:   " + result.clockInStatus);
  console.log("Minutes from shift start: " + result.minutesFromShiftStart);
  console.log("Reason: " + (result.statusReason || "(none)"));
  console.log("Result: " + (didPass ? "PASS" : "FAIL"));
}

console.log("\n=== " + passed + " of " + tests.length + " tests passed ===");
