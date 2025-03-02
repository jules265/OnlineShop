// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore();
auth.languageCode = 'en'
const provider = new GoogleAuthProvider();

// Create account function
function createAccount() {
    const newUserId = document.getElementById("newUserId").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const createButton = document.getElementById("createAccountButton");

    // Validate input
    if (!newUserId || !email || !phone || !address) {
        showToast("warning", "Incomplete Information", "Please fill in all fields");
        return;
    }

    // Activate loading state
    createButton.classList.add("loading");
    createButton.disabled = true;

    // Create a user with email and password
    createUserWithEmailAndPassword(auth, email, newUserId)
        .then(async (userCredential) => {
            const user = userCredential.user;

            // Save additional user info in Firestore, including phone and address
            await setDoc(doc(db, "users", user.uid), {  
                uid: user.uid,
                email: email,
                userId: newUserId,
                phone: phone,        
                address: address,    
                lastLogin: new Date().toISOString(),
            });

            // Hide modal and show success message
            hideCreateAccountModal();
            createButton.classList.remove("loading");
            createButton.disabled = false;
            showToast("success", "Account Created", "Your account has been successfully established");

            // Pre-fill the login form with the new user ID
            document.getElementById("userId").value = newUserId;
        })
        .catch((error) => {
            createButton.classList.remove("loading");
            createButton.disabled = false;
            showToast("error", "Account Creation Failed", error.message);
        });
}

// Login function
function login() {
    const userId = document.getElementById("userId").value.trim();
    const loginButton = document.getElementById("loginButton");
    const userIdInput = document.getElementById("userId");
    const userIdFeedback = document.getElementById("userIdFeedback");

    // Clear previous feedback
    userIdInput.classList.remove("error");
    userIdFeedback.classList.remove("error");
    userIdFeedback.textContent = "";

    if (!userId) {
        userIdInput.classList.add("error");
        userIdFeedback.classList.add("error");
        userIdFeedback.textContent = "User ID is required";
        return;
    }

    // Display loading state
    loginButton.classList.add("loading");
    loginButton.disabled = true;

    const email = userId; 

    // Sign in the user
    signInWithEmailAndPassword(auth, email, userId) 
        .then((userCredential) => {
            // User successfully logged in
            const user = userCredential.user;
            showToast("success", "Success", "Login successful! You will be redirected shortly...");

            // Store user data in local storage
            localStorage.setItem("user", JSON.stringify({
                id: user.uid,
                email: user.email,
                lastLogin: new Date().toISOString(),
            }));

            // Redirect after a brief delay
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        })
        .catch((error) => {
            loginButton.classList.remove("loading");
            loginButton.disabled = false;
            userIdInput.classList.add("error");
            userIdFeedback.classList.add("error");
            userIdFeedback.textContent = error.message;
            showToast("error", "Login Failed", error.message);
        });
}

// Login with Google function
function loginWithGoogle() {
    const googleLoginButton = document.getElementById("loginButtonWithGoogle");

    // Display loading state
    googleLoginButton.classList.add("loading");
    googleLoginButton.disabled = true;

    signInWithPopup(auth, provider)
        .then((result) => {
            // Store user data in local storage
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            localStorage.setItem("user", JSON.stringify({
                id: user.uid,
                email: user.email,
                lastLogin: new Date().toISOString(),
            }));

            // Redirect after a brief delay
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        })
        .catch((error) => {
            googleLoginButton.classList.remove("loading");
            googleLoginButton.disabled = false;
            showToast("error", "Google Login Failed", error.message);
        });
}

// Add event listeners
document.getElementById("createAccountButton").addEventListener("click", createAccount);
document.getElementById("loginButton").addEventListener("click", login);

// Change the id of the Google login button to "loginButtonWithGoogle"
document.getElementById("loginButtonWithGoogle").addEventListener("click", loginWithGoogle);