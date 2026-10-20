function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#39;"}[ch]));
}

// Data Manager Class
class DataManager {
    constructor() {
        this.storageKey = 'caFinalTrackerData';
        this.data = this.loadData();
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);

                // Repair old chapter values without resetting study progress.
                ['AFM', 'Audit'].forEach(subject => {
                    const chapters = data.subjects?.[subject] || [];

                    chapters.forEach((item, index) => {
                        if (
                            typeof item.chapter === 'string' &&
                            (item.chapter.startsWith('=') ||
                             /^\d{4}-\d{2}-\d{2}/.test(item.chapter))
                        ) {
                            item.chapter = String(index + 1);
                        }
                    });
                });

                // Repair the zero-hour Audit placeholder created by the earlier syllabus import.
                // Prefer the browser's pre-migration backup when available so existing progress is retained.
                const auditRows = data.subjects?.Audit || [];
                const auditIsZeroHourPlaceholder = auditRows.length > 0 &&
                    auditRows.every(item => (Number(item.duration) || 0) === 0);

                if (auditIsZeroHourPlaceholder && (initialData.subjects?.Audit || []).some(item => (Number(item.duration) || 0) > 0)) {
                    let sourceAudit = initialData.subjects.Audit;
                    try {
                        const backupText = localStorage.getItem('caFinalTrackerData_before_syllabus_migration');
                        if (backupText) {
                            const backupData = JSON.parse(backupText);
                            if ((backupData.subjects?.Audit || []).some(item => (Number(item.duration) || 0) > 0)) {
                                sourceAudit = backupData.subjects.Audit;
                            }
                        }
                    } catch (backupError) {
                        console.warn('Could not read pre-migration backup; using the original Audit syllabus.', backupError);
                    }

                    const normalizeTopic = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    data.subjects.Audit = sourceAudit.map((chapter, index) => {
                        const previous = auditRows.find(item => normalizeTopic(item.topic) === normalizeTopic(chapter.topic));
                        return {
                            ...chapter,
                            chapter: String(chapter.chapter || index + 1),
                            status: previous?.status || chapter.status || 'Pending',
                            selfStudy: previous?.selfStudy || chapter.selfStudy || 'Pending',
                            rev1: previous?.rev1 || chapter.rev1 || 'Pending',
                            rev2: previous?.rev2 || chapter.rev2 || 'Pending',
                            rev3: previous?.rev3 || chapter.rev3 || 'Pending',
                            notes: previous?.notes || chapter.notes || ''
                        };
                    });
                }

                // Migrate the legacy 19-chapter Audit list to the planner's 33 topic groups.
                // Keep saved statuses/revisions/notes and the source's verified lecture durations.
                const savedAudit = data.subjects?.Audit || [];
                const plannerAudit = initialData.subjects?.Audit || [];
                const isLegacyAudit = savedAudit.length === 19 &&
                    savedAudit.some(item => String(item.topic || '').includes('Ch 1: Quality Control')) &&
                    plannerAudit.length === 33;

                if (isLegacyAudit) {
                    const mapping = [
                        { old: /quality control/i, targets: ['SQC 1'] },
                        { old: /general audit/i, targets: ['Basic'] },
                        { old: /audit planning/i, targets: ['Audit Plan'] },
                        { old: /risk assessment/i, targets: ['SA 320, SA 530 and SA 450'] },
                        { old: /audit evidence/i, targets: ['SA 500, SA 501, SA 505, SA 510 and SA 560'] },
                        { old: /completion/i, targets: ['SA 570 and SA 580'] },
                        { old: /audit report|caro/i, targets: ['SA 700, SA 701, SA 705, SA 706, SA 710 and SA 720', 'CARO 2020'] },
                        { old: /special areas/i, targets: ['PSU Audit', 'Due Diligence', 'Forensic Audit'] },
                        { old: /related service/i, targets: ['SRE 2400 and SRE 2410', 'SAE 3400, SAE 3420, SRS 4400 and SRS 4410'] },
                        { old: /review of fi/i, targets: ['SRE 2400 and SRE 2410'] },
                        { old: /assurance service/i, targets: ['SAE 3402 and SA 520'] },
                        { old: /digital audit/i, targets: ['Digital Audit — 5 videos'] },
                        { old: /group audit/i, targets: ['Group Audit and SA 600'] },
                        { old: /bank audit|nbfc/i, targets: ['Bank Audit', 'NBFC'] },
                        { old: /psu audit/i, targets: ['PSU Audit'] },
                        { old: /internal audit/i, targets: ['Internal Audit and SA 610'] },
                        { old: /ddi|forensic/i, targets: ['Due Diligence', 'Forensic Audit'] },
                        { old: /esg/i, targets: ['ESG and ESG Case Study'] },
                        { old: /professional ethics/i, targets: ['Professional Ethics'] }
                    ];

                    const migratedAudit = plannerAudit.map((chapter, index) => ({
                        ...chapter,
                        chapter: String(index + 1),
                        status: chapter.status || 'Pending',
                        selfStudy: chapter.selfStudy || 'Pending',
                        rev1: chapter.rev1 || 'Pending',
                        rev2: chapter.rev2 || 'Pending',
                        rev3: chapter.rev3 || 'Pending',
                        notes: chapter.notes || ''
                    }));

                    savedAudit.forEach(oldChapter => {
                        const rule = mapping.find(item => item.old.test(oldChapter.topic || ''));
                        if (!rule) return;
                        rule.targets.forEach(target => {
                            const next = migratedAudit.find(item => item.topic === target);
                            if (!next) return;
                            if (oldChapter.status && oldChapter.status !== 'Pending') next.status = oldChapter.status;
                            if (oldChapter.selfStudy && oldChapter.selfStudy !== 'Pending') next.selfStudy = oldChapter.selfStudy;
                            if (oldChapter.rev1 && oldChapter.rev1 !== 'Pending') next.rev1 = oldChapter.rev1;
                            if (oldChapter.rev2 && oldChapter.rev2 !== 'Pending') next.rev2 = oldChapter.rev2;
                            if (oldChapter.rev3 && oldChapter.rev3 !== 'Pending') next.rev3 = oldChapter.rev3;
                            if (oldChapter.notes) next.notes = oldChapter.notes;
                        });
                    });

                    data.subjects.Audit = migratedAudit;
                }

                localStorage.setItem(this.storageKey, JSON.stringify(data));
                return data;
            } catch (e) {
                console.error("Saved tracker data is corrupted; refusing to overwrite it.", e);
                alert("Saved tracker data could not be read. Restore your JSON backup before continuing.");
                throw new Error("Corrupted saved tracker data");
            }
        }

        return this.getDefaultData();
    }

    getDefaultData() {
        // Deep copy of initialData from data.js
        return JSON.parse(JSON.stringify(initialData));
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    resetData() {
        this.data = this.getDefaultData();
        this.saveData();
    }

    // Update specific chapter
    updateChapter(subject, index, updates) {
        this.data.subjects[subject][index] = { ...this.data.subjects[subject][index], ...updates };
        this.saveData();
    }

    // Add study log
    addStudyLog(entry) {
        if (!this.data.studyLog) this.data.studyLog = [];
        this.data.studyLog.unshift({ id: Date.now(), ...entry });
        this.saveData();
    }

    deleteStudyLog(id) {
        if (!this.data.studyLog) return;
        this.data.studyLog = this.data.studyLog.filter(log => log.id !== id);
        this.saveData();
    }

    // Update test paper
    updateTestPaper(subject, index, updates) {
        this.data.testPapers[subject][index] = { ...this.data.testPapers[subject][index], ...updates };
        this.saveData();
    }
}

// Global instances
const dm = new DataManager();
const subjectsList = ['FR', 'AFM', 'Audit', 'DT', 'IDT'];

// Navigation
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('data-target');

            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById('subject-views-container').innerHTML = '';

            if (targetId.startsWith('subject-')) {
                const subject = targetId.replace('subject-', '');
                renderSubjectView(subject);
            } else {
                const targetSection = document.getElementById(targetId);
                if (targetSection) targetSection.classList.add('active');
            }

            if (targetId === 'dashboard') renderDashboard();
            if (targetId === 'study-log') renderStudyLog();
            if (targetId === 'test-papers') renderTestPapers();
        });
    });

    renderDashboard();
    initSettings();
});

// Calculate Overall Statistics
function calculateStats() {
    let totalLectures = 0;
    let completedLectures = 0;
    let totalDuration = 0;
    let completedDuration = 0;

    const subjectStats = {};

    subjectsList.forEach(subject => {
        const chapters = dm.data.subjects[subject] || [];
        let sTotal = 0;
        let sCompleted = 0;
        let sDurationTotal = 0;
        let sDurationCompleted = 0;

        chapters.forEach(ch => {
            sTotal += (ch.lectures || 0);
            sDurationTotal += (ch.duration || 0);
            if (ch.status === 'Completed') {
                sCompleted += (ch.lectures || 0);
                sDurationCompleted += (ch.duration || 0);
            }
        });

        totalLectures += sTotal;
        completedLectures += sCompleted;
        totalDuration += sDurationTotal;
        completedDuration += sDurationCompleted;

        subjectStats[subject] = {
            completionPct: sTotal > 0 ? (sCompleted / sTotal) * 100 : 0,
            hoursPct: sDurationTotal > 0 ? (sDurationCompleted / sDurationTotal) * 100 : 0
        };
    });

    const overallPct = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

    let todayActual = 0;
    let weekActual = 0;

    const logs = dm.data.studyLog || [];
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    logs.forEach(log => {
        const totalLogHrs = parseFloat(log.lectureHours) + parseFloat(log.selfStudyHours) + parseFloat(log.revisionHours);
        if (log.date === today) todayActual += totalLogHrs;
        if (new Date(log.date) >= weekAgo) weekActual += totalLogHrs;
    });

    return {
        overallPct,
        totalDuration,
        completedDuration,
        subjectStats,
        todayActual,
        weekActual
    };
}

// Render Dashboard
function renderDashboard() {
    const stats = calculateStats();

    const circle = document.getElementById('overall-progress-circle');
    const text = document.getElementById('overall-progress-text');
    const pct = Math.round(stats.overallPct);
    circle.style.strokeDasharray = `${pct}, 100`;
    text.textContent = `${pct}%`;

    document.getElementById('total-hours').textContent = Math.round(stats.totalDuration);
    document.getElementById('completed-hours').textContent = Math.round(stats.completedDuration);
    document.getElementById('remaining-hours').textContent = Math.round(stats.totalDuration - stats.completedDuration);

    const hrPct = stats.totalDuration > 0 ? (stats.completedDuration / stats.totalDuration) * 100 : 0;
    document.getElementById('hours-progress-bar').style.width = `${hrPct}%`;

    document.getElementById('today-actual').textContent = stats.todayActual.toFixed(1);
    document.getElementById('week-actual').textContent = stats.weekActual.toFixed(1);

    const grid = document.getElementById('dashboard-subjects-grid');
    grid.innerHTML = '';

    const groups = {
        'Group 1': ['FR', 'AFM', 'Audit'],
        'Group 2': ['DT', 'IDT']
    };

    Object.entries(groups).forEach(([groupName, subjects]) => {
        grid.innerHTML += `
            <div style="grid-column:1/-1;margin-top:18px;">
                <h3>${groupName}</h3>
                <p style="color:var(--text-secondary,#aaa);margin-top:4px;">${subjects.join(' · ')}</p>
            </div>
        `;

        subjects.forEach(subject => {
            const subjStat = stats.subjectStats[subject];
            const pctVal = Math.round(subjStat.completionPct);
            const chapters = dm.data.subjects[subject] || [];
            const totalHours = chapters.reduce((sum, ch) => sum + (Number(ch.duration) || 0), 0);
            const completedHours = chapters.reduce((sum, ch) => sum + (ch.status === 'Completed' ? (Number(ch.duration) || 0) : 0), 0);
            const plannedLabel = subject === 'DT' ? 'Approx. 250 hrs' :
                subject === 'IDT' ? 'Approx. 120 hrs' : `${Math.round(totalHours)} hrs from chapter data`;

            grid.innerHTML += `
                <div class="card">
                    <h4>${subject}</h4>
                    <div class="progress-bar-container mt-2 mb-2" style="background-color:#444;">
                        <div class="progress-bar" style="width:${pctVal}%"></div>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Class completion:</span>
                        <span class="stat-value">${pctVal}%</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Planned duration:</span>
                        <span class="stat-value">${plannedLabel}</span>
                    </div>
                    ${totalHours > 0 ? `<div class="stat-row">
                        <span class="stat-label">Completed class hours:</span>
                        <span class="stat-value">${Math.round(completedHours)} / ${Math.round(totalHours)} hrs</span>
                    </div>` : ''}
                </div>
            `;
        });
    });

    updateCountdown();
}
function updateCountdown() {
    const userExamDate = dm.data.examDate || '2027-05-01T00:00:00';
    const examDate = new Date(userExamDate).getTime();
    const now = new Date().getTime();
    const distance = examDate - now;

    const label = document.querySelector('.countdown-label');
    if (label) {
        const d = new Date(userExamDate);
        const options = { month: 'long', year: 'numeric' };
        label.textContent = d.toLocaleDateString('en-US', options) + ' Exams';
    }

    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        document.getElementById('countdown-days').textContent = `${days} Days`;
    } else {
        document.getElementById('countdown-days').textContent = "Exam Time!";
    }
}

// Subject View Rendering
function renderSubjectView(subject) {
    const container = document.getElementById('subject-views-container');
    const chapters = dm.data.subjects[subject] || [];
    const stats = calculateStats().subjectStats[subject];

    let html = `
        <section id="subject-${subject}" class="view-section active">
            <header class="section-header">
                <h1>${subject}</h1>
                <p>Track your chapter-wise progress and revisions</p>
            </header>

            <div class="subject-stats-bar">
                <div class="subject-stat">
                    <div class="subject-stat-value">${Math.round(stats.completionPct)}%</div>
                    <div class="subject-stat-label">Completion</div>
                </div>
                <div class="subject-stat">
                    <div class="subject-stat-value">${chapters.length}</div>
                    <div class="subject-stat-label">Total Chapters</div>
                </div>
            </div>

            <div class="card">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Ch. No.</th>
                                <th>Topic</th>
                                <th>Lectures</th>
                                <th>Duration</th>
                                <th>Lecture Status</th>
                                <th>Self Study</th>
                                <th>Rev-1</th>
                                <th>Rev-2</th>
                                <th>Rev-3</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    chapters.forEach((ch, idx) => {
        html += `
            <tr>
                <td>${escapeHtml(ch.chapter)}</td>
                <td>${escapeHtml(ch.topic)}</td>
                <td><input type="number" step="0.5" class="inline-input subj-input" data-subj="${subject}" data-idx="${idx}" data-field="lectures" value="${ch.lectures || 0}"></td>
                <td>${ch.durationStr || ch.duration.toFixed(1)}</td>
                <td>
                    <select class="status-select ${ch.status === 'Completed' ? 'status-completed' : 'status-pending'} subj-select" data-subj="${subject}" data-idx="${idx}" data-field="status">
                        <option value="Pending" ${ch.status !== 'Completed' ? 'selected' : ''}>Pending</option>
                        <option value="Completed" ${ch.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td>
                    <select class="status-select ${ch.selfStudy === 'Completed' ? 'status-completed' : 'status-pending'} subj-select" data-subj="${subject}" data-idx="${idx}" data-field="selfStudy">
                        <option value="Pending" ${ch.selfStudy !== 'Completed' ? 'selected' : ''}>Pending</option>
                        <option value="Completed" ${ch.selfStudy === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td>
                    <select class="status-select ${ch.rev1 === 'Completed' ? 'status-completed' : 'status-pending'} subj-select" data-subj="${subject}" data-idx="${idx}" data-field="rev1">
                        <option value="Pending" ${ch.rev1 !== 'Completed' ? 'selected' : ''}>Pending</option>
                        <option value="Completed" ${ch.rev1 === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td>
                    <select class="status-select ${ch.rev2 === 'Completed' ? 'status-completed' : 'status-pending'} subj-select" data-subj="${subject}" data-idx="${idx}" data-field="rev2">
                        <option value="Pending" ${ch.rev2 !== 'Completed' ? 'selected' : ''}>Pending</option>
                        <option value="Completed" ${ch.rev2 === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td>
                    <select class="status-select ${ch.rev3 === 'Completed' ? 'status-completed' : 'status-pending'} subj-select" data-subj="${subject}" data-idx="${idx}" data-field="rev3">
                        <option value="Pending" ${ch.rev3 !== 'Completed' ? 'selected' : ''}>Pending</option>
                        <option value="Completed" ${ch.rev3 === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="subj-input" style="width:100%" data-subj="${subject}" data-idx="${idx}" data-field="notes" value="${ch.notes || ''}">
                </td>
            </tr>
        `;
    });

    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.subj-select').forEach(el => {
        el.addEventListener('change', (e) => {
            const t = e.target;
            const subj = t.getAttribute('data-subj');
            const idx = t.getAttribute('data-idx');
            const field = t.getAttribute('data-field');

            t.className = `status-select ${t.value === 'Completed' ? 'status-completed' : 'status-pending'} subj-select`;

            dm.updateChapter(subj, idx, { [field]: t.value });
            renderDashboard();
            renderSubjectView(subj);
        });
    });

    container.querySelectorAll('.subj-input').forEach(el => {
        el.addEventListener('change', (e) => {
            const t = e.target;
            const subj = t.getAttribute('data-subj');
            const idx = t.getAttribute('data-idx');
            const field = t.getAttribute('data-field');

            let val = t.value;
            if (field === 'lectures') val = parseFloat(val) || 0;

            dm.updateChapter(subj, idx, { [field]: val });
            renderDashboard();

            if (field === 'lectures') {
                renderSubjectView(subj);
            }
        });
    });
}

// Settings and Data Management
function initSettings() {
    const examDateInput = document.getElementById('settings-exam-date');
    if (examDateInput && dm.data.examDate) {
        examDateInput.value = dm.data.examDate.split('T')[0];
    }

    document.getElementById('btn-save-exam-date').addEventListener('click', () => {
        if (examDateInput.value) {
            dm.data.examDate = examDateInput.value + 'T00:00:00';
            dm.saveData();
            alert("Exam date saved!");
            renderDashboard();
        }
    });

    document.getElementById('btn-export-json').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dm.data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `CA_Final_Tracker_Backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById('btn-import-json').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm("Are you sure you want to import this data? This will overwrite ALL your current progress and study logs on this browser.")) {
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.subjects && imported.testPapers) {
                    dm.data = imported;
                    dm.saveData();
                    alert("Data imported successfully! The application will now reload.");
                    window.location.reload();
                } else {
                    alert("Invalid backup file format. Expected subjects and testPapers fields.");
                }
            } catch (err) {
                alert("Error reading file. Is it a valid JSON?");
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    });

    document.getElementById('btn-export-csv').addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Subject,Lecture Hours,Self Study Hours,Revision Hours,Questions,Notes\n";

        const logs = dm.data.studyLog || [];
        logs.forEach(row => {
            const rowArr = [
                row.date,
                row.subject,
                row.lectureHours,
                row.selfStudyHours,
                row.revisionHours,
                row.questions,
                `"${row.notes.replace(/"/g, '""')}"`
            ];
            csvContent += rowArr.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Study_Log_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    });

    document.getElementById('btn-reset-data').addEventListener('click', () => {
        if (confirm("Are you absolutely sure you want to delete all your progress and reset to the default initial data? This cannot be undone.")) {
            if (confirm("Final warning! Reset all data?")) {
                dm.resetData();
                alert("Data has been reset.");
                window.location.reload();
            }
        }
    });
}
// Study Log Logic
document.getElementById('study-log-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const entry = {
        date: document.getElementById('log-date').value,
        subject: document.getElementById('log-subject').value,
        lectureHours: parseFloat(document.getElementById('log-lecture').value) || 0,
        selfStudyHours: parseFloat(document.getElementById('log-self').value) || 0,
        revisionHours: parseFloat(document.getElementById('log-rev').value) || 0,
        questions: parseInt(document.getElementById('log-qs').value) || 0,
        notes: document.getElementById('log-notes').value
    };

    dm.addStudyLog(entry);

    document.getElementById('log-lecture').value = 0;
    document.getElementById('log-self').value = 0;
    document.getElementById('log-rev').value = 0;
    document.getElementById('log-qs').value = 0;
    document.getElementById('log-notes').value = '';

    renderStudyLog();
    renderDashboard();
});

function renderStudyLog() {
    const tbody = document.querySelector('#study-log-table tbody');
    tbody.innerHTML = '';

    const logs = dm.data.studyLog || [];
    logs.forEach(log => {
        const total = (log.lectureHours + log.selfStudyHours + log.revisionHours).toFixed(1);
        tbody.innerHTML += `
            <tr>
                <td>${log.date}</td>
                <td>${log.subject}</td>
                <td>${total}</td>
                <td>${log.questions}</td>
                <td>${log.notes}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deleteStudyLog(${log.id})"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
    });
}

window.deleteStudyLog = function(id) {
    if (confirm("Delete this log entry?")) {
        dm.deleteStudyLog(id);
        renderStudyLog();
        renderDashboard();
    }
};

// Ensure today's date is set by default
document.getElementById('log-date').valueAsDate = new Date();

// Test Papers Logic
document.getElementById('test-filter-subject').addEventListener('change', renderTestPapers);

function renderTestPapers() {
    const tbody = document.querySelector('#test-papers-table tbody');
    tbody.innerHTML = '';

    const filter = document.getElementById('test-filter-subject').value;
    let subjectsToRender = filter === 'All' ? subjectsList : [filter];

    subjectsToRender.forEach(subj => {
        const papers = dm.data.testPapers[subj] || [];
        papers.forEach((p, idx) => {
            const pct = p.maxMarks > 0 ? ((p.marksObtained / p.maxMarks) * 100).toFixed(1) : 0;

            tbody.innerHTML += `
                <tr>
                    <td>${subj}</td>
                    <td>${p.category}</td>
                    <td>${p.name}</td>
                    <td><input type="number" class="inline-input test-input" data-subj="${subj}" data-idx="${idx}" data-field="marksObtained" value="${p.marksObtained}"></td>
                    <td><input type="number" class="inline-input test-input" data-subj="${subj}" data-idx="${idx}" data-field="maxMarks" value="${p.maxMarks}"></td>
                    <td>${pct}%</td>
                    <td>
                        <select class="status-select ${p.status === 'Completed' ? 'status-completed' : 'status-pending'} test-select" data-subj="${subj}" data-idx="${idx}" data-field="status">
                            <option value="Pending" ${p.status !== 'Completed' ? 'selected' : ''}>Pending</option>
                            <option value="Completed" ${p.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </td>
                    <td><input type="text" style="width:100%" class="test-input" data-subj="${subj}" data-idx="${idx}" data-field="remarks" value="${p.remarks || ''}" placeholder="Remarks"></td>
                </tr>
            `;
        });
    });

    document.querySelectorAll('.test-select').forEach(el => {
        el.addEventListener('change', (e) => {
            const t = e.target;
            const subj = t.getAttribute('data-subj');
            const idx = t.getAttribute('data-idx');
            const field = t.getAttribute('data-field');

            t.className = `status-select ${t.value === 'Completed' ? 'status-completed' : 'status-pending'} test-select`;
            dm.updateTestPaper(subj, idx, { [field]: t.value });
        });
    });

    document.querySelectorAll('.test-input').forEach(el => {
        el.addEventListener('change', (e) => {
            const t = e.target;
            const subj = t.getAttribute('data-subj');
            const idx = t.getAttribute('data-idx');
            const field = t.getAttribute('data-field');

            let val = t.value;
            if (field === 'marksObtained' || field === 'maxMarks') val = parseFloat(val) || 0;

            dm.updateTestPaper(subj, idx, { [field]: val });

            if (field === 'marksObtained' || field === 'maxMarks') {
                renderTestPapers();
            }
        });
    });
}
