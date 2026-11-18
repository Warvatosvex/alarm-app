(function initUI() {
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", initUI); return; }
  const tL = Array.of(Array.of("math","1. Математика"),Array.of("code","2. Код"),Array.of("tiles","3. Плитки"),Array.of("memory","4. Пары"),Array.of("targets","5. Мишени"),Array.of("logic","6. Загадка (40+)"),Array.of("odd","7. Лишнее"),Array.of("sort","8. Сортировка"),Array.of("stroop","9. Струп"),Array.of("seq","10. Ряд"),Array.of("reverse","11. Наоборот"),Array.of("emoji","12. Эмодзи"),Array.of("count","13. Счёт"),Array.of("compare","14. Сравнение"),Array.of("eq","15. Уравнение X"));
  const fill = () => {
    document.querySelectorAll("select").forEach(s => {
      if (s.innerHTML.includes("Сирена") || s.id.toLowerCase().includes("sound")) {
        const co = Array.from(s.options).filter(o => o.value.startsWith("custom_")).map(o => `<option value="${o.value}">${o.text}</option>`).join("");
        s.innerHTML = `<option value="random">🎲 Случайная (из 100)</option>` + co + window.SoundPack.list.map(m => `<option value="${m.id}">🎵 ${m.name}</option>`).join("");
      }
      if (s.innerHTML.includes("Математика") || s.id.toLowerCase().includes("task"))
        s.innerHTML = `<option value="none">0. Без заданий (Обычный будильник)</option><option value="custom_seq">🧩 Своя очередь</option><option value="marathon">🔥 Все 15 подряд</option>` + tL.map(x=>`<option value="${x.at(0)}">${x.at(1)}</option>`).join("");
    });
  };
  fill();
  const oRef = window.refreshAudioSelects;
  window.refreshAudioSelects = id => { if (oRef) oRef(id); setTimeout(fill, 150); };
  const cont = document.querySelector(".container") || document.body, bar = document.createElement("div"); bar.className = "card";
  const cv = localStorage.getItem("sa_vol")||"50", cm = localStorage.getItem("sa_snooze_min")||"5", cr = localStorage.getItem("sa_snooze_rep")||"inf";
  bar.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:8px;">
    <button class="btn btn-sec btn-sm" id="gR"></button><span style="font-size:13px;">🔊 <b id="vL">${cv}%</b></span>
    <input type="range" id="vR" min="10" max="100" value="${cv}" style="width:100px;min-height:30px;"></div>
    <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#8b92a5;margin-bottom:8px;"><span>💤 0 заданий:</span>
    <input type="number" id="sM" value="${cm}" min="1" style="width:52px;min-height:34px;padding:4px;"><span>мин, повторы:</span>
    <input type="text" id="sR" value="${cr}" style="width:60px;min-height:34px;padding:4px;"></div>
    <details style="font-size:12px;color:#8b92a5;"><summary style="cursor:pointer;color:#f3f4f6;">🧩 Своя очередь заданий</summary>
    <div id="qChips" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;"></div>
    <div style="margin-top:6px;">Очередь: <b id="qView" style="color:#10b981;">пусто</b> <button class="btn btn-sec btn-sm" id="qClr" style="min-height:28px;padding:2px 8px;">Сброс</button></div></details>`;
  cont.prepend(bar);
  let cQ = JSON.parse(localStorage.getItem("sa_custom_q") || "[]");
  const updQ = () => { localStorage.setItem("sa_custom_q", JSON.stringify(cQ)); document.getElementById("qView").innerText = cQ.length ? cQ.join("→") : "пусто"; };
  updQ();
  tL.forEach(x => { const b = document.createElement("button"); b.className = "btn btn-sec btn-sm"; b.style.cssText = "min-height:28px;padding:2px 6px;font-size:11px;"; b.innerText = x.at(1); b.onclick = () => { cQ.push(x.at(0)); updQ(); }; document.getElementById("qChips").appendChild(b); });
  document.getElementById("qClr").onclick = () => { cQ = Array.of(); updQ(); };
  const rb = document.getElementById("gR"), upd = () => rb.innerText = localStorage.getItem("sa_global_random")==="1" ? "🎲 Рандом: ВКЛ" : "🎲 Рандом: ВЫКЛ";
  upd(); rb.onclick = () => { localStorage.setItem("sa_global_random", localStorage.getItem("sa_global_random")==="1"?"0":"1"); upd(); };
  document.getElementById("vR").oninput = e => { localStorage.setItem("sa_vol", e.target.value); document.getElementById("vL").innerText = e.target.value+"%"; };
  document.getElementById("sM").oninput = e => localStorage.setItem("sa_snooze_min", e.target.value);
  document.getElementById("sR").oninput = e => localStorage.setItem("sa_snooze_rep", e.target.value);
  const tTab = document.getElementById("tab-timer");
  if (tTab) {
    const pDiv = document.createElement("div"); pDiv.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:10px;";
    Array.of(Array.of(30,"30с"),Array.of(60,"1м"),Array.of(300,"5м"),Array.of(600,"10м"),Array.of(900,"15м"),Array.of(1500,"25м"),Array.of(1800,"30м"),Array.of(2700,"45м"),Array.of(3600,"1ч"),Array.of(7200,"2ч")).forEach(p => {
      const b = document.createElement("button"); b.className = "btn btn-sec btn-sm"; b.innerText = p.at(1);
      b.onclick = () => { const sec=p.at(0),h=document.getElementById("tHours"),m=document.getElementById("tMins"),s=document.getElementById("tSecs"); if(h&&m&&s){h.value=Math.floor(sec/3600);m.value=Math.floor((sec%3600)/60);s.value=sec%60;} if(window.resetTimer)window.resetTimer(); };
      pDiv.appendChild(b);
    });
    tTab.prepend(pDiv);
  }
  const tBox = document.getElementById("taskContainer");
  if (tBox) tBox.addEventListener("pointerdown", () => { if (window.SoundPack) window.SoundPack.onUserActivity(); });
  window.startRingingSound = sid => window.SoundPack.play(sid, Number(localStorage.getItem("sa_vol")||50), window.db||null);
  window.stopRingingSound = () => window.SoundPack.stop();
  if (typeof ALL_TASKS !== "undefined") { ALL_TASKS.length = 0; ALL_TASKS.push(...window.TasksPack.ALL_15); }
  const origR = window.renderCurrentTask;
  window.renderCurrentTask = function() {
    if (typeof ringQueue !== "undefined" && typeof ringStepIdx !== "undefined") {
      if (ringQueue.at(0) === "custom_seq" && cQ.length) { ringQueue.length = 0; ringQueue.push(...cQ); }
      const t = ringQueue.at(ringStepIdx), prog = document.getElementById("ringProgress");
      if (prog) prog.innerText = "Шаг " + (ringStepIdx + 1) + " из " + ringQueue.length;
      if (tBox && window.TasksPack.render(t, typeof ringDiff!=="undefined"?ringDiff:2, tBox, window.taskStepSuccess, window.taskStepFail)) return;
    }
    if (origR) origR();
  };
  const origSync = window.syncNativeAlarms;
  window.syncNativeAlarms = function() {
    if (origSync) origSync();
    if (!window.AndroidLock || !window.AndroidLock.scheduleNextAlarmWithData) return;
    const now = new Date(); let bestTs = 0, bestP = null;
    (window.alarms || []).filter(a => a.enabled).forEach(a => {
      const [hh, mm] = a.time.split(":").map(Number);
      for (let d = 0; d <= 7; d++) {
        const c = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hh, mm, 0, 0);
        if (c > now && (a.days.length === 0 || a.days.includes(c.getDay()))) {
          if (bestTs === 0 || c.getTime() < bestTs) { bestTs = c.getTime(); bestP = { title: "⏰ БУДИЛЬНИК " + a.time, sound: a.sound, task: a.task, diff: a.diff, rounds: a.rounds }; }
          break;
        }
      }
    });
    if (bestTs > 0 && bestP) window.AndroidLock.scheduleNextAlarmWithData(bestTs, JSON.stringify(bestP));
  };
  window.onNativeWake = function(d) {
    d = d || {};
    if (window.triggerRing) window.triggerRing(d.title || "⏰ ПОДЪЁМ!", d.sound || "random", d.task || "math", d.diff || 2, d.rounds || 1);
    if (window.syncNativeAlarms) window.syncNativeAlarms();
  };
})();