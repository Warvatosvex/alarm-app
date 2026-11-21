window.SoundPack = (function() {
  const styles = [
    "Хаус-бит", "Поп-дэнс рифф", "Фанк-грув", "Ню-диско", "Тропикал-дэнс", "Электро-баунс"
  ];

  const list = Array.from({ length: 120 }, (_, i) => {
    const num = String(i + 1).padStart(3, "0");
    return {
      id: "mel_" + (i + 1),
      name: "Мелодия " + (i + 1) + " — " + styles[i % styles.length],
      file: "sounds/alarm_" + num + ".wav"
    };
  });

  function pickRandomNoRepeat() {
    const prevId = localStorage.getItem("sa_prev_played_mel") || "";
    let pool = list.filter(m => m.id !== prevId);
    if (pool.length === 0) pool = list;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    localStorage.setItem("sa_prev_played_mel", chosen.id);
    return chosen;
  }

  let audioEl = null;
  let activeBlobUrl = null;
  let isPlaying = false;
  let baseVol = 75;
  let currentTrack = list[0];

  function stop() {
    isPlaying = false;
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
    // Останавливаем любые посторонние <audio> на странице
    document.querySelectorAll("audio").forEach(el => {
      try { el.pause(); el.currentTime = 0; } catch (e) {}
    });
    if (window.AndroidLock && window.AndroidLock.setRinging) {
      window.AndroidLock.setRinging(false, baseVol, false);
    }
  }

  function startWavFile(src, isBlob) {
    stop();
    isPlaying = true;
    if (isBlob) activeBlobUrl = src;
    try {
      audioEl = document.createElement("audio");
      audioEl.src = src;
      audioEl.loop = true;
      audioEl.preload = "auto";
      audioEl.volume = Math.max(0.05, Math.min(1.0, baseVol / 100));

      audioEl.onended = function() {
        if (isPlaying && audioEl) {
          audioEl.currentTime = 0;
          audioEl.play().catch(() => {});
        }
      };

      audioEl.onerror = function() {
        if (isPlaying && src !== list[0].file) {
          startWavFile(list[0].file, false);
        }
      };

      const p = audioEl.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

  function play(id, volPercent, db, isPreview) {
    stop();
    baseVol = Math.max(10, Math.min(100, Number(volPercent || localStorage.getItem("sa_vol") || 75)));
    const hasTask = !(window.ringQueue && window.ringQueue[0] === "none");
    if (!isPreview && window.AndroidLock && window.AndroidLock.setRinging) {
      window.AndroidLock.setRinging(true, baseVol, hasTask);
    }

    if (id && typeof id === "string" && id.startsWith("mel_")) {
      const exact = list.find(x => x.id === id);
      if (exact) {
        currentTrack = exact;
        localStorage.setItem("sa_prev_played_mel", exact.id);
        startWavFile(exact.file, false);
        return currentTrack;
      }
    }

    if (id && typeof id === "string" && id.startsWith("custom_") && db) {
      currentTrack = { id: id, name: "Свой трек", file: "" };
      try {
        db.transaction("tracks", "readonly").objectStore("tracks").get(id).onsuccess = e => {
          if (e.target.result && e.target.result.blob) {
            startWavFile(URL.createObjectURL(e.target.result.blob), true);
          } else {
            currentTrack = pickRandomNoRepeat();
            startWavFile(currentTrack.file, false);
          }
        };
      } catch (e) {
        currentTrack = pickRandomNoRepeat();
        startWavFile(currentTrack.file, false);
      }
      return currentTrack;
    }

    currentTrack = pickRandomNoRepeat();
    startWavFile(currentTrack.file, false);
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