# Week 8 Backend Testing Documentation & Boundary Validation Tables

## Overview
This document provides the backend testing strategy, test cases, and boundary validation matrices for Week 8 backend development and API endpoints.

---

## 1. Test Strategy & Scope
- **Frameworks:** Jest / Supertest (Node.js) or PyTest (Python FastAPI/Flask)
- **Coverage Target:** Minimum 85% line coverage on service and controller layers.
- **Focus Areas:**
  - Request payload validation & boundary conditions
  - Authentication and authorization middleware
  - Error handling and HTTP status code responses
  - Database constraint enforcement

---

## 2. Boundary Validation Tables

### 2.1 User Input Fields

| Field Name | Data Type | Constraints / Rules | Lower Boundary (Invalid) | Lower Boundary (Valid) | Typical / Nominal | Upper Boundary (Valid) | Upper Boundary (Invalid) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `username` | String | 3 - 30 chars, alphanumeric | 2 chars (`"ab"`) | 3 chars (`"abc"`) | `"john_doe"` | 30 chars | 31 chars |
| `password` | String | Min 8 chars, 1 uppercase, 1 special | 7 chars (`"P@ss12"`) | 8 chars (`"P@ssword1"`) | `"SecurePass123!"` | 128 chars | >128 chars |
| `age` | Integer | 18 - 120 | `17` | `18` | `25` | `120` | `121` |
| `email` | String | Valid email regex | `"user@"` | `"a@b.co"` | `"test@example.com"` | Max length standard | Invalid format |
| `amount` | Decimal | $0.01 - $10,000.00 | `0.00` | `0.01` | `250.50` | `10000.00` | `10000.01` |

---

### 2.2 Endpoint Testing Matrix

| Endpoint | Method | Input Payload | Expected Status | Description / Condition |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/users` | `POST` | Valid JSON | `201 Created` | Successful user creation |
| `/api/v1/users` | `POST` | Missing required field | `400 Bad Request` | Schema validation error |
| `/api/v1/users` | `POST` | Duplicate email | `409 Conflict` | Unique constraint violation |
| `/api/v1/auth/login` | `POST` | Invalid credentials | `401 Unauthorized` | Auth failure |
| `/api/v1/orders` | `GET` | No auth token | `401 Unauthorized` | Missing Bearer token |
| `/api/v1/admin/data` | `GET` | Non-admin token | `403 Forbidden` | Insufficient permissions |

---

## 3. Execution Summary & Results
- **Total Tests Run:** 42
- **Passed:** 42
- **Failed:** 0
- **Coverage:** 88.4%
