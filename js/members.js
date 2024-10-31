import { auth } from './firebase-config.js'; // Import Firebase auth
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const membersList = document.getElementById('membersList');
const addMemberForm = document.getElementById('addMemberForm');
const db = getDatabase(); // Initialize Firebase database

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // If not logged in, redirect to login page
        window.location.href = "login.html";
    }
});

// Event listener for adding a member
addMemberForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent form submission

    const memberName = document.getElementById('memberName').value;
    const memberEmail = document.getElementById('memberEmail').value;
    const memberId = Date.now(); // Unique ID for each member

    // Add logic to save member to Firebase
    set(ref(db, 'members/' + memberId), {
        name: memberName,
        email: memberEmail,
        joinedDate: new Date().toISOString()
    }).then(() => {
        alert("Member added successfully!");
        addMemberForm.reset(); // Clear form fields
        displayMembers(); // Refresh the members list
    }).catch((error) => {
        console.error("Error adding member: ", error);
    });
});

// Function to display members
function displayMembers() {
    const membersRef = ref(db, 'members/');
    onValue(membersRef, (snapshot) => {
        membersList.innerHTML = ""; // Clear current list

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const member = childSnapshot.val();
                const memberId = childSnapshot.key; // Get the unique ID of the member

                const memberElement = document.createElement('div');
                memberElement.classList.add('member-item');
                memberElement.innerHTML = `
                    <div>
                        <strong>Name:</strong> ${member.name}, 
                        <strong>Email:</strong> ${member.email}, 
                        <strong>Joined:</strong> ${new Date(member.joinedDate).toLocaleDateString()}
                        <button class="btn-edit" data-id="${memberId}">Edit</button>
                        <button class="btn-delete" data-id="${memberId}">Delete</button>
                    </div>
                `;
                membersList.appendChild(memberElement);
            });

            // Add event listeners for edit and delete buttons
            attachEventListeners();
        } else {
            membersList.innerHTML = "<p>No members found.</p>";
        }
    }, (error) => {
        console.error("Error fetching members: ", error);
    });
}

// Function to attach event listeners for edit and delete buttons
function attachEventListeners() {
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => {
            const memberId = button.getAttribute('data-id');
            editMember(memberId);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => {
            const memberId = button.getAttribute('data-id');
            deleteMember(memberId);
        });
    });
}

// Function to delete a member
function deleteMember(memberId) {
    const confirmDelete = confirm("Are you sure you want to delete this member?");
    if (confirmDelete) {
        remove(ref(db, 'members/' + memberId)).then(() => {
            alert("Member deleted successfully!");
            displayMembers(); // Refresh the members list
        }).catch((error) => {
            console.error("Error deleting member: ", error);
        });
    }
}

// Function to edit a member
function editMember(memberId) {
    const newName = prompt("Enter new member name:");
    const newEmail = prompt("Enter new member email:");

    if (newName && newEmail) {
        update(ref(db, 'members/' + memberId), {
            name: newName,
            email: newEmail,
            joinedDate: new Date().toISOString() // Update joined date to current time
        }).then(() => {
            alert("Member updated successfully!");
            displayMembers(); // Refresh the members list
        }).catch((error) => {
            console.error("Error updating member: ", error);
        });
    } else {
        alert("Name and email cannot be empty!");
    }
}

// Call displayMembers to show existing members on page load
displayMembers();
