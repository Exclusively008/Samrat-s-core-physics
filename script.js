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
// Stored in localStorage.
// ------------------------------

const ATTENDANCE_ADMIN_PASSWORD = 'admin123'; // UX gate only; localStorage is inherently client-side.

function getAttendanceKey({ className, location, time }) {
  const c = String(className || '').trim();
  const l = String(location || '').trim();
  const t = String(time || '').trim();
  return `attendance::${c}::${l}::${t}`;
}

function loadAttendance({ className, location, time }) {
  const key = getAttendanceKey({ className, location, time });
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { students: [], records: {} };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : { students: [], records: {} };
  } catch {
    return { students: [], records: {} };
  }
}

function saveAttendance({ className, location, time }, data) {
  const key = getAttendanceKey({ className, location, time });
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

function renderAttendanceTable({ className, location, time }) {
  const tableWrap = document.getElementById('attendanceTableWrap');
  if (!tableWrap) return;

  const data = loadAttendance({ className, location, time });
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
          return `<td class="${isPresent ? 'attendance-present' : 'attendance-absent'}">${isPresent ? 'P' : 'A'}</td>`;
        })
        .join('');

      return `<tr><th class="attendance-student">${escapeHtml(s)}</th>${cells}</tr>`;
    })
    .join('');

  tableWrap.innerHTML = `
    <div class="attendance-meta">Showing last ${visibleDates.length} dates${hiddenCount > 0 ? ` (+${hiddenCount} more stored)` : ''}.</div>
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
  const card = document.getElementById('attendanceAdminCard');
  const status = document.getElementById('attendanceAdminStatus');

  if (banner) banner.style.display = enabled ? 'block' : 'none';
  if (editor) editor.style.display = enabled ? 'block' : 'none';

  if (status) {
    status.textContent = enabled ? 'Unlocked' : 'Locked';
    status.classList.toggle('ok', !!enabled);
    status.classList.toggle('bad', !enabled);
  }

  // Keep admin body visible only when unlocked (modern accordion pattern)
  if (card) card.setAttribute('data-open', enabled ? 'true' : 'false');
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

function initAttendancePage({ className, location, time }) {
  const normalizedLocation = location ?? window.BATCH_META?.location ?? '';
  const normalizedTime = time ?? window.BATCH_META?.time ?? '';

  const adminLoginBtn = document.getElementById('attendanceAdminLoginBtn');
  const adminLogoutBtn = document.getElementById('attendanceAdminLogoutBtn');
  const adminPasswordInput = document.getElementById('attendanceAdminPassword');
  const adminMessage = document.getElementById('attendanceAdminMessage');

  // Admin UX unlock gate (not secure; for true security use server-side / auth rules)
  setAdminMode(isAdminUnlocked());

  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const pw = adminPasswordInput?.value;
      const ok = unlockAdmin({ password: pw });

      // Modern accordion feedback
      if (adminMessage) {
        adminMessage.textContent = ok ? 'Admin unlocked ✅' : 'Wrong password ❌';
        adminMessage.style.color = ok ? '#6AE4FF' : '#ff6a8a';
      }

      setAdminMode(ok);
      if (ok && adminPasswordInput) adminPasswordInput.value = '';

      // Open accordion when unlocked
      const card = document.getElementById('attendanceAdminCard');
      if (card) card.setAttribute('data-open', ok ? 'true' : 'false');
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

      const card = document.getElementById('attendanceAdminCard');
      if (card) card.setAttribute('data-open', 'false');
    });
  }


  // Context
  location = normalizedLocation;
  time = normalizedTime;

  // Public render
  renderAttendanceTable({ className, location, time });

  // Admin add students
  const addStudentsBtn = document.getElementById('attendanceAddStudentsBtn');
  const studentsInput = document.getElementById('attendanceStudentsInput');

  function populateStudentSelects() {
    const studentList = document.getElementById('attendanceStudentList');
    if (!studentList) return;

    const data = loadAttendance({ className, location, time });
    const students = Array.isArray(data.students) ? data.students : [];

    studentList.innerHTML = students.length
      ? students
          .map(
            (s) => `
        <label class="attendance-checkbox">
          <input type="checkbox" name="attendanceStudent" value="${escapeHtml(s)}" />
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
      const data = loadAttendance({ className, location, time });
      const raw = studentsInput.value || '';

      const names = raw
        .split(/\n|,|;/)
        .map(normalizeName)
        .filter(Boolean);

      const existing = new Set((data.students || []).map(normalizeName));
      for (const n of names) existing.add(n);

      data.students = Array.from(existing).sort((a, b) => a.localeCompare(b));
      saveAttendance({ className, location, time }, data);

      studentsInput.value = '';
      populateStudentSelects();
      renderAttendanceTable({ className, location, time });
    });
  }

  // Admin mark attendance
  const dateInput = document.getElementById('attendanceDateInput');
  const saveAttendanceBtn = document.getElementById('attendanceSaveBtn');

  if (saveAttendanceBtn && dateInput) {
    populateStudentSelects();

    const deleteStudentSelect = document.getElementById('attendanceDeleteStudentSelect');
    const deleteStudentBtn = document.getElementById('attendanceDeleteStudentBtn');

    function populateDeleteStudentSelect() {
      if (!deleteStudentSelect) return;
      const data = loadAttendance({ className, location, time });
      const students = Array.isArray(data.students) ? data.students : [];
      const opts = ['<option value="">-- Select student --</option>']
        .concat(students.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`));
      deleteStudentSelect.innerHTML = opts.join('');
    }

    populateDeleteStudentSelect();

    if (deleteStudentBtn && deleteStudentSelect) {
      deleteStudentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isAdminUnlocked()) {
          if (adminMessage) {
            adminMessage.textContent = 'Unlock admin to delete.';
            adminMessage.style.color = '#ff6a8a';
          }
          return;
        }

        const selectedStudent = deleteStudentSelect.value;
        if (!selectedStudent) {
          if (adminMessage) {
            adminMessage.textContent = 'Select a student to delete.';
            adminMessage.style.color = '#ff6a8a';
          }
          return;
        }

        const data = loadAttendance({ className, location, time });
        const records = data.records && typeof data.records === 'object' ? data.records : {};

        const dates = Object.keys(records);
        for (const dt of dates) {
          if (records[dt] && Object.prototype.hasOwnProperty.call(records[dt], selectedStudent)) {
            delete records[dt][selectedStudent];
          }
        }

        data.records = records;
        saveAttendance({ className, location, time }, data);
        renderAttendanceTable({ className, location, time });
        populateDeleteStudentSelect();

        if (adminMessage) {
          adminMessage.textContent = 'Student attendance entries deleted ✅';
          adminMessage.style.color = '#6AE4FF';
        }
      });

      deleteStudentSelect.addEventListener('focus', () => populateDeleteStudentSelect());
    }

    saveAttendanceBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const data = loadAttendance({ className, location, time });
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
      saveAttendance({ className, location, time }, data);
      renderAttendanceTable({ className, location, time });

      if (adminMessage) {
        adminMessage.textContent = 'Attendance saved ✅';
        adminMessage.style.color = '#6AE4FF';
      }
    });
  }
}

