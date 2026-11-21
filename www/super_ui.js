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
(function forceMainAlarmButtonClickable() {
  // 1. В спокойном режиме (когда нет активного звонка) все скрытые модалки не должны перехватывать клики
  function unblockMainScreenElements() {
    if (document.getElementById("saFullLockScreen")) return;

    document.querySelectorAll(".modal").forEach(m => {
      if (m.id === "saTestCfgModal" || m.id === "saProfileQModal") return;
      const isShown = m.classList.contains("active") || m.style.display === "flex" || m.style.display === "block";
      if (!isShown) {
        m.style.pointerEvents = "none";
      } else {
        m.style.pointerEvents = "auto";
      }
    });

    // Делаем все кнопки и карточки будильников гарантированно кликабельными
    document.querySelectorAll("button, .alarm-card, .alarm-item, [onclick]").forEach(el => {
      if (!el.closest("#saTestCfgModal") && !el.closest("#saProfileQModal")) {
        el.disabled = false;
        el.removeAttribute("disabled");
        el.style.pointerEvents = "auto";
      }
    });
  }

  unblockMainScreenElements();
  setInterval(unblockMainScreenElements, 400);

  // 2. Гарантированное открытие окна настроек основного будильника, если штатный обработчик не сработал
  window.openMainAlarmEditorFallback = function(existingAlarm) {
    // Сначала пробуем вызвать штатную модалку из app.js, если она есть в DOM
    const nativeModal = document.getElementById("alarmModal") || document.querySelector(".modal:not(#saTestCfgModal):not(#saProfileQModal)");
    if (nativeModal) {
      nativeModal.style.display = "flex";
      nativeModal.classList.add("active");
      nativeModal.style.pointerEvents = "auto";
      nativeModal.style.zIndex = "5000";
      return;
    }

    // Если штатной модалки нет — открываем полноценное окно настроек основного будильника
    let m = document.getElementById("saMainAlarmModal");
    if (m) m.remove();
    m = document.createElement("div");
    m.id = "saMainAlarmModal";
    m.className = "modal active";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.86);display:flex;justify-content:center;align-items:center;padding:14px;z-index:15000;box-sizing:border-box;pointer-events:auto;";

    const curTime = (existingAlarm && existingAlarm.time) ? existingAlarm.time : "07:30";
    const curLabel = (existingAlarm && existingAlarm.label) ? existingAlarm.label : "Утренний будильник";

    m.innerHTML = `
      <div style="width:100%;max-width:380px;max-height:92vh;overflow-y:auto;background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:16px;box-sizing:border-box;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <b style="font-size:17px;">⏰ Настройка будильника</b>
          <button type="button" id="saMainModClose" class="btn btn-sec btn-sm" style="min-height:34px;padding:0 10px;">✕</button>
        </div>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Время срабатывания</label>
        <input type="time" id="saMainModTime" value="${curTime}" style="width:100%;min-height:46px;font-size:22px;font-weight:800;text-align:center;margin-bottom:10px;">
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Название / метка</label>
        <input type="text" id="saMainModLabel" value="${curLabel}" placeholder="Например: Работа" style="width:100%;min-height:40px;margin-bottom:10px;">
        <button type="button" id="saMainModSave" class="btn" style="width:100%;min-height:48px;font-size:16px;margin-top:8px;">💾 Сохранить будильник</button>
      </div>
    `;
    document.body.appendChild(m);

    document.getElementById("saMainModClose").onclick = () => {
      if (window.SoundPack) window.SoundPack.stop();
      m.remove();
    };

    document.getElementById("saMainModSave").onclick = () => {
      if (window.SoundPack) window.SoundPack.stop();
      const tVal = document.getElementById("saMainModTime").value || "07:30";
      const lVal = document.getElementById("saMainModLabel").value.trim() || "Будильник";
      const melVal = m.querySelector(".sa-mel-sel")?.value || localStorage.getItem("sa_last_sound") || "random";
      const volVal = window.getProfileVolume ? window.getProfileVolume("alarm") : 75;

      let list = [];
      try { list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]"); } catch (e) {}
      const idx = list.findIndex(a => a && a.time === tVal);
      const item = { id: Date.now(), time: tVal, label: lVal, enabled: true, sound: melVal, vol: volVal, days: [] };
      if (idx >= 0) list[idx] = Object.assign(list[idx], item);
      else list.push(item);

      localStorage.setItem("sa_alarms", JSON.stringify(list));
      localStorage.setItem("alarms", JSON.stringify(list));
      if (typeof window.renderAlarms === "function") window.renderAlarms();
      if (typeof window.pushExactAlarmSchedule === "function") window.pushExactAlarmSchedule();
      m.remove();
    };
  };

  // 3. Перехватываем клики по кнопкам создания/настройки основного будильника, если модалка не открылась сама за 80 мс
  document.addEventListener("click", function(e) {
    if (e.target.closest("#saTestCfgModal") || e.target.closest("#saProfileQModal") || e.target.closest("#saMainAlarmModal") || e.target.closest("#saFullLockScreen")) return;
    const btn = e.target.closest("button, .alarm-card, .alarm-item, [data-action='add-alarm']");
    if (!btn) return;

    const txt = (btn.innerText || "").trim().toLowerCase();
    if (txt.includes("тест")) return; // Кнопку теста не трогаем

    const isAlarmAction = txt === "+" || txt.includes("добавить") || txt.includes("будильник") || txt.includes("настро") || btn.classList.contains("alarm-card") || btn.classList.contains("alarm-item");
    if (isAlarmAction) {
      setTimeout(() => {
        const anyOpen = Array.from(document.querySelectorAll(".modal")).some(m => m.id !== "saTestCfgModal" && (m.classList.contains("active") || m.style.display === "flex" || m.style.display === "block"));
        if (!anyOpen) {
          window.openMainAlarmEditorFallback(null);
        }
      }, 80);
    }
  }, false);
})();
(function fixEncodingAndClickableAlarmCards() {
  function repairStoredAlarmsText() {
    ["sa_alarms", "alarms"].forEach(key => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const list = JSON.parse(raw);
        let changed = false;
        list.forEach(a => {
          if (!a) return;
          const badPattern = /[\u00D0\u00D1]{2,}|Р[А-Яа-я]|С[А-Яа-я]/;
          if (a.label && badPattern.test(a.label)) { a.label = "Утренний будильник"; changed = true; }
          if (a.name && badPattern.test(a.name)) { a.name = "Утренний будильник"; changed = true; }
        });
        if (changed) localStorage.setItem(key, JSON.stringify(list));
      } catch (e) {}
    });
  }
  repairStoredAlarmsText();

  window.openEditSpecificAlarmModal = function(alarmObj, alarmIndex) {
    let m = document.getElementById("saEditSpecificModal");
    if (m) m.remove();

    m = document.createElement("div");
    m.id = "saEditSpecificModal";
    m.className = "modal active";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.88);display:flex;justify-content:center;align-items:center;padding:12px;z-index:16000;box-sizing:border-box;pointer-events:auto;";

    const tVal = (alarmObj && alarmObj.time) ? alarmObj.time : "07:30";
    const lVal = (alarmObj && (alarmObj.label || alarmObj.name)) ? (alarmObj.label || alarmObj.name) : "Утренний будильник";
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    const curSnd = (alarmObj && alarmObj.sound) ? alarmObj.sound : (localStorage.getItem("sa_last_sound") || "random");
    const curVol = (alarmObj && alarmObj.vol) ? Number(alarmObj.vol) : (window.getProfileVolume ? window.getProfileVolume("alarm") : 75);

    m.innerHTML = `
      <div style="width:100%;max-width:390px;max-height:92vh;overflow-y:auto;background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:16px;box-sizing:border-box;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <b style="font-size:17px;">⏰ Настройка будильника ${tVal}</b>
          <button type="button" id="edModClose" class="btn btn-sec btn-sm" style="min-height:34px;padding:0 10px;">✕</button>
        </div>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Время срабатывания</label>
        <input type="time" id="edModTime" value="${tVal}" style="width:100%;min-height:48px;font-size:24px;font-weight:900;text-align:center;margin-bottom:10px;">
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Название будильника</label>
        <input type="text" id="edModLabel" value="${lVal}" placeholder="Например: Подъём на работу" style="width:100%;min-height:40px;margin-bottom:10px;">
        <div id="edModTasksHost" style="margin-bottom:10px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;"></div>
        <div style="margin-bottom:12px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;">
          <label style="display:block;margin-bottom:6px;font-size:12px;color:#8b92a5;font-weight:700;">🎵 Мелодия (120 звуков)</label>
          <select id="edModSnd" class="sa-mel-sel" style="width:100%;min-height:40px;margin-bottom:8px;">
            <option value="random">🎲 Случайная мелодия (без повторов)</option>
            ${list120}
          </select>
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <button type="button" id="edModRnd" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;">🎲 Рандом</button>
            <button type="button" id="edModPrv" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;">▶️ Слушать</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
            <span>🔊 Громкость: <b id="edModVolTxt">${curVol}%</b></span>
            <input type="range" id="edModVolRng" min="10" max="100" value="${curVol}" style="flex:1;min-height:28px;">
          </div>
        </div>
        <button type="button" id="edModSave" class="btn" style="width:100%;min-height:48px;font-size:16px;margin-bottom:8px;">💾 Сохранить изменения</button>
        ${alarmIndex >= 0 ? `<button type="button" id="edModDelete" class="btn btn-sec" style="width:100%;min-height:42px;font-size:14px;color:#ff2a4b;border-color:#7f1d1d;">🗑️ Удалить будильник</button>` : ""}
      </div>
    `;
    document.body.appendChild(m);
    const tHost = document.getElementById("edModTasksHost");
    if (window.getProfile15Config) {
      const cfg = window.getProfile15Config("alarm");
      const allT = (window.Logic25Pack || window.Logic15Pack)?.TASKS || [];
      const opts = allT.map(t => `<option value="${t.id}" ${cfg.singleId===t.id?"selected":""}>№${t.id}. ${t.title}</option>`).join("");
      tHost.innerHTML = `
        <div style="font-size:13px;font-weight:700;margin-bottom:6px;">🧠 Логические задания (25 задач)</div>
        <select id="edTaskMode" style="width:100%;min-height:40px;margin-bottom:8px;">
          <option value="none" ${cfg.mode==="none"?"selected":""}>0. Без заданий (0 заданий)</option>
          <option value="single" ${cfg.mode==="single"?"selected":""}>🎯 Выбрать конкретное задание</option>
          <option value="random" ${cfg.mode==="random"?"selected":""}>🎲 Случайный выбор (без повторов)</option>
          <option value="custom" ${cfg.mode==="custom"?"selected":""}>🧩 Своя очередь</option>
        </select>
        <div id="edSingleRow" style="display:${cfg.mode==="single"?"block":"none"};margin-bottom:6px;"><select id="edSingleSel" style="width:100%;min-height:38px;">${opts}</select></div>
        <div id="edRndRow" style="display:${cfg.mode==="random"?"flex":"none"};gap:6px;align-items:center;margin-bottom:6px;">
          <span style="font-size:12px;color:#8b92a5;">Кол-во (1–25):</span>
          <input type="number" id="edRndCnt" min="1" max="25" value="${cfg.rndCnt}" style="width:65px;min-height:36px;text-align:center;">
          <button type="button" id="edAll25Btn" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;font-size:12px;">Все 25 заданий</button>
        </div>
        <div id="edCustomRow" style="display:${cfg.mode==="custom"?"block":"none"};"><button type="button" id="edOpenQBtn" class="btn btn-sec btn-sm" style="width:100%;min-height:38px;">🛠️ Настроить очередь заданий</button></div>`;
      const mSel = document.getElementById("edTaskMode");
      mSel.onchange = () => {
        window.saveProfile15Config("alarm", { mode: mSel.value });
        document.getElementById("edSingleRow").style.display = mSel.value === "single" ? "block" : "none";
        document.getElementById("edRndRow").style.display = mSel.value === "random" ? "flex" : "none";
        document.getElementById("edCustomRow").style.display = mSel.value === "custom" ? "block" : "none";
      };
      document.getElementById("edSingleSel").onchange = e => window.saveProfile15Config("alarm", { singleId: Number(e.target.value) });
      document.getElementById("edRndCnt").oninput = e => window.saveProfile15Config("alarm", { rndCnt: Math.max(1, Math.min(25, Number(e.target.value) || 1)) });
      document.getElementById("edAll25Btn").onclick = () => { document.getElementById("edRndCnt").value = "25"; window.saveProfile15Config("alarm", { rndCnt: 25 }); };
      document.getElementById("edOpenQBtn").onclick = () => window.openProfileQueueModal("alarm", () => {});
    }

    const sndSel = document.getElementById("edModSnd");
    sndSel.value = (alarmObj && alarmObj.sound) ? alarmObj.sound : (localStorage.getItem("sa_last_sound") || "random");
    document.getElementById("edModRnd").onclick = () => { sndSel.value = "random"; };

    let playing = false;
    document.getElementById("edModPrv").onclick = e => {
      playing = !playing;
      if (playing) {
        const v = Number(document.getElementById("edModVolRng").value) || 75;
        if (window.SoundPack) window.SoundPack.play(sndSel.value, v, window.db || null, true);
        e.target.innerText = "⏹ Стоп";
      } else {
        if (window.SoundPack) window.SoundPack.stop();
        e.target.innerText = "▶️ Слушать";
      }
    };

    const volRng = document.getElementById("edModVolRng");
    volRng.oninput = e => { document.getElementById("edModVolTxt").innerText = e.target.value + "%"; };
    document.getElementById("edModClose").onclick = () => { if (window.SoundPack) window.SoundPack.stop(); m.remove(); };

    document.getElementById("edModSave").onclick = () => {
      if (window.SoundPack) window.SoundPack.stop();
      const newTime = document.getElementById("edModTime").value || "07:30";
      const newLabel = document.getElementById("edModLabel").value.trim() || "Утренний будильник";
      const newSnd = sndSel.value, newVol = Number(volRng.value) || 75;
      localStorage.setItem("sa_last_sound", newSnd);
      if (window.setProfileVolume) window.setProfileVolume("alarm", newVol);

      const sMap = JSON.parse(localStorage.getItem("sa_per_alarm_snd") || "{}"); sMap[newTime] = newSnd; localStorage.setItem("sa_per_alarm_snd", JSON.stringify(sMap));
      const vMap = JSON.parse(localStorage.getItem("sa_per_alarm_vol") || "{}"); vMap[newTime] = newVol; localStorage.setItem("sa_per_alarm_vol", JSON.stringify(vMap));

      let list = [];
      try { list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]"); } catch (e) {}
      if (alarmIndex >= 0 && list[alarmIndex]) {
        Object.assign(list[alarmIndex], { time: newTime, label: newLabel, name: newLabel, sound: newSnd, vol: newVol, enabled: true });
      } else {
        list.push({ id: Date.now(), time: newTime, label: newLabel, name: newLabel, sound: newSnd, vol: newVol, enabled: true, days: [] });
      }
      localStorage.setItem("sa_alarms", JSON.stringify(list)); localStorage.setItem("alarms", JSON.stringify(list));
      if (typeof alarms !== "undefined" && Array.isArray(alarms)) { alarms.length = 0; list.forEach(x => alarms.push(x)); }
      if (typeof window.renderAlarms === "function") window.renderAlarms();
      if (typeof window.pushExactAlarmSchedule === "function") window.pushExactAlarmSchedule();
      m.remove();
    };

    const delBtn = document.getElementById("edModDelete");
    if (delBtn) delBtn.onclick = () => {
      if (window.SoundPack) window.SoundPack.stop();
      let list = [];
      try { list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]"); } catch (e) {}
      if (alarmIndex >= 0) list.splice(alarmIndex, 1);
      localStorage.setItem("sa_alarms", JSON.stringify(list)); localStorage.setItem("alarms", JSON.stringify(list));
      if (typeof alarms !== "undefined" && Array.isArray(alarms)) { alarms.length = 0; list.forEach(x => alarms.push(x)); }
      if (typeof window.renderAlarms === "function") window.renderAlarms();
      if (typeof window.pushExactAlarmSchedule === "function") window.pushExactAlarmSchedule();
      m.remove();
    };
  };

  document.addEventListener("click", function(e) {
    if (e.target.closest(".modal") || e.target.closest("#saFullLockScreen") || e.target.closest('input[type="checkbox"], .switch, .toggle, label')) return;
    const card = e.target.closest(".alarm-card, .alarm-item, .card, li, div");
    if (!card || card.tagName === "BODY" || card.tagName === "HTML") return;
    const cardText = card.innerText || "";
    const timeMatch = cardText.match(/\b(\d|2[0-3]):([0-5]\d)\b/);
    if (timeMatch && cardText.length < 220 && !cardText.toLowerCase().includes("тест звонка")) {
      const clickedTime = timeMatch.at(0);
      let list = [];
      try { list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]"); } catch (err) {}
      const idx = list.findIndex(a => a && a.time === clickedTime);
      e.preventDefault(); e.stopImmediatePropagation();
      window.openEditSpecificAlarmModal(idx >= 0 ? list[idx] : { time: clickedTime, label: "Утренний будильник" }, idx);
    }
  }, true);
})();
(function migrateCorruptedAlarmsAndFixCardTap() {
  // 1. Жёсткая очистка localStorage от записей с битыми символами CP866 (╨, ╤, ╞, ╧) и пересоздание дефолтного 07:30
  function sanitizeStorageAndRecreateDefault() {
    const badChars = /[\u2550-\u256C\u00D0\u00D1\uFFFD]/;
    let wiped = false;

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || "";
      if (badChars.test(v)) {
        localStorage.removeItem(k);
        wiped = true;
      }
    }

    const keys = ["sa_alarms", "alarms"];
    let currentList = [];
    try { currentList = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]"); } catch (e) {}

    if (wiped || !Array.isArray(currentList) || currentList.length === 0) {
      const cleanDefault = [{
        id: 1,
        time: "07:30",
        label: "Утренний будильник",
        name: "Утренний будильник",
        days: [1,2,3,4,5],
        sound: "random",
        vol: 75,
        task: "random",
        enabled: true
      }];
      keys.forEach(k => localStorage.setItem(k, JSON.stringify(cleanDefault)));
      if (typeof alarms !== "undefined" && Array.isArray(alarms)) {
        alarms.length = 0;
        cleanDefault.forEach(x => alarms.push(x));
      }
    }
  }
  sanitizeStorageAndRecreateDefault();

  // 2. Прямая привязка клика и тапа на каждую карточку будильника после отрисовки списка
  function bindDirectCardClicks() {
    document.querySelectorAll("#alarmsList > *, .alarm-card, .alarm-item, .card").forEach(card => {
      if (card.dataset.cardEditBound) return;
      const txt = card.innerText || "";
      const m = txt.match(/\b(\d|2[0-3]):([0-5]\d)\b/);
      if (!m || txt.toLowerCase().includes("тест звонка")) return;

      card.dataset.cardEditBound = "1";
      card.style.cursor = "pointer";
      card.style.pointerEvents = "auto";

      card.addEventListener("click", function(ev) {
        // Не перехватываем клик по переключателю вкл/выкл справа
        if (ev.target.closest('input[type="checkbox"], .switch, .toggle, label')) return;
        ev.preventDefault();
        ev.stopPropagation();

        const tStr = m.at(0);
        let list = [];
        try { list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]"); } catch (e) {}
        const idx = list.findIndex(a => a && a.time === tStr);
        const obj = idx >= 0 ? list[idx] : { time: tStr, label: "Утренний будильник", vol: 75, sound: "random" };
        if (window.openEditSpecificAlarmModal) {
          window.openEditSpecificAlarmModal(obj, idx);
        }
      }, true);
    });
  }

  setInterval(bindDirectCardClicks, 300);
  if (typeof window.renderAlarms === "function") setTimeout(window.renderAlarms, 100);
})();
(function rebuildMainAlarmModal25And120() {
  const DAYS_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  function purgeOld7TasksSelect(root) {
    if (!root) return;
    root.querySelectorAll("select").forEach(sel => {
      if (sel.classList.contains("sa-mel-sel") || sel.classList.contains("sa25-mode") || sel.classList.contains("sa25-single")) return;
      const txt = sel.innerHTML.toLowerCase();
      if (txt.includes("7 заданий") || txt.includes("математ") || txt.includes("найди лишнее") || txt.includes("combo")) {
        const row = sel.closest(".form-group, .field, .row, div");
        if (row && row !== root && !row.querySelector("input[type='time']")) row.remove();
        else sel.remove();
      }
    });
  }

  window.openEditSpecificAlarmModal = function(alarmObj, alarmIndex) {
    document.querySelectorAll(".modal").forEach(el => {
      if (el.id !== "saTestCfgModal") { el.style.display = "none"; el.classList.remove("active"); }
    });
    let m = document.getElementById("saEditSpecificModal");
    if (m) m.remove();

    const isEdit = (typeof alarmIndex === "number" && alarmIndex >= 0 && alarmObj);
    const tVal = (alarmObj && alarmObj.time) ? alarmObj.time : "07:30";
    const lVal = (alarmObj && (alarmObj.label || alarmObj.name) && !String(alarmObj.label).includes("БудильникБудильник")) ? (alarmObj.label || alarmObj.name) : "Утренний будильник";
    const selDays = (alarmObj && Array.isArray(alarmObj.days)) ? Array.from(alarmObj.days) : (isEdit ? [] : [1, 2, 3, 4, 5]);

    const baseCfg = window.getProfile15Config ? window.getProfile15Config("alarm") : { mode: "random", singleId: 1, rndCnt: 2, queue: [] };
    const indMode = (alarmObj && alarmObj.taskMode) ? alarmObj.taskMode : baseCfg.mode;
    const indSingle = (alarmObj && alarmObj.taskSingleId) ? Number(alarmObj.taskSingleId) : baseCfg.singleId;
    const indRndCnt = (alarmObj && alarmObj.taskRndCnt) ? Number(alarmObj.taskRndCnt) : baseCfg.rndCnt;
    let indQueue = (alarmObj && Array.isArray(alarmObj.taskQueue)) ? Array.from(alarmObj.taskQueue) : Array.from(baseCfg.queue);

    const curSnd = (alarmObj && alarmObj.sound) ? alarmObj.sound : (localStorage.getItem("sa_last_sound") || "random");
    const curVol = (alarmObj && alarmObj.vol) ? Number(alarmObj.vol) : (window.getProfileVolume ? window.getProfileVolume("alarm") : 75);

    const allTasks = (window.Logic25Pack || window.Logic15Pack)?.TASKS || [];
    const singleOpts = allTasks.map(t => `<option value="${t.id}" ${indSingle === t.id ? "selected" : ""}>№${t.id}. ${t.title}</option>`).join("");
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";

    m = document.createElement("div");
    m.id = "saEditSpecificModal";
    m.className = "modal active";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.88);display:flex;justify-content:center;align-items:center;padding:12px;z-index:18000;box-sizing:border-box;pointer-events:auto;";
    m.innerHTML = `
      <div style="width:100%;max-width:400px;max-height:92vh;background:#161822;border:1px solid #2a2e3d;border-radius:18px;display:flex;flex-direction:column;color:#fff;overflow:hidden;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #2a2e3d;">
          <b style="font-size:17px;">⏰ Настройка будильника</b>
          <button type="button" id="edTopClose" class="btn btn-sec btn-sm" style="min-height:34px;padding:0 10px;">✕</button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:14px 16px;-webkit-overflow-scrolling:touch;">
          <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Время срабатывания</label>
          <input type="time" id="edModTime" value="${tVal}" style="width:100%;min-height:50px;font-size:26px;font-weight:900;text-align:center;margin-bottom:10px;border-radius:12px;">
          <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Название будильника</label>
          <input type="text" id="edModLabel" value="${lVal}" placeholder="Утренний будильник" style="width:100%;min-height:40px;margin-bottom:10px;border-radius:10px;">
          <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:6px;">Дни повтора</label>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:12px;">
            ${[1,2,3,4,5,6,0].map(d => {
              const on = selDays.includes(d);
              return `<button type="button" class="ed-day-btn" data-d="${d}" style="min-height:36px;border-radius:8px;border:1px solid ${on ? "#10b981" : "#2a2e3d"};background:${on ? "#065f46" : "#1f222e"};color:#fff;font-size:12px;font-weight:700;">${DAYS_SHORT[d]}</button>`;
            }).join("")}
          </div>
          <div style="padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;margin-bottom:12px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:6px;">🧠 Логические задания (база из 25 задач)</div>
            <select id="edTaskMode" class="sa25-mode" style="width:100%;min-height:40px;margin-bottom:8px;">
              <option value="none" ${indMode === "none" ? "selected" : ""}>0. Без заданий (0 заданий)</option>
              <option value="single" ${indMode === "single" ? "selected" : ""}>🎯 Выбрать 1 конкретное задание</option>
              <option value="random" ${indMode === "random" ? "selected" : ""}>🎲 Случайный выбор (без повторов)</option>
              <option value="custom" ${indMode === "custom" ? "selected" : ""}>🧩 Своя очередь</option>
            </select>
            <div id="edSingleRow" style="display:${indMode === "single" ? "block" : "none"};margin-bottom:6px;"><select id="edSingleSel" class="sa25-single" style="width:100%;min-height:38px;">${singleOpts}</select></div>
            <div id="edRndRow" style="display:${indMode === "random" ? "flex" : "none"};gap:6px;align-items:center;margin-bottom:6px;">
              <span style="font-size:12px;color:#8b92a5;">Кол-во (1–25):</span>
              <input type="number" id="edRndCnt" min="1" max="25" value="${indRndCnt}" style="width:65px;min-height:36px;text-align:center;">
              <button type="button" id="edAll25Btn" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;font-size:12px;">Все 25 заданий</button>
            </div>
            <div id="edCustomRow" style="display:${indMode === "custom" ? "block" : "none"};">
              <button type="button" id="edOpenQBtn" class="btn btn-sec btn-sm" style="width:100%;min-height:38px;margin-bottom:4px;">🛠️ Настроить свою очередь</button>
              <div id="edQSummary" style="font-size:11px;color:#10b981;text-align:center;"></div>
            </div>
          </div>
          <div style="padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;margin-bottom:8px;">
            <label style="display:block;margin-bottom:6px;font-size:12px;color:#8b92a5;font-weight:700;">🎵 Мелодия (120 танцевальных треков)</label>
            <select id="edModSnd" class="sa-mel-sel" style="width:100%;min-height:40px;margin-bottom:8px;"><option value="random">🎲 Случайная мелодия (без повторов)</option>${list120}</select>
            <div style="display:flex;gap:6px;margin-bottom:8px;">
              <button type="button" id="edModRnd" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;">🎲 Рандом</button>
              <button type="button" id="edModPrv" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;">▶️ Слушать</button>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
              <span>🔊 Макс. громкость: <b id="edModVolTxt">${curVol}%</b></span>
              <input type="range" id="edModVolRng" min="10" max="100" value="${curVol}" style="flex:1;min-height:28px;">
            </div>
          </div>
          ${isEdit ? `<button type="button" id="edModDelete" class="btn btn-sec" style="width:100%;min-height:40px;font-size:13px;color:#ff2a4b;border-color:#7f1d1d;margin-top:6px;">🗑️ Удалить будильник</button>` : ""}
        </div>
        <div style="display:flex;gap:8px;padding:12px 16px;border-top:1px solid #2a2e3d;background:#12141d;">
          <button type="button" id="edModCancel" class="btn btn-sec" style="flex:1;min-height:46px;font-size:15px;">Отмена</button>
          <button type="button" id="edModSave" class="btn" style="flex:1;min-height:46px;font-size:15px;">Сохранить</button>
        </div>
      </div>`;
    document.body.appendChild(m);
    m.querySelectorAll(".ed-day-btn").forEach(btn => {
      btn.onclick = () => {
        const d = Number(btn.dataset.d), pos = selDays.indexOf(d);
        if (pos >= 0) selDays.splice(pos, 1); else selDays.push(d);
        const active = selDays.includes(d);
        btn.style.borderColor = active ? "#10b981" : "#2a2e3d";
        btn.style.background = active ? "#065f46" : "#1f222e";
      };
    });

    const modeSel = document.getElementById("edTaskMode"), singleRow = document.getElementById("edSingleRow"), singleSel = document.getElementById("edSingleSel");
    const rndRow = document.getElementById("edRndRow"), rndCntIn = document.getElementById("edRndCnt"), customRow = document.getElementById("edCustomRow"), qSum = document.getElementById("edQSummary");

    const syncTaskRows = () => {
      singleRow.style.display = modeSel.value === "single" ? "block" : "none";
      rndRow.style.display = modeSel.value === "random" ? "flex" : "none";
      customRow.style.display = modeSel.value === "custom" ? "block" : "none";
      qSum.innerText = indQueue.length ? `В очереди (${indQueue.length}): ${indQueue.map(id => "№" + id).join(" → ")}` : "Очередь пуста (0 заданий)";
    };
    modeSel.onchange = syncTaskRows;
    document.getElementById("edAll25Btn").onclick = () => { rndCntIn.value = "25"; };
    document.getElementById("edOpenQBtn").onclick = () => {
      window.saveProfile15Config("alarm", { queue: indQueue, mode: "custom" });
      window.openProfileQueueModal("alarm", () => { indQueue = Array.from(window.getProfile15Config("alarm").queue); syncTaskRows(); });
    };
    syncTaskRows();

    const sndSel = document.getElementById("edModSnd"); sndSel.value = curSnd;
    document.getElementById("edModRnd").onclick = () => { sndSel.value = "random"; };
    let playing = false;
    document.getElementById("edModPrv").onclick = e => {
      playing = !playing;
      if (playing) {
        const v = Number(document.getElementById("edModVolRng").value) || 75;
        if (window.SoundPack) window.SoundPack.play(sndSel.value, v, window.db || null, true);
        e.target.innerText = "⏹ Стоп";
      } else { if (window.SoundPack) window.SoundPack.stop(); e.target.innerText = "▶️ Слушать"; }
    };

    const volRng = document.getElementById("edModVolRng");
    volRng.oninput = e => { document.getElementById("edModVolTxt").innerText = e.target.value + "%"; };
    const closeModal = () => { if (window.SoundPack) window.SoundPack.stop(); m.remove(); };
    document.getElementById("edTopClose").onclick = closeModal;
    document.getElementById("edModCancel").onclick = closeModal;

    document.getElementById("edModSave").onclick = () => {
      if (window.SoundPack) window.SoundPack.stop();
      const newTime = document.getElementById("edModTime").value || tVal;
      const newLabel = document.getElementById("edModLabel").value.trim() || "Утренний будильник";
      const newMode = modeSel.value, newSingle = Math.max(1, Math.min(25, Number(singleSel.value) || 1));
      const newRndCnt = Math.max(1, Math.min(25, Number(rndCntIn.value) || 1)), newSnd = sndSel.value;
      const newVol = Math.max(10, Math.min(100, Number(volRng.value) || 75));

      const alarmPayload = {
        id: isEdit && alarmObj.id ? alarmObj.id : Date.now(), time: newTime, label: newLabel, name: newLabel,
        days: Array.from(selDays), sound: newSnd, vol: newVol, taskMode: newMode, taskSingleId: newSingle,
        taskRndCnt: newRndCnt, taskQueue: Array.from(indQueue), enabled: true
      };

      let list = [];
      try { list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]"); } catch (e) {}
      if (isEdit && list[alarmIndex]) list[alarmIndex] = alarmPayload; else list.push(alarmPayload);
      localStorage.setItem("sa_alarms", JSON.stringify(list)); localStorage.setItem("alarms", JSON.stringify(list));
      localStorage.setItem("sa_last_sound", newSnd);
      if (window.setProfileVolume) window.setProfileVolume("alarm", newVol);
      if (window.saveProfile15Config) window.saveProfile15Config("alarm", { mode: newMode, singleId: newSingle, rndCnt: newRndCnt, queue: indQueue });

      if (typeof alarms !== "undefined" && Array.isArray(alarms)) { alarms.length = 0; list.forEach(x => alarms.push(x)); }
      if (typeof window.renderAlarms === "function") window.renderAlarms();
      if (typeof window.pushExactAlarmSchedule === "function") window.pushExactAlarmSchedule();
      m.remove();
    };

    const delBtn = document.getElementById("edModDelete");
    if (delBtn) {
      delBtn.onclick = () => {
        if (window.SoundPack) window.SoundPack.stop();
        let list = [];
        try { list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]"); } catch (e) {}
        if (isEdit) list.splice(alarmIndex, 1);
        localStorage.setItem("sa_alarms", JSON.stringify(list)); localStorage.setItem("alarms", JSON.stringify(list));
        if (typeof alarms !== "undefined" && Array.isArray(alarms)) { alarms.length = 0; list.forEach(x => alarms.push(x)); }
        if (typeof window.renderAlarms === "function") window.renderAlarms();
        if (typeof window.pushExactAlarmSchedule === "function") window.pushExactAlarmSchedule();
        m.remove();
      };
    }
  };

  document.addEventListener("click", function(e) {
    if (e.target.closest("#saEditSpecificModal") || e.target.closest("#saTestCfgModal") || e.target.closest("#saProfileQModal") || e.target.closest("#saFullLockScreen")) return;
    const btn = e.target.closest("button");
    if (!btn) return;
    const txt = (btn.innerText || "").trim().toLowerCase();
    if (txt.includes("добавить будильник") || txt === "+") {
      e.preventDefault(); e.stopImmediatePropagation();
      window.openEditSpecificAlarmModal(null, -1);
    }
  }, true);

  setInterval(() => {
    document.querySelectorAll(".modal").forEach(m => {
      if (m.id !== "saEditSpecificModal" && m.id !== "saTestCfgModal" && m.id !== "saProfileQModal") purgeOld7TasksSelect(m);
    });
  }, 300);

  window.pushExactAlarmSchedule = function() {
    if (!window.AndroidLock || !window.AndroidLock.scheduleNextAlarmWithData) return;
    let list = [];
    try { list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]"); } catch (e) {}
    const now = new Date();
    let bestTs = 0, bestPayload = null;

    list.filter(a => a && a.enabled).forEach((a, idx) => {
      const parts = String(a.time || "07:30").split(":");
      const hh = Number(parts.at(0)) || 0, mm = Number(parts.at(1)) || 0;
      const tNorm = String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
      const days = Array.isArray(a.days) ? a.days : [];
      for (let d = 0; d <= 7; d++) {
        const cand = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hh, mm, 0, 0);
        if (cand.getTime() > now.getTime() && (days.length === 0 || days.includes(cand.getDay()))) {
          if (bestTs === 0 || cand.getTime() < bestTs) {
            bestTs = cand.getTime();
            const baseCfg = window.getProfile15Config ? window.getProfile15Config("alarm") : { mode: "random", singleId: 1, rndCnt: 2, queue: [] };
            bestPayload = {
              alarmId: a.id || idx, timeKey: tNorm, title: "⏰ БУДИЛЬНИК", label: a.label || a.name || "Утренний будильник",
              sound: a.sound || localStorage.getItem("sa_last_sound") || "random", vol: Number(a.vol) || 75,
              taskMode: a.taskMode || baseCfg.mode, taskSingleId: Number(a.taskSingleId) || baseCfg.singleId,
              taskRndCnt: Number(a.taskRndCnt) || baseCfg.rndCnt, taskQueue: Array.isArray(a.taskQueue) ? a.taskQueue : baseCfg.queue
            };
          }
          break;
        }
      }
    });
    if (bestTs > 0 && bestPayload) window.AndroidLock.scheduleNextAlarmWithData(bestTs, JSON.stringify(bestPayload));
    else window.AndroidLock.scheduleNextAlarmWithData(0, "{}");
  };

  window.onNativeWake = function(d) {
    d = d || {};
    if (d.vol && window.setProfileVolume) window.setProfileVolume("alarm", Number(d.vol));
    if (d.taskMode && window.saveProfile15Config) {
      window.saveProfile15Config("alarm", { mode: d.taskMode, singleId: Number(d.taskSingleId) || 1, rndCnt: Number(d.taskRndCnt) || 2, queue: Array.isArray(d.taskQueue) ? d.taskQueue : [] });
    }
    const snd = d.sound || localStorage.getItem("sa_last_sound") || "random";
    const vol = Number(d.vol) || 75;
    if (d.taskMode === "none") window.showFullLockScreenZeroAlarm(d.title || "⏰ БУДИЛЬНИК", d.label || "Утренний будильник", snd, vol, d.timeKey || "");
    else if (window.executeStrict25AlarmByProfile) window.executeStrict25AlarmByProfile("alarm", d.title || "⏰ БУДИЛЬНИК", snd, d.label || "");
    if (window.pushExactAlarmSchedule) setTimeout(window.pushExactAlarmSchedule, 1000);
  };
})();
(function mountFull25IntoNativeModal() {
  setInterval(() => {
    const mount = document.getElementById("native25TasksMount");
    if (mount && !mount.dataset.mounted25 && window.getProfile15Config) {
      mount.dataset.mounted25 = "1";
      const cfg = window.getProfile15Config("alarm");
      const allT = (window.Logic25Pack || window.Logic15Pack)?.TASKS || [];
      const opts = allT.map(t => `<option value="${t.id}" ${cfg.singleId===t.id?"selected":""}>№${t.id}. ${t.title}</option>`).join("");
      mount.innerHTML = `
        <div style="padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;margin:8px 0;">
          <div style="font-size:13px;font-weight:700;margin-bottom:6px;">🧠 Логические задания (база из 25 задач)</div>
          <select id="nat25Mode" style="width:100%;min-height:40px;margin-bottom:8px;">
            <option value="none" ${cfg.mode==="none"?"selected":""}>0. Без заданий (0 заданий)</option>
            <option value="single" ${cfg.mode==="single"?"selected":""}>🎯 Выбрать 1 конкретное задание</option>
            <option value="random" ${cfg.mode==="random"?"selected":""}>🎲 Случайный выбор (без повторов)</option>
            <option value="custom" ${cfg.mode==="custom"?"selected":""}>🧩 Своя очередь</option>
          </select>
          <div id="nat25Single" style="display:${cfg.mode==="single"?"block":"none"};margin-bottom:6px;"><select id="nat25SingleSel" style="width:100%;min-height:38px;">${opts}</select></div>
          <div id="nat25Rnd" style="display:${cfg.mode==="random"?"flex":"none"};gap:6px;align-items:center;margin-bottom:6px;">
            <span style="font-size:12px;color:#8b92a5;">Кол-во (1–25):</span>
            <input type="number" id="nat25RndCnt" min="1" max="25" value="${cfg.rndCnt}" style="width:65px;min-height:36px;text-align:center;">
            <button type="button" id="nat25All25" class="btn btn-sec btn-sm" style="flex:1;min-height:36px;font-size:12px;">Все 25 заданий</button>
          </div>
          <div id="nat25Custom" style="display:${cfg.mode==="custom"?"block":"none"};">
            <button type="button" id="nat25OpenQ" class="btn btn-sec btn-sm" style="width:100%;min-height:38px;">🛠️ Настроить свою очередь</button>
          </div>
        </div>`;
      const mSel = document.getElementById("nat25Mode");
      mSel.onchange = () => {
        window.saveProfile15Config("alarm", { mode: mSel.value });
        document.getElementById("nat25Single").style.display = mSel.value === "single" ? "block" : "none";
        document.getElementById("nat25Rnd").style.display = mSel.value === "random" ? "flex" : "none";
        document.getElementById("nat25Custom").style.display = mSel.value === "custom" ? "block" : "none";
      };
      document.getElementById("nat25SingleSel").onchange = e => window.saveProfile15Config("alarm", { singleId: Number(e.target.value) });
      document.getElementById("nat25RndCnt").oninput = e => window.saveProfile15Config("alarm", { rndCnt: Math.max(1, Math.min(25, Number(e.target.value) || 1)) });
      document.getElementById("nat25All25").onclick = () => { document.getElementById("nat25RndCnt").value = "25"; window.saveProfile15Config("alarm", { rndCnt: 25 }); };
      document.getElementById("nat25OpenQ").onclick = () => window.openProfileQueueModal("alarm", () => {});
    }
  }, 250);
})();
(function enforceWavOnlyEverywhere() {
  // Блокируем любой вызов Web Audio API в окне
  window.AudioContext = undefined;
  window.webkitAudioContext = undefined;

  // Перенаправляем все штатные функции звука (будильник, тест, таймер) на 120 WAV-треков
  window.playBuiltInSiren = function() {
    const snd = localStorage.getItem("sa_last_sound") || "random";
    const vol = Number(localStorage.getItem("sa_vol") || 75);
    if (window.SoundPack) window.SoundPack.play(snd, vol, window.db || null, false);
  };
  window.playSiren = window.playBuiltInSiren;
  window.startRingingSound = function(sid) {
    const snd = (sid && (sid.startsWith("mel_") || sid.startsWith("custom_"))) ? sid : (localStorage.getItem("sa_last_sound") || "random");
    const vol = Number(localStorage.getItem("sa_vol") || 75);
    if (window.SoundPack) window.SoundPack.play(snd, vol, window.db || null, false);
  };
  window.stopRingingSound = function() {
    if (window.SoundPack) window.SoundPack.stop();
  };

  // При срабатывании таймера открываем полноэкранный сигнал с танцевальной WAV-мелодией и кнопкой отключения
  setInterval(() => {
    document.querySelectorAll("button").forEach(btn => {
      const txt = (btn.innerText || "").trim().toLowerCase();
      if ((txt.includes("остановить") || txt.includes("выключить") || txt.includes("стоп")) && !btn.dataset.wavStopBound) {
        btn.dataset.wavStopBound = "1";
        btn.addEventListener("click", () => {
          if (window.SoundPack) window.SoundPack.stop();
        }, true);
      }
    });
  }, 300);
})();
(function rebuildInteractiveTimerTab() {
  let totalSeconds = Number(localStorage.getItem("sa_timer_default_sec") || 300);
  let remainingSeconds = totalSeconds;
  let timerInterval = null;
  let isRunning = false;

  function formatHMS(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function syncInputsFromTotal() {
    const hIn = document.getElementById("tmInH");
    const mIn = document.getElementById("tmInM");
    const sIn = document.getElementById("tmInS");
    if (!hIn || !mIn || !sIn) return;
    hIn.value = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    mIn.value = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    sIn.value = String(totalSeconds % 60).padStart(2, "0");
  }

  function updateTimerDisplay() {
    const disp = document.getElementById("tmMainDisplay");
    if (disp) disp.innerText = formatHMS(remainingSeconds);
    const startBtn = document.getElementById("tmBtnStart");
    if (startBtn) {
      startBtn.innerText = isRunning ? "⏸ Пауза" : "▶️ Старт";
      startBtn.style.background = isRunning ? "#f59e0b" : "#10b981";
    }
  }

  function stopTimerLoop() {
    isRunning = false;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    updateTimerDisplay();
  }

  function setNewDuration(sec) {
    stopTimerLoop();
    totalSeconds = Math.max(1, Math.min(86399, Math.floor(sec)));
    remainingSeconds = totalSeconds;
    localStorage.setItem("sa_timer_default_sec", String(totalSeconds));
    syncInputsFromTotal();
    updateTimerDisplay();
  }

  function showTimerFinishOverlay() {
    const snd = localStorage.getItem("sa_timer_sound") || localStorage.getItem("sa_last_sound") || "random";
    const vol = Number(localStorage.getItem("sa_vol") || 75);
    if (window.SoundPack) window.SoundPack.play(snd, vol, window.db || null, false);

    let ov = document.getElementById("saTimerDoneOverlay");
    if (ov) ov.remove();
    ov = document.createElement("div");
    ov.id = "saTimerDoneOverlay";
    ov.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(11,13,20,0.96);z-index:999998;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:24px;box-sizing:border-box;color:#fff;text-align:center;";
    const trackName = window.SoundPack && window.SoundPack.getCurrentName ? window.SoundPack.getCurrentName() : "Мелодия таймера";

    ov.innerHTML = `
      <div style="font-size:15px;font-weight:800;letter-spacing:1.5px;color:#10b981;margin-bottom:10px;">⏳ ВРЕМЯ ВЫШЛО</div>
      <div style="font-size:64px;font-weight:900;margin-bottom:10px;">00:00:00</div>
      <div style="font-size:13px;color:#94a3b8;margin-bottom:28px;">🎵 ${trackName}</div>
      <button type="button" id="saTimerStopBtn" style="width:100%;max-width:340px;min-height:68px;border-radius:18px;border:none;background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);color:#fff;font-size:21px;font-weight:900;box-shadow:0 10px 26px rgba(239,68,68,0.45);cursor:pointer;">
        ⏹ Остановить
      </button>`;
    document.body.appendChild(ov);

    document.getElementById("saTimerStopBtn").onclick = () => {
      if (window.SoundPack) window.SoundPack.stop();
      ov.remove();
      remainingSeconds = totalSeconds;
      updateTimerDisplay();
    };
  }
  function startTimerLoop() {
    if (isRunning) return;
    if (remainingSeconds <= 0) remainingSeconds = totalSeconds;
    isRunning = true;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      if (!isRunning) return;
      remainingSeconds--;
      updateTimerDisplay();
      if (remainingSeconds <= 0) { stopTimerLoop(); showTimerFinishOverlay(); }
    }, 1000);
  }

  function mountTimerUI(container) {
    if (!container || container.dataset.customTimerReady) return;
    container.dataset.customTimerReady = "1";
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    const savedSnd = localStorage.getItem("sa_timer_sound") || "random";

    container.innerHTML = `
      <div style="padding:14px;border-radius:18px;background:#161822;border:1px solid #2a2e3d;color:#fff;text-align:center;pointer-events:auto;">
        <div id="tmMainDisplay" title="Нажмите для ввода" style="font-size:50px;font-weight:900;letter-spacing:2px;margin:6px 0 12px;cursor:pointer;">${formatHMS(remainingSeconds)}</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
          <div style="background:#1f222e;padding:8px;border-radius:12px;border:1px solid #2a2e3d;">
            <div style="font-size:11px;color:#8b92a5;margin-bottom:4px;">Часы</div>
            <button type="button" class="btn btn-sec btn-sm tm-step" data-unit="h" data-d="1" style="width:100%;min-height:34px;font-size:18px;">+</button>
            <input type="number" id="tmInH" min="0" max="23" value="00" style="width:100%;text-align:center;font-size:20px;font-weight:800;margin:4px 0;min-height:38px;background:#12141d;color:#fff;border:1px solid #2a2e3d;border-radius:8px;">
            <button type="button" class="btn btn-sec btn-sm tm-step" data-unit="h" data-d="-1" style="width:100%;min-height:34px;font-size:18px;">−</button>
          </div>
          <div style="background:#1f222e;padding:8px;border-radius:12px;border:1px solid #2a2e3d;">
            <div style="font-size:11px;color:#8b92a5;margin-bottom:4px;">Минуты</div>
            <button type="button" class="btn btn-sec btn-sm tm-step" data-unit="m" data-d="1" style="width:100%;min-height:34px;font-size:18px;">+</button>
            <input type="number" id="tmInM" min="0" max="59" value="05" style="width:100%;text-align:center;font-size:20px;font-weight:800;margin:4px 0;min-height:38px;background:#12141d;color:#fff;border:1px solid #2a2e3d;border-radius:8px;">
            <button type="button" class="btn btn-sec btn-sm tm-step" data-unit="m" data-d="-1" style="width:100%;min-height:34px;font-size:18px;">−</button>
          </div>
          <div style="background:#1f222e;padding:8px;border-radius:12px;border:1px solid #2a2e3d;">
            <div style="font-size:11px;color:#8b92a5;margin-bottom:4px;">Секунды</div>
            <button type="button" class="btn btn-sec btn-sm tm-step" data-unit="s" data-d="5" style="width:100%;min-height:34px;font-size:18px;">+</button>
            <input type="number" id="tmInS" min="0" max="59" value="00" style="width:100%;text-align:center;font-size:20px;font-weight:800;margin:4px 0;min-height:38px;background:#12141d;color:#fff;border:1px solid #2a2e3d;border-radius:8px;">
            <button type="button" class="btn btn-sec btn-sm tm-step" data-unit="s" data-d="-5" style="width:100%;min-height:34px;font-size:18px;">−</button>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <button type="button" class="btn btn-sec tm-preset" data-sec="60" style="flex:1;min-height:40px;font-weight:700;">1 мин</button>
          <button type="button" class="btn btn-sec tm-preset" data-sec="300" style="flex:1;min-height:40px;font-weight:700;">5 мин</button>
          <button type="button" class="btn btn-sec tm-preset" data-sec="600" style="flex:1;min-height:40px;font-weight:700;">10 мин</button>
        </div>
        <div style="margin-bottom:12px;text-align:left;">
          <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">🎵 Мелодия таймера (120 треков)</label>
          <select id="tmSndSel" style="width:100%;min-height:40px;"><option value="random">🎲 Случайная мелодия</option>${list120}</select>
        </div>
        <div style="display:flex;gap:10px;">
          <button type="button" id="tmBtnStart" class="btn" style="flex:2;min-height:50px;font-size:17px;font-weight:800;background:#10b981;border:none;color:#fff;">▶️ Старт</button>
          <button type="button" id="tmBtnReset" class="btn btn-sec" style="flex:1;min-height:50px;font-size:16px;font-weight:700;">🔄 Сброс</button>
        </div>
      </div>`;

    syncInputsFromTotal();
    const sndSel = document.getElementById("tmSndSel"); sndSel.value = savedSnd;
    sndSel.onchange = () => localStorage.setItem("sa_timer_sound", sndSel.value);

    const readInputs = () => {
      const h = Math.max(0, Math.min(23, Number(document.getElementById("tmInH").value) || 0));
      const m = Math.max(0, Math.min(59, Number(document.getElementById("tmInM").value) || 0));
      const s = Math.max(0, Math.min(59, Number(document.getElementById("tmInS").value) || 0));
      setNewDuration(h * 3600 + m * 60 + s);
    };
    ["tmInH", "tmInM", "tmInS"].forEach(id => document.getElementById(id).addEventListener("change", readInputs));

    container.querySelectorAll(".tm-step").forEach(btn => {
      btn.onclick = () => {
        let h = Number(document.getElementById("tmInH").value) || 0, m = Number(document.getElementById("tmInM").value) || 0, s = Number(document.getElementById("tmInS").value) || 0;
        const d = Number(btn.dataset.d);
        if (btn.dataset.unit === "h") h = (h + d + 24) % 24;
        if (btn.dataset.unit === "m") m = (m + d + 60) % 60;
        if (btn.dataset.unit === "s") s = (s + d + 60) % 60;
        setNewDuration(h * 3600 + m * 60 + s);
      };
    });
    container.querySelectorAll(".tm-preset").forEach(btn => { btn.onclick = () => setNewDuration(Number(btn.dataset.sec)); });
    document.getElementById("tmMainDisplay").onclick = () => { document.getElementById("tmInM").focus(); document.getElementById("tmInM").select(); };
    document.getElementById("tmBtnStart").onclick = () => { if (isRunning) stopTimerLoop(); else startTimerLoop(); };
    document.getElementById("tmBtnReset").onclick = () => { stopTimerLoop(); remainingSeconds = totalSeconds; updateTimerDisplay(); };
  }

  setInterval(() => {
    const byId = document.getElementById("timerTab") || document.getElementById("tab-timer") || document.getElementById("timerSection");
    if (byId && byId.offsetParent !== null && !byId.dataset.customTimerReady) { mountTimerUI(byId); return; }
    document.querySelectorAll("section, .tab-content, .view, div").forEach(el => {
      if (el.dataset.customTimerReady || el.offsetParent === null) return;
      const t = el.innerText || "";
      if (t.includes("00:05:00") && t.includes("1 мин") && t.includes("5 мин") && t.length < 250) mountTimerUI(el);
    });
  }, 250);
})();
(function fullLockscreenTasksAnd5SecDucking() {
  let sliderTargetVol = 75;
  let liveAppliedVol = 75;
  let idleRestoreTimer = null;

  function setLockedVolumeExact(pct) {
    liveAppliedVol = Math.max(10, Math.min(100, Math.round(pct)));
    if (window.AndroidLock && window.AndroidLock.setVolume) {
      window.AndroidLock.setVolume(liveAppliedVol);
    }
    document.querySelectorAll("audio").forEach(a => {
      try {
        a.muted = false;
        a.volume = Math.max(0.05, Math.min(1.0, liveAppliedVol / 100));
        if (a.paused && document.getElementById("saFullLockScreen")) a.play().catch(() => {});
      } catch (e) {}
    });
  }

  // При касании задания или вводе ответа снижаем громкость на 10% (не ниже 10%), через 5 сек бездействия возвращаем
  function onTaskInteractDuck10() {
    if (!document.getElementById("saFullLockScreen")) return;
    if (!window.ringQueue || window.ringQueue.at(0) === "none") return;

    const ducked = Math.max(10, sliderTargetVol - 10);
    setLockedVolumeExact(ducked);

    clearTimeout(idleRestoreTimer);
    idleRestoreTimer = setTimeout(() => {
      if (document.getElementById("saFullLockScreen")) {
        setLockedVolumeExact(sliderTargetVol);
      }
    }, 5000);
  }

  document.addEventListener("pointerdown", e => {
    if (e.target && e.target.closest("#saLockTaskBox")) onTaskInteractDuck10();
  }, true);
  document.addEventListener("input", e => {
    if (e.target && e.target.closest("#saLockTaskBox")) onTaskInteractDuck10();
  }, true);

  // Главный запуск будильника с заданиями поверх экрана блокировки (использует индивидуальные настройки будильника)
  window.launchLockedTasksOverLockscreen = function(opts) {
    opts = opts || {};
    const title = opts.title || "⏰ БУДИЛЬНИК";
    const label = opts.label || "Утренний будильник";
    const snd = opts.sound || localStorage.getItem("sa_last_sound") || "random";
    sliderTargetVol = Math.max(10, Math.min(100, Number(opts.vol) || 75));
    liveAppliedVol = sliderTargetVol;

    const mode = opts.taskMode || "random";
    const singleId = Math.max(1, Math.min(25, Number(opts.taskSingleId) || 1));
    const rndCnt = Math.max(1, Math.min(25, Number(opts.taskRndCnt) || 2));
    const customQ = Array.isArray(opts.taskQueue) ? opts.taskQueue : [];

    let taskQueue = new Array();
    if (mode === "single") {
      taskQueue = new Array(singleId);
    } else if (mode === "random" && window.Logic25Pack) {
      taskQueue = window.Logic25Pack.buildRandomQueue(rndCnt);
    } else if (mode === "custom") {
      taskQueue = Array.from(customQ);
    }

    // Если выбрано 0 заданий — открываем полноэкранный режим без блокировки
    if (mode === "none" || taskQueue.length === 0) {
      if (window.showFullLockScreenZeroAlarm) {
        window.showFullLockScreenZeroAlarm(title, label, snd, sliderTargetVol, opts.timeKey || "");
      }
      return;
    }

    window.ringQueue = taskQueue.map(id => "l25_" + id);
    if (window.SoundPack) window.SoundPack.play(snd, sliderTargetVol, window.db || null, false);
    if (window.AndroidLock && window.AndroidLock.setRinging) {
      window.AndroidLock.setRinging(true, sliderTargetVol, true);
    }
    setLockedVolumeExact(sliderTargetVol);
    try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {}

    let ov = document.getElementById("saFullLockScreen");
    if (ov) ov.remove();
    ov = document.createElement("div");
    ov.id = "saFullLockScreen";
    ov.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:linear-gradient(180deg,#0b0d14 0%,#141826 100%);z-index:999999;display:flex;flex-direction:column;justify-content:space-between;padding:18px;box-sizing:border-box;color:#fff;overflow-y:auto;";

    const curName = window.SoundPack && window.SoundPack.getCurrentName ? window.SoundPack.getCurrentName() : "Мелодия будильника";
    ov.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:13px;font-weight:800;letter-spacing:1.2px;color:#ff2a4b;text-transform:uppercase;">${title}</div>
        <div id="saTasksLiveClock" style="font-size:52px;font-weight:900;line-height:1.05;margin:4px 0;">${new Date().toTimeString().slice(0,5)}</div>
        <div style="font-size:16px;font-weight:700;color:#f1f5f9;margin-bottom:4px;">${label}</div>
        <div id="saLockProg" style="font-size:14px;color:#10b981;font-weight:800;"></div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px;">🎵 ${curName} • 🔊 Громкость: ${sliderTargetVol}%</div>
      </div>
      <div id="saLockTaskBox" style="background:#161822;border:2px solid #2a2e3d;border-radius:18px;padding:16px;margin:auto 0;"></div>
      <div style="text-align:center;font-size:12px;color:#ff2a4b;font-weight:700;margin-top:10px;">
        🔒 Выход, шторка и кнопки громкости заблокированы до решения всех заданий
      </div>
    `;
    document.body.appendChild(ov);

    const clockTick = setInterval(() => {
      const el = document.getElementById("saTasksLiveClock");
      if (el) el.innerText = new Date().toTimeString().slice(0, 5);
      else clearInterval(clockTick);
      if (document.getElementById("saFullLockScreen")) setLockedVolumeExact(liveAppliedVol);
    }, 500);

    let idx = 0;
    const tBox = document.getElementById("saLockTaskBox");
    const prog = document.getElementById("saLockProg");

    const finishAndUnlock = () => {
      clearInterval(clockTick);
      clearTimeout(idleRestoreTimer);
      window.ringQueue = new Array("none");
      if (window.SoundPack) window.SoundPack.stop();
      if (window.AndroidLock && window.AndroidLock.setRinging) {
        window.AndroidLock.setRinging(false, sliderTargetVol, false);
      }
      try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); } catch (e) {}

      if (opts.timeKey) {
        try {
          let list = JSON.parse(localStorage.getItem("sa_alarms") || localStorage.getItem("alarms") || "[]");
          let changed = false;
          list.forEach(a => {
            if (a && a.time === opts.timeKey && (!Array.isArray(a.days) || a.days.length === 0)) {
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
      if (window.pushExactAlarmSchedule) setTimeout(window.pushExactAlarmSchedule, 400);
    };

    const showStep = () => {
      if (idx >= taskQueue.length) {
        finishAndUnlock();
        return;
      }
      prog.innerText = `Задание ${idx + 1} из ${taskQueue.length}`;
      const pack = window.Logic25Pack || window.Logic15Pack;
      if (pack) {
        pack.renderById(taskQueue.at(idx), tBox, () => {
          idx++;
          showStep();
        }, () => {
          clearTimeout(idleRestoreTimer);
          setLockedVolumeExact(sliderTargetVol);
          tBox.style.borderColor = "#ff2a4b";
          setTimeout(() => tBox.style.borderColor = "#2a2e3d", 400);
        });
      }
    };
    showStep();
  };

  // Переопределяем пробуждение из Android: гарантированно запускаем полноэкранные задания поверх блокировки
  window.onNativeWake = function(d) {
    d = d || {};
    window.launchLockedTasksOverLockscreen(d);
  };

  // При старте приложения сразу синхронизируем сохранённое расписание с нативным AlarmManager
  setTimeout(() => {
    if (window.pushExactAlarmSchedule) window.pushExactAlarmSchedule();
  }, 500);
})();