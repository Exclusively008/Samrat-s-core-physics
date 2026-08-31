// ============================================
// SAMRAT CORE PHYSICS - Main Public Application
// Uses Firebase compat SDK (globals: firebase, auth, db, storage)
// ============================================

// NOTE: `db` is provided globally by js/firebase/firebase-config.js
// NOTE: `batchData`, `getBatchId`, `getAllBatches` are provided globally by js/batches.js

// ========== BATCHES DISPLAY ==========
function renderBatches(className = 'Class 9') {
    const grid = document.getElementById('batchesGrid');
    if (!grid) return;
    
    const batches = batchData[className] || [];
    
    grid.innerHTML = batches.map((batch, index) => `
        <div class="batch-card" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="batch-class">${className}</div>
            <div class="batch-details">
                <div class="batch-detail">
                    <i class="fas fa-calendar-day"></i>
                    <span>${batch.day}</span>
                </div>
                <div class="batch-detail">
                    <i class="fas fa-clock"></i>
                    <span>${batch.time}</span>
                </div>
                <div class="batch-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${batch.location}</span>
                </div>
            </div>
            <div class="batch-fee">${batch.fee}</div>
            <div class="batch-actions">
                <a href="#admission" class="btn btn-primary btn-sm">
                    <i class="fas fa-sign-in-alt"></i> Join Batch
                </a>
                <a href="https://wa.me/918981638647?text=${encodeURIComponent(`Hi, I want to join ${className} - ${batch.day} ${batch.time} at ${batch.location}`)}" target="_blank" class="btn btn-outline btn-sm">
                    <i class="fab fa-whatsapp"></i> Enquire
                </a>
            </div>
        </div>
    `).join('');
    
    // Reinitialize AOS for new elements
    if (window.AOS) {
        window.AOS.refresh();
    }
}

// ========== CLASS TABS ==========
function initClassTabs() {
    const tabs = document.querySelectorAll('.class-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderBatches(tab.dataset.class);
        });
    });
}

// ========== ADMISSION FORM ==========
function updateBatchOptions() {
    const classSelect = document.getElementById('classSelect');
    const batchSelect = document.getElementById('preferredBatch');
    if (!classSelect || !batchSelect) return;
    
    const selectedClass = classSelect.value;
    batchSelect.innerHTML = '<option value="">Select Preferred Batch</option>';
    
    if (selectedClass && batchData[selectedClass]) {
        batchData[selectedClass].forEach(batch => {
            const option = document.createElement('option');
            const value = `${selectedClass} - ${batch.day} ${batch.time} (${batch.location})`;
            option.value = value;
            option.textContent = value;
            batchSelect.appendChild(option);
        });
    }
}

function submitAdmission(event) {
    event.preventDefault();
    
    const studentName = document.getElementById('studentName').value.trim();
    const parentName = document.getElementById('parentName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const whatsappNumber = document.getElementById('whatsappNumber').value.trim();
    const classVal = document.getElementById('classSelect').value;
    const schoolName = document.getElementById('schoolName').value.trim();
    const address = document.getElementById('address').value.trim();
    const preferredBatch = document.getElementById('preferredBatch').value;
    
    const message = `*New Admission Enquiry - Samrat Core Physics*
    
*Student Name:* ${studentName}
*Parent's Name:* ${parentName}
*Phone Number:* ${phoneNumber}
*WhatsApp Number:* ${whatsappNumber}
*Class:* ${classVal}
*School Name:* ${schoolName}
*Address:* ${address}
*Preferred Batch:* ${preferredBatch}
    
Thank you for choosing Samrat Core Physics!`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/918981638647?text=${encoded}`, '_blank');
}

// ========== CONTACT FORM ==========
function submitContact(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    const contactMessage = `*Contact Enquiry - Samrat Core Physics*
    
*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone}
*Message:* ${message}`;
    
    const encoded = encodeURIComponent(contactMessage);
    window.open(`https://wa.me/918981638647?text=${encoded}`, '_blank');
    
    event.target.reset();
}

// ========== ATTENDANCE VIEWING (Public) ==========
async function loadAttendance() {
    const classFilter = document.getElementById('attendanceClassFilter')?.value;
    const batchFilter = document.getElementById('attendanceBatchFilter')?.value;
    const dateFilter = document.getElementById('attendanceDateFilter')?.value;
    const searchFilter = document.getElementById('attendanceSearch')?.value?.toLowerCase();
    const tbody = document.getElementById('attendanceBody');
    
    if (!classFilter || !batchFilter) {
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-search" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
                Please select a class and batch
            </td></tr>`;
        }
        return;
    }
    
    try {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary);"></i>
            <p style="margin-top: 10px; color: var(--text-light);">Loading attendance...</p>
        </td></tr>`;
        
        let q = db.collection('attendance')
            .doc(classFilter)
            .collection(batchFilter)
            .orderBy('date', 'desc')
            .orderBy('studentName', 'asc');
        
        // If date filter is applied
        if (dateFilter) {
            const dateObj = new Date(dateFilter);
            q = db.collection('attendance')
                .doc(classFilter)
                .collection(batchFilter)
                .where('date', '==', dateObj.toISOString().split('T')[0])
                .orderBy('studentName', 'asc');
        }
        
        const snapshot = await q.get();
        const records = [];
        
        snapshot.forEach(doc => {
            records.push({ id: doc.id, ...doc.data() });
        });
        
        // Search filter
        const filtered = searchFilter 
            ? records.filter(r => r.studentName?.toLowerCase().includes(searchFilter))
            : records;
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
                No attendance records found
            </td></tr>`;
            return;
        }
        
        // Group by date
        const grouped = {};
        filtered.forEach(record => {
            const date = record.date || 'Unknown';
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(record);
        });
        
        let html = '';
        let index = 1;
        
        for (const [date, records] of Object.entries(grouped)) {
            html += `<tr style="background: rgba(26,35,126,0.05);"><td colspan="5" style="font-weight: 700; color: var(--primary); padding: 10px 20px;">
                <i class="far fa-calendar-alt"></i> ${date}
            </td></tr>`;
            
            records.forEach(record => {
                const status = record.status === 'present' 
                    ? '<span class="status-present"><i class="fas fa-check-circle"></i> Present</span>'
                    : '<span class="status-absent"><i class="fas fa-times-circle"></i> Absent</span>';
                html += `<tr>
                    <td>${index++}</td>
                    <td>${record.studentName || 'Unknown'}</td>
                    <td>${status}</td>
                    <td>${record.date || '-'}</td>
                    <td>${record.remarks || '-'}</td>
                </tr>`;
            });
        }
        
        tbody.innerHTML = html;
    } catch (error) {
        console.error('Error loading attendance:', error);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--danger);">
            <i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
            Error loading attendance. Please try again.
        </td></tr>`;
    }
}

// Update batch filter when class changes
function initAttendanceFilters() {
    const classFilter = document.getElementById('attendanceClassFilter');
    const batchFilter = document.getElementById('attendanceBatchFilter');
    
    if (classFilter && batchFilter) {
        classFilter.addEventListener('change', () => {
            const selectedClass = classFilter.value;
            batchFilter.innerHTML = '<option value="">Select Batch</option>';
            
            if (selectedClass && batchData[selectedClass]) {
                batchData[selectedClass].forEach(batch => {
                    const option = document.createElement('option');
                    const value = getBatchId(selectedClass, batch.day, batch.time, batch.location);
                    option.value = value;
                    option.textContent = `${batch.day} - ${batch.time} (${batch.location})`;
                    batchFilter.appendChild(option);
                });
            }
        });
    }
}

// ========== FAQ TOGGLE ==========
function toggleFaq(element) {
    const item = element.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('active');
    });
    
    // Open clicked one if it wasn't active
    if (!isActive) {
        item.classList.add('active');
    }
}

// ========== EXPOSE GLOBALLY ==========
window.renderBatches = renderBatches;
window.initClassTabs = initClassTabs;
window.updateBatchOptions = updateBatchOptions;
window.submitAdmission = submitAdmission;
window.submitContact = submitContact;
window.loadAttendance = loadAttendance;
window.toggleFaq = toggleFaq;
window.initAttendanceFilters = initAttendanceFilters;

