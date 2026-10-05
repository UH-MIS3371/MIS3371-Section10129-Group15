// ==========================================
// Business Rule: Clock-in timing window
// A clock-in more than 15 minutes early or more than 15 minutes late
// is Flagged for manager review. Otherwise it is Accepted.
// minutesFromShiftStart: negative = early, positive = late (data dictionary)
// ==========================================
const EARLY_THRESHOLD_MINUTES = 15;
const LATE_THRESHOLD_MINUTES = 15;

function evaluateClockInTime(minutesFromShiftStart) {
  if (minutesFromShiftStart < -EARLY_THRESHOLD_MINUTES) {
    return "Flagged: More than 15 minutes early, requires manager review";
  } else if (minutesFromShiftStart <= 0) {
    return "Accepted: On time or within early window";
  } else if (minutesFromShiftStart <= LATE_THRESHOLD_MINUTES) {
    return "Accepted: Within acceptable grace period";
  } else {
    return "Flagged: More than 15 minutes late, requires manager review";
  }
}

// ==========================================
// Boundary Testing (Instructor Requirement)
// ==========================================
console.log("=== Testing Clock-In Timing Rule ===");
console.log("Test -16 mins (Too early):", evaluateClockInTime(-16));
console.log("Test -15 mins (Early boundary):", evaluateClockInTime(-15));
console.log("Test 0 mins (On time):", evaluateClockInTime(0));
console.log("Test 15 mins (Late boundary):", evaluateClockInTime(15));
console.log("Test 16 mins (Too late):", evaluateClockInTime(16));

// ==========================================
// Page behavior
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

  // ---- Week 6: connect the timing rule to the page ----
  const minutesInput = document.querySelector("#minutesFromShiftStart");
  const punctualityMessage = document.querySelector("#punctualityMessage");

  if (minutesInput && punctualityMessage) {
    minutesInput.addEventListener("input", () => {
      const raw = minutesInput.value;
      if (raw === "") {
        punctualityMessage.textContent = "";
        return;
      }
      punctualityMessage.textContent = evaluateClockInTime(Number(raw));
    });
  }

  // ---- Clock-in submission ----
  // Business rule: the employee does not enter a time.
  // Submitting an employee ID records clockInTimestamp from the system clock.
  const form = document.querySelector("#clockInForm");
  const employeeId = document.querySelector("#employeeId");
  const clockInTimestamp = document.querySelector("#clockInTimestamp");
  const clockInStatus = document.querySelector("#clockInStatus");

  if (!form || !employeeId || !clockInTimestamp) {
    return;
  }

  function formatLocalDateTime(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("-") + "T" + [
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds())
    ].join(":");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const id = employeeId.value.trim();
    if (!id) {
      return;
    }

    clockInTimestamp.value = formatLocalDateTime(new Date());

    if (clockInStatus) {
      clockInStatus.hidden = false;
      clockInStatus.textContent = "Clock-in submitted for " + id + " at " + clockInTimestamp.value.replace("T", " ") + ".";
    }
  });

  form.addEventListener("reset", () => {
    if (clockInStatus) {
      clockInStatus.hidden = true;
      clockInStatus.textContent = "";
    }
  });
});