// services/authService.js
import { auth, db } from '../firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

export const AuthService = {
  // Register a new user
  register: async (email, password, userData) => {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        email: user.email,
        name: userData.name || "",
        phone: userData.phone || "",
        address: userData.address || {},
        createdAt: new Date()
      });
      
      return user;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },
  
  // Login user
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return {
          uid: user.uid,
          email: user.email,
          ...userData
        };
      }
      
      return user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },
  
  // Login with user ID
  loginWithUserId: async (userId) => {
    try {
      // Find user by userId in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("User ID not found");
      }
      
      const userData = querySnapshot.docs[0].data();
      
      // In a real implementation, you'd need a secure way to authenticate without password
      // This is a simplified version for demonstration
      return userData;
    } catch (error) {
      console.error("Error logging in with user ID:", error);
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  },
  
  // Get current authenticated user
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, 
        (user) => {
          unsubscribe();
          resolve(user);
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
  
  // Get user profile data
  getUserProfile: async (userId) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }
      
      throw new Error("User profile not found");
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }
};