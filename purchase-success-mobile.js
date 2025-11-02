// Mobile menu toggle functionality for purchase success page
(function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    
    function openMobileMenu() {
        if (mobileMenu && mobileMenuOverlay && mobileMenuToggle) {
            mobileMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            mobileMenuToggle.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeMobileMenu() {
        if (mobileMenu && mobileMenuOverlay && mobileMenuToggle) {
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
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
    
    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openMobileMenu);
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    
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
        
        const observer = new MutationObserver(() => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            updateMobileThemeDisplay(currentTheme === 'light' ? 'light' : 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
})();

