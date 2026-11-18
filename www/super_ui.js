(function masterAlarmEngine() {
  const TASKS_15 = Array.of(
    Array.of("math","1. Математика"), Array.of("code","2. Код тревоги"), Array.of("tiles","3. Плитки памяти"),
    Array.of("memory","4. Найди пары"), Array.of("targets","5. Раздави мишени"), Array.of("logic","6. Логическая загадка"),
    Array.of("odd","7. Найди лишнее"), Array.of("sort","8. Сортировка чисел"), Array.of("stroop","9. Тест Струпа (цвета)"),
    Array.of("seq","10. Продолжи ряд"), Array.of("reverse","11. Слово наоборот"), Array.of("emoji","12. Поиск эмодзи"),
    Array.of("count","13. Быстрый счёт"), Array.of("compare","14. Что больше?"), Array.of("eq","15. Уравнение X")
  );
  const ALL_15_IDS = TASKS_15.map(x => x.at(0));

  function drawTask(t, diff, box, onOk, onFail) {
    diff = Math.max(1, Math.min(20, Number(diff) || 5));
    if (t === "none") {
      box.innerHTML = `<div style="text-align:center;"><p style="color:#8b92a5;margin-bottom:16px;">Обычный режим без заданий</p>
        <button type="button" id="okZeroBtn" class="btn" style="width:100%;min-height:54px;font-size:18px;">✅ Выключить будильник</button></div>`;
      document.getElementById("okZeroBtn").onclick = onOk; return;
    }
    if (t === "code") {
      const len = 3 + diff, code = String(Math.floor(Math.pow(10, len-1) + Math.random()*9*Math.pow(10, len-1)));
      box.innerHTML = `<h3 style="text-align:center;">Введите код тревоги:</h3>
        <div style="font-size:32px;font-weight:900;letter-spacing:4px;text-align:center;color:#ff2a4b;margin:12px 0;">${code}</div>
        <input type="number" id="ansIn" placeholder="Цифры" style="width:100%;text-align:center;font-size:20px;min-height:46px;">
        <button type="button" id="ansBtn" class="btn" style="width:100%;margin-top:10px;min-height:48px;">Проверить</button>`;
      document.getElementById("ansBtn").onclick = () => document.getElementById("ansIn").value.trim() === code ? onOk() : onFail(); return;
    }
    if (t === "tiles") {
      const total = 6 + diff * 3, litCount = 2 + diff;
      const lit = new Set(); while (lit.size < litCount) lit.add(Math.floor(Math.random() * total));
      box.innerHTML = `<h3 style="text-align:center;">Запомните красные плитки!</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;">
        ${Array.from({length:total},(_,i)=>`<button type="button" class="btn btn-sec tl-b" data-i="${i}" style="min-height:52px;background:${lit.has(i)?'#ff2a4b':'#1f222e'};"></button>`).join("")}</div>`;
      setTimeout(() => {
        if (!document.getElementById("saFullLockScreen")) return;
        box.querySelector("h3").innerText = "Повторите красные плитки:";
        let found = 0;
        box.querySelectorAll(".tl-b").forEach(b => {
          b.style.background = "#1f222e";
          b.onclick = () => {
            const idx = Number(b.dataset.i);
            if (lit.has(idx) && !b.disabled) { b.disabled = true; b.style.background = "#10b981"; found++; if (found === lit.size) onOk(); }
            else if (!lit.has(idx)) onFail();
          };
        });
      }, 1600); return;
    }
    if (t === "memory") {
      const icons = Array.of("🍎","🚀","⚡","🔥","💎","🎵").slice(0, 2 + diff);
      const deck = icons.concat(icons).sort(() => Math.random() - 0.5);
      let open = [], matched = 0;
      box.innerHTML = `<h3 style="text-align:center;">Найдите все пары:</h3>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px;">
        ${deck.map((ic,i)=>`<button type="button" class="btn btn-sec mm-b" data-i="${i}" data-v="${ic}" style="min-height:52px;font-size:22px;">❓</button>`).join("")}</div>`;
      box.querySelectorAll(".mm-b").forEach(b => b.onclick = () => {
        if (b.disabled || open.includes(b) || open.length >= 2) return;
        b.innerText = b.dataset.v; open.push(b);
        if (open.length === 2) {
          if (open.at(0).dataset.v === open.at(1).dataset.v) {
            open.forEach(x => { x.disabled = true; x.style.opacity = "0.4"; }); open = []; matched += 2;
            if (matched === deck.length) onOk();
          } else { setTimeout(() => { open.forEach(x => x.innerText = "❓"); open = []; }, 550); }
        }
      }); return;
    }
    if (t === "targets") {
      let left = 4 + diff * 2;
      box.innerHTML = `<h3 style="text-align:center;">Нажмите на мишени (<b id="tgL">${left}</b>):</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;">
        ${Array.from({length:left},()=>`<button type="button" class="btn btn-sec tg-b" style="font-size:24px;min-height:52px;">🎯</button>`).join("")}</div>`;
      box.querySelectorAll(".tg-b").forEach(b => b.onclick = () => {
        if (b.disabled) return; b.disabled = true; b.innerText = "✅"; b.style.opacity = "0.3"; left--;
        document.getElementById("tgL").innerText = left; if (left <= 0) onOk();
      }); return;
    }
    if (t === "logic" && window.RIDDLES_BANK) {
      const r = window.RIDDLES_BANK[Math.floor(Math.random() * window.RIDDLES_BANK.length)];
      box.innerHTML = `<h3 style="text-align:center;">${r.q}</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
        ${r.o.map((x,i)=>`<button type="button" class="btn btn-sec rd-b" data-i="${i}" style="min-height:48px;">${x}</button>`).join("")}</div>`;
      box.querySelectorAll(".rd-b").forEach(b => b.onclick = () => Number(b.dataset.i) === r.a ? onOk() : onFail()); return;
    }
    if (t === "odd") {
      const pairs = Array.of(["🍎","🍏"],["🐶","🐺"],["🌞","🌝"],["⌚","⏰"],["🔑","🗝️"],["🍀","☘️"]);
      const p = pairs[Math.floor(Math.random()*pairs.length)], ti = Math.floor(Math.random()*9);
      box.innerHTML = `<h3 style="text-align:center;">Найдите лишний символ:</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;">
        ${Array.from({length:9},(_,i)=>`<button type="button" class="btn btn-sec od-b" data-i="${i}" style="font-size:26px;min-height:54px;">${i===ti?p.at(1):p.at(0)}</button>`).join("")}</div>`;
      box.querySelectorAll(".od-b").forEach(b => b.onclick = () => Number(b.dataset.i) === ti ? onOk() : onFail()); return;
    }
    if (t === "sort") {
      const nums = Array.from({length: 4 + diff}, () => Math.floor(Math.random()*90)+10), s = Array.from(nums).sort((a,b)=>a-b); let idx = 0;
      box.innerHTML = `<h3 style="text-align:center;">Нажмите по возрастанию:</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;">
        ${nums.map(n=>`<button type="button" class="btn btn-sec sr-b" data-n="${n}" style="min-height:48px;font-size:18px;">${n}</button>`).join("")}</div>`;
      box.querySelectorAll(".sr-b").forEach(b => b.onclick = () => {
        if (Number(b.dataset.n) === s[idx]) { b.disabled = true; b.style.opacity = "0.25"; idx++; if (idx === s.length) onOk(); } else onFail();
      }); return;
    }
    if (t === "stroop") {
      const cs = Array.of({n:"КРАСНЫЙ",c:"#ff2a4b"},{n:"СИНИЙ",c:"#3b82f6"},{n:"ЗЕЛЁНЫЙ",c:"#10b981"},{n:"ЖЁЛТЫЙ",c:"#f59e0b"});
      const w = cs[Math.floor(Math.random()*4)], ink = cs[Math.floor(Math.random()*4)];
      box.innerHTML = `<h3 style="text-align:center;">Нажмите на ЦВЕТ текста:</h3><div style="font-size:32px;font-weight:900;text-align:center;margin:14px 0;color:${ink.c};">${w.n}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${cs.map(x=>`<button type="button" class="btn btn-sec st-b" data-c="${x.c}" style="min-height:48px;">${x.n}</button>`).join("")}</div>`;
      box.querySelectorAll(".st-b").forEach(b => b.onclick = () => b.dataset.c === ink.c ? onOk() : onFail()); return;
    }
    if (t === "seq") {
      const a = 2 + Math.floor(Math.random()*6), d = (2 + Math.floor(Math.random()*5)) * diff, ans = a + d*4;
      const opts = Array.of(ans, ans+d, ans-2, ans+5).sort(() => Math.random() - 0.5);
      box.innerHTML = `<h3 style="text-align:center;">Продолжите ряд:</h3><div style="font-size:26px;font-weight:900;text-align:center;margin:12px 0;">${a}, ${a+d}, ${a+d*2}, ${a+d*3}, ?</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${opts.map(o=>`<button type="button" class="btn btn-sec sq-b" data-v="${o}" style="min-height:48px;font-size:18px;">${o}</button>`).join("")}</div>`;
      box.querySelectorAll(".sq-b").forEach(b => b.onclick = () => Number(b.dataset.v) === ans ? onOk() : onFail()); return;
    }
    if (t === "reverse") {
      const ws = diff === 1 ? Array.of("УТРО","СВЕТ","ЗВУК") : (diff === 2 ? Array.of("ВРЕМЯ","РАССВЕТ","ЗАРЯДКА") : Array.of("БУДИЛЬНИК","ПРОБУЖДЕНИЕ","ЭНЕРГИЯ"));
      const w = ws[Math.floor(Math.random()*ws.length)], rev = w.split("").reverse().join("");
      box.innerHTML = `<h3 style="text-align:center;">Напишите НАОБОРОТ:</h3><div style="font-size:26px;font-weight:800;text-align:center;color:#ff2a4b;margin:12px 0;">${w}</div>
        <input type="text" id="ansIn" placeholder="Задом наперёд" style="width:100%;text-align:center;min-height:46px;"><button type="button" id="ansBtn" class="btn" style="width:100%;margin-top:10px;min-height:48px;">Проверить</button>`;
      document.getElementById("ansBtn").onclick = () => document.getElementById("ansIn").value.trim().toUpperCase() === rev ? onOk() : onFail(); return;
    }
    if (t === "emoji") {
      const tot = 8 + diff*4, ti = Math.floor(Math.random()*tot);
      box.innerHTML = `<h3 style="text-align:center;">Найдите другой смайл:</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px;">
        ${Array.from({length:tot},(_,i)=>`<button type="button" class="btn btn-sec em-b" data-i="${i}" style="font-size:22px;min-height:46px;">${i===ti?"😺":"😸"}</button>`).join("")}</div>`;
      box.querySelectorAll(".em-b").forEach(b => b.onclick = () => Number(b.dataset.i) === ti ? onOk() : onFail()); return;
    }
    if (t === "count") {
      const c = 4 + diff*2 + Math.floor(Math.random()*4), arr = Array(c).fill("⭐").concat(Array(6+diff*2).fill("🔹")).sort(()=>Math.random()-0.5);
      box.innerHTML = `<h3 style="text-align:center;">Сколько звёзд ⭐?</h3><div style="font-size:22px;text-align:center;margin:12px 0;">${arr.join(" ")}</div>
        <input type="number" id="ansIn" placeholder="Количество" style="width:100%;text-align:center;min-height:46px;"><button type="button" id="ansBtn" class="btn" style="width:100%;margin-top:10px;min-height:48px;">Ответить</button>`;
      document.getElementById("ansBtn").onclick = () => Number(document.getElementById("ansIn").value) === c ? onOk() : onFail(); return;
    }
    if (t === "compare") {
      const a1 = 8 + diff*4 + Math.floor(Math.random()*10), b1 = 2 + diff + Math.floor(Math.random()*3), a2 = 15 + diff*8 + Math.floor(Math.random()*15), b2 = 10 + Math.floor(Math.random()*15);
      box.innerHTML = `<h3 style="text-align:center;">Что больше?</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;">
        <button type="button" id="cL" class="btn btn-sec" style="min-height:54px;font-size:18px;">${a1} × ${b1}</button><button type="button" id="cR" class="btn btn-sec" style="min-height:54px;font-size:18px;">${a2} + ${b2}</button></div>`;
      document.getElementById("cL").onclick = () => a1*b1 >= a2+b2 ? onOk() : onFail();
      document.getElementById("cR").onclick = () => a2+b2 >= a1*b1 ? onOk() : onFail(); return;
    }
    if (t === "eq") {
      const x = 2 + Math.floor(Math.random()*(5*diff)), k = 2 + diff + Math.floor(Math.random()*3), b = 4 + Math.floor(Math.random()*15);
      box.innerHTML = `<h3 style="text-align:center;">Найдите X:</h3><div style="font-size:30px;font-weight:900;text-align:center;margin:12px 0;">${k}X + ${b} = ${k*x+b}</div>
        <input type="number" id="ansIn" placeholder="X =" style="width:100%;text-align:center;font-size:20px;min-height:46px;"><button type="button" id="ansBtn" class="btn" style="width:100%;margin-top:10px;min-height:48px;">Проверить</button>`;
      document.getElementById("ansBtn").onclick = () => Number(document.getElementById("ansIn").value) === x ? onOk() : onFail(); return;
    }
    let a, b, extra = 0, expr = "", ans = 0;
    if (diff <= 4) { a = 4 + diff * 2 + Math.floor(Math.random()*6); b = 3 + Math.floor(Math.random()*7); ans = a * b; expr = `${a} × ${b}`; }
    else if (diff <= 10) { a = 11 + Math.floor(Math.random()*(6 + diff)); b = 11 + Math.floor(Math.random()*(5 + diff)); ans = a * b; expr = `${a} × ${b}`; }
    else if (diff <= 15) { a = 14 + Math.floor(Math.random()*(10 + diff)); b = 12 + Math.floor(Math.random()*(8 + diff)); ans = a * b; expr = `${a} × ${b}`; }
    else { a = 18 + Math.floor(Math.random()*22); b = 15 + Math.floor(Math.random()*20); extra = 10 + Math.floor(Math.random()*40); ans = a * b + extra; expr = `${a} × ${b} + ${extra}`; }
    box.innerHTML = `<h3 style="text-align:center;">Решите пример (Сложность ${diff}/20):</h3><div style="font-size:34px;font-weight:900;text-align:center;margin:12px 0;">${expr} = ?</div>
      <input type="number" id="ansIn" placeholder="Ответ" style="width:100%;text-align:center;font-size:20px;min-height:46px;"><button type="button" id="ansBtn" class="btn" style="width:100%;margin-top:10px;min-height:48px;">Проверить</button>`;
    document.getElementById("ansBtn").onclick = () => Number(document.getElementById("ansIn").value) === ans ? onOk() : onFail();
  }

  setInterval(() => {
    document.querySelectorAll("select").forEach(sel => {
      if (sel.dataset.patched15 || sel.closest("#saTestCfgModal") || sel.closest("#saFullLockScreen")) return;
      const txt = sel.innerHTML.toLowerCase();
      if (txt.includes("математ") || txt.includes("код") || txt.includes("7 видов") || (sel.previousElementSibling && sel.previousElementSibling.innerText.includes("Задание"))) {
        sel.dataset.patched15 = "1";
        sel.innerHTML = `<option value="none">0. Без заданий</option><option value="custom_seq">🧩 Своя точная очередь</option><option value="random_pool">🎲 Случайные (без повторов)</option><option value="marathon">🔥 Все 15 заданий подряд</option>` + TASKS_15.map(x => `<option value="${x.at(0)}">${x.at(1)}</option>`).join("");

        const qBox = document.createElement("div");
        qBox.style.cssText = "display:none;margin-top:8px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
        let cQ = JSON.parse(localStorage.getItem("sa_custom_q") || "[]");
        qBox.innerHTML = `<div style="font-size:12px;color:#8b92a5;margin-bottom:6px;">Нажмите задания по порядку:</div>
          <div class="q-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:8px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;gap:6px;">
            <span style="word-break:break-word;">Очередь: <b class="q-out" style="color:#10b981;">пусто</b></span>
            <div style="display:flex;gap:4px;"><button type="button" class="btn btn-sec btn-sm q-bk" style="min-height:30px;padding:2px 8px;">⌫</button><button type="button" class="btn btn-sec btn-sm q-cl" style="min-height:30px;padding:2px 8px;">Сброс</button></div></div>`;
        const updQ = () => {
          localStorage.setItem("sa_custom_q", JSON.stringify(cQ));
          qBox.querySelector(".q-out").innerText = cQ.length ? cQ.map(id => (TASKS_15.find(x => x.at(0) === id) || Array.of(id,id)).at(1)).join(" → ") : "пусто";
        };
        updQ();
        TASKS_15.forEach(x => {
          const b = document.createElement("button"); b.type = "button"; b.className = "btn btn-sec btn-sm";
          b.style.cssText = "min-height:34px;font-size:11px;text-align:left;padding:4px 6px;"; b.innerText = x.at(1);
          b.onclick = () => { cQ.push(x.at(0)); updQ(); };
          qBox.querySelector(".q-grid").appendChild(b);
        });
        qBox.querySelector(".q-bk").onclick = () => { cQ.pop(); updQ(); };
        qBox.querySelector(".q-cl").onclick = () => { cQ = Array.of(); updQ(); };
        sel.after(qBox);
        const toggleQ = () => { qBox.style.display = sel.value === "custom_seq" ? "block" : "none"; };
        sel.addEventListener("change", toggleQ); toggleQ();
      }
    });
  }, 300);
  setInterval(() => {
    document.querySelectorAll('.modal input[type="file"]').forEach(fileIn => {
      const wrap = fileIn.parentElement;
      if (!wrap || wrap.dataset.melReady) return;
      wrap.dataset.melReady = "1";
      const list120 = window.SoundPack ? window.SoundPack.list.map(m => `<option value="${m.id}">🎵 ${m.name}</option>`).join("") : "";
      const curV = localStorage.getItem("sa_vol") || "60";
      const box = document.createElement("div");
      box.style.cssText = "margin-bottom:12px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
      box.innerHTML = `
        <label style="display:block;margin-bottom:6px;font-size:12px;color:#8b92a5;">Мелодия (120 звуков, без сирены)</label>
        <select class="sa-mel-sel" style="width:100%;margin-bottom:8px;"><option value="random">🎲 Случайная (без повторов)</option>${list120}</select>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <button type="button" class="btn btn-sec btn-sm m-rnd" style="flex:1;min-height:38px;">🎲 Рандом</button>
          <button type="button" class="btn btn-sec btn-sm m-prv" style="flex:1;min-height:38px;">▶️ Слушать</button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
          <span>🔊 <b class="m-vl">${curV}%</b></span><input type="range" class="m-vr" min="10" max="100" value="${curV}" style="flex:1;min-height:28px;">
        </div>`;
      wrap.before(box);
      const sel = box.querySelector(".sa-mel-sel"); sel.value = localStorage.getItem("sa_last_sound") || "random";
      sel.onchange = () => localStorage.setItem("sa_last_sound", sel.value);
      box.querySelector(".m-rnd").onclick = () => { sel.value = "random"; localStorage.setItem("sa_last_sound", "random"); };
      let pl = false;
      box.querySelector(".m-prv").onclick = e => {
        pl = !pl;
        if (pl) { if(window.SoundPack) window.SoundPack.play(sel.value, Number(localStorage.getItem("sa_vol")||60), window.db||null, true); e.target.innerText = "⏹ Стоп"; }
        else { if(window.SoundPack) window.SoundPack.stop(); e.target.innerText = "▶️ Слушать"; }
      };
      box.querySelector(".m-vr").oninput = e => { localStorage.setItem("sa_vol", e.target.value); box.querySelector(".m-vl").innerText = e.target.value + "%"; };
    });
  }, 300);

  window.launchLockedAlarmScreen = function(title, snd, tType, cnt, diff) {
    const vol = Number(localStorage.getItem("sa_vol") || 60);
    diff = Math.max(1, Math.min(20, Number(diff) || 5));
    const hasTasks = (tType !== "none" && cnt > 0);
    let queue = [];
    if (!hasTasks) queue = Array.of("none");
    else if (tType === "marathon") queue = Array.from(ALL_15_IDS);
    else if (tType === "custom_seq") {
      const saved = JSON.parse(localStorage.getItem("sa_custom_q") || "[]");
      queue = saved.length > 0 ? saved : Array.from(ALL_15_IDS).slice(0, cnt);
    } else if (tType === "random_pool") {
      let deck = Array.from(ALL_15_IDS).sort(() => Math.random() - 0.5);
      while (queue.length < cnt) {
        if (deck.length === 0) deck = Array.from(ALL_15_IDS).sort(() => Math.random() - 0.5);
        queue.push(deck.pop());
      }
    } else queue = Array.from({length: cnt}, () => tType);

    if (window.SoundPack) window.SoundPack.play(snd, vol, window.db || null, false);
    if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(true, vol, hasTasks);

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
      <div style="text-align:center;font-size:12px;color:#8b92a5;margin-top:10px;">${hasTasks ? "🔒 Экран заблокирован до решения всех заданий" : "🔓 Обычный звонок"}</div>`;
    document.body.appendChild(ov);

    const sSel = document.getElementById("saLockSndSel");
    if (window.SoundPack && window.SoundPack.getCurrentId) sSel.value = window.SoundPack.getCurrentId();
    sSel.onchange = () => window.SoundPack && window.SoundPack.play(sSel.value, Number(localStorage.getItem("sa_vol")||60), window.db||null, false);
    document.getElementById("saLockNextSnd").onclick = () => { if (window.SoundPack) { window.SoundPack.play("random", Number(localStorage.getItem("sa_vol")||60), window.db||null, false); if(window.SoundPack.getCurrentId) sSel.value = window.SoundPack.getCurrentId(); } };

    let step = 0; const tBox = document.getElementById("saLockTaskBox"), prog = document.getElementById("saLockProg");
    const finishAll = () => { if (window.SoundPack) window.SoundPack.stop(); if (window.AndroidLock && window.AndroidLock.setRinging) window.AndroidLock.setRinging(false, vol, false); ov.remove(); };
    const showStep = () => {
      if (step >= queue.length) { finishAll(); return; }
      prog.innerText = hasTasks ? `Задание ${step + 1} из ${queue.length}` : "Режим без заданий";
      drawTask(queue[step], diff, tBox, () => { step++; showStep(); }, () => { tBox.style.borderColor = "#ff2a4b"; setTimeout(() => tBox.style.borderColor = "#2a2e3d", 350); });
    };
    showStep();
  };
  window.openTestConfigModal = function() {
    let m = document.getElementById("saTestCfgModal"); if (m) m.remove();
    m = document.createElement("div"); m.id = "saTestCfgModal";
    m.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;padding:14px;z-index:20000;box-sizing:border-box;";
    const list120 = window.SoundPack ? window.SoundPack.list.map(x => `<option value="${x.id}">🎵 ${x.name}</option>`).join("") : "";
    const curV = localStorage.getItem("sa_vol") || "60";
    m.innerHTML = `
      <div style="width:100%;max-width:360px;background:#161822;border:1px solid #2a2e3d;border-radius:18px;padding:16px;box-sizing:border-box;color:#fff;max-height:90vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <b style="font-size:17px;">🧪 Настройка теста</b>
          <button type="button" id="tCfgClose" class="btn btn-sec btn-sm" style="min-height:34px;padding:0 10px;">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div><label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Кол-во заданий (0–15)</label><input type="number" id="tCfgCount" min="0" max="15" value="3" style="width:100%;min-height:42px;"></div>
          <div><label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Сложность</label>
            <select id="tCfgDiff" style="width:100%;min-height:42px;"><option value="1">Уровень 1 / 20</option><option value="2">Уровень 2 / 20</option><option value="3">Уровень 3 / 20</option><option value="4">Уровень 4 / 20</option><option value="5">Уровень 5 / 20</option><option value="6">Уровень 6 / 20</option><option value="7">Уровень 7 / 20</option><option value="8" selected>Уровень 8 / 20</option><option value="9">Уровень 9 / 20</option><option value="10">Уровень 10 / 20</option><option value="11">Уровень 11 / 20</option><option value="12">Уровень 12 / 20</option><option value="13">Уровень 13 / 20</option><option value="14">Уровень 14 / 20</option><option value="15">Уровень 15 / 20</option><option value="16">Уровень 16 / 20</option><option value="17">Уровень 17 / 20</option><option value="18">Уровень 18 / 20</option><option value="19">Уровень 19 / 20</option><option value="20">Уровень 20 / 20</option></select></div>
        </div>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Какие задания</label>
        <select id="tCfgTask" style="width:100%;margin-bottom:10px;min-height:42px;">
          <option value="random_pool">🎲 Случайные (без повторов)</option>
          <option value="marathon">🔥 Все 15 заданий подряд</option>
          <option value="custom_seq">🧩 Своя точная очередь</option>
          <option value="none">0. Без заданий</option>
          ${TASKS_15.map(x => `<option value="${x.at(0)}">${x.at(1)}</option>`).join("")}
        </select>
        <label style="display:block;font-size:12px;color:#8b92a5;margin-bottom:4px;">Музыка (120 звуков)</label>
        <select id="tCfgSound" style="width:100%;margin-bottom:8px;min-height:42px;"><option value="random">🎲 Случайная</option>${list120}</select>
        <div style="padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;margin-bottom:6px;">
            <span>🔊 Громкость: <b id="tCfgVolTxt">${curV}%</b></span><input type="range" id="tCfgVolRng" min="10" max="100" value="${curV}" style="flex:1;min-height:28px;">
          </div>
          <button type="button" id="tCfgPrv" class="btn btn-sec btn-sm" style="width:100%;min-height:36px;">▶️ Прослушать</button>
        </div>
        <button type="button" id="tCfgRun" class="btn" style="width:100%;min-height:48px;font-size:16px;">▶️ Запустить тест</button>
      </div>`;
    document.body.appendChild(m);
    document.getElementById("tCfgVolRng").oninput = e => { localStorage.setItem("sa_vol", e.target.value); document.getElementById("tCfgVolTxt").innerText = e.target.value + "%"; };
    let prv = false;
    document.getElementById("tCfgPrv").onclick = e => {
      prv = !prv;
      if (prv) { if(window.SoundPack) window.SoundPack.play(document.getElementById("tCfgSound").value, Number(localStorage.getItem("sa_vol")||60), window.db||null, true); e.target.innerText = "⏹ Стоп"; }
      else { if(window.SoundPack) window.SoundPack.stop(); e.target.innerText = "▶️ Прослушать"; }
    };
    document.getElementById("tCfgClose").onclick = () => { if(window.SoundPack) window.SoundPack.stop(); m.remove(); };
    document.getElementById("tCfgRun").onclick = () => {
      if(window.SoundPack) window.SoundPack.stop();
      const cnt = Math.min(15, Math.max(0, Number(document.getElementById("tCfgCount").value) || 0));
      const diff = Number(document.getElementById("tCfgDiff").value) || 2;
      const rawT = document.getElementById("tCfgTask").value;
      const tType = (cnt === 0 || rawT === "none") ? "none" : rawT;
      const snd = document.getElementById("tCfgSound").value;
      m.remove();
      window.launchLockedAlarmScreen("🧪 ТЕСТОВЫЙ БУДИЛЬНИК", snd, tType, rawT === "marathon" ? 15 : cnt, diff);
    };
  };

  window.testAlarm = () => window.openTestConfigModal();
  window.triggerRing = (title, snd, tType, diff, rounds) => window.launchLockedAlarmScreen(title, snd, tType, tType === "marathon" ? 15 : rounds, diff);
  window.onNativeWake = (d) => { d = d || {}; window.launchLockedAlarmScreen(d.title || "⏰ БУДИЛЬНИК", d.sound || "random", d.task || "math", d.task === "none" ? 0 : (d.task === "marathon" ? 15 : (Number(d.rounds) || 1)), d.diff || 2); };

  document.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b && b.innerText && b.innerText.trim().toLowerCase().includes("тест") && !b.closest("#saTestCfgModal") && !b.closest("#saFullLockScreen")) {
      e.preventDefault(); e.stopImmediatePropagation(); window.openTestConfigModal();
    }
  }, true);
})();
(function ensureAll15InOriginalAlarm() {
  const list15 = Array.of(
    Array.of("math","1. Математика"), Array.of("code","2. Код тревоги"), Array.of("tiles","3. Плитки памяти"),
    Array.of("memory","4. Найди пары"), Array.of("targets","5. Раздави мишени"), Array.of("logic","6. Логическая загадка"),
    Array.of("odd","7. Найди лишнее"), Array.of("sort","8. Сортировка чисел"), Array.of("stroop","9. Тест Струпа (цвета)"),
    Array.of("seq","10. Продолжи ряд"), Array.of("reverse","11. Слово наоборот"), Array.of("emoji","12. Поиск эмодзи"),
    Array.of("count","13. Быстрый счёт"), Array.of("compare","14. Что больше?"), Array.of("eq","15. Уравнение X")
  );

  setInterval(() => {
    document.querySelectorAll(".modal select").forEach(sel => {
      if (sel.dataset.patched15 || sel.classList.contains("sa-mel-sel")) return;
      const html = sel.innerHTML.toLowerCase();
      if (html.includes("math") || html.includes("математ") || html.includes("code") || html.includes("tiles")) {
        sel.dataset.patched15 = "1";
        sel.innerHTML = `<option value="none">0. Без заданий</option><option value="custom_seq">🧩 Своя точная очередь</option><option value="random_pool">🎲 Случайные (без повторов)</option><option value="marathon">🔥 Все 15 заданий подряд</option>` + list15.map(x => `<option value="${x.at(0)}">${x.at(1)}</option>`).join("");

        const qBox = document.createElement("div");
        qBox.style.cssText = "display:none;margin-top:8px;padding:10px;border-radius:12px;background:#1f222e;border:1px solid #2a2e3d;";
        let cQ = JSON.parse(localStorage.getItem("sa_custom_q") || "[]");
        qBox.innerHTML = `<div style="font-size:12px;color:#8b92a5;margin-bottom:6px;">Нажмите задания по порядку:</div>
          <div class="q-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:8px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;gap:6px;">
            <span style="word-break:break-word;">Очередь: <b class="q-out" style="color:#10b981;">пусто</b></span>
            <div style="display:flex;gap:4px;"><button type="button" class="btn btn-sec btn-sm q-bk" style="min-height:30px;padding:2px 8px;">⌫</button><button type="button" class="btn btn-sec btn-sm q-cl" style="min-height:30px;padding:2px 8px;">Сброс</button></div></div>`;
        const updQ = () => {
          localStorage.setItem("sa_custom_q", JSON.stringify(cQ));
          qBox.querySelector(".q-out").innerText = cQ.length ? cQ.map(id => (list15.find(x => x.at(0) === id) || Array.of(id,id)).at(1)).join(" → ") : "пусто";
        };
        updQ();
        list15.forEach(x => {
          const b = document.createElement("button"); b.type = "button"; b.className = "btn btn-sec btn-sm";
          b.style.cssText = "min-height:34px;font-size:11px;text-align:left;padding:4px 6px;"; b.innerText = x.at(1);
          b.onclick = () => { cQ.push(x.at(0)); updQ(); };
          qBox.querySelector(".q-grid").appendChild(b);
        });
        qBox.querySelector(".q-bk").onclick = () => { cQ.pop(); updQ(); };
        qBox.querySelector(".q-cl").onclick = () => { cQ = Array.of(); updQ(); };
        sel.after(qBox);
        const toggleQ = () => { qBox.style.display = sel.value === "custom_seq" ? "block" : "none"; };
        sel.addEventListener("change", toggleQ); toggleQ();
      }
    });
  }, 250);
})();
(function scale1to20InAlarms() {
  const opts20 = Array.from({length: 20}, (_, i) => `<option value="${i+1}" ${i+1===8?'selected':''}>Уровень ${i+1} из 20</option>`).join("");
  setInterval(() => {
    document.querySelectorAll(".modal select").forEach(sel => {
      if (sel.dataset.scale20 || sel.id === "tCfgDiff" || sel.classList.contains("sa-mel-sel")) return;
      const txt = sel.innerHTML.toLowerCase();
      if (txt.includes("лёгк") || txt.includes("легк") || txt.includes("средн") || txt.includes("сложн")) {
        sel.dataset.scale20 = "1";
        sel.innerHTML = opts20;
      }
    });
  }, 300);
})();