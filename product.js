// Product page - loads and displays product details by ID from URL

// Cart state
let cart = [];

// DOM Elements
const productContent = document.getElementById('productContent');
const cartCount = document.getElementById('cartCount');
const mobileMenuCartCount = document.getElementById('mobileMenuCartCount');

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    if (!productContent) return;
    productContent.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading product details...</p>
        </div>
    `;
}

/**
 * Show error message
 */
function showError(errorMessage) {
    if (!productContent) return;
    productContent.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error Loading Product</h3>
            <p>${errorMessage}</p>
            <a href="../index.html" class="error-retry-btn" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--accent); color: white; text-decoration: none; border-radius: 6px;">Back to Home</a>
        </div>
    `;
}

/**
 * Show notification message
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    const bgColor = type === 'error' ? 'var(--danger)' : 'var(--accent)';
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
    let index = id;
    if (typeof id === 'string') {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
        }
        index = Math.abs(hash);
    }
    return gradients[(index - 1) % gradients.length];
}

/**
 * Load cart from localStorage
 */
function loadCartFromStorage() {
    const storedCart = localStorage.getItem('movieCart');
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
        } catch (error) {
            cart = [];
        }
    }
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
    if (mobileMenuCartCount) {
        mobileMenuCartCount.textContent = totalItems;
    }
}

function addToCart(product) {
    // Check if product already in cart
    const existingItem = cart.find(item => String(item.id) === String(product.id));
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            imageAlt: product.imageAlt || product.title,
            year: product.year,
            genre: product.genre,
            rating: product.rating,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    showNotification(`${product.title} added to cart!`);
}


function saveCartToStorage() {
    localStorage.setItem('movieCart', JSON.stringify(cart));
}


function displayProduct(product) {
    if (!productContent) return;
    
    // Use API image if available, otherwise use gradient
    let imageContent;
    if (product.image) {
        imageContent = `<img src="${product.image}" alt="${product.imageAlt || product.title}" class="product-poster-img" onerror="this.parentElement.innerHTML='<div style=\\'background: ${getGradient(product.id)};\\'>🎬</div>'">`;
    } else {
        imageContent = `<div style="background: ${getGradient(product.id)};">🎬</div>`;
    }
    
    const priceDisplay = product.onSale && product.discountedPrice 
        ? `<span style="text-decoration: line-through; color: var(--text-secondary); margin-right: 0.5rem; font-size: 1.2rem;">$${product.originalPrice.toFixed(2)}</span><span style="color: var(--success);">$${product.price.toFixed(2)}</span>`
        : `$${product.price.toFixed(2)}`;
    
    productContent.innerHTML = `
        <div class="product-detail">
            <div class="product-image">
                ${imageContent}
            </div>
            <div class="product-info">
                <h1 class="product-title">${product.title}</h1>
                <div class="product-meta">
                    <span>📅 ${product.year}</span>
                    <span>🎬 ${product.genre}</span>
                    <span>⭐ ${product.rating}/10</span>
                </div>
                <div class="product-price">${priceDisplay}</div>
                <p class="product-description">${product.description || 'No description available.'}</p>
                <div class="product-actions">
                    <button class="btn btn-primary" id="addToCartBtn">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener for Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
        });
    }
}

/**
 * Get product ID from URL
 */
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Initialize product page
 */
async function init() {
    try {
        showLoadingIndicator();
        loadCartFromStorage();
        
        // Get product ID from URL
        const productId = getProductIdFromURL();
        
        if (!productId) {
            throw new Error('No product ID provided in URL. Please visit this page from a product link.');
        }
        
        // Fetch product from API
        const product = await fetchProductById(productId);
        
        if (!product) {
            throw new Error('Product not found.');
        }
        
        // Display product
        displayProduct(product);
        
    } catch (error) {
        showError(error.message);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


