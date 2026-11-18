/**
 * js/components/caustics.js
 * Optical Caustic Beam, Corner Specular Glints & Interactive Neon Micro-Sparkles.
 * Simulates high-end liquid crystal refraction across the marble/glass surface.
 */

export function initCaustics() {
    // 1. Create Caustic Canvas Overlay for interactive sparkle physics
    const canvas = document.createElement('canvas');
    canvas.id = 'caustics-canvas';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999998';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const colors = ['#00f0ff', '#ff007f', '#0077ff', '#00ffa3', '#ffffff', '#ff9900'];

    /**
     * Spawns a burst of neon micro-sparkles at screen coordinates (x, y)
     */
    function spawnSparkles(x, y, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5,
                size: 2 + Math.random() * 2.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.02 + Math.random() * 0.03,
                rotation: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 0.2
            });
        }
    }

    // Expose spawnSparkles globally on window for task completion integration
    window.spawnNeonSparkles = spawnSparkles;

    // Spawn micro-sparkles on button click
    document.addEventListener('pointerdown', (e) => {
        const btn = e.target.closest('.btn, .theme-switch-pill, .pill-filter, .persona-pill');
        if (btn) {
            spawnSparkles(e.clientX, e.clientY, 8);
        }
    });

    // Particle render loop
    function renderLoop() {
        ctx.clearRect(0, 0, width, height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.04; // Gentle gravity
            p.vx *= 0.98;
            p.alpha -= p.decay;
            p.rotation += p.vRot;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            // Draw diamond / 4-point crystal flare
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 1.5);
            ctx.lineTo(p.size * 0.6, 0);
            ctx.lineTo(0, p.size * 1.5);
            ctx.lineTo(-p.size * 0.6, 0);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        requestAnimationFrame(renderLoop);
    }

    renderLoop();
}
