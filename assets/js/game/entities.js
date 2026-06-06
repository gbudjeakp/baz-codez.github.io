/* ═══════════════════════════════════════════════════════════════
   GEAR DODGER 2 - Entities
   Player, enemies, bullets, bosses, powerups, particles
   ═══════════════════════════════════════════════════════════════ */

var GD = window.GD;

// ── Entity containers ──────────────────────────────────────────
GD.player = { x: 250, y: 400, w: 40, h: 40, speed: 5 };
GD.enemies = [];
GD.bullets = [];
GD.particles = [];
GD.powerups = [];
GD.boss = null;
GD.bossHP = 0;
GD.bossMaxHP = 0;
GD.bossPhase = 0;
GD.activePowerup = null;
GD.baseCooldown = 14;

// ── Helper functions ───────────────────────────────────────────
GD.clamp = function(v, lo, hi) { 
    return Math.max(lo, Math.min(hi, v)); 
};

GD.dist2 = function(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
};

// ── Particle spawning ──────────────────────────────────────────
GD.spawnParticles = function(x, y, n, col) {
    for (let i = 0; i < n; i++) {
        const life = 25 + Math.random() * 20;
        GD.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6 - 1,
            life, maxLife: life,
            size: 2 + Math.random() * 4,
            col
        });
    }
};

// ── Powerup spawning ───────────────────────────────────────────
GD.spawnPowerup = function(x, y) {
    // Arcade mode: powerup chance decreases with wave
    let dropChance;
    if (GD.gameMode === 'arcade') {
        const wave = GD.arcadeWave || 0;
        dropChance = Math.max(
            GD.ARCADE.minPowerupChance,
            GD.ARCADE.basePowerupChance - wave * GD.ARCADE.powerupDecay
        );
    } else {
        dropChance = 0.18;
    }
    
    if (Math.random() > dropChance) return;
    
    // Arcade mode: hearts become rarer at higher waves
    let types;
    if (GD.gameMode === 'arcade' && GD.arcadeWave >= 2) {
        types = ['spread', 'spread', 'rapid', 'rapid', 'pierce', 'pierce', 'shield'];
        if (Math.random() < 0.15) types.push('heart'); // Small chance for heart
    } else {
        types = ['spread', 'spread', 'rapid', 'rapid', 'pierce', 'pierce', 'shield', 'heart'];
    }
    
    const type = types[Math.floor(Math.random() * types.length)];
    GD.powerups.push({ x: x - 10, y: y - 10, w: 20, h: 20, type, vy: 1.5, wobble: 0 });
};

GD.collectPowerup = function(p, updateLivesCallback) {
    GD.playSound('powerup');
    GD.spawnParticles(p.x + 10, p.y + 10, 10, GD.POWERUP_COLORS[p.type]);
    if (p.type === 'heart') {
        GD.lives = Math.min(GD.lives + 1, 5);
        if (updateLivesCallback) updateLivesCallback();
    } else if (p.type === 'shield') {
        GD.invincible = true;
        GD.invTimer = 300;
        GD.flashTimer = 0;
    } else {
        GD.activePowerup = { type: p.type, timer: GD.POWERUP_DURATION };
    }
};

// ── Enemy spawning ─────────────────────────────────────────────
GD.spawnEnemy = function() {
    const effectiveLevel = GD.gameMode === 'arcade' ? GD.level % 3 : GD.level;
    const wave = GD.arcadeWave || 0;
    const cfg = GD.LEVELS[effectiveLevel];
    
    // Calculate enemy speed with arcade scaling
    let spd;
    if (GD.gameMode === 'arcade') {
        const baseSpd = GD.ARCADE.baseEnemySpeed + effectiveLevel * 0.5;
        const waveBonus = wave * GD.ARCADE.speedIncrease;
        const killBonus = Math.min(GD.killCount * 0.02, 0.8);
        spd = baseSpd + waveBonus + killBonus;
    } else {
        spd = 1.4 + effectiveLevel * 0.5 + Math.min(GD.killCount * 0.025, 1.2);
    }
    
    const r = Math.random();
    let type;

    // Arcade mode introduces harder enemies sooner at higher waves
    if (GD.gameMode === 'arcade' && wave >= 2) {
        // More homing and bouncers at high waves
        type = r < 0.10 ? 'cup' : r < 0.22 ? 'sine' : r < 0.34 ? 'zigzag' :
               r < 0.48 ? 'dropper' : r < 0.60 ? 'missile' : r < 0.78 ? 'bouncer' : 'homing';
    } else if (effectiveLevel === 0) {
        type = r < 0.50 ? 'cup' : r < 0.75 ? 'sine' : r < 0.90 ? 'zigzag' : 'missile';
    } else if (effectiveLevel === 1) {
        type = r < 0.25 ? 'cup' : r < 0.45 ? 'sine' : r < 0.62 ? 'zigzag' :
               r < 0.76 ? 'missile' : r < 0.88 ? 'bouncer' : 'dropper';
    } else {
        type = r < 0.15 ? 'cup' : r < 0.30 ? 'sine' : r < 0.44 ? 'zigzag' :
               r < 0.56 ? 'dropper' : r < 0.68 ? 'missile' : r < 0.80 ? 'bouncer' : 'homing';
    }

    // Arcade: enemies get +1 HP at wave 3+
    const hp = (GD.gameMode === 'arcade' && wave >= 3) ? 2 : 1;
    const e = { type, w: 24, h: 24, rot: 0, rotSpd: (Math.random() - 0.5) * 0.14, hp };
    const canvas = GD.canvas;

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
        e.vx = 0; e.vy = 0; e.homespd = 1.2 + GD.level * 0.35;
    } else {
        e.x = Math.random() * (canvas.width - 24); e.y = -24;
        e.vx = 0; e.vy = spd + Math.random() * 1.5;
    }

    GD.enemies.push(e);
};

// ── Boss spawning ──────────────────────────────────────────────
GD.spawnBoss = function() {
    const effectiveLevel = GD.gameMode === 'arcade' ? GD.level % 3 : GD.level;
    const cfg = GD.LEVELS[effectiveLevel];
    const wave = GD.arcadeWave || 0;
    const hpMultiplier = GD.gameMode === 'arcade' ? 1 + wave * 0.4 : 1;
    const canvas = GD.canvas;
    
    GD.bossMaxHP = Math.floor(cfg.bossHP * hpMultiplier);
    GD.bossHP = GD.bossMaxHP;
    GD.bossPhase = 0;
    
    const speedMult = GD.gameMode === 'arcade' ? 1 + wave * 0.15 : 1;
    
    if (effectiveLevel === 0) {
        GD.boss = { type:'boss1', x:canvas.width/2-40, y:12, w:80, h:80, vx:1.6 * speedMult, flash:0, atk:120 };
    } else if (effectiveLevel === 1) {
        GD.boss = { type:'boss2', x:canvas.width/2-42, y:8, w:84, h:84, rot:0, sineT:0, flash:0, atk:105, charging:false, chargeV:0, chargeY:10 };
    } else {
        GD.boss = { type:'boss3', x:canvas.width/2-40, y:12, w:80, h:80, vx:2.2 * speedMult, vy:1.2 * speedMult, flash:0, atk:80 };
    }
};

// ── Shooting ───────────────────────────────────────────────────
GD.shoot = function() {
    const maxBullets = GD.activePowerup?.type === 'spread' ? 12 : 6;
    if (GD.shootCooldown > 0 || GD.bullets.length >= maxBullets) return;
    
    // Different sounds for different bullet types
    if (GD.activePowerup?.type === 'spread') {
        GD.playSound('shoot_spread');
    } else if (GD.activePowerup?.type === 'rapid') {
        GD.playSound('shoot_rapid');
    } else if (GD.activePowerup?.type === 'pierce') {
        GD.playSound('shoot_pierce');
    } else {
        GD.playSound('shoot');
    }
    
    const cx = GD.player.x + GD.player.w/2;
    const cy = GD.player.y;
    const pierce = GD.activePowerup?.type === 'pierce';
    const color = GD.activePowerup ? GD.POWERUP_COLORS[GD.activePowerup.type] : '#ffffff';
    
    if (GD.activePowerup?.type === 'spread') {
        GD.bullets.push({ x: cx, y: cy, vx: 0, vy: -8, pierce, color });
        GD.bullets.push({ x: cx, y: cy, vx: -2.5, vy: -7.5, pierce, color });
        GD.bullets.push({ x: cx, y: cy, vx: 2.5, vy: -7.5, pierce, color });
    } else {
        GD.bullets.push({ x: cx, y: cy, vx: 0, vy: -9, pierce, color });
    }
    
    GD.shootCooldown = GD.activePowerup?.type === 'rapid' ? 6 : GD.baseCooldown;
};

// ── Reset entities ─────────────────────────────────────────────
GD.resetEntities = function() {
    GD.enemies = [];
    GD.bullets = [];
    GD.particles = [];
    GD.powerups = [];
    GD.boss = null;
    GD.bossHP = 0;
    GD.activePowerup = null;
    GD.player.x = GD.canvas.width/2 - GD.player.w/2;
    GD.player.y = GD.canvas.height - 60;
};
