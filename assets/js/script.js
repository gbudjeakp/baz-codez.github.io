/* ═══════════════════════════════════════════════════════════════
   RETRO CUPHEAD STYLE - Minimal JavaScript
   Clean, simple interactions
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
    // ═══════════════════════════════════════════════════════════════
    // DARK MODE TOGGLE
    // ═══════════════════════════════════════════════════════════════
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // SMOOTH SCROLLING
    // ═══════════════════════════════════════════════════════════════
    // Mobile hamburger menu toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a nav link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
    
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
        // Menu buttons
        const startStoryBtn   = document.getElementById('start-story');
        const startArcadeBtn  = document.getElementById('start-arcade');
        const restartBtn      = document.getElementById('restart-game');
        const playAgainWinBtn = document.getElementById('play-again-win');
        const backToMenuBtn   = document.getElementById('back-to-menu');
        const backToMenuWinBtn= document.getElementById('back-to-menu-win');
        const sfxToggleBtn    = document.getElementById('sfx-toggle');
        const musicToggleBtn  = document.getElementById('music-toggle');
        // Overlays
        const gameOverlay     = document.getElementById('game-overlay');
        const gameOverOverlay = document.getElementById('game-over-overlay');
        const gameWinOverlay  = document.getElementById('game-win-overlay');
        const gamePauseOverlay= document.getElementById('game-pause-overlay');
        // Pause menu elements
        const resumeBtn       = document.getElementById('resume-game');
        const pauseSfxBtn     = document.getElementById('pause-sfx-toggle');
        const pauseMusicBtn   = document.getElementById('pause-music-toggle');
        const pauseQuitBtn    = document.getElementById('pause-quit');
        // Info displays
        const scoreEl         = document.getElementById('score');
        const highScoreEl     = document.getElementById('high-score');
        const finalScoreEl    = document.getElementById('final-score');
        const winScoreEl      = document.getElementById('win-score');
        const levelEl         = document.getElementById('level-display');
        const livesEl         = document.getElementById('lives-display');
        const modeDisplayEl   = document.getElementById('mode-display');
        const stageContainer  = document.getElementById('stage-display-container');
        const gameWrapper     = document.querySelector('.game-wrapper');

        // ── Game mode ──────────────────────────────────────────────
        let gameMode = 'story'; // 'story' or 'arcade'

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
        const player = { x: 250, y: 340, w: 40, h: 40, speed: 5 };
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

        // ── Sound System (Web Audio API) ───────────────────────────
        let audioCtx = null;
        let sfxEnabled = true;
        let musicEnabled = true;
        let musicNodes = null; // Will hold oscillators for background music
        let gamePaused = false;
        
        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }
        
        function startMusic() {
            if (!audioCtx || musicNodes) return;
            
            const now = audioCtx.currentTime;
            
            // Create master gain for music
            const masterGain = audioCtx.createGain();
            masterGain.gain.value = musicEnabled ? 0.15 : 0;
            masterGain.connect(audioCtx.destination);
            
            // Bass line oscillator
            const bassOsc = audioCtx.createOscillator();
            const bassGain = audioCtx.createGain();
            bassOsc.type = 'triangle';
            bassGain.gain.value = 0.4;
            bassOsc.connect(bassGain);
            bassGain.connect(masterGain);
            
            // Melody oscillator
            const melodyOsc = audioCtx.createOscillator();
            const melodyGain = audioCtx.createGain();
            melodyOsc.type = 'square';
            melodyGain.gain.value = 0.25;
            melodyOsc.connect(melodyGain);
            melodyGain.connect(masterGain);
            
            // Arpeggio oscillator
            const arpOsc = audioCtx.createOscillator();
            const arpGain = audioCtx.createGain();
            arpOsc.type = 'sawtooth';
            arpGain.gain.value = 0.15;
            arpOsc.connect(arpGain);
            arpGain.connect(masterGain);
            
            // Bass pattern (loop every 2 seconds)
            const bassNotes = [55, 55, 73.4, 73.4, 82.4, 82.4, 65.4, 65.4]; // A1, D2, E2, C2
            let bassIndex = 0;
            function scheduleBass() {
                if (!musicNodes) return;
                bassOsc.frequency.setValueAtTime(bassNotes[bassIndex], audioCtx.currentTime);
                bassIndex = (bassIndex + 1) % bassNotes.length;
                setTimeout(scheduleBass, 250);
            }
            
            // Melody pattern
            const melodyNotes = [220, 247, 262, 294, 330, 294, 262, 247]; // A3, B3, C4, D4, E4...
            let melodyIndex = 0;
            function scheduleMelody() {
                if (!musicNodes) return;
                melodyOsc.frequency.setValueAtTime(melodyNotes[melodyIndex], audioCtx.currentTime);
                melodyIndex = (melodyIndex + 1) % melodyNotes.length;
                setTimeout(scheduleMelody, 250);
            }
            
            // Arpeggio pattern
            const arpNotes = [440, 554, 659, 554]; // A4, C#5, E5, C#5
            let arpIndex = 0;
            function scheduleArp() {
                if (!musicNodes) return;
                arpOsc.frequency.setValueAtTime(arpNotes[arpIndex], audioCtx.currentTime);
                arpIndex = (arpIndex + 1) % arpNotes.length;
                setTimeout(scheduleArp, 125);
            }
            
            bassOsc.start();
            melodyOsc.start();
            arpOsc.start();
            scheduleBass();
            scheduleMelody();
            scheduleArp();
            
            musicNodes = { masterGain, bassOsc, bassGain, melodyOsc, melodyGain, arpOsc, arpGain };
        }
        
        function stopMusic() {
            if (musicNodes) {
                try {
                    musicNodes.bassOsc.stop();
                    musicNodes.melodyOsc.stop();
                    musicNodes.arpOsc.stop();
                } catch (e) {}
                musicNodes = null;
            }
        }
        
        function updateMusicVolume() {
            if (musicNodes && musicNodes.masterGain) {
                musicNodes.masterGain.gain.value = musicEnabled ? 0.15 : 0;
            }
        }
        
        function playSound(type) {
            if (!sfxEnabled || !audioCtx) return;
            
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            switch (type) {
                case 'shoot':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.08);
                    break;
                
                case 'shoot_spread':
                    // Higher pitch, wider sound for spread shot
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
                    gain.gain.setValueAtTime(0.07, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                    osc.start(now);
                    osc.stop(now + 0.06);
                    // Add second tone for fullness
                    const osc2 = audioCtx.createOscillator();
                    const gain2 = audioCtx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(audioCtx.destination);
                    osc2.type = 'triangle';
                    osc2.frequency.setValueAtTime(600, now);
                    osc2.frequency.exponentialRampToValueAtTime(300, now + 0.07);
                    gain2.gain.setValueAtTime(0.05, now);
                    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
                    osc2.start(now);
                    osc2.stop(now + 0.07);
                    break;
                    
                case 'shoot_rapid':
                    // Quick, snappy sound for rapid fire
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(900, now);
                    osc.frequency.exponentialRampToValueAtTime(500, now + 0.04);
                    gain.gain.setValueAtTime(0.06, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;
                    
                case 'shoot_pierce':
                    // Deep, powerful sound for piercing shots
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.start(now);
                    osc.stop(now + 0.12);
                    break;
                    
                case 'hit':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.start(now);
                    osc.stop(now + 0.12);
                    break;
                    
                case 'explosion':
                    // Use noise-like effect with multiple oscillators
                    for (let i = 0; i < 3; i++) {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.type = 'sawtooth';
                        o.frequency.setValueAtTime(100 + i * 50, now);
                        o.frequency.exponentialRampToValueAtTime(20, now + 0.25);
                        g.gain.setValueAtTime(0.08, now);
                        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                        o.start(now + i * 0.02);
                        o.stop(now + 0.25);
                    }
                    return; // Skip default osc
                    
                case 'powerup':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.setValueAtTime(600, now + 0.05);
                    osc.frequency.setValueAtTime(800, now + 0.1);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
                    
                case 'damage':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.setValueAtTime(100, now + 0.05);
                    osc.frequency.setValueAtTime(200, now + 0.1);
                    osc.frequency.setValueAtTime(80, now + 0.15);
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                    break;
                    
                case 'boss_intro':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(80, now);
                    osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
                    osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.setValueAtTime(0.12, now + 0.3);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                    osc.start(now);
                    osc.stop(now + 0.6);
                    break;
                    
                case 'boss_defeat':
                    for (let i = 0; i < 5; i++) {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.type = 'square';
                        o.frequency.setValueAtTime(300 + i * 100, now + i * 0.08);
                        o.frequency.exponentialRampToValueAtTime(50, now + i * 0.08 + 0.15);
                        g.gain.setValueAtTime(0.08, now + i * 0.08);
                        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
                        o.start(now + i * 0.08);
                        o.stop(now + i * 0.08 + 0.15);
                    }
                    return;
                    
                case 'level_clear':
                    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
                    notes.forEach((freq, i) => {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.type = 'sine';
                        o.frequency.setValueAtTime(freq, now + i * 0.1);
                        g.gain.setValueAtTime(0.08, now + i * 0.1);
                        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
                        o.start(now + i * 0.1);
                        o.stop(now + i * 0.1 + 0.2);
                    });
                    return;
                    
                case 'menu_select':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.setValueAtTime(550, now + 0.03);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
                    
                case 'game_over':
                    const sadNotes = [392, 349, 330, 262]; // G4 F4 E4 C4
                    sadNotes.forEach((freq, i) => {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.type = 'triangle';
                        o.frequency.setValueAtTime(freq, now + i * 0.15);
                        g.gain.setValueAtTime(0.1, now + i * 0.15);
                        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
                        o.start(now + i * 0.15);
                        o.stop(now + i * 0.15 + 0.3);
                    });
                    return;
            }
        }

        // ── Input ──────────────────────────────────────────────────
        const keys = {};
        document.addEventListener('keydown', e => {
            const k = e.key === ' ' ? ' ' : e.key.toLowerCase();
            // Handle ESC for pause
            if (e.key === 'Escape') {
                e.preventDefault();
                if (gameRunning && gameState === 'playing' && !gamePaused) {
                    pauseGame();
                } else if (gamePaused) {
                    resumeGame();
                }
                return;
            }
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
        const analogStick   = document.getElementById('analog-stick');
        const analogKnob    = document.getElementById('analog-knob');

        // Analog stick state
        let analogActive = false;
        let analogTouchId = null;
        let analogCenterX = 0;
        let analogCenterY = 0;
        let analogMaxRadius = 0;
        
        // Joystick tuning constants
        const DEAD_ZONE = 0.12;
        const DIRECTION_THRESHOLD = 0.38;
        
        function handleAnalogTouch(touch, isStart) {
            if (!analogStick) return;
            
            // Cache rect on start for performance
            if (isStart) {
                const rect = analogStick.getBoundingClientRect();
                analogCenterX = rect.left + rect.width / 2;
                analogCenterY = rect.top + rect.height / 2;
                analogMaxRadius = rect.width / 2 - 8;
            }
            
            let dx = touch.clientX - analogCenterX;
            let dy = touch.clientY - analogCenterY;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            const normalizedDist = Math.min(distance / analogMaxRadius, 1);
            
            let clampedDx = dx;
            let clampedDy = dy;
            if (distance > analogMaxRadius) {
                clampedDx = (dx / distance) * analogMaxRadius;
                clampedDy = (dy / distance) * analogMaxRadius;
            }
            
            if (analogKnob) {
                analogKnob.style.left = `calc(50% + ${clampedDx}px)`;
                analogKnob.style.top = `calc(50% + ${clampedDy}px)`;
            }
            
            keys['arrowup'] = false;
            keys['arrowdown'] = false;
            keys['arrowleft'] = false;
            keys['arrowright'] = false;
            
            if (normalizedDist > DEAD_ZONE && distance > 0) {
                const normX = dx / distance;
                const normY = dy / distance;
                
                if (normX < -DIRECTION_THRESHOLD) keys['arrowleft'] = true;
                if (normX > DIRECTION_THRESHOLD) keys['arrowright'] = true;
                if (normY < -DIRECTION_THRESHOLD) keys['arrowup'] = true;
                if (normY > DIRECTION_THRESHOLD) keys['arrowdown'] = true;
            }
        }
        
        function resetAnalog() {
            analogActive = false;
            analogTouchId = null;
            if (analogKnob) {
                analogKnob.style.left = '50%';
                analogKnob.style.top = '50%';
                analogKnob.classList.remove('active');
            }
            keys['arrowup'] = false;
            keys['arrowdown'] = false;
            keys['arrowleft'] = false;
            keys['arrowright'] = false;
        }
        
        if (analogStick) {
            analogStick.addEventListener('touchstart', e => {
                e.preventDefault();
                e.stopPropagation();
                if (!analogActive) {
                    analogActive = true;
                    analogTouchId = e.touches[0].identifier;
                    if (analogKnob) analogKnob.classList.add('active');
                    handleAnalogTouch(e.touches[0], true);
                }
            }, { passive: false });
            
            analogStick.addEventListener('touchmove', e => {
                e.preventDefault();
                e.stopPropagation();
                for (let i = 0; i < e.touches.length; i++) {
                    if (e.touches[i].identifier === analogTouchId) {
                        handleAnalogTouch(e.touches[i], false);
                        break;
                    }
                }
            }, { passive: false });
            
            analogStick.addEventListener('touchend', e => {
                e.preventDefault();
                let found = false;
                for (let i = 0; i < e.touches.length; i++) {
                    if (e.touches[i].identifier === analogTouchId) {
                        found = true;
                        break;
                    }
                }
                if (!found) resetAnalog();
            }, { passive: false });
            
            analogStick.addEventListener('touchcancel', resetAnalog);
        }

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

        // ── Cuphead-style Background System ────────────────────────
        // Parallax layers for each stage theme
        const STAGE_BACKGROUNDS = {
            0: { // THE DINER
                sky: '#1a1520',
                layers: [
                    { y: 0.4, color: '#2a2030', shapes: 'cityscape' },
                    { y: 0.7, color: '#3a2a3a', shapes: 'buildings' },
                    { y: 1.0, color: '#4a3545', shapes: 'storefronts' }
                ],
                floor: '#3d2d38',
                floorLine: '#5d4858',
                accent: '#7a5a6a'
            },
            1: { // THE WORKSHOP
                sky: '#151a20',
                layers: [
                    { y: 0.3, color: '#252a30', shapes: 'gears' },
                    { y: 0.6, color: '#353a40', shapes: 'pipes' },
                    { y: 0.9, color: '#454a50', shapes: 'machinery' }
                ],
                floor: '#2d3238',
                floorLine: '#4d5258',
                accent: '#6a7580'
            },
            2: { // THE ARCADE
                sky: '#0a0a15',
                layers: [
                    { y: 0.3, color: '#1a1a2a', shapes: 'neon' },
                    { y: 0.6, color: '#2a2a3a', shapes: 'cabinets' },
                    { y: 0.9, color: '#3a3a4a', shapes: 'screens' }
                ],
                floor: '#1d1d2d',
                floorLine: '#3d3d5d',
                accent: '#5a5a8a'
            }
        };

        function drawBackground() {
            const bg = STAGE_BACKGROUNDS[Math.min(level, 2)];
            const time = frameCount * 0.5;
            
            // Sky gradient
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, bg.sky);
            grad.addColorStop(1, bg.layers[2].color);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw parallax layers
            bg.layers.forEach((layer, idx) => {
                const scrollX = time * (0.3 + idx * 0.2);
                ctx.fillStyle = layer.color;
                
                if (layer.shapes === 'cityscape' || layer.shapes === 'buildings' || layer.shapes === 'storefronts') {
                    drawCityLayer(layer, scrollX, idx);
                } else if (layer.shapes === 'gears' || layer.shapes === 'pipes' || layer.shapes === 'machinery') {
                    drawWorkshopLayer(layer, scrollX, idx);
                } else if (layer.shapes === 'neon' || layer.shapes === 'cabinets' || layer.shapes === 'screens') {
                    drawArcadeLayer(layer, scrollX, idx, bg.accent);
                }
            });
            
            // Floor
            const floorH = 24;
            ctx.fillStyle = bg.floor;
            ctx.fillRect(0, canvas.height - floorH, canvas.width, floorH);
            
            // Floor tiles
            ctx.strokeStyle = bg.floorLine;
            ctx.lineWidth = 1;
            for (let x = (time * 0.8) % 40 - 40; x < canvas.width + 40; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, canvas.height - floorH);
                ctx.lineTo(x + 20, canvas.height);
                ctx.stroke();
            }
            
            // Floor edge line
            ctx.strokeStyle = bg.floorLine;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - floorH);
            ctx.lineTo(canvas.width, canvas.height - floorH);
            ctx.stroke();
            
            // Subtle particles/dust
            ctx.fillStyle = `rgba(255,255,255,0.03)`;
            for (let i = 0; i < 35; i++) {
                const sx = (i * 157 + time * 0.12) % canvas.width;
                const sy = (i * 89 + time * 0.08) % (canvas.height - 30);
                ctx.fillRect(sx, sy, 1, 1);
            }
        }
        
        function drawCityLayer(layer, scrollX, depth) {
            const baseY = 80 + depth * 60;
            const buildingWidth = 45 + depth * 15;
            
            for (let x = -scrollX % (buildingWidth + 20) - buildingWidth; x < canvas.width + buildingWidth; x += buildingWidth + 20) {
                const h = 60 + Math.sin(x * 0.1) * 30 + depth * 25;
                const y = canvas.height - 24 - h;
                
                // Building body
                ctx.fillStyle = layer.color;
                ctx.fillRect(x, y, buildingWidth - 5, h);
                
                // Building top detail (varied shapes)
                ctx.fillRect(x + 5, y - 8, buildingWidth - 15, 8);
                
                // Windows (darker rectangles)
                ctx.fillStyle = depth < 2 ? 'rgba(0,0,0,0.3)' : 'rgba(255,220,150,0.15)';
                const winSize = 4 + depth;
                for (let wy = y + 10; wy < y + h - 15; wy += winSize + 6) {
                    for (let wx = x + 5; wx < x + buildingWidth - 10; wx += winSize + 5) {
                        ctx.fillRect(wx, wy, winSize, winSize);
                    }
                }
            }
        }
        
        function drawWorkshopLayer(layer, scrollX, depth) {
            ctx.save();
            
            if (layer.shapes === 'gears') {
                // Large background gears
                for (let i = 0; i < 5; i++) {
                    const gx = ((i * 150 - scrollX * 0.3) % (canvas.width + 200)) - 50;
                    const gy = 80 + Math.sin(i * 2) * 40;
                    const gr = 35 + i * 10;
                    drawGearShape(gx, gy, gr, frameCount * (i % 2 === 0 ? 0.3 : -0.3), layer.color);
                }
            } else if (layer.shapes === 'pipes') {
                // Industrial pipes
                ctx.strokeStyle = layer.color;
                ctx.lineWidth = 8;
                for (let i = 0; i < 4; i++) {
                    const px = ((i * 180 - scrollX * 0.5) % (canvas.width + 200)) - 50;
                    ctx.beginPath();
                    ctx.moveTo(px, 0);
                    ctx.lineTo(px, 120 + Math.sin(i * 3) * 40);
                    ctx.quadraticCurveTo(px + 40, 160, px + 80, 160 + Math.cos(i * 2) * 30);
                    ctx.stroke();
                    // Pipe joints
                    ctx.fillStyle = layer.color;
                    ctx.beginPath();
                    ctx.arc(px, 60, 12, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Machinery silhouettes
                for (let x = -scrollX % 120 - 60; x < canvas.width + 60; x += 120) {
                    ctx.fillStyle = layer.color;
                    ctx.fillRect(x, canvas.height - 100, 50, 76);
                    ctx.fillRect(x + 10, canvas.height - 130, 30, 30);
                    ctx.fillRect(x - 15, canvas.height - 80, 15, 56);
                }
            }
            ctx.restore();
        }
        
        function drawGearShape(cx, cy, r, rotation, color) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
            ctx.fill();
            // Teeth
            const teeth = 8;
            for (let i = 0; i < teeth; i++) {
                const angle = (i / teeth) * Math.PI * 2;
                ctx.save();
                ctx.rotate(angle);
                ctx.fillRect(-5, -r, 10, r * 0.35);
                ctx.restore();
            }
            // Center hole
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        function drawArcadeLayer(layer, scrollX, depth, accent) {
            if (layer.shapes === 'neon') {
                // Neon signs in background
                const neonColors = ['#ff6688', '#66aaff', '#88ff66', '#ffaa44'];
                for (let i = 0; i < 6; i++) {
                    const nx = ((i * 130 - scrollX * 0.2) % (canvas.width + 200)) - 50;
                    const ny = 30 + Math.sin(i * 1.5) * 20;
                    ctx.save();
                    ctx.globalAlpha = 0.15 + Math.sin(frameCount * 0.1 + i) * 0.05;
                    ctx.fillStyle = neonColors[i % neonColors.length];
                    ctx.fillRect(nx, ny, 40 + i * 5, 8);
                    ctx.fillRect(nx + 10, ny + 12, 25, 5);
                    ctx.restore();
                }
            } else if (layer.shapes === 'cabinets') {
                // Arcade cabinet silhouettes
                for (let x = -scrollX % 100 - 50; x < canvas.width + 50; x += 100) {
                    ctx.fillStyle = layer.color;
                    // Cabinet body
                    ctx.fillRect(x, canvas.height - 180, 35, 156);
                    // Screen area
                    ctx.fillStyle = 'rgba(100,150,200,0.08)';
                    ctx.fillRect(x + 4, canvas.height - 170, 27, 45);
                    // Control panel
                    ctx.fillStyle = layer.color;
                    ctx.fillRect(x - 3, canvas.height - 120, 41, 25);
                }
            } else {
                // Screen glows
                ctx.save();
                for (let i = 0; i < 8; i++) {
                    const sx = ((i * 85 - scrollX * 0.4) % (canvas.width + 150)) - 40;
                    const sy = canvas.height - 140 + Math.sin(i * 2) * 30;
                    const flicker = 0.03 + Math.sin(frameCount * 0.2 + i * 3) * 0.02;
                    ctx.fillStyle = `rgba(120,180,255,${flicker})`;
                    ctx.fillRect(sx, sy, 25, 35);
                }
                ctx.restore();
            }
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
            playSound('powerup');
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
                case 'missile':      drawMissile(ctx, e.dir > 0); break;
                case 'bouncer':      drawBouncer(ctx); break;
                case 'homing':       drawEye(ctx); break;
                case 'bossshot':     drawBossShot(ctx); break;
                case 'tracking_eye': drawTrackingEye(ctx, e); break;
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
        
        function drawTrackingEye(ctx, e) {
            // Larger, more menacing eye that tracks player
            const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 1;
            const fadeAlpha = Math.min(1, e.lifetime / 60);  // Fade out in last second
            
            ctx.globalAlpha = fadeAlpha;
            
            // Outer glow/aura
            ctx.fillStyle = 'rgba(160, 100, 200, 0.3)';
            ctx.beginPath(); ctx.arc(0, 0, 14 * pulse, 0, Math.PI*2); ctx.fill();
            
            // Eyeball white
            ctx.fillStyle = '#e8e0d8';
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            
            // Bloodshot veins
            ctx.strokeStyle = 'rgba(180, 80, 80, 0.5)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                const ang = i * Math.PI / 2 + Math.random() * 0.2;
                ctx.moveTo(Math.cos(ang) * 5, Math.sin(ang) * 5);
                ctx.lineTo(Math.cos(ang) * 9, Math.sin(ang) * 9);
                ctx.stroke();
            }
            
            // Iris
            ctx.fillStyle = '#8866aa';
            ctx.beginPath(); ctx.arc(2, 0, 6, 0, Math.PI*2); ctx.fill();
            
            // Pupil (pie-cut Cuphead style)
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath(); ctx.arc(3, 0, 4, 0, Math.PI*2); ctx.fill();
            
            // Highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(5, -2, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(1, 2, 1, 0, Math.PI*2); ctx.fill();
            
            ctx.globalAlpha = 1;
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
            const effectiveLevel = gameMode === 'arcade' ? level % 3 : level;
            const wave = Math.floor(level / 3) + 1;
            const cfg = LEVELS[effectiveLevel];
            const spd = 1.4 + effectiveLevel * 0.5 + Math.min(killCount * 0.025, 1.2) + (gameMode === 'arcade' ? (wave - 1) * 0.3 : 0);
            const r   = Math.random();
            let type;

            if (effectiveLevel === 0) {
                type = r < 0.50 ? 'cup' : r < 0.75 ? 'sine' : r < 0.90 ? 'zigzag' : 'missile';
            } else if (effectiveLevel === 1) {
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
                e.vx = 0; e.vy = 4.5 + Math.random() * 1.5 + effectiveLevel;
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
            const effectiveLevel = gameMode === 'arcade' ? level % 3 : level;
            const cfg = LEVELS[effectiveLevel];
            const wave = Math.floor(level / 3) + 1;
            // Scale HP for arcade mode
            const hpMultiplier = gameMode === 'arcade' ? 1 + (wave - 1) * 0.4 : 1;
            bossMaxHP = Math.floor(cfg.bossHP * hpMultiplier); 
            bossHP = bossMaxHP; 
            bossPhase = 0;
            // Adjust boss speed for arcade waves
            const speedMult = gameMode === 'arcade' ? 1 + (wave - 1) * 0.15 : 1;
            
            if (effectiveLevel === 0) {
                boss = { type:'boss1', x:220, y:12, w:80, h:80, vx:1.6 * speedMult, flash:0, atk:120 };
            } else if (effectiveLevel === 1) {
                boss = { type:'boss2', x:218, y:8, w:84, h:84, rot:0, sineT:0, flash:0, atk:105, charging:false, chargeV:0, chargeY:10 };
            } else {
                boss = { type:'boss3', x:220, y:12, w:80, h:80, vx:2.2 * speedMult, vy:1.2 * speedMult, flash:0, atk:80 };
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
                    boss.atk = bossPhase === 1 ? 55 : 80;
                    const cx = boss.x + boss.w/2, cy = boss.y + boss.h/2;
                    const px = player.x + player.w/2, py = player.y + player.h/2;
                    const ang = Math.atan2(py - cy, px - cx);
                    
                    // Spawn tracking eyeballs that follow the player
                    const eyeCount = bossPhase === 1 ? 2 : 1;
                    for (let e = 0; e < eyeCount; e++) {
                        const offset = (e - (eyeCount-1)/2) * 25;
                        enemies.push({ 
                            type: 'tracking_eye', 
                            hp: 2,  // Takes 2 hits to destroy
                            w: 20, 
                            h: 20,
                            x: cx - 10 + offset, 
                            y: cy - 10,
                            vx: Math.cos(ang) * 1.5,
                            vy: Math.sin(ang) * 1.5,
                            homespd: 2.8 + bossPhase * 0.5,  // Tracking speed
                            rot: 0, 
                            rotSpd: 0.08,
                            free: true,
                            lifetime: 360  // 6 seconds at 60fps
                        });
                    }
                    
                    // Also fire regular shots in enraged phase
                    if (bossPhase === 1) {
                        const spd = 4.0;
                        for (let s = 0; s < 2; s++) {
                            const spread = (s - 0.5) * 0.4;
                            enemies.push({ type:'bossshot', hp:1, w:14, h:14,
                                x: cx-7, y: cy-7,
                                vx: Math.cos(ang + spread) * spd,
                                vy: Math.sin(ang + spread) * spd,
                                rot:0, rotSpd:0.12, free:true });
                        }
                    }
                    
                    if (bossPhase === 1 && Math.random() < 0.3) {
                        spawnEnemy();
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
                    // Tracking eyeball behavior - homes in on player
                    if (e.type === 'tracking_eye') {
                        e.lifetime--;
                        if (e.lifetime <= 0) {
                            spawnParticles(e.x + e.w/2, e.y + e.h/2, 6, '#aa88ff');
                            enemies.splice(i, 1);
                            continue;
                        }
                        const px = player.x + player.w/2, py = player.y + player.h/2;
                        const ecx = e.x + e.w/2, ecy = e.y + e.h/2;
                        const ang = Math.atan2(py - ecy, px - ecx);
                        e.vx = e.vx * 0.92 + Math.cos(ang) * e.homespd * 0.08;
                        e.vy = e.vy * 0.92 + Math.sin(ang) * e.homespd * 0.08;
                        const spd = Math.hypot(e.vx, e.vy);
                        if (spd > e.homespd) { e.vx /= spd/e.homespd; e.vy /= spd/e.homespd; }
                        e.rot = Math.atan2(e.vy, e.vx);  // Point toward movement
                    }
                    e.x += e.vx; e.y += e.vy; e.rot += (e.type === 'tracking_eye' ? 0 : (e.rotSpd || 0));
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
                    if (!e) continue; // guard: enemies[] may be modified mid-loop
                    if (dist2(b.x, b.y, e.x + e.w/2, e.y + e.h/2) < e.w/2 + 5) {
                        spawnParticles(e.x + e.w/2, e.y + e.h/2, 8, b.color || '#aaaaaa');
                        e.hp--;
                        if (e.hp <= 0) {
                            playSound('hit');
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
            
            // Different sounds for different bullet types
            if (activePowerup?.type === 'spread') {
                playSound('shoot_spread');
            } else if (activePowerup?.type === 'rapid') {
                playSound('shoot_rapid');
            } else if (activePowerup?.type === 'pierce') {
                playSound('shoot_pierce');
            } else {
                playSound('shoot');
            }
            
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
            // Arcade mode: different kill requirements based on wave
            const effectiveLevel = gameMode === 'arcade' ? level % 3 : level;
            const killsNeeded = gameMode === 'arcade' 
                ? LEVELS[effectiveLevel].kills + Math.floor(level / 3) * 6  // Scales with waves
                : LEVELS[effectiveLevel].kills;
            
            if (killCount >= killsNeeded) {
                playSound('boss_intro');
                gameState = 'boss_intro';
                stateTimer = 100;
                enemies = []; bullets = []; powerups = [];
                spawnParticles(canvas.width/2, canvas.height/2, 25, '#ffffff');
            }
        }

        function bossDefeated() {
            playSound('boss_defeat');
            const bossBonus = gameMode === 'arcade' ? 15 + level * 5 : 15;
            score += bossBonus; scoreEl.textContent = score;
            spawnParticles(boss.x + boss.w/2, boss.y + boss.h/2, 45, '#ffffff');
            boss = null; enemies = []; bullets = []; powerups = [];
            
            if (gameMode === 'arcade') {
                // Arcade: continue forever with increasing difficulty
                level++;
                playSound('level_clear');
                gameState = 'level_clear';
                stateTimer = 130;
                killCount = 0;
                // Make spawning faster each wave
                const wave = Math.floor(level / 3);
                spawnInterval = Math.max(15, LEVELS[level % 3].spawnStart - wave * 5);
            } else {
                // Story mode: end after 3 bosses
                if (level >= 2) {
                    endGame(true);
                } else {
                    level++;
                    playSound('level_clear');
                    gameState = 'level_clear';
                    stateTimer = 130;
                }
            }
        }

        // ── Damage ─────────────────────────────────────────────────
        function takeDamage() {
            if (invincible) return;
            playSound('damage');
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
                playSound('level_clear');
                if (winScoreEl)  winScoreEl.textContent = score;
                if (gameWinOverlay) gameWinOverlay.style.display = 'flex';
            } else {
                gameState = 'game_over';
                playSound('game_over');
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
                    const effectiveLevel = gameMode === 'arcade' ? level % 3 : level;
                    if (spawnInterval > LEVELS[effectiveLevel].spawnMin) spawnInterval -= 0.2;
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
                    const effectiveLevel = gameMode === 'arcade' ? level % 3 : level;
                    spawnInterval = LEVELS[effectiveLevel].spawnStart; spawnTimer = 0;
                    if (levelEl) levelEl.textContent = gameMode === 'arcade' ? `W${Math.floor(level/3)+1}` : level + 1;
                }
            }
        }

        // ── Draw ───────────────────────────────────────────────────
        function draw() {
            // Cuphead-style parallax background
            drawBackground();

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
            const effectiveLevel = gameMode === 'arcade' ? level % 3 : Math.min(level, LEVELS.length-1);
            const cfg = LEVELS[effectiveLevel];
            const wave = Math.floor(level / 3) + 1;
            ctx.save();
            ctx.textAlign = 'center';

            if (gameState === 'playing') {
                ctx.font = '10px "Special Elite", monospace';
                ctx.fillStyle = 'rgba(255,255,255,0.55)';
                const stageText = gameMode === 'arcade' 
                    ? `WAVE ${wave} · ${cfg.sub}` 
                    : `${cfg.name}: ${cfg.sub}`;
                ctx.fillText(stageText, canvas.width/2, 13);
                
                const killsNeeded = gameMode === 'arcade' 
                    ? cfg.kills + (wave - 1) * 6 
                    : cfg.kills;
                const prog = Math.min(killCount / killsNeeded, 1);
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
                const bossName = gameMode === 'arcade' && wave > 1 
                    ? `${BOSS_NAMES[effectiveLevel]} MK.${wave}` 
                    : BOSS_NAMES[effectiveLevel];
                ctx.fillText(bossName, canvas.width/2, canvas.height/2 + 10);

            } else if (gameState === 'boss') {
                ctx.font = '10px "Special Elite", monospace';
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                const bossName = gameMode === 'arcade' && wave > 1 
                    ? `${BOSS_NAMES[effectiveLevel]} MK.${wave}` 
                    : BOSS_NAMES[effectiveLevel];
                ctx.fillText(bossName, canvas.width/2, 13);
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
                const nextLevel = level % 3;
                const nextWave = Math.floor(level / 3) + 1;
                ctx.font = 'bold 20px "Playfair Display", serif';
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fillText(gameMode === 'arcade' ? 'WAVE CLEAR!' : 'STAGE CLEAR!', canvas.width/2, canvas.height/2 - 10);
                ctx.font = '12px "Special Elite", monospace';
                ctx.fillStyle = `rgba(180,180,180,${alpha})`;
                const nextText = gameMode === 'arcade' 
                    ? `Wave ${nextWave} · ${LEVELS[nextLevel].sub}` 
                    : `Entering ${LEVELS[nextLevel].name}: ${LEVELS[nextLevel].sub}`;
                ctx.fillText(nextText, canvas.width/2, canvas.height/2 + 14);
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
            if (!gameRunning || gamePaused) return;
            update(); draw();
            requestAnimationFrame(gameLoop);
        }

        function startGame(mode = 'story') {
            initAudio();
            playSound('menu_select');
            gameMode = mode;
            gameRunning = true;
            gamePaused = false;
            gameState = 'playing';
            score = 0; level = 0; lives = gameMode === 'arcade' ? 5 : 3; killCount = 0;
            invincible = false; invTimer = 0; flashTimer = 0;
            shootCooldown = 0; frameCount = 0; stateTimer = 0;
            enemies = []; bullets = []; particles = []; powerups = [];
            activePowerup = null;
            boss = null; bossHP = 0;
            spawnTimer = 0; spawnInterval = LEVELS[0].spawnStart;
            player.x = canvas.width/2 - player.w/2;
            player.y = canvas.height - 60;
            scoreEl.textContent = 0;
            // Update display
            if (modeDisplayEl) modeDisplayEl.textContent = gameMode === 'arcade' ? 'ARCADE' : 'STORY';
            if (stageContainer) stageContainer.style.display = gameMode === 'arcade' ? 'none' : 'flex';
            if (levelEl) levelEl.textContent = 1;
            updateLives();
            gameOverlay.style.display = 'none';
            gameOverOverlay.style.display = 'none';
            if (gameWinOverlay) gameWinOverlay.style.display = 'none';
            if (gamePauseOverlay) gamePauseOverlay.style.display = 'none';
            startMusic();
            gameLoop();
        }

        function showMenu() {
            gameRunning = false;
            gamePaused = false;
            gameState = 'idle';
            stopMusic();
            gameOverlay.style.display = 'flex';
            gameOverOverlay.style.display = 'none';
            if (gameWinOverlay) gameWinOverlay.style.display = 'none';
            if (gamePauseOverlay) gamePauseOverlay.style.display = 'none';
            draw();
        }

        function pauseGame() {
            if (!gameRunning || gamePaused) return;
            gamePaused = true;
            playSound('menu_select');
            if (gamePauseOverlay) {
                gamePauseOverlay.style.display = 'flex';
                updatePauseLabels();
            }
        }
        
        function resumeGame() {
            if (!gamePaused) return;
            gamePaused = false;
            playSound('menu_select');
            if (gamePauseOverlay) gamePauseOverlay.style.display = 'none';
            gameLoop();
        }
        
        function updatePauseLabels() {
            const sfxLabel = document.querySelector('.pause-sfx-label');
            const musicLabel = document.querySelector('.pause-music-label');
            if (sfxLabel) sfxLabel.textContent = 'SOUND FX: ' + (sfxEnabled ? 'ON' : 'OFF');
            if (musicLabel) musicLabel.textContent = 'MUSIC: ' + (musicEnabled ? 'ON' : 'OFF');
        }

        function toggleSfx() {
            sfxEnabled = !sfxEnabled;
            if (sfxToggleBtn) {
                sfxToggleBtn.dataset.enabled = sfxEnabled;
            }
            updatePauseLabels();
            if (sfxEnabled) playSound('menu_select');
        }
        
        function toggleMusic() {
            musicEnabled = !musicEnabled;
            if (musicToggleBtn) {
                musicToggleBtn.dataset.enabled = musicEnabled;
            }
            updateMusicVolume();
            updatePauseLabels();
            playSound('menu_select');
        }

        // Event listeners
        if (startStoryBtn) startStoryBtn.addEventListener('click', () => startGame('story'));
        if (startArcadeBtn) startArcadeBtn.addEventListener('click', () => startGame('arcade'));
        if (restartBtn) restartBtn.addEventListener('click', () => startGame(gameMode));
        if (playAgainWinBtn) playAgainWinBtn.addEventListener('click', () => startGame(gameMode));
        if (backToMenuBtn) backToMenuBtn.addEventListener('click', showMenu);
        if (backToMenuWinBtn) backToMenuWinBtn.addEventListener('click', showMenu);
        if (sfxToggleBtn) sfxToggleBtn.addEventListener('click', toggleSfx);
        if (musicToggleBtn) musicToggleBtn.addEventListener('click', toggleMusic);
        
        // Pause menu listeners
        if (resumeBtn) resumeBtn.addEventListener('click', resumeGame);
        if (pauseSfxBtn) pauseSfxBtn.addEventListener('click', toggleSfx);
        if (pauseMusicBtn) pauseMusicBtn.addEventListener('click', toggleMusic);
        if (pauseQuitBtn) pauseQuitBtn.addEventListener('click', showMenu);

        // Initial idle frame
        draw();
    }
});
