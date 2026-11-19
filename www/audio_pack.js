window.SoundPack = (function() {
  const styles = Array.of(
    "Утренняя маримба","Теплая калимба","Нежное электропиано","Переливы арфы","Мягкие колокольчики","Теплый синтезатор"
  );

  const list = Array.from({length: 120}, (_, i) => {
    const num = String(i + 1).padStart(3, "0");
    const st = styles.at(i % styles.length);
    return {
      id: "mel_" + (i + 1),
      name: "Мелодия " + (i + 1) + " — " + st,
      file: "sounds/alarm_" + num + ".wav"
    };
  });

  let deck = [];
  function pickNonRepeatingId() {
    if (deck.length === 0) deck = list.map(m => m.id).sort(() => Math.random() - 0.5);
    return deck.pop();
  }

  let audioEl = null, baseVol = 60, currentId = "mel_1";

  function stop() {
    if (audioEl) {
      try {
        audioEl.pause();
        audioEl.currentTime = 0;
        audioEl.removeAttribute("src");
        audioEl.load();
      } catch (e) {}
      audioEl = null;
    }
    if (window.AndroidLock && window.AndroidLock.setRinging) {
      window.AndroidLock.setRinging(false, baseVol, false);
    }
  }

  function startHtmlAudio(src) {
    stop();
    try {
      audioEl = document.createElement("audio");
      audioEl.src = src;
      audioEl.loop = true;
      audioEl.preload = "auto";
      audioEl.volume = Math.max(0.05, Math.min(1.0, baseVol / 100));
      const p = audioEl.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

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
          const tr = list.at(0);
          startHtmlAudio(tr.file);
        }
      };
    } else {
      const tr = list.find(x => x.id === currentId) || list.at(0);
      startHtmlAudio(tr.file);
    }
  }

  return { list, play, stop, onUserActivity: () => {}, getCurrentId: () => currentId };
})();