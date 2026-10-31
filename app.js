const CLOCK_IN_WINDOW_MINUTES = 15;

// Employee IDs are EMP- followed by exactly 5 digits (for example EMP-12345).
function isEmployeeIdValid(id) {
  return /^EMP-\d{5}$/.test(String(id).trim());
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

// AWS checkpoint fields and message areas
const departmentSelect = document.querySelector("#department");
const clockInTime = document.querySelector("#clockInTime");
const clockInComment = document.querySelector("#clockInComment");
const formMessage = document.querySelector("#formMessage");
const responseMessage = document.querySelector("#responseMessage");

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
      setFieldError(employeeId, "Employee ID is required.");
    } else if (!isEmployeeIdValid(id)) {
      setFieldError(employeeId, "Employee ID must be in the format EMP-12345.");
    } else {
      setFieldError(employeeId, "");
    }
  });
}

// Auto-fill "EMP-" as soon as the page opens
if (employeeId && employeeId.value.trim() === "") {
  employeeId.value = EMPLOYEE_ID_PREFIX;
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
// AWS Checkpoint: live clock, validation, result display
// ==========================================

// Shows the current time in the read-only Clock-In Time box.
function updateClockDisplay() {
  if (!clockInTime) return;

  clockInTime.value = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

updateClockDisplay();                       // show it right away
setInterval(updateClockDisplay, 60 * 1000); // then refresh every minute

// Whole minutes between now and the shift start.
// Negative = early, positive = late. Exactly 15 is allowed; 16 is not.
function getMinutesFromShiftStart(shiftValue) {
  const [shiftHour, shiftMinute] = shiftValue.split(":").map(Number);
  const now = new Date();
  let diff = (now.getHours() * 60 + now.getMinutes()) - (shiftHour * 60 + shiftMinute);

  // Handle shifts that cross midnight (for example 11:55 PM vs 12:05 AM).
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  return diff;
}

// Shows (or clears) the red message under one box.
// Each box has a matching <p id="...Error"> in the HTML, for example employeeIdError.
function setFieldError(input, message) {
  if (!input) return;

  const errorBox = document.querySelector("#" + input.id + "Error");
  if (errorBox) {
    errorBox.textContent = message;
  }

  input.classList.toggle("input-error", message !== "");
  input.setAttribute("aria-invalid", message !== "" ? "true" : "false");
}

// Returns a list of problems, each with the box it belongs to and its message.
// An empty list means the form is valid.
function validateClockIn() {
  const errors = [];
  const id = employeeId.value.trim();
  const comment = clockInComment.value.trim();

  // Employee ID: required, then EMP- plus 5 digits
  if (id === "" || id === EMPLOYEE_ID_PREFIX) {
    errors.push({ field: employeeId, message: "Employee ID is required." });
  } else if (!isEmployeeIdValid(id)) {
    errors.push({ field: employeeId, message: "Employee ID must be in the format EMP-12345." });
  }

  // Department: the empty first option means nothing was chosen
  if (!departmentSelect || departmentSelect.value === "") {
    errors.push({ field: departmentSelect, message: "Department is required." });
  }

  // Shift start, then the comment rule for more than 15 minutes early/late
  if (!isScheduledShiftStartValid(scheduledShiftStart.value)) {
    errors.push({ field: scheduledShiftStart, message: "Shift Scheduled Time is required." });
  } else if (
    Math.abs(getMinutesFromShiftStart(scheduledShiftStart.value)) > CLOCK_IN_WINDOW_MINUTES &&
    comment === ""
  ) {
    errors.push({
      field: clockInComment,
      message: "A comment is required when clocking in more than 15 minutes early or late."
    });
  }

  // Comment length (maxlength also blocks typing; this is the safety net)
  if (clockInComment.value.length > 250) {
    errors.push({ field: clockInComment, message: "Comment must be 250 characters or fewer." });
  }

  return errors;
}

// Clears every box's message, then shows each new one under its own box.
function showFormErrors(errors) {
  [employeeId, departmentSelect, scheduledShiftStart, clockInComment].forEach((field) => {
    setFieldError(field, "");
  });

  errors.forEach((error) => {
    setFieldError(error.field, error.message);
  });

  // Short note under the buttons when anything needs fixing.
  formMessage.textContent = errors.length > 0 ? "Please fix the errors above and try again." : "";
}

// Clear a box's message as soon as the person changes that box.
if (departmentSelect) {
  departmentSelect.addEventListener("change", () => setFieldError(departmentSelect, ""));
}
if (scheduledShiftStart) {
  scheduledShiftStart.addEventListener("input", () => setFieldError(scheduledShiftStart, ""));
}
if (clockInComment) {
  clockInComment.addEventListener("input", () => setFieldError(clockInComment, ""));
}

// Called by api.js with the backend result.
// status: "Accepted", "Flagged", or "Rejected"
// reason: text explaining the status
// details: optional object, for example { clockInTimestamp: "..." }
function showResult(status, reason, details) {
  // If the backend sends no valid status (for example an error body),
  // show it as Rejected instead of printing "undefined".
  if (!["Accepted", "Flagged", "Rejected"].includes(status)) {
    status = "Rejected";
    reason = reason || "Unexpected response from the clock-in service.";
  }

  responseMessage.textContent = "";
  responseMessage.className = "status-" + status.toLowerCase();

  const statusLine = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = "Status: " + status;
  statusLine.appendChild(strong);
  responseMessage.appendChild(statusLine);

  if (reason) {
    const reasonLine = document.createElement("p");
    reasonLine.textContent = "Reason: " + reason;
    responseMessage.appendChild(reasonLine);
  }

  // The backend sets the official time, so show it if it was returned.
  if (details && details.clockInTimestamp) {
    const timeLine = document.createElement("p");
    timeLine.textContent = "Recorded at: " + details.clockInTimestamp;
    responseMessage.appendChild(timeLine);
  }
}

// ==========================================
// Clock-In Form Submission
// ==========================================

if (form && employeeId) {

  // Allows JavaScript to show validation messages.
  form.noValidate = true;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    updateClockDisplay();             // show the time of this submit
    clearStatusMessages();            // hides the live Employee ID message
    responseMessage.textContent = "";
    responseMessage.className = "";

    const errors = validateClockIn();
    showFormErrors(errors);
    if (errors.length > 0) {
      return; // stop here: do not call the backend with bad data
    }

    // Send only these four fields; the backend sets the clock-in time.
    const data = {
      employeeId: employeeId.value.trim(),
      department: departmentSelect.value,
      scheduledShiftStart: scheduledShiftStart.value,
      clockInComment: clockInComment.value.trim()
    };

    if (typeof submitClockIn === "function") {
      submitClockIn(data);
    } else {
      console.log(data); // fallback if api.js did not load
    }
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
      formMessage.textContent = "";
      responseMessage.textContent = "";
      responseMessage.className = "";
      showFormErrors([]);   // clears every box's message
      employeeId.value = EMPLOYEE_ID_PREFIX; // a native reset empties the ID box
      updateClockDisplay(); // a native reset empties the clock box
    }, 0);
  });
}
