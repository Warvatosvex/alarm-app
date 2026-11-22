window.Logic25Pack = (function() {
  const ALPH32 = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

  const TASKS = [
    { id: 1,  title: "Арифметика в уме", kind: "math" },
    { id: 2,  title: "Код безопасности", kind: "code" },
    { id: 3,  title: "Плитки памяти", kind: "tiles" },
    { id: 4,  title: "Числовой ряд", kind: "seq" },
    { id: 5,  title: "Шифр Цезаря", kind: "caesar" },
    { id: 6,  title: "Реакция по мишеням", kind: "targets" },
    { id: 7,  title: "Уравнение с X", kind: "eq" },
    { id: 8,  title: "Тест Струпа (цвет)", kind: "stroop" },
    { id: 9,  title: "Зеркальное слово", kind: "reverse" },
    { id: 10, title: "Найди лишнее число", kind: "odd" },
    { id: 11, title: "Цифровой алфавит", kind: "alpha_num" },
    { id: 12, title: "Подсчёт символов", kind: "count" },
    { id: 13, title: "Сравнение выражений", kind: "compare" },
    { id: 14, title: "Задача на смекалку №1", kind: "logic_14" },
    { id: 15, title: "Задача на смекалку №2", kind: "logic_15" },
    { id: 16, title: "Задача на внимательность №1", kind: "logic_16" },
    { id: 17, title: "Задача на смекалку №3", kind: "logic_17" },
    { id: 18, title: "Задача на внимательность №2", kind: "logic_18" },
    { id: 19, title: "Задача на расчёт №1", kind: "logic_19" },
    { id: 20, title: "Задача на смекалку №4", kind: "logic_20" },
    { id: 21, title: "Улитка на столбе", kind: "logic_21" },
    { id: 22, title: "Подсчёт цифры 9", kind: "logic_22" },
    { id: 23, title: "Задача на внимательность №3", kind: "logic_23" },
    { id: 24, title: "Задача на расчёт №2", kind: "logic_24" },
    { id: 25, title: "Сортировка чисел", kind: "sort" }
  ];

  function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function normStr(s) {
    return String(s ?? "")
      .trim()
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/\s+/g, " ");
  }

  function buildRandomQueue(count) {
    count = Math.max(1, Math.min(25, Number(count) || 1));
    let used = [];
    try { used = JSON.parse(localStorage.getItem("sa_logic25_used") || "[]"); } catch (e) {}
    const res = [];
    for (let i = 0; i < count; i++) {
      let avail = TASKS.filter(t => !used.includes(t.id) && !res.includes(t.id));
      if (avail.length === 0) { used = []; avail = TASKS.filter(t => !res.includes(t.id)); }
      const pick = avail[Math.floor(Math.random() * avail.length)];
      res.push(pick.id);
      used.push(pick.id);
    }
    localStorage.setItem("sa_logic25_used", JSON.stringify(used));
    return res;
  }

  function renderTextInput(box, header, question, expectedAns, placeholder, onSolved, onWrong, customValidator) {
    box.innerHTML = `
      <div style="font-size:12px;color:#10b981;font-weight:700;margin-bottom:4px;text-align:center;">${header}</div>
      <div style="font-size:17px;font-weight:700;line-height:1.38;text-align:center;margin-bottom:14px;">${question}</div>
      <input type="text" id="l25Inp" placeholder="${placeholder}" autocomplete="off" style="width:100%;text-align:center;font-size:20px;font-weight:700;min-height:48px;margin-bottom:10px;border-radius:12px;">
      <button type="button" id="l25Sub" class="btn" style="width:100%;min-height:48px;font-size:16px;">Проверить ответ</button>
    `;
    const check = () => {
      const rawVal = document.getElementById("l25Inp")?.value ?? "";
      const isOk = typeof customValidator === "function"
        ? customValidator(rawVal)
        : (normStr(rawVal) === normStr(expectedAns));
      if (isOk) onSolved();
      else if (onWrong) onWrong();
    };
    document.getElementById("l25Sub").onclick = check;
  }

  function renderChoiceInput(box, header, question, options, correctAns, onSolved, onWrong) {
    box.innerHTML = `
      <div style="font-size:12px;color:#10b981;font-weight:700;margin-bottom:4px;text-align:center;">${header}</div>
      <div style="font-size:17px;font-weight:700;line-height:1.38;text-align:center;margin-bottom:14px;">${question}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${options.map(o => `<button type="button" class="btn btn-sec l25-cbtn" data-v="${o}" style="min-height:48px;font-size:14px;padding:6px;">${o}</button>`).join("")}
      </div>
    `;
    box.querySelectorAll(".l25-cbtn").forEach(btn => {
      btn.onclick = () => {
        if (normStr(btn.dataset.v) === normStr(correctAns)) onSolved();
        else { btn.style.background = "#7f1d1d"; if (onWrong) onWrong(); }
      };
    });
  }
  function renderById(taskId, box, onSolved, onWrong, diffLevel) {
    const d = Math.max(1, Math.min(10, Number(diffLevel) || 5));
    const task = TASKS.find(t => t.id === Number(taskId)) || TASKS;
    const hdr = `🧠 №${task.id}: ${task.title} • Сложность ${d}/10`;

    if (task.kind === "math") {
      let expr, ans;
      if (d === 1) { const a = rnd(3, 9), b = rnd(2, 9); expr = `${a} + ${b}`; ans = a + b; }
      else if (d <= 5) { const a = rnd(11, 15 + d * 2), b = rnd(3, 6 + d), c = rnd(4, 15 + d * 2); expr = `${a} × ${b} − ${c}`; ans = a * b - c; }
      else if (d <= 9) { const a = rnd(18, 22 + d), b = rnd(12, 18), c = rnd(110, 190); expr = `(${a} × ${b}) − ${c}`; ans = a * b - c; }
      else { const a = rnd(26, 38), b = rnd(16, 24), c = rnd(140, 240), k = rnd(25, 65); expr = `(${a} × ${b}) − ${c} + ${k}`; ans = a * b - c + k; }
      return renderTextInput(box, hdr, `Вычисли в уме: ${expr} = ?`, ans, "Введите число", onSolved, onWrong);
    }

    if (task.kind === "code") {
      const len = d === 1 ? 3 : (d <= 5 ? 3 + Math.floor(d / 2) : (d <= 9 ? d : 9));
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < len; i++) code += chars[rnd(0, chars.length - 1)];
      return renderTextInput(box, hdr, `Повтори код (регистр не важен):<br><span style="font-size:28px;letter-spacing:3px;color:#ff2a4b;">${code}</span>`, code, "Введите код", onSolved, onWrong);
    }

    if (task.kind === "tiles") {
      const grid = d === 1 ? 2 : (d <= 5 ? 3 : (d <= 9 ? 4 : 5));
      const total = grid * grid;
      const targetCnt = Math.min(total - 1, d === 1 ? 2 : (d <= 5 ? 2 + Math.floor(d / 2) : d - 1));
      const showMs = d === 1 ? 2200 : (d <= 5 ? 1600 : (d <= 9 ? 1200 : 950));
      const targets = [];
      while (targets.length < targetCnt) { const r = rnd(0, total - 1); if (!targets.includes(r)) targets.push(r); }
      const picked = [];
      box.innerHTML = `
        <div style="font-size:12px;color:#10b981;font-weight:700;margin-bottom:4px;text-align:center;">${hdr}</div>
        <div id="tlSt" style="font-size:15px;font-weight:700;text-align:center;margin-bottom:10px;">Запомни зелёные плитки (${grid}×${grid})!</div>
        <div style="display:grid;grid-template-columns:repeat(${grid},1fr);gap:6px;">
          ${Array.from({ length: total }, (_, i) => `<button type="button" class="tl-cell" data-i="${i}" style="aspect-ratio:1;min-height:38px;border-radius:8px;border:1px solid #2a2e3d;background:${targets.includes(i) ? "#10b981" : "#1f222e"};"></button>`).join("")}
        </div>`;
      let ready = false;
      setTimeout(() => {
        box.querySelectorAll(".tl-cell").forEach(c => c.style.background = "#1f222e");
        const st = document.getElementById("tlSt"); if (st) st.innerText = `Нажми все ${targetCnt} плитки!`;
        ready = true;
      }, showMs);
      box.querySelectorAll(".tl-cell").forEach(c => {
        c.onclick = () => {
          if (!ready) return;
          const idx = Number(c.dataset.i);
          if (targets.includes(idx)) {
            if (!picked.includes(idx)) picked.push(idx);
            c.style.background = "#10b981";
            if (picked.length === targets.length) onSolved();
          } else { c.style.background = "#ef4444"; if (onWrong) onWrong(); }
        };
      });
      return;
    }

    if (task.kind === "seq") {
      if (d === 1) { const s = rnd(2, 10); return renderTextInput(box, hdr, `Продолжи ряд: ${s}, ${s+2}, ${s+4}, ${s+6}, ?`, s + 8, "Следующее число", onSolved, onWrong); }
      if (d <= 5) { const s = rnd(3, 12), step = rnd(4, 9); return renderTextInput(box, hdr, `Продолжи ряд: ${s}, ${s+step}, ${s+step*2}, ${s+step*3}, ?`, s + step * 4, "Следующее число", onSolved, onWrong); }
      if (d <= 9) { const a = rnd(2, 6); return renderTextInput(box, hdr, `Продолжи ряд: ${a}, ${a*2+1}, ${a*4+3}, ${a*8+7}, ?`, a * 16 + 15, "Следующее число", onSolved, onWrong); }
      return renderTextInput(box, hdr, `Продолжи ряд (×2 + 1): 3, 7, 15, 31, 63, ?`, 127, "Следующее число", onSolved, onWrong);
    }

    if (task.kind === "caesar") {
      const words = d <= 3 ? ["КОТ", "ДОМ", "СОН", "МИР", "ЛУЧ"] : (d <= 7 ? ["УТРО", "МОЗГ", "СВЕТ", "ЗВУК", "СТАРТ"] : ["ВНИМАНИЕ", "АЛГОРИТМ", "ПРОГРЕСС"]);
      const plain = words[rnd(0, words.length - 1)];
      const shift = d <= 3 ? 1 : (d <= 7 ? 2 : 3);
      const cipher = plain.split("").map(ch => ALPH32[(ALPH32.indexOf(ch) + shift) % ALPH32.length]).join("");
      const q = `Шифр Цезаря: сдвинь каждую букву слова <b>«${cipher}»</b> на <b>${shift}</b> шаг(а) <b>НАЗАД</b> по алфавиту:<br><span style="font-size:11px;color:#94a3b8;letter-spacing:1px;">${ALPH32}</span>`;
      return renderTextInput(box, hdr, q, plain, "Исходное слово", onSolved, onWrong);
    }

    if (task.kind === "targets") {
      let left = 3 + d;
      box.innerHTML = `
        <div style="font-size:12px;color:#10b981;font-weight:700;margin-bottom:4px;text-align:center;">${hdr}</div>
        <div style="font-size:16px;font-weight:700;text-align:center;margin-bottom:10px;">Порази все мишени: <b id="tgCnt">${left}</b></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
          ${Array.from({ length: left }, () => `<button type="button" class="btn btn-sec tg-hit" style="font-size:24px;min-height:50px;">🎯</button>`).join("")}
        </div>`;
      box.querySelectorAll(".tg-hit").forEach(b => {
        b.onclick = () => {
          if (b.disabled) return;
          b.disabled = true; b.innerText = "✅"; b.style.opacity = "0.35";
          left--; const el = document.getElementById("tgCnt"); if (el) el.innerText = left;
          if (left <= 0) onSolved();
        };
      });
      return;
    }

    if (task.kind === "eq") {
      const x = rnd(2, 4 + d * 2), k = d === 1 ? 1 : rnd(2, 2 + Math.floor(d / 2)), b = rnd(3, 10 + d * 5);
      const expr = k === 1 ? `X + ${b} = ${x + b}` : `${k}X + ${b} = ${k * x + b}`;
      return renderTextInput(box, hdr, `Найди X: ${expr}`, x, "X =", onSolved, onWrong);
    }

    if (task.kind === "stroop") {
      const cs = [{ n: "КРАСНЫЙ", c: "#ef4444" }, { n: "СИНИЙ", c: "#3b82f6" }, { n: "ЗЕЛЁНЫЙ", c: "#10b981" }, { n: "ЖЁЛТЫЙ", c: "#f59e0b" }];
      const w = cs[rnd(0, 3)], ink = cs[(cs.indexOf(w) + (d === 1 ? 0 : rnd(1, 3))) % 4];
      box.innerHTML = `
        <div style="font-size:12px;color:#10b981;font-weight:700;margin-bottom:4px;text-align:center;">${hdr}</div>
        <div style="font-size:15px;font-weight:700;text-align:center;">Нажми кнопку с ЦВЕТОМ букв:</div>
        <div style="font-size:32px;font-weight:900;text-align:center;margin:12px 0;color:${ink.c};">${w.n}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          ${cs.map(x => `<button type="button" class="btn btn-sec st-btn" data-c="${x.c}" style="min-height:48px;">${x.n}</button>`).join("")}
        </div>`;
      box.querySelectorAll(".st-btn").forEach(b => b.onclick = () => b.dataset.c === ink.c ? onSolved() : (onWrong && onWrong()));
      return;
    }

    if (task.kind === "reverse") {
      const pool = d <= 3 ? ["ЛУНА", "РЕКА", "СНЕГ", "НЕБО"] : (d <= 7 ? ["РАССВЕТ", "БУДИЛЬНИК", "ЗАРЯДКА"] : ["ЭЛЕКТРОСТАНЦИЯ", "СИНХРОНИЗАЦИЯ"]);
      const w = pool[rnd(0, pool.length - 1)];
      return renderTextInput(box, hdr, `Прочитай слово задом наперёд:<br><b>«${w.split("").reverse().join("")}»</b>`, w, "Правильное слово", onSolved, onWrong);
    }

    if (task.kind === "odd") {
      if (d <= 4) return renderChoiceInput(box, hdr, "Какое число лишнее (нечётное)?", ["2", "4", "7", "8"], "7", onSolved, onWrong);
      if (d <= 8) return renderChoiceInput(box, hdr, "Какое число не является точным квадратом?", ["16", "25", "35", "49"], "35", onSolved, onWrong);
      return renderChoiceInput(box, hdr, "Какое число не является простым?", ["29", "37", "51", "53"], "51", onSolved, onWrong);
    }
    if (task.kind === "alpha_num") {
      const words = d <= 4 ? ["БАГ", "ВЕК", "ДАР"] : (d <= 8 ? ["ЗВУК", "МОЗГ", "СВЕТ"] : ["ЗАВТРАК", "ПОДЪЕМ"]);
      const w = words[rnd(0, words.length - 1)];
      const code = w.split("").map(ch => ALPH32.indexOf(ch) + 1).join("-");
      return renderTextInput(box, hdr, `А=1, Б=2, В=3, Г=4, Д=5, Е=6...<br>Расшифруй: <b>${code}</b>`, w, "Слово", onSolved, onWrong);
    }

    if (task.kind === "count") {
      const len = 10 + d * 3;
      let str = "", cnt = 0;
      for (let i = 0; i < len; i++) { const isStar = Math.random() < 0.42; if (isStar) cnt++; str += isStar ? "★" : "☆"; }
      return renderTextInput(box, hdr, `Сколько закрашенных звёзд (★)?<br><span style="font-size:20px;word-break:break-all;">${str}</span>`, cnt, "Количество ★", onSolved, onWrong);
    }

    if (task.kind === "compare") {
      const a1 = rnd(10, 15 + d * 8), b1 = rnd(5, 10 + d * 4);
      const a2 = rnd(10, 15 + d * 8), b2 = rnd(5, 10 + d * 4);
      const v1 = a1 + b1, v2 = a2 + b2 + (v1 === a2 + b2 ? 3 : 0);
      const ans = v1 > v2 ? `${a1} + ${b1}` : `${a2} + ${b2}`;
      return renderChoiceInput(box, hdr, "Какое выражение больше?", [`${a1} + ${b1}`, `${a2} + ${b2}`], ans, onSolved, onWrong);
    }

    if (task.kind === "sort") {
      const n = d <= 3 ? 3 : (d <= 7 ? 4 : 5);
      const nums = Array.from({ length: n }, () => rnd(10, 10 + d * 15));
      const sortedArr = [...nums].sort((a, b) => a - b);
      return renderTextInput(box, hdr, `Запиши числа по возрастанию:<br><b>${nums.join(", ")}</b>`, sortedArr.join(" "), "Например: 12 25 40", onSolved, onWrong, raw => {
        const userNums = String(raw ?? "").trim().split(/[\s,;]+/).filter(Boolean).map(Number);
        return userNums.length === sortedArr.length && userNums.every((v, i) => v === sortedArr[i]);
      });
    }

    if (task.kind === "logic_21") {
      const h = d <= 3 ? 6 : (d <= 7 ? 10 : 15);
      const up = 3, dn = 2;
      const ansDay = Math.ceil((h - up) / (up - dn)) + 1;
      return renderTextInput(box, hdr, `Улитка ползёт по столбу высотой <b>${h} м</b>. За день +${up} м, за ночь −${dn} м. На какой день она достигнет вершины?`, ansDay, "Номер дня", onSolved, onWrong);
    }

    if (task.kind === "logic_22") {
      const maxN = d <= 2 ? 10 : (d <= 5 ? 20 : (d <= 8 ? 50 : 100));
      let count9 = 0;
      for (let i = 1; i <= maxN; i++) {
        for (const ch of String(i)) if (ch === "9") count9++;
      }
      return renderTextInput(box, hdr, `Сколько раз встречается цифра <b>9</b> в числах от <b>1 до ${maxN}</b> включительно?`, count9, "Количество", onSolved, onWrong);
    }

    const bank = {
      logic_14: ["У отца Мэри 5 дочерей: Чача, Чече, Чичи, Чочо. Как зовут пятую?", ["Чучу", "Мэри", "Чачи", "Маша"], "Мэри"],
      logic_15: ["Ты обогнал бегуна, который бежал вторым. Каким ты стал?", ["Первым", "Вторым", "Третьим", "Четвёртым"], "Вторым"],
      logic_16: ["Сколько месяцев в году имеют 28 дней?", ["1", "6", "11", "12"], "12"],
      logic_17: ["Что становится более влажным, чем больше оно сушит?", ["Солнце", "Полотенце", "Ветер", "Песок"], "Полотенце"],
      logic_18: ["У фермера было 17 овец. Все, кроме 9, разбежались. Сколько осталось?", ["8", "9", "17", "0"], "9"],
      logic_19: ["Кирпич весит 1 кг и ещё полкирпича. Сколько весит целый кирпич?", ["1.5 кг", "2 кг", "2.5 кг", "3 кг"], "2 кг"],
      logic_20: ["В комнате горели 7 свечей. 2 погасили. Сколько останется к утру (остальные сгорят)?", ["2", "5", "7", "0"], "2"],
      logic_23: ["Какое слово всегда пишется неправильно?", ["Ошибка", "Неправильно", "Парадокс", "Никакое"], "Неправильно"],
      logic_24: ["3 двери: за 1-й — огонь, за 2-й — ядовитый газ, за 3-й — львы, которые не ели 3 года. Какая безопасна?", ["Первая", "Вторая", "Третья", "Никакая"], "Третья"]
    };
    const item = bank[task.kind] || bank.logic_14;
    return renderChoiceInput(box, hdr, item, item, item, onSolved, onWrong);
  }

  return { TASKS, buildRandomQueue, renderById };
})();
window.Logic15Pack = window.Logic25Pack;
    if (task.kind === "alpha_num") {
      const words = d <= 4 ? ["БАГ", "ВЕК", "ДАР"] : (d <= 8 ? ["ЗВУК", "МОЗГ", "СВЕТ"] : ["ЗАВТРАК", "ПОДЪЕМ"]);
      const w = words[rnd(0, words.length - 1)];
      const code = w.split("").map(ch => ALPH32.indexOf(ch) + 1).join("-");
      return renderTextInput(box, hdr, `А=1, Б=2, В=3, Г=4, Д=5, Е=6...<br>Расшифруй: <b>${code}</b>`, w, "Слово", onSolved, onWrong);
    }

    if (task.kind === "count") {
      const len = 10 + d * 3;
      let str = "", cnt = 0;
      for (let i = 0; i < len; i++) { const isStar = Math.random() < 0.42; if (isStar) cnt++; str += isStar ? "★" : "☆"; }
      return renderTextInput(box, hdr, `Сколько закрашенных звёзд (★)?<br><span style="font-size:20px;word-break:break-all;">${str}</span>`, cnt, "Количество ★", onSolved, onWrong);
    }

    if (task.kind === "compare") {
      const a1 = rnd(10, 15 + d * 8), b1 = rnd(5, 10 + d * 4);
      const a2 = rnd(10, 15 + d * 8), b2 = rnd(5, 10 + d * 4);
      const v1 = a1 + b1, v2 = a2 + b2 + (v1 === a2 + b2 ? 3 : 0);
      const ans = v1 > v2 ? `${a1} + ${b1}` : `${a2} + ${b2}`;
      return renderChoiceInput(box, hdr, "Какое выражение больше?", [`${a1} + ${b1}`, `${a2} + ${b2}`], ans, onSolved, onWrong);
    }

    if (task.kind === "sort") {
      const n = d <= 3 ? 3 : (d <= 7 ? 4 : 5);
      const nums = Array.from({ length: n }, () => rnd(10, 10 + d * 15));
      const sortedArr = [...nums].sort((a, b) => a - b);
      return renderTextInput(box, hdr, `Запиши числа по возрастанию:<br><b>${nums.join(", ")}</b>`, sortedArr.join(" "), "Например: 12 25 40", onSolved, onWrong, raw => {
        const userNums = String(raw ?? "").trim().split(/[\s,;]+/).filter(Boolean).map(Number);
        return userNums.length === sortedArr.length && userNums.every((v, i) => v === sortedArr[i]);
      });
    }

    if (task.kind === "logic_21") {
      const h = d <= 3 ? 6 : (d <= 7 ? 10 : 15);
      const up = 3, dn = 2;
      const ansDay = Math.ceil((h - up) / (up - dn)) + 1;
      return renderTextInput(box, hdr, `Улитка ползёт по столбу высотой <b>${h} м</b>. За день +${up} м, за ночь −${dn} м. На какой день она достигнет вершины?`, ansDay, "Номер дня", onSolved, onWrong);
    }

    if (task.kind === "logic_22") {
      const maxN = d <= 2 ? 10 : (d <= 5 ? 20 : (d <= 8 ? 50 : 100));
      let count9 = 0;
      for (let i = 1; i <= maxN; i++) {
        for (const ch of String(i)) if (ch === "9") count9++;
      }
      return renderTextInput(box, hdr, `Сколько раз встречается цифра <b>9</b> в числах от <b>1 до ${maxN}</b> включительно?`, count9, "Количество", onSolved, onWrong);
    }

    const bank = {
      logic_14: ["У отца Мэри 5 дочерей: Чача, Чече, Чичи, Чочо. Как зовут пятую?", ["Чучу", "Мэри", "Чачи", "Маша"], "Мэри"],
      logic_15: ["Ты обогнал бегуна, который бежал вторым. Каким ты стал?", ["Первым", "Вторым", "Третьим", "Четвёртым"], "Вторым"],
      logic_16: ["Сколько месяцев в году имеют 28 дней?", ["1", "6", "11", "12"], "12"],
      logic_17: ["Что становится более влажным, чем больше оно сушит?", ["Солнце", "Полотенце", "Ветер", "Песок"], "Полотенце"],
      logic_18: ["У фермера было 17 овец. Все, кроме 9, разбежались. Сколько осталось?", ["8", "9", "17", "0"], "9"],
      logic_19: ["Кирпич весит 1 кг и ещё полкирпича. Сколько весит целый кирпич?", ["1.5 кг", "2 кг", "2.5 кг", "3 кг"], "2 кг"],
      logic_20: ["В комнате горели 7 свечей. 2 погасили. Сколько останется к утру (остальные сгорят)?", ["2", "5", "7", "0"], "2"],
      logic_23: ["Какое слово всегда пишется неправильно?", ["Ошибка", "Неправильно", "Парадокс", "Никакое"], "Неправильно"],
      logic_24: ["3 двери: за 1-й — огонь, за 2-й — ядовитый газ, за 3-й — львы, которые не ели 3 года. Какая безопасна?", ["Первая", "Вторая", "Третья", "Никакая"], "Третья"]
    };
    const item = bank[task.kind] || bank.logic_14;
    return renderChoiceInput(box, hdr, item, item, item, onSolved, onWrong);
  }

  return { TASKS, buildRandomQueue, renderById };
})();
window.Logic15Pack = window.Logic25Pack;