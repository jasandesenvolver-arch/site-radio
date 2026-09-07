/**
 * AVEE SPECTRUM ENGINE 2026
 * High-performance Canvas Audio Visualizer with 4 Avee Player Modes:
 * 1. Circular (Bass trap ring with pulsing center)
 * 2. Cyber Bars (Neon gradient equalizer bars with reflection)
 * 3. Liquid Wave (Multi-layered spline ribbons)
 * 4. Stardust (Connected audio-reactive particle constellation)
 */

class AveeVisualizer {
    constructor(canvasId, miniCanvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.miniCanvas = document.getElementById(miniCanvasId);
        this.miniCtx = this.miniCanvas ? this.miniCanvas.getContext('2d') : null;

        this.mode = 'circular'; // circular | cyberbars | liquidwave | stardust
        this.palette = 'cyber'; // cyber | fire | matrix | sunset
        this.isPlaying = false;
        this.animId = null;

        this.audioContext = null;
        this.analyser = null;
        this.sourceNode = null;
        this.frequencyData = null;
        this.timeDomainData = null;

        // Visual simulation & particle state
        this.particles = [];
        this.smoothedBars = new Array(128).fill(0);
        this.bassEnergy = 0;
        this.midEnergy = 0;
        this.trebleEnergy = 0;
        this.phase = 0;
        this.bassPulseEnabled = true;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initParticles(80);
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    initParticles(count) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * (this.width || 600),
                y: Math.random() * (this.height || 400),
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                baseRadius: Math.random() * 2.5 + 1.2,
                radius: 2,
                freqIndex: Math.floor(Math.random() * 64),
                hueOffset: Math.random() * 40
            });
        }
    }

    attachAudio(audioElement) {
        try {
            if (!this.audioContext) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioCtx();
            }
            if (!audioElement._hasSource) {
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 512;
                this.analyser.smoothingTimeConstant = 0.8;
                this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
                this.sourceNode.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
                audioElement._hasSource = true;
            }
            const binCount = this.analyser.frequencyBinCount;
            this.frequencyData = new Uint8Array(binCount);
            this.timeDomainData = new Uint8Array(binCount);
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        } catch (err) {
            console.log('Web Audio Direct Analyzer restricted (CORS). Using Dynamic Avee Hybrid Engine.');
        }
    }

    getPaletteColors() {
        switch (this.palette) {
            case 'fire':
                return { primary: '#ff007f', secondary: '#ffaa00', glow: 'rgba(255, 0, 127, 0.5)', bg: '#3b0764' };
            case 'matrix':
                return { primary: '#00f2fe', secondary: '#4facfe', glow: 'rgba(0, 242, 254, 0.5)', bg: '#022c22' };
            case 'sunset':
                return { primary: '#f43f5e', secondary: '#8b5cf6', glow: 'rgba(244, 63, 94, 0.5)', bg: '#2e1065' };
            default: // cyber
                return { primary: '#9d4edd', secondary: '#00f2fe', glow: 'rgba(157, 78, 221, 0.5)', bg: '#1e1b4b' };
        }
    }

    updateMetrics(data) {
        if (!data || data.length === 0) return;
        let b = 0, m = 0, t = 0;
        const bCount = 16, mCount = 64, tCount = 120;
        for (let i = 0; i < bCount; i++) b += data[i] || 0;
        for (let i = bCount; i < mCount; i++) m += data[i] || 0;
        for (let i = mCount; i < tCount; i++) t += data[i] || 0;

        this.bassEnergy = b / bCount / 255;
        this.midEnergy = m / (mCount - bCount) / 255;
        this.trebleEnergy = t / (tCount - mCount) / 255;

        const valBassEl = document.getElementById('valBass');
        const valMidEl = document.getElementById('valMid');
        const valTrebleEl = document.getElementById('valTreble');
        if (valBassEl) valBassEl.textContent = (this.bassEnergy * 100).toFixed(0) + '%';
        if (valMidEl) valMidEl.textContent = (this.midEnergy * 100).toFixed(0) + '%';
        if (valTrebleEl) valTrebleEl.textContent = (this.trebleEnergy * 100).toFixed(0) + '%';
        
        // Hologram center pulse with bass
        const holoEl = document.getElementById('hologramCenter');
        if (holoEl && this.bassPulseEnabled) {
            const scale = 1 + this.bassEnergy * 0.28;
            holoEl.style.transform = 'scale(' + scale + ')';
        }
    }

    start() {
        this.isPlaying = true;
        if (!this.animId) {
            this.loop();
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
        if (this.ctx) this.ctx.clearRect(0, 0, this.width, this.height);
        if (this.miniCtx) this.miniCtx.clearRect(0, 0, 180, 40);
    }

    loop() {
        if (!this.isPlaying) return;
        this.animId = requestAnimationFrame(() => this.loop());
        this.phase += 0.04;

        let data = this.gatherAudioData();
        this.updateMetrics(data);

        this.ctx.clearRect(0, 0, this.width, this.height);

        switch (this.mode) {
            case 'circular':
                this.renderCircular(data);
                break;
            case 'cyberbars':
                this.renderCyberBars(data);
                break;
            case 'liquidwave':
                this.renderLiquidWave(data);
                break;
            case 'stardust':
                this.renderStardust(data);
                break;
        }

        if (this.miniCtx) {
            this.renderMiniSpectrum(data);
        }
    }

    gatherAudioData() {
        const binCount = 128;
        const simulated = [];

        // Check if real Web Audio analyser has active frequency data
        let hasRealData = false;
        if (this.analyser && this.frequencyData) {
            this.analyser.getByteFrequencyData(this.frequencyData);
            let sum = 0;
            for (let i = 0; i < 30; i++) sum += this.frequencyData[i];
            if (sum > 50) hasRealData = true;
        }

        for (let i = 0; i < binCount; i++) {
            let targetVal = 0;
            if (hasRealData) {
                targetVal = this.frequencyData[i] || 0;
            } else {
                // High-fidelity Avee procedural audio beat simulation
                const bassPulse = Math.sin(this.phase * 3) * 0.5 + 0.5;
                const waveA = Math.sin(this.phase * 2 + i * 0.12) * 60 + 80;
                const waveB = Math.cos(this.phase * 4 + i * 0.25) * 40;
                const decay = Math.max(0.2, 1 - (i / binCount) * 0.8);
                targetVal = (waveA + waveB + (i < 12 ? bassPulse * 90 : 0)) * decay;
                targetVal = Math.min(255, Math.max(15, targetVal));
            }
            // Smooth bars
            this.smoothedBars[i] += (targetVal - this.smoothedBars[i]) * 0.22;
            simulated.push(this.smoothedBars[i]);
        }
        return simulated;
    }

    /* 1. AVE TRAP CIRCULAR SPECTRUM */
    renderCircular(data) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const colors = this.getPaletteColors();
        const baseRadius = Math.min(this.width, this.height) * 0.22;
        const maxBarLen = Math.min(this.width, this.height) * 0.26;
        const bars = 96;
        const step = Math.floor(data.length / bars);

        this.ctx.save();

        // Radial Bass Shockwave Ring
        if (this.bassEnergy > 0.4) {
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, baseRadius + this.bassEnergy * 50, 0, Math.PI * 2);
            this.ctx.strokeStyle = colors.glow;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }

        // Radiating Spectrum Bars
        for (let i = 0; i < bars; i++) {
            const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
            const val = (data[i * step] || 0) / 255;
            const barLen = val * maxBarLen;

            const x1 = cx + Math.cos(angle) * baseRadius;
            const y1 = cy + Math.sin(angle) * baseRadius;
            const x2 = cx + Math.cos(angle) * (baseRadius + barLen);
            const y2 = cy + Math.sin(angle) * (baseRadius + barLen);

            // Bar Gradient
            const grad = this.ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, colors.primary);
            grad.addColorStop(1, colors.secondary);

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = Math.max(2, (Math.PI * 2 * baseRadius / bars) * 0.65);
            this.ctx.lineCap = 'round';
            this.ctx.stroke();

            // Peak Glowing Dots
            if (barLen > 10) {
                const px = cx + Math.cos(angle) * (baseRadius + barLen + 4);
                const py = cy + Math.sin(angle) * (baseRadius + barLen + 4);
                this.ctx.beginPath();
                this.ctx.arc(px, py, 2, 0, Math.PI * 2);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fill();
            }
        }

        this.ctx.restore();
    }

    /* 2. CYBERBARS WITH REFLECTION */
    renderCyberBars(data) {
        const colors = this.getPaletteColors();
        const barCount = 54;
        const step = Math.floor(data.length / barCount);
        const barWidth = (this.width / barCount) * 0.7;
        const gap = (this.width / barCount) * 0.3;
        const maxH = this.height * 0.75;
        const baseY = this.height * 0.82;

        this.ctx.save();

        for (let i = 0; i < barCount; i++) {
            const val = (data[i * step] || 0) / 255;
            const h = Math.max(6, val * maxH);
            const x = i * (barWidth + gap) + gap / 2;
            const y = baseY - h;

            // Main Bar
            const grad = this.ctx.createLinearGradient(x, baseY, x, y);
            grad.addColorStop(0, colors.primary);
            grad.addColorStop(0.6, colors.secondary);
            grad.addColorStop(1, '#ffffff');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, barWidth, h, [4, 4, 0, 0]);
            this.ctx.fill();

            // Mirror Floor Reflection
            const reflH = h * 0.25;
            const reflGrad = this.ctx.createLinearGradient(x, baseY, x, baseY + reflH);
            reflGrad.addColorStop(0, colors.glow);
            reflGrad.addColorStop(1, 'transparent');
            this.ctx.fillStyle = reflGrad;
            this.ctx.fillRect(x, baseY + 2, barWidth, reflH);
        }

        this.ctx.restore();
    }

    /* 3. LIQUID WAVE / MULTI-RIBBON */
    renderLiquidWave(data) {
        const colors = this.getPaletteColors();
        const points = 48;
        const step = Math.floor(data.length / points);
        const sliceWidth = this.width / (points - 1);
        const baseY = this.height * 0.55;

        this.ctx.save();

        for (let layer = 2; layer >= 0; layer--) {
            this.ctx.beginPath();
            const alpha = 0.4 + (2 - layer) * 0.25;

            for (let i = 0; i < points; i++) {
                const val = (data[i * step] || 0) / 255;
                const amp = (val - 0.4) * (this.height * 0.4) * (1 - layer * 0.25);
                const x = i * sliceWidth;
                const y = baseY + amp + Math.sin(this.phase * 2 + i * 0.2 + layer) * 15;

                if (i === 0) this.ctx.moveTo(x, y);
                else {
                    const prevX = (i - 1) * sliceWidth;
                    const prevVal = (data[(i - 1) * step] || 0) / 255;
                    const prevY = baseY + (prevVal - 0.4) * (this.height * 0.4) * (1 - layer * 0.25) + Math.sin(this.phase * 2 + (i - 1) * 0.2 + layer) * 15;
                    this.ctx.quadraticCurveTo((prevX + x) / 2, (prevY + y) / 2, x, y);
                }
            }

            const lineGrad = this.ctx.createLinearGradient(0, 0, this.width, 0);
            lineGrad.addColorStop(0, colors.primary);
            lineGrad.addColorStop(0.5, colors.secondary);
            lineGrad.addColorStop(1, colors.primary);

            this.ctx.strokeStyle = lineGrad;
            this.ctx.lineWidth = 3 - layer;
            this.ctx.stroke();

            this.ctx.lineTo(this.width, this.height);
            this.ctx.lineTo(0, this.height);
            this.ctx.closePath();

            const fillGrad = this.ctx.createLinearGradient(0, baseY - 50, 0, this.height);
            fillGrad.addColorStop(0, colors.glow);
            fillGrad.addColorStop(1, 'transparent');
            this.ctx.fillStyle = fillGrad;
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    /* 4. STARDUST AUDIO CONSTELLATION */
    renderStardust(data) {
        const colors = this.getPaletteColors();
        this.ctx.save();

        const bassBoost = 1 + this.bassEnergy * 2.5;

        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 85) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(0, 242, 254, ${(1 - dist / 85) * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }

        // Draw particles
        this.particles.forEach((p) => {
            const freqVal = (data[p.freqIndex] || 0) / 255;
            p.radius = p.baseRadius + freqVal * 5;
            p.x += p.vx * bassBoost;
            p.y += p.vy * bassBoost;

            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = freqVal > 0.6 ? '#ffffff' : colors.secondary;
            this.ctx.shadowColor = colors.primary;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        this.ctx.restore();
    }

    renderMiniSpectrum(data) {
        const ctx = this.miniCtx;
        const w = 180, h = 40;
        ctx.clearRect(0, 0, w, h);
        const bars = 24;
        const step = Math.floor(data.length / bars);
        const barW = (w / bars) * 0.7;
        const gap = (w / bars) * 0.3;

        for (let i = 0; i < bars; i++) {
            const val = (data[i * step] || 0) / 255;
            const barH = Math.max(3, val * (h - 6));
            const x = i * (barW + gap);
            const y = h - barH;

            ctx.fillStyle = '#00f2fe';
            ctx.fillRect(x, y, barW, barH);
        }
    }
}
