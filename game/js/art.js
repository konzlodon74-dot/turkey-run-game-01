// All artwork is drawn with canvas shapes. Autumn palette: oranges, browns, cream.
function drawTurkey(ctx, x, y, scale, runPhase, ducking) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (ducking) ctx.scale(1.15, 0.72);
  // tail fan
  var fanCols = ['#b45309', '#d97706', '#92400e', '#ea580c', '#78350f'];
  for (var i = 0; i < 5; i++) {
    var a = -0.9 + i * 0.42;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = fanCols[i];
    ctx.beginPath();
    ctx.ellipse(-26, -34, 9, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // body
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath(); ctx.ellipse(0, -22, 30, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a06a33';
  ctx.beginPath(); ctx.ellipse(4, -26, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
  // wing
  ctx.fillStyle = '#6b4423';
  ctx.beginPath(); ctx.ellipse(-2, -20, 15, 9, -0.5, 0, Math.PI * 2); ctx.fill();
  // neck + head
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(22, -30); ctx.lineTo(34, -48); ctx.stroke();
  ctx.fillStyle = '#9c6b3a';
  ctx.beginPath(); ctx.arc(37, -52, 10, 0, Math.PI * 2); ctx.fill();
  // beak + wattle
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.moveTo(45, -54); ctx.lineTo(58, -50); ctx.lineTo(45, -46); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#dc2626';
  ctx.beginPath(); ctx.ellipse(43, -41, 4, 8, 0.3, 0, Math.PI * 2); ctx.fill();
  // eye (determined!)
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(40, -55, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c0f05'; ctx.beginPath(); ctx.arc(41.5, -55, 2.4, 0, Math.PI * 2); ctx.fill();
  // legs
  ctx.strokeStyle = '#d97706'; ctx.lineWidth = 4;
  var lp = Math.sin(runPhase) * 10;
  ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(-6 + lp, 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(8 - lp, 8); ctx.stroke();
  ctx.restore();
}

function drawFarmer(ctx, x, y, scale, runPhase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // legs (overalls)
  ctx.strokeStyle = '#31517d'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  var lp = Math.sin(runPhase) * 12;
  ctx.beginPath(); ctx.moveTo(-4, -38); ctx.lineTo(-4 + lp, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -38); ctx.lineTo(8 - lp, -2); ctx.stroke();
  // boots
  ctx.fillStyle = '#3f2a16';
  ctx.fillRect(-12 + lp, -6, 16, 6); ctx.fillRect(0 - lp, -6, 16, 6);
  // torso: plaid shirt + overalls bib
  ctx.fillStyle = '#b91c1c'; ctx.fillRect(-16, -78, 34, 42);
  ctx.fillStyle = '#31517d'; ctx.fillRect(-11, -66, 24, 30);
  ctx.fillStyle = '#fbbf24'; ctx.fillRect(-9, -62, 4, 4); ctx.fillRect(8, -62, 4, 4);
  // arm reaching out to grab
  ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(14, -70); ctx.lineTo(38, -58 + Math.sin(runPhase * 2) * 3); ctx.stroke();
  ctx.fillStyle = '#f2c49b'; ctx.beginPath(); ctx.arc(41, -57 + Math.sin(runPhase * 2) * 3, 6, 0, Math.PI * 2); ctx.fill();
  // head + hat
  ctx.fillStyle = '#f2c49b'; ctx.beginPath(); ctx.arc(2, -90, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7c4a1e'; ctx.fillRect(-14, -102, 32, 6); ctx.fillRect(-8, -114, 20, 12);
  // eyes locked on turkey + open mouth
  ctx.fillStyle = '#1c0f05';
  ctx.beginPath(); ctx.arc(7, -92, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(13, -92, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.ellipse(10, -83, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawObstacle(ctx, o, groundY) {
  ctx.save();
  ctx.translate(o.x, groundY);
  if (o.kind === 'fence') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(2, -52, 8, 52); ctx.fillRect(30, -52, 8, 52);
    ctx.fillStyle = '#a06a33'; ctx.fillRect(-2, -46, 44, 8); ctx.fillRect(-2, -28, 44, 8);
  } else if (o.kind === 'haybale') {
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(22, -20, 21, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(22, -20, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(22, -20, 6, 0, Math.PI * 2); ctx.stroke();
  } else if (o.kind === 'crate') {
    ctx.fillStyle = '#b5793a'; ctx.fillRect(0, -44, 44, 44);
    ctx.strokeStyle = '#7a4a21'; ctx.lineWidth = 4; ctx.strokeRect(2, -42, 40, 40);
    ctx.beginPath(); ctx.moveTo(2, -42); ctx.lineTo(42, -2); ctx.moveTo(42, -42); ctx.lineTo(2, -2); ctx.stroke();
  } else if (o.kind === 'oven') {
    ctx.fillStyle = '#4b5563'; ctx.fillRect(0, -72, 58, 72);
    ctx.fillStyle = '#1f2937'; ctx.fillRect(6, -58, 46, 34);
    ctx.fillStyle = '#f97316'; ctx.fillRect(10, -50, 38, 18);
    ctx.fillStyle = '#facc15'; ctx.fillRect(14, -46, 30, 8);
    ctx.fillStyle = '#d1d5db';
    for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(10 + i * 13, -66, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#9ca3af'; ctx.fillRect(6, -20, 46, 5);
  } else if (o.kind === 'knife') {
    // carving knife flying at head height: duck!
    ctx.translate(0, -62);
    ctx.rotate(Math.sin(o.x * 0.05) * 0.15);
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(52, -6); ctx.lineTo(58, 0); ctx.lineTo(52, 6); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7c4a1e'; ctx.fillRect(-22, -4, 22, 9);
  } else if (o.kind === 'haystack') {
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(28, -86, 62, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3;
    for (var j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(6 + j * 14, -6); ctx.quadraticCurveTo(28, -60 + j * 6, 50 - j * 8, -6); ctx.stroke(); }
    ctx.fillStyle = '#713f12'; ctx.font = 'bold 12px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('HIDE ↓', 28, -88);
  }
  ctx.restore();
}

function drawCorn(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 4 + x) * 3);
  ctx.rotate(0.5);
  ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 1.5;
  for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 3, -13); ctx.lineTo(i * 3, 13); ctx.stroke(); }
  ctx.fillStyle = '#65a30d';
  ctx.beginPath(); ctx.moveTo(-4, 12); ctx.quadraticCurveTo(-14, 20, -6, 24); ctx.quadraticCurveTo(0, 18, 0, 12); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(4, 12); ctx.quadraticCurveTo(14, 20, 6, 24); ctx.quadraticCurveTo(0, 18, 0, 12); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawFeather(ctx, x, y, alive) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.6);
  ctx.fillStyle = alive ? '#d97706' : 'rgba(120,90,60,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 0, 7, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = alive ? '#92400e' : 'rgba(120,90,60,0.4)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 16); ctx.stroke();
  ctx.restore();
}
