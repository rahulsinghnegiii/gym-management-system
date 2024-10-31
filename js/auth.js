// Import necessary functions from Firebase SDK
import { auth } from './firebase-config.js'; // Ensure this path is correct
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Import auth methods
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"; // Import database functions

// Get elements from the registration form
const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('error-message');

// Handle registration form submission
if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Create a new user with email and password using Firebase Authentication
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // User registration successful
                const user = userCredential.user;
                const db = getDatabase();

                // Save user info to the database
                set(ref(db, 'users/' + user.uid), {
                    name: name,
                    email: email,
                    role: 'user' // Default role is 'user'
                })
                .then(() => {
                    // Redirect to user dashboard after registration
                    window.location.href = "user-dashboard.html"; // Redirect to user dashboard
                })
                .catch((error) => {
                    // Error saving user data to the database
                    console.error("Error saving user data: ", error);
                    errorMessage.innerText = "Error saving user data.";
                });
            })
            .catch((error) => {
                // Error during user registration
                console.error("Error registering user: ", error);
                errorMessage.innerText = error.message; // Display error message on the page
            });
    });
}

// Handle login form submission (for existing users)
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Sign in with email and password
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Successful login
                const user = userCredential.user;
                const db = getDatabase();

                // Check the user's role in the database
                const userRef = ref(db, 'users/' + user.uid); // Assuming user roles are stored under 'users/{userId}'
                get(userRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const userData = snapshot.val();
                            // Redirect based on user role
                            if (userData.role === 'admin') {
                                window.location.href = "admin-dashboard.html"; // Redirect to admin dashboard
                            } else if (userData.role === 'member') {
                                window.location.href = "member-dashboard.html"; // Redirect to member dashboard
                            } else if (userData.role === 'user') {
                                window.location.href = "user-dashboard.html"; // Redirect to user dashboard
                            }
                        } else {
                            console.error("User data not found.");
                            errorMessage.innerText = "User data not found.";
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching user data: ", error);
                        errorMessage.innerText = "Error fetching user data.";
                    });
            })
            .catch((error) => {
                // Error during login
                console.error("Login error: ", error);
                errorMessage.innerText = error.message; // Display error message on the page
            });
    });
}
