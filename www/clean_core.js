(function() {
  for (let i = 1; i < 9999; i++) { try { clearInterval(i); } catch (e) {} }

  const DAYS_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  let alarms = [];

  function loadAlarmsFromStorage() {
    try {
      const raw = localStorage.getItem("sa_alarms_v2") || localStorage.getItem("sa_alarms") || "[]";
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(x => x && typeof x.time === "string");
    } catch (e) {
      localStorage.removeItem("sa_alarms_v2");
      localStorage.removeItem("sa_alarms");
    }
    return [];
  }

  function saveAlarmsToStorage() {
    const json = JSON.stringify(alarms);
    localStorage.setItem("sa_alarms_v2", json);
    localStorage.setItem("sa_alarms", json);
    localStorage.setItem("alarms", json);
    if (typeof window.pushExactAlarmSchedule === "function") {
      try { window.pushExactAlarmSchedule(); } catch (e) {}
    }
  }

  alarms = loadAlarmsFromStorage();
  if (alarms.length === 0) {
    alarms = [{
      id: 1, time: "07:30", label: "Утренний будильник", days: new Array(1, 2, 3, 4, 5),
      sound: "random", vol: 75, taskMode: "random", taskSingleId: 1, taskRndCnt: 2,
      taskQueue: [], taskDiff: 5, enabled: true
    }];
    saveAlarmsToStorage();
  }

  function updateStaticStatusLine() {
    const bar = document.getElementById("statusBar");
    if (!bar) return;
    const active = alarms.filter(a => a && a.enabled);
    if (active.length === 0) {
      bar.textContent = "Нет активных будильников";
      return;
    }
    const sorted = active.map(a => a.time).sort();
    bar.textContent = `Активных будильников: ${active.length} • Ближайший: ${sorted}`;
  }

  function renderAlarmsList() {
    const host = document.getElementById("alarmsList");
    if (!host) return;
    host.innerHTML = "";

    alarms.forEach(a => {
      const daysArr = Array.isArray(a.days) ? a.days : [];
      const daysText = daysArr.length === 7 ? "Каждый день" : (!daysArr.length ? "Однократно" : daysArr.map(d => DAYS_SHORT[d]).join(", "));
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
          <input type="checkbox" ${a.enabled ? "checked" : ""}>
          <span class="slider"></span>
        </label>
      `;

      card.onclick = e => {
        if (e.target.closest("label.switch") || e.target.tagName === "INPUT") return;
        window.openCleanAlarmEditor(a);
      };

      card.querySelector("input[type='checkbox']").onchange = e => {
        a.enabled = e.target.checked;
        saveAlarmsToStorage();
        updateStaticStatusLine();
      };

      host.appendChild(card);
    });
    updateStaticStatusLine();
  }
  function saveAlarm(editingId, selectedDays, customQueue) {
    const getVal = (id, def) => {
      const el = document.getElementById(id);
      return el && el.value !== undefined && el.value !== "" ? el.value : def;
    };

    const payload = {
      id: editingId || Date.now(),
      time: getVal("edModTime", "07:30"),
      label: String(getVal("edModLabel", "Утренний будильник")).trim() || "Утренний будильник",
      days: Array.isArray(selectedDays) ? Array.from(selectedDays) : [],
      sound: getVal("edModSnd", "random"),
      vol: Math.max(10, Math.min(100, Number(getVal("edModVolRng", 75)) || 75)),
      taskMode: getVal("edTaskMode", "random"),
      taskSingleId: Math.max(1, Math.min(25, Number(getVal("edSingleSel", 1)) || 1)),
      taskRndCnt: Math.max(1, Math.min(25, Number(getVal("edRndCnt", 2)) || 2)),
      taskQueue: Array.isArray(customQueue) ? Array.from(customQueue) : [],
      taskDiff: Math.max(1, Math.min(10, Number(getVal("edDiff10Rng", 5)) || 5)),
      enabled: true
    };

    const idx = alarms.findIndex(a => a && a.id === editingId);
    if (idx >= 0) alarms[idx] = payload;
    else alarms.push(payload);

    saveAlarmsToStorage();
    const modal = document.getElementById("saEditSpecificModal");
    if (modal) modal.remove();
    renderAlarmsList();
  }

  window.openCleanAlarmEditor = function(alarmObj) {
    const old = document.getElementById("saEditSpecificModal");
    if (old) old.remove();

    const isEdit = Boolean(alarmObj && alarmObj.id);
    const tVal = isEdit ? alarmObj.time : "07:30";
    const lVal = isEdit ? alarmObj.label : "Утренний будильник";
    const selDays = isEdit && Array.isArray(alarmObj.days) ? Array.from(alarmObj.days) : new Array(1, 2, 3, 4, 5);
    const mode = isEdit && alarmObj.taskMode ? alarmObj.taskMode : "random";
    const singleId = isEdit && alarmObj.taskSingleId ? Number(alarmObj.taskSingleId) : 1;
    const rndCnt = isEdit && alarmObj.taskRndCnt ? Number(alarmObj.taskRndCnt) : 2;
    let customQueue = isEdit && Array.isArray(alarmObj.taskQueue) ? Array.from(alarmObj.taskQueue) : [];
    const diff = isEdit && alarmObj.taskDiff ? Number(alarmObj.taskDiff) : 5;
    const snd = isEdit && alarmObj.sound ? alarmObj.sound : "random";
    const vol = isEdit && alarmObj.vol ? Number(alarmObj.vol) : 75;

    const allTasks = (window.Logic25Pack || window.Logic15Pack)?.TASKS || [];
    const singleOpts = allTasks.map(t => `<option value="${t.id}" ${singleId === t.id ? "selected" : ""}>№${t.id}. ${t.title}</option>`).join("");
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    const diffTxt = v => v <= 3 ? `${v}/10 — Легко` : (v <= 7 ? `${v}/10 — Средне` : `${v}/10 — Хардкор`);

    const m = document.createElement("div");
    m.id = "saEditSpecificModal";
    m.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:22000;";
    m.innerHTML = `
      <div style="position:fixed;top:4%;bottom:4%;left:14px;right:14px;max-width:420px;margin:0 auto;background:#161822;border:1px solid #2a2e3d;border-radius:18px;display:flex;flex-direction:column;color:#fff;overflow:hidden;">
        <div style="flex-shrink:0;display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #2a2e3d;">
          <b style="font-size:17px;">⏰ Настройка будильника</b>
          <button type="button" id="edTopClose" class="btn btn-sec btn-sm" style="min-height:34px;padding:0 10px;">✕</button>
        </div>
        <div style="flex:1 1 auto;min-height:0;overflow-y:auto;padding:12px 16px;">
          <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Время срабатывания</label>
          <input type="time" id="edModTime" value="${tVal}" style="width:100%;min-height:48px;font-size:24px;font-weight:900;text-align:center;margin-bottom:10px;">
          <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Название</label>
          <input type="text" id="edModLabel" value="${lVal}" style="width:100%;min-height:40px;margin-bottom:10px;">
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:12px;">
            ${new Array(1,2,3,4,5,6,0).map(d => {
              const on = selDays.includes(d);
              return `<button type="button" class="ed-day-btn" data-d="${d}" style="min-height:34px;border-radius:8px;border:1px solid ${on ? "#10b981" : "#2a2e3d"};background:${on ? "#065f46" : "#1f222e"};color:#fff;font-size:12px;font-weight:700;">${DAYS_SHORT[d]}</button>`;
            }).join("")}
          </div>
          <div style="padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;margin-bottom:10px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:6px;">🧠 Задания (база 25 задач)</div>
            <select id="edTaskMode" style="width:100%;min-height:40px;margin-bottom:8px;">
              <option value="none" ${mode === "none" ? "selected" : ""}>0. Без заданий (0 заданий)</option>
              <option value="single" ${mode === "single" ? "selected" : ""}>🎯 Выбрать 1 конкретное задание</option>
              <option value="random" ${mode === "random" ? "selected" : ""}>🎲 Случайный выбор (без повторов)</option>
              <option value="custom" ${mode === "custom" ? "selected" : ""}>🧩 Своя очередь</option>
            </select>
            <div id="edSingleRow" style="display:${mode === "single" ? "block" : "none"};margin-bottom:6px;"><select id="edSingleSel" style="width:100%;min-height:38px;">${singleOpts}</select></div>
            <div id="edRndRow" style="display:${mode === "random" ? "flex" : "none"};gap:6px;align-items:center;margin-bottom:6px;">
              <span style="font-size:12px;color:#8b92a5;">Кол-во (1–25):</span>
              <input type="number" id="edRndCnt" min="1" max="25" value="${rndCnt}" style="width:65px;min-height:36px;text-align:center;">
              <button type="button" id="edAll25Btn" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;font-size:12px;">Все 25 заданий</button>
            </div>
            <div id="edCustomRow" style="display:${mode === "custom" ? "block" : "none"};margin-bottom:6px;">
              <button type="button" id="edOpenQBtn" class="btn btn-sec btn-sm" style="width:100%;min-height:38px;">🛠️ Настроить очередь (${customQueue.length})</button>
            </div>
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid #2a2e3d;">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                <span style="color:#8b92a5;">Сложность (1–10):</span>
                <b id="edDiff10Lbl" style="color:#10b981;">${diffTxt(diff)}</b>
              </div>
              <input type="range" id="edDiff10Rng" min="1" max="10" value="${diff}" style="width:100%;min-height:28px;">
            </div>
          </div>
          <div style="padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;margin-bottom:8px;">
            <label style="display:block;margin-bottom:6px;font-size:12px;color:#8b92a5;font-weight:700;">🎵 Мелодия (120 треков)</label>
            <select id="edModSnd" style="width:100%;min-height:40px;margin-bottom:8px;"><option value="random">🎲 Случайная мелодия</option>${list120}</select>
            <div style="display:flex;gap:6px;margin-bottom:8px;">
              <button type="button" id="edModRnd" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;">🎲 Рандом</button>
              <button type="button" id="edModPrv" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;">▶️ Слушать</button>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
              <span>🔊 Громкость: <b id="edModVolTxt">${vol}%</b></span>
              <input type="range" id="edModVolRng" min="10" max="100" value="${vol}" style="flex:1;min-height:28px;">
            </div>
          </div>
          ${isEdit ? `<button type="button" id="edModDelete" class="btn btn-sec" style="width:100%;min-height:40px;color:#ff2a4b;border-color:#7f1d1d;">🗑️ Удалить будильник</button>` : ""}
        </div>
        <div style="flex-shrink:0;display:flex;gap:8px;padding:12px 16px;border-top:1px solid #2a2e3d;background:#12141d;">
          <button type="button" id="edModCancel" class="btn btn-sec" style="flex:1;min-height:46px;">Отмена</button>
          <button type="button" id="edModSave" class="btn" style="flex:1;min-height:46px;">Сохранить</button>
        </div>
      </div>`;
    document.body.appendChild(m);
    const sndEl = document.getElementById("edModSnd"); if (sndEl) sndEl.value = snd;
    m.querySelectorAll(".ed-day-btn").forEach(b => b.onclick = () => {
      const d = Number(b.dataset.d), p = selDays.indexOf(d);
      if (p >= 0) selDays.splice(p, 1); else selDays.push(d);
      const on = selDays.includes(d);
      b.style.borderColor = on ? "#10b981" : "#2a2e3d"; b.style.background = on ? "#065f46" : "#1f222e";
    });
    const mSel = document.getElementById("edTaskMode");
    mSel.onchange = () => {
      document.getElementById("edSingleRow").style.display = mSel.value === "single" ? "block" : "none";
      document.getElementById("edRndRow").style.display = mSel.value === "random" ? "flex" : "none";
      document.getElementById("edCustomRow").style.display = mSel.value === "custom" ? "block" : "none";
    };
    document.getElementById("edAll25Btn").onclick = () => { document.getElementById("edRndCnt").value = "25"; };
    document.getElementById("edOpenQBtn").onclick = () => {
      if (window.openProfileQueueModal) {
        window.saveProfile15Config("alarm", { queue: customQueue, mode: "custom" });
        window.openProfileQueueModal("alarm", () => {
          customQueue = Array.from(window.getProfile15Config("alarm").queue);
          document.getElementById("edOpenQBtn").innerText = `🛠️ Настроить очередь (${customQueue.length})`;
        });
      }
    };
    document.getElementById("edDiff10Rng").oninput = e => { document.getElementById("edDiff10Lbl").innerText = diffTxt(Number(e.target.value)); };
    document.getElementById("edModVolRng").oninput = e => { document.getElementById("edModVolTxt").innerText = e.target.value + "%"; };
    document.getElementById("edModRnd").onclick = () => { if (sndEl) sndEl.value = "random"; };
    let pl = false;
    document.getElementById("edModPrv").onclick = e => {
      pl = !pl;
      if (pl && window.SoundPack) { window.SoundPack.play(sndEl.value, Number(document.getElementById("edModVolRng").value), window.db || null, true); e.target.innerText = "⏹ Стоп"; }
      else { if (window.SoundPack) window.SoundPack.stop(); e.target.innerText = "▶️ Слушать"; }
    };
    const close = () => { if (window.SoundPack) window.SoundPack.stop(); m.remove(); };
    document.getElementById("edTopClose").onclick = close;
    document.getElementById("edModCancel").onclick = close;
    document.getElementById("edModSave").onclick = () => { if (window.SoundPack) window.SoundPack.stop(); saveAlarm(isEdit ? alarmObj.id : null, selDays, customQueue); };
    const del = document.getElementById("edModDelete");
    if (del) del.onclick = () => { if (window.SoundPack) window.SoundPack.stop(); alarms = alarms.filter(x => x.id !== alarmObj.id); saveAlarmsToStorage(); m.remove(); renderAlarmsList(); };
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
        if (!hit.days.length) { hit.enabled = false; saveAlarmsToStorage(); renderAlarmsList(); }
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