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