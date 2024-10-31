import { auth } from './firebase-config.js'; // Import Firebase auth
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const db = getDatabase(); // Initialize Firebase database

// Function to initialize the reports page
function initReportsPage() {
    const reportsList = document.getElementById('reportsList');
    const exportReportsBtn = document.getElementById('exportReportBtn'); // Updated ID

    // Check if user is logged in
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // If not logged in, redirect to login page
            window.location.href = "login.html";
        }
    });

    // Function to display reports (for simplicity, let's assume we're displaying all members and fees)
    function displayReports() {
        const membersRef = ref(db, 'members/');
        const feesRef = ref(db, 'fees/');

        // Display members
        onValue(membersRef, (snapshot) => {
            reportsList.innerHTML = ""; // Clear current list
            const membersSection = document.createElement('div');
            membersSection.classList.add('report-section');
            membersSection.innerHTML = "<div class='report-title'>Members</div>"; // Header for members

            snapshot.forEach((childSnapshot) => {
                const member = childSnapshot.val();
                const memberElement = document.createElement('div');
                memberElement.classList.add('report-item');
                memberElement.innerHTML = `<span class='report-detail'>Name: ${member.name}, Email: ${member.email}</span>`;
                membersSection.appendChild(memberElement);
            });

            reportsList.appendChild(membersSection); // Append members section to reports list
        });

        // Display fees
        onValue(feesRef, (snapshot) => {
            const feesSection = document.createElement('div');
            feesSection.classList.add('report-section');
            feesSection.innerHTML = "<div class='report-title'>Fees</div>"; // Header for fees

            snapshot.forEach((childSnapshot) => {
                const fee = childSnapshot.val();
                const feeElement = document.createElement('div');
                feeElement.classList.add('report-item');
                feeElement.innerHTML = `<span class='report-detail'>Package: ${fee.name}, Amount: ${fee.amount}</span>`;
                feesSection.appendChild(feeElement);
            });

            reportsList.appendChild(feesSection); // Append fees section to reports list
        });
    }

    // Function to export reports as CSV
    function exportReports() {
        const membersRef = ref(db, 'members/');
        const feesRef = ref(db, 'fees/');
        
        // Fetch members data
        onValue(membersRef, (snapshot) => {
            let csvContent = "data:text/csv;charset=utf-8,"; // CSV file header
            csvContent += "Report Type,Name,Email,Package,Amount\n"; // Column headers

            snapshot.forEach((childSnapshot) => {
                const member = childSnapshot.val();
                csvContent += `Member,${member.name},${member.email},,\n`; // Member data
            });

            // Fetch fees data
            onValue(feesRef, (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const fee = childSnapshot.val();
                    csvContent += `Fee,,${fee.name},${fee.amount}\n`; // Fee data
                });

                // Create a link element for downloading the CSV
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "gym_reports.csv");
                document.body.appendChild(link); // Required for Firefox

                link.click(); // Trigger the download
                document.body.removeChild(link); // Clean up
            });
        });
    }

    // Event listener for exporting reports
    exportReportsBtn.addEventListener('click', exportReports);

    // Call displayReports to show existing reports on page load
    displayReports();
}

// Initialize the reports page after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initReportsPage);
