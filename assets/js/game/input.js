/* ═══════════════════════════════════════════════════════════════
   GEAR DODGER 2 - Input System
   Keyboard and touch controls
   ═══════════════════════════════════════════════════════════════ */

var GD = window.GD;

// ── Input state ────────────────────────────────────────────────
GD.keys = {};

// ── Initialize input listeners ─────────────────────────────────
GD.initInput = function(canvas, pauseCallback, resumeCallback) {
    // Keyboard input
    document.addEventListener('keydown', e => {
        const k = e.key === ' ' ? ' ' : e.key.toLowerCase();
        
        // Handle ESC for pause
        if (e.key === 'Escape') {
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
