(function() {
  for (let i = 1; i < 9999; i++) { try { clearInterval(i); } catch (e) {} }

  const DAYS_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  let alarms = [];

  function loadAlarmsFromStorage() {
    const keys = ["sa_alarms_v3", "sa_alarms_v2", "sa_alarms", "alarms"];
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(x => x && typeof x.time === "string");
        }
      } catch (e) {}
    }
    return [];
  }

  function saveAlarmsToStorage(list) {
    const src = Array.isArray(list) ? list : alarms;
    const cleanList = src.map(item => ({
      id: Number(item.id) || Date.now(),
      time: String(item.time || "07:30"),
      label: String(item.label || "Утренний будильник"),
      days: Array.isArray(item.days) ? item.days.map(Number) : [],
      sound: String(item.sound || "random"),
      vol: Math.max(10, Math.min(100, Number(item.vol) || 75)),
      taskMode: String(item.taskMode || "random"),
      taskSingleId: Math.max(1, Math.min(25, Number(item.taskSingleId) || 1)),
      taskRndCnt: Math.max(1, Math.min(25, Number(item.taskRndCnt) || 2)),
      taskQueue: Array.isArray(item.taskQueue) ? item.taskQueue.map(Number) : [],
      taskDiff: Math.max(1, Math.min(10, Number(item.taskDiff) || 5)),
      enabled: Boolean(item.enabled)
    }));

    alarms = cleanList;
    const json = JSON.stringify(cleanList);
    localStorage.setItem("sa_alarms_v3", json);
    localStorage.setItem("sa_alarms_v2", json);
    localStorage.setItem("sa_alarms", json);
    localStorage.setItem("alarms", json);

    if (typeof window.pushExactAlarmSchedule === "function") {
      try { window.pushExactAlarmSchedule(); } catch (e) {}
    }
    return cleanList;
  }

  alarms = loadAlarmsFromStorage();
  if (alarms.length === 0) {
    alarms = [{
      id: 1, time: "07:30", label: "Утренний будильник", days:,
      sound: "random", vol: 75, taskMode: "random", taskSingleId: 1, taskRndCnt: 2,
      taskQueue: [], taskDiff: 5, enabled: true
    }];
    saveAlarmsToStorage(alarms);
  }

  function updateStaticStatusLine() {
    const bar = document.getElementById("statusBar");
    if (!bar) return;
    const active = alarms.filter(a => a && a.enabled);
    if (active.length === 0) { bar.textContent = "Нет активных будильников"; return; }
    const sorted = active.map(a => a.time).sort();
    bar.textContent = `Активных будильников: ${active.length} • Ближайший: ${sorted.at(0)}`;
  }

  function renderAlarmsList() {
    const host = document.getElementById("alarmsList");
    if (!host) return;
    host.innerHTML = "";
    alarms.forEach(a => {
      const daysArr = Array.isArray(a.days) ? a.days : [];
      const daysText = daysArr.length === 7 ? "Каждый день" : (!daysArr.length ? "Однократно" : daysArr.map(d => DAYS_SHORT.at(d)).join(", "));
      const taskText = a.taskMode === "none" ? "0 заданий" : (a.taskMode === "single" ? `Задача №${a.taskSingleId}` : "25 задач");
      const card = document.createElement("div");
      card.className = "card alarm-card";
      card.style.cssText = "display:flex;align-items:center;justify-content:space-between;cursor:pointer;margin-bottom:10px;";
      card.innerHTML = `
        <div style="flex:1;min-width:0;">
          <div class="card-time" style="font-variant-numeric:tabular-nums;">${a.time}</div>
          <div class="card-sub">${a.label} • ${daysText}</div>
          <span class="tag">${taskText} • Сложность ${a.taskDiff || 5}/10</span>
        </div>
        <label class="switch" style="flex-shrink:0;margin-left:12px;">
          <input type="checkbox" ${a.enabled ? "checked" : ""}><span class="slider"></span>
        </label>`;
      card.onclick = e => {
        if (e.target.closest("label.switch") || e.target.tagName === "INPUT") return;
        window.openCleanAlarmEditor(a);
      };
      card.querySelector("input[type='checkbox']").onchange = e => {
        a.enabled = e.target.checked; saveAlarmsToStorage(alarms); updateStaticStatusLine();
      };
      host.appendChild(card);
    });
    updateStaticStatusLine();
  }
    const sndEl = document.getElementById("ccSndSel");
    if (sndEl) sndEl.value = snd;

    m.querySelectorAll(".cc-day-btn").forEach(b => b.onclick = () => {
      const d = Number(b.dataset.d), p = selDays.indexOf(d);
      if (p >= 0) selDays.splice(p, 1); else selDays.push(d);
      const on = selDays.includes(d);
      b.style.borderColor = on ? "#10b981" : "#2a2e3d"; b.style.background = on ? "#065f46" : "#1f222e";
    });

    const mSel = document.getElementById("ccModeSel");
    const initDWrap = document.getElementById("ccDiffRng")?.parentElement;
    if (initDWrap) initDWrap.style.display = mSel.value === "none" ? "none" : "block";
    const initDWrap = document.getElementById("ccDiffRng")?.parentElement;
    if (initDWrap) initDWrap.style.display = mSel.value === "none" ? "none" : "block";
    mSel.onchange = () => {
      document.getElementById("ccSingleRow").style.display = mSel.value === "single" ? "block" : "none";
      document.getElementById("ccRndRow").style.display = mSel.value === "random" ? "flex" : "none";
      document.getElementById("ccCustomRow").style.display = mSel.value === "custom" ? "block" : "none";
      const dWrap = document.getElementById("ccDiffRng")?.parentElement;
      if (dWrap) dWrap.style.display = mSel.value === "none" ? "none" : "block";
      const dWrap = document.getElementById("ccDiffRng")?.parentElement;
      if (dWrap) dWrap.style.display = mSel.value === "none" ? "none" : "block";
    };

    document.getElementById("ccAll25Btn").onclick = () => { document.getElementById("ccRndCntIn").value = "25"; };
    document.getElementById("ccOpenQBtn").onclick = () => {
      if (window.openProfileQueueModal) {
        window.saveProfile15Config("alarm", { queue: customQueue, mode: "custom" });
        window.openProfileQueueModal("alarm", () => {
          customQueue = Array.from(window.getProfile15Config("alarm").queue);
          document.getElementById("ccOpenQBtn").innerText = `🛠️ Настроить очередь (${customQueue.length})`;
        });
      }
    };

    document.getElementById("ccDiffRng").oninput = e => { document.getElementById("ccDiffLbl").innerText = diffTxt(Number(e.target.value)); };
    document.getElementById("ccVolRng").oninput = e => { document.getElementById("ccVolLbl").innerText = e.target.value + "%"; };
    document.getElementById("ccRndSndBtn").onclick = () => { if (sndEl) sndEl.value = "random"; };

    let pl = false;
    document.getElementById("ccPrvSndBtn").onclick = e => {
      pl = !pl;
      if (pl && window.SoundPack) { window.SoundPack.play(sndEl.value, Number(document.getElementById("ccVolRng").value), window.db || null, true); e.target.innerText = "⏹ Стоп"; }
      else { if (window.SoundPack) window.SoundPack.stop(); e.target.innerText = "▶️ Слушать"; }
    };

    const close = () => { if (window.SoundPack) window.SoundPack.stop(); m.remove(); };
    document.getElementById("ccCloseBtn").onclick = close;
    document.getElementById("ccCancelBtn").onclick = close;

    document.getElementById("ccSaveBtn").onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      if (window.SoundPack) window.SoundPack.stop();

      const getV = (id, def) => { const el = document.getElementById(id); return el && el.value !== "" ? el.value : def; };
      const record = {
        id: editId || Date.now(),
        time: getV("ccTimeIn", "07:30"),
        label: String(getV("ccLabelIn", "Утренний будильник")).trim() || "Утренний будильник",
        days: Array.from(selDays),
        sound: getV("ccSndSel", "random"),
        vol: Math.max(10, Math.min(100, Number(getV("ccVolRng", 75)) || 75)),
        taskMode: getV("ccModeSel", "random"),
        taskSingleId: Math.max(1, Math.min(25, Number(getV("ccSingleSel", 1)) || 1)),
        taskRndCnt: Math.max(1, Math.min(25, Number(getV("ccRndCntIn", 2)) || 2)),
        taskQueue: Array.from(customQueue),
        taskDiff: Math.max(1, Math.min(10, Number(getV("ccDiffRng", 5)) || 5)),
        enabled: true
      };

      const idx = editId ? alarms.findIndex(x => Number(x.id) === editId) : -1;
      if (idx >= 0) alarms[idx] = record;
      else alarms.push(record);

      saveAlarmsToStorage(alarms);
      m.remove();
      renderAlarmsList();
    };

    const del = document.getElementById("ccDeleteBtn");
    if (del) {
      del.onclick = () => {
        if (window.SoundPack) window.SoundPack.stop();
        alarms = alarms.filter(x => Number(x.id) !== editId);
        saveAlarmsToStorage(alarms);
        m.remove();
        renderAlarmsList();
      };
    }
  };

  window.openEditSpecificAlarmModal = obj => window.openCleanAlarmEditor(obj);
  window.renderAlarms = renderAlarmsList;

  let lastMinuteKey = "";
  setInterval(() => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    const hhmm = timeStr.slice(0, 5);
    const clockEl = document.getElementById("clock") || document.getElementById("liveClock") || document.querySelector(".clock");
    if (clockEl && clockEl.textContent !== timeStr) clockEl.textContent = timeStr;

    const mKey = now.toDateString() + "_" + hhmm;
    if (now.getSeconds() === 0 && lastMinuteKey !== mKey) {
      const dow = now.getDay();
      const hit = alarms.find(a => a && a.enabled && a.time === hhmm && (!a.days.length || a.days.includes(dow)));
      if (hit) {
        lastMinuteKey = mKey;
        if (!hit.days.length) { hit.enabled = false; saveAlarmsToStorage(alarms); renderAlarmsList(); }
        if (typeof window.launchLockedTasksOverLockscreen === "function") {
          window.launchLockedTasksOverLockscreen({
            title: "⏰ БУДИЛЬНИК", label: hit.label, timeKey: hit.time, sound: hit.sound, vol: hit.vol,
            taskMode: hit.taskMode, taskSingleId: hit.taskSingleId, taskRndCnt: hit.taskRndCnt, taskQueue: hit.taskQueue, taskDiff: hit.taskDiff
          });
        }
      }
    }
  }, 1000);

  renderAlarmsList();
})();
(function linkCleanCoreToNativeAlarmManager() {
  window.pushExactAlarmSchedule = function() {
    if (!window.AndroidLock || !window.AndroidLock.scheduleNextAlarmWithData) return;
    let list = [];
    try { list = JSON.parse(localStorage.getItem("sa_alarms_v3") || localStorage.getItem("sa_alarms") || "[]"); } catch (e) {}

    const now = new Date();
    let bestTs = 0, bestAlarm = null;

    list.filter(a => a && a.enabled).forEach(a => {
      const [hh, mm] = String(a.time || "07:30").split(":").map(Number);
      const days = Array.isArray(a.days) ? a.days : [];
      for (let d = 0; d <= 7; d++) {
        const cand = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hh, mm, 0, 0);
        if (cand.getTime() > now.getTime() && (days.length === 0 || days.includes(cand.getDay()))) {
          if (bestTs === 0 || cand.getTime() < bestTs) { bestTs = cand.getTime(); bestAlarm = a; }
          break;
        }
      }
    });

    if (bestTs > 0 && bestAlarm) {
      if (window.AndroidLock.canDrawOverlays && !window.AndroidLock.canDrawOverlays()) {
        window.AndroidLock.requestOverlayPermission();
      }
      const payload = {
        alarmId: bestAlarm.id || 1,
        timeKey: bestAlarm.time,
        title: "⏰ БУДИЛЬНИК",
        label: bestAlarm.label || "Утренний будильник",
        sound: bestAlarm.sound || "random",
        vol: Number(bestAlarm.vol) || 75,
        taskMode: bestAlarm.taskMode || "random",
        taskSingleId: Number(bestAlarm.taskSingleId) || 1,
        taskRndCnt: Number(bestAlarm.taskRndCnt) || 2,
        taskQueue: Array.isArray(bestAlarm.taskQueue) ? bestAlarm.taskQueue : [],
        taskDiff: Number(bestAlarm.taskDiff) || 5
      };
      window.AndroidLock.scheduleNextAlarmWithData(bestTs, JSON.stringify(payload));
    } else {
      window.AndroidLock.scheduleNextAlarmWithData(0, "{}");
    }
  };

  setTimeout(() => { if (window.pushExactAlarmSchedule) window.pushExactAlarmSchedule(); }, 400);
})();
(function ensureZeroTaskLockscreenWake() {
  // Единый обработчик пробуждения из Android (как для 0 заданий, так и для >= 1 задания)
  window.onNativeWake = function(d) {
    d = d || {};
    const mode = d.taskMode || "random";
    const vol = Math.max(10, Math.min(100, Number(d.vol) || 75));
    const snd = d.sound || "random";
    const title = d.title || "⏰ БУДИЛЬНИК";
    const label = d.label || "Утренний будильник";

    if (mode === "none") {
      if (typeof window.showFullLockScreenZeroAlarm === "function") {
        window.showFullLockScreenZeroAlarm(title, label, snd, vol, d.timeKey || "");
      }
    } else if (typeof window.launchLockedTasksOverLockscreen === "function") {
      window.launchLockedTasksOverLockscreen(d);
    }
    if (typeof window.pushExactAlarmSchedule === "function") {
      setTimeout(window.pushExactAlarmSchedule, 800);
    }
  };
})();