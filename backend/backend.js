// backend/backend.js
// Trusted clock-in processing logic (Week 8).
// This file receives a plain JavaScript object. It does NOT use the DOM,
// an API, or a database, so nothing here is saved.

// Business rule value kept in one named constant (no "magic numbers").
const CLOCK_IN_WINDOW_MINUTES = 15;

// Converts a 24-hour time string like "08:04" into minutes after midnight.
// Returns NaN if the text is not a valid time.
function timeToMinutes(timeString) {
  const parts = String(timeString || "").split(":");
  if (parts.length !== 2) return NaN;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return NaN;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

// Builds the structured result that the rest of the system can read.
// Only Accepted counts as success. Flagged and Rejected need follow up.
function buildResult(clockInStatus, statusReason, message, minutesFromShiftStart) {
  return {
    success: clockInStatus === "Accepted",
    clockInStatus: clockInStatus,
    statusReason: statusReason,
    message: message,
    minutesFromShiftStart: minutesFromShiftStart,
    // Trusted values created by the system (generated, but NOT stored yet).
    requestId: "REQ-" + Date.now(),
    clockInTimestamp: new Date().toISOString()
  };
}

// Main function: one transaction object in, one result object out.
// Order of the logic: validate first, then apply the business rules.
function processClockIn(request) {
  const employeeId = String(request.employeeId || "").trim();
  const shiftStart = timeToMinutes(request.scheduledShiftStart);
  const clockIn = timeToMinutes(request.clockInTime);

  // Rule 1 (validation): required data must be present and usable.
  if (!employeeId) {
    return buildResult("Rejected", "Employee ID is required", "Employee ID is required.", null);
  }
  if (Number.isNaN(shiftStart) || Number.isNaN(clockIn)) {
    return buildResult("Rejected", "Shift start or clock-in time is invalid", "Enter valid times.", null);
  }

  // Calculated by the backend, not trusted from the browser.
  // Negative = early, positive = late.
  const minutesFromShiftStart = clockIn - shiftStart;

  // Rule 2: employee must be Active, otherwise Rejected.
  if (String(request.employmentStatus).toLowerCase() !== "active") {
    return buildResult("Rejected", "Employee is not active", "Only active employees can clock in.", minutesFromShiftStart);
  }

  // Rule 3: an open clock-in would create a duplicate, so Rejected.
  if (request.hasOpenClockIn === true) {
    return buildResult("Rejected", "Employee already has an open clock-in", "You already have an open clock-in.", minutesFromShiftStart);
  }

  // Rule 4: more than 15 minutes early or late is Flagged for manager review.
  // Exactly 15 minutes is allowed because the rule says "more than".
  if (Math.abs(minutesFromShiftStart) > CLOCK_IN_WINDOW_MINUTES) {
    const direction = minutesFromShiftStart < 0 ? "early" : "late";
    return buildResult("Flagged", "Clock-in more than 15 minutes " + direction, "Please speak to your manager.", minutesFromShiftStart);
  }

  // All rules passed.
  return buildResult("Accepted", "", "Clock-in accepted.", minutesFromShiftStart);
}

// Lets test-backend.js use this function.
module.exports = { processClockIn };