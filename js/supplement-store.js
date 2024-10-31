// Import necessary functions from Firebase SDK
import { auth } from './firebase-config.js'; // Ensure this path is correct
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const supplementItems = document.querySelectorAll('.supplement-item');
const backBtn = document.getElementById('backBtn');
const db = getFirestore(); // Initialize Firestore

// Function to load the cart from localStorage
function loadCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Function to save the cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to add a supplement to the cart and Firestore
async function addToCart(supplementName, price) {
    const cart = loadCart();

    // Check if the supplement is already in the cart
    const existingItem = cart.find(item => item.name === supplementName);

    if (existingItem) {
        // If the item already exists, increase the quantity
        existingItem.quantity += 1;
    } else {
        // If the item does not exist, add it to the cart
        cart.push({ name: supplementName, price: price, quantity: 1 });
    }

    saveCart(cart);
    alert(`${supplementName} has been added to your cart.`);

    // Optionally add supplement to Firestore (if needed)
    try {
        const supplementRef = collection(db, 'supplements'); // Collection reference
        await addDoc(supplementRef, {
            name: supplementName,
            price: price
        });
        console.log(`${supplementName} added to Firestore.`);
    } catch (error) {
        console.error("Error adding supplement to Firestore: ", error);
    }
}

// Add event listeners to all "Add to Cart" buttons
supplementItems.forEach(item => {
    const name = item.querySelector('h3').textContent;
    const price = parseFloat(item.querySelector('p:nth-of-type(2)').textContent.replace('Price: $', ''));

    item.querySelector('button').addEventListener('click', () => {
        addToCart(name, price);
    });
});

// Go back to the dashboard
backBtn.addEventListener('click', () => {
    window.location.href = 'admin-dashboard.html'; // Adjust the link as per your file structure
});

// Debugging: Display the cart content in the console for testing
console.log('Cart:', loadCart());
