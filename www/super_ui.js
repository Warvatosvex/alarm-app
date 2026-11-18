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
(function unifiedFix() {
  // 1. Нормальный размер и центрирование окна настройки будильника без вылезания за края
  const st = document.createElement("style");
  st.innerHTML = `
    html, body { overflow-x: hidden !important; width: 100vw !important; max-width: 100vw !important; }
    .modal.active, .modal.open, .modal[style*="flex"], .modal[style*="block"] {
      position: fixed !important; inset: 0 !important;
      width: 100vw !important; height: 100vh !important;
      padding: 16px !important; box-sizing: border-box !important;
      display: flex !important; justify-content: center !important; align-items: center !important;
      background: rgba(0, 0, 0, 0.78) !important; z-index: 9999 !important;
    }
    .modal > div, .modal-content {
      position: relative !important; inset: auto !important; transform: none !important;
      width: 100% !important; max-width: 360px !important; max-height: 85vh !important;
      margin: auto !important; padding: 16px !important; border-radius: 18px !important;
      overflow-y: auto !important; overflow-x: hidden !important; box-sizing: border-box !important;
    }
    .modal * { max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
    .modal select, .modal input[type="text"], .modal input[type="number"] {
      width: 100% !important; font-size: 14px !important; padding: 8px 10px !important;
      text-overflow: ellipsis !important; white-space: nowrap !important; overflow: hidden !important;
    }
  `;
  document.head.appendChild(st);

  // 2. Автономный рабочий Таймер с пресетами до 1 часа и ручным вводом Мин/Сек
  let tTotal = 300, tLeft = 300, tInterval = null;
  const formatHMS = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  setInterval(() => {
    // Внедряем блок 100 мелодий в окно настройки будильника, если его там ещё нет
    document.querySelectorAll('.modal input[type="file"]').forEach(fileIn => {
      const wrap = fileIn.parentElement;
      if (!wrap || wrap.dataset.melReady) return;
      wrap.dataset.melReady = "1";
      const prev = wrap.previousElementSibling;
      if (prev && prev.querySelector(".sa-mel-sel")) return;

      const list100 = window.SoundPack ? window.SoundPack.list.map(m => `<option value="${m.id}">🎵 ${m.name}</option>`).join("") : "";
      const curV = localStorage.getItem("sa_vol") || "50";
      const initS = localStorage.getItem("sa_last_sound") || "random";
      const box = document.createElement("div");
      box.style.cssText = "margin-bottom:12px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
      box.innerHTML = `
        <label style="display:block;margin-bottom:6px;font-size:12px;color:#8b92a5;">Мелодия (100 неповторяющихся звуков + птицы)</label>
        <select class="sa-mel-sel" style="margin-bottom:8px;">
          <option value="random">🎲 Случайная (без повторов)</option>
          ${list100}
        </select>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <button type="button" class="btn btn-sec btn-sm m-rnd" style="flex:1;min-height:38px;">🎲 Рандом</button>
          <button type="button" class="btn btn-sec btn-sm m-prv" style="flex:1;min-height:38px;">▶️ Слушать</button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
          <span>🔊 <b class="m-vl">${curV}%</b></span>
          <input type="range" class="m-vr" min="10" max="100" value="${curV}" style="flex:1;min-height:28px;">
        </div>`;
      wrap.before(box);

      const sel = box.querySelector(".sa-mel-sel"); sel.value = initS;
      sel.onchange = () => localStorage.setItem("sa_last_sound", sel.value);
      box.querySelector(".m-rnd").onclick = () => { sel.value = "random"; localStorage.setItem("sa_last_sound", "random"); box.querySelector(".m-rnd").innerText = "🎲 Выбран: РАНДОМ"; };
      let pl = false;
      box.querySelector(".m-prv").onclick = e => {
        pl = !pl;
        if (pl) { window.SoundPack.play(sel.value, Number(localStorage.getItem("sa_vol")||50), window.db||null, true); e.target.innerText = "⏹ Стоп"; }
        else { window.SoundPack.stop(); e.target.innerText = "▶️ Слушать"; }
      };
      box.querySelector(".m-vr").oninput = e => { localStorage.setItem("sa_vol", e.target.value); box.querySelector(".m-vl").innerText = e.target.value + "%"; };
    });

    // Подключаем рабочий Таймер
    const refBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.trim() === "10 мин" || b.innerText.trim() === "15 мин");
    if (refBtn && refBtn.parentElement && !document.getElementById("saTimerExt")) {
      const oldRow = refBtn.parentElement, card = oldRow.parentElement || oldRow;
      card.querySelectorAll("div, span, h1, h2").forEach(el => {
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(el.innerText.trim())) el.style.cssText += "font-size:56px!important;font-weight:800!important;margin:16px 0!important;";
      });

      const ext = document.createElement("div");
      ext.id = "saTimerExt"; ext.style.cssText = "margin:12px 0;width:100%;box-sizing:border-box;";
      const presets = Array.of(Array.of(60,"1 мин"),Array.of(300,"5 мин"),Array.of(600,"10 мин"),Array.of(900,"15 мин"),Array.of(1500,"25 мин"),Array.of(1800,"30 мин"),Array.of(2700,"45 мин"),Array.of(3600,"1 час"));
      ext.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;">
          ${presets.map(p=>`<button type="button" class="btn btn-sec sa-tp" data-sec="${p.at(0)}" style="min-height:40px;font-size:12px;padding:4px 2px;">${p.at(1)}</button>`).join("")}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:6px;align-items:center;">
          <input type="number" id="saTMin" min="0" max="60" placeholder="Мин (до 60)" style="text-align:center;min-height:44px;">
          <input type="number" id="saTSec" min="0" max="59" placeholder="Сек" style="text-align:center;min-height:44px;">
          <button type="button" id="saTApply" class="btn" style="min-height:44px;padding:0 16px;">Задать</button>
        </div>`;
      oldRow.style.display = "none";
      oldRow.after(ext);

      const displayEl = Array.from(card.querySelectorAll("div, span, h1, h2")).find(el => /^\d{2}:\d{2}(:\d{2})?$/.test(el.innerText.trim()));
      const renderT = () => { if (displayEl) displayEl.innerText = formatHMS(tLeft); };
      const setNewTime = (sec) => { clearInterval(tInterval); tInterval = null; tTotal = Math.max(1, Number(sec) || 60); tLeft = tTotal; renderT(); };

      ext.querySelectorAll(".sa-tp").forEach(btn => { btn.onclick = (e) => { e.stopImmediatePropagation(); setNewTime(btn.dataset.sec); }; });
      document.getElementById("saTApply").onclick = (e) => {
        e.stopImmediatePropagation();
        const m = Number(document.getElementById("saTMin")?.value) || 0, s = Number(document.getElementById("saTSec")?.value) || 0;
        if (m > 0 || s > 0) setNewTime(m * 60 + s);
      };

      card.querySelectorAll("button").forEach(btn => {
        const txt = btn.innerText.trim().toLowerCase();
        if (txt.includes("старт") || txt.includes("пуск") || txt.includes("продолж")) {
          btn.onclick = (e) => {
            e.stopImmediatePropagation();
            if (tInterval) return;
            if (tLeft <= 0) tLeft = tTotal;
            tInterval = setInterval(() => {
              tLeft--; renderT();
              if (tLeft <= 0) {
                clearInterval(tInterval); tInterval = null;
                if (window.triggerRing) window.triggerRing("⏳ ТАЙМЕР ЗАВЕРШЁН", localStorage.getItem("sa_last_sound") || "random", "none", 0, 1);
                else if (window.SoundPack) window.SoundPack.play("random", Number(localStorage.getItem("sa_vol") || 50), window.db || null);
              }
            }, 1000);
          };
        } else if (txt.includes("пауза") || txt.includes("стоп")) {
          btn.onclick = (e) => { e.stopImmediatePropagation(); clearInterval(tInterval); tInterval = null; };
        } else if (txt.includes("сброс")) {
          btn.onclick = (e) => { e.stopImmediatePropagation(); setNewTime(tTotal); };
        }
      });
    }
  }, 250);
})();
(function customTestAndLiveAudio() {
  setInterval(() => {
    const tBox = document.getElementById("taskContainer");
    if (tBox && tBox.offsetParent !== null && !document.getElementById("liveRingAudioBar")) {
      const bar = document.createElement("div");
      bar.id = "liveRingAudioBar";
      bar.style.cssText = "margin-bottom:12px;padding:8px 10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;display:flex;gap:6px;align-items:center;";
      const list120 = window.SoundPack ? window.SoundPack.list.map(m => `<option value="${m.id}">🎵 ${m.name}</option>`).join("") : "";
      bar.innerHTML = `
        <select id="liveRingSel" style="flex:1;min-height:38px;font-size:13px;padding:4px 8px;">
          <option value="random">🎲 Случайный звук</option>
          ${list120}
        </select>
        <button type="button" id="liveRingNext" class="btn btn-sec btn-sm" style="min-height:38px;padding:0 10px;white-space:nowrap;">🔀 Сменить</button>
      `;
      tBox.before(bar);
      const sel = document.getElementById("liveRingSel");
      sel.value = window.SoundPack ? window.SoundPack.getCurrentId() : "random";
      sel.onchange = () => {
        if (window.SoundPack) window.SoundPack.play(sel.value, Number(localStorage.getItem("sa_vol") || 50), window.db || null);
      };
      document.getElementById("liveRingNext").onclick = () => {
        if (window.SoundPack) {
          window.SoundPack.play("random", Number(localStorage.getItem("sa_vol") || 50), window.db || null);
          sel.value = window.SoundPack.getCurrentId();
        }
      };
    }

    document.querySelectorAll("button").forEach(btn => {
      if (btn.dataset.customTestHooked) return;
      const txt = btn.innerText.trim().toLowerCase();
      if (txt === "тест" || txt.includes("тест будильник") || txt.includes("тест тревог")) {
        btn.dataset.customTestHooked = "1";
        btn.onclick = (e) => {
          e.preventDefault(); e.stopImmediatePropagation();
          openTestConfigModal();
        };
      }
    });
  }, 300);

  function openTestConfigModal() {
    let m = document.getElementById("saTestCfgModal");
    if (m) m.remove();
    m = document.createElement("div");
    m.id = "saTestCfgModal";
    m.className = "modal active";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;padding:14px;z-index:10000;box-sizing:border-box;";
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    const tasksOpt = `
      <option value="random_pool">🎲 Рандом из выбранных</option>
      <option value="custom_seq">🧩 Своя точная очередь</option>
      <option value="marathon">🔥 Все 15 заданий подряд</option>
      <option value="none">0. Без заданий</option>
      <option value="math">1. Математика</option>
      <option value="logic">6. Логическая загадка</option>
      <option value="stroop">9. Тест Струпа</option>
      <option value="eq">15. Уравнение X</option>
    `;
    m.innerHTML = `
      <div style="width:100%;max-width:360px;background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:16px;box-sizing:border-box;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <b style="font-size:17px;">🧪 Настройка теста</b>
          <button type="button" id="tCfgClose" class="btn btn-sec btn-sm" style="min-height:34px;padding:0 10px;">✕</button>
        </div>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Сколько заданий выполнить (0–15)</label>
        <input type="number" id="tCfgCount" min="0" max="15" value="2" style="width:100%;margin-bottom:10px;min-height:42px;">
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Какие задания</label>
        <select id="tCfgTask" style="width:100%;margin-bottom:10px;min-height:42px;">${tasksOpt}</select>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Музыка для теста (120 звуков)</label>
        <select id="tCfgSound" style="width:100%;margin-bottom:14px;min-height:42px;">
          <option value="random">🎲 Случайная (без повторов)</option>
          ${list120}
        </select>
        <button type="button" id="tCfgRun" class="btn" style="width:100%;min-height:48px;font-size:16px;">▶️ Запустить тест</button>
      </div>
    `;
    document.body.appendChild(m);
    document.getElementById("tCfgClose").onclick = () => m.remove();
    document.getElementById("tCfgRun").onclick = () => {
      const cnt = Math.min(15, Math.max(0, Number(document.getElementById("tCfgCount").value) || 0));
      const tType = cnt === 0 ? "none" : document.getElementById("tCfgTask").value;
      const snd = document.getElementById("tCfgSound").value;
      m.remove();
      if (window.triggerRing) {
        window.triggerRing("🧪 ТЕСТОВЫЙ БУДИЛЬНИК", snd, tType, 2, Math.max(1, cnt));
      }
    };
  }
})();
(function purgeSirenAndFixTest() {
  window.startRingingSound = sid => window.SoundPack && window.SoundPack.play(sid || "random", Number(localStorage.getItem("sa_vol") || 50), window.db || null);
  window.stopRingingSound = () => window.SoundPack && window.SoundPack.stop();
  window.playBuiltInSiren = sid => window.startRingingSound(sid);

  window.openTestConfigModal = function() {
    let m = document.getElementById("saTestCfgModal");
    if (m) m.remove();
    m = document.createElement("div");
    m.id = "saTestCfgModal";
    m.className = "modal active";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;padding:14px;z-index:20000;box-sizing:border-box;";
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    const tasksOpt = `
      <option value="random_pool">🎲 Рандом из выбранных</option>
      <option value="custom_seq">🧩 Своя точная очередь</option>
      <option value="marathon">🔥 Все 15 заданий подряд</option>
      <option value="none">0. Без заданий</option>
      <option value="math">1. Математика</option>
      <option value="code">2. Код тревоги</option>
      <option value="tiles">3. Плитки памяти</option>
      <option value="memory">4. Найди пары</option>
      <option value="targets">5. Раздави мишени</option>
      <option value="logic">6. Логическая загадка</option>
      <option value="sort">8. Сортировка чисел</option>
      <option value="stroop">9. Тест Струпа</option>
      <option value="seq">10. Продолжи ряд</option>
      <option value="reverse">11. Слово наоборот</option>
      <option value="eq">15. Уравнение X</option>
    `;
    m.innerHTML = `
      <div style="width:100%;max-width:360px;background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:16px;box-sizing:border-box;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <b style="font-size:17px;">🧪 Настройка теста</b>
          <button type="button" id="tCfgClose" class="btn btn-sec btn-sm" style="min-height:34px;padding:0 10px;">✕</button>
        </div>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Сколько заданий выполнить (0–15)</label>
        <input type="number" id="tCfgCount" min="0" max="15" value="2" style="width:100%;margin-bottom:10px;min-height:42px;">
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Какие задания</label>
        <select id="tCfgTask" style="width:100%;margin-bottom:10px;min-height:42px;">${tasksOpt}</select>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Музыка для теста (120 звуков, без сирены)</label>
        <select id="tCfgSound" style="width:100%;margin-bottom:14px;min-height:42px;">
          <option value="random">🎲 Случайная (без повторов)</option>
          ${list120}
        </select>
        <button type="button" id="tCfgRun" class="btn" style="width:100%;min-height:48px;font-size:16px;">▶️ Запустить тест</button>
      </div>
    `;
    document.body.appendChild(m);
    document.getElementById("tCfgClose").onclick = () => m.remove();
    document.getElementById("tCfgRun").onclick = () => {
      const cnt = Math.min(15, Math.max(0, Number(document.getElementById("tCfgCount").value) || 0));
      const tType = cnt === 0 ? "none" : document.getElementById("tCfgTask").value;
      const snd = document.getElementById("tCfgSound").value;
      m.remove();
      if (window.triggerRing) {
        window.triggerRing("🧪 ТЕСТОВЫЙ БУДИЛЬНИК", snd, tType, 2, Math.max(1, cnt));
      }
    };
  };

  window.testAlarm = () => window.openTestConfigModal();
  document.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b && b.innerText && b.innerText.trim().toLowerCase().includes("тест") && !b.closest("#saTestCfgModal")) {
      e.preventDefault(); e.stopImmediatePropagation();
      window.openTestConfigModal();
    }
  }, true);
})();
(function purgeSirenAndLockTest() {
  window.startRingingSound = sid => window.SoundPack && window.SoundPack.play(sid || "random", Number(localStorage.getItem("sa_vol") || 50), window.db || null);
  window.stopRingingSound = () => {
    if (window.SoundPack) window.SoundPack.stop();
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, 50, false);
  };
  window.playBuiltInSiren = sid => window.startRingingSound(sid);

  window.openTestConfigModal = function() {
    let m = document.getElementById("saTestCfgModal");
    if (m) m.remove();
    m = document.createElement("div");
    m.id = "saTestCfgModal";
    m.className = "modal active";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;padding:14px;z-index:20000;box-sizing:border-box;";
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    const tasksOpt = `
      <option value="random_pool">🎲 Рандом из выбранных</option>
      <option value="custom_seq">🧩 Своя точная очередь</option>
      <option value="marathon">🔥 Все 15 заданий подряд</option>
      <option value="none">0. Без заданий (без блокировки)</option>
      <option value="math">1. Математика</option>
      <option value="code">2. Код тревоги</option>
      <option value="tiles">3. Плитки памяти</option>
      <option value="memory">4. Найди пары</option>
      <option value="targets">5. Раздави мишени</option>
      <option value="logic">6. Логическая загадка</option>
      <option value="sort">8. Сортировка чисел</option>
      <option value="stroop">9. Тест Струпа</option>
      <option value="seq">10. Продолжи ряд</option>
      <option value="reverse">11. Слово наоборот</option>
      <option value="eq">15. Уравнение X</option>
    `;
    m.innerHTML = `
      <div style="width:100%;max-width:360px;background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:16px;box-sizing:border-box;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <b style="font-size:17px;">🧪 Настройка теста (прямо сейчас)</b>
          <button type="button" id="tCfgClose" class="btn btn-sec btn-sm" style="min-height:34px;padding:0 10px;">✕</button>
        </div>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Сколько заданий выполнить (0–15)</label>
        <input type="number" id="tCfgCount" min="0" max="15" value="2" style="width:100%;margin-bottom:10px;min-height:42px;">
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Какие задания</label>
        <select id="tCfgTask" style="width:100%;margin-bottom:10px;min-height:42px;">${tasksOpt}</select>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Музыка для теста (120 звуков, без сирены)</label>
        <select id="tCfgSound" style="width:100%;margin-bottom:14px;min-height:42px;">
          <option value="random">🎲 Случайная (без повторов)</option>
          ${list120}
        </select>
        <button type="button" id="tCfgRun" class="btn" style="width:100%;min-height:48px;font-size:16px;">▶️ Запустить тест</button>
      </div>
    `;
    document.body.appendChild(m);
    document.getElementById("tCfgClose").onclick = () => m.remove();
    document.getElementById("tCfgRun").onclick = () => {
      const cnt = Math.min(15, Math.max(0, Number(document.getElementById("tCfgCount").value) || 0));
      const tType = (cnt === 0 || document.getElementById("tCfgTask").value === "none") ? "none" : document.getElementById("tCfgTask").value;
      const snd = document.getElementById("tCfgSound").value;
      const vol = Number(localStorage.getItem("sa_vol") || 50);
      const shouldLock = (tType !== "none" && cnt > 0);
      m.remove();

      // Запускаем будильник прямо сейчас и принудительно включаем тихую авто-блокировку, если есть задания
      if (window.triggerRing) {
        window.triggerRing("🧪 ТЕСТОВЫЙ БУДИЛЬНИК", snd, tType, 2, Math.max(1, cnt));
      }
      setTimeout(() => {
        if (window.AndroidLock && window.AndroidLock.setRinging) {
          window.AndroidLock.setRinging(true, vol, shouldLock);
        }
      }, 150);
    };
  };

  window.testAlarm = () => window.openTestConfigModal();
  document.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b && b.innerText && b.innerText.trim().toLowerCase().includes("тест") && !b.closest("#saTestCfgModal")) {
      e.preventDefault(); e.stopImmediatePropagation();
      window.openTestConfigModal();
    }
  }, true);
})();