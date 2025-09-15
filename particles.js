class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        this.connectionDistance = 100;
        this.mouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.setupCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor(),
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    getRandomColor() {
        const colors = ['#00ffff', '#0099ff', '#ffffff', '#66ccff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    updateParticles() {
        this.particles.forEach(particle => {

            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
            }


            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));


            particle.pulse += particle.pulseSpeed;
            particle.currentSize = particle.size + Math.sin(particle.pulse) * 0.5;

            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += dx * force * 0.001;
                particle.vy += dy * force * 0.001;
                particle.opacity = Math.min(1, particle.opacity + force * 0.5);
            } else {
                particle.opacity = Math.max(0.2, particle.opacity - 0.01);
            }


            const maxVelocity = 2;
            particle.vx = Math.max(-maxVelocity, Math.min(maxVelocity, particle.vx));
            particle.vy = Math.max(-maxVelocity, Math.min(maxVelocity, particle.vy));


            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.currentSize, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    drawConnections() {
        this.particles.forEach((particle, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const otherParticle = this.particles[j];
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    const opacity = (this.connectionDistance - distance) / this.connectionDistance;

                    this.ctx.save();
                    this.ctx.globalAlpha = opacity * 0.3;
                    this.ctx.strokeStyle = '#00ffff';
                    this.ctx.lineWidth = 1;
                    this.ctx.shadowBlur = 5;
                    this.ctx.shadowColor = '#00ffff';

                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();

                    this.ctx.restore();
                }
            }
        });
    }

    drawMouseConnections() {
        if (this.mouse.x === -1000) return;

        this.particles.forEach(particle => {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const opacity = (150 - distance) / 150;

                this.ctx.save();
                this.ctx.globalAlpha = opacity * 0.5;
                this.ctx.strokeStyle = '#00ffff';
                this.ctx.lineWidth = 2;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#00ffff';

                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(this.mouse.x, this.mouse.y);
                this.ctx.stroke();

                this.ctx.restore();
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        this.drawMouseConnections();

        requestAnimationFrame(() => this.animate());
    }


    addParticle(x, y) {
        this.particles.push({
            x: x || Math.random() * this.canvas.width,
            y: y || Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            color: this.getRandomColor(),
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01
        });
    }

    removeParticle() {
        if (this.particles.length > 10) {
            this.particles.pop();
        }
    }

    setParticleCount(count) {
        this.particleCount = count;
        this.createParticles();
    }

    explosion(x, y) {

        const explosionParticles = [];
        for (let i = 0; i < 20; i++) {
            explosionParticles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 5 + 2,
                opacity: 1,
                color: '#00ffff',
                life: 1,
                decay: 0.02
            });
        }

        const animateExplosion = () => {
            explosionParticles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.95;
                particle.vy *= 0.95;
                particle.life -= particle.decay;
                particle.opacity = particle.life;

                if (particle.life <= 0) {
                    explosionParticles.splice(index, 1);
                }

                this.ctx.save();
                this.ctx.globalAlpha = particle.opacity;
                this.ctx.fillStyle = particle.color;
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = particle.color;

                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.restore();
            });

            if (explosionParticles.length > 0) {
                requestAnimationFrame(animateExplosion);
            }
        };

        animateExplosion();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const particleSystem = new ParticleSystem();

    window.particleSystem = particleSystem;

    document.addEventListener('click', (e) => {
        particleSystem.explosion(e.clientX, e.clientY);
    });
});