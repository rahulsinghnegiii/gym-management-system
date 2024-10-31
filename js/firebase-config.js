// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"; // Import database function

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDRVhcXjA4jE3vWS1IDNYGAq7Qx4XbXcgo",
    authDomain: "gym-manager-df923.firebaseapp.com",
    databaseURL: "https://gym-manager-df923-default-rtdb.firebaseio.com",
    projectId: "gym-manager-df923",
    storageBucket: "gym-manager-df923.appspot.com",
    messagingSenderId: "159223203312",
    appId: "1:159223203312:web:a6043fb79e8a5590754935",
    measurementId: "G-WWT55DSP67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // Initialize the Firebase app with the configuration
const auth = getAuth(app); // Initialize Firebase Authentication
const db = getDatabase(app); // Initialize Firebase Realtime Database

// Export auth and db for use in other modules
export { auth, db }; // Export both auth and db instances
