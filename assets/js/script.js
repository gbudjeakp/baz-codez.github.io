/* ═══════════════════════════════════════════════════════════════
   RETRO CUPHEAD STYLE - Minimal JavaScript
   Clean, simple interactions
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
    // ═══════════════════════════════════════════════════════════════
    // DARK MODE TOGGLE
    // ═══════════════════════════════════════════════════════════════
    const themeToggle = document.getElementById('theme-toggle');
    const toggleIcon = themeToggle?.querySelector('.toggle-icon');
    const toggleText = themeToggle?.querySelector('.toggle-text');
    
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (toggleIcon) toggleIcon.textContent = '☾';
        if (toggleText) toggleText.textContent = 'LIGHTS';
    }
    
    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                toggleIcon.textContent = '☀';
                toggleText.textContent = 'LIGHTS';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                toggleIcon.textContent = '☾';
                toggleText.textContent = 'LIGHTS';
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // SMOOTH SCROLLING
    // ═══════════════════════════════════════════════════════════════
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Subtle hover sound effect simulation via visual feedback
    const cards = document.querySelectorAll('.project-card, .contact-btn, .nav-link');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.15s ease';
        });
    });

    // Typewriter effect for tagline on scroll
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tagline.style.animation = 'none';
                    tagline.offsetHeight; // Trigger reflow
                    tagline.classList.add('visible');
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(tagline);
    }

    // Add slight parallax to character illustration
    const character = document.querySelector('.main-character');
    if (character) {
        document.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            character.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    // Console easter egg
    console.log('%c★ SEBASTIAN GBUDJE ★', 'font-size: 20px; font-family: Georgia, serif; font-weight: bold;');
    console.log('%cAlways Building.', 'font-size: 14px; font-style: italic; color: #e8a435;');
    console.log('%c─────────────────────', 'color: #1a1a1a;');
    console.log('Thanks for checking out my portfolio!');
    console.log('GitHub: https://github.com/gbudjeakp');
    console.log('Songram: https://songram.app');

    // ═══════════════════════════════════════════════════════════════
    // GEAR DODGER - Mini Cuphead-Style Game
    // ═══════════════════════════════════════════════════════════════
    
    const canvas = document.getElementById('cuphead-game');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const startBtn = document.getElementById('start-game');
        const restartBtn = document.getElementById('restart-game');
        const gameOverlay = document.getElementById('game-overlay');
        const gameOverOverlay = document.getElementById('game-over-overlay');
        const scoreDisplay = document.getElementById('score');
        const highScoreDisplay = document.getElementById('high-score');
        const finalScoreDisplay = document.getElementById('final-score');
        const gameWrapper = document.querySelector('.game-wrapper');
        
        let gameRunning = false;
        let score = 0;
        let highScore = parseInt(localStorage.getItem('gearDodgerHighScore')) || 0;
        highScoreDisplay.textContent = highScore;
        
        // Player (gear character)
        const player = {
            x: canvas.width / 2 - 20,
            y: canvas.height - 60,
            width: 40,
            height: 40,
            speed: 5,
            dx: 0,
            dy: 0
        };
        
        // Projectiles
        let projectiles = [];
        let spawnTimer = 0;
        let spawnInterval = 60; // frames between spawns
        
        // Input handling
        const keys = {};
        
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
                e.preventDefault();
                keys[e.key.toLowerCase()] = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });
        
        // Draw the gear player (Cuphead style)
        function drawPlayer() {
            ctx.save();
            ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
            
            // Gear body
            ctx.fillStyle = '#f5f0e6';
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Gear teeth
            ctx.fillStyle = '#1a1a1a';
            for (let i = 0; i < 8; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI * 2) / 8);
                ctx.fillRect(-3, -22, 6, 8);
                ctx.restore();
            }
            
            // Pie-cut eyes
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(-6, -3, 4, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(6, -3, 4, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Pie slice highlights
            ctx.fillStyle = '#f5f0e6';
            ctx.beginPath();
            ctx.moveTo(-6, -8);
            ctx.lineTo(-6, -3);
            ctx.lineTo(-9, -3);
            ctx.arc(-6, -3, 4, Math.PI, Math.PI * 1.5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, -8);
            ctx.lineTo(6, -3);
            ctx.lineTo(3, -3);
            ctx.arc(6, -3, 4, Math.PI, Math.PI * 1.5);
            ctx.fill();
            
            // Smile
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 2, 7, 0.2, Math.PI - 0.2);
            ctx.stroke();
            
            // Rosy cheeks
            ctx.fillStyle = 'rgba(212, 165, 116, 0.5)';
            ctx.beginPath();
            ctx.ellipse(-12, 3, 3, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(12, 3, 3, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // Draw projectile (coffee cup enemies - falling from top)
        function drawProjectile(p) {
            ctx.save();
            ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
            ctx.rotate(p.rotation);
            
            // Coffee cup body
            ctx.fillStyle = '#8B4513';
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(-10, -8);
            ctx.lineTo(-8, 8);
            ctx.quadraticCurveTo(0, 12, 8, 8);
            ctx.lineTo(10, -8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Cup rim
            ctx.fillStyle = '#f5f0e6';
            ctx.beginPath();
            ctx.ellipse(0, -8, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Coffee inside
            ctx.fillStyle = '#3d2314';
            ctx.beginPath();
            ctx.ellipse(0, -6, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Angry eyes
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(-4, 0, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(4, 0, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Angry eyebrows
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-7, -3);
            ctx.lineTo(-2, -1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(7, -3);
            ctx.lineTo(2, -1);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Draw missile (side projectiles)
        function drawMissile(p) {
            ctx.save();
            ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
            
            // Flip missile based on direction
            if (p.direction === 'left') {
                ctx.scale(-1, 1);
            }
            
            // Missile body
            ctx.fillStyle = '#cc3333';
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            
            // Main body
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-8, -6);
            ctx.lineTo(12, -6);
            ctx.lineTo(18, 0);
            ctx.lineTo(12, 6);
            ctx.lineTo(-8, 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Nose cone
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.moveTo(12, -6);
            ctx.lineTo(18, 0);
            ctx.lineTo(12, 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Fins
            ctx.fillStyle = '#aa2222';
            ctx.beginPath();
            ctx.moveTo(-12, -6);
            ctx.lineTo(-18, -12);
            ctx.lineTo(-8, -6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(-12, 6);
            ctx.lineTo(-18, 12);
            ctx.lineTo(-8, 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Angry face on missile
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(2, -2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(2, 2, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Angry mouth
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(6, -2);
            ctx.lineTo(8, 0);
            ctx.lineTo(6, 2);
            ctx.stroke();
            
            // Exhaust flame
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(-15, -3);
            ctx.lineTo(-22 - Math.random() * 5, 0);
            ctx.lineTo(-15, 3);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.moveTo(-15, -2);
            ctx.lineTo(-18 - Math.random() * 3, 0);
            ctx.lineTo(-15, 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        
        // Calculate speed based on score
        function getSpeedMultiplier() {
            return 1 + (score * 0.05); // 5% faster per point scored
        }
        
        // Spawn new projectile (from top)
        function spawnProjectile() {
            const size = 24;
            const speedMult = getSpeedMultiplier();
            projectiles.push({
                x: Math.random() * (canvas.width - size),
                y: -size,
                width: size,
                height: size,
                speed: (2 + Math.random() * 2) * speedMult,
                speedX: 0,
                speedY: 1,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                type: 'cup'
            });
        }
        
        // Spawn missile from sides
        function spawnMissile() {
            const size = 24;
            const speedMult = getSpeedMultiplier();
            const fromLeft = Math.random() > 0.5;
            projectiles.push({
                x: fromLeft ? -size : canvas.width,
                y: 30 + Math.random() * (canvas.height - 80),
                width: 36,
                height: size,
                speed: (3 + Math.random() * 2) * speedMult,
                speedX: fromLeft ? 1 : -1,
                speedY: 0,
                rotation: 0,
                rotationSpeed: 0,
                type: 'missile',
                direction: fromLeft ? 'right' : 'left'
            });
        }
        
        // Update game state
        function update() {
            // Handle input
            player.dx = 0;
            player.dy = 0;
            
            if (keys['arrowleft'] || keys['a']) player.dx = -player.speed;
            if (keys['arrowright'] || keys['d']) player.dx = player.speed;
            if (keys['arrowup'] || keys['w']) player.dy = -player.speed;
            if (keys['arrowdown'] || keys['s']) player.dy = player.speed;
            
            // Move player
            player.x += player.dx;
            player.y += player.dy;
            
            // Keep player in bounds
            player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
            player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
            
            // Spawn projectiles
            spawnTimer++;
            if (spawnTimer >= spawnInterval) {
                // Randomly spawn cup or missile (missiles start appearing after score 3)
                if (score >= 3 && Math.random() > 0.6) {
                    spawnMissile();
                } else {
                    spawnProjectile();
                }
                spawnTimer = 0;
                // Increase spawn rate over time
                if (spawnInterval > 25) spawnInterval -= 0.3;
            }
            
            // Update projectiles
            for (let i = projectiles.length - 1; i >= 0; i--) {
                const p = projectiles[i];
                
                // Move based on direction
                p.x += p.speed * p.speedX;
                p.y += p.speed * p.speedY;
                p.rotation += p.rotationSpeed;
                
                // Remove if off screen
                let offScreen = false;
                if (p.type === 'cup' && p.y > canvas.height) {
                    offScreen = true;
                } else if (p.type === 'missile') {
                    if (p.speedX > 0 && p.x > canvas.width) offScreen = true;
                    if (p.speedX < 0 && p.x < -p.width) offScreen = true;
                }
                
                if (offScreen) {
                    projectiles.splice(i, 1);
                    score++;
                    scoreDisplay.textContent = score;
                    continue;
                }
                
                // Check collision with player (circular collision)
                const playerCenterX = player.x + player.width / 2;
                const playerCenterY = player.y + player.height / 2;
                const projCenterX = p.x + p.width / 2;
                const projCenterY = p.y + p.height / 2;
                const dx = playerCenterX - projCenterX;
                const dy = playerCenterY - projCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 18) {
                    gameOver();
                    return;
                }
            }
        }
        
        // Draw everything
        function draw() {
            // Clear canvas with gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#3d2314');
            gradient.addColorStop(1, '#2a1810');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw floor line
            ctx.strokeStyle = '#5a3d2a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 20);
            ctx.lineTo(canvas.width, canvas.height - 20);
            ctx.stroke();
            
            // Draw projectiles
            projectiles.forEach(p => {
                if (p.type === 'missile') {
                    drawMissile(p);
                } else {
                    drawProjectile(p);
                }
            });
            
            // Draw player
            drawPlayer();
        }
        
        // Game loop
        function gameLoop() {
            if (!gameRunning) return;
            
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }
        
        // Start game
        function startGame() {
            gameRunning = true;
            score = 0;
            scoreDisplay.textContent = 0;
            projectiles = [];
            spawnTimer = 0;
            spawnInterval = 60;
            player.x = canvas.width / 2 - 20;
            player.y = canvas.height - 60;
            
            gameOverlay.style.display = 'none';
            gameOverOverlay.style.display = 'none';
            
            gameLoop();
        }
        
        // Game over
        function gameOver() {
            gameRunning = false;
            gameWrapper.classList.add('shake');
            setTimeout(() => gameWrapper.classList.remove('shake'), 200);
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('gearDodgerHighScore', highScore);
                highScoreDisplay.textContent = highScore;
            }
            
            finalScoreDisplay.textContent = score;
            gameOverOverlay.style.display = 'flex';
        }
        
        // Event listeners
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', startGame);
        
        // Initial draw
        draw();
    }
});