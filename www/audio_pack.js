window.SoundPack = (function() {
  const styles = Array.of(
    "Утреннее пианино","Теплая маримба","Переливы арфы","Свежий рассвет","Мягкий ритм утра",
    "Лоу-фай гармония","Солнечный день","Бодрый позитив","Нежные клавиши","Утренний бриз",
    "Акустический уют","Ясное утро"
  );
  const roots = Array.of(220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00);
  const scales = Array.of(
    Array.of(0, 4, 7, 12, 14, 12, 7, 4), Array.of(0, 2, 4, 7, 9, 12, 9, 7),
    Array.of(0, 4, 7, 9, 12, 9, 7, 4), Array.of(0, 5, 7, 12, 14, 12, 7, 5),
    Array.of(0, 3, 7, 10, 12, 10, 7, 3), Array.of(4, 7, 12, 16, 14, 12, 7, 4)
  );

  const list = Array.from({length: 120}, (_, i) => {
    const sIdx = Math.floor(i / 10), vIdx = i % 10;
    const sc = scales.at((i * 3 + sIdx) % scales.length);
    const pattern = Array.from({length: 8}, (__, k) => sc.at((i * 5 + k * (vIdx + 1)) % sc.length));
    return {
      id: "mel_" + (i + 1),
      name: (i + 1) + ". " + styles.at(sIdx) + " #" + (vIdx + 1),
      root: roots.at((i * 2 + sIdx) % roots.length),
      pattern: pattern,
      tempo: 340 + ((i * 29) % 140)
    };
  });

  let deck = [];
  function pickNonRepeatingId() {
    if (deck.length === 0) deck = list.map(m => m.id).sort(() => Math.random() - 0.5);
    return deck.pop();
  }

  let ctx = null, timer = null, customEl = null, baseVol = 55, currentId = "mel_1";
  function onUserActivity() {}

  function play(id, volPercent, db, isPreview) {
    stop();
    baseVol = Number(volPercent || localStorage.getItem("sa_vol") || 55);
    const hasTask = !(window.ringQueue && window.ringQueue.at(0) === "none");
    if (!isPreview && window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(true, baseVol, hasTask);
    if (!id || id === "random" || id.startsWith("calm_")) id = pickNonRepeatingId();
    currentId = id;

    if (id && id.startsWith("custom_") && db) {
      db.transaction("tracks", "readonly").objectStore("tracks").get(id).onsuccess = e => {
        if (e.target.result) {
          customEl = new Audio(URL.createObjectURL(e.target.result.blob));
          customEl.loop = true; customEl.volume = baseVol / 100;
          customEl.play().catch(() => playMelody("mel_1"));
        } else playMelody("mel_1");
      };
    } else playMelody(currentId);
  }

  function playMelody(id) {
    const tr = list.find(x => x.id === id) || list.at(0);
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const lpf = ctx.createBiquadFilter(); lpf.type = "lowpass"; lpf.frequency.value = 850;
    const master = ctx.createGain(); master.gain.value = Math.max(0.08, (baseVol / 100) * 0.5);
    lpf.connect(master); master.connect(ctx.destination);

    let step = 0;
    const tick = () => {
      if (!ctx) return;
      const now = ctx.currentTime, dur = (tr.tempo / 1000) * 1.3;
      const semi = tr.pattern.at(step % tr.pattern.length);
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(tr.root * Math.pow(1.059463, semi), now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.45, now + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g); g.connect(lpf);
      osc.start(now); osc.stop(now + dur);
      step++;
    };
    tick(); timer = setInterval(tick, tr.tempo);
  }

  function stop() {
    clearInterval(timer); timer = null;
    if (ctx) { ctx.close().catch(()=>{}); ctx = null; }
    if (customEl) { customEl.pause(); customEl = null; }
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, baseVol, false);
  }

  return { list, play, stop, onUserActivity, getCurrentId: () => currentId };
})();