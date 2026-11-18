window.SoundPack = (function() {
  const styles = Array.of(
    "Утренний лес и птицы","Пение соловья у ручья","Утреннее пианино","Музыкальная шкатулка",
    "Переливы арфы","Теплая маримба","Космический эмбиент","Бодрый рассвет","Лоу-фай аккорды","Хрустальные колокола"
  );
  const scales = Array.of(
    Array.of(0,2,4,7,9,12,14,16), Array.of(0,3,5,7,10,12,15,17), Array.of(0,4,7,11,12,16,19,23),
    Array.of(0,2,4,6,7,9,11,12), Array.of(0,3,7,8,12,15,19,20), Array.of(0,5,7,10,12,17,19,22)
  );
  const roots = Array.of(261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 277.18, 311.13, 369.99);

  const list = Array.from({length: 100}, (_, i) => {
    const sIdx = Math.floor(i / 10), vIdx = i % 10;
    const sc = scales.at((i * 3 + sIdx) % scales.length);
    const notes = Array.from({length: 10}, (__, k) => sc.at((i * 7 + k * (vIdx + 2) + (k % 3)) % sc.length));
    return {
      id: "mel_" + (i + 1),
      name: (i + 1) + ". " + styles.at(sIdx) + " #" + (vIdx + 1),
      isBirds: i < 20,
      birdStyle: i % 5,
      wave: (sIdx % 2 === 0) ? "sine" : "triangle",
      root: roots.at((i * 3) % roots.length),
      tempo: 270 + ((i * 41) % 250),
      melody: notes
    };
  });

  // Умная колода без повторов для рандомного режима
  let deck = [];
  function pickNonRepeatingId() {
    if (deck.length === 0) {
      deck = list.map(m => m.id).sort(() => Math.random() - 0.5);
    }
    return deck.pop();
  }

  let ctx = null, timer = null, customEl = null, baseVol = 50, idleTimer = null;
  function setV(v) { if (window.AndroidLock && window.AndroidLock.setVolume) window.AndroidLock.setVolume(v); }
  function onUserActivity() {
    if (baseVol >= 80) setV(baseVol - 10);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => setV(baseVol), 6000);
  }

  function play(id, volPercent, db, isPreview) {
    stop();
    baseVol = Number(volPercent || localStorage.getItem("sa_vol") || 50);
    const hasTask = !(window.ringQueue && window.ringQueue.at(0) === "none");
    if (!isPreview && window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(true, baseVol, hasTask);
    if (id === "random" || localStorage.getItem("sa_global_random") === "1") id = pickNonRepeatingId();
    if (id && id.startsWith("custom_") && db) {
      db.transaction("tracks", "readonly").objectStore("tracks").get(id).onsuccess = e => {
        if (e.target.result) {
          customEl = new Audio(URL.createObjectURL(e.target.result.blob));
          customEl.loop = true; customEl.volume = baseVol / 100;
          customEl.play().catch(() => playSynth("mel_1"));
        } else playSynth("mel_1");
      };
    } else playSynth(id || "mel_1");
  }

  function playBirds(tr) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = Math.max(0.1, (baseVol / 100) * 0.65);
    master.connect(ctx.destination);

    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.04;
    const noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 450;
    noise.connect(filter); filter.connect(master);
    noise.start();

    const chirp = () => {
      if (!ctx) return;
      const now = ctx.currentTime, count = 2 + Math.floor(Math.random() * 4);
      for (let c = 0; c < count; c++) {
        const t0 = now + c * 0.14;
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = "sine";
        const fStart = 1800 + tr.birdStyle * 350 + Math.random() * 1200;
        const fEnd = fStart + (Math.random() > 0.4 ? 900 : -600);
        osc.frequency.setValueAtTime(fStart, t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(800, fEnd), t0 + 0.09);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.35, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
        osc.connect(g); g.connect(master);
        osc.start(t0); osc.stop(t0 + 0.12);
      }
    };
    chirp();
    timer = setInterval(chirp, 900 + tr.birdStyle * 220);
  }

  function playSynth(id) {
    const tr = list.find(x => x.id === id) || list.at(0);
    if (tr.isBirds) { playBirds(tr); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const delay = ctx.createDelay(); delay.delayTime.value = 0.26;
    const fb = ctx.createGain(); fb.gain.value = 0.28;
    const master = ctx.createGain(); master.gain.value = Math.max(0.08, (baseVol / 100) * 0.55);
    delay.connect(fb); fb.connect(delay); delay.connect(master); master.connect(ctx.destination);

    let step = 0;
    const tick = () => {
      if (!ctx) return;
      const now = ctx.currentTime, dur = (tr.tempo / 1000) * 1.35;
      const semi = tr.melody.at(step % tr.melody.length);
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = tr.wave;
      osc.frequency.setValueAtTime(tr.root * Math.pow(1.059463, semi), now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.45, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g); g.connect(master); g.connect(delay);
      osc.start(now); osc.stop(now + dur);
      step++;
    };
    tick(); timer = setInterval(tick, tr.tempo);
  }

  function stop() {
    clearInterval(timer); clearTimeout(idleTimer); timer = null;
    if (ctx) { ctx.close().catch(()=>{}); ctx = null; }
    if (customEl) { customEl.pause(); customEl = null; }
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, baseVol, false);
  }

  return { list, play, stop, onUserActivity };
})();