// Import necessary Firebase functions
import { auth } from './firebase-config.js'; 
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"; 
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// DOM Elements
const memberNameElement = document.getElementById('memberName');
const memberEmailElement = document.getElementById('memberEmail');
const paymentHistoryTableBody = document.getElementById('paymentHistoryTable').getElementsByTagName('tbody')[0];
const membershipDetailsElement = document.getElementById('membershipDetails'); // For displaying membership details
const logoutBtn = document.getElementById('logoutBtn');

// Initialize Firebase database
const db = getDatabase();

// Check if the user is authenticated and fetch member details
auth.onAuthStateChanged((user) => {
    if (user) {
        const userId = user.uid;
        
        // Fetch member details
        const userRef = ref(db, 'users/' + userId);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                memberNameElement.textContent = userData.name;
                memberEmailElement.textContent = userData.email;
                
                // Fetch and display payment history
                fetchPaymentHistory(userId);
                // Fetch and display membership details
                fetchMembershipDetails(userId);
                // Fetch and display bill notifications
                fetchBillNotifications(userId);
            } else {
                console.error("No member data found");
            }
        }).catch((error) => {
            console.error("Error fetching member data: ", error);
        });
    } else {
        // If user is not logged in, redirect to login page
        window.location.href = 'login.html';
    }
});

// Function to fetch payment history from Firebase
function fetchPaymentHistory(userId) {
    const paymentRef = ref(db, 'payments/' + userId);  // Assuming payments are stored under 'payments/{userId}'
    get(paymentRef).then((snapshot) => {
        if (snapshot.exists()) {
            const payments = snapshot.val();
            // Clear existing table rows
            paymentHistoryTableBody.innerHTML = '';
            // Loop through payments and add rows to the table
            for (const paymentId in payments) {
                const payment = payments[paymentId];
                const row = paymentHistoryTableBody.insertRow();
                row.insertCell(0).textContent = payment.date;
                row.insertCell(1).textContent = `$${payment.amount}`;
                row.insertCell(2).textContent = payment.status;
            }
        } else {
            console.log("No payment history found.");
        }
    }).catch((error) => {
        console.error("Error fetching payment history: ", error);
    });
}

// Function to fetch membership details from Firebase
function fetchMembershipDetails(userId) {
    const membershipRef = ref(db, 'memberships/' + userId);  // Assuming memberships are stored under 'memberships/{userId}'
    get(membershipRef).then((snapshot) => {
        if (snapshot.exists()) {
            const membership = snapshot.val();
            // Display membership details
            membershipDetailsElement.innerHTML = `
                <p><strong>Membership Type:</strong> ${membership.type}</p>
                <p><strong>Start Date:</strong> ${membership.startDate}</p>
                <p><strong>End Date:</strong> ${membership.endDate}</p>
                <p><strong>Status:</strong> ${membership.status}</p>
            `;
        } else {
            console.log("No membership details found.");
            membershipDetailsElement.innerHTML = "<p>No membership details available.</p>";
        }
    }).catch((error) => {
        console.error("Error fetching membership details: ", error);
    });
}

// Function to fetch bill notifications
function fetchBillNotifications(userId) {
    const notificationRef = ref(db, 'notifications/' + userId);  // Assuming notifications are stored under 'notifications/{userId}'
    get(notificationRef).then((snapshot) => {
        if (snapshot.exists()) {
            const notifications = snapshot.val();
            let notificationMessage = '';
            for (const notificationId in notifications) {
                const notification = notifications[notificationId];
                notificationMessage += `${notification.message} (Date: ${notification.date})\n`;
            }
            alert(notificationMessage);  // Display notifications as an alert or modify to display within the dashboard
        } else {
            console.log("No bill notifications found.");
        }
    }).catch((error) => {
        console.error("Error fetching notifications: ", error);
    });
}

// Logout Functionality
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'login.html';  // Redirect to login after successful logout
    }).catch((error) => {
        console.error("Logout error: ", error);
    });
});
