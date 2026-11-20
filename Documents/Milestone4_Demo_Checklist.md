# HALLE Clock-In: Milestone 4 Demo Checklist
**MIS 3371, Section 10129, Group 15 | Prepared by Leandro Plasencia | Due Sunday, Nov 22, 11:59 PM**

**Live site:** https://main.d1fd7oulthz7lt.amplifyapp.com/

## Before you hit record
- [ ] Recording is 5 to 8 minutes, face visible, voice explaining, using the live site. Slides or screenshots alone don't count.
- [ ] Use only your own two employee IDs. Each ID can clock in once per day, so using someone else's breaks their recording.
- [ ] Do a dry run first. If you burn an ID, text Leo to clear your rows before you record.
- [ ] Have the test matrix (PDF) open in another tab.
- [ ] Record Saturday or Sunday morning, not Sunday night.
- [ ] **Make sure Leo's AWS lab is on before you record.** When it's off, the site still loads but every clock-in fails with "Unexpected response from the clock-in service." Text Leo first.

| Name | ID 1 (Accepted) | ID 2 (Flagged) |
| --- | --- | --- |
| Leo | EMP-10492 (Grocery) | EMP-40215 (Produce) |
| Hadi | EMP-10577 (Front End) | EMP-40637 (Prepared Foods) |
| Andres | EMP-30118 (Prepared Foods) | EMP-40388 (Grocery) |
| Elizabeth | EMP-40512 (Front End) | EMP-40741 (Produce) |
| Leandro | EMP-40856 (Grocery) | EMP-40963 (Front End) |

## Show these, in this order (about 6 minutes)
1. **Intro (30 s):** Your name, what HALLE does, and how it's built: Amplify front end, API Gateway, Lambda, DynamoDB.
2. **Form validation, invalid input (45 s):** Submit with the department blank, then with a bad ID such as `EMP-123`. Point out that the form blocks the request and shows the exact error.
3. **Accepted, valid (45 s):** ID 1, matching department, Scheduled Shift Start = current time, no comment. Point out `Status: Accepted` and the confirmation number.
4. **Retrieve (30 s):** Paste that confirmation number into **Find Your Clock-In Transaction**. Show that the saved record comes back from the database.
5. **Duplicate block, business rule (30 s):** Submit ID 1 again. Expect `"Employee already has an open clock-in."`
6. **Comment required, business rule and boundary (30 s):** ID 2, shift start about 30 minutes before now, no comment. Expect the comment-required error. Explain that the window is +/- 15 minutes.
7. **Flagged, business rule (45 s):** Same ID 2, add a comment, submit. Show `Status: Flagged`, the reason, and the confirmation number.
8. **Rejected by the server, invalid (45 s):** Pick at least one (none of these get saved, so they don't use up your ID):
   - `EMP-99999` gives `"Employee ID not found."`
   - `EMP-20031` (Dana Ortiz) gives `"Employee is not active and cannot clock in."`
   - Your ID with the wrong department gives `"Department does not match employee record."`
9. **Unknown lookup (15 s):** Search a made-up confirmation number. Expect a "not found" message.
10. **Test matrix (60 s):** Walk through 3 or 4 rows of the matrix (one valid, one invalid, one boundary, one business rule) and their Expected vs. Actual results.
11. **Wrap-up (15 s):** Summarize what you showed and say which part of the build was yours.

## Timing tips
- Set the shift time last, right before you click Submit, and submit in the same minute. The system records the clock-in time when you submit.
- "Late" means a shift start before now (for example, now minus 20 min). "Early" means after now.
- Avoid the 15/16-minute edge cases on camera unless you're confident in your timing. One minute of drift changes the result. Use something clearly outside the window, like 30+ minutes.

## Submit (individually)
- [ ] App URL
- [ ] Test matrix (PDF or Excel from the repo's `Documents` folder)
- [ ] Your demo recording
