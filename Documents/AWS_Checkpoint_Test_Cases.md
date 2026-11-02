# AWS Checkpoint Test Cases Document

## 1. Overview & System Information

- **Live Web Application URL**: `https://main.d1fd7oulthz7lt.amplifyapp.com`
- **API Endpoint**: `https://xp1ld05jfe.execute-api.us-east-1.amazonaws.com/clockin`
- **Purpose**: Test suite for validating the AWS Amplify / API Gateway / Lambda Employee Clock-In web application.

### Instructions for Use
1. Open the live web application URL in any modern browser.
2. Enter the **Employee ID** in the format `EMP-XXXXX`.
3. Select the employee's **Department** from the dropdown menu.
4. Select the **Shift Scheduled Time** (hours, minutes, AM/PM). Note: Since exact times are relative, shift times should be specified relative to current time (e.g., "16 minutes before current time"). Submit immediately within the same minute.
5. (Optional) Provide a **Manager Comment** if clocking in more than 15 minutes early or late.
6. Click **Submit** to submit the request to the backend API and observe the status banner and message returned.

---

## 2. Mock Employee Database Reference

| Employee ID | Name | Status | Department | Open Clock-in Status |
| :--- | :--- | :--- | :--- | :--- |
| **EMP-10492** | Jen Calderon | Active | Grocery | None |
| **EMP-10577** | Marcus Reed | Active | Front End | None |
| **EMP-20031** | Dana Ortiz | Inactive | Produce | N/A |
| **EMP-30118** | Sam Patel | Active | Prepared Foods | Active Open Clock-In |

---

## 3. Business & Validation Rules Matrix

1. **Missing Required Field**: Reject with `"[Field name] is required."`
2. **Invalid ID Format**: Reject with `"Employee ID must be in the format EMP-12345."`
3. **Employee ID Not Found**: Reject with `"Employee ID not found."`
4. **Inactive Employee**: Reject with `"Employee is not active and cannot clock in."`
5. **Department Mismatch**: Reject with `"Department does not match employee record."`
6. **Existing Open Clock-in**: Reject with `"Employee already has an open clock-in."`
7. **Time Difference > 15 Mins without Comment**: Reject with `"A comment is required when clocking in more than 15 minutes early or late."`
8. **Time Difference > 15 Mins with Comment**: Flagged with `"Clock-in more than 15 minutes early"` or `"Clock-in more than 15 minutes late"`.
9. **Comment Length > 250 Characters**: Reject with `"Comment must be 250 characters or fewer."`
10. **Valid Clock-in within Tolerance**: Accept with `"Clock-in accepted."`

---

## 4. Comprehensive Test Cases Table

| Test ID | Category | Input Values | Expected Status | Expected Message | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Valid | Employee ID: `EMP-10492`<br>Dept: `Grocery`<br>Shift Time: Current Time<br>Comment: None | Accepted | Clock-in accepted. | Accepted | Pass |
| **TC-02** | Valid | Employee ID: `EMP-10577`<br>Dept: `Front End`<br>Shift Time: 10 mins before current time<br>Comment: None | Accepted | Clock-in accepted. | Accepted | Pass |
| **TC-03** | Valid | Employee ID: `EMP-10492`<br>Dept: `Grocery`<br>Shift Time: 12 mins after current time<br>Comment: None | Accepted | Clock-in accepted. | Accepted | Pass |
| **TC-04** | Invalid | Employee ID: `[Blank]`<br>Dept: `Grocery`<br>Shift Time: Current Time<br>Comment: None | Rejected | Employee ID is required. | Rejected | Pass |
| **TC-05** | Invalid | Employee ID: `10492`<br>Dept: `Grocery`<br>Shift Time: Current Time<br>Comment: None | Rejected | Employee ID must be in the format EMP-12345. | Rejected | Pass |
| **TC-06** | Invalid | Employee ID: `EMP-99999`<br>Dept: `Grocery`<br>Shift Time: Current Time<br>Comment: None | Rejected | Employee ID not found. | Rejected | Pass |
| **TC-07** | Invalid | Employee ID: `EMP-10492`<br>Dept: `[None]`<br>Shift Time: Current Time<br>Comment: None | Rejected | Department is required. | Rejected | Pass |
| **TC-08** | Invalid | Employee ID: `EMP-10492`<br>Dept: `Grocery`<br>Shift Time: 20 mins before current time<br>Comment: [>250 chars string] | Rejected | Comment must be 250 characters or fewer. | Rejected | Pass |
| **TC-09** | Business Rule | Employee ID: `EMP-20031`<br>Dept: `Produce`<br>Shift Time: Current Time<br>Comment: None | Rejected | Employee is not active and cannot clock in. | Rejected | Pass |
| **TC-10** | Business Rule | Employee ID: `EMP-10492`<br>Dept: `Front End`<br>Shift Time: Current Time<br>Comment: None | Rejected | Department does not match employee record. | Rejected | Pass |
| **TC-11** | Business Rule | Employee ID: `EMP-30118`<br>Dept: `Prepared Foods`<br>Shift Time: Current Time<br>Comment: None | Rejected | Employee already has an open clock-in. | Rejected | Pass |
| **TC-12** | Business Rule | Employee ID: `EMP-10577`<br>Dept: `Front End`<br>Shift Time: 20 mins before current time<br>Comment: None | Rejected | A comment is required when clocking in more than 15 minutes early or late. | Rejected | Pass |
| **TC-13** | Business Rule | Employee ID: `EMP-10577`<br>Dept: `Front End`<br>Shift Time: 20 mins before current time<br>Comment: "Traffic delay on I-45" | Flagged | Clock-in more than 15 minutes late | Flagged | Pass |
| **TC-14** | Boundary | Employee ID: `EMP-10492`<br>Dept: `Grocery`<br>Shift Time: 15 mins after current time<br>Comment: None | Accepted | Clock-in accepted. | Accepted | Pass |
| **TC-15** | Boundary | Employee ID: `EMP-10492`<br>Dept: `Grocery`<br>Shift Time: 16 mins after current time<br>Comment: None | Rejected | A comment is required when clocking in more than 15 minutes early or late. | Rejected | Pass |
| **TC-16** | Boundary | Employee ID: `EMP-10577`<br>Dept: `Front End`<br>Shift Time: 15 mins before current time<br>Comment: None | Accepted | Clock-in accepted. | Accepted | Pass |
| **TC-17** | Boundary | Employee ID: `EMP-10492`<br>Dept: `Grocery`<br>Shift Time: 16 mins after current time<br>Comment: "Early setup requested by manager" | Flagged | Clock-in more than 15 minutes early | Flagged | Pass |
