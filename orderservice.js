// services/orderService.js
import { db } from '../firebase-config.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  deleteDoc, 
  orderBy,
  getDoc,
  updateDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

export const OrderService = {
  // Create a new order
  createOrder: async (userId, orderData) => {
    try {
      // Generate order ID
      const orderPrefix = "ORD-";
      const orderNumber = Math.floor(10000 + Math.random() * 90000);
      const orderId = `${orderPrefix}${orderNumber}`;
      
      const orderWithMetadata = {
        ...orderData,
        id: orderId,
        userId: userId,
        date: new Date().toISOString(),
        status: "Processing",
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "orders"), orderWithMetadata);
      return { id: docRef.id, ...orderWithMetadata };
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },
  
  // Get all orders for a user
  getUserOrders: async (userId) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef, 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const orders = [];
      
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      return orders;
    } catch (error) {
      console.error("Error getting user orders:", error);
      throw error;
    }
  },
  
  // Get a specific order
  getOrder: async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (orderDoc.exists()) {
        return { id: orderDoc.id, ...orderDoc.data() };
      } else {
        throw new Error("Order not found");
      }
    } catch (error) {
      console.error("Error getting order:", error);
      throw error;
    }
  },
  
  // Delete an order
  deleteOrder: async (orderId) => {
    try {
      await deleteDoc(doc(db, "orders", orderId));
      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  },
  
  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: status });
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }
};