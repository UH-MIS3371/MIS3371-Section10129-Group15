"use strict";

// HALLE Clock-In System — AWS Lambda Backend
// MIS 3371 | Group 15

const crypto = require("node:crypto");

const CLOCK_IN_WINDOW_MINUTES = 15;
const TIME_ZONE = "America/Chicago";
const TABLE_NAME = process.env.TABLE_NAME;
const DUPLICATE_INDEX = "employeeId-clockInDate-index";

// Mock employee records for the AWS checkpoint.
const employees = {
  "EMP-10492": {
    name: "Jen Calderon",
    department: "Grocery",
    status: "Active"
  },
  "EMP-10577": {
    name: "Marcus Reed",
    department: "Front End",
    status: "Active"
  },
  "EMP-20031": {
    name: "Dana Ortiz",
    department: "Produce",
    status: "Inactive"
  },
  "EMP-30118": {
    name: "Sam Patel",
    department: "Prepared Foods",
    status: "Active"
  },
  "EMP-40215": {
    name: "Ava Nguyen",
    department: "Produce",
    status: "Active"
  },
  "EMP-40388": {
    name: "Luis Romero",
    department: "Grocery",
    status: "Active"
  },
  "EMP-40512": {
    name: "Kayla Brooks",
    department: "Front End",
    status: "Active"
  },
  "EMP-40637": {
    name: "Omar Haddad",
    department: "Prepared Foods",
    status: "Active"
  },
  "EMP-40741": {
    name: "Grace Kim",
    department: "Produce",
    status: "Active"
  },
  "EMP-40856": {
    name: "Tyler Jensen",
    department: "Grocery",
    status: "Active"
  },
  "EMP-40963": {
    name: "Nina Alvarez",
    department: "Front End",
    status: "Active"
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
    return { httpStatus: 400, result: reject("Employee ID not found.") };
  }

  // Rule 4: Employee must be active.
  if (employee.status !== "Active") {
    return {
      httpStatus: 400,
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
      httpStatus: 400,
      result: reject(
        "Department does not match employee record.",
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

  let minutesFromShiftStart =
    timeToMinutes(chicago.time) - timeToMinutes(shift);

  // Handle shifts that cross midnight (for example 23:55 shift, 00:05 clock-in).
  if (minutesFromShiftStart > 720) minutesFromShiftStart -= 1440;
  if (minutesFromShiftStart < -720) minutesFromShiftStart += 1440;

  const outsideWindow =
    Math.abs(minutesFromShiftStart) > CLOCK_IN_WINDOW_MINUTES;

  const hasComment =
    typeof comment === "string" && comment.trim().length > 0;

  // Rule 7: A comment is required outside the time window.
  if (outsideWindow && !hasComment) {
    return {
      httpStatus: 400,
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

// ---------------------------------------------------------------------------
// DynamoDB
// ---------------------------------------------------------------------------

// Real DynamoDB access. The AWS SDK is built into the Node 20+ Lambda runtime,
// so it is only loaded when the Lambda actually runs (not in local tests).
function createDynamoDb() {
  const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
  const {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand
  } = require("@aws-sdk/lib-dynamodb");

  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  return {
    // Rule 6: Has this employee already clocked in on this date?
    async hasClockInOnDate(employeeId, clockInDate) {
      const result = await client.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: DUPLICATE_INDEX,
        KeyConditionExpression:
          "employeeId = :employeeId AND clockInDate = :clockInDate",
        ExpressionAttributeValues: {
          ":employeeId": employeeId,
          ":clockInDate": clockInDate
        },
        Limit: 1
      }));

      return (result.Items || []).length > 0;
    },

    // Save the record. The condition guarantees we never overwrite
    // an existing confirmation number.
    async saveClockIn(record) {
      await client.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: record,
        ConditionExpression: "attribute_not_exists(confirmationNumber)"
      }));
    }
  };
}

let defaultDb;
function getDefaultDb() {
  if (!defaultDb) defaultDb = createDynamoDb();
  return defaultDb;
}

// Example: HC-20261119-7F3A9C2B
function generateConfirmationNumber(clockInDate) {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `HC-${clockInDate.replace(/-/g, "")}-${random.toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// AWS Lambda entry point
// ---------------------------------------------------------------------------

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  };
}

function rejectedBody(reason, extra = {}) {
  return {
    confirmationNumber: null,
    clockInStatus: "Rejected",
    statusReason: reason,
    minutesFromShiftStart: null,
    clockInTimestamp: null,
    employeeName: "",
    ...extra
  };
}

// options.db and options.now let the tests use a fake database and fixed time.
async function handler(event, context, options = {}) {
  const now = options.now || new Date();
  let request;

  try {
    request = typeof event?.body === "string"
      ? JSON.parse(event.body)
      : event?.body;
  } catch {
    return jsonResponse(400, rejectedBody("Invalid JSON body."));
  }

  // Rules 1-5 and 7-10: validate the request.
  const { httpStatus, result } = processClockIn(request, now);

  if (result.clockInStatus === "Rejected") {
    return jsonResponse(httpStatus, { confirmationNumber: null, ...result });
  }

  const clockInDate = getChicagoTime(now).date; // YYYY-MM-DD

  try {
    const db = options.db || getDefaultDb();

    // Rule 6: Prevent duplicate clock-ins (checked in DynamoDB).
    if (await db.hasClockInOnDate(request.employeeId, clockInDate)) {
      return jsonResponse(400, {
        confirmationNumber: null,
        ...result,
        clockInStatus: "Rejected",
        statusReason: "Employee already has an open clock-in."
      });
    }

    const confirmationNumber = generateConfirmationNumber(clockInDate);

    await db.saveClockIn({
      confirmationNumber,
      employeeId: request.employeeId,
      employeeName: result.employeeName,
      department: request.department,
      scheduledShiftStart: request.scheduledShiftStart,
      clockInComment: (request.clockInComment ?? "").trim(),
      clockInDate,
      clockInTimestamp: result.clockInTimestamp,
      clockInStatus: result.clockInStatus,
      statusReason: result.statusReason,
      minutesFromShiftStart: result.minutesFromShiftStart,
      createdAt: now.toISOString()
    });

    return jsonResponse(200, { confirmationNumber, ...result });
  } catch (error) {
    console.error("DynamoDB error:", error);
    return jsonResponse(500, rejectedBody(
      "The clock-in could not be saved. Please try again."
    ));
  }
}

module.exports = {
  handler,
  processClockIn,
  getChicagoTime,
  timeToMinutes,
  generateConfirmationNumber
};
