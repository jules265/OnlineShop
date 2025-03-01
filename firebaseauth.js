// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCS024K6CozcOvOLHMou9dKsNDh-fCw10c",
  authDomain: "usermanagr.firebaseapp.com",
  projectId: "usermanagr",
  storageBucket: "usermanagr.appspot.com",
  messagingSenderId: "201891796617",
  appId: "1:201891796617:web:ab31f6c5b0e1becb6bd858",
  measurementId: "G-WPNMDSTYXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Handle login
const loginButton = document.getElementById("loginButton");
loginButton.addEventListener("click", async () => {
  // Show loading state
  const btnText = document.querySelector(".btn-text");
  const loadingSpinner = document.querySelector(".loading-spinner");
  btnText.textContent = "Logging in...";
  loadingSpinner.style.display = "inline-block";
  
  const userIdInput = document.getElementById("userId").value.trim();
  const userIdFeedback = document.getElementById("userIdFeedback");
  
  if (!userIdInput) {
    userIdFeedback.textContent = "Please enter your User ID";
    userIdFeedback.style.color = "red";
    btnText.textContent = "Login";
    loadingSpinner.style.display = "none";
    return;
  }
  
  try {
    // First, query Firestore to find the user by userId
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("userId", "==", userIdInput));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      userIdFeedback.textContent = "User ID not found";
      userIdFeedback.style.color = "red";
      btnText.textContent = "Login";
      loadingSpinner.style.display = "none";
      return;
    }
    
    // Get the first matching user
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Now use the email from the found user document to sign in
    // Note: In a real app, you should have a proper password field
    // This is just for demonstration based on your current setup
    try {
      // Using the email from Firestore and the password from your original code
      // This is not secure and should be replaced with proper authentication
      const password = Math.random().toString(36).slice(-8);
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
      
      // Store user info in session/localStorage for future use
      sessionStorage.setItem('currentUser', JSON.stringify({
        uid: userCredential.user.uid,
        userId: userData.userId,
        email: userData.email
      }));
      
      // Successful login
      userIdFeedback.textContent = "Login successful!";
      userIdFeedback.style.color = "green";
      
      // Redirect to customer page
      setTimeout(() => {
        window.location.href = "customer.html";
      }, 1000);
    } catch (authError) {
      console.error("Authentication error:", authError);
      userIdFeedback.textContent = "Authentication failed. Please contact support.";
      userIdFeedback.style.color = "red";
    }
  } catch (error) {
    console.error("Error during login:", error);
    userIdFeedback.textContent = "An error occurred. Please try again.";
    userIdFeedback.style.color = "red";
  }
  
  // Reset button state
  btnText.textContent = "Login";
  loadingSpinner.style.display = "none";
});

// For the sign-up functionality (keeping your original code for reference)
const signUp = document.getElementById("createAccountButton");
if (signUp) {
  signUp.addEventListener("click", async (event) => {
    event.preventDefault();
    
    const newUserId = document.getElementById("newUserId").value.trim();
    const email = document.getElementById("email").value.trim();
    
    if (!newUserId || !email) {
      alert("Please fill in both fields before proceeding.");
      return;
    }
    
    try {
      // Automatically generate a password for authentication
      const password = Math.random().toString(36).slice(-8);
        
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
        
      // Store user data in Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        userId: newUserId,
        email: user.email,
        createdAt: new Date(),
      });
      alert("User created successfully with User ID: " + newUserId);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while creating the user. Please try again.");
    }
  });
}