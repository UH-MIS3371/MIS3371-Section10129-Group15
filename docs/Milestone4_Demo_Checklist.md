# Milestone 4 Live Deployment Test Demo Script & Checklist

**Target Duration:** 5 to 8 Minutes  
**Recording Format:** Individual video recording with webcam (face) and microphone (voice) visible and audible throughout.

---

## 1. Recording Pre-Requisites & Live Site Opening
- [x] Presenter face and voice clearly visible and audible.
- [x] Open team's deployed live website (AWS S3 / CloudFront live URL).
- [x] State recording purpose: Validating Milestone 4 deployed website, core transaction flows, transaction retrieval, and business logic error handling.

---

## 2. Core Transaction Submission & Transaction Retrieval
- [x] **Submit Valid Transaction:**
  - Input valid Employee ID (`EMP-10001`), select Department (`Warehouse`), Shift Time (`08:00 AM`), and Clock-In Time (`08:05 AM`).
  - Submit transaction and display the generated **Confirmation / Transaction Number** returned by backend (e.g., `CNF-XXXXXX`).
- [x] **Retrieve Saved Transaction:**
  - Input the generated Confirmation Number into transaction lookup tool.
  - Retrieve and view saved transaction details.
  - Demonstrate complete end-to-end communication: **Frontend -> API Gateway -> Lambda Backend -> DynamoDB Database**.

---

## 3. Test Matrix Scenarios Walkthrough

### A. Valid Cases
- [x] **Standard On-Time:** `EMP-10001` within ±15 min window (`08:05 AM`) without comment -> Approved / On-Time (`isFlagged: false`).
- [x] **Early with Comment:** `EMP-10002` >15 min early (`07:30 AM`) with comment -> Approved / Flagged (`isFlagged: true`).
- [x] **Late with Comment:** `EMP-10003` >15 min late (`08:45 AM`) with comment -> Approved / Flagged (`isFlagged: true`).

### B. Invalid Cases
- [x] **Missing Comment when Flagged:** Early/late clock-in submitted with blank comment -> Real-time rejection error ("Comment required when flagged").
- [x] **Invalid Employee ID Format:** Input invalid ID format (e.g., `12345` or `EMP-ABC`) -> Real-time validation error ("Employee ID must match EMP-XXXXX").

### C. Boundary Cases
- [x] **Exact ±15 Minute Window Boundaries:**
  - -15 mins (`07:45 AM` for `08:00 AM` shift) -> On-Time (`isFlagged: false`).
  - +15 mins (`08:15 AM` for `08:00 AM` shift) -> On-Time (`isFlagged: false`).
  - 16 mins early (`07:44 AM`) / late (`08:16 AM`) -> Flagged (`isFlagged: true`).
- [x] **Max Comment Length:** Comment at max boundary (500 characters) -> Successfully accepted without truncation.

### D. All 4 Business Rules Verification
- [x] **Rule 1 (Early/Late Flagging):** Submissions outside ±15 min shift window are automatically flagged (`isFlagged: true`).
- [x] **Rule 2 (Comment Required When Flagged):** Flagged submissions without explanation comment are rejected (Status: Rejected, HTTP 400).
- [x] **Rule 3 (Department Required):** Missing Work Location / Department selection triggers real-time error message (`isWorkLocationValid: false`).
- [x] **Rule 4 (Duplicate Clock-In Prevention):** Attempting duplicate active clock-in for an employee with an open active session triggers real-time duplicate error message (Status: Rejected).

---

## 4. Real-Time UI Feedback & Wrap-up
- [x] Demonstrate real-time application responses and error messages for all invalid/boundary attempts.
- [x] Wrap up demo concisely within the 5-8 minute window.
