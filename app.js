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
