// Get different gradients for variety (handles UUIDs)
function getGradient(id) {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    // Handle UUID strings by converting them to a numeric index
    let index = id;
    if (typeof id === 'string') {
        // Simple hash to convert UUID to number
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
        }
        index = Math.abs(hash);
    }
    return gradients[(index - 1) % gradients.length];
}

// Get poster image for checkout item (uses API image if available)
function getPosterImage(item) {
    // Use API image if available
    if (item.image) {
        return `<img src="${item.image}" alt="${item.imageAlt || item.title}" class="checkout-poster-img" onerror="this.parentElement.innerHTML='<div style=\\'background: ${getGradient(item.id)};\\'>🎬</div>'">`;
    }
    // Fallback to gradient
    return null;
}

// Load and display cart items
function loadCheckoutItems() {
    const checkoutContent = document.getElementById('checkoutContent');
    const checkoutSummary = document.getElementById('checkoutSummary');
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('movieCart') || '[]');
    
    if (cart.length === 0) {
        checkoutContent.innerHTML = `
            <div class="empty-checkout">
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any movies to your cart yet.</p>
                <a href="../index.html" class="continue-shopping-btn-empty">Continue Shopping</a>
            </div>
        `;
        checkoutSummary.style.display = 'none';
        // Update cart count badge (will show 0)
        updateCartCount();
        return;
    }
    
    // Render cart items
    checkoutContent.innerHTML = '';
    cart.forEach((item, index) => {
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        
        // Get poster image or fallback to gradient
        const posterImage = getPosterImage(item);
        let imageContent;
        if (posterImage) {
            imageContent = posterImage;
        } else {
            imageContent = `<div style="background: ${getGradient(item.id)};">🎬</div>`;
        }
        
        checkoutItem.innerHTML = `
            <button class="remove-item-btn" data-item-id="${item.id}" aria-label="Remove item">✕</button>
            <div class="checkout-item-image">
                ${imageContent}
            </div>
            <div class="checkout-item-info">
                <div class="checkout-item-title">${item.title}</div>
                <div class="checkout-item-details">
                    📅 ${item.year} • 🎬 ${item.genre} • ⭐ ${item.rating}/10<br>
                    <div class="quantity-controls">
                        <label>Quantity:</label>
                        <input type="number" 
                               class="quantity-input" 
                               min="1" 
                               value="${item.quantity}" 
                               data-item-index="${index}"
                               data-item-id="${item.id}">
                    </div>
                </div>
            </div>
            <div class="checkout-item-price" data-item-id="${item.id}">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        checkoutContent.appendChild(checkoutItem);
    });
    
    // Add event listeners for quantity changes
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', updateQuantity);
        input.addEventListener('input', updateQuantity);
    });
    
    // Add event listeners for remove buttons
    const removeButtons = document.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', removeItem);
    });
    
    checkoutSummary.style.display = 'block';
    updateSummary();
}

// Update quantity function
function updateQuantity(e) {
    const input = e.target;
    let newQuantity = parseInt(input.value);
    
    // Ensure quantity is at least 1
    if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1;
        input.value = 1;
    }
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('movieCart') || '[]');
    // Handle UUIDs (strings) - don't use parseInt for UUIDs
    const itemId = input.dataset.itemId;
    
    if (!itemId) return;
    
    // Find and update the item (compare as strings for UUID compatibility)
    const item = cart.find(item => String(item.id) === String(itemId));
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('movieCart', JSON.stringify(cart));
        
        // Update the price display (use the original itemId string for selector)
        const priceElement = document.querySelector(`[data-item-id="${itemId}"].checkout-item-price`);
        if (priceElement) {
            priceElement.textContent = `$${(item.price * newQuantity).toFixed(2)}`;
        }
        
        // Update summary
        updateSummary();
    }
}

// Update summary totals
function updateSummary() {
    const cart = JSON.parse(localStorage.getItem('movieCart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Update cart count badge
    updateCartCount();
}

// Update cart count badge in header
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const mobileMenuCartCount = document.getElementById('mobileMenuCartCount');
    const cart = JSON.parse(localStorage.getItem('movieCart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
    
    // Update mobile menu cart count
    if (mobileMenuCartCount) {
        mobileMenuCartCount.textContent = totalItems;
    }
}

// Store item to be removed
let itemToRemove = null;

// Remove item function
function removeItem(e) {
    const button = e.target;
    // Handle UUIDs (strings) - don't use parseInt for UUIDs
    const itemId = button.dataset.itemId;
    
    if (!itemId) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('movieCart') || '[]');
    
    // Find the item to get its title (compare as strings)
    const item = cart.find(item => String(item.id) === String(itemId));
    
    if (item) {
        itemToRemove = itemId; // Store as string
        
        // Update message
        const confirmMessage = document.getElementById('confirmMessage');
        confirmMessage.textContent = `Are you sure you want to remove "${item.title}" from your cart?`;
        
        // Show modal
        const confirmModal = document.getElementById('confirmModal');
        confirmModal.style.display = 'flex';
    }
}

// Show notification message
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    const bgColor = type === 'error' ? '#ff4444' : '#00d4ff';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Complete purchase function
function completePurchase() {
    const cart = JSON.parse(localStorage.getItem('movieCart') || '[]');
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Save order to localStorage before clearing cart
    localStorage.setItem('lastOrder', JSON.stringify(cart));
    
    // Clear cart
    localStorage.removeItem('movieCart');
    
    // Redirect to success page
    window.location.href = 'confirmation/index.html';
}

// Confirm removal
function confirmRemoval() {
    if (!itemToRemove) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('movieCart') || '[]');
    
    // Remove the item from cart (compare as strings for UUID compatibility)
    const idToRemove = String(itemToRemove);
    const updatedCart = cart.filter(item => String(item.id) !== idToRemove);
    localStorage.setItem('movieCart', JSON.stringify(updatedCart));
    
    // Close modal
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.style.display = 'none';
    
    // Reload checkout items
    loadCheckoutItems();
    // Update cart count badge
    updateCartCount();
    
    itemToRemove = null;
}

// Cancel removal
function cancelRemoval() {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.style.display = 'none';
    itemToRemove = null;
}

// Initialize checkout page
function init() {
    loadCheckoutItems();
    // Update cart count badge on page load
    updateCartCount();
    
    // Setup complete purchase button
    const completePurchaseBtn = document.getElementById('completePurchaseBtn');
    if (completePurchaseBtn) {
        completePurchaseBtn.addEventListener('click', completePurchase);
    }
    
    // Setup confirmation modal buttons
    const confirmYes = document.getElementById('confirmYes');
    if (confirmYes) {
        confirmYes.addEventListener('click', confirmRemoval);
    }
    
    const confirmNo = document.getElementById('confirmNo');
    if (confirmNo) {
        confirmNo.addEventListener('click', cancelRemoval);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

