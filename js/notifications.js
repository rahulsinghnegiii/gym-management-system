import { auth } from './firebase-config.js'; // Import Firebase auth
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const notificationsList = document.getElementById('notificationsList');
const addNotificationBtn = document.getElementById('addNotificationBtn');
const db = getDatabase(); // Initialize Firebase database

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // If not logged in, redirect to login page
        window.location.href = "login.html";
    }
});

// Event listener for adding a notification
addNotificationBtn.addEventListener('click', () => {
    const notificationMessage = prompt("Enter notification message:");
    const notificationId = Date.now(); // Unique ID for each notification

    // Add logic to save notification to Firebase
    set(ref(db, 'notifications/' + notificationId), {
        message: notificationMessage,
        date: new Date().toISOString()
    }).then(() => {
        alert("Notification added successfully!");
        displayNotifications(); // Refresh the notifications list
    }).catch((error) => {
        console.error("Error adding notification: ", error);
    });
});

// Function to display notifications
function displayNotifications() {
    const notificationsRef = ref(db, 'notifications/');
    onValue(notificationsRef, (snapshot) => {
        notificationsList.innerHTML = ""; // Clear current list
        snapshot.forEach((childSnapshot) => {
            const notification = childSnapshot.val();
            const notificationId = childSnapshot.key; // Get the unique ID of the notification

            const notificationElement = document.createElement('div');
            notificationElement.classList.add('notification-item');

            // Create the notification text
            const notificationText = document.createElement('span');
            notificationText.classList.add('notification-text');
            notificationText.textContent = `${notification.message}`;
            
            const dateText = document.createElement('span');
            dateText.classList.add('notification-date');
            dateText.textContent = ` (Date: ${new Date(notification.date).toLocaleString()})`;

            // Create edit button
            const editButton = document.createElement('button');
            editButton.classList.add('btn-edit');
            editButton.textContent = 'Edit';
            editButton.onclick = () => editNotification(notificationId, notification.message);

            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn-delete');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteNotification(notificationId);

            // Append elements to the notification container
            notificationElement.appendChild(notificationText);
            notificationElement.appendChild(dateText);
            notificationElement.appendChild(editButton);
            notificationElement.appendChild(deleteButton);
            notificationsList.appendChild(notificationElement);
        });
    });
}

// Function to edit a notification
function editNotification(notificationId, currentMessage) {
    const newMessage = prompt("Edit notification message:", currentMessage);
    if (newMessage !== null) {
        set(ref(db, 'notifications/' + notificationId), {
            message: newMessage,
            date: new Date().toISOString() // Update date on edit
        }).then(() => {
            alert("Notification updated successfully!");
            displayNotifications(); // Refresh the notifications list
        }).catch((error) => {
            console.error("Error updating notification: ", error);
        });
    }
}

// Function to delete a notification
function deleteNotification(notificationId) {
    if (confirm("Are you sure you want to delete this notification?")) {
        remove(ref(db, 'notifications/' + notificationId)).then(() => {
            alert("Notification deleted successfully!");
            displayNotifications(); // Refresh the notifications list
        }).catch((error) => {
            console.error("Error deleting notification: ", error);
        });
    }
}

// Call displayNotifications to show existing notifications on page load
displayNotifications();
