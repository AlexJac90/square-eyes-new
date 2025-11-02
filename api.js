// API Configuration
const API_CONFIG = {
    baseURL: 'https://api.noroff.dev/api/v1/square-eyes',
    fallbackURL: './data.json', // Fallback for local testing
    timeout: 10000
};

// Cache for API responses
const apiCache = {
    allProducts: null,
    movies: null,
    series: null
};

/**
 * Generic API fetch function with error handling
 * @param {string} url - The URL to fetch from
 * @returns {Promise<Object>} The parsed JSON response
 */
async function fetchData(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your internet connection and try again.');
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection and try again.');
        }
        
        throw error;
    }
}

/**
 * Transform API product to internal format
 * @param {Object} product - Product from API
 * @returns {Object} Transformed product
 */
function transformProduct(product) {
    if (!product) {
        throw new Error('Product is null or undefined');
    }
    
    return {
        id: product.id || String(Math.random()),
        title: product.title || 'Untitled',
        year: product.released || product.year || '',
        price: product.onSale && product.discountedPrice ? product.discountedPrice : (product.price || 0),
        originalPrice: product.price || 0,
        discountedPrice: product.discountedPrice || null,
        onSale: product.onSale || false,
        genre: product.genre || 'Unknown',
        rating: product.rating || '0',
        description: product.description || '',
        image: product.image?.url || product.image || '',
        imageAlt: product.image?.alt || product.title || 'Image',
        tags: product.tags || [],
        favorite: product.favorite || false
    };
}

/**
 * Convert UUID string to numeric index for gradient selection
 * @param {string} id - UUID string
 * @returns {number} Numeric index
 */
function getIdIndex(id) {
    if (typeof id === 'number') return id;
    // Convert UUID string to a number by summing character codes
    let sum = 0;
    for (let i = 0; i < id.length; i++) {
        sum += id.charCodeAt(i);
    }
    return sum;
}

/**
 * Filter products by type (movie or series)
 * @param {Array} products - Array of products
 * @param {string} type - 'movie' or 'series'
 * @returns {Array} Filtered products
 */
function filterByType(products, type) {
    if (!products || products.length === 0) return [];
    
    return products.filter(product => {
        if (!product) return false;
        
        const tags = product.tags || [];
        const lowerTags = tags.map(tag => String(tag).toLowerCase());
        const titleLower = (product.title || '').toLowerCase();
        
        // Check if product has tags indicating type
        if (type === 'movie') {
            // If explicitly tagged as series/tv, exclude it
            if (lowerTags.includes('series') || lowerTags.includes('tv')) {
                return false;
            }
            // If explicitly tagged as movie, include it
            if (lowerTags.includes('movie')) {
                return true;
            }
           
            if (titleLower.includes('season')) {
                return false;
            }
            return true;
        } else if (type === 'series') {
            // Include if explicitly tagged as series/tv
            if (lowerTags.includes('series') || lowerTags.includes('tv') || lowerTags.includes('tv-series')) {
                return true;
            }
            // Include if title contains series indicators
            if (titleLower.includes('season') || titleLower.includes('episode') || titleLower.includes('series')) {
                return true;
            }
            
            return false;
        }
        return true;
    });
}

/**
 * Fetch all products from API
 * @returns {Promise<Array>} Array of all product objects
 */
async function fetchAllProducts() {
    if (apiCache.allProducts) {
        return apiCache.allProducts;
    }
    
    try {
        const response = await fetchData(API_CONFIG.baseURL);
        
        // Handle both API response format { data: [...] } and fallback format { movies: [...], series: [...] }
        let products = [];
        
        if (response.data) {
            // API format: { data: [...], meta: {...} }
            products = response.data;
        } else if (response.movies || response.series) {
            // Fallback format: { movies: [...], series: [...] }
            products = [...(response.movies || []), ...(response.series || [])];
        } else if (Array.isArray(response)) {
            // Direct array response
            products = response;
        }
        
        // Transform products to internal format
        const transformedProducts = products.map(product => {
            try {
                return transformProduct(product);
            } catch (err) {
                // Log transformation errors but continue
                return null;
            }
        }).filter(p => p !== null);
        
        apiCache.allProducts = transformedProducts;
        
        // Cache separated movies and series
        apiCache.movies = filterByType(transformedProducts, 'movie');
        apiCache.series = filterByType(transformedProducts, 'series');
        
        return transformedProducts;
    } catch (error) {
        // Try fallback if main API fails (for local testing)
        try {
            const fallbackResponse = await fetchData(API_CONFIG.fallbackURL);
            let products = [];
            
            if (fallbackResponse.data) {
                products = fallbackResponse.data;
            } else if (fallbackResponse.movies || fallbackResponse.series) {
                products = [...(fallbackResponse.movies || []), ...(fallbackResponse.series || [])];
            } else if (Array.isArray(fallbackResponse)) {
                products = fallbackResponse;
            }
            
            const transformedProducts = products.map(transformProduct);
            apiCache.allProducts = transformedProducts;
            apiCache.movies = filterByType(transformedProducts, 'movie');
            apiCache.series = filterByType(transformedProducts, 'series');
            
            return transformedProducts;
        } catch (fallbackError) {
            throw new Error(`Failed to load products: ${error.message}. Fallback also failed: ${fallbackError.message}`);
        }
    }
}

/**
 * Fetch movies from API
 * @returns {Promise<Array>} Array of movie objects
 */
async function fetchMovies() {
    if (apiCache.movies) {
        return apiCache.movies;
    }
    
    try {
        await fetchAllProducts();
        return apiCache.movies || [];
    } catch (error) {
        throw new Error(`Failed to load movies: ${error.message}`);
    }
}

/**
 * Fetch series from API
 * @returns {Promise<Array>} Array of series objects
 */
async function fetchSeries() {
    if (apiCache.series) {
        return apiCache.series;
    }
    
    try {
        await fetchAllProducts();
        const series = apiCache.series || [];
        
        return series;
    } catch (error) {
        throw new Error(`Failed to load series: ${error.message}`);
    }
}

/**
 * Fetch a single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Single product object
 */
async function fetchProductById(id) {
    try {
        const response = await fetchData(`${API_CONFIG.baseURL}/${id}`);
        return transformProduct(response.data);
    } catch (error) {
        throw new Error(`Failed to load product: ${error.message}`);
    }
}

/**
 * Clear the API cache (useful for testing or forced refresh)
 */
function clearApiCache() {
    apiCache.allProducts = null;
    apiCache.movies = null;
    apiCache.series = null;
}
