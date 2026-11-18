/**
 * js/components/sound.js
 * High-Tech Apple Liquid Glass Synthesizer using Native Web Audio API.
 * Zero external audio files required — synthesizes crisp physical crystal frequencies,
 * gentle glass clicks, hover ripples, and triumphant arpeggio completion chimes.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem('lynk_sound_enabled') !== 'false';
        this.lastHoverTime = 0;
    }

    _getContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    isEnabled() {
        return this.enabled;
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('lynk_sound_enabled', this.enabled ? 'true' : 'false');
        if (this.enabled) {
            this.playToggle(true);
        }
        return this.enabled;
    }

    /**
     * Crisp high-tech glass tap for button clicks.
     */
    playTap() {
        if (!this.enabled) return;
        const ctx = this._getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.045);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    /**
     * Microscopic airy crystal frequency for subtle card/button hover.
     */
    playHover() {
        if (!this.enabled) return;
        const nowMs = Date.now();
        if (nowMs - this.lastHoverTime < 75) return; // Prevent spamming
        this.lastHoverTime = nowMs;

        const ctx = this._getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(1900, now + 0.035);

        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    /**
     * Triumphant 4-note crystal chord arpeggio for task completions & celebrations!
     */
    playCelebrationChime() {
        if (!this.enabled) return;
        const ctx = this._getContext();
        if (!ctx) return;

        // Frequencies for C Major crystal chime: C6 (1046.5Hz), E6 (1318.5Hz), G6 (1568Hz), C7 (2093Hz)
        const notes = [1046.5, 1318.5, 1568.0, 2093.0];
        const now = ctx.currentTime;

        notes.forEach((freq, idx) => {
            const start = now + idx * 0.07;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(start);
            osc.stop(start + 0.48);
        });
    }

    /**
     * Dual-frequency toggle click for theme & sound switches.
     */
    playToggle(isOpening = true) {
        if (!this.enabled && isOpening !== true) return;
        const ctx = this._getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const f1 = isOpening ? 900 : 1600;
        const f2 = isOpening ? 1800 : 900;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f1, now);
        osc.frequency.exponentialRampToValueAtTime(f2, now + 0.06);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
    }

    /**
     * Smooth atmospheric drawer slide swoosh.
     */
    playWhoosh() {
        if (!this.enabled) return;
        const ctx = this._getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
    }
}

export const sound = new SoundEngine();

/**
 * Initializes interactive sound listeners on buttons, cards, and modal triggers.
 */
export function initSoundSystem() {
    // Enable audio context on first interaction
    const unlockAudio = () => {
        sound._getContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // Document-level delegation for clicks
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn, .nav-item, .pill-filter, .theme-switch-pill, .modal-close-btn, .action-btn, .persona-pill');
        if (btn) {
            sound.playTap();
        }
    });

    // Document-level delegation for hover ticks
    document.addEventListener('mouseover', (e) => {
        const interactive = e.target.closest('.btn, .nav-item, .stat-card, .theme-switch-pill, .pill-filter, .persona-pill');
        if (interactive) {
            sound.playHover();
        }
    });
}
