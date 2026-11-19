window.Logic25Pack = (function() {
  const TASKS = Array.of(
    { id: 1, type: "choice", q: "У отца Мэри есть 5 дочерей: Чача, Чече, Чичи, Чочо. Как зовут пятую дочь?", opts: Array.of("Чучу", "Мэри", "Чачи", "Маша"), ans: "Мэри" },
    { id: 2, type: "input",  q: "Шифр А=1, Б=2, В=3, Г=4, Д=5, Е=6. Расшифруй слово: 2-6-4 (напиши словом)", ans: "бег" },
    { id: 3, type: "input",  q: "Продолжи числовой ряд: 2, 6, 12, 20, 30, ?", ans: "42" },
    { id: 4, type: "choice", q: "Ты участвуешь в марафоне и обогнал бегуна, который бежал вторым. Каким ты стал?", opts: Array.of("Первым", "Вторым", "Третьим", "Четвёртым"), ans: "Вторым" },
    { id: 5, type: "input",  q: "Сколько месяцев в году имеют 28 дней?", ans: "12" },
    { id: 6, type: "input",  q: "Шифр сдвига +1 по алфавиту (А->Б, Б->В...): расшифруй слово «ТУП» (напиши исходное слово)", ans: "сон" },
    { id: 7, type: "choice", q: "Что становится более влажным, чем больше оно сушит?", opts: Array.of("Солнце", "Полотенце", "Ветер", "Песок"), ans: "Полотенце" },
    { id: 8, type: "input",  q: "У фермера было 17 овец. Все, кроме 9, разбежались. Сколько овец осталось?", ans: "9" },
    { id: 9, type: "input",  q: "Найди лишнее число в ряду: 4, 9, 16, 25, 35, 49", ans: "35" },
    { id: 10, type: "choice", q: "Кирпич весит 1 кг и ещё полкирпича. Сколько весит целый кирпич?", opts: Array.of("1.5 кг", "2 кг", "2.5 кг", "3 кг"), ans: "2 кг" },
    { id: 11, type: "input",  q: "Прочитай слово задом наперёд и напиши его правильно: «КОНОРОВАЖ»", ans: "жаворонок" },
    { id: 12, type: "input",  q: "В комнате горели 7 свечей. 2 из них погасили. Сколько свечей останется к утру (остальные сгорят)?", ans: "2" },
    { id: 13, type: "choice", q: "Что принадлежит только тебе, но другие люди используют это намного чаще, чем ты?", opts: Array.of("Телефон", "Твоё имя", "Пароль", "Ключи"), ans: "Твоё имя" },
    { id: 14, type: "input",  q: "Продолжи последовательность: 1, 1, 2, 3, 5, 8, 13, ?", ans: "21" },
    { id: 15, type: "input",  q: "Улитка ползёт по столбу высотой 10 м. За день поднимается на 3 м, за ночь спускается на 2 м. На какой день она достигнет вершины?", ans: "8" },
    { id: 16, type: "choice", q: "Какое слово всегда пишется неправильно?", opts: Array.of("Синхрофазотрон", "Неправильно", "Ошибко", "Парадокс"), ans: "Неправильно" },
    { id: 17, type: "input",  q: "Шифр: первая буква каждого слова — «Утренний Луч Озарил Город». Напиши получившееся слово:", ans: "улог" },
    { id: 18, type: "input",  q: "На столе лежат 3 яблока, ты взял 2. Сколько яблок у тебя?", ans: "2" },
    { id: 19, type: "choice", q: "В одноэтажном красном доме всё красное: стены, диван, ковёр. Какого цвета там лестница на второй этаж?", opts: Array.of("Красная", "Белая", "Лестницы нет", "Чёрная"), ans: "Лестницы нет" },
    { id: 20, type: "input",  q: "Продолжи ряд: 100, 95, 85, 70, 50, ?", ans: "25" },
    { id: 21, type: "choice", q: "Что можно увидеть с закрытыми глазами?", opts: Array.of("Темноту", "Сон", "Звёзды", "Ничего"), ans: "Сон" },
    { id: 22, type: "input",  q: "Сколько раз встречается цифра 9 в числах от 1 до 100?", ans: "20" },
    { id: 23, type: "input",  q: "Тройка лошадей пробежала 30 км. Сколько километров пробежала каждая лошадь?", ans: "30" },
    { id: 24, type: "choice", q: "Перед вами 3 двери: за 1-й — огонь, за 2-й — ядовитый газ, за 3-й — львы, которые не ели 3 года. Какая дверь безопасна?", opts: Array.of("Первая", "Вторая", "Третья", "Никакая"), ans: "Третья" },
    { id: 25, type: "input",  q: "Задумай число: умножь 6 на 7, вычти 12 и раздели на 5. Что получится?", ans: "6" }
  );

  function getNextTask() {
    let used = [];
    try { used = JSON.parse(localStorage.getItem("sa_logic25_used") || "[]"); } catch (e) {}
    let available = TASKS.filter(t => !used.includes(t.id));
    if (available.length === 0) {
      used = [];
      available = Array.from(TASKS);
    }
    const chosen = available.at(Math.floor(Math.random() * available.length));
    used.push(chosen.id);
    localStorage.setItem("sa_logic25_used", JSON.stringify(used));
    return chosen;
  }

  function render(box, onSolved, onWrong) {
    const task = getNextTask();
    let html = `<div style="font-size:12px;color:#10b981;font-weight:700;margin-bottom:6px;text-align:center;">🧠 Логическая задача #${task.id} из 25</div>
      <div style="font-size:17px;font-weight:700;line-height:1.35;text-align:center;margin-bottom:14px;">${task.q}</div>`;

    if (task.type === "choice") {
      html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${task.opts.map(o => `<button type="button" class="btn btn-sec l25-opt" data-v="${o}" style="min-height:48px;font-size:14px;padding:6px;">${o}</button>`).join("")}
      </div>`;
      box.innerHTML = html;
      box.querySelectorAll(".l25-opt").forEach(btn => {
        btn.onclick = () => {
          if (btn.dataset.v.trim().toLowerCase() === task.ans.trim().toLowerCase()) onSolved();
          else {
            btn.style.background = "#7f1d1d";
            if (onWrong) onWrong();
          }
        };
      });
    } else {
      html += `<input type="text" id="l25Input" placeholder="Введите ответ..." style="width:100%;text-align:center;font-size:18px;min-height:46px;margin-bottom:10px;">
        <button type="button" id="l25Submit" class="btn" style="width:100%;min-height:48px;font-size:16px;">Проверить ответ</button>`;
      box.innerHTML = html;
      const check = () => {
        const val = (document.getElementById("l25Input")?.value || "").trim().toLowerCase().replace(/ё/g, "е");
        const exp = task.ans.trim().toLowerCase().replace(/ё/g, "е");
        if (val === exp) onSolved();
        else if (onWrong) onWrong();
      };
      document.getElementById("l25Submit").onclick = check;
    }
  }

  return { TASKS, getNextTask, render };
})();