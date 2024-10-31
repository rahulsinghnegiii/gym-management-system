import { getDatabase, ref, get, query, orderByChild } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"; // Import necessary Firebase database functions
import { auth } from './firebase-config.js'; // Import Firebase Auth from your configuration file

// Initialize the Firebase Database
const db = getDatabase();

// Elements
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');
const userName = document.getElementById('userName');

// Handle the search button click
searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim().toLowerCase(); // Get the search term
    if (searchTerm) {
        searchRecords(searchTerm);
    } else {
        searchResults.innerHTML = '<p>Please enter a search term.</p>';
    }
});

// Function to search records
function searchRecords(term) {
    const userRef = ref(db, 'users'); // Adjust this path to your records path
    const recordsQuery = query(userRef, orderByChild('name')); // Replace 'name' with the appropriate field to search

    get(recordsQuery).then((snapshot) => {
        if (snapshot.exists()) {
            const results = [];
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                // Check if the search term matches the name or email (or any other fields)
                if (data.name && (data.name.toLowerCase().includes(term) || data.email.toLowerCase().includes(term))) {
                    results.push(`<p>Name: ${data.name}, Email: ${data.email}</p>`); // Display matching records
                }
            });
            searchResults.innerHTML = results.length > 0 ? results.join('') : '<p>No records found.</p>';
        } else {
            searchResults.innerHTML = '<p>No records found.</p>';
        }
    }).catch((error) => {
        console.error("Error fetching records: ", error);
        searchResults.innerHTML = '<p>Error fetching records.</p>';
    });
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'login.html'; // Redirect to login page on logout
        }).catch((error) => {
            console.error("Error logging out: ", error);
        });
    });
}

// Load user info and display on dashboard
auth.onAuthStateChanged((user) => {
    if (user) {
        userEmail.textContent = user.email; // Display user's email

        // Get user's name from the database
        const userRef = ref(db, 'users/' + user.uid);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                userName.textContent = data.name || "User"; // Fallback if name isn't available
            }
        }).catch((error) => {
            console.error("Error fetching user data: ", error);
        });
    } else {
        // User is not logged in, redirect to login
        window.location.href = 'login.html';
    }
});

// Commented out Firebase connection check due to client offline error
/*
const testRef = ref(db, '.info/connected');
get(testRef).then((snapshot) => {
    if (snapshot.val() === true) {
        console.log("Connected to Firebase");
    } else {
        console.log("Not connected to Firebase");
    }
}).catch((error) => {
    console.error("Error checking Firebase connection:", error);
});
*/
