# AWS Checkpoint Test Cases

HALLE Clock-In System | MIS 3371, Section 10129, Group 15
Team: Hadi, Andres, Leo G., Leo, Elizabeth | Tests run: November 2, 2026

## 1. System Information

- Live application: https://main.d1fd7oulthz7lt.amplifyapp.com
- API endpoint: POST https://xp1ld05jfe.execute-api.us-east-1.amazonaws.com/clockin
- Architecture: Frontend hosted on AWS Amplify. The form sends requests through Amazon API Gateway (HTTP API) to an AWS Lambda function that validates input and applies the business rules.
- Access: No login required.

## 2. How to Run the Tests

1. Open the live application URL in any modern browser.
2. Employee ID: the box starts with EMP- filled in and accepts digits only. Type the 5 digits from the test case (for example, type 10492 for EMP-10492).
3. Select the Department from the dropdown.
4. Enter the Scheduled Shift Start. The clock-in time is recorded automatically by the system, so shift times are written relative to the current time. For example, if it is 2:30 PM, "current time - 16 min" means enter 2:14 PM. Submit within the same minute.
5. Enter a Comment when the case lists one. A comment is required when clocking in more than 15 minutes early or late.
6. Click Submit Clock-In and compare the result to the expected status and message.

Reading results: Results from the backend appear below the buttons as "Status", "Reason" (for Flagged and Rejected), and "Recorded at". Form validation errors appear in red under the field, and the request is not sent.

Time zone: The system uses U.S. Central Time (America/Chicago). "current time - X min" means the shift started X minutes ago (late); "current time + X min" means the shift starts in X minutes (early).

## 3. Test Employees (Mock Data)

| Employee ID | Name | Status | Department | Open Clock-In Status |
| --- | --- | --- | --- | --- |
| EMP-10492 | Jen Calderon | Active | Grocery | None |
| EMP-10577 | Marcus Reed | Active | Front End | None |
| EMP-20031 | Dana Ortiz | Inactive | Produce | N/A |
| EMP-30118 | Sam Patel | Active | Prepared Foods | Active Open Clock-In |

## 4. Summary Matrix by Rule

| Rule | Primary Test Cases | Expected Result |
| --- | --- | --- |
| 1. Active Employee | TC-01, TC-02, TC-03, TC-04 vs. TC-05, TC-06 | Active: Clock-in allowed. Inactive/Invalid: Rejected. |
| 2. Department Match | TC-01 vs. TC-07 | Match: Allowed. Mismatch: Rejected. |
| 3. On-Time Buffer | TC-01 (on time), TC-08 (15m early), TC-09 (15m late) | Within ±15 min: Approved. No comment required. |
| 4. Out-of-Window Comment | TC-02 (16m early), TC-03 (16m late) vs. TC-10, TC-11 | >15m with comment: Flagged. >15m without comment: Rejected. |
| 5. Double Clock-In | TC-01 then TC-12 | Second attempt while clock-in is active: Rejected. |
| 6. Input Validation | TC-13 to TC-20 | Invalid format/missing required fields: Form blocked. |

## 5. Test Cases

### TC-01: Standard On-Time Clock-In (Happy Path)
- Category: Happy Path
- Input: Employee ID: EMP-10492 | Department: Grocery | Shift Start: current time - 5 min | Comment: (blank)
- Expected: Approved — Clock-in recorded successfully. Status: Approved.
- Result: PASS — Status: Approved. Reason: None. Recorded at timestamp in Central Time.

### TC-02: Early Clock-In with Comment (>15 min early)
- Category: Edge Case / Flagged
- Input: Employee ID: EMP-10577 | Department: Front End | Shift Start: current time + 20 min | Comment: Manager approved early start for truck unloading
- Expected: Flagged — Flagged: Clock-in outside window (>15m early with comment).
- Result: PASS — Status: Flagged. Reason: Flagged: Early clock-in (>15 min) with comment provided.

### TC-03: Late Clock-In with Comment (>15 min late)
- Category: Edge Case / Flagged
- Input: Employee ID: EMP-10492 | Department: Grocery | Shift Start: current time - 20 min | Comment: Flat tire on I-45, notified lead
- Expected: Flagged — Flagged: Clock-in outside window (>15m late with comment).
- Result: PASS — Status: Flagged. Reason: Flagged: Late clock-in (>15 min) with comment provided.

### TC-04: Exact 15-Minute Boundary (No Comment Required)
- Category: Boundary
- Input: Employee ID: EMP-10492 | Department: Grocery | Shift Start: current time - 15 min | Comment: (blank)
- Expected: Approved — Exactly on 15m boundary; no comment needed.
- Result: PASS — Status: Approved. Reason: None.

### TC-05: Inactive Employee
- Category: Business Rule / Rejection
- Input: Employee ID: EMP-20031 | Department: Produce | Shift Start: current time | Comment: (blank)
- Expected: Rejected — Employee is inactive.
- Result: PASS — Status: Rejected. Reason: Rejected: Employee is not active.

### TC-06: Non-Existent Employee ID
- Category: Business Rule / Rejection
- Input: Employee ID: EMP-99999 | Department: Grocery | Shift Start: current time | Comment: (blank)
- Expected: Rejected — Employee ID not found in system.
- Result: PASS — Status: Rejected. Reason: Rejected: Employee ID not found.

### TC-07: Department Mismatch
- Category: Business Rule / Rejection
- Input: Employee ID: EMP-10492 | Department: Prepared Foods | Shift Start: current time | Comment: (blank)
- Expected: Rejected — Employee department mismatch.
- Result: PASS — Status: Rejected. Reason: Rejected: Employee does not belong to selected department.

### TC-08: Early Within Buffer (15 min early, no comment)
- Category: Boundary
- Input: Employee ID: EMP-10577 | Department: Front End | Shift Start: current time + 15 min | Comment: (blank)
- Expected: Approved — Exactly 15m early; within buffer.
- Result: PASS — Status: Approved. Reason: None.

### TC-09: Late Within Buffer (15 min late, no comment)
- Category: Boundary
- Input: Employee ID: EMP-10577 | Department: Front End | Shift Start: current time - 15 min | Comment: (blank)
- Expected: Approved — Exactly 15m late; within buffer.
- Result: PASS — Status: Approved. Reason: None.

### TC-10: Early Outside Window Without Comment (>15 min early)
- Category: Business Rule / Rejection
- Input: Employee ID: EMP-10577 | Department: Front End | Shift Start: current time + 16 min | Comment: (blank)
- Expected: Rejected — >15m early requires a comment.
- Result: PASS — Status: Rejected. Reason: Rejected: Clock-in is more than 15 minutes early and requires a comment.

### TC-11: Late Outside Window Without Comment (>15 min late)
- Category: Business Rule / Rejection
- Input: Employee ID: EMP-10492 | Department: Grocery | Shift Start: current time - 16 min | Comment: (blank)
- Expected: Rejected — >15m late requires a comment.
- Result: PASS — Status: Rejected. Reason: Rejected: Clock-in is more than 15 minutes late and requires a comment.

### TC-12: Duplicate / Active Open Clock-In
- Category: Business Rule / Rejection
- Input: Employee ID: EMP-30118 | Department: Prepared Foods | Shift Start: current time | Comment: (blank)
- Expected: Rejected — Employee already has an active clock-in session.
- Result: PASS — Status: Rejected. Reason: Rejected: Employee already has an active open clock-in.

### TC-13: Short Employee ID (<5 digits)
- Category: Form Validation
- Input: Employee ID: EMP-104 | Department: Grocery | Shift Start: current time | Comment: (blank)
- Expected: Form Validation Error — "Employee ID must be 5 digits" under field. Submit blocked.
- Result: PASS — Form validation error displayed; API request not sent.

### TC-14: Letters in Employee ID
- Category: Form Validation
- Input: Employee ID: EMP-1049A (typed into box) | Department: Grocery | Shift Start: current time | Comment: (blank)
- Expected: Non-digits ignored or validation error.
- Result: PASS — Input box rejects non-digit keystrokes; field remains EMP-1049 until 5th digit typed.

### TC-15: Missing Department
- Category: Form Validation
- Input: Employee ID: EMP-10492 | Department: -- Select Department -- | Shift Start: current time | Comment: (blank)
- Expected: Form Validation Error — "Department is required" under field.
- Result: PASS — Validation error displayed; API request not sent.

### TC-16: Missing Scheduled Shift Start Time
- Category: Form Validation
- Input: Employee ID: EMP-10492 | Department: Grocery | Shift Start: (empty) | Comment: (blank)
- Expected: Form Validation Error — "Shift start time is required" under field.
- Result: PASS — Validation error displayed; API request not sent.

### TC-17: Whitespace Only Comment When Comment Required
- Category: Form Validation
- Input: Employee ID: EMP-10492 | Department: Grocery | Shift Start: current time - 20 min | Comment: "   " (spaces)
- Expected: Rejected or Validation Error — Blank/whitespace comment treated as missing.
- Result: PASS — Treated as missing comment; Status: Rejected.

### TC-18: Future Shift Beyond Reasonable Window (>24 hours ahead)
- Category: Edge Case / Business Rule
- Input: Employee ID: EMP-10492 | Department: Grocery | Shift Start: tomorrow 2:00 PM | Comment: Test
- Expected: Rejected — Shift time too far in future.
- Result: PASS — Status: Rejected. Reason: Rejected: Invalid shift start time window.

### TC-19: Shift Start in Past (>24 hours ago)
- Category: Edge Case / Business Rule
- Input: Employee ID: EMP-10492 | Department: Grocery | Shift Start: yesterday 2:00 PM | Comment: Test
- Expected: Rejected — Shift time too far in past.
- Result: PASS — Status: Rejected. Reason: Rejected: Invalid shift start time window.

### TC-20: Maximum Comment Length (250 Characters)
- Category: Boundary / Input Validation
- Input: Employee ID: EMP-10492 | Department: Grocery | Shift Start: current time - 20 min | Comment: 250-character string
- Expected: Flagged — Accepted up to 250 chars; flagged with comment recorded.
- Result: PASS — Status: Flagged. Full comment recorded without truncation.

## 6. Summary

20 of 20 test cases passed. Each "Recorded at" result also showed the system-generated clock-in timestamp in Central Time, confirming the clock-in time is set by the backend and not entered by the employee.
