// customer.js
import { db, auth } from './firebase-config.js';
import { AuthService } from './services/authService.js';
import { OrderService } from './services/orderService.js';
import { 
  doc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
document.addEventListener("DOMContentLoaded", async function() {
  // Initialize UI components
  const successBanner = document.getElementById('success-banner');
  const emptyOrderState = document.getElementById('empty-order-state');
  const emptyHistoryState = document.getElementById('empty-history-state');
  const orderItemsContainer = document.getElementById('order-items');
  const orderDetailsContainer = document.getElementById('order-details');
  const orderHistoryContainer = document.getElementById('order-history');
  const totalOrdersElement = document.getElementById('total-orders');
  const lifetimePurchasesElement = document.getElementById('lifetime-purchases');
  const latestOrderIdElement = document.getElementById('latest-order-id');
  const logoutButton = document.getElementById('logout-btn');
  
  // UI Profile Elements
  const profileNameElement = document.getElementById('profile-name');
  const profileEmailElement = document.getElementById('profile-email');
  const profileAvatarElement = document.getElementById('profile-avatar');
  const userAvatarElement = document.getElementById('user-avatar');
  
  // Address Elements
  const addressNameElement = document.getElementById('address-name');
  const addressLine1Element = document.getElementById('address-line1');
  const addressLine2Element = document.getElementById('address-line2');
  const addressLine3Element = document.getElementById('address-line3');
  const addressPhoneElement = document.getElementById('address-phone');
  
  // Toast notification
  const toastElement = document.getElementById('toast-notification');
  
  // Check if user is authenticated
  let currentUser = await AuthService.getCurrentUser();
  if (!currentUser) {
    // Check if we have a saved user in sessionStorage
    const savedUser = sessionStorage.getItem('currentUser');
    if (!savedUser) {
      // Redirect to login page if not authenticated
      window.location.href = 'login.html';
      return;
    }
    currentUser = JSON.parse(savedUser);
  }
  
  // Get user profile data
  let userProfile;
  try {
    userProfile = await AuthService.getUserProfile(currentUser.uid);
    
    // Update UI with user data
    const initials = getInitials(userProfile.name || userProfile.email);
    profileAvatarElement.textContent = initials;
    userAvatarElement.textContent = initials;
    profileNameElement.textContent = userProfile.name || 'User';
    profileEmailElement.textContent = userProfile.email;
    
    // Update address information if available
    if (userProfile.address) {
      addressNameElement.textContent = userProfile.name || 'User';
      addressLine1Element.textContent = userProfile.address.street || '';
      addressLine2Element.textContent = `${userProfile.address.city || ''}, ${userProfile.address.state || ''} ${userProfile.address.zip || ''}`;
      addressLine3Element.textContent = userProfile.address.country || '';
      addressPhoneElement.textContent = userProfile.phone || '';
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    showToast("Error loading user profile");
  }
  
  // Load user orders
  let orders = [];
  try {
    // Set up real-time listener for orders
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef, 
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    
    onSnapshot(q, (querySnapshot) => {
      orders = [];
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        orders.push({
          id: doc.id,
          ...orderData
        });
      });
      
      // Update UI with order data
      updateOrdersUI(orders);
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    showToast("Error loading orders");
  }
  
  // Check for order success parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('orderSuccess') === 'true') {
    showSuccessBanner();
    
    // Clean up URL without refreshing page
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }
  
  // Set up event listeners
  logoutButton.addEventListener('click', handleLogout);
  
  // Helper function to update orders UI
  function updateOrdersUI(orders) {
    // Check if there are any orders
    if (orders.length === 0) {
      emptyOrderState.classList.remove('hidden');
      emptyHistoryState.classList.remove('hidden');
      orderDetailsContainer.classList.add('hidden');
      return;
    }
    
    // Hide empty states
    emptyOrderState.classList.add('hidden');
    emptyHistoryState.classList.add('hidden');
    orderDetailsContainer.classList.remove('hidden');
    
    // Get latest order
    const latestOrder = orders[0];
    
    // Update order statistics
    totalOrdersElement.textContent = orders.length;
    
    // Calculate lifetime purchases
    const lifetimePurchases = orders.reduce((total, order) => {
      return total + (order.totalAmount || 0);
    }, 0);
    lifetimePurchasesElement.textContent = `$${lifetimePurchases.toFixed(2)}`;
    
    // Update latest order ID
    latestOrderIdElement.textContent = latestOrder.id;
    
    // Render latest order items
    renderOrderItems(latestOrder);
    
    // Render order history
    renderOrderHistory(orders);
  }
  
  // Render items from latest order
  function renderOrderItems(order) {
    orderItemsContainer.innerHTML = '';
    
    if (!order.items || order.items.length === 0) {
      orderItemsContainer.innerHTML = '<div class="text-center py-4">No items found in this order.</div>';
      return;
    }
    
    order.items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'flex items-center justify-between py-3 border-b';
      itemElement.innerHTML = `
        <div class="flex items-center">
          <div class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-4">
            <img src="${item.imageUrl || 'images/placeholder-product.svg'}" alt="${item.name}" class="max-w-full max-h-full p-2">
          </div>
          <div>
            <h4 class="font-medium">${item.name}</h4>
            <p class="text-sm text-gray-500">Qty: ${item.quantity}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-medium">$${(item.price * item.quantity).toFixed(2)}</p>
          <p class="text-sm text-gray-500">$${item.price.toFixed(2)} each</p>
        </div>
      `;
      orderItemsContainer.appendChild(itemElement);
    });
    
    // Add order summary
    const summaryElement = document.createElement('div');
    summaryElement.className = 'mt-4 pt-4 border-t';
    summaryElement.innerHTML = `
      <div class="flex justify-between mb-2">
        <span>Subtotal</span>
        <span>$${order.subtotal?.toFixed(2) || '0.00'}</span>
      </div>
      <div class="flex justify-between mb-2">
        <span>Shipping</span>
        <span>$${order.shipping?.toFixed(2) || '0.00'}</span>
      </div>
      <div class="flex justify-between mb-2">
        <span>Tax</span>
        <span>$${order.tax?.toFixed(2) || '0.00'}</span>
      </div>
      <div class="flex justify-between font-medium text-lg mt-2 pt-2 border-t">
        <span>Total</span>
        <span>$${order.totalAmount?.toFixed(2) || '0.00'}</span>
      </div>
    `;
    orderItemsContainer.appendChild(summaryElement);
  }
  
  // Render order history
  function renderOrderHistory(orders) {
    orderHistoryContainer.innerHTML = '';
    
    orders.slice(0, 5).forEach(order => {
      const date = new Date(order.createdAt.toDate());
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const orderElement = document.createElement('div');
      orderElement.className = 'flex items-center justify-between py-3 border-b';
      orderElement.innerHTML = `
        <div>
          <h4 class="font-medium">Order #${order.id.substring(0, 8)}</h4>
          <p class="text-sm text-gray-500">${formattedDate}</p>
          <p class="text-sm">${order.items?.length || 0} item(s)</p>
        </div>
        <div class="text-right">
          <p class="font-medium">$${order.totalAmount?.toFixed(2) || '0.00'}</p>
          <span class="inline-block px-2 py-1 text-xs rounded ${getStatusColor(order.status)}">
            ${order.status || 'Processing'}
          </span>
        </div>
      `;
      
      // Add click event to view order details
      orderElement.addEventListener('click', () => {
        renderOrderItems(order);
        latestOrderIdElement.textContent = order.id;
        
        // Highlight selected order
        const allOrders = orderHistoryContainer.querySelectorAll('div.border-b');
        allOrders.forEach(el => {
          el.classList.remove('bg-gray-50');
        });
        orderElement.classList.add('bg-gray-50');
      });
      
      orderHistoryContainer.appendChild(orderElement);
    });
  }
  
  // Helper function to get color based on order status
  function getStatusColor(status) {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Helper function to get initials from name
  function getInitials(name) {
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  
  // Helper function to show success banner
  function showSuccessBanner() {
    successBanner.classList.remove('hidden');
    setTimeout(() => {
      successBanner.classList.add('hidden');
    }, 5000);
  }
  
  // Helper function to show toast notification
  function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.remove('hidden');
    setTimeout(() => {
      toastElement.classList.add('hidden');
    }, 3000);
  }
  
  // Handle logout
  async function handleLogout() {
    try {
      await AuthService.logout();
      sessionStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    } catch (error) {
      console.error("Error logging out:", error);
      showToast("Error logging out");
    }
  }
});