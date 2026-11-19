window.SoundPack = (function() {
  const styles = Array.of(
    "Утренняя маримба","Теплая калимба","Нежное электропиано","Переливы арфы","Мягкие колокольчики","Теплый синтезатор",
    "Солнечная маримба","Лесная калимба","Рассветное пиано","Воздушная арфа","Утренний перезвон","Гармония утра",
    "Свежий бриз","Капли росы","Мягкий аккорд","Светлый день","Уютное утро","Легкий ритм","Теплый свет","Ясный рассвет"
  );

  const list = Array.from({length: 120}, (_, i) => {
    const num = String(i + 1).padStart(3, "0");
    const st = styles.at(i % styles.length);
    return {
      id: "mel_" + (i + 1),
      name: (i + 1) + ". " + st + " (#" + num + ")",
      file: "sounds/alarm_" + num + ".wav"
    };
  });

  let deck = [];
  function pickNonRepeatingId() {
    if (deck.length === 0) deck = list.map(m => m.id).sort(() => Math.random() - 0.5);
    return deck.pop();
  }

  let audioEl = null, baseVol = 60, currentId = "mel_1";

  function play(id, volPercent, db, isPreview) {
    stop();
    baseVol = Number(volPercent || localStorage.getItem("sa_vol") || 60);
    const hasTask = !(window.ringQueue && window.ringQueue.at(0) === "none");
    if (!isPreview && window.AndroidLock && window.AndroidLock.setRinging) {
      window.AndroidLock.setRinging(true, baseVol, hasTask);
    }

    if (!id || id === "random" || (!id.startsWith("mel_") && !id.startsWith("custom_"))) {
      id = pickNonRepeatingId();
    }
    currentId = id;

    if (id.startsWith("custom_") && db) {
      db.transaction("tracks", "readonly").objectStore("tracks").get(id).onsuccess = e => {
        if (e.target.result) {
          startHtmlAudio(URL.createObjectURL(e.target.result.blob));
        } else {
          playWavById("mel_1");
        }
      };
    } else {
      playWavById(currentId);
    }
  }

  function playWavById(id) {
    const tr = list.find(x => x.id === id) || list.at(0);
    startHtmlAudio(tr.file);
  }

  function startHtmlAudio(src) {
    try {
      const Ctor = window.OrigAudio || window.Audio;
      audioEl = new Ctor(src);
      audioEl.loop = true;
      audioEl.volume = Math.max(0.05, Math.min(1.0, baseVol / 100));
      audioEl.play().catch(() => {});
    } catch (e) {}
  }

  function stop() {
    if (audioEl) {
      try { audioEl.pause(); audioEl.currentTime = 0; } catch (e) {}
      audioEl = null;
    }
    if (window.AndroidLock && window.AndroidLock.setRinging) {
      window.AndroidLock.setRinging(false, baseVol, false);
    }
  }

  return { list, play, stop, onUserActivity: () => {}, getCurrentId: () => currentId };
})();