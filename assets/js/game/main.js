/* ═══════════════════════════════════════════════════════════════
   GEAR DODGER 2 - Main Game Controller
   Entry point and game loop orchestration
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
    // ═══════════════════════════════════════════════════════════════
    // DARK MODE TOGGLE
    // ═══════════════════════════════════════════════════════════════
    const themeToggle = document.getElementById('theme-toggle');
    const toggleIcon = themeToggle?.querySelector('.toggle-icon');
    const toggleText = themeToggle?.querySelector('.toggle-text');
    
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (toggleIcon) toggleIcon.textContent = '\u263E';
        if (toggleText) toggleText.textContent = 'LIGHTS';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                toggleIcon.textContent = '\u2600';
                toggleText.textContent = 'LIGHTS';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                toggleIcon.textContent = '\u263E';
                toggleText.textContent = 'LIGHTS';
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // SMOOTH SCROLLING
    // ═══════════════════════════════════════════════════════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const cards = document.querySelectorAll('.project-card, .contact-btn, .nav-link');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.15s ease';
        });
    });

    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tagline.style.animation = 'none';
                    tagline.offsetHeight;
                    tagline.classList.add('visible');
                }
            });
        }, { threshold: 0.5 });
        observer.observe(tagline);
    }

    const character = document.querySelector('.main-character');
    if (character) {
        document.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            character.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    console.log('%c\u2605 SEBASTIAN GBUDJE \u2605', 'font-size: 20px; font-family: Georgia, serif; font-weight: bold;');
    console.log('%cAlways Building.', 'font-size: 14px; font-style: italic; color: #e8a435;');
    console.log('%c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', 'color: #1a1a1a;');
    console.log('Thanks for checking out my portfolio!');
    console.log('GitHub: https://github.com/gbudjeakp');
    console.log('Songram: https://songram.app');

    // ═══════════════════════════════════════════════════════════════
    // GEAR DODGER 2 - Game Initialization
    // ═══════════════════════════════════════════════════════════════

    const canvas = document.getElementById('cuphead-game');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    GD.canvas = canvas;
    GD.ctx = ctx;
    
    // Set canvas size
    canvas.width = GD.CANVAS_WIDTH;
    canvas.height = GD.CANVAS_HEIGHT;
    
    // ── DOM Elements ───────────────────────────────────────────────
    const startStoryBtn = document.getElementById('start-story');
    const startArcadeBtn = document.getElementById('start-arcade');
    const restartBtn = document.getElementById('restart-game');
    const playAgainWinBtn = document.getElementById('play-again-win');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const backToMenuWinBtn = document.getElementById('back-to-menu-win');
    const sfxToggleBtn = document.getElementById('sfx-toggle');
    const musicToggleBtn = document.getElementById('music-toggle');
    const gameOverlay = document.getElementById('game-overlay');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const gameWinOverlay = document.getElementById('game-win-overlay');
    const gamePauseOverlay = document.getElementById('game-pause-overlay');
    const resumeBtn = document.getElementById('resume-game');
    const pauseSfxBtn = document.getElementById('pause-sfx-toggle');
    const pauseMusicBtn = document.getElementById('pause-music-toggle');
    const pauseQuitBtn = document.getElementById('pause-quit');
    const pauseBtn = document.getElementById('pause-btn');
    const highScoreStoryEl = document.getElementById('high-score-story');
    const highScoreArcadeEl = document.getElementById('high-score-arcade');
    const finalScoreEl = document.getElementById('final-score');
    const winScoreEl = document.getElementById('win-score');
    const gameWrapper = document.querySelector('.game-wrapper');

    // ── Game state ─────────────────────────────────────────────────
    GD.gameMode = 'story';
    GD.gameRunning = false;
    GD.gamePaused = false;
    GD.gameState = 'idle';
    GD.score = 0;
    GD.highScoreStory = parseInt(localStorage.getItem('gearDodger2HighStory')) || 0;
    GD.highScoreArcade = parseInt(localStorage.getItem('gearDodger2HighArcade')) || 0;
    GD.level = 0;
    GD.arcadeWave = 0;      // Tracks difficulty wave in arcade
    GD.lives = 3;
    GD.killCount = 0;
    GD.frameCount = 0;
    GD.spawnTimer = 0;
    GD.spawnInterval = 65;
    GD.stateTimer = 0;
    GD.shootCooldown = 0;
    GD.invincible = false;
    GD.invTimer = 0;
    GD.flashTimer = 0;
    GD.scoreMultiplier = 1; // For arcade mode scoring

    function updateHighScoreDisplay() {
        if (highScoreStoryEl) highScoreStoryEl.textContent = GD.highScoreStory;
        if (highScoreArcadeEl) highScoreArcadeEl.textContent = GD.highScoreArcade;
    }
    updateHighScoreDisplay();

    // ── Helper functions ───────────────────────────────────────────
    function updateLives() {
        // Lives now displayed on canvas HUD only
    }

    function shake() {
        gameWrapper.classList.add('shake');
        setTimeout(() => gameWrapper.classList.remove('shake'), 200);
    }

    function takeDamage() {
        if (GD.invincible) return;
        GD.playSound('damage');
        GD.lives--;
        updateLives();
        GD.invincible = true;
        GD.invTimer = 90;
        GD.flashTimer = 0;
        shake();
        if (GD.lives <= 0) endGame(false);
    }

    function checkProgress() {
        const effectiveLevel = GD.gameMode === 'arcade' ? GD.level % 3 : GD.level;
        const wave = Math.floor(GD.level / 3) + 1;
        const killsNeeded = GD.gameMode === 'arcade' 
            ? GD.LEVELS[effectiveLevel].kills + (wave - 1) * 6
            : GD.LEVELS[effectiveLevel].kills;
        
        if (GD.killCount >= killsNeeded) {
            GD.playSound('boss_intro');
            GD.gameState = 'boss_intro';
            GD.stateTimer = 100;
            GD.enemies = []; GD.bullets = []; GD.powerups = [];
            GD.spawnParticles(canvas.width/2, canvas.height/2, 25, '#ffffff');
        }
    }

    function bossDefeated() {
        GD.playSound('boss_defeat');
        const bossBonus = GD.gameMode === 'arcade' 
            ? Math.floor((15 + GD.level * 5) * GD.scoreMultiplier) 
            : 15;
        GD.score += bossBonus;
        GD.spawnParticles(GD.boss.x + GD.boss.w/2, GD.boss.y + GD.boss.h/2, 45, '#ffffff');
        GD.boss = null; GD.enemies = []; GD.bullets = []; GD.powerups = [];
        
        if (GD.gameMode === 'arcade') {
            GD.level++;
            GD.playSound('level_clear');
            GD.gameState = 'level_clear';
            GD.stateTimer = 130;
            GD.killCount = 0;
            
            // Update wave and scaling
            const newWave = Math.floor(GD.level / 3);
            if (newWave > GD.arcadeWave) {
                GD.arcadeWave = newWave;
                GD.scoreMultiplier *= GD.ARCADE.killMultiplier;
                GD.score += GD.ARCADE.waveBonus * GD.arcadeWave;
            }
            
            // Scale spawn interval with wave
            const baseInterval = GD.ARCADE.baseSpawnInterval - GD.arcadeWave * GD.ARCADE.spawnReduction;
            GD.spawnInterval = Math.max(GD.ARCADE.minSpawnInterval, baseInterval);
            
            // Switch music for new stage
            const newTrack = GD.getMusicTrackForLevel(GD.level);
            GD.playMusic(newTrack);
        } else {
            if (GD.level >= 2) {
                endGame(true);
            } else {
                GD.level++;
                GD.playSound('level_clear');
                GD.gameState = 'level_clear';
                GD.stateTimer = 130;
                // Switch music for new stage
                const newTrack = GD.getMusicTrackForLevel(GD.level);
                GD.playMusic(newTrack);
            }
        }
    }

    function saveHighScore() {
        if (GD.gameMode === 'arcade') {
            if (GD.score > GD.highScoreArcade) {
                GD.highScoreArcade = GD.score;
                localStorage.setItem('gearDodger2HighArcade', GD.highScoreArcade);
            }
        } else {
            if (GD.score > GD.highScoreStory) {
                GD.highScoreStory = GD.score;
                localStorage.setItem('gearDodger2HighStory', GD.highScoreStory);
            }
        }
        updateHighScoreDisplay();
    }

    function endGame(win) {
        GD.gameRunning = false;
        GD.stopMusic();
        saveHighScore();
        if (pauseBtn) pauseBtn.classList.remove('visible');
        if (win) {
            GD.gameState = 'win';
            GD.playSound('level_clear');
            if (winScoreEl) winScoreEl.textContent = GD.score;
            if (gameWinOverlay) gameWinOverlay.style.display = 'flex';
        } else {
            GD.gameState = 'game_over';
            GD.playSound('game_over');
            if (finalScoreEl) finalScoreEl.textContent = GD.score;
            if (gameOverOverlay) gameOverOverlay.style.display = 'flex';
        }
    }

    // ── Update ─────────────────────────────────────────────────────
    function update() {
        GD.frameCount++;
        if (GD.shootCooldown > 0) GD.shootCooldown--;
        if (GD.invincible) {
            GD.invTimer--; GD.flashTimer++;
            if (GD.invTimer <= 0) { GD.invincible = false; GD.flashTimer = 0; }
        }

        // Player movement
        let dx = 0, dy = 0;
        if (GD.keys['arrowleft'] || GD.keys['a']) dx = -GD.player.speed;
        if (GD.keys['arrowright'] || GD.keys['d']) dx = GD.player.speed;
        if (GD.keys['arrowup'] || GD.keys['w']) dy = -GD.player.speed;
        if (GD.keys['arrowdown'] || GD.keys['s']) dy = GD.player.speed;
        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
        GD.player.x = GD.clamp(GD.player.x + dx, 0, canvas.width - GD.player.w);
        GD.player.y = GD.clamp(GD.player.y + dy, 0, canvas.height - GD.player.h);
        if (GD.keys[' ']) GD.shoot();

        if (GD.gameState === 'playing') {
            GD.spawnTimer++;
            if (GD.spawnTimer >= GD.spawnInterval) {
                GD.spawnEnemy(); GD.spawnTimer = 0;
                const effectiveLevel = GD.gameMode === 'arcade' ? GD.level % 3 : GD.level;
                if (GD.spawnInterval > GD.LEVELS[effectiveLevel].spawnMin) GD.spawnInterval -= 0.2;
            }
            GD.updateEnemies(takeDamage, null);
            GD.updateBullets(null, checkProgress, bossDefeated);
            GD.updatePowerups(updateLives);
            GD.updateParticles();

        } else if (GD.gameState === 'boss_intro') {
            GD.stateTimer--;
            GD.updateParticles();
            if (GD.stateTimer <= 0) { GD.gameState = 'boss'; GD.spawnBoss(); }

        } else if (GD.gameState === 'boss') {
            GD.updateBoss();
            GD.updateEnemies(takeDamage, null);
            GD.updateBullets(null, checkProgress, bossDefeated);
            GD.updatePowerups(updateLives);
            GD.updateParticles();
            if (GD.boss && !GD.invincible) {
                const pcx = GD.player.x + GD.player.w/2, pcy = GD.player.y + GD.player.h/2;
                const bcx = GD.boss.x + GD.boss.w/2, bcy = GD.boss.y + GD.boss.h/2;
                if (GD.dist2(pcx, pcy, bcx, bcy) < GD.boss.w/2 + 14) takeDamage();
            }

        } else if (GD.gameState === 'level_clear') {
            GD.stateTimer--;
            GD.updateParticles();
            if (GD.stateTimer <= 0) {
                GD.gameState = 'playing';
                GD.killCount = 0;
                GD.enemies = []; GD.bullets = []; GD.powerups = [];
                const effectiveLevel = GD.gameMode === 'arcade' ? GD.level % 3 : GD.level;
                GD.spawnInterval = GD.gameMode === 'arcade' 
                    ? Math.max(GD.ARCADE.minSpawnInterval, GD.ARCADE.baseSpawnInterval - GD.arcadeWave * GD.ARCADE.spawnReduction)
                    : GD.LEVELS[effectiveLevel].spawnStart;
                GD.spawnTimer = 0;
            }
        }
    }

    // ── Draw ───────────────────────────────────────────────────────
    function draw() {
        GD.drawBackground(ctx, canvas);
        GD.enemies.forEach(e => GD.drawEnemy(ctx, e));
        GD.powerups.forEach(p => GD.drawPowerup(ctx, p));

        if (GD.boss) {
            if (GD.boss.type === 'boss1') GD.drawBoss1(ctx, GD.boss);
            else if (GD.boss.type === 'boss2') GD.drawBoss2(ctx, GD.boss);
            else if (GD.boss.type === 'boss3') GD.drawBoss3(ctx, GD.boss);
        }

        GD.bullets.forEach(b => GD.drawBullet(ctx, b));
        GD.drawPlayer(ctx);
        GD.drawParticles(ctx);
        GD.drawHUD(ctx, canvas);
    }

    // ── Game loop ──────────────────────────────────────────────────
    function gameLoop() {
        if (!GD.gameRunning || GD.gamePaused) return;
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    function startGame(mode = 'story') {
        GD.initAudio();
        GD.playSound('menu_select');
        GD.gameMode = mode;
        GD.gameRunning = true;
        GD.gamePaused = false;
        GD.gameState = 'playing';
        GD.score = 0; GD.level = 0; GD.lives = mode === 'arcade' ? 5 : 3; GD.killCount = 0;
        GD.arcadeWave = 0; GD.scoreMultiplier = 1; // Reset arcade-specific state
        GD.invincible = false; GD.invTimer = 0; GD.flashTimer = 0;
        GD.shootCooldown = 0; GD.frameCount = 0; GD.stateTimer = 0;
        GD.resetEntities();
        GD.spawnTimer = 0; 
        GD.spawnInterval = mode === 'arcade' ? GD.ARCADE.baseSpawnInterval : GD.LEVELS[0].spawnStart;
        updateHighScoreDisplay();
        gameOverlay.style.display = 'none';
        gameOverOverlay.style.display = 'none';
        if (gameWinOverlay) gameWinOverlay.style.display = 'none';
        if (gamePauseOverlay) gamePauseOverlay.style.display = 'none';
        GD.playMusic('stage1');
        if (pauseBtn) pauseBtn.classList.add('visible');
        gameLoop();
    }

    function showMenu() {
        GD.gameRunning = false;
        GD.gamePaused = false;
        GD.gameState = 'idle';
        GD.stopMusic();
        GD.playMusic('menu');
        gameOverlay.style.display = 'flex';
        gameOverOverlay.style.display = 'none';
        if (gameWinOverlay) gameWinOverlay.style.display = 'none';
        if (gamePauseOverlay) gamePauseOverlay.style.display = 'none';
        if (pauseBtn) pauseBtn.classList.remove('visible');
        draw();
    }

    function pauseGame() {
        if (!GD.gameRunning || GD.gamePaused) return;
        GD.gamePaused = true;
        GD.playSound('menu_select');
        if (gamePauseOverlay) {
            gamePauseOverlay.style.display = 'flex';
            updatePauseAudioButtons();
        }
    }

    function resumeGame() {
        if (!GD.gamePaused) return;
        GD.gamePaused = false;
        GD.playSound('menu_select');
        if (gamePauseOverlay) gamePauseOverlay.style.display = 'none';
        gameLoop();
    }

    function updatePauseAudioButtons() {
        if (pauseSfxBtn) pauseSfxBtn.dataset.enabled = GD.sfxEnabled;
        if (pauseMusicBtn) pauseMusicBtn.dataset.enabled = GD.musicEnabled;
    }

    function toggleSfx() {
        GD.sfxEnabled = !GD.sfxEnabled;
        if (sfxToggleBtn) sfxToggleBtn.dataset.enabled = GD.sfxEnabled;
        updatePauseAudioButtons();
        if (GD.sfxEnabled) GD.playSound('menu_select');
    }

    function toggleMusic() {
        GD.musicEnabled = !GD.musicEnabled;
        if (musicToggleBtn) musicToggleBtn.dataset.enabled = GD.musicEnabled;
        GD.updateMusicVolume();
        updatePauseAudioButtons();
        GD.playSound('menu_select');
    }

    // ── Initialize input ───────────────────────────────────────────
    GD.initInput(canvas, pauseGame, resumeGame);
    
    // ── Initialize fullscreen ──────────────────────────────────────
    GD.initFullscreen(gameWrapper);

    // ── Event listeners ────────────────────────────────────────────
    if (startStoryBtn) startStoryBtn.addEventListener('click', () => startGame('story'));
    if (startArcadeBtn) startArcadeBtn.addEventListener('click', () => startGame('arcade'));
    if (restartBtn) restartBtn.addEventListener('click', () => startGame(GD.gameMode));
    if (playAgainWinBtn) playAgainWinBtn.addEventListener('click', () => startGame(GD.gameMode));
    if (backToMenuBtn) backToMenuBtn.addEventListener('click', showMenu);
    if (backToMenuWinBtn) backToMenuWinBtn.addEventListener('click', showMenu);
    if (sfxToggleBtn) sfxToggleBtn.addEventListener('click', toggleSfx);
    if (musicToggleBtn) musicToggleBtn.addEventListener('click', toggleMusic);
    if (resumeBtn) resumeBtn.addEventListener('click', resumeGame);
    if (pauseSfxBtn) pauseSfxBtn.addEventListener('click', toggleSfx);
    if (pauseMusicBtn) pauseMusicBtn.addEventListener('click', toggleMusic);
    if (pauseQuitBtn) pauseQuitBtn.addEventListener('click', showMenu);
    if (pauseBtn) pauseBtn.addEventListener('click', () => {
        if (GD.gameRunning && GD.gameState === 'playing' && !GD.gamePaused) {
            pauseGame();
        }
    });

    // Start menu music on first interaction with game area
    function startMenuMusicOnce() {
        GD.initAudio();
        if (GD.gameState === 'idle' && !GD.gameRunning) {
            GD.playMusic('menu');
        }
        gameWrapper.removeEventListener('click', startMenuMusicOnce);
    }
    gameWrapper.addEventListener('click', startMenuMusicOnce);

    // ── Initial state ──────────────────────────────────────────────
    // Music only starts when user interacts (starts game or returns to menu)
    draw();
});
