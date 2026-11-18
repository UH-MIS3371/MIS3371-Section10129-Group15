# Milestone 4 Test Matrix - HALLE Clock-In System

## 1. System Overview & Validation Architecture
The HALLE Clock-In System is an AWS-backed time and attendance application (S3, API Gateway, Lambda, DynamoDB). This document contains the official Milestone 4 Test Matrix validating frontend and backend business rules prior to live deployment testing.

## 2. Core Business Rules Validated in Codebase
1. **Early / Late Flagging Rule (`CLOCK_IN_WINDOW_MINUTES = 15`)**:
   - Clock-ins within ±15 minutes of scheduled shift start time are marked `On-Time` / standard (`isFlagged = false`).
   - Clock-ins more than 15 minutes prior to shift start (early) or more than 15 minutes after shift start (late) are marked `Flagged` (`isFlagged = true`).
2. **Comment Required When Flagged Rule**:
   - If a clock-in is `Flagged` (>15 minutes early or late), a non-empty comment explaining the discrepancy is **strictly required**.
   - Submissions marked `Flagged` without a comment are rejected (`Status: Rejected`, HTTP 400).
3. **Department Required Rule**:
   - Work Location / Department selection is mandatory (`isWorkLocationValid`). Form validation blocks submission if unselected.
4. **Duplicate Clock-In Prevention Rule**:
   - An employee (`EMP-XXXXX`) with an existing active open clock-in record cannot submit a duplicate clock-in until the active session is resolved (`Status: Rejected`, Duplicate error).

---

## 3. Milestone 4 Test Case Matrix

| Test Case ID | Category | Description | Input Parameters | Expected Result | Business Rule / Requirement | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-M4-V01** | **Valid** | Standard On-Time Clock-In | Emp ID: `EMP-10001`<br>Dept: `Warehouse`<br>Shift: `08:00`<br>Clock-in: `08:05`<br>Comment: *(None)* | **Success**: Status `Approved` / `On-Time`, Confirmation # generated | Standard On-Time window (Within ±15 min) | **PASS** |
| **TC-M4-V02** | **Valid** | Early Clock-In with Required Comment | Emp ID: `EMP-10002`<br>Dept: `Retail Store`<br>Shift: `09:00`<br>Clock-in: `08:30` (30 min early)<br>Comment: `Approved early arrival for inventory prep` | **Success**: Status `Flagged`, Comment recorded, Confirmation # generated | Early Flag + Comment Required when Flagged | **PASS** |
| **TC-M4-V03** | **Valid** | Late Clock-In with Required Comment | Emp ID: `EMP-10003`<br>Dept: `Corporate HQ`<br>Shift: `08:00`<br>Clock-in: `08:25` (25 min late)<br>Comment: `Heavy morning traffic on I-10` | **Success**: Status `Flagged`, Comment recorded, Confirmation # generated | Late Flag + Comment Required when Flagged | **PASS** |
| **TC-M4-I01** | **Invalid** | Out-of-Window Early Clock-In WITHOUT Comment | Emp ID: `EMP-10004`<br>Dept: `Logistics`<br>Shift: `08:00`<br>Clock-in: `07:35` (25 min early)<br>Comment: *(Blank)* | **Rejected**: Error "Comment required when clock-in is flagged" | Business Rule: Comment Required when Flagged | **PASS** |
| **TC-M4-I02** | **Invalid** | Out-of-Window Late Clock-In WITHOUT Comment | Emp ID: `EMP-10005`<br>Dept: `IT Support`<br>Shift: `08:00`<br>Clock-in: `08:30` (30 min late)<br>Comment: *(Blank)* | **Rejected**: Error "Comment required when clock-in is flagged" | Business Rule: Comment Required when Flagged | **PASS** |
| **TC-M4-I03** | **Invalid** | Missing Department / Work Location | Emp ID: `EMP-10006`<br>Dept: *(Unselected)*<br>Shift: `08:00`<br>Clock-in: `08:00`<br>Comment: *(N/A)* | **Rejected**: Form validation error "Please select a department/work location" | Business Rule: Department Required | **PASS** |
| **TC-M4-I04** | **Invalid** | Duplicate Active Clock-In Attempt | Emp ID: `EMP-10001` (already clocked in)<br>Dept: `Warehouse`<br>Shift: `08:00`<br>Clock-in: `08:10`<br>Comment: *(N/A)* | **Rejected**: Error "Active clock-in already exists for this employee" | Business Rule: Duplicate Clock-in Prevention | **PASS** |
| **TC-M4-B01** | **Boundary** | Upper On-Time Boundary (+15 Minutes Exactly) | Emp ID: `EMP-10007`<br>Dept: `Warehouse`<br>Shift: `08:00`<br>Clock-in: `08:15` (+15 min exact)<br>Comment: *(None)* | **Success**: Status `Approved` / `On-Time` (No flag, no comment required) | Boundary: Exactly +15 minutes | **PASS** |
| **TC-M4-B02** | **Boundary** | Lower On-Time Boundary (-15 Minutes Exactly) | Emp ID: `EMP-10008`<br>Dept: `Retail Store`<br>Shift: `08:00`<br>Clock-in: `07:45` (-15 min exact)<br>Comment: *(None)* | **Success**: Status `Approved` / `On-Time` (No flag, no comment required) | Boundary: Exactly -15 minutes | **PASS** |
| **TC-M4-B03** | **Boundary** | Maximum Comment Length Boundary (250 Characters) | Emp ID: `EMP-10009`<br>Dept: `Corporate HQ`<br>Shift: `08:00`<br>Clock-in: `08:30`<br>Comment: 250 character valid string | **Success**: Accepted, full comment stored in DynamoDB record | Boundary: Max length validation | **PASS** |

---

## 4. Test Verification Summary
- **Total Test Cases**: 10
- **Valid Cases**: 3 (TC-M4-V01, TC-M4-V02, TC-M4-V03)
- **Invalid Cases**: 4 (TC-M4-I01, TC-M4-I02, TC-M4-I03, TC-M4-I04)
- **Boundary Cases**: 3 (TC-M4-B01, TC-M4-B02, TC-M4-B03)
- **Business Rules Covered**: Early/Late Flagging, Comment Required when Flagged, Department Required, Duplicate Clock-In Rejection.
