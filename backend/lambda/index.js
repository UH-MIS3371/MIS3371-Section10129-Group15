"use strict";

// HALLE Clock-In System — AWS Lambda Backend
// MIS 3371 | Group 15

const CLOCK_IN_WINDOW_MINUTES = 15;
const TIME_ZONE = "America/Chicago";

// Mock employee records for the AWS checkpoint.
const employees = {
  "EMP-10492": {
    name: "Jen Calderon",
    department: "Grocery",
    status: "Active",
    hasOpenClockIn: false
  },
  "EMP-10577": {
    name: "Marcus Reed",
    department: "Front End",
    status: "Active",
    hasOpenClockIn: false
  },
  "EMP-20031": {
    name: "Dana Ortiz",
    department: "Produce",
    status: "Inactive",
    hasOpenClockIn: false
  },
  "EMP-30118": {
    name: "Sam Patel",
    department: "Prepared Foods",
    status: "Active",
    hasOpenClockIn: true
  }
};

// Return the current date and time in Central Time.
function getChicagoTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`
  };
}

// Convert HH:MM into total minutes after midnight.
function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Build a consistent clock-in result.
function buildResult(status, reason, minutes, timestamp, name) {
  return {
    clockInStatus: status,
    statusReason: reason,
    minutesFromShiftStart: minutes,
    clockInTimestamp: timestamp,
    employeeName: name
  };
}

// Validate one clock-in request independently of the browser.
function processClockIn(request, now = new Date()) {
  const chicago = getChicagoTime(now);
  const timestamp = `${chicago.date}T${chicago.time}:00`;
  const reject = (reason, minutes = null, name = "") =>
    buildResult("Rejected", reason, minutes, timestamp, name);

  if (!request || typeof request !== "object" ||
      Array.isArray(request)) {
    return { httpStatus: 400, result: reject("Employee ID is required.") };
  }

  const employeeId = request.employeeId;
  const department = request.department;
  const shift = request.scheduledShiftStart;
  const comment = request.clockInComment ?? "";

  // Rule 1: Required fields.
  if (typeof employeeId !== "string" || !employeeId.trim()) {
    return { httpStatus: 400, result: reject("Employee ID is required.") };
  }
  if (typeof department !== "string" || !department.trim()) {
    return { httpStatus: 400, result: reject("Department is required.") };
  }
  if (typeof shift !== "string" || !shift.trim()) {
    return {
      httpStatus: 400,
      result: reject("Shift Scheduled Time is required.")
    };
  }

  // Rule 2: Employee ID format.
  if (!/^EMP-\d{5}$/.test(employeeId)) {
    return {
      httpStatus: 400,
      result: reject("Employee ID must be in the format EMP-12345.")
    };
  }

  // Rule 3: Employee must exist.
  const employee = employees[employeeId];
  if (!employee) {
    return { httpStatus: 200, result: reject("Employee ID not found.") };
  }

  // Rule 4: Employee must be active.
  if (employee.status !== "Active") {
    return {
      httpStatus: 200,
      result: reject(
        "Employee is not active and cannot clock in.",
        null,
        employee.name
      )
    };
  }

  // Rule 5: Department must match.
  if (department !== employee.department) {
    return {
      httpStatus: 200,
      result: reject(
        "Department does not match employee record.",
        null,
        employee.name
      )
    };
  }

  // Rule 6: Prevent duplicate open clock-ins.
  if (employee.hasOpenClockIn) {
    return {
      httpStatus: 200,
      result: reject(
        "Employee already has an open clock-in.",
        null,
        employee.name
      )
    };
  }

  // Validate shift format before calculating.
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(shift)) {
    return {
      httpStatus: 400,
      result: reject("Shift Scheduled Time must be in HH:MM format.")
    };
  }

  const minutesFromShiftStart =
    timeToMinutes(chicago.time) - timeToMinutes(shift);

  const outsideWindow =
    Math.abs(minutesFromShiftStart) > CLOCK_IN_WINDOW_MINUTES;

  const hasComment =
    typeof comment === "string" && comment.trim().length > 0;

  // Rule 7: A comment is required outside the time window.
  if (outsideWindow && !hasComment) {
    return {
      httpStatus: 200,
      result: reject(
        "A comment is required when clocking in more than 15 minutes early or late.",
        minutesFromShiftStart,
        employee.name
      )
    };
  }

  // Rule 9: Comment length validation.
  if (typeof comment !== "string" || comment.length > 250) {
    return {
      httpStatus: 400,
      result: reject(
        "Comment must be 250 characters or fewer.",
        minutesFromShiftStart,
        employee.name
      )
    };
  }

  // Rule 8: Outside the window with a comment.
  if (outsideWindow) {
    const reason = minutesFromShiftStart < 0
      ? "Clock-in more than 15 minutes early"
      : "Clock-in more than 15 minutes late";

    return {
      httpStatus: 200,
      result: buildResult(
        "Flagged",
        reason,
        minutesFromShiftStart,
        timestamp,
        employee.name
      )
    };
  }

  // Rule 10: Valid clock-in.
  return {
    httpStatus: 200,
    result: buildResult(
      "Accepted",
      "",
      minutesFromShiftStart,
      timestamp,
      employee.name
    )
  };
}

// AWS Lambda entry point.
async function handler(event) {
  let request;

  try {
    request = typeof event?.body === "string"
      ? JSON.parse(event.body)
      : event?.body;
  } catch {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        clockInStatus: "Rejected",
        statusReason: "Invalid JSON body.",
        minutesFromShiftStart: null,
        clockInTimestamp: null,
        employeeName: ""
      })
    };
  }

  const { httpStatus, result } = processClockIn(request);

  return {
    statusCode: httpStatus,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(result)
  };
}

module.exports = {
  handler,
  processClockIn,
  getChicagoTime,
  timeToMinutes
};