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
        
        // Handle ESC or P for pause (P works in fullscreen where ESC exits fullscreen)
        if (e.key === 'Escape' || k === 'p') {
            e.preventDefault();
            if (GD.gameRunning && GD.gameState === 'playing' && !GD.gamePaused) {
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
    const dpadBtns = document.querySelectorAll('.dpad-btn');
    
    // D-pad buttons
    dpadBtns.forEach(btn => {
        const key = btn.dataset.key;
        btn.addEventListener('touchstart', e => {
            e.preventDefault();
            GD.keys[key] = true;
            btn.classList.add('active');
        }, { passive: false });
        btn.addEventListener('touchend', e => {
            e.preventDefault();
            GD.keys[key] = false;
            btn.classList.remove('active');
        }, { passive: false });
        btn.addEventListener('touchcancel', e => {
            GD.keys[key] = false;
            btn.classList.remove('active');
        });
    });
    
    // Fire button
    if (touchFire) {
        touchFire.addEventListener('touchstart', e => {
            e.preventDefault();
            GD.keys[' '] = true;
            touchFire.classList.add('active');
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
    
    // Prevent canvas touch from scrolling
    canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
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
