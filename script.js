function normalizePhone(num) {
  // Keep digits only
  return (num || '').replace(/\D/g, '');
}

function setupWhatsAppPurchase({ whatsappNumber, buttonId, formId }) {
  const btn = document.getElementById(buttonId);
  const form = document.getElementById(formId);
  if (!btn || !form) return;

  btn.addEventListener('click', () => {
    const student = form.elements['student']?.value?.trim() || '';
    const phone = form.elements['phone']?.value?.trim() || '';
    const note = form.elements['note']?.value?.trim() || '';

    const meta = window.BATCH_META || {};

    const lines = [];
    lines.push(`Hi Samrat's core physics 👋`);
    lines.push(`I want to enquire/purchase: ${meta.className || ''}`.trim());
    lines.push(`Location: ${meta.location || ''}`);
    lines.push(`Time: ${meta.time || ''}`);
    lines.push(`Fees: ${meta.fees || ''}`);

    if (student) lines.push(`Student name: ${student}`);
    if (phone) lines.push(`Phone: ${phone}`);
    if (note) lines.push(`Message: ${note}`);

    lines.push(`— Sent from website`);

    const message = lines.join('\n');
    const phoneDigits = normalizePhone(whatsappNumber);

    // WhatsApp click-to-chat
    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });
}

// ------------------------------
// Attendance (public view + admin)
// Stored in localStorage (static site). Admin gate is frontend-only.
// ------------------------------

const ATTENDANCE_ADMIN_PASSWORD = 'admin123'; // change if you want

function getClassKey(className) {
  return `attendance::${String(className || '').trim()}`;
}

function loadAttendance(className) {
  const key = getClassKey(className);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { students: [], records: {} };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : { students: [], records: {} };
  } catch {
    return { students: [], records: {} };
  }
}

function saveAttendance(className, data) {
  const key = getClassKey(className);
  localStorage.setItem(key, JSON.stringify(data));
}

function normalizeName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}

function sortDatesDesc(dates) {
  return [...dates].sort((a, b) => (a < b ? 1 : -1));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

function renderAttendanceTable({ className }) {
  const tableWrap = document.getElementById('attendanceTableWrap');
  if (!tableWrap) return;

  const data = loadAttendance(className);
  const students = Array.isArray(data.students) ? data.students : [];
  const records = data.records && typeof data.records === 'object' ? data.records : {};

  const dates = Object.keys(records);

  if (!dates.length || !students.length) {
    tableWrap.innerHTML = `
      <div class="attendance-empty">No attendance data yet.</div>
    `;
    return;
  }

  const sortedDates = sortDatesDesc(dates);

  // Build table: rows = students, cols = dates
  // To keep it readable, we limit max columns; admin can still add more.
  const maxCols = 10;
  const visibleDates = sortedDates.slice(0, maxCols);
  const hiddenCount = sortedDates.length - visibleDates.length;

  const headerCells = visibleDates.map((d) => `<th>${d}</th>`).join('');

  const bodyRows = students
    .map((s) => {
      const cells = visibleDates
        .map((d) => {
          const val = records?.[d]?.[s];
          const isPresent = val === true;
          const isAbsent = val === false;
          if (!isPresent && !isAbsent) return '<td class="attendance-blank">-</td>';
          return `<td class="${isPresent ? 'attendance-present' : 'attendance-absent'}">${
            isPresent ? 'P' : 'A'
          }</td>`;
        })
        .join('');

      return `<tr><th class="attendance-student">${escapeHtml(s)}</th>${cells}</tr>`;
    })
    .join('');

  tableWrap.innerHTML = `
    <div class="attendance-meta">Showing last ${visibleDates.length} dates$${
      hiddenCount > 0 ? ` (+${hiddenCount} more stored)` : ''
    }.</div>
    <div class="attendance-table-wrap">
      <table class="attendance-table">
        <thead>
          <tr>
            <th class="attendance-sticky">Student</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </div>
  `;
}

function setAdminMode(enabled) {
  const banner = document.getElementById('attendanceAdminBanner');
  const editor = document.getElementById('attendanceAdminEditor');
  if (banner) banner.style.display = enabled ? 'block' : 'none';
  if (editor) editor.style.display = enabled ? 'block' : 'none';
}

function isAdminUnlocked() {
  try {
    return localStorage.getItem('attendance::adminUnlocked') === '1';
  } catch {
    return false;
  }
}

function unlockAdmin({ password }) {
  if (String(password || '') === ATTENDANCE_ADMIN_PASSWORD) {
    try {
      localStorage.setItem('attendance::adminUnlocked', '1');
    } catch {}
    return true;
  }
  return false;
}

function lockAdmin() {
  try {
    localStorage.removeItem('attendance::adminUnlocked');
  } catch {}
}

function initAttendancePage({ className }) {
  const adminLoginBtn = document.getElementById('attendanceAdminLoginBtn');
  const adminLogoutBtn = document.getElementById('attendanceAdminLogoutBtn');
  const adminPasswordInput = document.getElementById('attendanceAdminPassword');

  const adminMessage = document.getElementById('attendanceAdminMessage');

  setAdminMode(isAdminUnlocked());

  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const pw = adminPasswordInput?.value;
      const ok = unlockAdmin({ password: pw });

      if (adminMessage) {
        adminMessage.textContent = ok ? 'Admin unlocked ✅' : 'Wrong password ❌';
        adminMessage.style.color = ok ? '#6AE4FF' : '#ff6a8a';
      }

      setAdminMode(ok);
      if (ok && adminPasswordInput) adminPasswordInput.value = '';
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      lockAdmin();
      setAdminMode(false);
      if (adminMessage) {
        adminMessage.textContent = 'Admin locked';
        adminMessage.style.color = '#EAF0FF';
      }
    });
  }

  // Render public table
  renderAttendanceTable({ className });

  // Admin: add students
  const addStudentsBtn = document.getElementById('attendanceAddStudentsBtn');
  const studentsInput = document.getElementById('attendanceStudentsInput');

  function populateStudentSelects() {
    const studentList = document.getElementById('attendanceStudentList');
    if (!studentList) return;

    const data = loadAttendance(className);
    const students = Array.isArray(data.students) ? data.students : [];

    studentList.innerHTML = students.length
      ? students
          .map(
            (s) => `
        <label class="attendance-checkbox">
          <input type="checkbox" name="attendanceStudent" value="${escapeHtml(
            s
          )}" />
          <span>${escapeHtml(s)}</span>
        </label>
      `
          )
          .join('')
      : `<div class="attendance-hint">Add students first (admin).</div>`;
  }

  if (addStudentsBtn && studentsInput) {
    addStudentsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const data = loadAttendance(className);
      const raw = studentsInput.value || '';
      const names = raw
        .split(/\n|,|;/)
        .map(normalizeName)
        .filter(Boolean);

      const existing = new Set((data.students || []).map(normalizeName));
      for (const n of names) existing.add(n);

      data.students = Array.from(existing).sort((a, b) => a.localeCompare(b));
      saveAttendance(className, data);

      studentsInput.value = '';
      populateStudentSelects();
      renderAttendanceTable({ className });
    });
  }

  // Admin: mark attendance
  const dateInput = document.getElementById('attendanceDateInput');
  const saveAttendanceBtn = document.getElementById('attendanceSaveBtn');

  if (saveAttendanceBtn && dateInput) {
    populateStudentSelects();

    saveAttendanceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const data = loadAttendance(className);
      data.students = Array.isArray(data.students) ? data.students : [];
      data.records = data.records && typeof data.records === 'object' ? data.records : {};

      const date = dateInput.value;
      if (!date) {
        if (adminMessage) {
          adminMessage.textContent = 'Select a date.';
          adminMessage.style.color = '#ff6a8a';
        }
        return;
      }

      const presentSet = new Set();
      const checkboxes = document.querySelectorAll('#attendanceStudentList input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        if (cb.checked) presentSet.add(cb.value);
      });

      const dayMap = {};
      for (const s of data.students) {
        dayMap[s] = presentSet.has(s) ? true : false;
      }

      data.records[date] = dayMap;
      saveAttendance(className, data);
      renderAttendanceTable({ className });

      if (adminMessage) {
        adminMessage.textContent = 'Attendance saved ✅';
        adminMessage.style.color = '#6AE4FF';
      }
    });
  }
}

