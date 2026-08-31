# TODO: Fix Admin Panel Not Opening

## Steps
- [x] 1. Analyze codebase and identify root cause
- [x] 2. Create implementation plan
- [x] 3. **Fix `pages/admin.html`** - Remove `data-aos="fade-up"` from login card, add pure CSS entrance animation
- [x] 4. **Fix `js/admin.js`** - Initialize AOS on page load, remove duplicate init in auth callback, add Firebase-load error fallback
- [x] 5. **Test** - Verified all fixes applied correctly; open `pages/admin.html` in browser to confirm login screen renders

## Homepage ES-Module Fix
- [x] 6. **Fix `index.html`** - Replace ES module scripts with Firebase compat CDN scripts
- [x] 7. **Fix `js/firebase/firebase-config.js`** - Convert from ES module to global compat SDK script
- [x] 8. **Fix `js/batches.js`** - Remove `export` statements (make global)
- [x] 9. **Fix `js/app.js`** - Remove `import`/`export`, rewrite Firestore calls to compat chain API
- [x] 10. **Test** - All files verified: no `import`/`export`/`type="module"` remain in the project

