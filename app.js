// HALLE Clock-In System - Milestone 2 client-side JavaScript
const CLOCK_IN_WINDOW_MINUTES = 15;

// Employee IDs are EMP- followed by numbers only.
function isEmployeeIdValid(id) {
  return /^EMP-\d+$/.test(String(id).trim());
}

// Work Location is required; the empty placeholder is not a valid choice.
function isWorkLocationValid(locationValue) {
  return String(locationValue || "").trim() !== "";
}

// Scheduled Shift Date is required (HTML date input uses YYYY-MM-DD).
function isScheduledShiftDateValid(dateValue) {
  return String(dateValue || "").trim() !== "";
}

// Scheduled Shift Start is required (HTML time input uses HH:MM).
function isScheduledShiftStartValid(timeValue) {
  return String(timeValue || "").trim() !== "";
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
const workLocation = document.querySelector("#workLocation");
const scheduledShiftDate = document.querySelector("#scheduledShiftDate");
const scheduledShiftStart = document.querySelector("#scheduledShiftStart");
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
    "status-rejected",
    "status-submitted"
  );

  clockInStatus.classList.add("status-message");

  if (message.startsWith("Accepted:")) {
    clockInStatus.classList.add("status-success");
  } else if (message.startsWith("Flagged:")) {
    clockInStatus.classList.add("status-flagged");
  } else if (
    message.startsWith("Rejected:") ||
    message.startsWith("Invalid input:") ||
    message === "Please select your work location before clocking in."
  ) {
    clockInStatus.classList.add("status-rejected");
  } else if (message.startsWith("Submitted:")) {
    clockInStatus.classList.add("status-submitted");
  }

  clockInStatus.hidden = false;
}

function clearStatusMessages() {
  if (clockInStatus) {
    clockInStatus.hidden = true;
    clockInStatus.textContent = "";
    clockInStatus.classList.remove(
      "status-message",
      "status-success",
      "status-flagged",
      "status-rejected",
      "status-submitted"
    );
  }

  if (punctualityMessage) {
    punctualityMessage.textContent = "";
    punctualityMessage.className = "";
  }
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

const EMPLOYEE_ID_PREFIX = "EMP-";

function digitsOnly(value) {
  return String(value).replace(/\D/g, "");
}

function withEmployeeIdPrefix(raw) {
  const value = String(raw);
  const upper = value.toUpperCase();

  if (upper === "" || EMPLOYEE_ID_PREFIX.startsWith(upper) || "EMP".startsWith(upper)) {
    return EMPLOYEE_ID_PREFIX;
  }

  let rest;
  if (upper.startsWith(EMPLOYEE_ID_PREFIX)) {
    rest = value.slice(EMPLOYEE_ID_PREFIX.length);
  } else if (upper.startsWith("EMP")) {
    rest = value.slice(3);
  } else {
    rest = value;
  }

  return EMPLOYEE_ID_PREFIX + digitsOnly(rest);
}

function applyEmployeeIdPrefix() {
  const previous = employeeId.value;
  const start = employeeId.selectionStart;
  const next = withEmployeeIdPrefix(previous);

  if (next === previous) {
    return;
  }

  employeeId.value = next;
  const inserted = next.length - previous.length;
  const caret = Math.max(EMPLOYEE_ID_PREFIX.length, (start ?? next.length) + inserted);
  employeeId.setSelectionRange(caret, caret);
}

if (employeeId) {
  employeeId.addEventListener("focus", () => {
    if (employeeId.value.trim() === "") {
      employeeId.value = EMPLOYEE_ID_PREFIX;
      employeeId.setSelectionRange(EMPLOYEE_ID_PREFIX.length, EMPLOYEE_ID_PREFIX.length);
    }
  });

  employeeId.addEventListener("keydown", (event) => {
    const start = employeeId.selectionStart;
    const end = employeeId.selectionEnd;
    const hasSelection = start !== end;
    const prefixLength = EMPLOYEE_ID_PREFIX.length;
    const usingShortcut = event.ctrlKey || event.metaKey || event.altKey;

    if (event.key === "Backspace" && !hasSelection && start <= prefixLength) {
      event.preventDefault();
      return;
    }

    if (event.key === "Delete" && !hasSelection && start < prefixLength) {
      event.preventDefault();
      return;
    }

    if ((event.key === "Backspace" || event.key === "Delete") && hasSelection && start < prefixLength) {
      event.preventDefault();
      employeeId.value = EMPLOYEE_ID_PREFIX + digitsOnly(employeeId.value.slice(Math.max(end, prefixLength)));
      employeeId.setSelectionRange(prefixLength, prefixLength);
      return;
    }

    if (!usingShortcut && event.key.length === 1 && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  });

  employeeId.addEventListener("input", () => {
    applyEmployeeIdPrefix();

    const id = employeeId.value.trim();

    // Clear the previous timestamp if the employee ID changes.
    if (clockInTimestamp) {
      clockInTimestamp.value = "";
    }

    if (!id || id === EMPLOYEE_ID_PREFIX) {
      showStatus("Employee ID is required. Enter your badge number.");
    } else if (!isEmployeeIdValid(id)) {
      showStatus("Invalid input: Employee ID must be EMP- followed by numbers only.");
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
    if (!id || id === EMPLOYEE_ID_PREFIX || !isEmployeeIdValid(id)) {
      clockInTimestamp.value = "";

      showStatus(id === "" || id === EMPLOYEE_ID_PREFIX
        ? "Invalid input: Employee ID is required. Enter your badge number and try again."
        : "Invalid input: Employee ID must be EMP- followed by numbers only. Correct it and try again.");

      return;
    }

    // Work location must be chosen (placeholder value is not allowed).
    if (!workLocation || !isWorkLocationValid(workLocation.value)) {
      clockInTimestamp.value = "";
      showStatus("Please select your work location before clocking in.");
      return;
    }

    // Required scheduled shift fields must be present before submission.
    if (!scheduledShiftDate || !isScheduledShiftDateValid(scheduledShiftDate.value)) {
      clockInTimestamp.value = "";
      showStatus("Invalid input: Scheduled Shift Date is required. Select a date and try again.");
      return;
    }

    if (!scheduledShiftStart || !isScheduledShiftStartValid(scheduledShiftStart.value)) {
      clockInTimestamp.value = "";
      showStatus("Invalid input: Scheduled Shift Start is required. Select a start time and try again.");
      return;
    }

    // Generate clock-in timestamp from the system clock.
    clockInTimestamp.value = formatLocalDateTime(new Date());

    // Client-side demonstration only: do not show Accepted until backend processing exists.
    showStatus("Submitted: Clock-in request for " + id + " at " +
      clockInTimestamp.value.replace("T", " ") +
      ". Employment and schedule checks are pending; this is a client-side demonstration only.");
  });

  // ==========================================
  // Reset Form
  // ==========================================

  form.addEventListener("reset", () => {
    // Native reset clears form inputs; also clear the separate punctuality
    // test input and status messages after the browser finishes resetting.
    setTimeout(() => {
      if (minutesInput) {
        minutesInput.value = "";
      }
      clearStatusMessages();
    }, 0);
  });
}
