// Tiny WebAudio bleeps, all generated in code. No audio files.
var GobbleAudio = (function () {
  var ctx = null;
  var muted = false;
  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, slideTo) {
    if (muted || !ensure()) return;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol || 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + dur);
  }
  return {
    setMuted: function (m) { muted = m; },
    isMuted: function () { return muted; },
    jump: function () { tone(300, 0.16, 'square', 0.07, 620); },
    gobble: function () { tone(180, 0.09, 'sawtooth', 0.09, 120); setTimeout(function () { tone(200, 0.09, 'sawtooth', 0.09, 130); }, 110); },
    corn: function () { tone(880, 0.08, 'sine', 0.1); setTimeout(function () { tone(1320, 0.12, 'sine', 0.1); }, 70); },
    hit: function () { tone(140, 0.25, 'sawtooth', 0.12, 60); },
    whoosh: function () { tone(500, 0.12, 'sine', 0.05, 1100); },
    spotted: function () { tone(990, 0.1, 'square', 0.1); setTimeout(function () { tone(990, 0.14, 'square', 0.1); }, 120); },
    fanfare: function () { var n = [523, 659, 784, 1046]; for (var i = 0; i < n.length; i++) (function (f, d) { setTimeout(function () { tone(f, 0.22, 'triangle', 0.12); }, d); })(n[i], i * 140); },
    sad: function () { var n = [392, 330, 262, 196]; for (var i = 0; i < n.length; i++) (function (f, d) { setTimeout(function () { tone(f, 0.28, 'triangle', 0.11); }, d); })(n[i], i * 180); }
  };
})();
