# AWS Checkpoint Test Cases

## 1. System Information
| Attribute | Details |
| --- | --- |
| System Name | Employee Clock-In & Management System |
| Environment | AWS Cloud Infrastructure (EC2, S3, RDS, CloudFront) |
| Target URL / Endpoint | AWS Checkpoint Production Environment |
| Database | AWS RDS PostgreSQL / MySQL |
| Tested By | MIS3371 Section 10129 Group 15 |
| Date | November 2026 |
| Version | Milestone 2 / AWS Checkpoint |

---

## 2. Test Case Summary
| Category | Total Cases | Passed | Failed | Pending |
| --- | --- | --- | --- | --- |
| Authentication & Authorization | 3 | 3 | 0 | 0 |
| Clock-In Timing Rules | 5 | 5 | 0 | 0 |
| Data Integrity & Database Sync | 3 | 3 | 0 | 0 |
| System Failure & Edge Cases | 4 | 4 | 0 | 0 |
| **Total** | **15** | **15** | **0** | **0** |

---

## 3. Test Cases Document

### 3.1 Authentication & Authorization
| Test Case ID | Test Case Description | Pre-Conditions | Test Steps | Expected Output | Status |
| --- | --- | --- | --- | --- | --- |
| TC-AUTH-01 | Valid User Login | User registered in DB | 1. Navigate to login page.<br>2. Enter valid credentials.<br>3. Click Submit. | Dashboard loads successfully with correct user role. | Pass |
| TC-AUTH-02 | Invalid Password | User registered in DB | 1. Enter valid email.<br>2. Enter incorrect password.<br>3. Click Submit. | Error message displayed: "Invalid email or password." | Pass |
| TC-AUTH-03 | Unauthorized Page Access | User not logged in | 1. Access dashboard URL directly without session token. | Redirected to login page. | Pass |

### 3.2 Clock-In Timing Rules
| Test Case ID | Test Case Description | Input (Minutes relative to Shift) | Expected Output | Status |
| --- | --- | --- | --- | --- |
| TC-CLK-01 | On-Time Clock-In | 0 | Accepted: On time or within early window | Pass |
| TC-CLK-02 | Grace Period Clock-In | 15 | Accepted: Within acceptable grace period | Pass |
| TC-CLK-03 | Early Window Clock-In | -15 | Accepted: On time or within early window | Pass |
| TC-CLK-04 | Early Edge Case Flag | -16 | Flagged: Clock-in too early for shift | Pass |
| TC-CLK-05 | Late Edge Case Flag | 16 | Flagged: Clock-in late beyond grace period | Pass |

### 3.3 Data Integrity & Database Sync
| Test Case ID | Test Case Description | Test Steps | Expected Output | Status |
| --- | --- | --- | --- | --- |
| TC-DATA-01 | AWS RDS Record Persistence | Perform valid clock-in transaction. | Record immediately reflects timestamp and status in RDS table. | Pass |
| TC-DATA-02 | Concurrent Shift Submissions | Submit simultaneous clock-in requests from multiple sessions. | Database locks appropriately; duplicate records prevented. | Pass |
| TC-DATA-03 | Data Validation Format | Submit clock-in payload missing employee ID. | 400 Bad Request returned with validation error. | Pass |

### 3.4 Failure Path & Edge Cases
| Test Case ID | Test Case Description | Scenario | Expected Recovery / Output | Status |
| --- | --- | --- | --- | --- |
| TC-FAIL-01 | AWS EC2 Service Interruption | Server connection drops during submission. | Retry mechanism triggered; offline state cached locally. | Pass |
| TC-FAIL-02 | Database Connection Timeout | AWS RDS instance un-reachable temporarily. | Friendly user error page displayed; system logs exception. | Pass |
| TC-FAIL-03 | Invalid Timezone Payload | User device clock out of sync by > 1 hour. | Server timestamp used for all timing rule evaluations. | Pass |
| TC-FAIL-04 | Network Disconnection Mid-Transaction | Connection severed during payload transmission. | Transaction aborted safely without corrupting database state. | Pass |

---

## 4. Test Execution Summary & Recommendations
All test cases for the AWS Checkpoint deployment have been executed against the active cloud architecture. Clock-in timing rules, data persistence, and failure recovery mechanisms meet business requirements specified in Milestone 2.
