/* ═══════════════════════════════════════════════════════════════
   GEAR DODGER 2 - Audio System
   Sound effects (Web Audio API) and Music (HTML5 Audio)
   ═══════════════════════════════════════════════════════════════ */

var GD = window.GD;

// ── Audio state ────────────────────────────────────────────────
GD.audioCtx = null;
GD.sfxEnabled = true;
GD.musicEnabled = true;
GD.currentMusic = null;
GD.musicVolume = 0.4;

// ── Initialize audio context ───────────────────────────────────
GD.initAudio = function() {
    if (!GD.audioCtx) {
        GD.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (GD.audioCtx.state === 'suspended') {
        GD.audioCtx.resume();
    }
};

// ── Music system (MP3 files) ───────────────────────────────────
GD.playMusic = function(track) {
    GD.stopMusic();
    
    const trackPath = GD.MUSIC_TRACKS[track];
    if (!trackPath) return;
    
    GD.currentMusic = new Audio(trackPath);
    GD.currentMusic.loop = true;
    GD.currentMusic.volume = GD.musicEnabled ? GD.musicVolume : 0;
    GD.currentMusic.play().catch(e => console.log('Music autoplay blocked:', e));
};

GD.stopMusic = function() {
    if (GD.currentMusic) {
        GD.currentMusic.pause();
        GD.currentMusic.currentTime = 0;
        GD.currentMusic = null;
    }
};

GD.updateMusicVolume = function() {
    if (GD.currentMusic) {
        GD.currentMusic.volume = GD.musicEnabled ? GD.musicVolume : 0;
    }
};

GD.getMusicTrackForLevel = function(level) {
    const effectiveLevel = level % 3;
    if (effectiveLevel === 0) return 'stage1';
    if (effectiveLevel === 1) return 'stage2';
    return 'stage3';
};

// ── Sound effects (synthesized) ────────────────────────────────
GD.playSound = function(type) {
    if (!GD.sfxEnabled || !GD.audioCtx) return;
    
    const now = GD.audioCtx.currentTime;
    const osc = GD.audioCtx.createOscillator();
    const gain = GD.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(GD.audioCtx.destination);
    
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
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
            gain.gain.setValueAtTime(0.07, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.06);
            // Second tone
            const osc2 = GD.audioCtx.createOscillator();
            const gain2 = GD.audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(GD.audioCtx.destination);
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(600, now);
            osc2.frequency.exponentialRampToValueAtTime(300, now + 0.07);
            gain2.gain.setValueAtTime(0.05, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
            osc2.start(now);
            osc2.stop(now + 0.07);
            break;
            
        case 'shoot_rapid':
            osc.type = 'square';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(500, now + 0.04);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
            break;
            
        case 'shoot_pierce':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
            
        case 'hit':
            osc.type = 'square';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
            
        case 'explosion':
            const noise = GD.audioCtx.createOscillator();
            const noiseGain = GD.audioCtx.createGain();
            noise.connect(noiseGain);
            noiseGain.connect(GD.audioCtx.destination);
            noise.type = 'sawtooth';
            noise.frequency.setValueAtTime(100, now);
            noise.frequency.exponentialRampToValueAtTime(30, now + 0.3);
            noiseGain.gain.setValueAtTime(0.2, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            noise.start(now);
            noise.stop(now + 0.3);
            return;
            
        case 'powerup':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            break;
            
        case 'damage':
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.setValueAtTime(100, now + 0.05);
            osc.frequency.setValueAtTime(80, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            break;
            
        case 'boss_intro':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            break;
            
        case 'boss_defeat':
            [200, 250, 300, 400].forEach((f, i) => {
                const o = GD.audioCtx.createOscillator();
                const g = GD.audioCtx.createGain();
                o.connect(g);
                g.connect(GD.audioCtx.destination);
                o.type = 'square';
                o.frequency.setValueAtTime(f, now + i * 0.12);
                g.gain.setValueAtTime(0.1, now + i * 0.12);
                g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.2);
                o.start(now + i * 0.12);
                o.stop(now + i * 0.12 + 0.2);
            });
            return;
            
        case 'level_clear':
            [300, 400, 500, 600].forEach((f, i) => {
                const o = GD.audioCtx.createOscillator();
                const g = GD.audioCtx.createGain();
                o.connect(g);
                g.connect(GD.audioCtx.destination);
                o.type = 'sine';
                o.frequency.setValueAtTime(f, now + i * 0.15);
                g.gain.setValueAtTime(0.12, now + i * 0.15);
                g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
                o.start(now + i * 0.15);
                o.stop(now + i * 0.15 + 0.3);
            });
            return;
            
        case 'menu_select':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
            break;
            
        case 'game_over':
            [200, 180, 150, 100].forEach((f, i) => {
                const o = GD.audioCtx.createOscillator();
                const g = GD.audioCtx.createGain();
                o.connect(g);
                g.connect(GD.audioCtx.destination);
                o.type = 'triangle';
                o.frequency.setValueAtTime(f, now + i * 0.15);
                g.gain.setValueAtTime(0.1, now + i * 0.15);
                g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
                o.start(now + i * 0.15);
                o.stop(now + i * 0.15 + 0.3);
            });
            return;
    }
};
