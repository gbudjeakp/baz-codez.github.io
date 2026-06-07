/* ═══════════════════════════════════════════════════════════════
   GEAR DODGER 2 - Configuration & Constants
   ═══════════════════════════════════════════════════════════════ */

window.GD = window.GD || {};
var GD = window.GD;

// ── Canvas dimensions ──────────────────────────────────────────
GD.CANVAS_WIDTH = 600;
GD.CANVAS_HEIGHT = 480;
GD.renderScale = 1; // Scale factor for fullscreen rendering

// ── Level definitions ──────────────────────────────────────────
// Boss HP increased to make shop upgrades more meaningful
GD.LEVELS = [
    { name: 'STAGE 1', sub: 'THE DINER',    kills: 12, spawnStart: 65, spawnMin: 30, bossHP: 22 },
    { name: 'STAGE 2', sub: 'THE WORKSHOP', kills: 18, spawnStart: 52, spawnMin: 24, bossHP: 35 },
    { name: 'STAGE 3', sub: 'THE ARCADE',   kills: 24, spawnStart: 42, spawnMin: 18, bossHP: 55 }
];

GD.BOSS_NAMES = ['BIG BREW', 'GEAR KING', 'THE MACHINE'];

// ── Powerup configuration ──────────────────────────────────────
GD.POWERUP_DURATION = 600; // ~10 seconds at 60fps
GD.POWERUP_COLORS = { 
    spread: '#66aaff', 
    rapid: '#ffaa33', 
    pierce: '#aa66ff', 
    shield: '#66ffaa', 
    heart: '#ff6688' 
};
GD.POWERUP_LABELS = { 
    spread: 'S', 
    rapid: 'R', 
    pierce: 'P', 
    shield: '\u2605', 
    heart: '\u2665' 
};

// ── Stage backgrounds ──────────────────────────────────────────
GD.STAGE_BACKGROUNDS = {
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

// ── Arcade mode difficulty scaling ─────────────────────────────
GD.ARCADE = {
    // Base values
    baseSpawnInterval: 65,
    basePowerupChance: 0.20,
    baseEnemySpeed: 1.4,
    
    // Scaling per wave (every 3 levels = 1 wave)
    spawnReduction: 4,      // Reduce spawn interval by this much per wave
    minSpawnInterval: 18,   // Minimum spawn interval
    speedIncrease: 0.25,    // Speed increase per wave
    powerupDecay: 0.015,    // Reduce powerup chance per wave
    minPowerupChance: 0.08, // Minimum powerup drop rate
    
    // Bonus scoring
    waveBonus: 50,          // Bonus points per wave survived
    killMultiplier: 1.1,    // Score multiplier increase per wave (compounding)
};

// ── Shop configuration ─────────────────────────────────────────
GD.SHOP = {
    // Coins earned per enemy kill (base amount)
    coinPerKill: 3,
    coinPerBoss: 25,
    
    // Shop items - temporary buffs last for boss fight only
    items: [
        { id: 'shield_boost', name: 'SHIELD', desc: '5s invincibility', cost: 12, type: 'temp', icon: '★' },
        { id: 'damage_up', name: 'POWER', desc: '2x boss damage', cost: 18, type: 'temp', icon: '⚡' },
        { id: 'rapid_fire', name: 'RAPID', desc: 'Fast shooting', cost: 15, type: 'temp', icon: 'R' },
        { id: 'extra_life', name: '+LIFE', desc: '+1 maximum life', cost: 28, type: 'perm', icon: '♥', max: 2 },
        { id: 'speed_up', name: 'SPEED', desc: 'Move faster', cost: 22, type: 'perm', icon: '»', max: 2 },
        { id: 'quick_shot', name: 'QUICK', desc: 'Shorter cooldown', cost: 22, type: 'perm', icon: '↑', max: 2 },
    ]
};

// ── Audio configuration ────────────────────────────────────────
GD.MUSIC_TRACKS = {
    menu: 'assets/audio/menu.mp3',
    stage1: 'assets/audio/stage1.mp3',
    stage2: 'assets/audio/stage2.mp3',
    stage3: 'assets/audio/stage3.mp3'
};
