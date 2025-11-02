// Theme toggle functionality
(function() {
    'use strict';
    
    // Default to dark mode
    const DEFAULT_THEME = 'dark';
    
    // Get theme from localStorage or use default
    function getTheme() {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || DEFAULT_THEME;
    }
    
    // Set theme on document
    function setTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            updateToggleCheckbox('light');
        } else {
            document.documentElement.removeAttribute('data-theme');
            updateToggleCheckbox('dark');
        }
        localStorage.setItem('theme', theme);
    }
    
    // Update toggle checkbox state
    function updateToggleCheckbox(theme) {
        const toggleCheckbox = document.getElementById('themeToggle');
        if (toggleCheckbox) {
            toggleCheckbox.checked = theme === 'light';
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        const currentTheme = getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }
    
    // Apply theme immediately (before DOM is ready) to prevent flash
    (function applyThemeImmediately() {
        const theme = getTheme();
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    })();
    
    // Initialize theme on page load
    function initTheme() {
        const theme = getTheme();
        setTheme(theme); // This will update the checkbox
        
        // Add event listener to toggle checkbox
        const toggleCheckbox = document.getElementById('themeToggle');
        if (toggleCheckbox) {
            toggleCheckbox.addEventListener('change', toggleTheme);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();

