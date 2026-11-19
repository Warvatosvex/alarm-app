window.SoundPack = (function() {
  const styles = Array.of(
    "Хаус-бит","Поп-дэнс рифф","Фанк-грув","Ню-диско","Тропикал-дэнс","Электро-баунс"
  );

  const list = Array.from({length: 120}, (_, i) => {
    const num = String(i + 1).padStart(3, "0");
    return {
      id: "mel_" + (i + 1),
      name: "Мелодия " + (i + 1) + " — " + styles.at(i % styles.length),
      file: "sounds/alarm_" + num + ".wav"
    };
  });

  // Выбор случайного трека из 120 без повторения предыдущего подряд
  function pickRandomNoConsecutive() {
    const lastId = localStorage.getItem("sa_prev_played_mel") || "";
    let pool = list.filter(m => m.id !== lastId);
    if (pool.length === 0) pool = list;
    const chosen = pool.at(Math.floor(Math.random() * pool.length));
    localStorage.setItem("sa_prev_played_mel", chosen.id);
    return chosen;
  }

  let audioEl = null, baseVol = 60, currentTrack = list.at(0);

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
      currentTrack = pickRandomNoConsecutive();
    } else if (id.startsWith("mel_")) {
      currentTrack = list.find(x => x.id === id) || list.at(0);
      localStorage.setItem("sa_prev_played_mel", currentTrack.id);
    }

    if (id && id.startsWith("custom_") && db) {
      currentTrack = { id: id, name: "Своя мелодия (MP3/WAV)", file: "" };
      db.transaction("tracks", "readonly").objectStore("tracks").get(id).onsuccess = e => {
        if (e.target.result) {
          startHtmlAudio(URL.createObjectURL(e.target.result.blob));
        } else {
          currentTrack = list.at(0);
          startHtmlAudio(currentTrack.file);
        }
      };
    } else {
      startHtmlAudio(currentTrack.file);
    }
    return currentTrack;
  }

  return {
    list,
    play,
    stop,
    onUserActivity: () => {},
    getCurrentId: () => currentTrack ? currentTrack.id : "mel_1",
    getCurrentName: () => currentTrack ? currentTrack.name : "Мелодия 1"
  };
})();