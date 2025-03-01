let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(id, name, price) {
    let item = cart.find(product => product.id === id);
    
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    updateCart();
}

function updateCart() {
    let cartItems = document.getElementById("cart-items");
    let totalPrice = document.getElementById("total-price");
    let cartCount = document.getElementById("cart-count");
    
    cartItems.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        let li = document.createElement("li");
        li.innerHTML = `${item.name} - $${item.price} x ${item.quantity} 
                        <button onclick="removeFromCart(${item.id})">Remove</button>`;
        cartItems.appendChild(li);
    });

    totalPrice.textContent = total;
    cartCount.textContent = count;

    localStorage.setItem("cart", JSON.stringify(cart));
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    alert("Checkout successful! Thank you for your purchase.");
    cart = [];
    updateCart();
    localStorage.removeItem("cart");
}

document.addEventListener("DOMContentLoaded", updateCart);
