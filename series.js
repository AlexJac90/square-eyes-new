// Product data - loaded from API
let series = [];
let movies = [];

// Cart state
let cart = [];

// DOM Elements
const seriesGrid = document.getElementById('seriesGrid');
const cartSidebar = document.getElementById('cart');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const seriesModal = document.getElementById('seriesModal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');
const searchBar = document.getElementById('searchBar');

// Filter state
let currentCategory = null;

/**
 * Show loading indicator in the series grid
 */
function showLoadingIndicator() {
    if (!seriesGrid) return;
    seriesGrid.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading series...</p>
        </div>
    `;
}

/**
 * Show error message with retry option
 */
function showError(errorMessage, retryCallback) {
    if (!seriesGrid) return;
    seriesGrid.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error Loading Series</h3>
            <p>${errorMessage}</p>
            <button class="error-retry-btn" onclick="location.reload()">Retry</button>
        </div>
    `;
    
    showNotification(`Error: ${errorMessage}`, 'error');
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

// Get unique categories from series
function getUniqueCategories() {
    const categories = [...new Set(series.map(s => s.genre))];
    return categories.sort();
}

// Get unique categories from movies
function getUniqueMovieCategories() {
    const categories = [...new Set(movies.map(movie => movie.genre))];
    return categories.sort();
}

// Populate dropdown menus
function populateDropdowns() {
    // Populate movies dropdown
    const moviesDropdown = document.getElementById('moviesDropdown');
    const movieCategories = getUniqueMovieCategories();
    
    if (moviesDropdown && moviesDropdown.children.length === 0) {
        // Add "All Categories" option
        const allLink = document.createElement('a');
        allLink.href = '#';
        allLink.className = 'dropdown-item';
        allLink.textContent = 'All Categories';
        allLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
        moviesDropdown.appendChild(allLink);
        
        // Add category options
        movieCategories.forEach(category => {
            const categoryLink = document.createElement('a');
            categoryLink.href = '#';
            categoryLink.className = 'dropdown-item';
            categoryLink.textContent = category;
            categoryLink.dataset.category = category;
            categoryLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.setItem('selectedMovieCategory', category);
                window.location.href = 'index.html';
            });
            moviesDropdown.appendChild(categoryLink);
        });
    }
    
    // Populate series dropdown
    const seriesDropdown = document.getElementById('seriesDropdown');
    const seriesCategories = getUniqueCategories();
    
    if (seriesDropdown && seriesDropdown.children.length === 0) {
        // Add "All Categories" option
        const allLink = document.createElement('a');
        allLink.href = '#';
        allLink.className = 'dropdown-item';
        allLink.textContent = 'All Categories';
        allLink.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveCategory(null, allLink);
            filterByCategory(null);
        });
        seriesDropdown.appendChild(allLink);
        
        // Add category options
        seriesCategories.forEach(category => {
            const categoryLink = document.createElement('a');
            categoryLink.href = '#';
            categoryLink.className = 'dropdown-item';
            categoryLink.textContent = category;
            categoryLink.dataset.category = category;
            categoryLink.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveCategory(category, categoryLink);
                filterByCategory(category);
            });
            seriesDropdown.appendChild(categoryLink);
        });
    }
}

// Set active category in dropdown
function setActiveCategory(category, clickedLink) {
    const dropdown = document.getElementById('seriesDropdown');
    if (dropdown) {
        const allItems = dropdown.querySelectorAll('.dropdown-item');
        allItems.forEach(item => item.classList.remove('active'));
        if (clickedLink) {
            clickedLink.classList.add('active');
        }
    }
    currentCategory = category;
}

// Filter series by category
function filterByCategory(category) {
    currentCategory = category;
    const currentSearch = searchBar ? searchBar.value : '';
    renderSeries(currentSearch, category);
}

// Populate mobile menu
function populateMobileMenu() {
    const mobileMoviesCategories = document.getElementById('mobileMoviesCategories');
    const mobileSeriesCategories = document.getElementById('mobileSeriesCategories');
    
    const movieCategories = getUniqueMovieCategories();
    const seriesCategories = getUniqueCategories();
    
    // Populate movies categories
    if (mobileMoviesCategories && mobileMoviesCategories.children.length === 0) {
        const allLink = document.createElement('a');
        allLink.href = '#';
        allLink.textContent = 'All Categories';
        allLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            localStorage.setItem('selectedMovieCategory', '');
            window.location.href = 'index.html';
        });
        mobileMoviesCategories.appendChild(allLink);
        
        movieCategories.forEach(category => {
            const categoryLink = document.createElement('a');
            categoryLink.href = '#';
            categoryLink.textContent = category;
            categoryLink.dataset.category = category;
            categoryLink.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileMenu();
                localStorage.setItem('selectedMovieCategory', category);
                window.location.href = 'index.html';
            });
            mobileMoviesCategories.appendChild(categoryLink);
        });
    }
    
    // Populate series categories
    if (mobileSeriesCategories && mobileSeriesCategories.children.length === 0) {
        const allLink = document.createElement('a');
        allLink.href = '#';
        allLink.textContent = 'All Categories';
        allLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileMenu();
            setActiveCategory(null, null);
            filterByCategory(null);
        });
        mobileSeriesCategories.appendChild(allLink);
        
        seriesCategories.forEach(category => {
            const categoryLink = document.createElement('a');
            categoryLink.href = '#';
            categoryLink.textContent = category;
            categoryLink.dataset.category = category;
            categoryLink.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileMenu();
                setActiveCategory(category, null);
                filterByCategory(category);
            });
            mobileSeriesCategories.appendChild(categoryLink);
        });
    }
}

// Mobile menu functions
function openMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const toggle = document.getElementById('mobileMenuToggle');
    
    if (mobileMenu && overlay && toggle) {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        toggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const toggle = document.getElementById('mobileMenuToggle');
    
    if (mobileMenu && overlay && toggle) {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        toggle.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Initialize the page - now async
async function init() {
    try {
        showLoadingIndicator();
        
        // Fetch movies and series from API
        const [moviesData, seriesData] = await Promise.all([
            fetchMovies(),
            fetchSeries()
        ]);
        
        series = seriesData;
        movies = moviesData;
        
        // If no series found, show empty state message
        if (series.length === 0) {
            const allProducts = await fetchAllProducts();
            if (allProducts.length === 0) {
                throw new Error('No products found in the database');
            }
            // Don't show all products - just show empty state
            // Keep series array empty so renderSeries will show the empty message
        }
        
        populateDropdowns();
        populateMobileMenu();
        
        // Check if there's a stored category from navigation
        const storedCategory = localStorage.getItem('selectedSeriesCategory');
        if (storedCategory) {
            const dropdown = document.getElementById('seriesDropdown');
            if (dropdown) {
                const categoryLink = dropdown.querySelector(`[data-category="${storedCategory}"]`);
                if (categoryLink) {
                    setActiveCategory(storedCategory, categoryLink);
                    filterByCategory(storedCategory);
                }
            }
            localStorage.removeItem('selectedSeriesCategory');
        } else {
            renderSeries();
        }
        
        loadCartFromStorage();
        setupEventListeners();
    } catch (error) {
        showError(error.message, () => {
            location.reload();
        });
    }
}

// Render series to the grid
function renderSeries(searchQuery = '', category = null) {
    if (!seriesGrid) return;
    seriesGrid.innerHTML = '';
    
    // If no series at all (not just filtered), show "No series available" message
    if (series.length === 0) {
        seriesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                <h2 style="font-size: 2rem; color: var(--text-primary); margin-bottom: 1rem;">No Series Available</h2>
                <p style="color: var(--text-secondary); font-size: 1.2rem; margin-bottom: 2rem;">
                    We currently don't have any series available in our catalog.
                </p>
                <p style="color: var(--text-secondary); font-size: 1rem;">
                    Please check back later or browse our <a href="index.html" style="color: var(--accent); text-decoration: none;">movies collection</a>.
                </p>
            </div>
        `;
        return;
    }
    
    // Apply category filter
    let filteredSeries = category 
        ? series.filter(s => s.genre === category)
        : series;
    
    // Apply search filter
    if (searchQuery) {
        filteredSeries = filteredSeries.filter(s => 
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.year.toString().includes(searchQuery)
        );
    }
    
    if (filteredSeries.length === 0) {
        seriesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); font-size: 1.2rem; padding: 3rem;">No series found matching your search.</p>';
        return;
    }
    
    filteredSeries.forEach(s => {
        const seriesCard = createSeriesCard(s);
        seriesGrid.appendChild(seriesCard);
    });
}

// Create a series card element
function createSeriesCard(seriesItem) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    // Use API image if available, otherwise use gradient
    let imageContent;
    if (seriesItem.image) {
        imageContent = `<img src="${seriesItem.image}" alt="${seriesItem.imageAlt || seriesItem.title}" class="movie-poster-img" onerror="this.parentElement.innerHTML='<div style=\\'background: ${getGradient(seriesItem.id)};\\'>📺</div>'">`;
    } else {
        imageContent = `<div style="background: ${getGradient(seriesItem.id)};">📺</div>`;
    }
    
    const priceDisplay = seriesItem.onSale && seriesItem.discountedPrice 
        ? `<span style="text-decoration: line-through; color: var(--text-secondary); font-size: 0.9rem; margin-right: 0.5rem;">$${seriesItem.originalPrice.toFixed(2)}</span><span style="color: var(--success);">$${seriesItem.price.toFixed(2)}</span>`
        : `$${seriesItem.price.toFixed(2)}`;
    
    card.innerHTML = `
        <div class="movie-image">
            ${imageContent}
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${seriesItem.title}</h3>
            <div class="movie-details">
                <span class="movie-year">${seriesItem.year}</span>
                <span class="movie-rating">⭐ ${seriesItem.rating}/10</span>
                <span class="movie-price">${priceDisplay}</span>
            </div>
            <div class="movie-actions">
                <button class="btn btn-secondary">View Details</button>
                <button class="btn btn-primary" data-add-to-cart="${seriesItem.id}">Add to Cart</button>
            </div>
        </div>
    `;
    
    // Add click handlers
    const viewDetailsBtn = card.querySelector('.btn-secondary');
    const addToCartBtn = card.querySelector('[data-add-to-cart]');
    
    viewDetailsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = `product/index.html?id=${seriesItem.id}`;
    });
    
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(seriesItem);
    });
    
    return card;
}

// Get different gradients for variety
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
    // Convert UUID string to numeric index if needed
    let index = typeof id === 'number' ? id : 0;
    if (typeof id === 'string') {
        for (let i = 0; i < id.length; i++) {
            index += id.charCodeAt(i);
        }
    }
    return gradients[index % gradients.length];
}

// Cart functions
function addToCart(seriesItem) {
    const existingItem = cart.find(item => item.id === seriesItem.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...seriesItem,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    showNotification(`${seriesItem.title} added to cart!`);
}

function removeFromCart(seriesId) {
    if (!seriesId) {
        showNotification('Invalid item ID', 'error');
        return;
    }
    
    // Convert both to strings for reliable comparison (handles UUIDs and numbers)
    const idToRemove = String(seriesId).trim();
    const initialLength = cart.length;
    
    // Filter out the item to remove
    cart = cart.filter(item => {
        if (!item || !item.id) return true; // Keep items without IDs (shouldn't happen)
        return String(item.id).trim() !== idToRemove;
    });
    
    // Only update if something was actually removed
    if (cart.length < initialLength) {
        saveCartToStorage();
        updateCartUI();
        showNotification('Item removed from cart');
    } else {
        // Item wasn't found - this could happen if IDs don't match
        showNotification('Item not found in cart. Please refresh the page.', 'error');
    }
}

function updateCartUI() {
    // Update cart count badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
    
    // Update mobile menu cart count
    const mobileMenuCartCount = document.getElementById('mobileMenuCartCount');
    if (mobileMenuCartCount) {
        mobileMenuCartCount.textContent = totalItems;
    }
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = createCartItem(item);
            cartItems.appendChild(cartItem);
        });
        checkoutBtn.disabled = false;
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

function createCartItem(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    
    // Store the item ID for reliable access
    const itemId = String(item.id);
    
    cartItem.innerHTML = `
        <div class="cart-item-image" style="background: ${getGradient(item.id)};">
            📺
        </div>
        <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
        </div>
        <button class="cart-item-remove" data-remove="${itemId}" type="button" aria-label="Remove ${item.title} from cart">Remove</button>
    `;
    
    // Also add direct event listener as backup
    const removeBtn = cartItem.querySelector('.cart-item-remove');
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            removeFromCart(itemId);
            return false;
        });
    }
    
    return cartItem;
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Modal functions
function openSeriesModal(seriesItem) {
    // Use API image if available, otherwise use gradient
    let modalImageContent;
    if (seriesItem.image) {
        modalImageContent = `<img src="${seriesItem.image}" alt="${seriesItem.imageAlt || seriesItem.title}" class="modal-poster-img" onerror="this.parentElement.innerHTML='<div style=\\'background: ${getGradient(seriesItem.id)};\\'>📺</div>'">`;
    } else {
        modalImageContent = `<div style="background: ${getGradient(seriesItem.id)};">📺</div>`;
    }
    
    const priceDisplay = seriesItem.onSale && seriesItem.discountedPrice 
        ? `<span style="text-decoration: line-through; color: var(--text-secondary); margin-right: 0.5rem;">$${seriesItem.originalPrice.toFixed(2)}</span><span style="color: var(--success);">$${seriesItem.price.toFixed(2)}</span>`
        : `$${seriesItem.price.toFixed(2)}`;
    
    modalBody.innerHTML = `
        <div class="modal-movie-image">
            ${modalImageContent}
        </div>
        <h2 class="modal-movie-title">${seriesItem.title}</h2>
        <div class="modal-movie-meta">
            <span>📅 ${seriesItem.year}</span>
            <span>🎬 ${seriesItem.genre}</span>
            <span>⭐ ${seriesItem.rating}/10</span>
        </div>
        <p class="modal-movie-description">${seriesItem.description}</p>
        <div class="modal-movie-price">${priceDisplay}</div>
        <div class="modal-actions">
            <button class="btn btn-primary" data-modal-add-cart="${seriesItem.id}">Add to Cart</button>
        </div>
    `;
    
    const addToCartBtn = modalBody.querySelector('[data-modal-add-cart]');
    addToCartBtn.addEventListener('click', () => {
        addToCart(seriesItem);
        closeSeriesModal();
    });
    
    seriesModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSeriesModal() {
    seriesModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Local storage functions
function saveCartToStorage() {
    localStorage.setItem('movieCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('movieCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Setup event listeners
function setupEventListeners() {
    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });
    
    closeModal.addEventListener('click', closeSeriesModal);
    
    seriesModal.addEventListener('click', (e) => {
        if (e.target === seriesModal) {
            closeSeriesModal();
        }
    });
    
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            window.location.href = 'checkout/index.html';
        }
    });
    
    // Event delegation for remove buttons in cart (use capture phase to ensure it fires)
    if (cartItems) {
        cartItems.addEventListener('click', (e) => {
            // Check if clicked element is the button or inside it
            const removeBtn = e.target.closest('.cart-item-remove');
            if (removeBtn) {
                e.preventDefault();
                e.stopPropagation();
                const itemId = removeBtn.getAttribute('data-remove');
                if (itemId) {
                    removeFromCart(itemId);
                }
                return false;
            }
        }, true); // Use capture phase
    }
    
    // Search functionality
    searchBar.addEventListener('input', (e) => {
        renderSeries(e.target.value, currentCategory);
    });
    
    // Mobile menu event listeners
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', openMobileMenu);
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Mobile theme toggle
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.click();
            } else {
                if (currentTheme === 'light') {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'dark');
                    updateMobileThemeDisplay('dark');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    localStorage.setItem('theme', 'light');
                    updateMobileThemeDisplay('light');
                }
            }
        });
        
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        updateMobileThemeDisplay(currentTheme === 'light' ? 'light' : 'dark');
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                const newTheme = themeToggle.checked ? 'light' : 'dark';
                updateMobileThemeDisplay(newTheme);
            });
        }
        
        const observer = new MutationObserver(() => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            updateMobileThemeDisplay(currentTheme === 'light' ? 'light' : 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
}

// Update mobile theme display
function updateMobileThemeDisplay(theme) {
    const mobileThemeIcon = document.querySelector('.mobile-menu-theme-icon');
    const mobileThemeText = document.querySelector('.mobile-menu-theme-text');
    
    if (mobileThemeIcon && mobileThemeText) {
        if (theme === 'light') {
            mobileThemeIcon.textContent = '☀️';
            mobileThemeText.textContent = 'Light Mode';
        } else {
            mobileThemeIcon.textContent = '🌙';
            mobileThemeText.textContent = 'Dark Mode';
        }
    }
}

// Add notification animations to styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
