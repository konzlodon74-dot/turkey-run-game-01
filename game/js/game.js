// Gobble Dash: The Great Escape — main game loop, input, HUD and screens.
(function () {
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var GROUND = 452;
  var TURKEY_X = 230;

  var state = 'title'; // title | play | paused | caught | escaped
  var score, distance, feathers, cornCount, speed, farmerGap, spottedTimer, flashTimer;
  var turkey, obstacles, corns, spawnTimer, hayTimer, invuln, hideTimer, hidden, runPhase, elapsed;
  var popups, stageName, bestScore = 0;

  function reset() {
    score = 0; distance = 0; feathers = 3; cornCount = 0; speed = 5.2;
    farmerGap = 270; spottedTimer = 0; flashTimer = 0;
    turkey = { y: GROUND, vy: 0, ducking: false, onGround: true };
    obstacles = []; corns = []; spawnTimer = 900; hayTimer = 5200;
    invuln = 0; hideTimer = 0; hidden = false; runPhase = 0; elapsed = 0;
    popups = []; stageName = STAGES[0].name;
  }
  reset();

  function popup(text, x, y, color) { popups.push({ text: text, x: x, y: y, t: 0, color: color || '#7c2d12' }); }

  function jump() {
    if (state === 'title' || state === 'caught' || state === 'escaped') { startRun(); return; }
    if (state !== 'play') return;
    if (turkey.onGround && !hidden) { turkey.vy = -15.5; turkey.onGround = false; GobbleAudio.jump(); }
  }
  function startRun() { reset(); state = 'play'; GobbleAudio.gobble(); }

  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); jump(); }
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') { turkey.ducking = true; }
    else if (e.code === 'KeyP' || e.code === 'Escape') {
      if (state === 'play') state = 'paused'; else if (state === 'paused') state = 'play';
    } else if (e.code === 'Enter') { if (state !== 'play') startRun(); }
  });
  document.addEventListener('keyup', function (e) {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') turkey.ducking = false;
  });
  canvas.addEventListener('mousedown', function () { jump(); });
  document.getElementById('muteBtn').addEventListener('click', function () {
    GobbleAudio.setMuted(!GobbleAudio.isMuted());
    this.textContent = GobbleAudio.isMuted() ? 'SOUND: OFF' : 'SOUND: ON';
  });

  function spawnObstacle(stage) {
    var kind = stage.kinds[Math.floor(Math.random() * stage.kinds.length)];
    obstacles.push({ kind: kind, x: W + 60, passed: false, hit: false });
    if (Math.random() < 0.55) corns.push({ x: W + 220 + Math.random() * 160, y: GROUND - 60 - Math.random() * 90, taken: false });
  }

  function update(dt) {
    if (state !== 'play') return;
    elapsed += dt;
    var stage = stageAt(distance);
    if (stage.name !== stageName) {
      stageName = stage.name; spottedTimer = 1.6; GobbleAudio.spotted();
      popup(stage.name + '!', W / 2, 150, '#b91c1c');
    }
    speed = stage.speed + Math.min(1.6, distance / 900);
    var move = speed * dt * 60;
    distance += move * 0.045;
    score += move * 0.09;
    runPhase += dt * (hidden ? 2 : 14);

    // turkey physics
    if (!turkey.onGround) {
      turkey.vy += 0.85;
      turkey.y += turkey.vy;
      if (turkey.y >= GROUND) { turkey.y = GROUND; turkey.vy = 0; turkey.onGround = true; }
    }

    // farmer: gains slowly, faster right after you stumble; hiding shakes him off
    if (hidden) {
      hideTimer -= dt;
      farmerGap = Math.min(340, farmerGap + 55 * dt);
      if (hideTimer <= 0) { hidden = false; popup('SHAKEN OFF!', TURKEY_X, GROUND - 130, '#3f6212'); }
    } else {
      farmerGap -= (2.2 + (3 - feathers) * 1.1) * dt;
    }
    if (farmerGap < 120 && spottedTimer <= 0 && !hidden) { spottedTimer = 1.2; GobbleAudio.spotted(); }
    if (spottedTimer > 0) spottedTimer -= dt;
    if (flashTimer > 0) flashTimer -= dt;
    if (invuln > 0) invuln -= dt;
    if (farmerGap <= 42) { state = 'caught'; GobbleAudio.sad(); return; }
    if (distance >= ESCAPE_DISTANCE) { state = 'escaped'; GobbleAudio.fanfare(); return; }

    // spawning
    spawnTimer -= dt * 1000;
    if (spawnTimer <= 0) { spawnObstacle(stage); spawnTimer = stage.gapMs * (0.8 + Math.random() * 0.5); }
    hayTimer -= dt * 1000;
    if (hayTimer <= 0) { obstacles.push({ kind: 'haystack', x: W + 60, passed: false, hit: false }); hayTimer = 6000 + Math.random() * 3000; }

    // obstacles
    var tBox = turkeyBox();
    for (var i = obstacles.length - 1; i >= 0; i--) {
      var o = obstacles[i];
      o.x -= move;
      if (o.x < -90) { obstacles.splice(i, 1); continue; }
      if (o.kind === 'haystack') {
        if (turkey.ducking && turkey.onGround && o.x < TURKEY_X + 30 && o.x + 56 > TURKEY_X - 10 && !hidden) {
          hidden = true; hideTimer = 1.4; GobbleAudio.gobble();
          popup('HIDDEN!', TURKEY_X, GROUND - 120, '#3f6212');
        }
        continue;
      }
      var ob = obstacleBox(o);
      if (!o.passed && o.x + ob.w < TURKEY_X - 20) {
        o.passed = true;
        if (!o.hit) {
          var close = (o.kind === 'knife' && turkey.ducking) || (o.kind !== 'knife' && !turkey.onGround && turkey.y > GROUND - 120);
          if (close) { score += 10; popup('WHOOSH! +10', TURKEY_X + 40, GROUND - 150, '#b45309'); GobbleAudio.whoosh(); }
        }
      }
      if (!o.hit && invuln <= 0 && !hidden && boxesOverlap(tBox, ob)) {
        o.hit = true;
        feathers--; flashTimer = 0.35; invuln = 1.1; farmerGap -= 115;
        popup('FEATHER LOST!', TURKEY_X, GROUND - 150, '#b91c1c');
        GobbleAudio.hit(); GobbleAudio.gobble();
        if (feathers <= 0) { state = 'caught'; GobbleAudio.sad(); return; }
      }
    }
    // corn
    for (var j = corns.length - 1; j >= 0; j--) {
      var c = corns[j];
      c.x -= move;
      if (c.x < -40) { corns.splice(j, 1); continue; }
      if (!c.taken && Math.abs(c.x - TURKEY_X) < 42 && Math.abs(c.y - (turkey.y - 30)) < 52) {
        c.taken = true; cornCount++; score += 50; farmerGap = Math.min(340, farmerGap + 14);
        popup('+50 CORN!', c.x, c.y - 24, '#a16207'); GobbleAudio.corn();
        corns.splice(j, 1);
      }
    }
    for (var k = popups.length - 1; k >= 0; k--) { popups[k].t += dt; popups[k].y -= 26 * dt; if (popups[k].t > 1.3) popups.splice(k, 1); }
    if (score > bestScore) bestScore = Math.floor(score);
  }

  function turkeyBox() {
    var h = turkey.ducking && turkey.onGround ? 38 : 62;
    return { x: TURKEY_X - 26, y: turkey.y - h, w: 58, h: h };
  }
  function obstacleBox(o) {
    if (o.kind === 'fence') return { x: o.x, y: GROUND - 52, w: 40, h: 52 };
    if (o.kind === 'haybale') return { x: o.x + 2, y: GROUND - 40, w: 40, h: 40 };
    if (o.kind === 'crate') return { x: o.x, y: GROUND - 44, w: 44, h: 44 };
    if (o.kind === 'oven') return { x: o.x, y: GROUND - 72, w: 58, h: 72 };
    if (o.kind === 'knife') return { x: o.x - 20, y: GROUND - 72, w: 76, h: 18 };
    return { x: o.x, y: GROUND, w: 0, h: 0 };
  }
  function boxesOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  function drawBackground(stage) {
    ctx.fillStyle = stage.sky; ctx.fillRect(0, 0, W, H);
    // sun
    ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(850, 74, 34, 0, Math.PI * 2); ctx.fill();
    // far hills / barn / kitchen silhouettes, parallax
    ctx.fillStyle = stage.far;
    var off = (distance * 22) % 480;
    for (var i = -1; i < 3; i++) {
      var bx = i * 480 - off;
      if (stage.name === 'FARMYARD') {
        ctx.beginPath(); ctx.ellipse(bx + 200, GROUND, 260, 90, 0, Math.PI, 0); ctx.fill();
        ctx.fillRect(bx + 60, GROUND - 120, 90, 120); // barn block
        ctx.beginPath(); ctx.moveTo(bx + 48, GROUND - 120); ctx.lineTo(bx + 105, GROUND - 168); ctx.lineTo(bx + 162, GROUND - 120); ctx.closePath(); ctx.fill();
      } else if (stage.name === 'THE BARN') {
        ctx.fillRect(bx + 40, GROUND - 210, 26, 210); ctx.fillRect(bx + 300, GROUND - 210, 26, 210);
        ctx.fillRect(bx + 20, GROUND - 232, 330, 24);
        ctx.fillRect(bx + 130, GROUND - 150, 110, 150);
      } else {
        ctx.fillRect(bx + 30, GROUND - 190, 150, 190); // cabinets
        ctx.fillRect(bx + 230, GROUND - 150, 120, 150);
        ctx.beginPath(); ctx.arc(bx + 420, GROUND - 170, 26, 0, Math.PI * 2); ctx.fill(); // hanging pan
        ctx.fillRect(bx + 416, GROUND - 232, 8, 40);
      }
    }
    // ground
    ctx.fillStyle = stage.ground; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    var goff = (distance * 60) % 90;
    for (var g = -1; g < 12; g++) ctx.fillRect(g * 90 - goff, GROUND + 16, 46, 7);
    // finish banner near escape
    if (distance > ESCAPE_DISTANCE - 120) {
      var fx = W - (ESCAPE_DISTANCE - distance) * 8;
      ctx.fillStyle = '#3f6212'; ctx.fillRect(fx, GROUND - 190, 10, 190); ctx.fillRect(fx + 150, GROUND - 190, 10, 190);
      ctx.fillStyle = '#65a30d'; ctx.fillRect(fx, GROUND - 190, 160, 34);
      ctx.fillStyle = '#fff7e6'; ctx.font = 'bold 20px Georgia'; ctx.textAlign = 'center';
      ctx.fillText('FREEDOM!', fx + 80, GROUND - 166);
    }
  }

  function drawHUD() {
    ctx.fillStyle = 'rgba(43,26,16,0.82)';
    ctx.beginPath(); ctx.roundRect(14, 12, 470, 58, 10); ctx.fill();
    ctx.fillStyle = '#fff7e6'; ctx.textAlign = 'left';
    ctx.font = 'bold 24px Georgia';
    ctx.fillText('SCORE ' + Math.floor(score), 30, 40);
    ctx.font = 'bold 19px Georgia';
    ctx.fillText(Math.floor(distance) + ' m  ·  ' + stageName, 30, 63);
    ctx.fillText('CORN x ' + cornCount, 320, 40);
    for (var i = 0; i < 3; i++) drawFeather(ctx, 345 + i * 28, 58, i < feathers);
    // farmer distance meter
    ctx.fillStyle = 'rgba(43,26,16,0.82)';
    ctx.beginPath(); ctx.roundRect(640, 12, 306, 58, 10); ctx.fill();
    ctx.fillStyle = '#fff7e6'; ctx.font = 'bold 16px Georgia';
    ctx.fillText('FARMER', 656, 36);
    var frac = Math.max(0, Math.min(1, farmerGap / 340));
    ctx.fillStyle = '#57534e'; ctx.fillRect(656, 44, 270, 14);
    ctx.fillStyle = frac < 0.35 ? '#dc2626' : frac < 0.6 ? '#f59e0b' : '#84cc16';
    ctx.fillRect(656, 44, 270 * frac, 14);
    ctx.fillStyle = '#fff7e6'; ctx.font = 'bold 13px Georgia'; ctx.textAlign = 'right';
    ctx.fillText(hidden ? 'LOST HIM!' : Math.round(farmerGap) + ' px behind', 926, 36);
    ctx.textAlign = 'left';
    if (spottedTimer > 0 && state === 'play') {
      ctx.fillStyle = '#b91c1c'; ctx.font = 'bold 44px Georgia'; ctx.textAlign = 'center';
      ctx.fillText('SPOTTED!', W / 2, 120);
      ctx.textAlign = 'left';
    }
  }

  function drawButton(x, y, w, h, label) {
    ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
    ctx.strokeStyle = '#92400e'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#fff7e6'; ctx.font = 'bold 28px Georgia'; ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h / 2 + 10);
    ctx.textAlign = 'left';
  }

  function drawTitle() {
    drawBackground(STAGES[0]);
    drawFarmer(ctx, 105, GROUND, 1.25, 1.2);
    drawTurkey(ctx, 215, GROUND, 1.9, 2.2, false);
    ctx.fillStyle = '#7c2d12'; ctx.textAlign = 'center';
    ctx.font = 'bold 64px Georgia';
    ctx.fillText('GOBBLE DASH', W / 2, 108);
    ctx.font = 'bold 30px Georgia'; ctx.fillStyle = '#b45309';
    ctx.fillText('— The Great Escape —', W / 2, 148);
    ctx.font = '19px Georgia'; ctx.fillStyle = '#5b3a1e';
    ctx.fillText('Thanksgiving is coming and YOU are the main course. Run!', W / 2, 184);
    ctx.fillText('Jump fences & ovens · duck under carving knives · grab corn', W / 2, 210);
    ctx.fillText('Hide in haystacks (↓) to shake the farmer · reach 1500 m to escape', W / 2, 236);
    drawButton(W / 2 - 110, 360, 220, 62, '▶ PLAY');
    ctx.font = '16px Georgia'; ctx.fillStyle = '#7c2d12';
    ctx.fillText('SPACE / click to jump · ↓ duck & hide · P pause · 3 feathers = 3 lives', W / 2, 452);
    ctx.textAlign = 'left';
  }

  function drawEnd(escaped) {
    drawBackground(stageAt(distance));
    if (escaped) {
      drawTurkey(ctx, 255, GROUND, 1.9, 3, false);
      ctx.fillStyle = '#3f6212'; ctx.textAlign = 'center';
      ctx.font = 'bold 56px Georgia';
      ctx.fillText('YOU ESCAPED!', W / 2, 130);
      ctx.font = 'bold 28px Georgia'; ctx.fillStyle = '#65a30d';
      ctx.fillText('Free range forever. 🦃💨', W / 2, 172);
    } else {
      drawFarmer(ctx, 430, GROUND, 1.7, 0.4);
      drawTurkey(ctx, 520, GROUND, 1.5, 0, true);
      ctx.fillStyle = '#991b1b'; ctx.textAlign = 'center';
      ctx.font = 'bold 56px Georgia';
      ctx.fillText('CAUGHT!', W / 2, 130);
      ctx.font = 'bold 28px Georgia'; ctx.fillStyle = '#b91c1c';
      ctx.fillText('On the menu… with gravy.', W / 2, 172);
    }
    ctx.font = 'bold 24px Georgia'; ctx.fillStyle = '#5b3a1e';
    ctx.fillText('Score ' + Math.floor(score) + '  ·  ' + Math.floor(distance) + ' m  ·  🌽 ' + cornCount + '  ·  Best ' + bestScore, W / 2, 226);
    drawButton(W / 2 - 120, 330, 240, 62, '↻ RESTART');
    ctx.font = '16px Georgia'; ctx.fillStyle = '#7c2d12';
    ctx.fillText('Press ENTER or click to run again', W / 2, 428);
    ctx.textAlign = 'left';
  }

  function draw() {
    if (state === 'title') { drawTitle(); return; }
    if (state === 'caught') { drawEnd(false); return; }
    if (state === 'escaped') { drawEnd(true); return; }
    var stage = stageAt(distance);
    drawBackground(stage);
    for (var i = 0; i < obstacles.length; i++) drawObstacle(ctx, obstacles[i], GROUND);
    for (var j = 0; j < corns.length; j++) drawCorn(ctx, corns[j].x, corns[j].y, elapsed);
    drawFarmer(ctx, TURKEY_X - farmerGap, GROUND, 1.15, runPhase * 0.9);
    if (!hidden) {
      if (!(invuln > 0 && Math.floor(elapsed * 14) % 2 === 0)) {
        drawTurkey(ctx, TURKEY_X, turkey.y, 1.25, runPhase, turkey.ducking && turkey.onGround);
      }
    }
    drawHUD();
    ctx.font = 'bold 20px Georgia'; ctx.textAlign = 'center';
    for (var k = 0; k < popups.length; k++) {
      var p = popups[k];
      ctx.globalAlpha = Math.max(0, 1 - p.t / 1.3);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
    if (flashTimer > 0) { ctx.fillStyle = 'rgba(220,38,38,0.28)'; ctx.fillRect(0, 0, W, H); }
    if (state === 'paused') {
      ctx.fillStyle = 'rgba(43,26,16,0.6)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff7e6'; ctx.font = 'bold 48px Georgia'; ctx.textAlign = 'center';
      ctx.fillText('PAUSED', W / 2, H / 2);
      ctx.font = '20px Georgia'; ctx.fillText('Press P to keep running', W / 2, H / 2 + 38);
      ctx.textAlign = 'left';
    }
  }

  // Screenshot/demo hooks: ?shot=farm|kitchen|end renders a fixed real scene.
  var shot = new URLSearchParams(location.search).get('shot');
  if (shot === 'farm' || shot === 'kitchen') {
    state = 'play';
    distance = shot === 'kitchen' ? 1120 : 210;
    stageName = stageAt(distance).name;
    score = shot === 'kitchen' ? 2410 : 640; cornCount = shot === 'kitchen' ? 9 : 4;
    feathers = shot === 'kitchen' ? 2 : 3;
    farmerGap = shot === 'kitchen' ? 105 : 185;
    spottedTimer = shot === 'kitchen' ? 1 : 0;
    turkey.y = GROUND - (shot === 'farm' ? 90 : 0);
    turkey.onGround = shot !== 'farm';
    if (shot === 'kitchen') turkey.ducking = true; // ducking under the carving knife
    obstacles = shot === 'kitchen'
      ? [{ kind: 'oven', x: 560, passed: false, hit: false }, { kind: 'knife', x: 770, passed: false, hit: false }, { kind: 'haystack', x: 60, passed: false, hit: false }]
      : [{ kind: 'fence', x: 430, passed: false, hit: false }, { kind: 'haybale', x: 640, passed: false, hit: false }, { kind: 'knife', x: 820, passed: false, hit: false }];
    corns = [{ x: 520, y: GROUND - 110, taken: false }, { x: 730, y: GROUND - 70, taken: false }];
    if (shot === 'kitchen') popup('WHOOSH! +10', 330, GROUND - 150, '#b45309');
    draw();
  } else if (shot === 'end') {
    state = 'escaped'; score = 3120; distance = 1500; cornCount = 14; bestScore = 3120;
    draw();
  } else {
    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      draw();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
