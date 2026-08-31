// ============================================
// SAMRAT CORE PHYSICS - Admin Panel JavaScript
// Complete Firebase-powered Admin Management
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBX54xXhRmMigxdf_Lhw3SFGivzGAOXf04",
    authDomain: "my-try-327ea.firebaseapp.com",
    projectId: "my-try-327ea",
    storageBucket: "my-try-327ea.firebasestorage.app",
    messagingSenderId: "157605035524",
    appId: "1:157605035524:web:00bd79ac81b891cb11bf51",
    measurementId: "G-KQ7ZPGKZBC"
};

// Safety check: if Firebase scripts failed to load (e.g. offline/CDN blocked),
// show a clear error instead of a blank page.
if (typeof firebase === 'undefined') {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Failed to load Firebase. Check your internet connection and reload the page.';
    }
    throw new Error('Firebase SDK not loaded');
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Initialize AOS animations on page load (independent of auth state)
if (window.AOS) {
    window.AOS.init({ duration: 800, once: true });
}

// Batch Data
const batchData = {
    "Class 9": [
        { day: "Sunday", time: "7:45 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Monday", time: "5:00 PM", location: "Hatibagan", fee: "₹700/month" }
    ],
    "Class 10": [
        { day: "Sunday", time: "7:45 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Monday", time: "5:00 PM", location: "Hatibagan", fee: "₹700/month" },
        { day: "Thursday", time: "7:30 AM", location: "Kestopur", fee: "₹700/month" }
    ],
    "Class 11": [
        { day: "Sunday", time: "10:00 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Thursday", time: "8:45 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Wednesday", time: "7:30 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Sunday", time: "7:30 PM", location: "Kestopur", fee: "₹700/month" },
        { day: "Monday", time: "7:30 AM", location: "College Street", fee: "₹700/month" },
        { day: "Wednesday", time: "6:30 PM", location: "Kashi Bose Lane", fee: "₹700/month" },
        { day: "Tuesday", time: "5:15 PM", location: "Rajarhat", fee: "₹700/month" },
        { day: "Friday", time: "8:45 AM", location: "Rajarhat", fee: "₹700/month" }
    ],
    "Class 12": [
        { day: "Sunday", time: "11:45 AM", location: "Kestopur", fee: "₹700/month" },
        { day: "Thursday", time: "6:45 PM", location: "Kestopur", fee: "₹700/month" },
        { day: "Sunday", time: "5:00 PM", location: "Kestopur", fee: "₹700/month" },
        { day: "Tuesday", time: "7:30 AM", location: "College Street", fee: "₹700/month" },
        { day: "Friday", time: "7:00 PM", location: "Kashi Bose Lane", fee: "₹700/month" },
        { day: "Tuesday", time: "7:00 PM", location: "Rajarhat", fee: "₹700/month" },
        { day: "Friday", time: "7:30 AM", location: "Rajarhat", fee: "₹700/month" }
    ]
};

function getBatchId(cls, day, time, location) {
    return `${cls.replace(/\s+/g, '_')}_${day}_${time.replace(/[:\s]/g, '_')}_${location.replace(/\s+/g, '_')}`;
}

// ========== AUTH STATE MANAGEMENT ==========
auth.onAuthStateChanged(user => {
    const loginSection = document.getElementById('adminLogin');
    const dashboardSection = document.getElementById('adminDashboard');
    
    if (user) {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        
        // Set admin email in settings
        document.getElementById('adminEmail').value = user.email;
        
        // Load initial data
        loadDashboardStats();
        loadStudents();
        loadBatchList();
    } else {
        loginSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
    }
});

// ========== LOGIN ==========
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = "xyzxyz@gmail.com";
    const password = "password1234";
    const errorDiv = document.getElementById('loginError');
    
    try {
        errorDiv.style.display = 'none';
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = getAuthErrorMessage(error.code);
    }
});

function getAuthErrorMessage(code) {
    const messages = {
        'auth/user-not-found': 'No admin account found with this email',
        'auth/wrong-password': 'Invalid password. Please try again',
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/too-many-requests': 'Too many attempts. Please try again later'
    };
    return messages[code] || 'Login failed. Please check your credentials';
}

// ========== LOGOUT ==========
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await auth.signOut();
});

// ========== NAVIGATION ==========
document.querySelectorAll('.admin-nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;
        navigateTo(page);
    });
});

function navigateTo(page) {
    // Update sidebar
    document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.admin-nav-item[data-page="${page}"]`)?.classList.add('active');
    
    // Update pages
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');
    
    // Update title
    const titles = {
        dashboard: 'Dashboard',
        students: 'Students Management',
        attendance: 'Attendance Management',
        batches: 'Batch Management',
        reports: 'Reports & Analytics',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    
    // Close mobile sidebar
    document.getElementById('adminSidebar')?.classList.remove('open');
    
    // Load page-specific data
    if (page === 'students') loadStudents();
    if (page === 'batches') loadBatchList();
    if (page === 'reports') loadReportStats();
}

// Mobile sidebar toggle
document.getElementById('mobileSidebarToggle')?.addEventListener('click', () => {
    document.getElementById('adminSidebar')?.classList.toggle('open');
});

// ========== DASHBOARD STATS ==========
async function loadDashboardStats() {
    try {
        // Count students
        const studentsSnapshot = await db.collection('students').get();
        const totalStudents = studentsSnapshot.size;
        document.getElementById('totalStudents').textContent = totalStudents;
        
        // Count batches
        let totalBatches = 0;
        for (const cls of Object.keys(batchData)) {
            totalBatches += batchData[cls].length;
        }
        document.getElementById('totalBatches').textContent = totalBatches;
        
        // Today's attendance
        const today = new Date().toISOString().split('T')[0];
        let todayPresent = 0;
        let totalRecords = 0;
        
        const attendanceSnapshot = await db.collection('attendance').get();
        attendanceSnapshot.forEach(doc => {
            const data = doc.data();
            totalRecords += data.count || 0;
            
            // Check subcollections for today
            const classDoc = doc.id;
        });
        
        // Count today's present across all batches
        try {
            for (const cls of Object.keys(batchData)) {
                for (const batch of batchData[cls]) {
                    const batchId = getBatchId(cls, batch.day, batch.time, batch.location);
                    const todayQuery = await db.collection('attendance')
                        .doc(cls)
                        .collection(batchId)
                        .where('date', '==', today)
                        .where('status', '==', 'present')
                        .get();
                    todayPresent += todayQuery.size;
                }
            }
        } catch (e) {
            console.log('Error counting today attendance:', e);
        }
        
        document.getElementById('todayPresent').textContent = todayPresent;
        document.getElementById('totalRecords').textContent = totalRecords || '--';
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ========== STUDENT MANAGEMENT ==========
async function loadStudents() {
    const tbody = document.getElementById('studentsBody');
    const classFilter = document.getElementById('studentClassFilter')?.value;
    const searchFilter = document.getElementById('studentSearch')?.value?.toLowerCase();
    
    try {
        let query = db.collection('students').orderBy('createdAt', 'desc');
        
        if (classFilter) {
            query = query.where('class', '==', classFilter);
        }
        
        const snapshot = await query.get();
        let students = [];
        
        snapshot.forEach(doc => {
            students.push({ id: doc.id, ...doc.data() });
        });
        
        // Apply search filter
        if (searchFilter) {
            students = students.filter(s => 
                s.name?.toLowerCase().includes(searchFilter) ||
                s.parentName?.toLowerCase().includes(searchFilter) ||
                s.phone?.includes(searchFilter)
            );
        }
        
        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-users" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
                No students found
            </td></tr>`;
            return;
        }
        
        tbody.innerHTML = students.map((s, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${s.name || 'N/A'}</strong></td>
                <td><span class="admin-badge success">${s.class || 'N/A'}</span></td>
                <td>${s.parentName || 'N/A'}</td>
                <td>${s.phone || 'N/A'}</td>
                <td>${s.school || 'N/A'}</td>
                <td>${s.batch || 'N/A'}</td>
                <td>
                    <button class="btn-icon edit" onclick="showEditStudentModal('${s.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteStudent('${s.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading students:', error);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--danger);">
            Error loading students
        </td></tr>`;
    }
}

// Filter students
document.getElementById('studentClassFilter')?.addEventListener('change', loadStudents);

// Add Student Modal
function showAddStudentModal() {
    const modal = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h3><i class="fas fa-user-plus"></i> Add New Student</h3>
        <form id="addStudentForm">
            <div class="form-group">
                <label>Student Name *</label>
                <input type="text" class="form-control" id="sName" required>
            </div>
            <div class="form-group">
                <label>Parent's Name</label>
                <input type="text" class="form-control" id="sParent">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Class *</label>
                    <select class="form-control" id="sClass" required>
                        <option value="">Select</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Phone *</label>
                    <input type="tel" class="form-control" id="sPhone" required>
                </div>
            </div>
            <div class="form-group">
                <label>School Name</label>
                <input type="text" class="form-control" id="sSchool">
            </div>
            <div class="form-group">
                <label>Batch</label>
                <select class="form-control" id="sBatch">
                    <option value="">Select Batch</option>
                </select>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">
                    <i class="fas fa-save"></i> Save
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1; justify-content: center;">
                    Cancel
                </button>
            </div>
        </form>
    `;
    
    modal.classList.add('active');
    
    // Populate batch dropdown
    const classSelect = document.getElementById('sClass');
    const batchSelect = document.getElementById('sBatch');
    
    classSelect.addEventListener('change', () => {
        batchSelect.innerHTML = '<option value="">Select Batch</option>';
        if (classSelect.value && batchData[classSelect.value]) {
            batchData[classSelect.value].forEach(b => {
                const opt = document.createElement('option');
                opt.value = getBatchId(classSelect.value, b.day, b.time, b.location);
                opt.textContent = `${b.day} ${b.time} (${b.location})`;
                batchSelect.appendChild(opt);
            });
        }
    });
    
    // Handle submit
    document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addStudent();
    });
}

async function addStudent() {
    const studentData = {
        name: document.getElementById('sName').value.trim(),
        parentName: document.getElementById('sParent').value.trim(),
        class: document.getElementById('sClass').value,
        phone: document.getElementById('sPhone').value.trim(),
        school: document.getElementById('sSchool').value.trim(),
        batch: document.getElementById('sBatch').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('students').add(studentData);
        closeModal();
        loadStudents();
        loadDashboardStats();
        showNotification('Student added successfully!', 'success');
    } catch (error) {
        console.error('Error adding student:', error);
        showNotification('Error adding student', 'error');
    }
}

// Edit Student Modal
async function showEditStudentModal(studentId) {
    try {
        const doc = await db.collection('students').doc(studentId).get();
        if (!doc.exists) return;
        
        const student = doc.data();
        const modal = document.getElementById('modalOverlay');
        const content = document.getElementById('modalContent');
        
        content.innerHTML = `
            <h3><i class="fas fa-edit"></i> Edit Student</h3>
            <form id="editStudentForm">
                <div class="form-group">
                    <label>Student Name *</label>
                    <input type="text" class="form-control" id="esName" value="${student.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Parent's Name</label>
                    <input type="text" class="form-control" id="esParent" value="${student.parentName || ''}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Class *</label>
                        <select class="form-control" id="esClass" required>
                            <option value="Class 9" ${student.class === 'Class 9' ? 'selected' : ''}>Class 9</option>
                            <option value="Class 10" ${student.class === 'Class 10' ? 'selected' : ''}>Class 10</option>
                            <option value="Class 11" ${student.class === 'Class 11' ? 'selected' : ''}>Class 11</option>
                            <option value="Class 12" ${student.class === 'Class 12' ? 'selected' : ''}>Class 12</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Phone *</label>
                        <input type="tel" class="form-control" id="esPhone" value="${student.phone || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>School Name</label>
                    <input type="text" class="form-control" id="esSchool" value="${student.school || ''}">
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">
                        <i class="fas fa-save"></i> Update
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1; justify-content: center;">
                        Cancel
                    </button>
                </div>
            </form>
        `;
        
        modal.classList.add('active');
        
        document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateStudent(studentId);
        });
        
    } catch (error) {
        console.error('Error loading student:', error);
    }
}

async function updateStudent(studentId) {
    const studentData = {
        name: document.getElementById('esName').value.trim(),
        parentName: document.getElementById('esParent').value.trim(),
        class: document.getElementById('esClass').value,
        phone: document.getElementById('esPhone').value.trim(),
        school: document.getElementById('esSchool').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('students').doc(studentId).update(studentData);
        closeModal();
        loadStudents();
        showNotification('Student updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating student:', error);
        showNotification('Error updating student', 'error');
    }
}

async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
        await db.collection('students').doc(studentId).delete();
        loadStudents();
        loadDashboardStats();
        showNotification('Student deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Error deleting student', 'error');
    }
}

// ========== ATTENDANCE MANAGEMENT ==========
function updateAttendanceBatchFilter() {
    const classFilter = document.getElementById('attClassFilter');
    const batchFilter = document.getElementById('attBatchFilter');
    
    batchFilter.innerHTML = '<option value="">Select Batch</option>';
    
    if (classFilter.value && batchData[classFilter.value]) {
        batchData[classFilter.value].forEach(b => {
            const opt = document.createElement('option');
            opt.value = getBatchId(classFilter.value, b.day, b.time, b.location);
            opt.textContent = `${b.day} ${b.time} (${b.location})`;
            batchFilter.appendChild(opt);
        });
    }
}

function updateHistoryBatchFilter() {
    const classFilter = document.getElementById('histClassFilter');
    const batchFilter = document.getElementById('histBatchFilter');
    
    batchFilter.innerHTML = '<option value="">Select Batch</option>';
    
    if (classFilter.value && batchData[classFilter.value]) {
        batchData[classFilter.value].forEach(b => {
            const opt = document.createElement('option');
            opt.value = getBatchId(classFilter.value, b.day, b.time, b.location);
            opt.textContent = `${b.day} ${b.time} (${b.location})`;
            batchFilter.appendChild(opt);
        });
    }
}

async function loadAttendanceForMarking() {
    const classVal = document.getElementById('attClassFilter').value;
    const batchVal = document.getElementById('attBatchFilter').value;
    const dateVal = document.getElementById('attDate').value;
    const tbody = document.getElementById('attendanceMarkBody');
    
    if (!classVal || !batchVal || !dateVal) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">
            Please select class, batch and date
        </td></tr>`;
        return;
    }
    
    try {
        // Get students for this batch/class
        const studentsSnapshot = await db.collection('students')
            .where('class', '==', classVal)
            .get();
        
        const students = [];
        studentsSnapshot.forEach(doc => {
            students.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort alphabetically
        students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">
                No students found in this class
            </td></tr>`;
            return;
        }
        
        // Check for existing attendance for this date
        const existingSnapshot = await db.collection('attendance')
            .doc(classVal)
            .collection(batchVal)
            .where('date', '==', dateVal)
            .get();
        
        const existingAttendance = {};
        existingSnapshot.forEach(doc => {
            existingAttendance[doc.data().studentId] = {
                status: doc.data().status,
                remarks: doc.data().remarks || '',
                id: doc.id
            };
        });
        
        window.currentAttendanceData = {
            class: classVal,
            batch: batchVal,
            date: dateVal,
            students: students,
            existingRecords: existingAttendance
        };
        
        tbody.innerHTML = students.map((s, i) => {
            const existing = existingAttendance[s.id];
            const isPresent = existing?.status === 'present';
            const isAbsent = existing?.status === 'absent';
            const remarks = existing?.remarks || '';
            
            return `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${s.name}</strong></td>
                    <td>
                        <div class="checkbox-group">
                            <input type="radio" name="status_${s.id}" value="present" ${isPresent ? 'checked' : ''} 
                                onchange="updateAttendanceStatus('${s.id}', 'present')">
                        </div>
                    </td>
                    <td>
                        <div class="checkbox-group">
                            <input type="radio" name="status_${s.id}" value="absent" ${isAbsent ? 'checked' : ''}
                                onchange="updateAttendanceStatus('${s.id}', 'absent')">
                        </div>
                    </td>
                    <td>
                        <input type="text" class="form-control" style="padding: 6px 10px; font-size: 0.85rem;" 
                            placeholder="Remarks" value="${remarks}" 
                            onchange="updateAttendanceRemarks('${s.id}', this.value)">
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading attendance:', error);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--danger);">
            Error loading students
        </td></tr>`;
    }
}

// Track attendance changes
window.attendanceChanges = {};

function updateAttendanceStatus(studentId, status) {
    if (!window.attendanceChanges) window.attendanceChanges = {};
    if (!window.attendanceChanges[studentId]) window.attendanceChanges[studentId] = {};
    window.attendanceChanges[studentId].status = status;
    window.attendanceChanges[studentId].studentId = studentId;
}

function updateAttendanceRemarks(studentId, remarks) {
    if (!window.attendanceChanges) window.attendanceChanges = {};
    if (!window.attendanceChanges[studentId]) window.attendanceChanges[studentId] = {};
    window.attendanceChanges[studentId].remarks = remarks;
    window.attendanceChanges[studentId].studentId = studentId;
}

async function saveAttendance() {
    const data = window.currentAttendanceData;
    const changes = window.attendanceChanges;
    
    if (!data || !changes || Object.keys(changes).length === 0) {
        showNotification('No changes to save', 'warning');
        return;
    }
    
    try {
        const batch = db.batch();
        let savedCount = 0;
        
        for (const [studentId, change] of Object.entries(changes)) {
            if (!change.status) continue;
            
            const student = data.students.find(s => s.id === studentId);
            if (!student) continue;
            
            const recordData = {
                studentId: studentId,
                studentName: student.name,
                class: data.class,
                batch: data.batch,
                date: data.date,
                status: change.status,
                remarks: change.remarks || '',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Check if record exists
            const existingId = data.existingRecords[studentId]?.id;
            
            if (existingId) {
                batch.update(
                    db.collection('attendance').doc(data.class).collection(data.batch).doc(existingId),
                    { status: change.status, remarks: change.remarks || '', updatedAt: firebase.firestore.FieldValue.serverTimestamp() }
                );
            } else {
                batch.set(
                    db.collection('attendance').doc(data.class).collection(data.batch).doc(),
                    recordData
                );
            }
            savedCount++;
        }
        
        await batch.commit();
        
        // Update attendance count in parent doc
        const parentRef = db.collection('attendance').doc(data.class);
        const parentDoc = await parentRef.get();
        if (parentDoc.exists) {
            await parentRef.update({
                count: firebase.firestore.FieldValue.increment(savedCount),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await parentRef.set({
                class: data.class,
                count: savedCount,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        window.attendanceChanges = {};
        showNotification(`${savedCount} attendance records saved!`, 'success');
        loadAttendanceForMarking();
        loadDashboardStats();
        
    } catch (error) {
        console.error('Error saving attendance:', error);
        showNotification('Error saving attendance', 'error');
    }
}

// Attendance History
async function loadAttendanceHistory() {
    const classVal = document.getElementById('histClassFilter').value;
    const batchVal = document.getElementById('histBatchFilter').value;
    const dateFilter = document.getElementById('histDateFilter').value;
    const tbody = document.getElementById('attendanceHistoryBody');
    
    if (!classVal || !batchVal) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">
            Select class and batch
        </td></tr>`;
        return;
    }
    
    try {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem;"></i> Loading...
        </td></tr>`;
        
        let query = db.collection('attendance')
            .doc(classVal)
            .collection(batchVal)
            .orderBy('date', 'desc')
            .orderBy('studentName', 'asc');
        
        if (dateFilter) {
            query = query.where('date', '==', dateFilter);
        }
        
        const snapshot = await query.get();
        const records = [];
        
        snapshot.forEach(doc => {
            records.push({ id: doc.id, ...doc.data() });
        });
        
        if (records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">
                No attendance records found
            </td></tr>`;
            return;
        }
        
        // Group by date
        const grouped = {};
        records.forEach(r => {
            const date = r.date || 'Unknown';
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(r);
        });
        
        let html = '';
        let index = 1;
        
        for (const [date, recs] of Object.entries(grouped)) {
            html += `<tr style="background: rgba(26,35,126,0.05);">
                <td colspan="6" style="font-weight: 700; color: var(--primary); padding: 10px 18px;">
                    <i class="far fa-calendar-alt"></i> ${date}
                </td>
            </tr>`;
            
            recs.forEach(r => {
                const statusBadge = r.status === 'present' 
                    ? '<span class="admin-badge success"><i class="fas fa-check"></i> Present</span>'
                    : '<span class="admin-badge danger"><i class="fas fa-times"></i> Absent</span>';
                
                html += `<tr>
                    <td>${index++}</td>
                    <td>${r.studentName || 'Unknown'}</td>
                    <td>${r.date || '-'}</td>
                    <td>${statusBadge}</td>
                    <td>${r.remarks || '-'}</td>
                    <td>
                        <button class="btn-icon edit" onclick="editAttendanceRecord('${classVal}', '${batchVal}', '${r.id}', '${r.status}', '${r.remarks || ''}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteAttendanceRecord('${classVal}', '${batchVal}', '${r.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
            });
        }
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading attendance history:', error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--danger);">
            Error loading attendance history
        </td></tr>`;
    }
}

async function editAttendanceRecord(classVal, batchVal, recordId, currentStatus, currentRemarks) {
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    
    try {
        await db.collection('attendance')
            .doc(classVal)
            .collection(batchVal)
            .doc(recordId)
            .update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        showNotification(`Status changed to ${newStatus}`, 'success');
        loadAttendanceHistory();
    } catch (error) {
        console.error('Error updating attendance:', error);
        showNotification('Error updating attendance', 'error');
    }
}

async function deleteAttendanceRecord(classVal, batchVal, recordId) {
    if (!confirm('Delete this attendance record?')) return;
    
    try {
        await db.collection('attendance')
            .doc(classVal)
            .collection(batchVal)
            .doc(recordId)
            .delete();
        
        showNotification('Attendance record deleted', 'success');
        loadAttendanceHistory();
        loadDashboardStats();
    } catch (error) {
        console.error('Error deleting attendance:', error);
        showNotification('Error deleting attendance', 'error');
    }
}

// ========== BATCH MANAGEMENT ==========
async function loadBatchList() {
    const tbody = document.getElementById('batchesBody');
    
    let html = '';
    let index = 1;
    
    for (const [cls, batches] of Object.entries(batchData)) {
        batches.forEach(batch => {
            const batchId = getBatchId(cls, batch.day, batch.time, batch.location);
            html += `
                <tr>
                    <td><span class="admin-badge success">${cls}</span></td>
                    <td>${batch.day}</td>
                    <td>${batch.time}</td>
                    <td>${batch.location}</td>
                    <td>${batch.fee}</td>
                    <td><button class="btn btn-outline btn-sm" onclick="viewBatchStudents('${cls}', '${batchId}')">View</button></td>
                    <td>
                        <button class="btn-icon delete" onclick="archiveBatch('${cls}', '${batch.day}', '${batch.time}', '${batch.location}')" title="Archive">
                            <i class="fas fa-archive"></i>
                        </button>
                    </td>
                </tr>
            `;
            index++;
        });
    }
    
    tbody.innerHTML = html;
}

function showCreateBatchModal() {
    const modal = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h3><i class="fas fa-plus"></i> Create New Batch</h3>
        <form id="createBatchForm">
            <div class="form-group">
                <label>Class *</label>
                <select class="form-control" id="cbClass" required>
                    <option value="">Select Class</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Day *</label>
                    <select class="form-control" id="cbDay" required>
                        <option value="">Select Day</option>
                        <option value="Sunday">Sunday</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Time *</label>
                    <input type="text" class="form-control" id="cbTime" required placeholder="e.g., 7:45 AM">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Location *</label>
                    <input type="text" class="form-control" id="cbLocation" required placeholder="e.g., Kestopur">
                </div>
                <div class="form-group">
                    <label>Fee</label>
                    <input type="text" class="form-control" id="cbFee" value="₹700/month">
                </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">
                    <i class="fas fa-check"></i> Create
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1; justify-content: center;">
                    Cancel
                </button>
            </div>
        </form>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('createBatchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const cls = document.getElementById('cbClass').value;
        const day = document.getElementById('cbDay').value;
        const time = document.getElementById('cbTime').value;
        const location = document.getElementById('cbLocation').value;
        const fee = document.getElementById('cbFee').value;
        
        // Add to batchData
        if (!batchData[cls]) batchData[cls] = [];
        batchData[cls].push({ day, time, location, fee });
        
        closeModal();
        loadBatchList();
        showNotification(`Batch created for ${cls} - ${day} ${time}`, 'success');
    });
}

function archiveBatch(cls, day, time, location) {
    if (!confirm(`Archive ${cls} - ${day} ${time} (${location})?`)) return;
    
    if (batchData[cls]) {
        batchData[cls] = batchData[cls].filter(b => 
            !(b.day === day && b.time === time && b.location === location)
        );
        loadBatchList();
        showNotification('Batch archived successfully', 'success');
    }
}

async function viewBatchStudents(cls, batchId) {
    try {
        const snapshot = await db.collection('students')
            .where('class', '==', cls)
            .where('batch', '==', batchId)
            .get();
        
        const students = [];
        snapshot.forEach(doc => {
            students.push({ id: doc.id, ...doc.data() });
        });
        
        const modal = document.getElementById('modalOverlay');
        const content = document.getElementById('modalContent');
        
        content.innerHTML = `
            <h3><i class="fas fa-users"></i> Students in ${cls} - ${batchId.replace(/_/g, ' ')}</h3>
            <p style="margin-bottom: 15px; color: var(--text-light);">Total: ${students.length} students</p>
            ${students.length > 0 ? `
            <div class="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>School</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map((s, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${s.name}</td>
                                <td>${s.phone}</td>
                                <td>${s.school || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>` : '<p style="text-align: center; padding: 20px; color: var(--text-light);">No students enrolled</p>'}
            <div style="margin-top: 20px;">
                <button class="btn btn-secondary" onclick="closeModal()" style="width: 100%; justify-content: center;">
                    Close
                </button>
            </div>
        `;
        
        modal.classList.add('active');
        
    } catch (error) {
        console.error('Error loading batch students:', error);
        showNotification('Error loading students', 'error');
    }
}

// ========== REPORTS & EXPORTS ==========
async function loadReportStats() {
    const container = document.getElementById('reportStats');
    
    try {
        const studentsSnapshot = await db.collection('students').get();
        const totalStudents = studentsSnapshot.size;
        
        // Count per class
        const classCounts = {};
        studentsSnapshot.forEach(doc => {
            const cls = doc.data().class;
            classCounts[cls] = (classCounts[cls] || 0) + 1;
        });
        
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${totalStudents}</div>
                <div class="stat-label">Total Students</div>
            </div>
            ${Object.entries(classCounts).map(([cls, count]) => `
                <div class="stat-card">
                    <div class="stat-number">${count}</div>
                    <div class="stat-label">${cls}</div>
                </div>
            `).join('')}
        `;
        
    } catch (error) {
        console.error('Error loading report stats:', error);
    }
}

async function exportAttendance(format) {
    const classVal = prompt('Enter class (e.g., Class 11) or leave empty for all:');
    const batchVal = prompt('Enter batch ID or leave empty for all (to find batch IDs, check the attendance page):');
    
    try {
        let data = [];
        
        if (classVal && batchVal) {
            const snapshot = await db.collection('attendance')
                .doc(classVal)
                .collection(batchVal)
                .orderBy('date', 'desc')
                .orderBy('studentName', 'asc')
                .get();
            
            snapshot.forEach(doc => {
                data.push(doc.data());
            });
        } else {
            const classesSnapshot = await db.collection('attendance').get();
            
            for (const classDoc of classesSnapshot.docs) {
                const batchesSnapshot = await classDoc.ref.listCollections();
                
                for (const batchRef of batchesSnapshot) {
                    const recordsSnapshot = await batchRef.orderBy('date', 'desc').get();
                    recordsSnapshot.forEach(doc => {
                        data.push(doc.data());
                    });
                }
            }
        }
        
        if (data.length === 0) {
            showNotification('No data to export', 'warning');
            return;
        }
        
        // Create CSV
        const headers = ['Student Name', 'Class', 'Batch', 'Date', 'Status', 'Remarks'];
        const csvRows = [headers.join(',')];
        
        data.forEach(record => {
            const row = [
                `"${record.studentName || ''}"`,
                `"${record.class || ''}"`,
                `"${record.batch || ''}"`,
                `"${record.date || ''}"`,
                `"${record.status || ''}"`,
                `"${record.remarks || ''}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `Attendance_Export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        showNotification('Attendance exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting attendance:', error);
        showNotification('Error exporting attendance', 'error');
    }
}

// ========== MODAL ==========
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) {
        closeModal();
    }
});

// ========== NOTIFICATION ==========
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.admin-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: var(--radius-sm);
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--warning)'};
        color: white;
        font-weight: 600;
        z-index: 2000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
    `;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// ========== EXPOSE GLOBALLY ==========
window.navigateTo = navigateTo;
window.showAddStudentModal = showAddStudentModal;
window.showEditStudentModal = showEditStudentModal;
window.deleteStudent = deleteStudent;
window.loadStudents = loadStudents;
window.loadAttendanceForMarking = loadAttendanceForMarking;
window.updateAttendanceBatchFilter = updateAttendanceBatchFilter;
window.updateHistoryBatchFilter = updateHistoryBatchFilter;
window.updateAttendanceStatus = updateAttendanceStatus;
window.updateAttendanceRemarks = updateAttendanceRemarks;
window.saveAttendance = saveAttendance;
window.loadAttendanceHistory = loadAttendanceHistory;
window.editAttendanceRecord = editAttendanceRecord;
window.deleteAttendanceRecord = deleteAttendanceRecord;
window.loadBatchList = loadBatchList;
window.showCreateBatchModal = showCreateBatchModal;
window.archiveBatch = archiveBatch;
window.viewBatchStudents = viewBatchStudents;
window.exportAttendance = exportAttendance;
window.closeModal = closeModal;
window.loadReportStats = loadReportStats;

