/* ═══════════════════════════════════════════════════════════════
   GEAR DODGER 2 - Drawing System
   All rendering functions
   ═══════════════════════════════════════════════════════════════ */

var GD = window.GD;

// ── Background drawing ─────────────────────────────────────────
GD.drawBackground = function(ctx, canvas) {
    const bg = GD.STAGE_BACKGROUNDS[Math.min(GD.level % 3, 2)];
    const time = GD.frameCount * 0.5;
    
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
            GD.drawCityLayer(ctx, canvas, layer, scrollX, idx);
        } else if (layer.shapes === 'gears' || layer.shapes === 'pipes' || layer.shapes === 'machinery') {
            GD.drawWorkshopLayer(ctx, canvas, layer, scrollX, idx);
        } else if (layer.shapes === 'neon' || layer.shapes === 'cabinets' || layer.shapes === 'screens') {
            GD.drawArcadeLayer(ctx, canvas, layer, scrollX, idx, bg.accent);
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
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 35; i++) {
        const sx = (i * 157 + time * 0.12) % canvas.width;
        const sy = (i * 89 + time * 0.08) % (canvas.height - 30);
        ctx.fillRect(sx, sy, 1, 1);
    }
};

GD.drawCityLayer = function(ctx, canvas, layer, scrollX, depth) {
    const baseY = 80 + depth * 60;
    const buildingWidth = 45 + depth * 15;
    
    for (let x = -scrollX % (buildingWidth + 20) - buildingWidth; x < canvas.width + buildingWidth; x += buildingWidth + 20) {
        const h = 60 + Math.sin(x * 0.1) * 30 + depth * 25;
        const y = canvas.height - 24 - h;
        
        ctx.fillStyle = layer.color;
        ctx.fillRect(x, y, buildingWidth - 5, h);
        ctx.fillRect(x + 5, y - 8, buildingWidth - 15, 8);
        
        ctx.fillStyle = depth < 2 ? 'rgba(0,0,0,0.3)' : 'rgba(255,220,150,0.15)';
        const winSize = 4 + depth;
        for (let wy = y + 10; wy < y + h - 15; wy += winSize + 6) {
            for (let wx = x + 5; wx < x + buildingWidth - 10; wx += winSize + 5) {
                ctx.fillRect(wx, wy, winSize, winSize);
            }
        }
    }
};

GD.drawWorkshopLayer = function(ctx, canvas, layer, scrollX, depth) {
    ctx.save();
    
    if (layer.shapes === 'gears') {
        for (let i = 0; i < 5; i++) {
            const gx = ((i * 150 - scrollX * 0.3) % (canvas.width + 200)) - 50;
            const gy = 80 + Math.sin(i * 2) * 40;
            const gr = 35 + i * 10;
            GD.drawGearShape(ctx, gx, gy, gr, GD.frameCount * (i % 2 === 0 ? 0.3 : -0.3), layer.color);
        }
    } else if (layer.shapes === 'pipes') {
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 8;
        for (let i = 0; i < 4; i++) {
            const px = ((i * 180 - scrollX * 0.5) % (canvas.width + 200)) - 50;
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, 120 + Math.sin(i * 3) * 40);
            ctx.quadraticCurveTo(px + 40, 160, px + 80, 160 + Math.cos(i * 2) * 30);
            ctx.stroke();
            ctx.fillStyle = layer.color;
            ctx.beginPath();
            ctx.arc(px, 60, 12, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        for (let x = -scrollX % 120 - 60; x < canvas.width + 60; x += 120) {
            ctx.fillStyle = layer.color;
            ctx.fillRect(x, canvas.height - 100, 50, 76);
            ctx.fillRect(x + 10, canvas.height - 130, 30, 30);
            ctx.fillRect(x - 15, canvas.height - 80, 15, 56);
        }
    }
    ctx.restore();
};

GD.drawGearShape = function(ctx, cx, cy, r, rotation, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        ctx.fillRect(-5, -r, 10, r * 0.35);
        ctx.restore();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

GD.drawArcadeLayer = function(ctx, canvas, layer, scrollX, depth, accent) {
    if (layer.shapes === 'neon') {
        const neonColors = ['#ff6688', '#66aaff', '#88ff66', '#ffaa44'];
        for (let i = 0; i < 6; i++) {
            const nx = ((i * 130 - scrollX * 0.2) % (canvas.width + 200)) - 50;
            const ny = 30 + Math.sin(i * 1.5) * 20;
            ctx.save();
            ctx.globalAlpha = 0.15 + Math.sin(GD.frameCount * 0.1 + i) * 0.05;
            ctx.fillStyle = neonColors[i % neonColors.length];
            ctx.fillRect(nx, ny, 40 + i * 5, 8);
            ctx.fillRect(nx + 10, ny + 12, 25, 5);
            ctx.restore();
        }
    } else if (layer.shapes === 'cabinets') {
        for (let x = -scrollX % 100 - 50; x < canvas.width + 50; x += 100) {
            ctx.fillStyle = layer.color;
            ctx.fillRect(x, canvas.height - 180, 35, 156);
            ctx.fillStyle = 'rgba(100,150,200,0.08)';
            ctx.fillRect(x + 4, canvas.height - 170, 27, 45);
            ctx.fillStyle = layer.color;
            ctx.fillRect(x - 3, canvas.height - 120, 41, 25);
        }
    } else {
        ctx.save();
        for (let i = 0; i < 8; i++) {
            const sx = ((i * 85 - scrollX * 0.4) % (canvas.width + 150)) - 40;
            const sy = canvas.height - 140 + Math.sin(i * 2) * 30;
            const flicker = 0.03 + Math.sin(GD.frameCount * 0.2 + i * 3) * 0.02;
            ctx.fillStyle = `rgba(120,180,255,${flicker})`;
            ctx.fillRect(sx, sy, 25, 35);
        }
        ctx.restore();
    }
};

// ── Player drawing ─────────────────────────────────────────────
GD.drawPlayer = function(ctx) {
    if (GD.invincible && Math.floor(GD.flashTimer / 4) % 2 === 0) return;
    ctx.save();
    ctx.translate(GD.player.x + GD.player.w / 2, GD.player.y + GD.player.h / 2);

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
    ctx.beginPath(); ctx.ellipse(6, -3, 4, 5, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#f2f2f2';
    ctx.beginPath(); ctx.moveTo(-6,-8); ctx.lineTo(-6,-3); ctx.lineTo(-10,-3);
    ctx.arc(-6,-3,4,Math.PI,Math.PI*1.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(6,-8); ctx.lineTo(6,-3); ctx.lineTo(2,-3);
    ctx.arc(6,-3,4,Math.PI,Math.PI*1.5); ctx.fill();

    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 2, 7, 0.2, Math.PI - 0.2); ctx.stroke();

    ctx.restore();
};

// ── Bullet drawing ─────────────────────────────────────────────
GD.drawBullet = function(ctx, b) {
    ctx.save();
    const color = b.color || '#ffffff';
    ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.fillStyle = color;
    ctx.fillRect(b.x - 2, b.y - 7, 4, 14);
    ctx.restore();
};

// ── Enemy drawing ──────────────────────────────────────────────
GD.drawEnemy = function(ctx, e) {
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
    ctx.rotate(e.rot || 0);
    switch (e.type) {
        case 'cup': case 'sine': case 'zigzag': case 'dropper': GD.drawCup(ctx); break;
        case 'missile': GD.drawMissile(ctx, e.dir > 0); break;
        case 'bouncer': GD.drawBouncer(ctx); break;
        case 'homing': GD.drawEye(ctx); break;
        case 'bossshot': GD.drawBossShot(ctx); break;
        case 'tracking_eye': GD.drawTrackingEye(ctx, e); break;
    }
    ctx.restore();
};

GD.drawCup = function(ctx) {
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
    ctx.beginPath(); ctx.arc(4,0,2,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(-7,-3); ctx.lineTo(-2,-1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7,-3); ctx.lineTo(2,-1); ctx.stroke();
};

GD.drawMissile = function(ctx, rightward) {
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
};

GD.drawBouncer = function(ctx) {
    ctx.fillStyle = '#444'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 6; i++) {
        ctx.save(); ctx.rotate(i * Math.PI/3);
        ctx.fillRect(-3,-18,6,7); ctx.restore();
    }
    ctx.fillStyle = '#888';
    ctx.beginPath(); ctx.arc(0,0,6,0,Math.PI*2); ctx.fill();
};

GD.drawEye = function(ctx) {
    ctx.fillStyle = '#333'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#999';
    ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(2,0,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(4,-2,2,0,Math.PI*2); ctx.fill();
};

GD.drawBossShot = function(ctx) {
    ctx.fillStyle = '#aaa'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0,0,6,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-2,-2,2,0,Math.PI*2); ctx.fill();
};

GD.drawTrackingEye = function(ctx, e) {
    const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 1;
    const fadeAlpha = Math.min(1, e.lifetime / 60);
    
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = 'rgba(160, 100, 200, 0.3)';
    ctx.beginPath(); ctx.arc(0, 0, 14 * pulse, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#e8e0d8';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    
    ctx.strokeStyle = 'rgba(180, 80, 80, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const ang = i * Math.PI / 2 + Math.random() * 0.2;
        ctx.moveTo(Math.cos(ang) * 5, Math.sin(ang) * 5);
        ctx.lineTo(Math.cos(ang) * 9, Math.sin(ang) * 9);
        ctx.stroke();
    }
    
    ctx.fillStyle = '#8866aa';
    ctx.beginPath(); ctx.arc(2, 0, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(3, 0, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(5, -2, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(1, 2, 1, 0, Math.PI*2); ctx.fill();
    
    ctx.globalAlpha = 1;
};

// ── Boss drawing ───────────────────────────────────────────────
GD.drawBoss1 = function(ctx, b) {
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
    ctx.beginPath(); ctx.ellipse(10,4,7,9,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = fl ? '#1a1a1a' : '#ccc';
    ctx.beginPath(); ctx.moveTo(-10,-5); ctx.lineTo(-10,4); ctx.lineTo(-17,4); ctx.arc(-10,4,7,Math.PI,Math.PI*1.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10,-5); ctx.lineTo(10,4); ctx.lineTo(3,4); ctx.arc(10,4,7,Math.PI,Math.PI*1.5); ctx.fill();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-18,-8); ctx.lineTo(-4,-3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18,-8); ctx.lineTo(4,-3); ctx.stroke();
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-12,18); ctx.lineTo(-6,14); ctx.lineTo(-2,18); ctx.lineTo(2,14); ctx.lineTo(6,18); ctx.lineTo(12,14); ctx.lineTo(16,18); ctx.stroke();
    ctx.restore();
};

GD.drawBoss2 = function(ctx, b) {
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
    ctx.beginPath(); ctx.ellipse(7,0,5,6,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = fl ? '#f2f2f2' : '#333';
    ctx.beginPath(); ctx.ellipse(-7,0,3,3,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7,0,3,3,0,0,Math.PI*2); ctx.fill();
    ctx.restore();
};

GD.drawBoss3 = function(ctx, b) {
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
    ctx.beginPath(); ctx.ellipse(6,-16,4,5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = fl ? '#bbb' : '#333';
    ctx.beginPath(); ctx.ellipse(-6,-16,2,2,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6,-16,2,2,0,0,Math.PI*2); ctx.fill();
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
    ctx.beginPath(); ctx.ellipse(40,-10,10,7,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
};

// ── Particle & powerup drawing ─────────────────────────────────
GD.drawParticles = function(ctx) {
    GD.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.col;
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        ctx.restore();
    });
};

GD.drawPowerup = function(ctx, p) {
    ctx.save();
    ctx.translate(p.x + 10, p.y + 10);
    const wobbleX = Math.sin(p.wobble) * 2;
    ctx.translate(wobbleX, 0);
    ctx.shadowColor = GD.POWERUP_COLORS[p.type];
    ctx.shadowBlur = 8;
    ctx.fillStyle = GD.POWERUP_COLORS[p.type];
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px "Courier Prime", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(GD.POWERUP_LABELS[p.type], 0, 1);
    ctx.restore();
};

// ── HUD drawing ────────────────────────────────────────────────
GD.drawHUD = function(ctx, canvas) {
    const effectiveLevel = GD.gameMode === 'arcade' ? GD.level % 3 : Math.min(GD.level, GD.LEVELS.length-1);
    const cfg = GD.LEVELS[effectiveLevel];
    const wave = Math.floor(GD.level / 3) + 1;
    ctx.save();
    ctx.textAlign = 'center';

    if (GD.gameState === 'playing') {
        ctx.font = '10px "Special Elite", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        const stageText = GD.gameMode === 'arcade' 
            ? `WAVE ${wave} - ${cfg.sub}` 
            : `${cfg.name}: ${cfg.sub}`;
        ctx.fillText(stageText, canvas.width/2, 13);
        
        const killsNeeded = GD.gameMode === 'arcade' 
            ? cfg.kills + (wave - 1) * 6 
            : cfg.kills;
        const prog = Math.min(GD.killCount / killsNeeded, 1);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(canvas.width/2 - 60, 17, 120, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.fillRect(canvas.width/2 - 60, 17, 120 * prog, 5);

    } else if (GD.gameState === 'boss_intro') {
        const alpha = Math.min(1, (100 - GD.stateTimer) / 18);
        ctx.font = 'bold 18px "Playfair Display", serif';
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillText('- BOSS -', canvas.width/2, canvas.height/2 - 14);
        ctx.font = 'bold 13px "Special Elite", monospace';
        ctx.fillStyle = `rgba(200,200,200,${alpha})`;
        const bossName = GD.gameMode === 'arcade' && wave > 1 
            ? `${GD.BOSS_NAMES[effectiveLevel]} MK.${wave}` 
            : GD.BOSS_NAMES[effectiveLevel];
        ctx.fillText(bossName, canvas.width/2, canvas.height/2 + 10);

    } else if (GD.gameState === 'boss') {
        ctx.font = '10px "Special Elite", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        const bossName = GD.gameMode === 'arcade' && wave > 1 
            ? `${GD.BOSS_NAMES[effectiveLevel]} MK.${wave}` 
            : GD.BOSS_NAMES[effectiveLevel];
        ctx.fillText(bossName, canvas.width/2, 13);
        const bw = 200, bx = canvas.width/2 - bw/2;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(bx - 1, 17, bw + 2, 9);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(bx, 18, bw, 7);
        const frac = GD.bossHP / GD.bossMaxHP;
        ctx.fillStyle = frac > 0.5 ? 'rgba(160,255,160,0.8)' : 'rgba(255,120,120,0.9)';
        ctx.fillRect(bx, 18, bw * frac, 7);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
        ctx.strokeRect(bx, 18, bw, 7);

    } else if (GD.gameState === 'level_clear') {
        const alpha = Math.min(1, (130 - GD.stateTimer) / 18);
        const nextLevel = GD.level % 3;
        const nextWave = Math.floor(GD.level / 3) + 1;
        ctx.font = 'bold 20px "Playfair Display", serif';
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillText(GD.gameMode === 'arcade' ? 'WAVE CLEAR!' : 'STAGE CLEAR!', canvas.width/2, canvas.height/2 - 10);
        ctx.font = '12px "Special Elite", monospace';
        ctx.fillStyle = `rgba(180,180,180,${alpha})`;
        const nextText = GD.gameMode === 'arcade' 
            ? `Wave ${nextWave} - ${GD.LEVELS[nextLevel].sub}` 
            : `Entering ${GD.LEVELS[nextLevel].name}: ${GD.LEVELS[nextLevel].sub}`;
        ctx.fillText(nextText, canvas.width/2, canvas.height/2 + 14);
    }

    // ── In-game stats HUD (visible in fullscreen) ──────────────────
    if (GD.gameState === 'playing' || GD.gameState === 'boss' || GD.gameState === 'boss_intro' || GD.gameState === 'level_clear') {
        const padding = 12;
        
        // Semi-transparent background for readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(canvas.width - 90, padding - 4, 82, 80);
        ctx.fillRect(padding - 4, canvas.height - 52, 75, 40);
        
        // Right side - Score & Best
        ctx.textAlign = 'right';
        ctx.font = '9px "Special Elite", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('SCORE', canvas.width - padding, padding + 8);
        ctx.font = 'bold 16px "Playfair Display", serif';
        ctx.fillStyle = '#f5f0e6';
        ctx.fillText(GD.score.toString(), canvas.width - padding, padding + 26);
        
        ctx.font = '9px "Special Elite", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('BEST', canvas.width - padding, padding + 44);
        ctx.font = 'bold 12px "Playfair Display", serif';
        ctx.fillStyle = 'rgba(245,240,230,0.7)';
        const highScore = GD.gameMode === 'arcade' ? GD.highScoreArcade : GD.highScoreStory;
        ctx.fillText(highScore.toString(), canvas.width - padding, padding + 58);
        
        // Bottom left - Lives, Stage
        ctx.textAlign = 'left';
        ctx.font = '9px "Special Elite", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(GD.gameMode === 'arcade' ? 'WAVE' : 'STAGE', padding, canvas.height - 38);
        ctx.font = 'bold 14px "Playfair Display", serif';
        ctx.fillStyle = '#88aaff';
        const stageNum = GD.gameMode === 'arcade' ? Math.floor(GD.level / 3) + 1 : GD.level + 1;
        ctx.fillText(stageNum.toString(), padding, canvas.height - 24);
        
        // Lives - hearts
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#ff6688';
        const hearts = '♥'.repeat(Math.max(0, GD.lives));
        const emptyHearts = '♡'.repeat(Math.max(0, (GD.gameMode === 'arcade' ? 5 : 3) - GD.lives));
        ctx.fillText(hearts, padding + 30, canvas.height - 24);
        ctx.fillStyle = 'rgba(255,102,136,0.3)';
        ctx.fillText(emptyHearts, padding + 30 + ctx.measureText(hearts).width, canvas.height - 24);
    }

    // Active powerup indicator - positioned above stage/lives area
    if (GD.activePowerup && (GD.gameState === 'playing' || GD.gameState === 'boss')) {
        const pct = GD.activePowerup.timer / GD.POWERUP_DURATION;
        const pcolor = GD.POWERUP_COLORS[GD.activePowerup.type];
        ctx.textAlign = 'left';
        ctx.font = 'bold 10px "Courier Prime", monospace';
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(8, canvas.height - 68, 52, 14);
        ctx.fillStyle = pcolor;
        ctx.fillRect(9, canvas.height - 67, 50 * pct, 12);
        ctx.fillStyle = '#fff';
        ctx.fillText(GD.activePowerup.type.toUpperCase(), 12, canvas.height - 58);
    }

    ctx.restore();
};
