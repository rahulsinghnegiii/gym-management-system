// Import necessary functions from Firebase SDK
import { auth } from './firebase-config.js'; // Ensure this path is correct
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Add user data to Firestore
        const db = getFirestore();
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            role: 'member' // Default role; adjust as needed
        });

        // Redirect or display success message
        window.location.href = "login.html"; // Redirect to login page after successful registration
    } catch (error) {
        console.error("Error registering user:", error);
        document.getElementById('error-message').innerText = error.message; // Display error message
    }
});
