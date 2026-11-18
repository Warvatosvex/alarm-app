(function cleanApp() {
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", cleanApp); return; }

  const st = document.createElement("style");
  st.innerHTML = `
    * { box-sizing: border-box; touch-action: manipulation; }
    .modal-content, .modal > div { width: 92vw !important; max-width: 410px !important; max-height: 88vh !important; overflow-y: auto !important; }
    input[type="text"], input[type="number"], select { background: #1f222e !important; color: #ffffff !important; border: 1px solid #32374a !important; }
    select option { background: #1f222e !important; color: #ffffff !important; }
  `;
  document.head.appendChild(st);

  document.querySelectorAll(".modal").forEach(m => m.classList.remove("active", "open", "show"));
  if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, 50, false);

  const tL = Array.of(Array.of("none","0. Без заданий (Обычный будильник)"),Array.of("random_pool","🎲 Рандом из выбранных заданий"),Array.of("custom_seq","🧩 Своя точная очередь"),Array.of("marathon","🔥 Все 15 заданий подряд"),Array.of("math","1. Математика"),Array.of("code","2. Код тревоги"),Array.of("tiles","3. Плитки памяти"),Array.of("memory","4. Найди пары"),Array.of("targets","5. Раздави мишени"),Array.of("logic","6. Логическая загадка (40+)"),Array.of("odd","7. Найди лишнее"),Array.of("sort","8. Сортировка чисел"),Array.of("stroop","9. Тест Струпа"),Array.of("seq","10. Продолжи ряд"),Array.of("reverse","11. Слово наоборот"),Array.of("emoji","12. Поиск эмодзи"),Array.of("count","13. Быстрый счёт"),Array.of("compare","14. Что больше?"),Array.of("eq","15. Уравнение X"));
  const tasks15 = tL.slice(4);

  const tTab = document.getElementById("tab-timer");
  if (tTab && !document.getElementById("cleanTimerExt")) {
    const card = tTab.querySelector(".card") || tTab;
    card.querySelectorAll(".big-clock, #timerDisplay").forEach(el => { el.style.cssText += "font-size:60px;letter-spacing:2px;margin:20px 0;"; });
    const ext = document.createElement("div"); ext.id = "cleanTimerExt"; ext.style.cssText = "margin:12px 0;";
    ext.innerHTML = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;">
        ${Array.of(Array.of(30,"30 сек"),Array.of(300,"5 мин"),Array.of(600,"10 мин"),Array.of(900,"15 мин"),Array.of(1500,"25 мин"),Array.of(2700,"45 мин"),Array.of(3600,"1 час"),Array.of(7200,"2 часа")).map(x=>`<button type="button" class="btn btn-sec tp-b" data-s="${x.at(0)}" style="min-height:44px;font-size:13px;">${x.at(1)}</button>`).join("")}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;">
        <input type="number" id="cTH" min="0" max="99" placeholder="Часы" style="text-align:center;font-size:17px;min-height:48px;">
        <input type="number" id="cTM" min="0" max="59" placeholder="Мин" style="text-align:center;font-size:17px;min-height:48px;">
        <input type="number" id="cTS" min="0" max="59" placeholder="Сек" style="text-align:center;font-size:17px;min-height:48px;">
        <button type="button" id="cTSet" class="btn" style="min-height:48px;padding:0 16px;">Задать</button></div>`;
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
  function enhanceModals() {
    document.querySelectorAll("select").forEach(sel => {
      if (sel.dataset.ready || sel.classList.contains("sa-mel-sel")) return;
      const txt = sel.innerHTML.toLowerCase();
      if (txt.includes("математ") || txt.includes("марафон")) {
        sel.dataset.ready = "1";
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
          qPanel.style.display = (sel.value === "custom_seq" || sel.value === "random_pool") ? "block" : "none";
          qPanel.querySelector(".q-back").style.display = sel.value === "custom_seq" ? "inline-block" : "none";
          nPanel.style.display = sel.value === "none" ? "block" : "none";
          updView();
        };
        sel.addEventListener("change", updVis); updVis();
      }
    });

    document.querySelectorAll('.modal input[type="file"]').forEach(fileIn => {
      const wrap = fileIn.parentElement;
      if (!wrap || wrap.dataset.melodyDone) return;
      wrap.dataset.melodyDone = "1";
      const list100 = window.SoundPack ? window.SoundPack.list.map(m => `<option value="${m.id}">🎵 ${m.name}</option>`).join("") : "";
      const curV = localStorage.getItem("sa_vol") || "50";
      const sec = document.createElement("div"); sec.style.cssText = "margin-bottom:14px;";
      sec.innerHTML = `<label style="display:block;margin-bottom:6px;font-size:13px;color:#8b92a5;">Мелодия будильника (100 разных звуков)</label>
        <select class="sa-mel-sel" style="margin-bottom:8px;"><option value="random">🎲 Случайная мелодия (Авто-рандом)</option>${list100}</select>
        <div style="padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;">
          <div style="display:flex;gap:8px;margin-bottom:10px;">
            <button type="button" class="btn btn-sec btn-sm sa-rnd-btn" style="flex:1;min-height:40px;">🎲 Рандом</button>
            <button type="button" class="btn btn-sec btn-sm sa-prv-btn" style="flex:1;min-height:40px;">▶️ Прослушать</button></div>
          <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
            <span>🔊 Громкость: <b class="sa-v-lbl">${curV}%</b></span>
            <input type="range" class="sa-v-rng" min="10" max="100" value="${curV}" style="flex:1;min-height:28px;padding:0;"></div></div>`;
      wrap.before(sec);
      const sel = sec.querySelector(".sa-mel-sel");
      sel.value = localStorage.getItem("sa_last_sound") || "random";
      sel.onchange = () => localStorage.setItem("sa_last_sound", sel.value);
      sec.querySelector(".sa-rnd-btn").onclick = () => { sel.value = "random"; localStorage.setItem("sa_last_sound", "random"); sec.querySelector(".sa-rnd-btn").innerText = "🎲 Выбран: РАНДОМ"; };
      let playing = false;
      sec.querySelector(".sa-prv-btn").onclick = (e) => {
        playing = !playing;
        if (playing) { window.SoundPack.play(sel.value, Number(localStorage.getItem("sa_vol")||50), window.db||null); e.target.innerText = "⏹ Стоп"; }
        else { window.SoundPack.stop(); e.target.innerText = "▶️ Прослушать"; }
      };
      sec.querySelector(".sa-v-rng").oninput = (e) => { localStorage.setItem("sa_vol", e.target.value); sec.querySelector(".sa-v-lbl").innerText = e.target.value + "%"; };
    });
  }

  enhanceModals();
  new MutationObserver(enhanceModals).observe(document.body, { childList: true, subtree: true });

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
  window.startRingingSound = sid => window.SoundPack.play((!sid || !String(sid).startsWith("custom_")) ? (localStorage.getItem("sa_last_sound") || "random") : sid, Number(localStorage.getItem("sa_vol")||50), window.db||null);
  window.stopRingingSound = () => { window.SoundPack.stop(); if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, 50, false); };
  window.onNativeWake = function(d) { d = d || {}; if (window.triggerRing) window.triggerRing(d.title || "⏰ ПОДЪЁМ!", d.sound || "random", d.task || "math", d.diff || 2, d.rounds || 1); if (window.syncNativeAlarms) window.syncNativeAlarms(); };
})();
(function fixTimerNow() {
  const inject = () => {
    if (document.getElementById("cleanTimerExt")) return;
    const targetBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.trim() === "5 мин");
    if (!targetBtn) return;
    const btnRow = targetBtn.parentElement;
    const card = btnRow.parentElement;

    card.querySelectorAll("div,span,h1,h2").forEach(el => {
      if (/^\d{2}:\d{2}:\d{2}$/.test(el.innerText.trim())) {
        el.style.cssText += "font-size:62px!important;letter-spacing:2px!important;margin:18px 0!important;font-weight:800!important;";
      }
    });

    const ext = document.createElement("div");
    ext.id = "cleanTimerExt";
    ext.style.cssText = "margin:10px 0 14px;";
    ext.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;">
        ${Array.of(Array.of(30,"30 сек"),Array.of(900,"15 мин"),Array.of(1500,"25 мин"),Array.of(1800,"30 мин"),Array.of(2700,"45 мин"),Array.of(3600,"1 час"),Array.of(7200,"2 часа"),Array.of(10800,"3 часа")).map(x=>`<button type="button" class="btn btn-sec tp-b" data-s="${x.at(0)}" style="min-height:42px;font-size:13px;font-weight:600;">${x.at(1)}</button>`).join("")}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;">
        <input type="number" id="cTH" min="0" max="99" placeholder="Часы" style="text-align:center;font-size:16px;min-height:46px;">
        <input type="number" id="cTM" min="0" max="59" placeholder="Мин" style="text-align:center;font-size:16px;min-height:46px;">
        <input type="number" id="cTS" min="0" max="59" placeholder="Сек" style="text-align:center;font-size:16px;min-height:46px;">
        <button type="button" id="cTSet" class="btn" style="min-height:46px;padding:0 16px;">ОК</button>
      </div>`;
    btnRow.after(ext);

    const setSeconds = (sec) => {
      sec = Math.max(1, Number(sec) || 0);
      const hh = String(Math.floor(sec/3600)).padStart(2,"0");
      const mm = String(Math.floor((sec%3600)/60)).padStart(2,"0");
      const ss = String(sec%60).padStart(2,"0");
      card.querySelectorAll("div,span,h1,h2").forEach(n => {
        if (/^\d{2}:\d{2}:\d{2}$/.test(n.innerText.trim())) n.innerText = `${hh}:${mm}:${ss}`;
      });
      if (typeof timerSeconds !== "undefined") timerSeconds = sec;
      if (typeof timerRemaining !== "undefined") timerRemaining = sec;
      if (typeof timerLeft !== "undefined") timerLeft = sec;
      if (typeof timeLeft !== "undefined") timeLeft = sec;
      window._forcedTimerSec = sec;
    };

    ext.querySelectorAll(".tp-b").forEach(b => b.onclick = () => setSeconds(b.dataset.s));
    document.getElementById("cTSet").onclick = () => {
      const h = Number(document.getElementById("cTH").value) || 0;
      const m = Number(document.getElementById("cTM").value) || 0;
      const s = Number(document.getElementById("cTS").value) || 0;
      setSeconds(h*3600 + m*60 + s);
    };
  };

  setInterval(inject, 300);
})();