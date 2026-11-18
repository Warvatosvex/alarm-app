(function cleanUI() {
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", cleanUI); return; }
  const tL = Array.of(Array.of("none","0. Без заданий (Обычный будильник)"),Array.of("random_pool","🎲 Рандом из выбранных заданий"),Array.of("custom_seq","🧩 Своя точная очередь"),Array.of("marathon","🔥 Все 15 заданий подряд"),Array.of("math","1. Математика"),Array.of("code","2. Код тревоги"),Array.of("tiles","3. Плитки памяти"),Array.of("memory","4. Найди пары"),Array.of("targets","5. Раздави мишени"),Array.of("logic","6. Логическая загадка (40+)"),Array.of("odd","7. Найди лишнее"),Array.of("sort","8. Сортировка чисел"),Array.of("stroop","9. Тест Струпа"),Array.of("seq","10. Продолжи ряд"),Array.of("reverse","11. Слово наоборот"),Array.of("emoji","12. Поиск эмодзи"),Array.of("count","13. Быстрый счёт"),Array.of("compare","14. Что больше?"),Array.of("eq","15. Уравнение X"));
  const tasks15 = tL.slice(4);

  const tTab = document.getElementById("tab-timer");
  if (tTab && !document.getElementById("cleanTimerExt")) {
    const card = tTab.querySelector(".card") || tTab;
    card.querySelectorAll(".big-clock, #timerDisplay").forEach(el => { el.style.cssText += "font-size:62px;letter-spacing:2px;margin:24px 0;color:#fff;"; });
    const ext = document.createElement("div"); ext.id = "cleanTimerExt"; ext.style.cssText = "margin:14px 0;";
    ext.innerHTML = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;">
        ${Array.of(Array.of(30,"30 сек"),Array.of(300,"5 мин"),Array.of(600,"10 мин"),Array.of(900,"15 мин"),Array.of(1500,"25 мин"),Array.of(2700,"45 мин"),Array.of(3600,"1 час"),Array.of(7200,"2 часа")).map(x=>`<button type="button" class="btn btn-sec tp-b" data-s="${x.at(0)}" style="min-height:46px;font-size:14px;font-weight:700;">${x.at(1)}</button>`).join("")}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:center;">
        <input type="number" id="cTH" min="0" max="99" placeholder="Часы" style="text-align:center;font-size:18px;min-height:52px;font-weight:700;">
        <input type="number" id="cTM" min="0" max="59" placeholder="Мин" style="text-align:center;font-size:18px;min-height:52px;font-weight:700;">
        <input type="number" id="cTS" min="0" max="59" placeholder="Сек" style="text-align:center;font-size:18px;min-height:52px;font-weight:700;">
        <button type="button" id="cTSet" class="btn" style="min-height:52px;padding:0 18px;font-size:16px;">Задать</button></div>`;
    card.prepend(ext);
    const applyT = (sec) => {
      sec = Math.max(1, Number(sec)||0);
      const hEl = document.getElementById("tHours"), mEl = document.getElementById("tMins"), sEl = document.getElementById("tSecs");
      if (hEl && mEl && sEl) { hEl.value = Math.floor(sec/3600); mEl.value = Math.floor((sec%3600)/60); sEl.value = sec%60; if (window.resetTimer) window.resetTimer(); }
      else {
        const hh = String(Math.floor(sec/3600)).padStart(2,"0"), mm = String(Math.floor((sec%3600)/60)).padStart(2,"0"), ss = String(sec%60).padStart(2,"0");
        card.querySelectorAll("div,span").forEach(n => { if (/^\d{2}:\d{2}:\d{2}$/.test(n.innerText.trim())) n.innerText = `${hh}:${mm}:${ss}`; });
        if (typeof timerSec !== "undefined") timerSec = sec;
      }
    };
    ext.querySelectorAll(".tp-b").forEach(b => b.onclick = () => applyT(b.dataset.s));
    document.getElementById("cTSet").onclick = () => applyT((Number(document.getElementById("cTH").value)||0)*3600 + (Number(document.getElementById("cTM").value)||0)*60 + (Number(document.getElementById("cTS").value)||0));
  }
  function syncSelects() {
    document.querySelectorAll("select").forEach(sel => {
      const idLow = (sel.id + " " + sel.className).toLowerCase(), txtLow = sel.innerHTML.toLowerCase();
      if (!sel.dataset.okSound && (idLow.includes("sound") || txtLow.includes("сирен") || txtLow.includes("горн") || txtLow.includes("мелод"))) {
        sel.dataset.okSound = "1";
        sel.style.cssText += "display:block;width:100%;min-height:48px;font-size:15px;background:#1f222e;color:#fff;border:1px solid #ff2a4b;";
        const co = Array.from(sel.options).filter(o => o.value.startsWith("custom_")).map(o => `<option value="${o.value}">${o.text}</option>`).join("");
        const list100 = window.SoundPack ? window.SoundPack.list.map(m => `<option value="${m.id}">🎵 ${m.name}</option>`).join("") : "";
        sel.innerHTML = `<option value="random">🎲 Случайная мелодия (Авто-рандом)</option>` + co + list100;
        const box = document.createElement("div"); box.style.cssText = "margin-top:8px;padding:12px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
        const curV = localStorage.getItem("sa_vol") || "50";
        box.innerHTML = `<div style="display:flex;gap:8px;margin-bottom:10px;">
            <button type="button" class="btn btn-sec btn-sm b-rnd" style="flex:1;min-height:42px;">🎲 Рандомная музыка</button>
            <button type="button" class="btn btn-sec btn-sm b-prv" style="flex:1;min-height:42px;">▶️ Прослушать</button></div>
          <div style="display:flex;align-items:center;gap:10px;font-size:14px;"><span>🔊 Громкость: <b class="v-num">${curV}%</b></span>
            <input type="range" class="v-sl" min="10" max="100" value="${curV}" style="flex:1;min-height:32px;padding:0;"></div>`;
        sel.after(box);
        let playing = false;
        box.querySelector(".b-rnd").onclick = () => { sel.value = "random"; box.querySelector(".b-rnd").innerText = "🎲 Выбран: РАНДОМ"; };
        box.querySelector(".b-prv").onclick = (e) => { playing = !playing; if (playing) { window.SoundPack.play(sel.value, Number(localStorage.getItem("sa_vol")||50), window.db||null); e.target.innerText = "⏹ Стоп"; } else { window.SoundPack.stop(); e.target.innerText = "▶️ Прослушать"; } };
        box.querySelector(".v-sl").oninput = (e) => { localStorage.setItem("sa_vol", e.target.value); box.querySelector(".v-num").innerText = e.target.value + "%"; };
      }

      if (!sel.dataset.okTask && (idLow.includes("task") || txtLow.includes("математ") || txtLow.includes("марафон"))) {
        sel.dataset.okTask = "1";
        sel.innerHTML = tL.map(x => `<option value="${x.at(0)}">${x.at(1)}</option>`).join("");
        const qPanel = document.createElement("div"); qPanel.style.cssText = "display:none;margin-top:8px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
        let cQ = JSON.parse(localStorage.getItem("sa_custom_q") || "[]"), rPool = JSON.parse(localStorage.getItem("sa_rnd_pool") || "[]");
        qPanel.innerHTML = `<div class="q-title" style="font-size:12px;color:#8b92a5;margin-bottom:6px;">Выберите задания:</div>
          <div class="q-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;gap:6px;">
            <span style="word-break:break-word;">Выбрано: <b class="q-out" style="color:#10b981;">пусто</b></span>
            <div style="display:flex;gap:4px;"><button type="button" class="btn btn-sec btn-sm q-back" style="min-height:32px;padding:4px 8px;">⌫</button><button type="button" class="btn btn-sec btn-sm q-rst" style="min-height:32px;padding:4px 8px;">Сброс</button></div></div>`;
        const updView = () => {
          localStorage.setItem("sa_custom_q", JSON.stringify(cQ)); localStorage.setItem("sa_rnd_pool", JSON.stringify(rPool));
          const isRnd = sel.value === "random_pool";
          qPanel.querySelector(".q-title").innerText = isRnd ? "Отметьте, какие задания выпадают случайно:" : "Нажмите по порядку для своей очереди:";
          const arr = isRnd ? rPool : cQ, names = arr.map(id => (tasks15.find(x => x.at(0) === id) || Array.of(id, id)).at(1));
          qPanel.querySelector(".q-out").innerText = names.length ? names.join(isRnd ? ", " : " → ") : (isRnd ? "все 15 случайно" : "пусто");
          qPanel.querySelectorAll(".t-chip").forEach(btn => { btn.style.borderColor = (isRnd && rPool.includes(btn.dataset.id)) ? "#ff2a4b" : "#2a2e3d"; });
        };
        tasks15.forEach(x => {
          const b = document.createElement("button"); b.type = "button"; b.className = "btn btn-sec btn-sm t-chip"; b.dataset.id = x.at(0);
          b.style.cssText = "min-height:36px;font-size:12px;text-align:left;padding:6px 8px;"; b.innerText = x.at(1);
          b.onclick = () => { if (sel.value === "random_pool") { if (rPool.includes(x.at(0))) rPool = rPool.filter(i => i !== x.at(0)); else rPool.push(x.at(0)); } else { cQ.push(x.at(0)); } updView(); };
          qPanel.querySelector(".q-grid").appendChild(b);
        });
        qPanel.querySelector(".q-back").onclick = () => { if (sel.value !== "random_pool") { cQ.pop(); updView(); } };
        qPanel.querySelector(".q-rst").onclick = () => { if (sel.value === "random_pool") rPool = Array.of(); else cQ = Array.of(); updView(); };
        const nPanel = document.createElement("div"); nPanel.style.cssText = "display:none;margin-top:8px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;font-size:13px;";
        const cm = localStorage.getItem("sa_snooze_min") || "5", cr = localStorage.getItem("sa_snooze_rep") || "inf";
        nPanel.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div><label style="margin:0 0 4px;">Интервал (мин)</label><input type="number" class="sn-m" value="${cm}" min="1"></div><div><label style="margin:0 0 4px;">Повторы (inf = ∞)</label><input type="text" class="sn-r" value="${cr}"></div></div>`;
        nPanel.querySelector(".sn-m").oninput = e => localStorage.setItem("sa_snooze_min", e.target.value);
        nPanel.querySelector(".sn-r").oninput = e => localStorage.setItem("sa_snooze_rep", e.target.value);
        sel.after(nPanel); sel.after(qPanel);
        const updVis = () => {
          const showQ = (sel.value === "custom_seq" || sel.value === "random_pool");
          qPanel.style.display = showQ ? "block" : "none";
          qPanel.querySelector(".q-back").style.display = sel.value === "custom_seq" ? "inline-block" : "none";
          nPanel.style.display = sel.value === "none" ? "block" : "none";
          updView();
        };
        sel.addEventListener("change", updVis); updVis();
      }
    });
  }

  syncSelects();
  const origRef = window.refreshAudioSelects;
  window.refreshAudioSelects = id => { if (origRef) origRef(id); setTimeout(syncSelects, 150); };
  new MutationObserver(syncSelects).observe(document.body, { childList: true, subtree: true });

  const origTrig = window.triggerRing;
  window.triggerRing = function(title, sound, taskType, diff, rounds) {
    if (origTrig) origTrig(title, sound, taskType, diff, rounds);
    if (typeof window.ringQueue !== "undefined") {
      if (taskType === "custom_seq") { const saved = JSON.parse(localStorage.getItem("sa_custom_q") || "[]"); if (saved.length > 0) { window.ringQueue.length = 0; window.ringQueue.push(...saved); } }
      else if (taskType === "random_pool" && window.buildRandomPoolQueue) { window.ringQueue.length = 0; window.ringQueue.push(...window.buildRandomPoolQueue(rounds)); }
      if (window.renderCurrentTask) window.renderCurrentTask();
    }
    const hasTask = (taskType !== "none" && diff > 0);
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(true, Number(localStorage.getItem("sa_vol")||50), hasTask);
  };
  window.startRingingSound = sid => window.SoundPack.play(sid, Number(localStorage.getItem("sa_vol")||50), window.db||null);
  window.stopRingingSound = () => window.SoundPack.stop();
  window.onNativeWake = function(d) { d = d || {}; if (window.triggerRing) window.triggerRing(d.title || "⏰ ПОДЪЁМ!", d.sound || "random", d.task || "math", d.diff || 2, d.rounds || 1); if (window.syncNativeAlarms) window.syncNativeAlarms(); };
})();
(function() {
  const st = document.createElement("style");
  st.innerHTML = "*{touch-action:manipulation!important;-webkit-tap-highlight-color:transparent}button,input,select{cursor:pointer!important;pointer-events:auto!important;position:relative;z-index:20}.modal:not(.active),[style*='display: none'],[style*='display:none']{pointer-events:none!important}.modal.active{z-index:9999!important;pointer-events:auto!important}";
  document.head.appendChild(st);
  document.addEventListener("touchend", e => {
    const b = e.target.closest("button");
    if (b && !b.disabled) { e.preventDefault(); b.click(); }
  }, {passive: false});
})();