/**
 * js/components/theme.js
 * Clean Theme Controller with Sliding Switch Animation.
 * Smoothly toggles between Daylight Glass and Obsidian Night Glass.
 */

const THEME_STORAGE_KEY = 'lynk_theme_preference';

export function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle-btn');

    // 1. Determine Initial Theme
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    applyTheme(initialTheme);

    // 2. Sliding Switch Button Listener
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        });
    }

    // 3. Listen for OS theme changes if user hasn't explicitly set a preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            toggleBtn?.setAttribute('aria-checked', 'true');
        } else {
            document.documentElement.removeAttribute('data-theme');
            toggleBtn?.setAttribute('aria-checked', 'false');
        }
    }
}
