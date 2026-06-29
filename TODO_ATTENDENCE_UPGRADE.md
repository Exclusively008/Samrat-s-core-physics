# Attendance system upgrade checklist (Firestore)

- [ ] Inspect current `script.js` attendance data model + UI hooks
- [ ] Choose Firestore collection schema
  - [ ] Public read path for attendance tables
  - [ ] Admin write path for students + attendance
- [ ] Add Firebase/Firestore initialization to `script.js`
  - [ ] Use project-local `firebaseConfig`
- [ ] Replace `loadAttendance/saveAttendance` to use Firestore (deferred; staying localStorage as requested)

  - [ ] Read attendance: list students + records
  - [ ] Write attendance: upsert date record from admin UI
  - [ ] Delete student attendance: delete across all stored dates
- [ ] Add Firebase init guidance (README)
- [ ] Add Firestore security rules
  - [ ] Public read allowed
  - [ ] Admin write/delete allowed only for authenticated admin users (custom claims)
- [ ] Remove/limit localStorage attendance persistence
- [ ] Manual smoke test
  - [ ] Public read works for all classes/locations/times
  - [ ] Admin add students + save attendance works
  - [ ] Admin delete student works
  - [ ] Unauthorized write fails (rules)
- [ ] Update this file with completion

