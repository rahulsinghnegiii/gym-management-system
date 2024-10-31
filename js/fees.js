import { auth } from './firebase-config.js'; // Import Firebase auth
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const feesList = document.getElementById('feesList');
const addFeeBtn = document.getElementById('addFeeBtn');
const db = getDatabase(); // Initialize Firebase database

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // If not logged in, redirect to login page
        window.location.href = "login.html";
    }
});

// Event listener for adding a fee package
addFeeBtn.addEventListener('click', () => {
    const feeName = prompt("Enter fee package name:");
    const feeAmount = prompt("Enter fee package amount:");
    const feeId = Date.now(); // Unique ID for each fee package

    // Add logic to save fee package to Firebase
    set(ref(db, 'fees/' + feeId), {
        name: feeName,
        amount: feeAmount
    }).then(() => {
        alert("Fee package added successfully!");
        displayFees(); // Refresh the fees list
    }).catch((error) => {
        console.error("Error adding fee package: ", error);
    });
});

// Function to display fees
function displayFees() {
    const feesRef = ref(db, 'fees/');
    onValue(feesRef, (snapshot) => {
        feesList.innerHTML = ""; // Clear current list
        snapshot.forEach((childSnapshot) => {
            const fee = childSnapshot.val();
            const feeId = childSnapshot.key;

            // Create a fee card with edit and delete buttons
            const feeElement = document.createElement('div');
            feeElement.classList.add('fee-card');
            feeElement.innerHTML = `
                <div>
                    <h3>Package: ${fee.name}</h3>
                    <p>Amount: ${fee.amount}</p>
                </div>
                <div class="fee-card-buttons">
                    <button class="btn-edit" data-id="${feeId}">Edit</button>
                    <button class="btn-delete" data-id="${feeId}">Delete</button>
                </div>
            `;
            feesList.appendChild(feeElement);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => {
                const feeId = button.getAttribute('data-id');
                editFee(feeId);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => {
                const feeId = button.getAttribute('data-id');
                deleteFee(feeId);
            });
        });
    });
}

// Function to delete a fee
function deleteFee(feeId) {
    const confirmDelete = confirm("Are you sure you want to delete this fee?");
    if (confirmDelete) {
        remove(ref(db, 'fees/' + feeId)).then(() => {
            alert("Fee package deleted successfully!");
            displayFees(); // Refresh the fees list
        }).catch((error) => {
            console.error("Error deleting fee: ", error);
        });
    }
}

// Function to edit a fee
function editFee(feeId) {
    const newName = prompt("Enter new fee package name:");
    const newAmount = prompt("Enter new fee package amount:");

    if (newName && newAmount) {
        update(ref(db, 'fees/' + feeId), {
            name: newName,
            amount: newAmount
        }).then(() => {
            alert("Fee package updated successfully!");
            displayFees(); // Refresh the fees list
        }).catch((error) => {
            console.error("Error updating fee: ", error);
        });
    } else {
        alert("Name and amount cannot be empty!");
    }
}

// Call displayFees to show existing fees on page load
displayFees();
