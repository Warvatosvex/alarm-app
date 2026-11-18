window.SoundPack = (function() {
  const styles = Array.of(
    "Утренний лес и птицы","Пение соловья у ручья","Утреннее пианино","Музыкальная шкатулка",
    "Переливы арфы","Теплая маримба","Космический эмбиент","Бодрый рассвет","Лоу-фай аккорды","Хрустальные колокола",
    "⚡ Бодрый пульс (не уснёшь)","⚡ Энергичный звон пробуждения"
  );
  const scales = Array.of(
    Array.of(0,2,4,7,9,12,14,16), Array.of(0,3,5,7,10,12,15,17), Array.of(0,4,7,11,12,16,19,23),
    Array.of(0,2,4,6,7,9,11,12), Array.of(0,7,12,19,24,19,12,7), Array.of(0,5,7,12,17,19,24,12)
  );
  const roots = Array.of(261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25);

  const list = Array.from({length: 120}, (_, i) => {
    const sIdx = Math.floor(i / 10), vIdx = i % 10;
    const isWake = i >= 100;
    const sc = scales.at((i * 3 + sIdx) % scales.length);
    const notes = Array.from({length: 10}, (__, k) => sc.at((i * 7 + k * (vIdx + 2) + (k % 3)) % sc.length));
    return {
      id: "mel_" + (i + 1),
      name: (i + 1) + ". " + styles.at(sIdx) + " #" + (vIdx + 1),
      isBirds: i < 20,
      isWake: isWake,
      birdStyle: i % 5,
      wave: isWake ? "triangle" : ((sIdx % 2 === 0) ? "sine" : "triangle"),
      root: isWake ? roots.at(5 + (i % 5)) : roots.at((i * 3) % 7),
      tempo: isWake ? (135 + (vIdx % 5) * 22) : (270 + ((i * 41) % 250)),
      melody: notes
    };
  });

  let deck = [];
  function pickNonRepeatingId() {
    if (deck.length === 0) deck = list.map(m => m.id).sort(() => Math.random() - 0.5);
    return deck.pop();
  }

  let ctx = null, timer = null, customEl = null, baseVol = 50, idleTimer = null, currentId = "mel_1";
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
    currentId = id || "mel_1";
    if (id && id.startsWith("custom_") && db) {
      db.transaction("tracks", "readonly").objectStore("tracks").get(id).onsuccess = e => {
        if (e.target.result) {
          customEl = new Audio(URL.createObjectURL(e.target.result.blob));
          customEl.loop = true; customEl.volume = baseVol / 100;
          customEl.play().catch(() => playSynth("mel_1"));
        } else playSynth("mel_1");
      };
    } else playSynth(currentId);
  }

  function playBirds(tr) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = Math.max(0.1, (baseVol / 100) * 0.65);
    master.connect(ctx.destination);
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.04;
    const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 450;
    noise.connect(filter); filter.connect(master); noise.start();

    const chirp = () => {
      if (!ctx) return;
      const now = ctx.currentTime, count = 2 + Math.floor(Math.random() * 4);
      for (let c = 0; c < count; c++) {
        const t0 = now + c * 0.14, osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = "sine";
        const fStart = 1800 + tr.birdStyle * 350 + Math.random() * 1200;
        const fEnd = fStart + (Math.random() > 0.4 ? 900 : -600);
        osc.frequency.setValueAtTime(fStart, t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(800, fEnd), t0 + 0.09);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.35, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
        osc.connect(g); g.connect(master); osc.start(t0); osc.stop(t0 + 0.12);
      }
    };
    chirp(); timer = setInterval(chirp, 900 + tr.birdStyle * 220);
  }

  function playSynth(id) {
    const tr = list.find(x => x.id === id) || list.at(0);
    if (tr.isBirds) { playBirds(tr); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = Math.max(0.1, (baseVol / 100) * (tr.isWake ? 0.72 : 0.55));
    master.connect(ctx.destination);

    let step = 0;
    const tick = () => {
      if (!ctx) return;
      const now = ctx.currentTime, dur = (tr.tempo / 1000) * (tr.isWake ? 0.95 : 1.35);
      const semi = tr.melody.at(step % tr.melody.length);
      const freq = tr.root * Math.pow(1.059463, semi);
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = tr.wave;
      osc.frequency.setValueAtTime(freq, now);
      if (tr.isWake && step % 2 === 0) osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + dur * 0.7);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(tr.isWake ? 0.65 : 0.45, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g); g.connect(master); osc.start(now); osc.stop(now + dur);
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

  return { list, play, stop, onUserActivity, getCurrentId: () => currentId };
})();