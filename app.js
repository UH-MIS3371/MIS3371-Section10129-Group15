// Business Rule: Evaluate employee punctuality based on scheduled start time.
// Threshold: Clocking in more than 15 minutes late is flagged for manager review.
function evaluateClockInTime(minutesLate) {
  const LATE_THRESHOLD_MINUTES = 15;

  if (minutesLate <= 0) {
    return "Approved: On time or early";
  } else if (minutesLate <= LATE_THRESHOLD_MINUTES) {
    return "Approved: Within acceptable grace period";
  } else {
    return "Flagged: More than 15 minutes late, requires manager review";
  }
}

// ==========================================
// Boundary Testing (Instructor Requirement)
// ==========================================
console.log("=== Testing Punctuality Business Rule ===");

// 1. Early clock-in (Negative variance)
console.log("Test -10 mins (Early):", evaluateClockInTime(-10));

// 2. Below threshold / Grace period
console.log("Test 5 mins (Within grace period):", evaluateClockInTime(5));

// 3. Exactly at the threshold (Boundary)
console.log("Test 15 mins (Boundary):", evaluateClockInTime(15));

// 4. Above threshold (Flagged)
console.log("Test 20 mins (Late):", evaluateClockInTime(20));

// Business rule: the employee does not enter a time.
// Submitting an employee ID records the transaction timestamp from the current clock.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("clockInForm");
  const employeeId = document.getElementById("employeeId");
  const timestamp = document.getElementById("timestamp");
  const status = document.getElementById("clockInStatus");

  if (!form || !employeeId || !timestamp) {
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

    timestamp.value = formatLocalDateTime(new Date());

    if (status) {
      status.hidden = false;
      status.textContent = "Clock-in recorded for " + id + " at " + timestamp.value.replace("T", " ") + ".";
    }
  });

  form.addEventListener("reset", () => {
    if (status) {
      status.hidden = true;
      status.textContent = "";
    }
  });
});
