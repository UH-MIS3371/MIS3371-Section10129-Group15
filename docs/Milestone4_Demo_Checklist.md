# Milestone 4 Live Deployment Test Demo Script & Checklist

## 1. Demo Pre-Requisites & Deployment Verification
- [x] AWS S3 Static Web Hosting active and accessible via browser.
- [x] AWS API Gateway CORS enabled (`Access-Control-Allow-Origin: *`).
- [x] Lambda execution role granted DynamoDB Read/Write permissions.
- [x] DynamoDB `ClockInRecords` table active with primary key `ConfirmationNumber`.

---

## 2. Step-by-Step Live Demo Execution Script

### Step 1: Standard On-Time Clock-In Submission
1. Open HALLE Clock-In Application web interface.
2. Enter Employee ID: `EMP-10001`.
3. Select Department / Work Location: `Warehouse`.
4. Select Shift Time: `08:00 AM`.
5. Enter Clock-In Time: `08:05 AM` (Within 15-minute window).
6. Leave Comment field blank.
7. Click **Submit Clock-In**.
8. **Expected Verification**:
   - Status badge displays **Approved / On-Time** (`isFlagged: false`).
   - Unique Confirmation Number generated (e.g., `CNF-XXXXXX`).

### Step 2: Early Clock-In with Mandatory Comment Validation
1. Enter Employee ID: `EMP-10002`.
2. Select Department / Work Location: `Retail Store`.
3. Select Shift Time: `09:00 AM`.
4. Enter Clock-In Time: `08:30 AM` (30 minutes early -> Flagged).
5. Attempt submission without comment -> Verify system error: *"Comment required when clock-in is flagged"*.
6. Type comment: *"Approved early arrival for inventory audit"*.
7. Click **Submit Clock-In**.
8. **Expected Verification**:
   - Submission accepted with Status **Flagged** (`isFlagged: true`).
   - Comment successfully recorded in DynamoDB.

### Step 3: Late Clock-In with Mandatory Comment Validation
1. Enter Employee ID: `EMP-10003`.
2. Select Department / Work Location: `Corporate HQ`.
3. Select Shift Time: `08:00 AM`.
4. Enter Clock-In Time: `08:25 AM` (25 minutes late -> Flagged).
5. Provide comment: *"Heavy traffic delay on main highway"*.
6. Click **Submit Clock-In**.
7. **Expected Verification**:
   - Submission accepted with Status **Flagged** (`isFlagged: true`).
   - Comment attached and Confirmation Number returned.

### Step 4: Duplicate Clock-In Prevention Verification
1. Re-enter Employee ID: `EMP-10001`.
2. Select Department: `Warehouse`.
3. Attempt to submit a second clock-in for an active session.
4. **Expected Verification**:
   - API returns error: *"Active clock-in session already exists for employee EMP-10001"*.

### Step 5: Record Retrieval & AWS DynamoDB Verification
1. Enter generated Confirmation Number into Lookup/Search bar.
2. Click **Retrieve Record**.
3. **Expected Verification**:
   - Full clock-in entry displayed on UI matching DynamoDB item fields.

---

## 3. Executive Checklist for Thursday Deployment Test
- [x] All 4 Business Rules validated in code (Early/Late Flag, Comment Required when Flagged, Department Required, Duplicate Prevention).
- [x] Test Matrix documented in `docs/Milestone4_Test_Matrix.md`.
- [x] Code updated with robust boundary handling in `leo/m4-midnight-fix-test-matrix` branch.
