(function cleanMasterUI() {
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", cleanMasterUI); return; }

  // 1. Встраиваем в настройки будильника выбор из 120 мелодий, рандом и громкость
  setInterval(() => {
    document.querySelectorAll('.modal input[type="file"]').forEach(fileIn => {
      const wrap = fileIn.parentElement;
      if (!wrap || wrap.dataset.melReady) return;
      wrap.dataset.melReady = "1";
      const list120 = window.SoundPack ? window.SoundPack.list.map(m => `<option value="${m.id}">🎵 ${m.name}</option>`).join("") : "";
      const curV = localStorage.getItem("sa_vol") || "60";
      const initS = localStorage.getItem("sa_last_sound") || "random";
      const box = document.createElement("div");
      box.style.cssText = "margin-bottom:12px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
      box.innerHTML = `
        <label style="display:block;margin-bottom:6px;font-size:12px;color:#8b92a5;">Мелодия будильника (120 звуков, без сирены)</label>
        <select class="sa-mel-sel" style="width:100%;margin-bottom:8px;">
          <option value="random">🎲 Случайная (без повторов)</option>
          ${list120}
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
      box.querySelector(".m-rnd").onclick = () => { sel.value = "random"; localStorage.setItem("sa_last_sound", "random"); };
      let pl = false;
      box.querySelector(".m-prv").onclick = e => {
        pl = !pl;
        if (pl) { window.SoundPack.play(sel.value, Number(localStorage.getItem("sa_vol")||60), window.db||null, true); e.target.innerText = "⏹ Стоп"; }
        else { window.SoundPack.stop(); e.target.innerText = "▶️ Слушать"; }
      };
      box.querySelector(".m-vr").oninput = e => { localStorage.setItem("sa_vol", e.target.value); box.querySelector(".m-vl").innerText = e.target.value + "%"; };
    });
  }, 300);

  // 2. Полноэкранный экран тревоги с заданиями и блокировкой выхода
  window.launchLockedAlarmScreen = function(title, snd, tType, cnt) {
    const vol = Number(localStorage.getItem("sa_vol") || 60);
    const hasTasks = (tType !== "none" && cnt > 0);
    let queue = [];
    if (!hasTasks) queue = ["none"];
    else if (tType === "marathon" && window.TasksPack) queue = [...window.TasksPack.ALL_15];
    else queue = Array.from({length: cnt}, () => tType);

    window.ringQueue = queue;
    if (window.SoundPack) window.SoundPack.play(snd, vol, window.db || null, false);
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(true, vol, hasTasks);

    let ov = document.getElementById("saFullLockScreen");
    if (ov) ov.remove();
    ov = document.createElement("div");
    ov.id = "saFullLockScreen";
    ov.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:#0d0f17;z-index:99999;display:flex;flex-direction:column;justify-content:space-between;padding:18px;box-sizing:border-box;color:#fff;overflow-y:auto;";
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    ov.innerHTML = `
      <div>
        <div style="text-align:center;color:#ff2a4b;font-weight:800;font-size:14px;">${title}</div>
        <div style="text-align:center;font-size:46px;font-weight:900;margin:4px 0;">${new Date().toTimeString().slice(0,5)}</div>
        <div id="saLockProg" style="text-align:center;font-size:13px;color:#10b981;font-weight:700;margin-bottom:10px;"></div>
        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <select id="saLockSndSel" style="flex:1;min-height:38px;font-size:13px;">
            <option value="random">🎲 Случайная мелодия</option>
            ${list120}
          </select>
          <button type="button" id="saLockNextSnd" class="btn btn-sec btn-sm" style="min-height:38px;padding:0 10px;">🔀</button>
        </div>
      </div>
      <div id="saLockTaskBox" style="background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:16px;margin:auto 0;"></div>
      <div style="text-align:center;font-size:12px;color:#8b92a5;margin-top:10px;">
        ${hasTasks ? "🔒 Выход заблокирован до решения всех заданий" : "🔓 Режим без заданий"}
      </div>
    `;
    document.body.appendChild(ov);

    const sSel = document.getElementById("saLockSndSel");
    if (window.SoundPack) sSel.value = window.SoundPack.getCurrentId();
    sSel.onchange = () => window.SoundPack && window.SoundPack.play(sSel.value, Number(localStorage.getItem("sa_vol")||60), window.db||null, false);
    document.getElementById("saLockNextSnd").onclick = () => {
      if (window.SoundPack) { window.SoundPack.play("random", Number(localStorage.getItem("sa_vol")||60), window.db||null, false); sSel.value = window.SoundPack.getCurrentId(); }
    };

    let step = 0;
    const tBox = document.getElementById("saLockTaskBox"), prog = document.getElementById("saLockProg");
    const finishAll = () => {
      if (window.SoundPack) window.SoundPack.stop();
      if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, vol, false);
      ov.remove();
    };
    const showStep = () => {
      if (step >= queue.length) { finishAll(); return; }
      prog.innerText = hasTasks ? `Задание ${step + 1} из ${queue.length}` : "Обычный звонок";
      if (window.renderFullTask) {
        window.renderFullTask(queue[step], 2, tBox, () => { step++; showStep(); }, () => {
          tBox.style.borderColor = "#ff2a4b";
          setTimeout(() => tBox.style.borderColor = "#2a2e3d", 350);
        });
      }
    };
    showStep();
  };
  // 3. Окно настройки теста (кол-во заданий, тип, мелодия и громкость)
  window.openTestConfigModal = function() {
    let m = document.getElementById("saTestCfgModal");
    if (m) m.remove();
    m = document.createElement("div");
    m.id = "saTestCfgModal";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;padding:14px;z-index:20000;box-sizing:border-box;";
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    const curV = localStorage.getItem("sa_vol") || "60";
    m.innerHTML = `
      <div style="width:100%;max-width:360px;background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:16px;box-sizing:border-box;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <b style="font-size:17px;">🧪 Настройка теста</b>
          <button type="button" id="tCfgClose" class="btn btn-sec btn-sm" style="min-height:34px;padding:0 10px;">✕</button>
        </div>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Сколько заданий (0–15)</label>
        <input type="number" id="tCfgCount" min="0" max="15" value="2" style="width:100%;margin-bottom:10px;min-height:42px;">
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Тип заданий</label>
        <select id="tCfgTask" style="width:100%;margin-bottom:10px;min-height:42px;">
          <option value="math">1. Математика</option>
          <option value="code">2. Код тревоги</option>
          <option value="targets">5. Раздави мишени</option>
          <option value="logic">6. Логическая загадка</option>
          <option value="sort">8. Сортировка чисел</option>
          <option value="stroop">9. Тест Струпа</option>
          <option value="seq">10. Продолжи ряд</option>
          <option value="reverse">11. Слово наоборот</option>
          <option value="eq">15. Уравнение X</option>
          <option value="marathon">🔥 Все 15 подряд</option>
          <option value="none">0. Без заданий (без блокировки)</option>
        </select>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Музыка (120 звуков)</label>
        <select id="tCfgSound" style="width:100%;margin-bottom:8px;min-height:42px;">
          <option value="random">🎲 Случайная</option>
          ${list120}
        </select>
        <div style="padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;margin-bottom:6px;">
            <span>🔊 Громкость: <b id="tCfgVolTxt">${curV}%</b></span>
            <input type="range" id="tCfgVolRng" min="10" max="100" value="${curV}" style="flex:1;min-height:28px;">
          </div>
          <button type="button" id="tCfgPrv" class="btn btn-sec btn-sm" style="width:100%;min-height:36px;">▶️ Прослушать</button>
        </div>
        <button type="button" id="tCfgRun" class="btn" style="width:100%;min-height:48px;font-size:16px;">▶️ Запустить тест</button>
      </div>
    `;
    document.body.appendChild(m);

    document.getElementById("tCfgVolRng").oninput = e => {
      localStorage.setItem("sa_vol", e.target.value);
      document.getElementById("tCfgVolTxt").innerText = e.target.value + "%";
    };
    let prv = false;
    document.getElementById("tCfgPrv").onclick = e => {
      prv = !prv;
      if (prv) { window.SoundPack.play(document.getElementById("tCfgSound").value, Number(localStorage.getItem("sa_vol")||60), window.db||null, true); e.target.innerText = "⏹ Стоп"; }
      else { window.SoundPack.stop(); e.target.innerText = "▶️ Прослушать"; }
    };
    document.getElementById("tCfgClose").onclick = () => { window.SoundPack.stop(); m.remove(); };
    document.getElementById("tCfgRun").onclick = () => {
      window.SoundPack.stop();
      const cnt = Math.min(15, Math.max(0, Number(document.getElementById("tCfgCount").value) || 0));
      const rawT = document.getElementById("tCfgTask").value;
      const tType = (cnt === 0 || rawT === "none") ? "none" : rawT;
      const snd = document.getElementById("tCfgSound").value;
      m.remove();
      window.launchLockedAlarmScreen("🧪 ТЕСТОВЫЙ БУДИЛЬНИК", snd, tType, cnt);
    };
  };

  window.testAlarm = () => window.openTestConfigModal();
  window.triggerRing = (title, snd, tType, diff, rounds) => window.launchLockedAlarmScreen(title, snd, tType, rounds);
  window.onNativeWake = (d) => {
    d = d || {};
    window.launchLockedAlarmScreen(d.title || "⏰ БУДИЛЬНИК", d.sound || "random", d.task || "math", d.task === "none" ? 0 : (Number(d.rounds) || 1));
  };

  // 4. Перехват кнопки "Тест" на главном экране
  document.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b && b.innerText && b.innerText.trim().toLowerCase().includes("тест") && !b.closest("#saTestCfgModal") && !b.closest("#saFullLockScreen")) {
      e.preventDefault(); e.stopImmediatePropagation();
      window.openTestConfigModal();
    }
  }, true);
})();