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

  function pickRandomNoConsecutive() {
    const lastId = localStorage.getItem("sa_prev_played_mel") || "";
    let pool = list.filter(m => m.id !== lastId);
    if (pool.length === 0) pool = list;
    const chosen = pool.at(Math.floor(Math.random() * pool.length));
    localStorage.setItem("sa_prev_played_mel", chosen.id);
    return chosen;
  }

  let audioEl = null, activeBlobUrl = null, baseVol = 60, currentTrack = list.at(0), isShouldPlay = false;

  function stop() {
    isShouldPlay = false;
    if (audioEl) {
      try {
        audioEl.onended = null;
        audioEl.onerror = null;
        audioEl.pause();
        audioEl.currentTime = 0;
        audioEl.removeAttribute("src");
        audioEl.load();
      } catch (e) {}
      audioEl = null;
    }
    if (activeBlobUrl) {
      try { URL.revokeObjectURL(activeBlobUrl); } catch (e) {}
      activeBlobUrl = null;
    }
    if (window.AndroidLock && window.AndroidLock.setRinging) {
      window.AndroidLock.setRinging(false, baseVol, false);
    }
  }

  function startHtmlAudio(src, isBlob) {
    stop();
    isShouldPlay = true;
    if (isBlob) activeBlobUrl = src;
    try {
      audioEl = document.createElement("audio");
      audioEl.src = src;
      audioEl.loop = true;
      audioEl.preload = "auto";
      audioEl.volume = Math.max(0.05, Math.min(1.0, baseVol / 100));

      // Двойная гарантия зацикливания до момента явной остановки
      audioEl.onended = function() {
        if (isShouldPlay && audioEl) {
          audioEl.currentTime = 0;
          audioEl.play().catch(() => {});
        }
      };
      audioEl.onerror = function() {
        if (isShouldPlay && src !== list.at(0).file) {
          startHtmlAudio(list.at(0).file, false);
        }
      };

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

    // Если передан конкретный ID мелодии (mel_1 .. mel_120) — играем строго её
    if (id && typeof id === "string" && id.startsWith("mel_")) {
      const exact = list.find(x => x.id === id);
      if (exact) {
        currentTrack = exact;
        localStorage.setItem("sa_prev_played_mel", exact.id);
        startHtmlAudio(exact.file, false);
        return currentTrack;
      }
    }

    // Пользовательский файл из IndexedDB
    if (id && typeof id === "string" && id.startsWith("custom_") && db) {
      currentTrack = { id: id, name: "Своя мелодия (MP3/WAV)", file: "" };
      try {
        db.transaction("tracks", "readonly").objectStore("tracks").get(id).onsuccess = e => {
          if (e.target.result && e.target.result.blob) {
            startHtmlAudio(URL.createObjectURL(e.target.result.blob), true);
          } else {
            currentTrack = list.at(0);
            startHtmlAudio(currentTrack.file, false);
          }
        };
      } catch (err) {
        currentTrack = list.at(0);
        startHtmlAudio(currentTrack.file, false);
      }
      return currentTrack;
    }

    // Режим "random" или пустое значение — случайная без повтора предыдущей подряд
    currentTrack = pickRandomNoConsecutive();
    startHtmlAudio(currentTrack.file, false);
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