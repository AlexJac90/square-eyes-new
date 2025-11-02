// Get poster image for order item (uses API image if available)
function getPosterImage(item) {
    // Use API image if available
    if (item.image) {
        const gradient = getGradient(item.id);
        return `<img src="${item.image}" alt="${item.imageAlt || item.title}" class="order-poster-img" onerror="this.parentElement.innerHTML='<div style=\\'background: ${gradient};\\'>🎬</div>'">`;
    }
    // Fallback to gradient
    return null;
}

// Get gradient for fallback
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
    // Handle UUID strings by converting to numeric index
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

// Load and display order details
function loadOrderDetails() {
    const orderDetails = document.getElementById('orderDetails');
    
    // Get order from localStorage (saved before clearing cart)
    const order = JSON.parse(localStorage.getItem('lastOrder') || '[]');
    
    if (order.length === 0) {
        // If no order found, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    let orderHTML = '<h3>Your Order</h3>';
    
    order.forEach(item => {
        const posterImage = getPosterImage(item);
        let imageContent = '';
        if (posterImage) {
            imageContent = `<div class="order-item-image">${posterImage}</div>`;
        } else {
            imageContent = `<div class="order-item-image" style="background: ${getGradient(item.id)};">🎬</div>`;
        }
        
        orderHTML += `
            <div class="order-item">
                ${imageContent}
                <div class="order-item-info">
                    <div class="order-item-title">${item.title}</div>
                    <div class="order-item-meta">Quantity: ${item.quantity} × $${item.price.toFixed(2)}</div>
                </div>
                <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    });
    
    // Calculate totals
    const subtotal = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    orderHTML += `
        <div class="order-summary">
            <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Tax (10%)</span>
                <span class="summary-value">$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total-row">
                <span class="summary-label">Total</span>
                <span class="summary-value">$${total.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    orderDetails.innerHTML = orderHTML;
    
    // Clear the order from localStorage after displaying
    localStorage.removeItem('lastOrder');
}

// Initialize page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadOrderDetails);
} else {
    loadOrderDetails();
}


