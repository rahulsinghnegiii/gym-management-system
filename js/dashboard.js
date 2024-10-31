import { db, auth } from './firebase-config.js';
import { ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error("Logout error:", error);
    });
});

// Fetch members and display in table
const membersList = document.getElementById('membersList');

const loadMembers = async () => {
    const membersRef = ref(db, 'members');
    onValue(membersRef, (snapshot) => {
        membersList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const member = childSnapshot.val();
            const memberId = childSnapshot.key;
            const row = `<tr>
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td><button data-id="${memberId}" class="delete-member">Delete</button></td>
            </tr>`;
            membersList.innerHTML += row;
        });
    }, (error) => {
        console.error("Error fetching members:", error);
    });
};

loadMembers();

// Add event listener to delete member buttons
membersList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-member')) {
        const memberId = e.target.dataset.id;
        const memberRef = ref(db, `members/${memberId}`);
        try {
            await remove(memberRef);
            alert("Member deleted successfully!");
            e.target.parentElement.parentElement.remove();
        } catch (error) {
            console.error("Error deleting member:", error);
        }
    }
});

// Add bill functionality
const createBillForm = document.getElementById('createBillForm');
createBillForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const memberName = document.getElementById('billMemberName').value;
    const amount = document.getElementById('billAmount').value;
    const description = document.getElementById('billDescription').value;

    const billId = `bill_${Date.now()}`;
    const billRef = ref(db, `bills/${billId}`);

    try {
        await set(billRef, {
            memberName: memberName,
            amount: amount,
            description: description,
            timestamp: new Date().toISOString(),
        });
        alert("Bill created successfully!");
        createBillForm.reset();
    } catch (error) {
        console.error("Error creating bill: ", error);
    }
});

// View bill receipts
const loadBillReceipts = async () => {
    const billReceiptsList = document.getElementById('billReceiptsList');
    const billsRef = ref(db, 'bills');
    onValue(billsRef, (snapshot) => {
        billReceiptsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const bill = childSnapshot.val();
            const billId = childSnapshot.key;
            const row = `<tr>
                <td>${billId}</td>
                <td>${bill.memberName}</td>
                <td>${bill.amount}</td>
                <td>${new Date(bill.timestamp).toLocaleDateString()}</td>
            </tr>`;
            billReceiptsList.innerHTML += row;
        });
    }, (error) => {
        console.error("Error fetching bill receipts:", error);
    });
};

loadBillReceipts();

// View bill notifications
const loadBillNotifications = async () => {
    const billNotificationsList = document.getElementById('billNotificationsList');
    const notificationsRef = ref(db, 'notifications');
    onValue(notificationsRef, (snapshot) => {
        billNotificationsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const notification = childSnapshot.val();
            const notificationId = childSnapshot.key;
            const row = `<tr>
                <td>${notificationId}</td>
                <td>${notification.memberName}</td>
                <td>${notification.description}</td>
                <td>${new Date(notification.timestamp).toLocaleDateString()}</td>
            </tr>`;
            billNotificationsList.innerHTML += row;
        });
    }, (error) => {
        console.error("Error fetching notifications:", error);
    });
};

loadBillNotifications();

// Add diet details functionality
const addDietForm = document.getElementById('addDietForm');
addDietForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dietName = document.getElementById('dietName').value;
    const dietDescription = document.getElementById('dietDescription').value;

    const dietId = `diet_${Date.now()}`;
    const dietRef = ref(db, `diets/${dietId}`);

    try {
        await set(dietRef, {
            dietName: dietName,
            description: dietDescription,
            timestamp: new Date().toISOString(),
        });
        alert("Diet plan added successfully!");
        addDietForm.reset();
    } catch (error) {
        console.error("Error adding diet plan: ", error);
    }
});

// Export report functionality
const exportReportBtn = document.getElementById('exportReportBtn');
exportReportBtn.addEventListener('click', async () => {
    const membersRef = ref(db, 'members');
    const billsRef = ref(db, 'bills');
    const notificationsRef = ref(db, 'notifications');

    const members = [];
    const bills = [];
    const notifications = [];

    // Fetch members
    await new Promise((resolve) => {
        onValue(membersRef, (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const member = childSnapshot.val();
                members.push({ id: childSnapshot.key, ...member });
            });
            resolve();
        });
    });

    // Fetch bills
    await new Promise((resolve) => {
        onValue(billsRef, (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const bill = childSnapshot.val();
                bills.push({ id: childSnapshot.key, ...bill });
            });
            resolve();
        });
    });

    // Fetch notifications
    await new Promise((resolve) => {
        onValue(notificationsRef, (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const notification = childSnapshot.val();
                notifications.push({ id: childSnapshot.key, ...notification });
            });
            resolve();
        });
    });

    // Convert to CSV format
    const csvData = [
        ['Members Report'],
        ['ID', 'Name', 'Email'],
        ...members.map(member => [member.id, member.name, member.email]),
        [],
        ['Bills Report'],
        ['ID', 'Member Name', 'Amount', 'Description', 'Timestamp'],
        ...bills.map(bill => [bill.id, bill.memberName, bill.amount, bill.description, new Date(bill.timestamp).toLocaleString()]),
        [],
        ['Notifications Report'],
        ['ID', 'Member Name', 'Description', 'Timestamp'],
        ...notifications.map(notification => [notification.id, notification.memberName, notification.description, new Date(notification.timestamp).toLocaleString()]),
    ];

    // Download CSV file
    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'gym_management_report.csv');
    a.click();
    URL.revokeObjectURL(url); // Clean up URL object
});
