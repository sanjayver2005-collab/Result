const SHEET_URL = 'https://docs.google.com/spreadsheets/d/10SIaqIoSozrO2yXFM9K0Ihbe7IAhxywXuxLj2lpK7cQ/export?format=csv';

const studentNameInput = document.getElementById('studentName');
const rollNumberInput = document.getElementById('rollNumber');
const searchBtn = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultContainer');
const topperShowcase = document.getElementById('topperShowcase');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const btnText = document.querySelector('.btn-text');
const loader = document.querySelector('.loader');

let allStudents = [];

// Fetch data on load to show topper
window.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        const response = await fetch(SHEET_URL);
        const csvData = await response.text();
        allStudents = parseCSV(csvData);
        displayTopper();
    } catch (error) {
        console.error('Initial fetch failed:', error);
    }
}

function calculateAverage(s) {
    const subjects = ['Hindi', 'Maths', 'Sci', 'SST', 'English'];
    let total = 0;
    subjects.forEach(sub => {
        total += parseFloat(s[sub] || 0);
    });
    return total / subjects.length;
}

function displayTopper() {
    if (allStudents.length === 0) return;

    const topper = allStudents.reduce((prev, current) => {
        return calculateAverage(prev) > calculateAverage(current) ? prev : current;
    });

    topperShowcase.innerHTML = `
        <div class="topper-icon">🏆</div>
        <div class="topper-content">
            <h3>Top Performer</h3>
            <p>${topper.Name} (Avg: ${calculateAverage(topper).toFixed(1)}%)</p>
        </div>
    `;
    topperShowcase.classList.remove('hidden');
}

searchBtn.addEventListener('click', handleSearch);

async function handleSearch() {
    const name = studentNameInput.value.trim();
    const roll = rollNumberInput.value.trim();

    if (!name || !roll) {
        showError('Please enter both name and roll number.');
        return;
    }

    setLoading(true);
    hideResults();
    hideError();

    // Give a small delay for premium feel
    setTimeout(() => {
        const foundStudent = allStudents.find(s =>
            s.Name.toLowerCase() === name.toLowerCase() &&
            s['Roll Number'].toString() === roll
        );

        if (foundStudent) {
            displayResult(foundStudent);
        } else {
            showError('No record found for this Name and Roll Number.');
        }
        setLoading(false);
    }, 600);
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const currentLine = lines[i].split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = currentLine[index] ? currentLine[index].trim() : '';
        });
        results.push(obj);
    }
    return results;
}

function displayResult(student) {
    const avg = calculateAverage(student);
    const isPass = avg >= 50;
    const statusText = isPass ? 'PASSED' : 'FAILED';
    const statusClass = isPass ? 'status-pass' : 'status-fail';
    const stars = isPass ? '⭐⭐⭐⭐⭐' : '';

    resultContainer.innerHTML = `
        <div class="result-card">
            <div class="result-header">
                <div class="student-info">
                    <h2 style="font-size: 1.8rem;">${student.Name}</h2>
                    <p>Class ${student.Class} | Roll No: ${student['Roll Number']}</p>
                    <p style="margin-top:0.5rem; font-weight:600; color: #4338ca;">Average: ${avg.toFixed(1)}%</p>
                    <div class="stars">${stars}</div>
                </div>
                <div class="status-badge ${statusClass}">${statusText}</div>
            </div>
            <div class="marks-grid">
                <div class="mark-item">
                    <span class="mark-label">Hindi</span>
                    <span class="mark-value">${student.Hindi}</span>
                </div>
                <div class="mark-item">
                    <span class="mark-label">Mathematics</span>
                    <span class="mark-value">${student.Maths}</span>
                </div>
                <div class="mark-item">
                    <span class="mark-label">Science</span>
                    <span class="mark-value">${student.Sci}</span>
                </div>
                 <div class="mark-item">
                    <span class="mark-label">Social Science</span>
                    <span class="mark-value">${student.SST || 0}</span>
                </div>
                <div class="mark-item">
                    <span class="mark-label">English</span>
                    <span class="mark-value">${student.English}</span>
                </div>
            </div>
        </div>
    `;
    resultContainer.classList.remove('hidden');
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorContainer.classList.remove('hidden');
}

function hideError() {
    errorContainer.classList.add('hidden');
}

function hideResults() {
    resultContainer.classList.add('hidden');
}

function setLoading(isLoading) {
    if (isLoading) {
        searchBtn.disabled = true;
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
    } else {
        searchBtn.disabled = false;
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}
