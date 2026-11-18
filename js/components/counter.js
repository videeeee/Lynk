/**
 * js/components/counter.js
 * High-precision animated numeric rolling counters.
 * Smoothly interpolates numbers from previous to target values with cubic easing.
 */

export function animateCount(element, targetValue, duration = 800) {
    if (!element) return;

    const startValue = parseInt(element.getAttribute('data-current-val') || element.textContent.replace(/[^0-9]/g, '') || '0', 10);
    const target = parseInt(targetValue, 10);
    if (isNaN(target)) return;

    if (startValue === target) {
        element.textContent = target;
        return;
    }

    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Smooth cubic ease out
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + (target - startValue) * ease);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
            element.setAttribute('data-current-val', target);
        }
    }

    requestAnimationFrame(update);
}
