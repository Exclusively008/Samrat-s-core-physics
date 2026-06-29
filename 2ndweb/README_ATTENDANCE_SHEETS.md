# Attendance sheets by Batch + Location

This project stores attendance in Firestore per **(className, location, time)**.

## What was added
- `attendance_sheets.html`: quick links to open the attendance view for each **Class + Location**.

## How to use
1. Open `attendance_sheets.html`.
2. Click a card for the desired class and location.
3. The destination page (`class9.html`/`class10.html`/`class11.html`/`class12.html`) loads that location via `?location=` and renders attendance for the selected time.

## Notes
- The UI already renders a table based on `window.BATCH_META` and `initAttendancePage()`.
- Admin actions should write to Firestore (still pending full refactor in this branch). 

