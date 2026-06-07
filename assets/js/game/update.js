/* ═══════════════════════════════════════════════════════════════
   GEAR DODGER 2 - Update Logic
   Game state updates, collision detection
   ═══════════════════════════════════════════════════════════════ */

var GD = window.GD;

// ── Update particles ───────────────────────────────────────────
GD.updateParticles = function() {
    for (let i = GD.particles.length - 1; i >= 0; i--) {
        const p = GD.particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life--;
        if (p.life <= 0) GD.particles.splice(i, 1);
    }
};

// ── Update powerups ────────────────────────────────────────────
GD.updatePowerups = function(updateLivesCallback) {
    for (let i = GD.powerups.length - 1; i >= 0; i--) {
        const p = GD.powerups[i];
        p.y += p.vy;
        p.wobble += 0.15;
        if (p.y > GD.canvas.height + 30) { GD.powerups.splice(i, 1); continue; }
        
        const pcx = GD.player.x + GD.player.w/2, pcy = GD.player.y + GD.player.h/2;
        if (GD.dist2(pcx, pcy, p.x + 10, p.y + 10) < 24) {
            GD.collectPowerup(p, updateLivesCallback);
            GD.powerups.splice(i, 1);
        }
    }
    
    if (GD.activePowerup) {
        GD.activePowerup.timer--;
        if (GD.activePowerup.timer <= 0) GD.activePowerup = null;
    }
};

// ── Update boss ────────────────────────────────────────────────
GD.updateBoss = function() {
    if (!GD.boss) return;
    if (GD.boss.flash > 0) GD.boss.flash--;
    const canvas = GD.canvas;

    if (GD.boss.type === 'boss1') {
        GD.boss.x += GD.boss.vx;
        if (GD.boss.x <= 8 || GD.boss.x + GD.boss.w >= canvas.width - 8) GD.boss.vx *= -1;
        GD.boss.x = GD.clamp(GD.boss.x, 8, canvas.width - GD.boss.w - 8);
        GD.boss.atk--;
        if (GD.boss.atk <= 0) {
            GD.boss.atk = GD.bossPhase === 1 ? 55 : 95;
            const cx = GD.boss.x + GD.boss.w/2, cy = GD.boss.y + GD.boss.h;
            const count = GD.bossPhase === 1 ? 5 : 3;
            for (let i = 0; i < count; i++) {
                const ox = (i - Math.floor(count/2)) * 28;
                GD.enemies.push({ type:'dropper', hp:1, w:20, h:20,
                    x: cx - 10 + ox, y: cy,
                    vx: ox * 0.04, vy: 3.2 + Math.random(),
                    rot:0, rotSpd:0.08 });
            }
        }

    } else if (GD.boss.type === 'boss2') {
        GD.boss.sineT += 0.018;
        GD.boss.x = GD.clamp(canvas.width/2 - GD.boss.w/2 + Math.sin(GD.boss.sineT) * 145,
            5, canvas.width - GD.boss.w - 5);
        GD.boss.rot += 0.022;

        if (GD.boss.charging) {
            GD.boss.y += GD.boss.chargeV;
            if (GD.boss.y >= canvas.height * 0.55 || GD.boss.chargeV > 0 && GD.boss.y >= GD.boss.chargeTarget) {
                GD.boss.chargeV = -5;
            }
            if (GD.boss.y < GD.boss.chargeY) {
                GD.boss.y = GD.boss.chargeY; GD.boss.charging = false; GD.boss.chargeV = 0;
            }
        }
        GD.boss.atk--;
        if (GD.boss.atk <= 0) {
            GD.boss.atk = GD.bossPhase === 1 ? 65 : 100;
            const cx = GD.boss.x + GD.boss.w/2, cy = GD.boss.y + GD.boss.h/2;
            const count = GD.bossPhase === 1 ? 10 : 8;
            for (let i = 0; i < count; i++) {
                const ang = (i / count) * Math.PI * 2;
                GD.enemies.push({ type:'bossshot', hp:1, w:14, h:14,
                    x: cx-7, y: cy-7, vx: Math.cos(ang)*2.8, vy: Math.sin(ang)*2.8,
                    rot:0, rotSpd:0.1, free:true });
            }
            if (!GD.boss.charging && Math.random() < 0.3) {
                GD.boss.charging = true;
                GD.boss.chargeV = 7;
                GD.boss.chargeTarget = canvas.height * 0.55;
            }
        }

    } else if (GD.boss.type === 'boss3') {
        GD.boss.x += GD.boss.vx; GD.boss.y += GD.boss.vy;
        if (GD.boss.x <= 5 || GD.boss.x + GD.boss.w >= canvas.width - 5) GD.boss.vx *= -1;
        if (GD.boss.y <= 5 || GD.boss.y + GD.boss.h >= canvas.height*0.48) GD.boss.vy *= -1;
        GD.boss.x = GD.clamp(GD.boss.x, 5, canvas.width - GD.boss.w - 5);
        GD.boss.y = GD.clamp(GD.boss.y, 5, canvas.height*0.48 - GD.boss.h);
        GD.boss.atk--;
        if (GD.boss.atk <= 0) {
            GD.boss.atk = GD.bossPhase === 1 ? 55 : 80;
            const cx = GD.boss.x + GD.boss.w/2, cy = GD.boss.y + GD.boss.h/2;
            const px = GD.player.x + GD.player.w/2, py = GD.player.y + GD.player.h/2;
            const ang = Math.atan2(py - cy, px - cx);
            
            const eyeCount = GD.bossPhase === 1 ? 2 : 1;
            for (let e = 0; e < eyeCount; e++) {
                const offset = (e - (eyeCount-1)/2) * 25;
                GD.enemies.push({ 
                    type: 'tracking_eye', 
                    hp: 2,
                    w: 20, h: 20,
                    x: cx - 10 + offset, y: cy - 10,
                    vx: Math.cos(ang) * 1.5, vy: Math.sin(ang) * 1.5,
                    homespd: 2.8 + GD.bossPhase * 0.5,
                    rot: 0, rotSpd: 0.08,
                    free: true,
                    lifetime: 360
                });
            }
            
            if (GD.bossPhase === 1) {
                const spd = 4.0;
                for (let s = 0; s < 2; s++) {
                    const spread = (s - 0.5) * 0.4;
                    GD.enemies.push({ type:'bossshot', hp:1, w:14, h:14,
                        x: cx-7, y: cy-7,
                        vx: Math.cos(ang + spread) * spd,
                        vy: Math.sin(ang + spread) * spd,
                        rot:0, rotSpd:0.12, free:true });
                }
            }
            
            if (GD.bossPhase === 1 && Math.random() < 0.3) {
                GD.spawnEnemy();
            }
        }
    }

    // Enrage at 50% HP
    if (GD.bossHP <= GD.bossMaxHP / 2 && GD.bossPhase === 0) {
        GD.bossPhase = 1;
        GD.boss.flash = 25;
        GD.spawnParticles(GD.boss.x + GD.boss.w/2, GD.boss.y + GD.boss.h/2, 20, '#ffffff');
    }
};

// ── Update enemies ─────────────────────────────────────────────
GD.updateEnemies = function(takeDamageCallback, scoreEl) {
    const canvas = GD.canvas;
    
    for (let i = GD.enemies.length - 1; i >= 0; i--) {
        const e = GD.enemies[i];

        if (e.free) {
            if (e.type === 'tracking_eye') {
                e.lifetime--;
                if (e.lifetime <= 0) {
                    GD.spawnParticles(e.x + e.w/2, e.y + e.h/2, 6, '#aa88ff');
                    GD.enemies.splice(i, 1);
                    continue;
                }
                const px = GD.player.x + GD.player.w/2, py = GD.player.y + GD.player.h/2;
                const ecx = e.x + e.w/2, ecy = e.y + e.h/2;
                const ang = Math.atan2(py - ecy, px - ecx);
                e.vx = e.vx * 0.92 + Math.cos(ang) * e.homespd * 0.08;
                e.vy = e.vy * 0.92 + Math.sin(ang) * e.homespd * 0.08;
                const spd = Math.hypot(e.vx, e.vy);
                if (spd > e.homespd) { e.vx /= spd/e.homespd; e.vy /= spd/e.homespd; }
                e.rot = Math.atan2(e.vy, e.vx);
            }
            e.x += e.vx; e.y += e.vy; e.rot += (e.type === 'tracking_eye' ? 0 : (e.rotSpd || 0));
            if (e.x < -60 || e.x > canvas.width+60 || e.y < -60 || e.y > canvas.height+60) {
                GD.enemies.splice(i, 1);
            } else {
                GD.checkEnemyPlayerCollision(e, i, takeDamageCallback);
            }
            continue;
        }

        if (e.type === 'sine') {
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
            const px = GD.player.x + GD.player.w/2, py = GD.player.y + GD.player.h/2;
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

        let gone = false;
        if (e.type === 'missile') {
            if ((e.vx > 0 && e.x > canvas.width + 40) || (e.vx < 0 && e.x < -e.w - 40)) gone = true;
        } else if (e.y > canvas.height + 40 || e.y < -canvas.height) {
            gone = true;
        }
        if (e.x < -canvas.width || e.x > canvas.width * 2) gone = true;

        if (gone) {
            GD.enemies.splice(i, 1);
            // Arcade mode applies score multiplier
            const pts = GD.gameMode === 'arcade' ? Math.floor(1 * (GD.scoreMultiplier || 1)) : 1;
            GD.score += pts;
            if (scoreEl) scoreEl.textContent = GD.score;
            continue;
        }

        GD.checkEnemyPlayerCollision(e, i, takeDamageCallback);
    }
};

GD.checkEnemyPlayerCollision = function(e, idx, takeDamageCallback) {
    if (GD.invincible) return;
    const pcx = GD.player.x + GD.player.w/2, pcy = GD.player.y + GD.player.h/2;
    const ecx = e.x + e.w/2, ecy = e.y + e.h/2;
    const radius = (e.type === 'dropper' || e.type === 'bossshot') ? 13 : 16;
    if (GD.dist2(pcx, pcy, ecx, ecy) < radius + 11) {
        GD.spawnParticles(pcx, pcy, 12, '#ffffff');
        GD.enemies.splice(idx, 1);
        if (takeDamageCallback) takeDamageCallback();
    }
};

// ── Update bullets ─────────────────────────────────────────────
GD.updateBullets = function(scoreEl, checkProgressCallback, bossDefeatedCallback) {
    const canvas = GD.canvas;
    
    for (let i = GD.bullets.length - 1; i >= 0; i--) {
        const b = GD.bullets[i];
        if (!b) continue;
        b.x += b.vx || 0;
        b.y += b.vy || 0;
        
        if (b.y < -20 || b.x < -20 || b.x > canvas.width + 20) { 
            GD.bullets.splice(i, 1); continue; 
        }

        let hitEnemy = false;
        for (let j = GD.enemies.length - 1; j >= 0; j--) {
            const e = GD.enemies[j];
            if (!e) continue;
            if (GD.dist2(b.x, b.y, e.x + e.w/2, e.y + e.h/2) < e.w/2 + 5) {
                GD.spawnParticles(e.x + e.w/2, e.y + e.h/2, 8, b.color || '#aaaaaa');
                e.hp--;
                if (e.hp <= 0) {
                    GD.playSound('hit');
                    GD.spawnPowerup(e.x + e.w/2, e.y + e.h/2);
                    GD.enemies.splice(j, 1);
                    // Arcade mode applies score multiplier
                    const pts = GD.gameMode === 'arcade' ? Math.floor(2 * (GD.scoreMultiplier || 1)) : 2;
                    GD.score += pts; GD.killCount++;
                    // Award coins for kills
                    GD.coins += GD.SHOP.coinPerKill;
                    if (scoreEl) scoreEl.textContent = GD.score;
                    if (GD.gameState === 'playing' && checkProgressCallback) checkProgressCallback();
                }
                if (!b.pierce) {
                    GD.bullets.splice(i, 1); hitEnemy = true; break;
                }
                hitEnemy = true;
            }
        }
        if (hitEnemy && !b.pierce) continue;

        if (GD.boss && GD.gameState === 'boss') {
            const bcx = GD.boss.x + GD.boss.w/2, bcy = GD.boss.y + GD.boss.h/2;
            if (GD.dist2(b.x, b.y, bcx, bcy) < GD.boss.w/2 + 5) {
                GD.boss.flash = 6;
                // Apply damage upgrade (2x damage)
                const dmg = GD.tempUpgrades.damage_up ? 2 : 1;
                GD.bossHP -= dmg;
                GD.spawnParticles(b.x, b.y, 5, b.color || '#ffffff');
                if (!b.pierce) GD.bullets.splice(i, 1);
                if (GD.bossHP <= 0 && bossDefeatedCallback) { 
                    bossDefeatedCallback(); 
                    return; 
                }
            }
        }
    }
};
