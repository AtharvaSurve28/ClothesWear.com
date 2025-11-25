document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.querySelector('.cart-items');
    const basePriceEl = document.getElementById('base-price');
    const gstAmountEl = document.getElementById('gst-amount');
    const totalPriceEl = document.getElementById('total-price');

    // GST rate - adjust this as needed (18% = 0.18)
    const GST_RATE = 0.18;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            updateSummary(0);
            return;
        }

        let subtotal = 0;
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');

            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Size: ${item.size}</p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <div class="quantity-selector">
                        <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <p class="item-total">$${itemTotal.toFixed(2)}</p>
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        updateSummary(subtotal);
        addEventListeners();
    }

    function updateSummary(subtotal) {
        // If prices in cart already include GST, extract base price
        // If prices don't include GST, use subtotal as base price
        // Assuming prices DON'T include GST (add GST on top)
        const basePrice = subtotal;
        const gstAmount = subtotal > 0 ? subtotal * GST_RATE : 0;
        const total = basePrice + gstAmount;

        basePriceEl.textContent = `${basePrice.toFixed(2)}`;
        gstAmountEl.textContent = `${gstAmount.toFixed(2)}`;
        totalPriceEl.textContent = `${total.toFixed(2)}`;
    }

    function addEventListeners() {
        // Event listeners for quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                const action = e.target.dataset.action;
                updateQuantity(index, action);
            });
        });

        // Event listener for remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                removeItem(index);
            });
        });
    }

    function updateQuantity(index, action) {
        if (action === 'increase') {
            cart[index].quantity++;
        } else if (action === 'decrease') {
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                // If quantity is 1, decreasing removes it
                removeItem(index);
                return;
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartIconGlobally();
    }

    function removeItem(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartIconGlobally();
    }

    function updateCartIconGlobally() {
        const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
        // This is a bit of a trick to update the icon in the parent `index.html`
        try {
            const cartCountEl = window.parent.document.getElementById('cart-count');
            if (cartCountEl) {
                cartCountEl.textContent = cartCount;
            }
        } catch (e) {
            console.warn('Could not update cart icon from iframe/cart page.');
        }
    }

    renderCart();
});