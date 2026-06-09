/* ═══════════════════════════════════════════════════════════════
   GEAR DODGER 2 - Input System
   Keyboard and touch controls
   ═══════════════════════════════════════════════════════════════ */

var GD = window.GD;

// ── Input state ────────────────────────────────────────────────
GD.keys = {};

// ── Initialize input listeners ─────────────────────────────────
GD.initInput = function(canvas, pauseCallback, resumeCallback) {
    // Store callbacks for pause button
    GD.pauseCallback = pauseCallback;
    GD.resumeCallback = resumeCallback;
    
    // Keyboard input
    document.addEventListener('keydown', e => {
        const k = e.key === ' ' ? ' ' : e.key.toLowerCase();
        
        // Shop state input handling
        if (GD.gameState === 'shop') {
            e.preventDefault();
            
            // Block all input during shop opening delay
            if (GD.shopInputDelay > 0) {
                return;
            }
            
            // P to proceed to boss (not ESC - ESC exits fullscreen)
            if (k === 'p') {
                if (GD.proceedToBoss) GD.proceedToBoss();
                return;
            }
            
            // Navigation
            if (k === 'arrowup' || k === 'w') {
                GD.shopSelection = Math.max(0, GD.shopSelection - 2);
                GD.playSound('menu_select');
            } else if (k === 'arrowdown' || k === 's') {
                GD.shopSelection = Math.min(GD.SHOP.items.length - 1, GD.shopSelection + 2);
                GD.playSound('menu_select');
            } else if (k === 'arrowleft' || k === 'a') {
                if (GD.shopSelection % 2 === 1) {
                    GD.shopSelection--;
                    GD.playSound('menu_select');
                }
            } else if (k === 'arrowright' || k === 'd') {
                if (GD.shopSelection % 2 === 0 && GD.shopSelection < GD.SHOP.items.length - 1) {
                    GD.shopSelection++;
                    GD.playSound('menu_select');
                }
            }
            
            // Purchase
            if (k === ' ' || k === 'enter') {
                GD.purchaseShopItem(GD.shopSelection);
            }
            return;
        }
        
        // Handle P for pause (not ESC - ESC exits fullscreen)
        // Allow pausing during playing, boss, and boss_intro states
        if (k === 'p') {
            e.preventDefault();
            const pausableStates = ['playing', 'boss', 'boss_intro'];
            if (GD.gameRunning && pausableStates.includes(GD.gameState) && !GD.gamePaused) {
                pauseCallback();
            } else if (GD.gamePaused) {
                resumeCallback();
            }
            return;
        }
        
        if ([' ','arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)) {
            e.preventDefault();
        }
        GD.keys[k] = true;
    });
    
    document.addEventListener('keyup', e => {
        GD.keys[e.key === ' ' ? ' ' : e.key.toLowerCase()] = false;
    });
    
    // Touch controls
    const touchControls = document.getElementById('touch-controls');
    const touchFire = document.getElementById('touch-fire');
    const analogStick = document.getElementById('analog-stick');
    const analogKnob = document.getElementById('analog-knob');
    
    // Analog stick state
    let analogActive = false;
    let analogTouchId = null;
    let analogCenterX = 0;
    let analogCenterY = 0;
    let analogMaxRadius = 0;
    
    // Joystick tuning constants
    const DEAD_ZONE = 0.12; // 12% dead zone - small but prevents drift
    const DIRECTION_THRESHOLD = 0.38; // Threshold for registering direction
    
    // Analog stick handler
    function handleAnalogTouch(touch, isStart) {
        if (!analogStick) return;
        
        // Cache rect on start for performance
        if (isStart) {
            const rect = analogStick.getBoundingClientRect();
            analogCenterX = rect.left + rect.width / 2;
            analogCenterY = rect.top + rect.height / 2;
            analogMaxRadius = rect.width / 2 - 8;
        }
        
        // Calculate offset from center
        let dx = touch.clientX - analogCenterX;
        let dy = touch.clientY - analogCenterY;
        
        // Calculate distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDist = Math.min(distance / analogMaxRadius, 1);
        
        // Clamp to max radius for knob position
        let clampedDx = dx;
        let clampedDy = dy;
        if (distance > analogMaxRadius) {
            clampedDx = (dx / distance) * analogMaxRadius;
            clampedDy = (dy / distance) * analogMaxRadius;
        }
        
        // Move knob visually - use left/top for instant response (no transition)
        if (analogKnob) {
            analogKnob.style.left = `calc(50% + ${clampedDx}px)`;
            analogKnob.style.top = `calc(50% + ${clampedDy}px)`;
        }
        
        // Reset all direction keys
        GD.keys['arrowup'] = false;
        GD.keys['arrowdown'] = false;
        GD.keys['arrowleft'] = false;
        GD.keys['arrowright'] = false;
        
        // Only register input if outside dead zone
        if (normalizedDist > DEAD_ZONE && distance > 0) {
            // Normalize direction vector
            const normX = dx / distance;
            const normY = dy / distance;
            
            // Apply input based on direction with threshold
            // This allows smooth diagonal movement
            if (normX < -DIRECTION_THRESHOLD) {
                GD.keys['arrowleft'] = true;
            }
            if (normX > DIRECTION_THRESHOLD) {
                GD.keys['arrowright'] = true;
            }
            if (normY < -DIRECTION_THRESHOLD) {
                GD.keys['arrowup'] = true;
            }
            if (normY > DIRECTION_THRESHOLD) {
                GD.keys['arrowdown'] = true;
            }
            
            // Handle shop navigation on touch start
            if (isStart && GD.gameState === 'shop' && GD.shopInputDelay <= 0) {
                if (GD.keys['arrowup']) {
                    GD.shopSelection = Math.max(0, GD.shopSelection - 2);
                    GD.playSound('menu_select');
                } else if (GD.keys['arrowdown']) {
                    GD.shopSelection = Math.min(GD.SHOP.items.length - 1, GD.shopSelection + 2);
                    GD.playSound('menu_select');
                } else if (GD.keys['arrowleft']) {
                    if (GD.shopSelection % 2 === 1) {
                        GD.shopSelection--;
                        GD.playSound('menu_select');
                    }
                } else if (GD.keys['arrowright']) {
                    if (GD.shopSelection % 2 === 0 && GD.shopSelection < GD.SHOP.items.length - 1) {
                        GD.shopSelection++;
                        GD.playSound('menu_select');
                    }
                }
            }
        }
    }
    
    function resetAnalog() {
        analogActive = false;
        analogTouchId = null;
        
        // Reset knob position instantly
        if (analogKnob) {
            analogKnob.style.left = '50%';
            analogKnob.style.top = '50%';
            analogKnob.classList.remove('active');
        }
        
        // Reset all direction keys
        GD.keys['arrowup'] = false;
        GD.keys['arrowdown'] = false;
        GD.keys['arrowleft'] = false;
        GD.keys['arrowright'] = false;
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
                    // Apply partial movement immediately - rest handled by game loop
                    // 0.4 = 40% instant response, 60% from game loop (small smoothing)
                    if (GD.player && (GD.gameState === 'playing' || GD.gameState === 'boss')) {
                        const INSTANT_FACTOR = 0.4;
                        let dx = 0, dy = 0;
                        if (GD.keys['arrowleft']) dx = -GD.player.speed * INSTANT_FACTOR;
                        if (GD.keys['arrowright']) dx = GD.player.speed * INSTANT_FACTOR;
                        if (GD.keys['arrowup']) dy = -GD.player.speed * INSTANT_FACTOR;
                        if (GD.keys['arrowdown']) dy = GD.player.speed * INSTANT_FACTOR;
                        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
                        if (dx !== 0 || dy !== 0) {
                            GD.player.x = GD.clamp(GD.player.x + dx, 0, GD.canvas.width - GD.player.w);
                            GD.player.y = GD.clamp(GD.player.y + dy, 0, GD.canvas.height - GD.player.h);
                        }
                    }
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
            if (!found) {
                resetAnalog();
            }
        }, { passive: false });
        
        analogStick.addEventListener('touchcancel', e => {
            resetAnalog();
        });
    }
    
    // Fire button
    if (touchFire) {
        touchFire.addEventListener('touchstart', e => {
            e.preventDefault();
            GD.keys[' '] = true;
            touchFire.classList.add('active');
            
            // Handle shop purchase on touch
            if (GD.gameState === 'shop' && GD.shopInputDelay <= 0) {
                GD.purchaseShopItem(GD.shopSelection);
            }
        }, { passive: false });
        touchFire.addEventListener('touchend', e => {
            e.preventDefault();
            GD.keys[' '] = false;
            touchFire.classList.remove('active');
        }, { passive: false });
        touchFire.addEventListener('touchcancel', e => {
            GD.keys[' '] = false;
            touchFire.classList.remove('active');
        });
    }
    
    // Prevent canvas touch from scrolling and handle shop interaction
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        
        // In shop state, handle tap-to-select items and proceed
        if (GD.gameState === 'shop' && GD.shopInputDelay <= 0) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            
            // Convert touch coordinates to canvas coordinates
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const touchX = (touch.clientX - rect.left) * scaleX;
            const touchY = (touch.clientY - rect.top) * scaleY;
            
            // Check if tapping on a shop item
            const items = GD.SHOP.items;
            const startY = 85;
            const itemHeight = 56;
            const colWidth = 270;
            const gap = 12;
            const leftCol = canvas.width / 2 - colWidth - gap / 2;
            const rightCol = canvas.width / 2 + gap / 2;
            
            let tappedItem = -1;
            for (let idx = 0; idx < items.length; idx++) {
                const col = idx % 2;
                const row = Math.floor(idx / 2);
                const x = col === 0 ? leftCol : rightCol;
                const y = startY + row * itemHeight;
                const w = colWidth;
                const h = itemHeight - 4;
                
                if (touchX >= x && touchX <= x + w && touchY >= y && touchY <= y + h) {
                    tappedItem = idx;
                    break;
                }
            }
            
            if (tappedItem >= 0) {
                // If tapping already selected item, purchase it
                if (tappedItem === GD.shopSelection) {
                    GD.purchaseShopItem(GD.shopSelection);
                } else {
                    // Select the tapped item
                    GD.shopSelection = tappedItem;
                    GD.playSound('menu_select');
                }
                return;
            }
            
            // Tap on bottom 15% of canvas to fight boss
            if (touchY > canvas.height * 0.85) {
                if (GD.proceedToBoss) GD.proceedToBoss();
            }
        }
    }, { passive: false });
    canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
};

// ── Fullscreen functionality ───────────────────────────────────
GD.initFullscreen = function(gameWrapper) {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (!fullscreenBtn || !gameWrapper) return;
    
    GD.isFullscreen = false;
    
    function toggleFullscreen() {
        if (!GD.isFullscreen) {
            // Enter fullscreen
            if (gameWrapper.requestFullscreen) {
                gameWrapper.requestFullscreen();
            } else if (gameWrapper.webkitRequestFullscreen) {
                gameWrapper.webkitRequestFullscreen();
            } else if (gameWrapper.msRequestFullscreen) {
                gameWrapper.msRequestFullscreen();
            } else {
                // Fallback for browsers without fullscreen API
                gameWrapper.classList.add('fullscreen');
                GD.isFullscreen = true;
                document.body.style.overflow = 'hidden';
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else {
                // Fallback
                gameWrapper.classList.remove('fullscreen');
                GD.isFullscreen = false;
                document.body.style.overflow = '';
            }
        }
    }
    
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Handle fullscreen change events
    function onFullscreenChange() {
        const isNowFullscreen = !!(document.fullscreenElement || 
                                   document.webkitFullscreenElement || 
                                   document.msFullscreenElement);
        GD.isFullscreen = isNowFullscreen;
        
        if (isNowFullscreen) {
            gameWrapper.classList.add('fullscreen');
            document.body.style.overflow = 'hidden';
        } else {
            gameWrapper.classList.remove('fullscreen');
            document.body.style.overflow = '';
        }
    }
    
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
    
    // ESC key to exit fullscreen (when using fallback mode)
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && GD.isFullscreen && !document.fullscreenElement) {
            gameWrapper.classList.remove('fullscreen');
            GD.isFullscreen = false;
            document.body.style.overflow = '';
        }
    });
};
