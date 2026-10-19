// HALLE Clock-In System - Milestone 2 client-side JavaScript
const CLOCK_IN_WINDOW_MINUTES = 15;

// Employee IDs may contain letters, numbers, and hyphens only.
function isEmployeeIdValid(id) {
  return /^[A-Za-z0-9-]+$/.test(String(id).trim());
}

// Negative minutes = early; positive minutes = late.
function isWithinClockInWindow(minutesFromShiftStart) {
  return Number.isInteger(minutesFromShiftStart) &&
    Math.abs(minutesFromShiftStart) <= CLOCK_IN_WINDOW_MINUTES;
}

// Rule 3: Demonstrates when a clock-in should be Rejected.
// Actual employment and schedule checks happen in the backend.
function isClockInRejected(employmentStatus, hasScheduledShift) {
  return employmentStatus !== "Active" || hasScheduledShift === false;
}

// This rule is demonstrated with the Week 6 test input, not a real schedule.
function evaluateClockInTime(minutesFromShiftStart) {
  if (!Number.isInteger(minutesFromShiftStart)) {
    return "Invalid input: Enter a whole number of minutes and try again.";
  }

  if (!isWithinClockInWindow(minutesFromShiftStart)) {
    const direction = minutesFromShiftStart < 0 ? "early" : "late";

    return "Flagged: Clock-in more than 15 minutes " + direction +
      ". Please speak to your manager.";
  }

  return "Accepted: Clock-in is within the 15-minute window.";
}

// ==========================================
// Boundary Testing
// ==========================================

const timingTests = [
  { minutes: -16, expected: "Flagged" },
  { minutes: -15, expected: "Accepted" },
  { minutes: -14, expected: "Accepted" },
  { minutes: 14, expected: "Accepted" },
  { minutes: 15, expected: "Accepted" },
  { minutes: 16, expected: "Flagged" }
];

for (const test of timingTests) {
  const actual = evaluateClockInTime(test.minutes).split(":")[0];

  console.log("Timing test " + test.minutes + " minutes: " +
    (actual === test.expected ? "PASS" : "FAIL") +
    " (expected " + test.expected + ", actual " + actual + ")");
}

// ==========================================
// Rejected Business Rule Tests
// ==========================================

const rejectionTests = [
  {
    name: "Inactive employee",
    employmentStatus: "Inactive",
    hasScheduledShift: true,
    expected: "Rejected"
  },
  {
    name: "Employee without scheduled shift",
    employmentStatus: "Active",
    hasScheduledShift: false,
    expected: "Rejected"
  }
];

for (const test of rejectionTests) {
  const actual = isClockInRejected(
    test.employmentStatus,
    test.hasScheduledShift
  ) ? "Rejected" : "Not Rejected";

  console.log(test.name + ": " +
    (actual === test.expected ? "PASS" : "FAIL") +
    " (expected " + test.expected + ", actual " + actual + ")");
}

// ==========================================
// Page Behavior
// ==========================================

// The HTML loads this script with defer.
const form = document.querySelector("#clockInForm");
const employeeId = document.querySelector("#employeeId");
const clockInTimestamp = document.querySelector("#clockInTimestamp");
const clockInStatus = document.querySelector("#clockInStatus");
const minutesInput = document.querySelector("#minutesFromShiftStart");
const punctualityMessage = document.querySelector("#punctualityMessage");

/* Displays status messages with appropriate styling */
function showStatus(message) {
  if (!clockInStatus) return;

 clockInStatus.textContent = message;

  clockInStatus.classList.remove(
    "status-success",
    "status-flagged",
    "status-rejected"
  );

  clockInStatus.classList.add("status-message");

  if (message.startsWith("Accepted:")) {
    clockInStatus.classList.add("status-success");
  } else if (message.startsWith("Flagged:")) {
    clockInStatus.classList.add("status-flagged");
  } else if (
    message.startsWith("Rejected:") ||
    message.startsWith("Invalid input:")
  ) {
    clockInStatus.classList.add("status-rejected");
  }

  clockInStatus.hidden = false;
}

// Formats the system date and time.
function formatLocalDateTime(date) {
  const pad = (value) => String(value).padStart(2, "0");

  return date.getFullYear() + "-" +
    pad(date.getMonth() + 1) + "-" +
    pad(date.getDate()) + "T" +
    pad(date.getHours()) + ":" +
    pad(date.getMinutes()) + ":" +
    pad(date.getSeconds());
}

// ==========================================
// Employee ID Live Validation
// ==========================================

if (employeeId) {
  employeeId.addEventListener("input", () => {
    const id = employeeId.value.trim();

      // Clear the previous timestamp if the employee ID changes.
  if (clockInTimestamp) {
    clockInTimestamp.value = "";
  }

    if (!id) {
      showStatus("Employee ID is required. Enter your badge number.");
    } else if (!isEmployeeIdValid(id)) {
      showStatus("Invalid input: Use only letters, numbers, and hyphens in your Employee ID.");
    } else if (clockInStatus) {
      clockInStatus.hidden = true;
      clockInStatus.textContent = "";
    }
  });
}

// ==========================================
// Punctuality Check (Test Input)
// ==========================================

if (minutesInput && punctualityMessage) {

  function updatePunctualityFeedback() {
    const raw = minutesInput.value.trim();

    if (raw === "") {
      punctualityMessage.textContent = "";
      punctualityMessage.className = "";
      return;
    }
    
const message = evaluateClockInTime(Number(raw));
    
punctualityMessage.textContent = message;

punctualityMessage.classList.remove(
  "status-success",
  "status-flagged",
  "status-rejected"
);

punctualityMessage.classList.add("status-message");

if (message.startsWith("Accepted:")) {
  punctualityMessage.classList.add("status-success");
} else if (message.startsWith("Flagged:")) {
  punctualityMessage.classList.add("status-flagged");
} else {
  punctualityMessage.classList.add("status-rejected");
}
    
  }

  minutesInput.addEventListener("input", updatePunctualityFeedback);
  minutesInput.addEventListener("change", updatePunctualityFeedback);
}

// ==========================================
// Clock-In Form Submission
// ==========================================

if (form && employeeId && clockInTimestamp) {

  // Allows JavaScript to show validation messages.
  form.noValidate = true;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const id = employeeId.value.trim();

    // Reject invalid employee ID input.
    if (!isEmployeeIdValid(id)) {
      clockInTimestamp.value = "";

      showStatus(id === ""
        ? "Invalid input: Employee ID is required. Enter your badge number and try again."
        : "Invalid input: Employee ID may contain only letters, numbers, and hyphens. Correct it and try again.");

      return;
    }

    // Generate clock-in timestamp from the system clock.
    clockInTimestamp.value = formatLocalDateTime(new Date());

    showStatus("Submitted: Clock-in request for " + id + " at " +
      clockInTimestamp.value.replace("T", " ") +
      ". Employment and schedule checks are pending; this is a client-side demonstration only.");
  });

  // ==========================================
  // Reset Form
  // ==========================================

  form.addEventListener("reset", () => {
    if (clockInStatus) {
      clockInStatus.hidden = true;
      clockInStatus.textContent = "";
    }
  });
}
