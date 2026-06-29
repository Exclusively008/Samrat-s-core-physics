Location selection UX improvement

How users select location:
- On Class pages (class9.html/class10.html/class11.html/class12.html), location is read from the URL query string:
  ?location=YOUR_LOCATION_KEY
- Example:
  class9.html?location=KESTHOPUR

What was changed:
- batches.html now links to each class page with a default location key, so users don’t land on a page with “Location not selected”.

Current defaults wired in batches.html:
- Class 9  -> class9.html?location=KESTHOPUR
- Class 10 -> class10.html?location=HATIBAGAN
- Class 11 -> class11.html?location=COLLEGE%20STREET
- Class 12 -> class12.html?location=KESTHOPUR

