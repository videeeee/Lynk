/**
 * js/components/glassTilt.js
 * Apple Liquid Glass Physics, Cursor Spotlight & Magnetic Engine.
 * Provides authentic VisionOS / macOS Sequoia liquid glass behavior:
 * - Dynamic cursor spotlight coordinates (--mouse-x, --mouse-y)
 * - Magnetic elastic pull on buttons and pills (--mag-x, --mag-y)
 * - 3D refractive tilt on glass cards (--rotate-x, --rotate-y)
 * - Liquid wave ripple on clicks
 */

export function initLiquidGlassEffects() {
    let activeElement = null;
    let isCard = false;
    let isButton = false;
    let rect = null;

    // Document-level mouse tracking for all static & dynamic glass elements
    document.addEventListener('mousemove', (e) => {
        const target = e.target.closest('.stat-card, .widget-card, .panel, .doc-card, .btn, .theme-switch-pill, .pill-filter, .nav-item');

        if (!target) {
            if (activeElement) {
                resetElement(activeElement);
                activeElement = null;
            }
            return;
        }

        if (activeElement !== target) {
            if (activeElement) resetElement(activeElement);
            activeElement = target;
            rect = target.getBoundingClientRect();
            isCard = target.matches('.stat-card, .widget-card, .panel, .doc-card');
            isButton = target.matches('.btn, .theme-switch-pill, .pill-filter, .nav-item');
        }

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Set CSS variables for liquid spotlight sheen
        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);

        if (isCard) {
            // Smooth 3D tilt calculation (max 3.2 deg)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rx = ((y - centerY) / centerY) * -3.2;
            const ry = ((x - centerX) / centerX) * 3.2;

            target.style.setProperty('--rotate-x', `${rx.toFixed(2)}deg`);
            target.style.setProperty('--rotate-y', `${ry.toFixed(2)}deg`);
            target.style.setProperty('--lift-y', '-3px');
        } else if (isButton) {
            // Elastic magnetic pull towards cursor (max 3.5px)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const magX = ((x - centerX) / centerX) * 3.5;
            const magY = ((y - centerY) / centerY) * 3.5;

            target.style.setProperty('--mag-x', `${magX.toFixed(2)}px`);
            target.style.setProperty('--mag-y', `${magY.toFixed(2)}px`);
        }
    });

    document.addEventListener('mouseleave', () => {
        if (activeElement) {
            resetElement(activeElement);
            activeElement = null;
        }
    });

    // Reset element smoothly to resting position
    function resetElement(el) {
        el.style.setProperty('--rotate-x', '0deg');
        el.style.setProperty('--rotate-y', '0deg');
        el.style.setProperty('--lift-y', '0px');
        el.style.setProperty('--mag-x', '0px');
        el.style.setProperty('--mag-y', '0px');
    }

    // Liquid Click Ripple on Buttons & Interactive Elements
    document.addEventListener('pointerdown', (e) => {
        const btn = e.target.closest('.btn, .theme-switch-pill, .pill-filter');
        if (!btn) return;

        const bRect = btn.getBoundingClientRect();
        const rx = e.clientX - bRect.left;
        const ry = e.clientY - bRect.top;

        // Create liquid ripple element
        const ripple = document.createElement('span');
        ripple.className = 'liquid-ripple';
        ripple.style.left = `${rx}px`;
        ripple.style.top = `${ry}px`;

        btn.appendChild(ripple);

        // Remove after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}
