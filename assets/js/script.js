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
    // GEAR DODGER 2 — 3 Stages, Bosses & Shooting
    // ═══════════════════════════════════════════════════════════════

    const canvas = document.getElementById('cuphead-game');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const startBtn        = document.getElementById('start-game');
        const restartBtn      = document.getElementById('restart-game');
        const playAgainWinBtn = document.getElementById('play-again-win');
        const gameOverlay     = document.getElementById('game-overlay');
        const gameOverOverlay = document.getElementById('game-over-overlay');
        const gameWinOverlay  = document.getElementById('game-win-overlay');
        const scoreEl         = document.getElementById('score');
        const highScoreEl     = document.getElementById('high-score');
        const finalScoreEl    = document.getElementById('final-score');
        const winScoreEl      = document.getElementById('win-score');
        const levelEl         = document.getElementById('level-display');
        const livesEl         = document.getElementById('lives-display');
        const gameWrapper     = document.querySelector('.game-wrapper');

        // ── Level definitions ──────────────────────────────────────
        const LEVELS = [
            { name: 'STAGE 1', sub: 'THE DINER',    kills: 12, spawnStart: 65, spawnMin: 30, bossHP: 15 },
            { name: 'STAGE 2', sub: 'THE WORKSHOP', kills: 18, spawnStart: 52, spawnMin: 24, bossHP: 25 },
            { name: 'STAGE 3', sub: 'THE ARCADE',   kills: 24, spawnStart: 42, spawnMin: 18, bossHP: 40 }
        ];
        const BOSS_NAMES = ['BIG BREW', 'GEAR KING', 'THE MACHINE'];

        // ── Game state ─────────────────────────────────────────────
        let gameRunning   = false;
        let gameState     = 'idle';   // idle|playing|boss_intro|boss|level_clear|game_over|win
        let score         = 0;
        let highScore     = parseInt(localStorage.getItem('gearDodger2High')) || 0;
        let level         = 0;
        let lives         = 3;
        let killCount     = 0;
        let frameCount    = 0;
        let spawnTimer    = 0;
        let spawnInterval = 65;
        let stateTimer    = 0;
        let shootCooldown = 0;
        let invincible    = false;
        let invTimer      = 0;
        let flashTimer    = 0;

        highScoreEl.textContent = highScore;

        // ── Entities ───────────────────────────────────────────────
        const player = { x: 180, y: 240, w: 40, h: 40, speed: 5 };
        let enemies   = [];
        let bullets   = [];
        let particles = [];
        let boss      = null;
        let bossHP    = 0;
        let bossMaxHP = 0;
        let bossPhase = 0;  // 0=normal, 1=enraged

        // ── Powerups ───────────────────────────────────────────────
        // Types: 'spread' (3-way), 'rapid' (fast fire), 'pierce' (through enemies), 'shield' (invincible), 'heart' (extra life)
        const POWERUP_DURATION = 600; // ~10 seconds at 60fps
        const POWERUP_COLORS = { spread: '#66aaff', rapid: '#ffaa33', pierce: '#aa66ff', shield: '#66ffaa', heart: '#ff6688' };
        const POWERUP_LABELS = { spread: 'S', rapid: 'R', pierce: 'P', shield: '★', heart: '♥' };
        let powerups = [];
        let activePowerup = null;  // { type, timer } or null
        let baseCooldown = 14;

        // ── Input ──────────────────────────────────────────────────
        const keys = {};
        document.addEventListener('keydown', e => {
            const k = e.key === ' ' ? ' ' : e.key.toLowerCase();
            if ([' ','arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k))
                e.preventDefault();
            keys[k] = true;
        });
        document.addEventListener('keyup', e => {
            keys[e.key === ' ' ? ' ' : e.key.toLowerCase()] = false;
        });

        // ── Touch controls ─────────────────────────────────────────
        const touchControls = document.getElementById('touch-controls');
        const touchFire     = document.getElementById('touch-fire');
        const dpadBtns      = document.querySelectorAll('.dpad-btn');

        // D-pad buttons
        dpadBtns.forEach(btn => {
            const key = btn.dataset.key;
            btn.addEventListener('touchstart', e => {
                e.preventDefault();
                keys[key] = true;
                btn.classList.add('active');
            }, { passive: false });
            btn.addEventListener('touchend', e => {
                e.preventDefault();
                keys[key] = false;
                btn.classList.remove('active');
            }, { passive: false });
            btn.addEventListener('touchcancel', e => {
                keys[key] = false;
                btn.classList.remove('active');
            });
        });

        // Fire button
        if (touchFire) {
            touchFire.addEventListener('touchstart', e => {
                e.preventDefault();
                keys[' '] = true;
                touchFire.classList.add('active');
            }, { passive: false });
            touchFire.addEventListener('touchend', e => {
                e.preventDefault();
                keys[' '] = false;
                touchFire.classList.remove('active');
            }, { passive: false });
            touchFire.addEventListener('touchcancel', e => {
                keys[' '] = false;
                touchFire.classList.remove('active');
            });
        }

        // Prevent canvas touch from scrolling
        canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
        canvas.addEventListener('touchmove',  e => e.preventDefault(), { passive: false });

        // ── Helpers ────────────────────────────────────────────────
        function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
        function dist2(ax, ay, bx, by) {
            const dx = ax - bx, dy = ay - by;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function updateLives() {
            if (livesEl) livesEl.textContent = '♥'.repeat(Math.max(0, lives));
        }

        function shake() {
            gameWrapper.classList.add('shake');
            setTimeout(() => gameWrapper.classList.remove('shake'), 200);
        }

        // ── Powerup functions ──────────────────────────────────────
        function spawnPowerup(x, y) {
            // 18% chance to drop a powerup
            if (Math.random() > 0.18) return;
            const types = ['spread', 'spread', 'rapid', 'rapid', 'pierce', 'pierce', 'shield', 'heart'];
            const type = types[Math.floor(Math.random() * types.length)];
            powerups.push({ x: x - 10, y: y - 10, w: 20, h: 20, type, vy: 1.5, wobble: 0 });
        }

        function collectPowerup(p) {
            spawnParticles(p.x + 10, p.y + 10, 10, POWERUP_COLORS[p.type]);
            if (p.type === 'heart') {
                lives = Math.min(lives + 1, 5);
                updateLives();
            } else if (p.type === 'shield') {
                invincible = true;
                invTimer = 300; // 5 seconds
                flashTimer = 0;
            } else {
                // Timed powerup
                activePowerup = { type: p.type, timer: POWERUP_DURATION };
            }
        }

        function updatePowerups() {
            // Move & collect
            for (let i = powerups.length - 1; i >= 0; i--) {
                const p = powerups[i];
                p.y += p.vy;
                p.wobble += 0.15;
                if (p.y > canvas.height + 30) { powerups.splice(i, 1); continue; }
                // Collision with player
                const pcx = player.x + player.w/2, pcy = player.y + player.h/2;
                if (dist2(pcx, pcy, p.x + 10, p.y + 10) < 24) {
                    collectPowerup(p);
                    powerups.splice(i, 1);
                }
            }
            // Tick active powerup
            if (activePowerup) {
                activePowerup.timer--;
                if (activePowerup.timer <= 0) activePowerup = null;
            }
        }

        function drawPowerup(p) {
            ctx.save();
            ctx.translate(p.x + 10, p.y + 10);
            // Wobble effect
            const wobbleX = Math.sin(p.wobble) * 2;
            ctx.translate(wobbleX, 0);
            // Glow
            ctx.shadowColor = POWERUP_COLORS[p.type];
            ctx.shadowBlur = 8;
            // Circle bg
            ctx.fillStyle = POWERUP_COLORS[p.type];
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            // Label
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px "Courier Prime", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(POWERUP_LABELS[p.type], 0, 1);
            ctx.restore();
        }

        // ── Drawing: player ────────────────────────────────────────
        function drawPlayer() {
            if (invincible && Math.floor(flashTimer / 4) % 2 === 0) return;
            ctx.save();
            ctx.translate(player.x + player.w / 2, player.y + player.h / 2);

            ctx.fillStyle = '#f2f2f2';
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

            ctx.fillStyle = '#1a1a1a';
            for (let i = 0; i < 8; i++) {
                ctx.save();
                ctx.rotate(i * Math.PI / 4);
                ctx.fillRect(-3, -22, 6, 8);
                ctx.restore();
            }

            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath(); ctx.ellipse(-6, -3, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( 6, -3, 4, 5, 0, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#f2f2f2';
            ctx.beginPath(); ctx.moveTo(-6,-8); ctx.lineTo(-6,-3); ctx.lineTo(-10,-3);
            ctx.arc(-6,-3,4,Math.PI,Math.PI*1.5); ctx.fill();
            ctx.beginPath(); ctx.moveTo(6,-8); ctx.lineTo(6,-3); ctx.lineTo(2,-3);
            ctx.arc(6,-3,4,Math.PI,Math.PI*1.5); ctx.fill();

            ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 2, 7, 0.2, Math.PI - 0.2); ctx.stroke();

            ctx.restore();
        }

        // ── Drawing: player bullet ─────────────────────────────────
        function drawBullet(b) {
            ctx.save();
            const color = b.color || '#ffffff';
            ctx.shadowColor = color; ctx.shadowBlur = 8;
            ctx.fillStyle = color;
            ctx.fillRect(b.x - 2, b.y - 7, 4, 14);
            ctx.restore();
        }

        // ── Drawing: enemies ───────────────────────────────────────
        function drawEnemy(e) {
            ctx.save();
            ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
            ctx.rotate(e.rot || 0);
            switch (e.type) {
                case 'cup': case 'sine': case 'zigzag': case 'dropper': drawCup(ctx); break;
                case 'missile':   drawMissile(ctx, e.dir > 0); break;
                case 'bouncer':   drawBouncer(ctx); break;
                case 'homing':    drawEye(ctx); break;
                case 'bossshot':  drawBossShot(ctx); break;
            }
            ctx.restore();
        }

        function drawCup(ctx) {
            ctx.fillStyle = '#555'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10,-8); ctx.lineTo(-8,8);
            ctx.quadraticCurveTo(0,12,8,8); ctx.lineTo(10,-8); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ccc';
            ctx.beginPath(); ctx.ellipse(0,-8,10,4,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.beginPath(); ctx.ellipse(0,-6,7,3,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath(); ctx.arc(-4,0,2,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc( 4,0,2,0,Math.PI*2); ctx.fill();
            ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=1.5;
            ctx.beginPath(); ctx.moveTo(-7,-3); ctx.lineTo(-2,-1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo( 7,-3); ctx.lineTo( 2,-1); ctx.stroke();
        }

        function drawMissile(ctx, rightward) {
            if (!rightward) ctx.scale(-1,1);
            ctx.fillStyle = '#666'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-15,0); ctx.lineTo(-8,-6); ctx.lineTo(12,-6);
            ctx.lineTo(18,0); ctx.lineTo(12,6); ctx.lineTo(-8,6); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ccc';
            ctx.beginPath(); ctx.moveTo(12,-6); ctx.lineTo(18,0); ctx.lineTo(12,6); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#444';
            ctx.beginPath(); ctx.moveTo(-12,-6); ctx.lineTo(-18,-12); ctx.lineTo(-8,-6); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-12, 6); ctx.lineTo(-18, 12); ctx.lineTo(-8, 6); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = 'rgba(220,220,220,0.6)';
            ctx.beginPath(); ctx.moveTo(-15,-3); ctx.lineTo(-24 - Math.random()*4, 0); ctx.lineTo(-15,3); ctx.closePath(); ctx.fill();
        }

        function drawBouncer(ctx) {
            ctx.fillStyle = '#444'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#1a1a1a';
            for (let i = 0; i < 6; i++) {
                ctx.save(); ctx.rotate(i * Math.PI/3);
                ctx.fillRect(-3,-18,6,7); ctx.restore();
            }
            ctx.fillStyle = '#888';
            ctx.beginPath(); ctx.arc(0,0,6,0,Math.PI*2); ctx.fill();
        }

        function drawEye(ctx) {
            ctx.fillStyle = '#333'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#999';
            ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(2,0,5,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(4,-2,2,0,Math.PI*2); ctx.fill();
        }

        function drawBossShot(ctx) {
            ctx.fillStyle = '#aaa'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0,0,6,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(-2,-2,2,0,Math.PI*2); ctx.fill();
        }

        // ── Drawing: Boss 1 — Big Brew ─────────────────────────────
        function drawBoss1(b) {
            ctx.save();
            ctx.translate(b.x + b.w/2, b.y + b.h/2);
            const fl = b.flash > 0;
            ctx.fillStyle = fl ? '#ffffff' : '#444';
            ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-28,-20); ctx.lineTo(-22,30);
            ctx.quadraticCurveTo(0,42,22,30);
            ctx.lineTo(28,-20); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = fl ? '#fff' : '#cccccc';
            ctx.beginPath(); ctx.ellipse(0,-20,28,10,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.beginPath(); ctx.ellipse(0,-18,22,7,0,0,Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.fillStyle = 'transparent';
            ctx.beginPath(); ctx.arc(35, 5, 15, -Math.PI/2, Math.PI/2); ctx.stroke();
            ctx.fillStyle = fl ? '#333' : '#1a1a1a';
            ctx.beginPath(); ctx.ellipse(-10,4,7,9,0,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( 10,4,7,9,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = fl ? '#1a1a1a' : '#ccc';
            ctx.beginPath(); ctx.moveTo(-10,-5); ctx.lineTo(-10,4); ctx.lineTo(-17,4); ctx.arc(-10,4,7,Math.PI,Math.PI*1.5); ctx.fill();
            ctx.beginPath(); ctx.moveTo( 10,-5); ctx.lineTo( 10,4); ctx.lineTo(  3,4); ctx.arc( 10,4,7,Math.PI,Math.PI*1.5); ctx.fill();
            ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-18,-8); ctx.lineTo(-4,-3); ctx.stroke();
            ctx.beginPath(); ctx.moveTo( 18,-8); ctx.lineTo( 4,-3); ctx.stroke();
            ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-12,18); ctx.lineTo(-6,14); ctx.lineTo(-2,18); ctx.lineTo(2,14); ctx.lineTo(6,18); ctx.lineTo(12,14); ctx.lineTo(16,18); ctx.stroke();
            ctx.restore();
        }

        // ── Drawing: Boss 2 — Gear King ────────────────────────────
        function drawBoss2(b) {
            ctx.save();
            ctx.translate(b.x + b.w/2, b.y + b.h/2);
            ctx.rotate(b.rot);
            const fl = b.flash > 0;
            ctx.fillStyle = fl ? '#fff' : '#333'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0,0,34,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = fl ? '#fff' : '#555';
            for (let i = 0; i < 10; i++) {
                ctx.save(); ctx.rotate(i * Math.PI/5);
                ctx.fillRect(-5,-44,10,14); ctx.restore();
            }
            ctx.fillStyle = fl ? '#fff' : '#222'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0,0,22,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = fl ? '#aaa' : '#555'; ctx.lineWidth = 4;
            for (let i = 0; i < 3; i++) {
                ctx.save(); ctx.rotate(i * Math.PI/1.5);
                ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-22); ctx.stroke();
                ctx.restore();
            }
            ctx.fillStyle = fl ? '#fff' : '#888'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = fl ? '#333' : '#f2f2f2';
            ctx.beginPath(); ctx.ellipse(-7,0,5,6,0,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( 7,0,5,6,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = fl ? '#f2f2f2' : '#333';
            ctx.beginPath(); ctx.ellipse(-7,0,3,3,0,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( 7,0,3,3,0,0,Math.PI*2); ctx.fill();
            ctx.restore();
        }

        // ── Drawing: Boss 3 — The Machine ─────────────────────────
        function drawBoss3(b) {
            ctx.save();
            ctx.translate(b.x + b.w/2, b.y + b.h/2);
            const fl = b.flash > 0;
            ctx.fillStyle = fl ? '#fff' : '#222'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-28,-35); ctx.lineTo(28,-35); ctx.lineTo(32,-25); ctx.lineTo(28,35);
            ctx.lineTo(-28,35); ctx.lineTo(-32,-25); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = fl ? '#aaa' : '#111';
            ctx.beginPath(); ctx.rect(-20,-28,40,36); ctx.fill();
            ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.stroke();
            const screenColor = fl ? '#fff' : '#333';
            ctx.fillStyle = screenColor;
            ctx.beginPath(); ctx.arc(0,-12,11,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = fl ? '#444' : '#bbb';
            ctx.beginPath(); ctx.ellipse(-6,-16,4,5,0,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( 6,-16,4,5,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = fl ? '#bbb' : '#333';
            ctx.beginPath(); ctx.ellipse(-6,-16,2,2,0,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( 6,-16,2,2,0,0,Math.PI*2); ctx.fill();
            ctx.strokeStyle = fl ? '#333' : '#bbb'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-8,-4); ctx.lineTo(-4,-2); ctx.lineTo(4,-2); ctx.lineTo(8,-4); ctx.stroke();
            ctx.fillStyle = fl ? '#fff' : '#333';
            ctx.beginPath(); ctx.rect(-22,9,44,12); ctx.fill(); ctx.stroke();
            ['#aaa','#888','#ccc'].forEach((c,i) => {
                ctx.fillStyle = fl ? '#fff' : c;
                ctx.beginPath(); ctx.arc(-10 + i*10, 15, 4, 0, Math.PI*2); ctx.fill();
            });
            ctx.fillStyle = fl ? '#fff' : '#333';
            ctx.fillRect(-20,35,8,8); ctx.fillRect(12,35,8,8);
            ctx.fillStyle = fl ? '#fff' : '#f2f2f2'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(-40,-10,10,7,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse( 40,-10,10,7,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.restore();
        }

        // ── Particles ──────────────────────────────────────────────
        function spawnParticles(x, y, n, col) {
            for (let i = 0; i < n; i++) {
                const life = 25 + Math.random() * 20;
                particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6 - 1,
                    life, maxLife: life,
                    size: 2 + Math.random() * 4,
                    col
                });
            }
        }

        function updateParticles() {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life--;
                if (p.life <= 0) particles.splice(i, 1);
            }
        }

        function drawParticles() {
            particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.life / p.maxLife;
                ctx.fillStyle = p.col;
                ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
                ctx.restore();
            });
        }

        // ── Enemy spawning ─────────────────────────────────────────
        function spawnEnemy() {
            const cfg = LEVELS[level];
            const spd = 1.4 + level * 0.5 + Math.min(killCount * 0.025, 1.2);
            const r   = Math.random();
            let type;

            if (level === 0) {
                type = r < 0.50 ? 'cup' : r < 0.75 ? 'sine' : r < 0.90 ? 'zigzag' : 'missile';
            } else if (level === 1) {
                type = r < 0.25 ? 'cup' : r < 0.45 ? 'sine' : r < 0.62 ? 'zigzag' :
                       r < 0.76 ? 'missile' : r < 0.88 ? 'bouncer' : 'dropper';
            } else {
                type = r < 0.15 ? 'cup' : r < 0.30 ? 'sine' : r < 0.44 ? 'zigzag' :
                       r < 0.56 ? 'dropper' : r < 0.68 ? 'missile' : r < 0.80 ? 'bouncer' : 'homing';
            }

            const e = { type, w: 24, h: 24, rot: 0, rotSpd: (Math.random() - 0.5) * 0.14, hp: 1 };

            if (type === 'missile') {
                const left = Math.random() > 0.5;
                e.w = 36;
                e.x = left ? -36 : canvas.width;
                e.y = 20 + Math.random() * (canvas.height - 80);
                e.vx = (left ? 1 : -1) * (spd + Math.random() * 2 + 1);
                e.vy = 0; e.dir = left ? 1 : -1;
            } else if (type === 'dropper') {
                e.x = Math.random() * (canvas.width - 20); e.y = -20;
                e.vx = 0; e.vy = 4.5 + Math.random() * 1.5 + level;
            } else if (type === 'sine') {
                e.startX = 20 + Math.random() * (canvas.width - 44);
                e.x = e.startX; e.y = -24;
                e.vx = 0; e.vy = spd + Math.random();
                e.amp = 55 + Math.random() * 55;
                e.freq = 0.025 + Math.random() * 0.025;
                e.phase = Math.random() * Math.PI * 2;
            } else if (type === 'zigzag') {
                e.x = Math.random() * (canvas.width - 24); e.y = -24;
                e.vx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random());
                e.vy = spd + Math.random();
                e.ztimer = 0; e.zint = 28 + Math.floor(Math.random() * 20);
            } else if (type === 'bouncer') {
                e.x = Math.random() * (canvas.width - 26); e.y = -26;
                e.vx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
                e.vy = spd * 0.8 + Math.random();
            } else if (type === 'homing') {
                const side = Math.random() > 0.5;
                e.x = side ? (Math.random() > 0.5 ? -24 : canvas.width) : Math.random() * (canvas.width - 24);
                e.y = side ? Math.random() * (canvas.height / 2) : -24;
                e.vx = 0; e.vy = 0; e.homespd = 1.2 + level * 0.35;
            } else {
                e.x = Math.random() * (canvas.width - 24); e.y = -24;
                e.vx = 0; e.vy = spd + Math.random() * 1.5;
            }

            enemies.push(e);
        }

        // ── Boss spawning ──────────────────────────────────────────
        function spawnBoss() {
            const cfg = LEVELS[level];
            bossMaxHP = cfg.bossHP; bossHP = bossMaxHP; bossPhase = 0;
            if (level === 0) {
                boss = { type:'boss1', x:160, y:12, w:80, h:80, vx:1.6, flash:0, atk:120 };
            } else if (level === 1) {
                boss = { type:'boss2', x:158, y:8, w:84, h:84, rot:0, sineT:0, flash:0, atk:105, charging:false, chargeV:0, chargeY:10 };
            } else {
                boss = { type:'boss3', x:160, y:12, w:80, h:80, vx:2.2, vy:1.2, flash:0, atk:80 };
            }
        }

        // ── Boss update ────────────────────────────────────────────
        function updateBoss() {
            if (!boss) return;
            if (boss.flash > 0) boss.flash--;

            if (boss.type === 'boss1') {
                boss.x += boss.vx;
                if (boss.x <= 8 || boss.x + boss.w >= canvas.width - 8) boss.vx *= -1;
                boss.x = clamp(boss.x, 8, canvas.width - boss.w - 8);
                boss.atk--;
                if (boss.atk <= 0) {
                    boss.atk = bossPhase === 1 ? 55 : 95;
                    const cx = boss.x + boss.w/2, cy = boss.y + boss.h;
                    const count = bossPhase === 1 ? 5 : 3;
                    for (let i = 0; i < count; i++) {
                        const ox = (i - Math.floor(count/2)) * 28;
                        enemies.push({ type:'dropper', hp:1, w:20, h:20,
                            x: cx - 10 + ox, y: cy,
                            vx: ox * 0.04, vy: 3.2 + Math.random(),
                            rot:0, rotSpd:0.08 });
                    }
                }

            } else if (boss.type === 'boss2') {
                boss.sineT += 0.018;
                boss.x = clamp(canvas.width/2 - boss.w/2 + Math.sin(boss.sineT) * 145,
                    5, canvas.width - boss.w - 5);
                boss.rot += 0.022;

                if (boss.charging) {
                    boss.y += boss.chargeV;
                    if (boss.y >= canvas.height * 0.55 || boss.chargeV > 0 && boss.y >= boss.chargeTarget) {
                        boss.chargeV = -5; // retract
                    }
                    if (boss.y < boss.chargeY) {
                        boss.y = boss.chargeY; boss.charging = false; boss.chargeV = 0;
                    }
                }
                boss.atk--;
                if (boss.atk <= 0) {
                    boss.atk = bossPhase === 1 ? 65 : 100;
                    const cx = boss.x + boss.w/2, cy = boss.y + boss.h/2;
                    const count = bossPhase === 1 ? 10 : 8;
                    for (let i = 0; i < count; i++) {
                        const ang = (i / count) * Math.PI * 2;
                        enemies.push({ type:'bossshot', hp:1, w:14, h:14,
                            x: cx-7, y: cy-7, vx: Math.cos(ang)*2.8, vy: Math.sin(ang)*2.8,
                            rot:0, rotSpd:0.1, free:true });
                    }
                    if (!boss.charging && Math.random() < 0.3) {
                        boss.charging = true;
                        boss.chargeV = 7;
                        boss.chargeTarget = canvas.height * 0.55;
                    }
                }

            } else if (boss.type === 'boss3') {
                boss.x += boss.vx; boss.y += boss.vy;
                if (boss.x <= 5 || boss.x + boss.w >= canvas.width - 5)  boss.vx *= -1;
                if (boss.y <= 5 || boss.y + boss.h >= canvas.height*0.48) boss.vy *= -1;
                boss.x = clamp(boss.x, 5, canvas.width - boss.w - 5);
                boss.y = clamp(boss.y, 5, canvas.height*0.48 - boss.h);
                boss.atk--;
                if (boss.atk <= 0) {
                    boss.atk = bossPhase === 1 ? 48 : 72;
                    const cx = boss.x + boss.w/2, cy = boss.y + boss.h/2;
                    const px = player.x + player.w/2, py = player.y + player.h/2;
                    const ang = Math.atan2(py - cy, px - cx);
                    const spd = 3.2 + bossPhase;
                    const shots = bossPhase === 1 ? 3 : 1;
                    for (let s = 0; s < shots; s++) {
                        const spread = (s - Math.floor(shots/2)) * 0.22;
                        enemies.push({ type:'bossshot', hp:1, w:14, h:14,
                            x: cx-7, y: cy-7,
                            vx: Math.cos(ang + spread) * spd,
                            vy: Math.sin(ang + spread) * spd,
                            rot:0, rotSpd:0.12, free:true });
                    }
                    if (bossPhase === 1 && Math.random() < 0.4) {
                        spawnEnemy(); spawnEnemy();
                    }
                }
            }

            // Enrage at 50% HP
            if (bossHP <= bossMaxHP / 2 && bossPhase === 0) {
                bossPhase = 1;
                boss.flash = 25;
                spawnParticles(boss.x + boss.w/2, boss.y + boss.h/2, 20, '#ffffff');
            }
        }

        // ── Enemy update ───────────────────────────────────────────
        function updateEnemies() {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];

                if (e.free) {
                    e.x += e.vx; e.y += e.vy; e.rot += (e.rotSpd || 0);
                    if (e.x < -60 || e.x > canvas.width+60 || e.y < -60 || e.y > canvas.height+60)
                        enemies.splice(i, 1);
                    else checkEnemyPlayerCollision(e, i);
                    continue;
                }

                if      (e.type === 'sine') {
                    e.y += e.vy;
                    e.x = e.startX + Math.sin(e.y * e.freq + e.phase) * e.amp;
                } else if (e.type === 'zigzag') {
                    e.y += e.vy; e.x += e.vx;
                    e.ztimer++;
                    if (e.ztimer >= e.zint) { e.vx *= -1; e.ztimer = 0; }
                    if (e.x < 0 || e.x + e.w > canvas.width) e.vx *= -1;
                } else if (e.type === 'bouncer') {
                    e.x += e.vx; e.y += e.vy;
                    if (e.x < 0 || e.x + e.w > canvas.width) e.vx *= -1;
                    e.rot += 0.1;
                } else if (e.type === 'homing') {
                    const px = player.x + player.w/2, py = player.y + player.h/2;
                    const ecx = e.x + e.w/2, ecy = e.y + e.h/2;
                    const ang = Math.atan2(py - ecy, px - ecx);
                    e.vx = e.vx * 0.88 + Math.cos(ang) * e.homespd * 0.12;
                    e.vy = e.vy * 0.88 + Math.sin(ang) * e.homespd * 0.12;
                    const spd = Math.hypot(e.vx, e.vy);
                    if (spd > e.homespd) { e.vx /= spd/e.homespd; e.vy /= spd/e.homespd; }
                    e.x += e.vx; e.y += e.vy;
                } else {
                    e.x += (e.vx || 0); e.y += e.vy;
                }
                e.rot += (e.rotSpd || 0);

                // Off-screen check
                let gone = false;
                if (e.type === 'missile') {
                    if ((e.vx > 0 && e.x > canvas.width + 40) || (e.vx < 0 && e.x < -e.w - 40)) gone = true;
                } else if (e.y > canvas.height + 40 || e.y < -canvas.height) {
                    gone = true;
                }
                if (e.x < -canvas.width || e.x > canvas.width * 2) gone = true;

                if (gone) {
                    enemies.splice(i, 1);
                    score++;
                    scoreEl.textContent = score;
                    continue;
                }

                checkEnemyPlayerCollision(e, i);
            }
        }

        function checkEnemyPlayerCollision(e, idx) {
            if (invincible) return;
            const pcx = player.x + player.w/2, pcy = player.y + player.h/2;
            const ecx = e.x + e.w/2, ecy = e.y + e.h/2;
            const radius = (e.type === 'dropper' || e.type === 'bossshot') ? 13 : 16;
            if (dist2(pcx, pcy, ecx, ecy) < radius + 11) {
                spawnParticles(pcx, pcy, 12, '#ffffff');
                enemies.splice(idx, 1);
                takeDamage();
            }
        }

        // ── Bullet update ──────────────────────────────────────────
        function updateBullets() {
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                if (!b) continue; // guard: bullets[] may be cleared mid-loop
                b.x += b.vx || 0;
                b.y += b.vy || 0;
                // Off screen
                if (b.y < -20 || b.x < -20 || b.x > canvas.width + 20) { 
                    bullets.splice(i, 1); continue; 
                }

                // vs enemies
                let hitEnemy = false;
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (dist2(b.x, b.y, e.x + e.w/2, e.y + e.h/2) < e.w/2 + 5) {
                        spawnParticles(e.x + e.w/2, e.y + e.h/2, 8, b.color || '#aaaaaa');
                        e.hp--;
                        if (e.hp <= 0) {
                            spawnPowerup(e.x + e.w/2, e.y + e.h/2);
                            enemies.splice(j, 1);
                            score += 2; killCount++;
                            scoreEl.textContent = score;
                            if (gameState === 'playing') checkProgress();
                        }
                        if (!b.pierce) {
                            bullets.splice(i, 1); hitEnemy = true; break;
                        }
                        // Pierce: continue but mark as hit
                        hitEnemy = true;
                    }
                }
                if (hitEnemy && !b.pierce) continue;

                // vs boss
                if (boss && gameState === 'boss') {
                    const bcx = boss.x + boss.w/2, bcy = boss.y + boss.h/2;
                    if (dist2(b.x, b.y, bcx, bcy) < boss.w/2 + 5) {
                        boss.flash = 6; bossHP--;
                        spawnParticles(b.x, b.y, 5, b.color || '#ffffff');
                        if (!b.pierce) bullets.splice(i, 1);
                        if (bossHP <= 0) { bossDefeated(); return; }
                    }
                }
            }
        }

        // ── Shoot ──────────────────────────────────────────────────
        function shoot() {
            const maxBullets = activePowerup?.type === 'spread' ? 12 : 6;
            if (shootCooldown > 0 || bullets.length >= maxBullets) return;
            
            const cx = player.x + player.w/2;
            const cy = player.y;
            const pierce = activePowerup?.type === 'pierce';
            const color = activePowerup ? POWERUP_COLORS[activePowerup.type] : '#ffffff';
            
            if (activePowerup?.type === 'spread') {
                // 3-way shot
                bullets.push({ x: cx, y: cy, vx: 0, vy: -8, pierce, color });
                bullets.push({ x: cx, y: cy, vx: -2.5, vy: -7.5, pierce, color });
                bullets.push({ x: cx, y: cy, vx:  2.5, vy: -7.5, pierce, color });
            } else {
                bullets.push({ x: cx, y: cy, vx: 0, vy: -9, pierce, color });
            }
            
            // Rapid fire = faster cooldown
            shootCooldown = activePowerup?.type === 'rapid' ? 6 : baseCooldown;
        }

        // ── Level progress ─────────────────────────────────────────
        function checkProgress() {
            if (killCount >= LEVELS[level].kills) {
                gameState = 'boss_intro';
                stateTimer = 100;
                enemies = []; bullets = []; powerups = [];
                spawnParticles(canvas.width/2, canvas.height/2, 25, '#ffffff');
            }
        }

        function bossDefeated() {
            score += 15; scoreEl.textContent = score;
            spawnParticles(boss.x + boss.w/2, boss.y + boss.h/2, 45, '#ffffff');
            boss = null; enemies = []; bullets = []; powerups = [];
            if (level >= 2) {
                endGame(true);
            } else {
                level++;
                gameState = 'level_clear';
                stateTimer = 130;
            }
        }

        // ── Damage ─────────────────────────────────────────────────
        function takeDamage() {
            if (invincible) return;
            lives--;
            updateLives();
            invincible = true; invTimer = 90; flashTimer = 0;
            shake();
            if (lives <= 0) endGame(false);
        }

        // ── End game ───────────────────────────────────────────────
        function endGame(win) {
            gameRunning = false;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('gearDodger2High', highScore);
                highScoreEl.textContent = highScore;
            }
            if (win) {
                gameState = 'win';
                if (winScoreEl)  winScoreEl.textContent = score;
                if (gameWinOverlay) gameWinOverlay.style.display = 'flex';
            } else {
                gameState = 'game_over';
                finalScoreEl.textContent = score;
                gameOverOverlay.style.display = 'flex';
            }
        }

        // ── Update ─────────────────────────────────────────────────
        function update() {
            frameCount++;
            if (shootCooldown > 0) shootCooldown--;
            if (invincible) {
                invTimer--; flashTimer++;
                if (invTimer <= 0) { invincible = false; flashTimer = 0; }
            }

            // Player movement
            let dx = 0, dy = 0;
            if (keys['arrowleft'] || keys['a']) dx = -player.speed;
            if (keys['arrowright'] || keys['d']) dx =  player.speed;
            if (keys['arrowup']    || keys['w']) dy = -player.speed;
            if (keys['arrowdown']  || keys['s']) dy =  player.speed;
            if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
            player.x = clamp(player.x + dx, 0, canvas.width  - player.w);
            player.y = clamp(player.y + dy, 0, canvas.height - player.h);
            if (keys[' ']) shoot();

            if (gameState === 'playing') {
                spawnTimer++;
                if (spawnTimer >= spawnInterval) {
                    spawnEnemy(); spawnTimer = 0;
                    if (spawnInterval > LEVELS[level].spawnMin) spawnInterval -= 0.2;
                }
                updateEnemies(); updateBullets(); updatePowerups(); updateParticles();

            } else if (gameState === 'boss_intro') {
                stateTimer--; updateParticles();
                if (stateTimer <= 0) { gameState = 'boss'; spawnBoss(); }

            } else if (gameState === 'boss') {
                updateBoss(); updateEnemies(); updateBullets(); updatePowerups(); updateParticles();
                // Boss body → player collision
                if (boss && !invincible) {
                    const pcx = player.x + player.w/2, pcy = player.y + player.h/2;
                    const bcx = boss.x + boss.w/2, bcy = boss.y + boss.h/2;
                    if (dist2(pcx, pcy, bcx, bcy) < boss.w/2 + 14) takeDamage();
                }

            } else if (gameState === 'level_clear') {
                stateTimer--; updateParticles();
                if (stateTimer <= 0) {
                    gameState = 'playing'; killCount = 0; enemies = []; bullets = []; powerups = [];
                    spawnInterval = LEVELS[level].spawnStart; spawnTimer = 0;
                    if (levelEl) levelEl.textContent = level + 1;
                }
            }
        }

        // ── Draw ───────────────────────────────────────────────────
        function draw() {
            // Background
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Subtle scrolling dots
            ctx.fillStyle = 'rgba(255,255,255,0.025)';
            for (let i = 0; i < 28; i++) {
                const sx = (i * 139 + frameCount * 0.15) % canvas.width;
                const sy = (i *  97 + frameCount * 0.10) % canvas.height;
                ctx.fillRect(sx, sy, 1, 1);
            }

            // Floor line
            ctx.fillStyle = '#1c1c1c';
            ctx.fillRect(0, canvas.height - 18, canvas.width, 18);
            ctx.strokeStyle = '#2e2e2e'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, canvas.height-18); ctx.lineTo(canvas.width, canvas.height-18); ctx.stroke();

            enemies.forEach(e => drawEnemy(e));
            powerups.forEach(p => drawPowerup(p));

            if (boss) {
                if      (boss.type === 'boss1') drawBoss1(boss);
                else if (boss.type === 'boss2') drawBoss2(boss);
                else if (boss.type === 'boss3') drawBoss3(boss);
            }

            bullets.forEach(b => drawBullet(b));
            drawPlayer();
            drawParticles();
            drawHUD();
        }

        // ── HUD ────────────────────────────────────────────────────
        function drawHUD() {
            const cfg = LEVELS[Math.min(level, LEVELS.length-1)];
            ctx.save();
            ctx.textAlign = 'center';

            if (gameState === 'playing') {
                ctx.font = '10px "Special Elite", monospace';
                ctx.fillStyle = 'rgba(255,255,255,0.55)';
                ctx.fillText(`${cfg.name}: ${cfg.sub}`, canvas.width/2, 13);
                const prog = Math.min(killCount / cfg.kills, 1);
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(canvas.width/2 - 60, 17, 120, 5);
                ctx.fillStyle = 'rgba(255,255,255,0.65)';
                ctx.fillRect(canvas.width/2 - 60, 17, 120 * prog, 5);

            } else if (gameState === 'boss_intro') {
                const alpha = Math.min(1, (100 - stateTimer) / 18);
                ctx.font = 'bold 18px "Playfair Display", serif';
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fillText('— BOSS —', canvas.width/2, canvas.height/2 - 14);
                ctx.font = 'bold 13px "Special Elite", monospace';
                ctx.fillStyle = `rgba(200,200,200,${alpha})`;
                ctx.fillText(BOSS_NAMES[level], canvas.width/2, canvas.height/2 + 10);

            } else if (gameState === 'boss') {
                ctx.font = '10px "Special Elite", monospace';
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.fillText(BOSS_NAMES[level], canvas.width/2, 13);
                const bw = 200, bx = canvas.width/2 - bw/2;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(bx - 1, 17, bw + 2, 9);
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(bx, 18, bw, 7);
                const frac = bossHP / bossMaxHP;
                ctx.fillStyle = frac > 0.5 ? 'rgba(160,255,160,0.8)' : 'rgba(255,120,120,0.9)';
                ctx.fillRect(bx, 18, bw * frac, 7);
                ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
                ctx.strokeRect(bx, 18, bw, 7);

            } else if (gameState === 'level_clear') {
                const alpha = Math.min(1, (130 - stateTimer) / 18);
                ctx.font = 'bold 20px "Playfair Display", serif';
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fillText('STAGE CLEAR!', canvas.width/2, canvas.height/2 - 10);
                ctx.font = '12px "Special Elite", monospace';
                ctx.fillStyle = `rgba(180,180,180,${alpha})`;
                ctx.fillText(`Entering ${LEVELS[level].name}: ${LEVELS[level].sub}`, canvas.width/2, canvas.height/2 + 14);
            }

            // Active powerup indicator (bottom left)
            if (activePowerup && (gameState === 'playing' || gameState === 'boss')) {
                const pct = activePowerup.timer / POWERUP_DURATION;
                const pcolor = POWERUP_COLORS[activePowerup.type];
                ctx.textAlign = 'left';
                ctx.font = 'bold 11px "Courier Prime", monospace';
                // Background bar
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(8, canvas.height - 42, 52, 14);
                // Timer bar
                ctx.fillStyle = pcolor;
                ctx.fillRect(9, canvas.height - 41, 50 * pct, 12);
                // Label
                ctx.fillStyle = '#fff';
                ctx.fillText(activePowerup.type.toUpperCase(), 12, canvas.height - 32);
            }

            ctx.restore();
        }

        // ── Game loop ──────────────────────────────────────────────
        function gameLoop() {
            if (!gameRunning) return;
            update(); draw();
            requestAnimationFrame(gameLoop);
        }

        function startGame() {
            gameRunning = true;
            gameState = 'playing';
            score = 0; level = 0; lives = 3; killCount = 0;
            invincible = false; invTimer = 0; flashTimer = 0;
            shootCooldown = 0; frameCount = 0; stateTimer = 0;
            enemies = []; bullets = []; particles = []; powerups = [];
            activePowerup = null;
            boss = null; bossHP = 0;
            spawnTimer = 0; spawnInterval = LEVELS[0].spawnStart;
            player.x = canvas.width/2 - player.w/2;
            player.y = canvas.height - 60;
            scoreEl.textContent = 0;
            if (levelEl) levelEl.textContent = 1;
            updateLives();
            gameOverlay.style.display = 'none';
            gameOverOverlay.style.display = 'none';
            if (gameWinOverlay) gameWinOverlay.style.display = 'none';
            gameLoop();
        }

        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', startGame);
        if (playAgainWinBtn) playAgainWinBtn.addEventListener('click', startGame);

        // Initial idle frame
        draw();
    }
});
