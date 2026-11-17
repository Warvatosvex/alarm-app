window.SoundPack = (function() {
  const styles = Array.of("Утреннее пианино","Теплая маримба","Переливы арфы","Хрустальные колокольчики","Акустическая гитара","Лоу-фай аккорды","Природа и ветер","Космический эмбиент","Музыкальная шкатулка","Бодрый позитив");
  const waves = Array.of("sine","triangle","sine","sine","triangle","triangle","sine","sine","sine","triangle");
  const notes = Array.of(0, 4, 7, 12, 7, 4);
  const list = Array.from({length: 100}, (_, i) => ({
    id: "mel_" + (i + 1),
    name: (i + 1) + ". " + styles.at(Math.floor(i / 10)) + " #" + ((i % 10) + 1),
    wave: waves.at(Math.floor(i / 10)),
    baseFreq: 261.63 * Math.pow(1.059463, (i % 12)) * (i % 3 === 0 ? 1 : 1.25),
    tempo: 260 + (i % 7) * 45,
    stepPattern: notes.map(n => n + (i % 5))
  }));
  let ctx = null, timer = null, customEl = null, baseVol = 50, idleTimer = null;
  function setV(v) { if (window.AndroidLock && window.AndroidLock.setVolume) window.AndroidLock.setVolume(v); }
  function onUserActivity() {
    if (baseVol >= 80) setV(baseVol - 10);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => setV(baseVol), 6000);
  }
  function play(id, volPercent, db) {
    stop();
    baseVol = Number(volPercent || localStorage.getItem("sa_vol") || 50);
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(true, baseVol);
    if (id === "random" || localStorage.getItem("sa_global_random") === "1") id = list.at(Math.floor(Math.random() * list.length)).id;
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
  function playSynth(id) {
    const tr = list.find(x => x.id === id) || list.at(0);
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    let step = 0;
    const tick = () => {
      if (!ctx) return;
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = tr.wave;
      const semi = tr.stepPattern.at(step % tr.stepPattern.length);
      osc.frequency.setValueAtTime(tr.baseFreq * Math.pow(1.059463, semi), ctx.currentTime);
      const gl = Math.max(0.05, (baseVol / 100) * 0.45);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(gl, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (tr.tempo / 1000) * 0.9);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + (tr.tempo / 1000));
      step++;
    };
    tick(); timer = setInterval(tick, tr.tempo);
  }
  function stop() {
    clearInterval(timer); clearTimeout(idleTimer); timer = null;
    if (ctx) { ctx.close().catch(()=>{}); ctx = null; }
    if (customEl) { customEl.pause(); customEl = null; }
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, baseVol);
  }
  return { list, play, stop, onUserActivity };
})();