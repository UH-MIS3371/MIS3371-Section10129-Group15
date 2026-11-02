"use strict";

// HALLE Clock-In System — AWS Lambda Tests
// MIS 3371 | Group 15

const assert = require("node:assert/strict");
const {
  handler,
  processClockIn,
  getChicagoTime
} = require("./index");

// Fixed test time: 8:00 AM Central, November 2, 2026.
// This makes timing tests repeatable.
const NOW = new Date("2026-11-02T14:00:00Z");

const BASE_REQUEST = {
  employeeId: "EMP-10492",
  department: "Grocery",
  scheduledShiftStart: "08:00",
  clockInComment: ""
};

function makeRequest(changes = {}) {
  return { ...BASE_REQUEST, ...changes };
}

const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

function expectResult(changes, expected, now = NOW) {
  const actual = processClockIn(makeRequest(changes), now);

  for (const [field, value] of Object.entries(expected)) {
    assert.deepEqual(
      actual.result[field],
      value,
      `Unexpected ${field}`
    );
  }

  return actual;
}

// Verify Central Time conversion.
test("Central Time conversion", () => {
  assert.deepEqual(getChicagoTime(NOW), {
    date: "2026-11-02",
    time: "08:00"
  });
});

// Valid clock-ins.
test("Accepted: on time", () => {
  const actual = expectResult({}, {
    clockInStatus: "Accepted",
    statusReason: "",
    minutesFromShiftStart: 0,
    employeeName: "Jen Calderon"
  });

  assert.equal(actual.httpStatus, 200);
});

test("Accepted: 15 minutes early", () => {
  expectResult({ scheduledShiftStart: "08:15" }, {
    clockInStatus: "Accepted",
    minutesFromShiftStart: -15
  });
});

test("Accepted: 15 minutes late", () => {
  expectResult({ scheduledShiftStart: "07:45" }, {
    clockInStatus: "Accepted",
    minutesFromShiftStart: 15
  });
});

// Outside the allowed window.
test("Rejected: 16 minutes late without comment", () => {
  expectResult({ scheduledShiftStart: "07:44" }, {
    clockInStatus: "Rejected",
    statusReason:
      "A comment is required when clocking in more than 15 minutes early or late.",
    minutesFromShiftStart: 16
  });
});

test("Flagged: 16 minutes late with comment", () => {
  expectResult({
    scheduledShiftStart: "07:44",
    clockInComment: "Traffic delay"
  }, {
    clockInStatus: "Flagged",
    statusReason: "Clock-in more than 15 minutes late",
    minutesFromShiftStart: 16
  });
});

test("Flagged: 16 minutes early with comment", () => {
  expectResult({
    scheduledShiftStart: "08:16",
    clockInComment: "Arrived early"
  }, {
    clockInStatus: "Flagged",
    statusReason: "Clock-in more than 15 minutes early",
    minutesFromShiftStart: -16
  });
});

// Employee validation.
test("Rejected: unknown employee ID", () => {
  expectResult({ employeeId: "EMP-99999" }, {
    clockInStatus: "Rejected",
    statusReason: "Employee ID not found."
  });
});

test("Rejected: inactive employee", () => {
  expectResult({
    employeeId: "EMP-20031",
    department: "Produce"
  }, {
    clockInStatus: "Rejected",
    statusReason: "Employee is not active and cannot clock in.",
    employeeName: "Dana Ortiz"
  });
});

test("Rejected: department mismatch", () => {
  expectResult({ department: "Produce" }, {
    clockInStatus: "Rejected",
    statusReason: "Department does not match employee record."
  });
});

test("Rejected: existing open clock-in", () => {
  expectResult({
    employeeId: "EMP-30118",
    department: "Prepared Foods"
  }, {
    clockInStatus: "Rejected",
    statusReason: "Employee already has an open clock-in."
  });
});

// Required input and formatting.
test("HTTP 400: missing employee ID", () => {
  const actual = expectResult({ employeeId: "" }, {
    clockInStatus: "Rejected",
    statusReason: "Employee ID is required."
  });

  assert.equal(actual.httpStatus, 400);
});

test("HTTP 400: invalid employee ID format", () => {
  const actual = expectResult({ employeeId: "10492" }, {
    clockInStatus: "Rejected",
    statusReason: "Employee ID must be in the format EMP-12345."
  });

  assert.equal(actual.httpStatus, 400);
});

test("HTTP 400: comment exceeds 250 characters", () => {
  const actual = expectResult({
    clockInComment: "A".repeat(251)
  }, {
    clockInStatus: "Rejected",
    statusReason: "Comment must be 250 characters or fewer."
  });

  assert.equal(actual.httpStatus, 400);
});

// Test the actual Lambda handler and HTTP response.
test("Lambda handler: invalid JSON", async () => {
  const response = await handler({
    body: "{invalid json"
  });

  assert.equal(response.statusCode, 400);
  assert.equal(
    JSON.parse(response.body).clockInStatus,
    "Rejected"
  );
});

test("Lambda handler: response format", async () => {
  const response = await handler({
    body: JSON.stringify(BASE_REQUEST)
  });

  assert.equal(response.statusCode, 200);
  assert.equal(
    response.headers["Content-Type"],
    "application/json"
  );
  assert.equal(
    response.headers["Access-Control-Allow-Origin"],
    "*"
  );

  const body = JSON.parse(response.body);

  for (const field of [
    "clockInStatus",
    "statusReason",
    "minutesFromShiftStart",
    "clockInTimestamp",
    "employeeName"
  ]) {
    assert.ok(
      Object.hasOwn(body, field),
      `Missing response field: ${field}`
    );
  }
});

// Run every test and show the results.
async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const item of tests) {
    try {
      await item.run();
      console.log(`PASS - ${item.name}`);
      passed++;
    } catch (error) {
      console.error(`FAIL - ${item.name}`);
      console.error(`  ${error.message}`);
      failed++;
    }
  }

  console.log(
    `\nTest summary: ${passed} passed, ${failed} failed`
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runTests();