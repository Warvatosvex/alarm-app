(function cleanFullApp() {
  window.playBuiltInSiren = () => {};
  window.startRingingSound = sid => window.SoundPack && window.SoundPack.play(sid || "random", Number(localStorage.getItem("sa_vol") || 55), window.db || null, false);
  window.stopRingingSound = () => window.SoundPack && window.SoundPack.stop();
  if (window.SoundPack) window.SoundPack.stop();

  const TASKS_15 = Array.of(
    Array.of("math","1. Математика (умножение)"), Array.of("code","2. Код тревоги"), Array.of("tiles","3. Плитки памяти"),
    Array.of("memory","4. Найди пары"), Array.of("targets","5. Раздави мишени"), Array.of("logic","6. Логическая загадка"),
    Array.of("odd","7. Найди лишнее"), Array.of("sort","8. Сортировка чисел"), Array.of("stroop","9. Тест Струпа"),
    Array.of("seq","10. Продолжи ряд"), Array.of("reverse","11. Слово наоборот"), Array.of("emoji","12. Поиск эмодзи"),
    Array.of("count","13. Быстрый счёт"), Array.of("compare","14. Что больше?"), Array.of("eq","15. Уравнение X")
  );
  const ALL_IDS = TASKS_15.map(x => x.at(0));

  function drawTask(t, diff, box, onOk, onFail) {
    diff = Math.max(1, Math.min(20, Number(diff) || 6));
    if (t === "none") {
      const mins = Math.max(1, Number(localStorage.getItem("sa_snooze_min") || 5));
      box.innerHTML = `<div style="text-align:center;padding:6px 0;">
        <div style="font-size:15px;color:#8b92a5;margin-bottom:16px;">Будильник без заданий</div>
        <button type="button" id="saZeroStop" class="btn" style="width:100%;min-height:60px;font-size:19px;font-weight:900;background:#10b981;color:#fff;border:none;border-radius:14px;margin-bottom:10px;">✅ ВЫКЛЮЧИТЬ БУДИЛЬНИК</button>
        <button type="button" id="saZeroSnz" class="btn btn-sec" style="width:100%;min-height:48px;font-size:15px;border-radius:14px;">💤 Отложить на ${mins} мин</button></div>`;
      document.getElementById("saZeroStop").onclick = onOk;
      document.getElementById("saZeroSnz").onclick = () => {
        onOk();
        setTimeout(() => window.launchLockedAlarmScreen("💤 ПОВТОР БУДИЛЬНИКА", "random", "none", 0, diff), mins * 60000);
      };
      return;
    }
    if (t === "code") {
      const len = diff <= 6 ? 4 : (diff <= 14 ? 5 : 6);
      const code = String(Math.floor(Math.pow(10, len-1) + Math.random()*9*Math.pow(10, len-1)));
      box.innerHTML = `<h3 style="text-align:center;">Введите код тревоги:</h3><div style="font-size:32px;font-weight:900;letter-spacing:4px;text-align:center;color:#ff2a4b;margin:12px 0;">${code}</div>
        <input type="number" id="ansIn" placeholder="Цифры" style="width:100%;text-align:center;font-size:20px;min-height:46px;"><button type="button" id="ansBtn" class="btn" style="width:100%;margin-top:10px;min-height:48px;">Проверить</button>`;
      document.getElementById("ansBtn").onclick = () => document.getElementById("ansIn").value.trim() === code ? onOk() : onFail(); return;
    }
    if (t === "targets") {
      let left = 4 + Math.floor(diff / 3);
      box.innerHTML = `<h3 style="text-align:center;">Нажмите на мишени (<b id="tgL">${left}</b>):</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;">
        ${Array.from({length:left},()=>`<button type="button" class="btn btn-sec tg-b" style="font-size:24px;min-height:52px;">🎯</button>`).join("")}</div>`;
      box.querySelectorAll(".tg-b").forEach(b => b.onclick = () => { if(b.disabled)return; b.disabled=true; b.innerText="✅"; b.style.opacity="0.3"; left--; document.getElementById("tgL").innerText=left; if(left<=0)onOk(); }); return;
    }
    if (t === "stroop") {
      const cs = Array.of({n:"КРАСНЫЙ",c:"#ff2a4b"},{n:"СИНИЙ",c:"#3b82f6"},{n:"ЗЕЛЁНЫЙ",c:"#10b981"},{n:"ЖЁЛТЫЙ",c:"#f59e0b"});
      const w = cs[Math.floor(Math.random()*4)], ink = cs[Math.floor(Math.random()*4)];
      box.innerHTML = `<h3 style="text-align:center;">Нажмите на ЦВЕТ текста:</h3><div style="font-size:32px;font-weight:900;text-align:center;margin:14px 0;color:${ink.c};">${w.n}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${cs.map(x=>`<button type="button" class="btn btn-sec st-b" data-c="${x.c}" style="min-height:48px;">${x.n}</button>`).join("")}</div>`;
      box.querySelectorAll(".st-b").forEach(b => b.onclick = () => b.dataset.c === ink.c ? onOk() : onFail()); return;
    }
    if (t === "logic" && window.RIDDLES_BANK) {
      const r = window.RIDDLES_BANK[Math.floor(Math.random() * window.RIDDLES_BANK.length)];
      box.innerHTML = `<h3 style="text-align:center;">${r.q}</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
        ${r.o.map((x,i)=>`<button type="button" class="btn btn-sec rd-b" data-i="${i}" style="min-height:48px;">${x}</button>`).join("")}</div>`;
      box.querySelectorAll(".rd-b").forEach(b => b.onclick = () => Number(b.dataset.i) === r.a ? onOk() : onFail()); return;
    }
    if (t === "eq") {
      const x = 2 + Math.floor(Math.random()*(4 + diff)), k = 2 + Math.floor(diff/3), b = 5 + Math.floor(Math.random()*20);
      box.innerHTML = `<h3 style="text-align:center;">Найдите X:</h3><div style="font-size:30px;font-weight:900;text-align:center;margin:12px 0;">${k}X + ${b} = ${k*x+b}</div>
        <input type="number" id="ansIn" placeholder="X =" style="width:100%;text-align:center;font-size:20px;min-height:46px;"><button type="button" id="ansBtn" class="btn" style="width:100%;margin-top:10px;min-height:48px;">Проверить</button>`;
      document.getElementById("ansBtn").onclick = () => Number(document.getElementById("ansIn").value) === x ? onOk() : onFail(); return;
    }
    let a, b, expr, ans;
    if (diff <= 4) { a = 6 + Math.floor(Math.random()*8); b = 4 + Math.floor(Math.random()*7); ans = a * b; expr = `${a} × ${b}`; }
    else if (diff <= 12) { a = 11 + Math.floor(Math.random()*11); b = 11 + Math.floor(Math.random()*11); ans = a * b; expr = `${a} × ${b}`; }
    else { a = 15 + Math.floor(Math.random()*18); b = 14 + Math.floor(Math.random()*16); const ex = 10 + Math.floor(Math.random()*30); ans = a * b + ex; expr = `${a} × ${b} + ${ex}`; }
    box.innerHTML = `<h3 style="text-align:center;">Решите пример (${diff}/20):</h3><div style="font-size:34px;font-weight:900;text-align:center;margin:12px 0;">${expr} = ?</div>
      <input type="number" id="ansIn" placeholder="Ответ" style="width:100%;text-align:center;font-size:20px;min-height:46px;"><button type="button" id="ansBtn" class="btn" style="width:100%;margin-top:10px;min-height:48px;">Проверить</button>`;
    document.getElementById("ansBtn").onclick = () => Number(document.getElementById("ansIn").value) === ans ? onOk() : onFail();
  }

  window.launchLockedAlarmScreen = function(title, snd, tType, cnt, diff) {
    const vol = Number(localStorage.getItem("sa_vol") || 55);
    const isZero = (!tType || tType === "none" || Number(cnt) === 0);
    let queue = isZero ? Array.of("none") : (tType === "marathon" ? Array.from(ALL_IDS) : Array.from({length: Number(cnt)||1}, () => tType === "random_pool" ? ALL_IDS[Math.floor(Math.random()*ALL_IDS.length)] : tType));
    window.ringQueue = queue;

    if (window.SoundPack) window.SoundPack.play(snd, vol, window.db || null, false);
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(true, vol, !isZero);

    let ov = document.getElementById("saFullLockScreen"); if (ov) ov.remove();
    ov = document.createElement("div"); ov.id = "saFullLockScreen";
    ov.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:#0d0f17;z-index:999999;display:flex;flex-direction:column;justify-content:space-between;padding:18px;box-sizing:border-box;color:#fff;overflow-y:auto;";
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    ov.innerHTML = `
      <div>
        <div style="text-align:center;color:#ff2a4b;font-weight:800;font-size:14px;">${title}</div>
        <div style="text-align:center;font-size:48px;font-weight:900;margin:4px 0;">${new Date().toTimeString().slice(0,5)}</div>
        <div id="saLockProg" style="text-align:center;font-size:14px;color:#10b981;font-weight:700;margin-bottom:10px;"></div>
        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <select id="saLockSndSel" style="flex:1;min-height:40px;font-size:13px;"><option value="random">🎲 Случайная мелодия</option>${list120}</select>
          <button type="button" id="saLockNextSnd" class="btn btn-sec btn-sm" style="min-height:40px;padding:0 12px;">🔀</button>
        </div>
      </div>
      <div id="saLockTaskBox" style="background:#161822;border:2px solid #2a2e3d;border-radius:18px;padding:16px;margin:auto 0;"></div>
      <div style="text-align:center;font-size:12px;color:#8b92a5;margin-top:10px;">${!isZero ? "🔒 Экран заблокирован до решения заданий" : "🔓 Обычный звонок"}</div>`;
    document.body.appendChild(ov);

    const sSel = document.getElementById("saLockSndSel");
    if (window.SoundPack) sSel.value = window.SoundPack.getCurrentId();
    sSel.onchange = () => window.SoundPack && window.SoundPack.play(sSel.value, vol, window.db||null, false);
    document.getElementById("saLockNextSnd").onclick = () => { if (window.SoundPack) { window.SoundPack.play("random", vol, window.db||null, false); sSel.value = window.SoundPack.getCurrentId(); } };

    let step = 0; const tBox = document.getElementById("saLockTaskBox"), prog = document.getElementById("saLockProg");
    const finishAll = () => { if (window.SoundPack) window.SoundPack.stop(); if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, vol, false); ov.remove(); };
    const showStep = () => {
      if (step >= queue.length) { finishAll(); return; }
      prog.innerText = !isZero ? `Задание ${step + 1} из ${queue.length}` : "Без заданий";
      drawTask(queue[step], diff, tBox, () => { step++; showStep(); }, () => { tBox.style.borderColor = "#ff2a4b"; setTimeout(() => tBox.style.borderColor = "#2a2e3d", 350); });
    };
    showStep();
  };
  setInterval(() => {
    document.querySelectorAll(".modal select").forEach(sel => {
      if (sel.dataset.ok15 || sel.classList.contains("sa-mel-sel")) return;
      const h = sel.innerHTML.toLowerCase();
      if (h.includes("math") || h.includes("математ") || h.includes("code")) {
        sel.dataset.ok15 = "1";
        sel.innerHTML = `<option value="none">0. Без заданий</option><option value="random_pool">🎲 Случайные</option><option value="marathon">🔥 Все 15 подряд</option>` + TASKS_15.map(x => `<option value="${x.at(0)}">${x.at(1)}</option>`).join("");
      }
      if (h.includes("лёгк") || h.includes("легк") || h.includes("средн")) {
        sel.dataset.ok15 = "1";
        sel.innerHTML = Array.from({length: 20}, (_, i) => `<option value="${i+1}" ${i+1===6?'selected':''}>Сложность ${i+1} / 20</option>`).join("");
      }
    });

    document.querySelectorAll('.modal input[type="file"]').forEach(fileIn => {
      const wrap = fileIn.parentElement;
      if (!wrap || wrap.dataset.melReady) return;
      wrap.dataset.melReady = "1";
      const list120 = window.SoundPack ? window.SoundPack.list.map(m => `<option value="${m.id}">🎵 ${m.name}</option>`).join("") : "";
      const curV = localStorage.getItem("sa_vol") || "55";
      const box = document.createElement("div");
      box.style.cssText = "margin-bottom:12px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
      box.innerHTML = `
        <label style="display:block;margin-bottom:6px;font-size:12px;color:#8b92a5;">Мелодия (120 комфортных звуков)</label>
        <select class="sa-mel-sel" style="width:100%;margin-bottom:8px;"><option value="random">🎲 Случайная мелодия</option>${list120}</select>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <button type="button" class="btn btn-sec btn-sm m-rnd" style="flex:1;min-height:38px;">🎲 Рандом</button>
          <button type="button" class="btn btn-sec btn-sm m-prv" style="flex:1;min-height:38px;">▶️ Слушать</button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span>🔊 <b class="m-vl">${curV}%</b></span><input type="range" class="m-vr" min="10" max="100" value="${curV}" style="flex:1;min-height:28px;"></div>`;
      wrap.before(box);
      const sel = box.querySelector(".sa-mel-sel"); sel.value = localStorage.getItem("sa_last_sound") || "random";
      sel.onchange = () => localStorage.setItem("sa_last_sound", sel.value);
      box.querySelector(".m-rnd").onclick = () => { sel.value = "random"; localStorage.setItem("sa_last_sound", "random"); };
      let pl = false;
      box.querySelector(".m-prv").onclick = e => {
        pl = !pl;
        if (pl) { window.SoundPack.play(sel.value, Number(localStorage.getItem("sa_vol")||55), window.db||null, true); e.target.innerText = "⏹ Стоп"; }
        else { window.SoundPack.stop(); e.target.innerText = "▶️ Слушать"; }
      };
      box.querySelector(".m-vr").oninput = e => { localStorage.setItem("sa_vol", e.target.value); box.querySelector(".m-vl").innerText = e.target.value + "%"; };
    });
  }, 300);
  window.openTestConfigModal = function() {
    let m = document.getElementById("saTestCfgModal"); if (m) m.remove();
    m = document.createElement("div"); m.id = "saTestCfgModal";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;padding:14px;z-index:20000;box-sizing:border-box;";
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    const curV = localStorage.getItem("sa_vol") || "55";
    m.innerHTML = `
      <div style="width:100%;max-width:360px;background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:16px;box-sizing:border-box;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><b style="font-size:17px;">🧪 Тест будильника</b><button type="button" id="tCfgClose" class="btn btn-sec btn-sm" style="min-height:34px;padding:0 10px;">✕</button></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div><label style="font-size:12px;color:#8b92a5;">Заданий (0–15)</label><input type="number" id="tCfgCount" min="0" max="15" value="2" style="width:100%;min-height:42px;"></div>
          <div><label style="font-size:12px;color:#8b92a5;">Сложность (1–20)</label><input type="number" id="tCfgDiff" min="1" max="20" value="6" style="width:100%;min-height:42px;"></div>
        </div>
        <select id="tCfgTask" style="width:100%;margin-bottom:10px;min-height:42px;">
          <option value="random_pool">🎲 Случайные</option><option value="marathon">🔥 Все 15 подряд</option><option value="none">0. Без заданий</option>
          ${TASKS_15.map(x => `<option value="${x.at(0)}">${x.at(1)}</option>`).join("")}
        </select>
        <select id="tCfgSound" style="width:100%;margin-bottom:10px;min-height:42px;"><option value="random">🎲 Случайная мелодия</option>${list120}</select>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;margin-bottom:12px;"><span>🔊 <b id="tCfgVT">${curV}%</b></span><input type="range" id="tCfgVR" min="10" max="100" value="${curV}" style="flex:1;"></div>
        <button type="button" id="tCfgRun" class="btn" style="width:100%;min-height:48px;font-size:16px;">▶️ Запустить</button>
      </div>`;
    document.body.appendChild(m);
    document.getElementById("tCfgVR").oninput = e => { localStorage.setItem("sa_vol", e.target.value); document.getElementById("tCfgVT").innerText = e.target.value + "%"; };
    document.getElementById("tCfgClose").onclick = () => m.remove();
    document.getElementById("tCfgRun").onclick = () => {
      const cnt = Math.min(15, Math.max(0, Number(document.getElementById("tCfgCount").value) || 0));
      const diff = Math.min(20, Math.max(1, Number(document.getElementById("tCfgDiff").value) || 6));
      const rawT = document.getElementById("tCfgTask").value;
      const snd = document.getElementById("tCfgSound").value;
      m.remove();
      window.launchLockedAlarmScreen("🧪 ТЕСТОВЫЙ БУДИЛЬНИК", snd, (cnt === 0 || rawT === "none") ? "none" : rawT, rawT === "marathon" ? 15 : cnt, diff);
    };
  };

  window.testAlarm = () => window.openTestConfigModal();
  window.triggerRing = (title, snd, tType, diff, rounds) => window.launchLockedAlarmScreen(title, snd, tType, tType === "marathon" ? 15 : rounds, diff);
  window.onNativeWake = (d) => { d = d || {}; window.launchLockedAlarmScreen(d.title || "⏰ БУДИЛЬНИК", d.sound || "random", d.task || "math", d.task === "none" ? 0 : (d.task === "marathon" ? 15 : (Number(d.rounds) || 1)), d.diff || 6); };

  document.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b && b.innerText && b.innerText.trim().toLowerCase().includes("тест") && !b.closest("#saTestCfgModal") && !b.closest("#saFullLockScreen")) {
      e.preventDefault(); e.stopImmediatePropagation(); window.openTestConfigModal();
    }
  }, true);
})();
(function attachTestPreviewButton() {
  setInterval(() => {
    const tSnd = document.getElementById("tCfgSound");
    if (tSnd && !tSnd.dataset.hasPreviewBtn) {
      tSnd.dataset.hasPreviewBtn = "1";
      const bar = document.createElement("div");
      bar.style.cssText = "display:flex;gap:6px;margin-bottom:10px;";
      bar.innerHTML = `
        <button type="button" id="tCfgPrvBtn" class="btn btn-sec btn-sm" style="flex:1;min-height:38px;">▶️ Прослушать</button>
        <button type="button" id="tCfgRndBtn" class="btn btn-sec btn-sm" style="flex:1;min-height:38px;">🎲 Случайная</button>
      `;
      tSnd.after(bar);

      let playing = false;
      const prvBtn = document.getElementById("tCfgPrvBtn");
      prvBtn.onclick = () => {
        playing = !playing;
        if (playing) {
          const v = Number(localStorage.getItem("sa_vol") || 60);
          if (window.SoundPack) window.SoundPack.play(tSnd.value, v, window.db || null, true);
          prvBtn.innerText = "⏹ Стоп";
        } else {
          if (window.SoundPack) window.SoundPack.stop();
          prvBtn.innerText = "▶️ Прослушать";
        }
      };

      tSnd.addEventListener("change", () => {
        if (playing && window.SoundPack) {
          const v = Number(localStorage.getItem("sa_vol") || 60);
          window.SoundPack.play(tSnd.value, v, window.db || null, true);
        }
      });

      document.getElementById("tCfgRndBtn").onclick = () => {
        tSnd.value = "random";
        if (playing && window.SoundPack) {
          const v = Number(localStorage.getItem("sa_vol") || 60);
          window.SoundPack.play("random", v, window.db || null, true);
        }
      };

      const closeBtn = document.getElementById("tCfgClose");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          playing = false;
          if (window.SoundPack) window.SoundPack.stop();
        });
      }
    }
  }, 250);
})();
(function persistRandomizerAndTestShuffle() {
  setInterval(() => {
    // 1. В настройках будильника восстанавливаем и сохраняем пункт "🎲 Случайная мелодия"
    document.querySelectorAll(".sa-mel-sel").forEach(sel => {
      if (!sel.dataset.rndPersist) {
        sel.dataset.rndPersist = "1";
        if (sel.options.length > 0) {
          sel.options.text = "🎲 Случайная мелодия";
          sel.options.value = "random";
        }
        const modal = sel.closest(".modal");
        const timeIn = modal ? modal.querySelector('input[type="time"], select') : null;
        const map = JSON.parse(localStorage.getItem("sa_per_alarm_snd") || "{}");
        const savedVal = (timeIn && timeIn.value && map[timeIn.value]) ? map[timeIn.value] : (localStorage.getItem("sa_last_sound") || "random");
        sel.value = savedVal;

        const saveSelection = () => {
          localStorage.setItem("sa_last_sound", sel.value);
          if (timeIn && timeIn.value) {
            const curMap = JSON.parse(localStorage.getItem("sa_per_alarm_snd") || "{}");
            curMap[timeIn.value] = sel.value;
            localStorage.setItem("sa_per_alarm_snd", JSON.stringify(curMap));
          }
        };
        sel.addEventListener("change", saveSelection);
        const rndBtn = sel.parentElement ? sel.parentElement.querySelector(".m-rnd") : null;
        if (rndBtn) rndBtn.addEventListener("click", () => { sel.value = "random"; saveSelection(); });
      }
    });

    // 2. В окне Теста будильника добавляем кнопку "🔀 Случайный звук" с отображением названия/номера
    const tSnd = document.getElementById("tCfgSound");
    if (tSnd && !tSnd.dataset.rndTestBound) {
      tSnd.dataset.rndTestBound = "1";
      if (tSnd.options.length > 0) {
        tSnd.options.text = "🎲 Случайная мелодия";
        tSnd.options.value = "random";
      }
      tSnd.value = localStorage.getItem("sa_last_sound") || "random";

      const nextEl = tSnd.nextElementSibling;
      if (nextEl && (nextEl.querySelector("#tCfgPrvBtn") || nextEl.querySelector("#tCfgShuffleBtn"))) {
        nextEl.remove();
      }

      const panel = document.createElement("div");
      panel.style.cssText = "margin-bottom:10px;";
      panel.innerHTML = `
        <div style="display:flex;gap:6px;margin-bottom:6px;">
          <button type="button" id="tCfgPrvBtn" class="btn btn-sec btn-sm" style="flex:1;min-height:38px;">▶️ Слушать</button>
          <button type="button" id="tCfgShuffleBtn" class="btn btn-sec btn-sm" style="flex:1;min-height:38px;">🔀 Случайный звук</button>
        </div>
        <div id="tCfgTrackInfo" style="font-size:12px;color:#10b981;text-align:center;min-height:18px;font-weight:700;"></div>
      `;
      tSnd.after(panel);

      let previewActive = false;
      const prvBtn = document.getElementById("tCfgPrvBtn");
      const infoLbl = document.getElementById("tCfgTrackInfo");

      const showTrackInfo = (tr) => {
        if (tr && tr.name) infoLbl.innerText = "🎵 " + tr.name;
      };

      prvBtn.onclick = () => {
        previewActive = !previewActive;
        const v = Number(localStorage.getItem("sa_vol") || 60);
        if (previewActive) {
          const tr = window.SoundPack ? window.SoundPack.play(tSnd.value, v, window.db || null, true) : null;
          prvBtn.innerText = "⏹ Стоп";
          showTrackInfo(tr);
        } else {
          if (window.SoundPack) window.SoundPack.stop();
          prvBtn.innerText = "▶️ Слушать";
          infoLbl.innerText = "";
        }
      };

      document.getElementById("tCfgShuffleBtn").onclick = () => {
        const v = Number(localStorage.getItem("sa_vol") || 60);
        if (window.SoundPack) {
          const tr = window.SoundPack.play("random", v, window.db || null, true);
          previewActive = true;
          prvBtn.innerText = "⏹ Стоп";
          if (tr && tr.id) tSnd.value = tr.id;
          showTrackInfo(tr);
        }
      };

      tSnd.addEventListener("change", () => {
        localStorage.setItem("sa_last_sound", tSnd.value);
        if (previewActive && window.SoundPack) {
          const v = Number(localStorage.getItem("sa_vol") || 60);
          const tr = window.SoundPack.play(tSnd.value, v, window.db || null, true);
          showTrackInfo(tr);
        }
      });

      const closeBtn = document.getElementById("tCfgClose");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          previewActive = false;
          if (window.SoundPack) window.SoundPack.stop();
        });
      }
    }
  }, 250);
})();
(function guaranteedExactMelodyAudit() {
  // Извлекаем точное время (HH:MM) из открытого модального окна настройки будильника
  function extractModalTime(modal) {
    if (!modal) return "";
    const tIn = modal.querySelector('input[type="time"]');
    if (tIn && tIn.value) return tIn.value.slice(0, 5);
    const selects = Array.from(modal.querySelectorAll("select")).filter(s => !s.classList.contains("sa-mel-sel") && !s.dataset.ok15);
    if (selects.length >= 2 && /^\d{1,2}$/.test(selects.at(0).value) && /^\d{1,2}$/.test(selects.at(1).value)) {
      return String(selects.at(0).value).padStart(2, "0") + ":" + String(selects.at(1).value).padStart(2, "0");
    }
    return "";
  }

  // Сохраняем выбранную мелодию при любом изменении в списке и при нажатии "Сохранить"
  function bindModalMelodyPersistence(modal) {
    const melSel = modal.querySelector(".sa-mel-sel");
    if (!melSel || melSel.dataset.exactBound) return;
    melSel.dataset.exactBound = "1";

    const curTime = extractModalTime(modal);
    const sMap = JSON.parse(localStorage.getItem("sa_per_alarm_snd") || "{}");
    if (curTime && sMap[curTime]) {
      melSel.value = sMap[curTime];
    } else if (localStorage.getItem("sa_last_sound")) {
      melSel.value = localStorage.getItem("sa_last_sound");
    }

    const commitChoice = () => {
      const val = melSel.value || "random";
      localStorage.setItem("sa_last_sound", val);
      const tKey = extractModalTime(modal);
      if (tKey) {
        const updatedMap = JSON.parse(localStorage.getItem("sa_per_alarm_snd") || "{}");
        updatedMap[tKey] = val;
        localStorage.setItem("sa_per_alarm_snd", JSON.stringify(updatedMap));
      }
      if (window.pushExactAlarmSchedule) setTimeout(window.pushExactAlarmSchedule, 120);
    };

    melSel.addEventListener("change", commitChoice);
    modal.querySelectorAll("button").forEach(b => {
      if (b.innerText && b.innerText.includes("Сохранить")) {
        b.addEventListener("click", commitChoice, true);
      }
    });
  }

  setInterval(() => {
    document.querySelectorAll(".modal").forEach(bindModalMelodyPersistence);
  }, 250);

  // Переопределяем планировщик: в Android передаётся СТРОГО выбранная для этого будильника мелодия
  window.pushExactAlarmSchedule = function() {
    if (!window.AndroidLock || !window.AndroidLock.scheduleNextAlarmWithData) return;
    let list = [];
    try {
      if (typeof alarms !== "undefined" && Array.isArray(alarms)) list = alarms;
      else list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]");
    } catch (e) {}

    const sndMap = JSON.parse(localStorage.getItem("sa_per_alarm_snd") || "{}");
    const zeroMap = JSON.parse(localStorage.getItem("sa_zero_alarms") || "{}");
    const fallbackSnd = localStorage.getItem("sa_last_sound") || "random";
    const now = new Date();
    let bestTs = 0, bestPayload = null;

    list.filter(a => a && a.enabled).forEach(a => {
      const parts = String(a.time || "07:00").split(":");
      const hh = Number(parts.at(0)) || 0, mm = Number(parts.at(1)) || 0;
      const tNorm = String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
      const days = Array.isArray(a.days) ? a.days : [];

      for (let d = 0; d <= 7; d++) {
        const cand = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hh, mm, 0, 0);
        if (cand.getTime() > now.getTime() && (days.length === 0 || days.includes(cand.getDay()))) {
          if (bestTs === 0 || cand.getTime() < bestTs) {
            bestTs = cand.getTime();
            const isZ = Boolean(zeroMap[tNorm] || zeroMap[a.time] || a.task === "none");
            const exactSound = sndMap[tNorm] || sndMap[a.time] || (a.sound && a.sound.startsWith("mel_") ? a.sound : fallbackSnd);
            bestPayload = {
              title: "⏰ БУДИЛЬНИК " + tNorm,
              sound: exactSound,
              task: isZ ? "none" : (a.task || "math"),
              diff: Number(a.diff) || 6,
              rounds: isZ ? 0 : (Number(a.rounds) || 1)
            };
          }
          break;
        }
      }
    });

    if (bestTs > 0 && bestPayload) {
      window.AndroidLock.scheduleNextAlarmWithData(bestTs, JSON.stringify(bestPayload));
    } else {
      window.AndroidLock.scheduleNextAlarmWithData(0, "{}");
    }
  };

  // Гарантируем, что при срабатывании будильника запускается переданная мелодия (а не случайная, если выбрана конкретная)
  window.onNativeWake = function(d) {
    d = d || {};
    const sndMap = JSON.parse(localStorage.getItem("sa_per_alarm_snd") || "{}");
    const timeMatch = String(d.title || "").match(/(\d{2}:\d{2})/);
    const tKey = timeMatch ? timeMatch.at(1) : "";
    const resolvedSound = (d.sound && d.sound !== "random") ? d.sound : (sndMap[tKey] || d.sound || localStorage.getItem("sa_last_sound") || "random");
    const isZ = (d.task === "none" || Number(d.rounds) === 0);
    window.launchLockedAlarmScreen(
      d.title || "⏰ БУДИЛЬНИК",
      resolvedSound,
      isZ ? "none" : (d.task || "math"),
      isZ ? 0 : (d.task === "marathon" ? 15 : (Number(d.rounds) || 1)),
      Number(d.diff) || 6
    );
    setTimeout(window.pushExactAlarmSchedule, 1000);
  };
})();
(function integrateLogic25AndDucking() {
  let duckTimer = null;
  function duckVolumeOnActivity() {
    if (!document.getElementById("saFullLockScreen")) return;
    const baseVol = Number(localStorage.getItem("sa_vol") || 60);
    const duckVol = Math.max(12, Math.round(baseVol * 0.25));
    if (window.AndroidLock && window.AndroidLock.setVolume) window.AndroidLock.setVolume(duckVol);
    document.querySelectorAll("audio").forEach(a => { try { a.volume = duckVol / 100; } catch (e) {} });

    clearTimeout(duckTimer);
    duckTimer = setTimeout(() => {
      if (!document.getElementById("saFullLockScreen")) return;
      if (window.AndroidLock && window.AndroidLock.setVolume) window.AndroidLock.setVolume(baseVol);
      document.querySelectorAll("audio").forEach(a => { try { a.volume = Math.min(1, baseVol / 100); } catch (e) {} });
    }, 6000);
  }

  document.addEventListener("input", duckVolumeOnActivity, true);
  document.addEventListener("pointerdown", e => {
    if (e.target.closest("#saLockTaskBox")) duckVolumeOnActivity();
  }, true);

  setInterval(() => {
    document.querySelectorAll(".modal").forEach(modal => {
      if (modal.id === "saTestCfgModal" || modal.querySelector("#saLogic25Box")) return;
      const melSel = modal.querySelector(".sa-mel-sel");
      if (!melSel) return;

      const enabled = localStorage.getItem("sa_logic25_on") === "1";
      const count = Number(localStorage.getItem("sa_logic25_cnt") || 2);

      const box = document.createElement("div");
      box.id = "saLogic25Box";
      box.style.cssText = "margin-bottom:12px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
      box.innerHTML = `
        <label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-size:13px;font-weight:700;">
          <span>🧠 Логические задания при пробуждении</span>
          <input type="checkbox" id="saL25Chk" ${enabled ? "checked" : ""} style="width:20px;height:20px;accent-color:#10b981;">
        </label>
        <div id="saL25Sub" style="display:${enabled ? "flex" : "none"};align-items:center;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid #2a2e3d;font-size:12px;color:#8b92a5;">
          <span>Количество задач подряд (1–5):</span>
          <select id="saL25Cnt" style="width:80px;min-height:34px;padding:2px 6px;">
            <option value="1" ${count===1?"selected":""}>1</option>
            <option value="2" ${count===2?"selected":""}>2</option>
            <option value="3" ${count===3?"selected":""}>3</option>
            <option value="4" ${count===4?"selected":""}>4</option>
            <option value="5" ${count===5?"selected":""}>5</option>
          </select>
        </div>`;
      melSel.parentElement.before(box);

      const chk = box.querySelector("#saL25Chk");
      const sub = box.querySelector("#saL25Sub");
      const cntSel = box.querySelector("#saL25Cnt");
      chk.onchange = () => { localStorage.setItem("sa_logic25_on", chk.checked ? "1" : "0"); sub.style.display = chk.checked ? "flex" : "none"; };
      cntSel.onchange = () => localStorage.setItem("sa_logic25_cnt", cntSel.value);
    });

    const testRunBtn = document.getElementById("tCfgRun");
    if (testRunBtn && !document.getElementById("tCfgL25Box")) {
      const enabled = localStorage.getItem("sa_logic25_on") === "1";
      const count = Number(localStorage.getItem("sa_logic25_cnt") || 2);
      const lBox = document.createElement("div");
      lBox.id = "tCfgL25Box";
      lBox.style.cssText = "margin-bottom:10px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
      lBox.innerHTML = `
        <label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-size:13px;font-weight:700;">
          <span>🧠 Логические задачи (25 шт.)</span>
          <input type="checkbox" id="tCfgL25Chk" ${enabled ? "checked" : ""} style="width:20px;height:20px;accent-color:#10b981;">
        </label>
        <div id="tCfgL25Sub" style="display:${enabled ? "block" : "none"};margin-top:8px;padding-top:8px;border-top:1px solid #2a2e3d;">
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#8b92a5;margin-bottom:8px;">
            <span>Задач подряд:</span>
            <select id="tCfgL25Cnt" style="width:80px;min-height:34px;">
              <option value="1" ${count===1?"selected":""}>1</option>
              <option value="2" ${count===2?"selected":""}>2</option>
              <option value="3" ${count===3?"selected":""}>3</option>
              <option value="4" ${count===4?"selected":""}>4</option>
              <option value="5" ${count===5?"selected":""}>5</option>
            </select>
          </div>
          <button type="button" id="tCfgTryOneL25" class="btn btn-sec btn-sm" style="width:100%;min-height:36px;">🧪 Протестировать случайную задачу</button>
        </div>`;
      testRunBtn.before(lBox);

      const tChk = document.getElementById("tCfgL25Chk"), tSub = document.getElementById("tCfgL25Sub"), tCnt = document.getElementById("tCfgL25Cnt");
      tChk.onchange = () => { localStorage.setItem("sa_logic25_on", tChk.checked ? "1" : "0"); tSub.style.display = tChk.checked ? "block" : "none"; };
      tCnt.onchange = () => localStorage.setItem("sa_logic25_cnt", tCnt.value);
      document.getElementById("tCfgTryOneL25").onclick = () => {
        const snd = document.getElementById("tCfgSound")?.value || "random";
        document.getElementById("saTestCfgModal")?.remove();
        window.launchLogic25AlarmScreen("🧪 ТЕСТ ЛОГИЧЕСКОЙ ЗАДАЧИ", snd, 1);
      };
      testRunBtn.addEventListener("click", e => {
        if (tChk.checked) {
          e.preventDefault(); e.stopImmediatePropagation();
          const snd = document.getElementById("tCfgSound")?.value || "random";
          document.getElementById("saTestCfgModal")?.remove();
          window.launchLogic25AlarmScreen("🧪 ТЕСТ: ЛОГИЧЕСКИЕ ЗАДАЧИ", snd, Number(tCnt.value) || 2);
        }
      }, true);
    }
  }, 250);
  window.launchLogic25AlarmScreen = function(title, snd, totalCount) {
    const vol = Number(localStorage.getItem("sa_vol") || 60);
    totalCount = Math.max(1, Math.min(25, Number(totalCount) || 2));
    window.ringQueue = Array.from({length: totalCount}, () => "logic25");

    if (window.SoundPack) window.SoundPack.play(snd, vol, window.db || null, false);
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(true, vol, true);

    let ov = document.getElementById("saFullLockScreen"); if (ov) ov.remove();
    ov = document.createElement("div"); ov.id = "saFullLockScreen";
    ov.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:#0d0f17;z-index:999999;display:flex;flex-direction:column;justify-content:space-between;padding:18px;box-sizing:border-box;color:#fff;overflow-y:auto;";
    const curName = window.SoundPack && window.SoundPack.getCurrentName ? window.SoundPack.getCurrentName() : "Мелодия будильника";
    ov.innerHTML = `
      <div>
        <div style="text-align:center;color:#ff2a4b;font-weight:800;font-size:14px;">${title}</div>
        <div style="text-align:center;font-size:46px;font-weight:900;margin:4px 0;">${new Date().toTimeString().slice(0,5)}</div>
        <div id="saLockProg" style="text-align:center;font-size:14px;color:#10b981;font-weight:700;"></div>
        <div style="text-align:center;font-size:12px;color:#8b92a5;margin-top:4px;">🎵 ${curName}</div>
      </div>
      <div id="saLockTaskBox" style="background:#161822;border:2px solid #2a2e3d;border-radius:18px;padding:16px;margin:auto 0;"></div>
      <div style="text-align:center;font-size:12px;color:#8b92a5;">🔒 Решите все логические задачи, чтобы выключить сигнал</div>
    `;
    document.body.appendChild(ov);

    let step = 0;
    const tBox = document.getElementById("saLockTaskBox");
    const prog = document.getElementById("saLockProg");

    const showNext = () => {
      if (step >= totalCount) {
        clearTimeout(duckTimer);
        if (window.SoundPack) window.SoundPack.stop();
        if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, vol, false);
        ov.remove();
        return;
      }
      prog.innerText = `Задача ${step + 1} из ${totalCount}`;
      if (window.Logic25Pack) {
        window.Logic25Pack.render(tBox, () => {
          step++;
          showNext();
        }, () => {
          tBox.style.borderColor = "#ff2a4b";
          if (window.AndroidLock && window.AndroidLock.setVolume) window.AndroidLock.setVolume(vol);
          document.querySelectorAll("audio").forEach(a => { try { a.volume = Math.min(1, vol / 100); } catch (e) {} });
          setTimeout(() => tBox.style.borderColor = "#2a2e3d", 400);
        });
      }
    };
    showNext();
  };

  const prevWake = window.onNativeWake;
  window.onNativeWake = function(d) {
    d = d || {};
    if (localStorage.getItem("sa_logic25_on") === "1" && window.Logic25Pack) {
      const cnt = Number(localStorage.getItem("sa_logic25_cnt") || 2);
      const snd = (d.sound && d.sound !== "random") ? d.sound : (localStorage.getItem("sa_last_sound") || "random");
      window.launchLogic25AlarmScreen(d.title || "⏰ БУДИЛЬНИК", snd, cnt);
      if (window.pushExactAlarmSchedule) setTimeout(window.pushExactAlarmSchedule, 1000);
      return;
    }
    if (prevWake) prevWake(d);
  };
})();
(function logic25QueueConstructor() {
  window.getLogic25Config = function() {
    const mode = localStorage.getItem("sa_l25_mode") || "random"; // "none" | "random" | "custom"
    const rndCnt = Math.max(1, Math.min(25, Number(localStorage.getItem("sa_l25_rnd_cnt") || 2)));
    let queue = [];
    try { queue = JSON.parse(localStorage.getItem("sa_l25_queue") || "[]"); } catch (e) {}
    return { mode, rndCnt, queue };
  };

  window.openLogic25QueueModal = function(onSaveCallback) {
    let m = document.getElementById("saL25QueueModal");
    if (m) m.remove();
    m = document.createElement("div");
    m.id = "saL25QueueModal";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.88);display:flex;justify-content:center;align-items:center;padding:12px;z-index:25000;box-sizing:border-box;";

    let curQueue = Array.from(window.getLogic25Config().queue);
    const allTasks = window.Logic25Pack ? window.Logic25Pack.TASKS : [];

    m.innerHTML = `
      <div style="width:100%;max-width:390px;max-height:92vh;background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:14px;box-sizing:border-box;color:#fff;display:flex;flex-direction:column;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <b style="font-size:16px;">🛠️ Настройка очереди заданий</b>
          <button type="button" id="qModClose" class="btn btn-sec btn-sm" style="min-height:32px;padding:0 10px;">✕</button>
        </div>

        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <button type="button" id="qModAddAll" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;font-size:12px;">➕ Добавить все 25</button>
          <button type="button" id="qModClear" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;font-size:12px;">🗑️ Очистить (0)</button>
        </div>

        <div style="font-size:12px;color:#10b981;font-weight:700;margin-bottom:4px;">Текущая очередь (<span id="qModCount">0</span>):</div>
        <div id="qModActiveList" style="max-height:175px;overflow-y:auto;background:#0f111a;border:1px solid #2a2e3d;border-radius:12px;padding:6px;margin-bottom:10px;"></div>

        <div style="font-size:12px;color:#8b92a5;font-weight:700;margin-bottom:4px;">Доступные задачи (нажмите, чтобы добавить):</div>
        <div id="qModCatalog" style="flex:1;overflow-y:auto;background:#0f111a;border:1px solid #2a2e3d;border-radius:12px;padding:6px;margin-bottom:10px;"></div>

        <button type="button" id="qModSave" class="btn" style="width:100%;min-height:46px;font-size:15px;">💾 Сохранить очередь</button>
      </div>
    `;
    document.body.appendChild(m);

    const activeHost = document.getElementById("qModActiveList");
    const catalogHost = document.getElementById("qModCatalog");
    const cntSpan = document.getElementById("qModCount");

    function renderQueue() {
      cntSpan.innerText = curQueue.length;
      if (curQueue.length === 0) {
        activeHost.innerHTML = `<div style="text-align:center;color:#8b92a5;font-size:12px;padding:12px;">Очередь пуста (0 заданий — отключение сразу)</div>`;
        return;
      }
      activeHost.innerHTML = curQueue.map((tid, idx) => {
        const info = allTasks.find(x => x.id === tid) || { id: tid, title: "Задача #" + tid };
        return `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;padding:5px 6px;border-bottom:1px solid #1f222e;font-size:12px;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><b>${idx + 1}.</b> №${info.id} ${info.title}</span>
            <button type="button" class="btn btn-sec btn-sm q-up" data-i="${idx}" style="min-height:28px;padding:0 6px;">⬆️</button>
            <button type="button" class="btn btn-sec btn-sm q-dn" data-i="${idx}" style="min-height:28px;padding:0 6px;">⬇️</button>
            <button type="button" class="btn btn-sec btn-sm q-rm" data-i="${idx}" style="min-height:28px;padding:0 6px;color:#ff2a4b;">✕</button>
          </div>`;
      }).join("");

      activeHost.querySelectorAll(".q-up").forEach(b => b.onclick = () => {
        const i = Number(b.dataset.i);
        if (i > 0) { const tmp = curQueue.at(i - 1); curQueue[i - 1] = curQueue.at(i); curQueue[i] = tmp; renderQueue(); }
      });
      activeHost.querySelectorAll(".q-dn").forEach(b => b.onclick = () => {
        const i = Number(b.dataset.i);
        if (i < curQueue.length - 1) { const tmp = curQueue.at(i + 1); curQueue[i + 1] = curQueue.at(i); curQueue[i] = tmp; renderQueue(); }
      });
      activeHost.querySelectorAll(".q-rm").forEach(b => b.onclick = () => {
        curQueue.splice(Number(b.dataset.i), 1);
        renderQueue();
      });
    }

    catalogHost.innerHTML = allTasks.map(t => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:6px;border-bottom:1px solid #1f222e;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:12px;font-weight:700;">№${t.id}. ${t.title}</div>
          <div style="font-size:11px;color:#8b92a5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.q}</div>
        </div>
        <button type="button" class="btn btn-sec btn-sm q-add" data-id="${t.id}" style="min-height:30px;padding:0 10px;">➕</button>
      </div>
    `).join("");

    catalogHost.querySelectorAll(".q-add").forEach(b => b.onclick = () => {
      curQueue.push(Number(b.dataset.id));
      renderQueue();
    });

    document.getElementById("qModAddAll").onclick = () => { curQueue = allTasks.map(t => t.id); renderQueue(); };
    document.getElementById("qModClear").onclick = () => { curQueue = []; renderQueue(); };
    document.getElementById("qModClose").onclick = () => m.remove();
    document.getElementById("qModSave").onclick = () => {
      localStorage.setItem("sa_l25_queue", JSON.stringify(curQueue));
      localStorage.setItem("sa_l25_mode", curQueue.length === 0 ? "none" : "custom");
      m.remove();
      if (onSaveCallback) onSaveCallback(curQueue);
    };

    renderQueue();
  };
})();
(function unifyLogic25ModesEverywhere() {
  function buildControlHTML(prefix) {
    const cfg = window.getLogic25Config();
    return `
      <div style="font-size:13px;font-weight:700;margin-bottom:6px;">🧠 Логические задания (25 задач)</div>
      <select id="${prefix}Mode" style="width:100%;min-height:40px;margin-bottom:8px;">
        <option value="none" ${cfg.mode==="none"?"selected":""}>0. Без заданий (0 заданий)</option>
        <option value="random" ${cfg.mode==="random"?"selected":""}>🎲 Случайный порядок (без повторов)</option>
        <option value="custom" ${cfg.mode==="custom"?"selected":""}>🧩 Своя очередь (по желанию)</option>
      </select>
      <div id="${prefix}RndRow" style="display:${cfg.mode==="random"?"flex":"none"};gap:6px;align-items:center;margin-bottom:6px;">
        <span style="font-size:12px;color:#8b92a5;">Кол-во (1–25):</span>
        <input type="number" id="${prefix}RndCnt" min="1" max="25" value="${cfg.rndCnt}" style="width:65px;min-height:36px;text-align:center;">
        <button type="button" id="${prefix}All25Btn" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;font-size:12px;">Все 25 заданий</button>
      </div>
      <div id="${prefix}CustomRow" style="display:${cfg.mode==="custom"?"block":"none"};">
        <button type="button" id="${prefix}OpenQBtn" class="btn btn-sec btn-sm" style="width:100%;min-height:38px;margin-bottom:4px;">🛠️ Настроить очередь заданий</button>
        <div id="${prefix}QSummary" style="font-size:11px;color:#10b981;text-align:center;"></div>
      </div>
    `;
  }

  function wireControl(container, prefix) {
    const modeSel = container.querySelector("#" + prefix + "Mode");
    const rndRow = container.querySelector("#" + prefix + "RndRow");
    const rndCnt = container.querySelector("#" + prefix + "RndCnt");
    const all25Btn = container.querySelector("#" + prefix + "All25Btn");
    const customRow = container.querySelector("#" + prefix + "CustomRow");
    const openQBtn = container.querySelector("#" + prefix + "OpenQBtn");
    const qSummary = container.querySelector("#" + prefix + "QSummary");

    const refresh = () => {
      const cfg = window.getLogic25Config();
      modeSel.value = cfg.mode;
      rndCnt.value = cfg.rndCnt;
      rndRow.style.display = cfg.mode === "random" ? "flex" : "none";
      customRow.style.display = cfg.mode === "custom" ? "block" : "none";
      qSummary.innerText = cfg.queue.length ? `В очереди: ${cfg.queue.length} шт. (${cfg.queue.map(id => "№" + id).join(" → ")})` : "Очередь пуста (0 заданий)";
    };

    modeSel.onchange = () => { localStorage.setItem("sa_l25_mode", modeSel.value); refresh(); };
    rndCnt.oninput = () => {
      const v = Math.max(1, Math.min(25, Number(rndCnt.value) || 1));
      localStorage.setItem("sa_l25_rnd_cnt", String(v));
    };
    all25Btn.onclick = () => { rndCnt.value = "25"; localStorage.setItem("sa_l25_rnd_cnt", "25"); };
    openQBtn.onclick = () => window.openLogic25QueueModal(() => refresh());
    refresh();
  }

  // Встраиваем единую панель в настройки будильника и в окно Теста
  setInterval(() => {
    const oldBox = document.getElementById("saLogic25Box");
    if (oldBox && !oldBox.dataset.v2) {
      oldBox.dataset.v2 = "1";
      oldBox.innerHTML = buildControlHTML("alL25");
      wireControl(oldBox, "alL25");
    }

    const oldTestBox = document.getElementById("tCfgL25Box");
    if (oldTestBox && !oldTestBox.dataset.v2) {
      oldTestBox.dataset.v2 = "1";
      oldTestBox.innerHTML = buildControlHTML("tsL25");
      wireControl(oldTestBox, "tsL25");

      const runBtn = document.getElementById("tCfgRun");
      if (runBtn) {
        runBtn.onclick = (e) => {
          e.preventDefault(); e.stopImmediatePropagation();
          const snd = document.getElementById("tCfgSound")?.value || "random";
          document.getElementById("saTestCfgModal")?.remove();
          window.executeConfiguredLogic25Alarm("🧪 ТЕСТОВЫЙ БУДИЛЬНИК", snd);
        };
      }
    }
  }, 250);

  // Запуск будильника или теста строго по выбранному режиму ("none", "random" без повторов, "custom" по очереди)
  window.executeConfiguredLogic25Alarm = function(title, snd) {
    const cfg = window.getLogic25Config();
    const vol = Number(localStorage.getItem("sa_vol") || 60);

    let taskQueue = [];
    if (cfg.mode === "random" && window.Logic25Pack) {
      taskQueue = window.Logic25Pack.buildRandomQueue(cfg.rndCnt);
    } else if (cfg.mode === "custom") {
      taskQueue = Array.from(cfg.queue);
    }

    // Если режим "0 заданий" или очередь пуста — показываем экран с кнопкой мгновенного отключения
    if (cfg.mode === "none" || taskQueue.length === 0) {
      window.launchLockedAlarmScreen(title, snd, "none", 0, 6);
      return;
    }

    window.ringQueue = taskQueue.map(id => "l25_" + id);
    if (window.SoundPack) window.SoundPack.play(snd, vol, window.db || null, false);
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(true, vol, true);

    let ov = document.getElementById("saFullLockScreen"); if (ov) ov.remove();
    ov = document.createElement("div"); ov.id = "saFullLockScreen";
    ov.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:#0d0f17;z-index:999999;display:flex;flex-direction:column;justify-content:space-between;padding:18px;box-sizing:border-box;color:#fff;overflow-y:auto;";
    const curName = window.SoundPack && window.SoundPack.getCurrentName ? window.SoundPack.getCurrentName() : "Мелодия будильника";
    ov.innerHTML = `
      <div>
        <div style="text-align:center;color:#ff2a4b;font-weight:800;font-size:14px;">${title}</div>
        <div style="text-align:center;font-size:46px;font-weight:900;margin:4px 0;">${new Date().toTimeString().slice(0,5)}</div>
        <div id="saLockProg" style="text-align:center;font-size:14px;color:#10b981;font-weight:700;"></div>
        <div style="text-align:center;font-size:12px;color:#8b92a5;margin-top:4px;">🎵 ${curName}</div>
      </div>
      <div id="saLockTaskBox" style="background:#161822;border:2px solid #2a2e3d;border-radius:18px;padding:16px;margin:auto 0;"></div>
      <div style="text-align:center;font-size:12px;color:#8b92a5;">🔒 Решите всю очередь заданий, чтобы выключить сигнал</div>
    `;
    document.body.appendChild(ov);

    let idx = 0;
    const tBox = document.getElementById("saLockTaskBox");
    const prog = document.getElementById("saLockProg");

    const stepNext = () => {
      if (idx >= taskQueue.length) {
        if (window.SoundPack) window.SoundPack.stop();
        if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, vol, false);
        ov.remove();
        return;
      }
      prog.innerText = `Задание ${idx + 1} из ${taskQueue.length}`;
      window.Logic25Pack.renderById(taskQueue.at(idx), tBox, () => {
        idx++;
        stepNext();
      }, () => {
        tBox.style.borderColor = "#ff2a4b";
        if (window.AndroidLock && window.AndroidLock.setVolume) window.AndroidLock.setVolume(vol);
        document.querySelectorAll("audio").forEach(a => { try { a.volume = Math.min(1, vol / 100); } catch (e) {} });
        setTimeout(() => tBox.style.borderColor = "#2a2e3d", 400);
      });
    };
    stepNext();
  };

  window.onNativeWake = function(d) {
    d = d || {};
    const snd = (d.sound && d.sound !== "random") ? d.sound : (localStorage.getItem("sa_last_sound") || "random");
    window.executeConfiguredLogic25Alarm(d.title || "⏰ БУДИЛЬНИК", snd);
    if (window.pushExactAlarmSchedule) setTimeout(window.pushExactAlarmSchedule, 1000);
  };
})();
(function independent25ProfilesAndStrictLock() {
  window.getProfile25Config = function(profile) {
    const p = profile === "test" ? "test" : "alarm";
    const mode = localStorage.getItem(`sa_l25_${p}_mode`) || "random";
    const singleId = Math.max(1, Math.min(25, Number(localStorage.getItem(`sa_l25_${p}_single_id`) || 1)));
    const rndCnt = Math.max(1, Math.min(25, Number(localStorage.getItem(`sa_l25_${p}_rnd_cnt`) || 2)));
    let queue = [];
    try {
      const raw = localStorage.getItem(`sa_l25_${p}_queue`) || "[]";
      queue = JSON.parse(raw).filter(id => id >= 1 && id <= 25);
    } catch (e) {}
    return { profile: p, mode, singleId, rndCnt, queue };
  };

  window.saveProfile25Config = function(profile, cfg) {
    const p = profile === "test" ? "test" : "alarm";
    if (cfg.mode !== undefined) localStorage.setItem(`sa_l25_${p}_mode`, cfg.mode);
    if (cfg.singleId !== undefined) localStorage.setItem(`sa_l25_${p}_single_id`, String(cfg.singleId));
    if (cfg.rndCnt !== undefined) localStorage.setItem(`sa_l25_${p}_rnd_cnt`, String(cfg.rndCnt));
    if (cfg.queue !== undefined) localStorage.setItem(`sa_l25_${p}_queue`, JSON.stringify(cfg.queue));
  };

  window.openProfile25QueueModal = function(profile, onSaveCb) {
    const p = profile === "test" ? "test" : "alarm";
    let m = document.getElementById("saProfile25QModal");
    if (m) m.remove();
    m = document.createElement("div");
    m.id = "saProfile25QModal";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.88);display:flex;justify-content:center;align-items:center;padding:12px;z-index:27000;box-sizing:border-box;";

    let curQueue = Array.from(window.getProfile25Config(p).queue);
    const allTasks = window.Logic25Pack ? window.Logic25Pack.TASKS : [];
    const titleSuffix = p === "test" ? "Теста" : "Будильника";

    m.innerHTML = `
      <div style="width:100%;max-width:390px;max-height:92vh;background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:14px;box-sizing:border-box;color:#fff;display:flex;flex-direction:column;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <b style="font-size:16px;">🛠️ Очередь 25 задач (${titleSuffix})</b>
          <button type="button" id="pq25Close" class="btn btn-sec btn-sm" style="min-height:32px;padding:0 10px;">✕</button>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <button type="button" id="pq25AddAll" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;font-size:12px;">➕ Все 25 задач</button>
          <button type="button" id="pq25Clear" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;font-size:12px;">🗑️ Очистить (0)</button>
        </div>
        <div style="font-size:12px;color:#10b981;font-weight:700;margin-bottom:4px;">Текущая очередь (<span id="pq25Cnt">0</span>):</div>
        <div id="pq25Active" style="max-height:170px;overflow-y:auto;background:#0f111a;border:1px solid #2a2e3d;border-radius:12px;padding:6px;margin-bottom:10px;"></div>
        <div style="font-size:12px;color:#8b92a5;font-weight:700;margin-bottom:4px;">База из 25 задач (нажмите ➕):</div>
        <div id="pq25Cat" style="flex:1;overflow-y:auto;background:#0f111a;border:1px solid #2a2e3d;border-radius:12px;padding:6px;margin-bottom:10px;"></div>
        <button type="button" id="pq25Save" class="btn" style="width:100%;min-height:46px;font-size:15px;">💾 Сохранить очередь</button>
      </div>
    `;
    document.body.appendChild(m);

    const actHost = document.getElementById("pq25Active");
    const catHost = document.getElementById("pq25Cat");
    const cntLbl = document.getElementById("pq25Cnt");

    function renderList() {
      cntLbl.innerText = curQueue.length;
      if (curQueue.length === 0) {
        actHost.innerHTML = `<div style="text-align:center;color:#8b92a5;font-size:12px;padding:10px;">Очередь пуста (0 заданий)</div>`;
        return;
      }
      actHost.innerHTML = curQueue.map((tid, idx) => {
        const info = allTasks.find(x => x.id === tid) || { id: tid, title: "Задача #" + tid };
        return `<div style="display:flex;align-items:center;justify-content:space-between;gap:4px;padding:5px 6px;border-bottom:1px solid #1f222e;font-size:12px;">
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><b>${idx + 1}.</b> №${info.id} ${info.title}</span>
          <button type="button" class="btn btn-sec btn-sm pqu25" data-i="${idx}" style="min-height:28px;padding:0 6px;">⬆️</button>
          <button type="button" class="btn btn-sec btn-sm pqd25" data-i="${idx}" style="min-height:28px;padding:0 6px;">⬇️</button>
          <button type="button" class="btn btn-sec btn-sm pqr25" data-i="${idx}" style="min-height:28px;padding:0 6px;color:#ff2a4b;">✕</button>
        </div>`;
      }).join("");

      actHost.querySelectorAll(".pqu25").forEach(b => b.onclick = () => {
        const i = Number(b.dataset.i);
        if (i > 0) { const t = curQueue.at(i - 1); curQueue[i - 1] = curQueue.at(i); curQueue[i] = t; renderList(); }
      });
      actHost.querySelectorAll(".pqd25").forEach(b => b.onclick = () => {
        const i = Number(b.dataset.i);
        if (i < curQueue.length - 1) { const t = curQueue.at(i + 1); curQueue[i + 1] = curQueue.at(i); curQueue[i] = t; renderList(); }
      });
      actHost.querySelectorAll(".pqr25").forEach(b => b.onclick = () => { curQueue.splice(Number(b.dataset.i), 1); renderList(); });
    }

    catHost.innerHTML = allTasks.map(t => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:6px;border-bottom:1px solid #1f222e;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:12px;font-weight:700;">№${t.id}. ${t.title}</div>
          <div style="font-size:11px;color:#8b92a5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.q}</div>
        </div>
        <button type="button" class="btn btn-sec btn-sm pqa25" data-id="${t.id}" style="min-height:30px;padding:0 10px;">➕</button>
      </div>
    `).join("");

    catHost.querySelectorAll(".pqa25").forEach(b => b.onclick = () => { curQueue.push(Number(b.dataset.id)); renderList(); });
    document.getElementById("pq25AddAll").onclick = () => { curQueue = allTasks.map(t => t.id); renderList(); };
    document.getElementById("pq25Clear").onclick = () => { curQueue = []; renderList(); };
    document.getElementById("pq25Close").onclick = () => m.remove();
    document.getElementById("pq25Save").onclick = () => {
      window.saveProfile25Config(p, { queue: curQueue, mode: curQueue.length === 0 ? "none" : "custom" });
      m.remove();
      if (onSaveCb) onSaveCb();
    };
    renderList();
  };
  function buildIdentical25PanelHTML(profile) {
    const cfg = window.getProfile25Config(profile);
    const allTasks = window.Logic25Pack ? window.Logic25Pack.TASKS : [];
    const singleOpts = allTasks.map(t => `<option value="${t.id}" ${cfg.singleId===t.id?"selected":""}>№${t.id}. ${t.title}</option>`).join("");
    const copyLabel = profile === "test" ? "🔄 Взять из будильника" : "🔄 Взять из теста";
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:6px;">
        <span style="font-size:13px;font-weight:700;">🧠 Задания (25 задач)</span>
        <button type="button" class="btn btn-sec btn-sm p25-copy" style="min-height:28px;font-size:11px;padding:2px 8px;">${copyLabel}</button>
      </div>
      <select class="p25-mode" style="width:100%;min-height:40px;margin-bottom:8px;">
        <option value="none" ${cfg.mode==="none"?"selected":""}>0. Без заданий (0 заданий)</option>
        <option value="single" ${cfg.mode==="single"?"selected":""}>🎯 Выбрать конкретное задание</option>
        <option value="random" ${cfg.mode==="random"?"selected":""}>🎲 Случайный выбор (без повторов)</option>
        <option value="custom" ${cfg.mode==="custom"?"selected":""}>🧩 Своя очередь</option>
      </select>
      <div class="p25-single-row" style="display:${cfg.mode==="single"?"block":"none"};margin-bottom:6px;">
        <select class="p25-single-sel" style="width:100%;min-height:38px;">${singleOpts}</select>
      </div>
      <div class="p25-rnd-row" style="display:${cfg.mode==="random"?"flex":"none"};gap:6px;align-items:center;margin-bottom:6px;">
        <span style="font-size:12px;color:#8b92a5;">Кол-во (1–25):</span>
        <input type="number" class="p25-rnd-cnt" min="1" max="25" value="${cfg.rndCnt}" style="width:65px;min-height:36px;text-align:center;">
        <button type="button" class="btn btn-sec btn-sm p25-all25" style="flex:1;min-height:36px;font-size:12px;">Все 25 заданий</button>
      </div>
      <div class="p25-custom-row" style="display:${cfg.mode==="custom"?"block":"none"};">
        <button type="button" class="btn btn-sec btn-sm p25-open-q" style="width:100%;min-height:38px;margin-bottom:4px;">🛠️ Настроить очередь заданий</button>
        <div class="p25-q-sum" style="font-size:11px;color:#10b981;text-align:center;"></div>
      </div>
    `;
  }

  function wireIdentical25Panel(box, profile) {
    const modeSel = box.querySelector(".p25-mode");
    const singleRow = box.querySelector(".p25-single-row");
    const singleSel = box.querySelector(".p25-single-sel");
    const rndRow = box.querySelector(".p25-rnd-row");
    const rndCnt = box.querySelector(".p25-rnd-cnt");
    const all25Btn = box.querySelector(".p25-all25");
    const customRow = box.querySelector(".p25-custom-row");
    const openQBtn = box.querySelector(".p25-open-q");
    const qSum = box.querySelector(".p25-q-sum");
    const copyBtn = box.querySelector(".p25-copy");

    const refresh = () => {
      const cfg = window.getProfile25Config(profile);
      modeSel.value = cfg.mode;
      singleSel.value = String(cfg.singleId);
      rndCnt.value = String(cfg.rndCnt);
      singleRow.style.display = cfg.mode === "single" ? "block" : "none";
      rndRow.style.display = cfg.mode === "random" ? "flex" : "none";
      customRow.style.display = cfg.mode === "custom" ? "block" : "none";
      qSum.innerText = cfg.queue.length ? `Очередь (${cfg.queue.length}): ${cfg.queue.map(id => "№" + id).join(" → ")}` : "Очередь пуста (0 заданий)";
    };

    modeSel.onchange = () => { window.saveProfile25Config(profile, { mode: modeSel.value }); refresh(); };
    singleSel.onchange = () => { window.saveProfile25Config(profile, { singleId: Number(singleSel.value) }); };
    rndCnt.oninput = () => {
      const v = Math.max(1, Math.min(25, Number(rndCnt.value) || 1));
      window.saveProfile25Config(profile, { rndCnt: v });
    };
    all25Btn.onclick = () => { rndCnt.value = "25"; window.saveProfile25Config(profile, { rndCnt: 25 }); };
    openQBtn.onclick = () => window.openProfile25QueueModal(profile, () => refresh());
    copyBtn.onclick = () => {
      const other = profile === "test" ? "alarm" : "test";
      window.saveProfile25Config(profile, window.getProfile25Config(other));
      refresh();
    };
    refresh();
  }

  setInterval(() => {
    const alBox = document.getElementById("saLogic25Box");
    if (alBox && !alBox.dataset.indep25) {
      alBox.dataset.indep25 = "1";
      alBox.innerHTML = buildIdentical25PanelHTML("alarm");
      wireIdentical25Panel(alBox, "alarm");
    }

    const tsBox = document.getElementById("tCfgL25Box");
    if (tsBox && !tsBox.dataset.indep25) {
      tsBox.dataset.indep25 = "1";
      tsBox.innerHTML = buildIdentical25PanelHTML("test");
      wireIdentical25Panel(tsBox, "test");

      const runBtn = document.getElementById("tCfgRun");
      if (runBtn) {
        runBtn.onclick = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          const snd = document.getElementById("tCfgSound")?.value || "random";
          const ta = document.getElementById("tCfgPromptInput");
          const promptText = ta ? ta.value.trim() : (localStorage.getItem("sa_test_prompt") || "").trim();
          if (ta) localStorage.setItem("sa_test_prompt", ta.value);
          document.getElementById("saTestCfgModal")?.remove();
          window.executeStrict25AlarmByProfile("test", "🧪 ТЕСТОВЫЙ БУДИЛЬНИК", snd, promptText);
        };
      }
    }
  }, 200);
  window.executeStrict25AlarmByProfile = function(profile, title, snd, customPromptText) {
    const cfg = window.getProfile25Config(profile);
    const vol = Math.max(50, Number(localStorage.getItem("sa_vol") || 80));
    const promptStr = String(customPromptText || "").trim();

    let taskQueue = [];
    if (cfg.mode === "single") {
      taskQueue = [cfg.singleId];
    } else if (cfg.mode === "random" && window.Logic25Pack) {
      taskQueue = window.Logic25Pack.buildRandomQueue(cfg.rndCnt);
    } else if (cfg.mode === "custom") {
      taskQueue = Array.from(cfg.queue);
    }

    const isZero = (cfg.mode === "none" || taskQueue.length === 0);
    window.ringQueue = isZero ? ["none"] : taskQueue.map(id => "l25_" + id);

    if (window.SoundPack) window.SoundPack.play(snd, vol, window.db || null, false);
    if (window.AndroidLock && window.AndroidLock.setRinging) {
      window.AndroidLock.setRinging(true, vol, !isZero);
    }
    if (!isZero) {
      try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {}
    }

    let ov = document.getElementById("saFullLockScreen");
    if (ov) ov.remove();
    ov = document.createElement("div");
    ov.id = "saFullLockScreen";
    ov.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:#0d0f17;z-index:999999;display:flex;flex-direction:column;justify-content:space-between;padding:18px;box-sizing:border-box;color:#fff;overflow-y:auto;";

    const curName = window.SoundPack && window.SoundPack.getCurrentName ? window.SoundPack.getCurrentName() : "Мелодия будильника";
    const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const promptBlockHTML = promptStr
      ? `<div style="margin:10px 0 6px;padding:14px;border-radius:14px;background:#1e2436;border:1px solid #3b82f6;color:#f8fafc;font-size:19px;font-weight:700;line-height:1.4;text-align:center;white-space:pre-wrap;word-break:break-word;">${esc(promptStr)}</div>`
      : "";

    ov.innerHTML = `
      <div>
        <div style="text-align:center;color:#ff2a4b;font-weight:800;font-size:14px;">${title}</div>
        <div style="text-align:center;font-size:46px;font-weight:900;margin:4px 0;">${new Date().toTimeString().slice(0,5)}</div>
        <div id="saLockProg" style="text-align:center;font-size:14px;color:#10b981;font-weight:700;"></div>
        <div style="text-align:center;font-size:12px;color:#8b92a5;margin-top:4px;">🎵 ${curName}</div>
        ${promptBlockHTML}
      </div>
      <div id="saLockTaskBox" style="background:#161822;border:2px solid #2a2e3d;border-radius:18px;padding:16px;margin:auto 0;"></div>
      <div style="text-align:center;font-size:12px;color:${!isZero ? "#ff2a4b" : "#8b92a5"};font-weight:700;margin-top:10px;">
        ${!isZero ? "🔒 Выход и кнопки громкости заблокированы до решения всех заданий" : "🔓 Обычный режим (0 заданий)"}
      </div>
    `;
    document.body.appendChild(ov);

    const tBox = document.getElementById("saLockTaskBox");
    const prog = document.getElementById("saLockProg");

    const unlockAndClose = () => {
      window.ringQueue = ["none"];
      if (window.SoundPack) window.SoundPack.stop();
      if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, vol, false);
      try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); } catch (e) {}
      ov.remove();
    };

    if (isZero) {
      prog.innerText = "Режим без заданий (0 заданий)";
      const mins = Math.max(1, Number(localStorage.getItem("sa_snooze_min") || 5));
      tBox.innerHTML = `
        <div style="text-align:center;padding:6px 0;">
          <button type="button" id="saZeroStopBtn" class="btn" style="width:100%;min-height:62px;font-size:20px;font-weight:900;background:#10b981;color:#fff;border:none;border-radius:14px;margin-bottom:10px;">
            ✅ ВЫКЛЮЧИТЬ БУДИЛЬНИК
          </button>
          <button type="button" id="saZeroSnoozeBtn" class="btn btn-sec" style="width:100%;min-height:48px;font-size:15px;border-radius:14px;">
            💤 Отложить на ${mins} мин
          </button>
        </div>
      `;
      document.getElementById("saZeroStopBtn").onclick = unlockAndClose;
      document.getElementById("saZeroSnoozeBtn").onclick = () => {
        unlockAndClose();
        setTimeout(() => window.executeStrict25AlarmByProfile(profile, "💤 ПОВТОР БУДИЛЬНИКА", snd, promptStr), mins * 60000);
      };
      return;
    }

    let idx = 0;
    const stepNext = () => {
      if (idx >= taskQueue.length) {
        unlockAndClose();
        return;
      }
      prog.innerText = `Задание ${idx + 1} из ${taskQueue.length}`;
      window.Logic25Pack.renderById(taskQueue.at(idx), tBox, () => {
        idx++;
        stepNext();
      }, () => {
        tBox.style.borderColor = "#ff2a4b";
        setTimeout(() => tBox.style.borderColor = "#2a2e3d", 400);
      });
    };
    stepNext();
  };

  window.onNativeWake = function(d) {
    d = d || {};
    const snd = (d.sound && d.sound !== "random") ? d.sound : (localStorage.getItem("sa_last_sound") || "random");
    window.executeStrict25AlarmByProfile("alarm", d.title || "⏰ БУДИЛЬНИК", snd, "");
    if (window.pushExactAlarmSchedule) setTimeout(window.pushExactAlarmSchedule, 1000);
  };
})();
(function lockScreenZeroTaskAlarm() {
  // Сохраняем привязку мелодии и громкости к конкретному будильнику при сохранении
  document.addEventListener("click", function(e) {
    const btn = e.target.closest("button");
    if (!btn || !btn.innerText || !btn.innerText.includes("Сохранить")) return;
    const modal = btn.closest(".modal");
    if (!modal || modal.id === "saTestCfgModal") return;

    const melSel = modal.querySelector(".sa-mel-sel");
    const volRng = modal.querySelector(".m-vr");
    const tIn = modal.querySelector('input[type="time"]');
    let tKey = tIn && tIn.value ? tIn.value.slice(0, 5) : "";
    if (!tKey) {
      const sels = Array.from(modal.querySelectorAll("select")).filter(s => !s.classList.contains("sa-mel-sel") && !s.classList.contains("p15-mode") && !s.classList.contains("p15-single-sel"));
      if (sels.length >= 2 && /^\d{1,2}$/.test(sels.at(0).value) && /^\d{1,2}$/.test(sels.at(1).value)) {
        tKey = String(sels.at(0).value).padStart(2, "0") + ":" + String(sels.at(1).value).padStart(2, "0");
      }
    }

    const cfg = window.getProfile25Config ? window.getProfile25Config("alarm") : { mode: "none" };
    if (tKey) {
      if (melSel) {
        const sMap = JSON.parse(localStorage.getItem("sa_per_alarm_snd") || "{}");
        sMap[tKey] = melSel.value;
        localStorage.setItem("sa_per_alarm_snd", JSON.stringify(sMap));
      }
      if (volRng) {
        const vMap = JSON.parse(localStorage.getItem("sa_per_alarm_vol") || "{}");
        vMap[tKey] = Math.max(10, Math.min(100, Number(volRng.value) || 75));
        localStorage.setItem("sa_per_alarm_vol", JSON.stringify(vMap));
      }
      const zMap = JSON.parse(localStorage.getItem("sa_zero_alarms") || "{}");
      if (cfg.mode === "none") zMap[tKey] = true; else delete zMap[tKey];
      localStorage.setItem("sa_zero_alarms", JSON.stringify(zMap));
    }
    if (window.pushExactAlarmSchedule) setTimeout(window.pushExactAlarmSchedule, 200);
  }, true);

  // Полноэкранный экран поверх блокировки для режима "0 заданий"
  window.showFullLockScreenZeroAlarm = function(title, labelText, snd, targetVol, alarmTimeKey) {
    const vol = Math.max(10, Math.min(100, Number(targetVol) || (window.getProfileVolume ? window.getProfileVolume("alarm") : 75)));
    window.ringQueue = ["none"];

    if (window.SoundPack) window.SoundPack.play(snd, vol, window.db || null, false);
    if (window.AndroidLock && window.AndroidLock.setRinging) {
      window.AndroidLock.setRinging(true, vol, false);
    }

    let ov = document.getElementById("saFullLockScreen");
    if (ov) ov.remove();
    ov = document.createElement("div");
    ov.id = "saFullLockScreen";
    ov.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:linear-gradient(180deg,#0b0d14 0%,#141826 100%);z-index:999999;display:flex;flex-direction:column;justify-content:space-between;padding:24px 20px;box-sizing:border-box;color:#fff;";

    const curName = window.SoundPack && window.SoundPack.getCurrentName ? window.SoundPack.getCurrentName() : "Мелодия будильника";
    const mins = Math.max(1, Number(localStorage.getItem("sa_snooze_min") || 5));

    ov.innerHTML = `
      <div style="text-align:center;margin-top:16px;">
        <div style="font-size:13px;font-weight:800;letter-spacing:1.5px;color:#10b981;text-transform:uppercase;">${title}</div>
        <div id="saZeroLiveClock" style="font-size:68px;font-weight:900;line-height:1.05;margin:12px 0 8px;letter-spacing:-1px;">${new Date().toTimeString().slice(0,5)}</div>
        <div style="font-size:20px;font-weight:700;color:#f1f5f9;margin-bottom:8px;">${labelText || "Утренний подъём"}</div>
        <div style="display:inline-block;padding:6px 12px;border-radius:20px;background:rgba(255,255,255,0.07);font-size:12px;color:#cbd5e1;">
          🎵 ${curName} • 🔊 ${vol}%
        </div>
      </div>

      <div id="saLockTaskBox" style="width:100%;max-width:400px;margin:0 auto 12px;">
        <button type="button" id="saBigDismissBtn" style="width:100%;min-height:74px;border-radius:20px;border:none;background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);color:#fff;font-size:22px;font-weight:900;letter-spacing:0.5px;box-shadow:0 10px 28px rgba(239,68,68,0.45);cursor:pointer;margin-bottom:14px;">
          🔕 Выключить будильник
        </button>
        <button type="button" id="saBigSnoozeBtn" style="width:100%;min-height:52px;border-radius:16px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:16px;font-weight:700;cursor:pointer;">
          💤 Отложить на ${mins} мин
        </button>
      </div>
    `;
    document.body.appendChild(ov);

    const clockInterval = setInterval(() => {
      const el = document.getElementById("saZeroLiveClock");
      if (el) el.innerText = new Date().toTimeString().slice(0, 5);
      else clearInterval(clockInterval);
    }, 1000);

    const stopAndDismiss = (deactivateOneTime) => {
      clearInterval(clockInterval);
      if (window.SoundPack) window.SoundPack.stop();
      if (window.AndroidLock && window.AndroidLock.setRinging) {
        window.AndroidLock.setRinging(false, vol, false);
      }
      if (deactivateOneTime && alarmTimeKey) {
        try {
          let list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]");
          let changed = false;
          list.forEach(a => {
            if (a && a.time === alarmTimeKey && (!Array.isArray(a.days) || a.days.length === 0)) {
              a.enabled = false;
              changed = true;
            }
          });
          if (changed) {
            localStorage.setItem("sa_alarms", JSON.stringify(list));
            localStorage.setItem("alarms", JSON.stringify(list));
          }
        } catch (e) {}
      }
      ov.remove();
      if (window.pushExactAlarmSchedule) setTimeout(window.pushExactAlarmSchedule, 300);
    };

    document.getElementById("saBigDismissBtn").onclick = () => stopAndDismiss(true);
    document.getElementById("saBigSnoozeBtn").onclick = () => {
      stopAndDismiss(false);
      setTimeout(() => {
        window.showFullLockScreenZeroAlarm("💤 ПОВТОР БУДИЛЬНИКА", labelText, snd, vol, alarmTimeKey);
      }, mins * 60000);
    };
  };

  // Обновляем планировщик и обработчик пробуждения для точного запуска режима "0 заданий" поверх блокировки
  window.pushExactAlarmSchedule = function() {
    if (!window.AndroidLock || !window.AndroidLock.scheduleNextAlarmWithData) return;
    let list = [];
    try {
      if (typeof alarms !== "undefined" && Array.isArray(alarms)) list = alarms;
      else list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]");
    } catch (e) {}

    const sndMap = JSON.parse(localStorage.getItem("sa_per_alarm_snd") || "{}");
    const volMap = JSON.parse(localStorage.getItem("sa_per_alarm_vol") || "{}");
    const zeroMap = JSON.parse(localStorage.getItem("sa_zero_alarms") || "{}");
    const globalCfg = window.getProfile25Config ? window.getProfile25Config("alarm") : { mode: "none" };
    const fallbackSnd = localStorage.getItem("sa_last_sound") || "random";
    const fallbackVol = window.getProfileVolume ? window.getProfileVolume("alarm") : 75;
    const now = new Date();
    let bestTs = 0, bestPayload = null;

    list.filter(a => a && a.enabled).forEach(a => {
      const parts = String(a.time || "07:00").split(":");
      const hh = Number(parts.at(0)) || 0, mm = Number(parts.at(1)) || 0;
      const tNorm = String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
      const days = Array.isArray(a.days) ? a.days : [];

      for (let d = 0; d <= 7; d++) {
        const cand = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hh, mm, 0, 0);
        if (cand.getTime() > now.getTime() && (days.length === 0 || days.includes(cand.getDay()))) {
          if (bestTs === 0 || cand.getTime() < bestTs) {
            bestTs = cand.getTime();
            const isZ = Boolean(zeroMap[tNorm] || zeroMap[a.time] || globalCfg.mode === "none");
            bestPayload = {
              title: "⏰ БУДИЛЬНИК",
              label: a.label || a.name || ("Будильник на " + tNorm),
              timeKey: tNorm,
              sound: sndMap[tNorm] || sndMap[a.time] || (a.sound && a.sound.startsWith("mel_") ? a.sound : fallbackSnd),
              vol: volMap[tNorm] || volMap[a.time] || fallbackVol,
              isZero: isZ
            };
          }
          break;
        }
      }
    });

    if (bestTs > 0 && bestPayload) {
      window.AndroidLock.scheduleNextAlarmWithData(bestTs, JSON.stringify(bestPayload));
    } else {
      window.AndroidLock.scheduleNextAlarmWithData(0, "{}");
    }
  };

  window.onNativeWake = function(d) {
    d = d || {};
    const cfg = window.getProfile25Config ? window.getProfile25Config("alarm") : { mode: "none" };
    const snd = d.sound || localStorage.getItem("sa_last_sound") || "random";
    const vol = Number(d.vol) || (window.getProfileVolume ? window.getProfileVolume("alarm") : 75);
    if (d.isZero || cfg.mode === "none") {
      window.showFullLockScreenZeroAlarm(d.title || "⏰ БУДИЛЬНИК", d.label || "", snd, vol, d.timeKey || "");
    } else if (window.executeStrict25AlarmByProfile) {
      window.executeStrict25AlarmByProfile("alarm", d.title || "⏰ БУДИЛЬНИК", snd, "");
    }
  };
})();
(function fixMainAlarmSettingsAccess() {
  // Синхронизируем псевдонимы функций, чтобы ни одна кнопка не падала с ReferenceError
  if (window.getProfile15Config && !window.getProfile25Config) window.getProfile25Config = window.getProfile15Config;
  if (window.saveProfile15Config && !window.saveProfile25Config) window.saveProfile25Config = window.saveProfile15Config;
  if (window.openProfileQueueModal && !window.openLogic25QueueModal) {
    window.openLogic25QueueModal = (cb) => window.openProfileQueueModal("alarm", cb);
  }

  // В спокойном режиме (когда будильник не звонит) убираем зависшие прозрачные слои и снимаем нативную блокировку
  function cleanupIdleOverlays() {
    const lockScreen = document.getElementById("saFullLockScreen");
    if (!lockScreen) {
      window.ringQueue = ["none"];
      if (window.AndroidLock && window.AndroidLock.setRinging) {
        try { window.AndroidLock.setRinging(false, Number(localStorage.getItem("sa_vol") || 75), false); } catch (e) {}
      }
      // Разблокируем pointer-events на body и html
      document.documentElement.style.pointerEvents = "auto";
      document.body.style.pointerEvents = "auto";
    }
  }
  cleanupIdleOverlays();
  setInterval(cleanupIdleOverlays, 1500);

  // Гарантируем, что при открытии модального окна основного будильника в нём ВСЕГДА отрисованы:
  // 1) выбор из 120 мелодий + рандом + ползунок громкости 10-100%
  // 2) панель выбора логических заданий (0 заданий / 1 конкретное / случайные 1-25 / своя очередь)
  setInterval(() => {
    document.querySelectorAll(".modal").forEach(modal => {
      if (modal.id === "saTestCfgModal" || modal.id === "saProfileQModal" || modal.id === "saL15QueueModal" || modal.id === "saL25QueueModal") return;
      const isVisible = modal.classList.contains("active") || modal.style.display === "flex" || modal.style.display === "block" || modal.offsetParent !== null;
      if (!isVisible) return;

      // Убеждаемся, что само окно кликабельно и находится поверх подложки
      modal.style.pointerEvents = "auto";
      if (!modal.style.zIndex || Number(modal.style.zIndex) < 1000) modal.style.zIndex = "5000";

      // Если внутри модалки основного будильника ещё нет блока выбора мелодии и громкости — создаём его
      if (!modal.querySelector(".sa-mel-sel")) {
        const list120 = window.SoundPack ? window.SoundPack.list.map(m => `<option value="${m.id}">🎵 ${m.name}</option>`).join("") : "";
        const curV = window.getProfileVolume ? window.getProfileVolume("alarm") : 75;
        const initS = localStorage.getItem("sa_last_sound") || "random";

        const melBox = document.createElement("div");
        melBox.className = "sa-injected-mel-box";
        melBox.style.cssText = "margin:10px 0;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
        melBox.innerHTML = `
          <label style="display:block;margin-bottom:6px;font-size:12px;color:#8b92a5;font-weight:700;">🎵 Мелодия будильника (120 звуков)</label>
          <select class="sa-mel-sel" style="width:100%;min-height:40px;margin-bottom:8px;">
            <option value="random">🎲 Случайная мелодия (без повторов)</option>
            ${list120}
          </select>
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <button type="button" class="btn btn-sec btn-sm m-rnd" style="flex:1;min-height:36px;">🎲 Рандом</button>
            <button type="button" class="btn btn-sec btn-sm m-prv" style="flex:1;min-height:36px;">▶️ Слушать</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
            <span>🔊 Громкость: <b class="m-vl">${curV}%</b></span>
            <input type="range" class="m-vr" min="10" max="100" value="${curV}" style="flex:1;min-height:28px;">
          </div>
        `;

        const saveBtn = Array.from(modal.querySelectorAll("button")).find(b => b.innerText && b.innerText.includes("Сохранить"));
        const container = saveBtn ? saveBtn.parentElement : (modal.firstElementChild || modal);
        if (saveBtn && saveBtn.parentElement === container) container.insertBefore(melBox, saveBtn);
        else container.appendChild(melBox);

        const sel = melBox.querySelector(".sa-mel-sel");
        sel.value = initS;
        sel.onchange = () => localStorage.setItem("sa_last_sound", sel.value);
        melBox.querySelector(".m-rnd").onclick = () => { sel.value = "random"; localStorage.setItem("sa_last_sound", "random"); };
        let pl = false;
        melBox.querySelector(".m-prv").onclick = e => {
          pl = !pl;
          if (pl) {
            const v = window.getProfileVolume ? window.getProfileVolume("alarm") : 75;
            if (window.SoundPack) window.SoundPack.play(sel.value, v, window.db || null, true);
            e.target.innerText = "⏹ Стоп";
          } else {
            if (window.SoundPack) window.SoundPack.stop();
            e.target.innerText = "▶️ Слушать";
          }
        };
        const rng = melBox.querySelector(".m-vr");
        const vl = melBox.querySelector(".m-vl");
        rng.oninput = e => {
          const nv = window.setProfileVolume ? window.setProfileVolume("alarm", e.target.value) : Number(e.target.value);
          vl.innerText = nv + "%";
        };
      }

      // Если внутри модалки основного будильника ещё нет блока выбора 25 логических задач — создаём его
      if (!modal.querySelector("#saLogic25Box") && window.getProfile15Config) {
        const lBox = document.createElement("div");
        lBox.id = "saLogic25Box";
        lBox.style.cssText = "margin:10px 0;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
        const melWrap = modal.querySelector(".sa-injected-mel-box") || modal.querySelector(".sa-mel-sel")?.parentElement;
        if (melWrap && melWrap.parentElement) melWrap.parentElement.insertBefore(lBox, melWrap);
        else (modal.firstElementChild || modal).appendChild(lBox);
      }
    });
  }, 250);
})();