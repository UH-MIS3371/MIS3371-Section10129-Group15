// api.js
// Sends clock-in requests from the form to API Gateway (which calls the Lambda backend)
// and passes the result to showResult() in app.js.
//
// Load this file BEFORE app.js in ClockInTransaction.html:
//   <script src="api.js"></script>
//   <script src="app.js"></script>

// Replace with the Invoke URL from API Gateway after the HTTP API is created.
// Example: https://abc123xyz.execute-api.us-east-1.amazonaws.com/clockin
const API_URL = "https://xp1ld05jfe.execute-api.us-east-1.amazonaws.com/clockin";

// data = { employeeId, department, scheduledShiftStart, clockInComment }
// The clock-in time is NOT sent; Lambda sets it on the server.
async function submitClockIn(data) {
  const submitButton = document.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true; // prevents double submits

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    // Lambda returns JSON for both 200 (processed) and 400 (invalid input)
    const result = await response.json();
    showResult(result.clockInStatus, result.statusReason, result);
  } catch (error) {
    // Network failure, CORS problem, or a non-JSON error from AWS
    console.error("Clock-in request failed:", error);
    showResult("Rejected", "Unable to reach the clock-in service. Please try again.");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}