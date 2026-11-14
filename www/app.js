import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

(function () {
    'use strict';

    let state = {
        alarms: JSON.parse(localStorage.getItem('alarms_v4') || '[]'),
        editingId: null,
        isRinging: false,
        activeAlarm: null
    };

    let taskState = {
        step: 0,
        total: 0,
        difficulty: 3,
        currentAnswer: null,
        memorySequence: [],
        memoryUserIdx: 0,
        memoryPlaying: false
    };

    let audioCtx = null;
    let sirenTimer = null, sirenOsc = [], sirenGain = null;
    let wakeLock = null;

    const dom = {
        topClock: document.getElementById('top-clock'),
        banner: document.getElementById('next-alarm-banner'),
        alarmList: document.getElementById('alarm-list'),
        fab: document.getElementById('fab-add'),
        modal: document.getElementById('alarm-modal'),
        mTime: document.getElementById('edit-time'),
        mLabel: document.getElementById('edit-label'),
        mDiff: document.getElementById('edit-difficulty'),
        mRounds: document.getElementById('edit-rounds'),
        mDiffLabel: document.getElementById('val-diff-label'),
        mRoundsLabel: document.getElementById('val-rounds'),
        btnSave: document.getElementById('btn-save'),
        btnDelete: document.getElementById('btn-delete'),
        btnClose: document.getElementById('modal-close'),
        ringOverlay: document.getElementById('ringing-overlay'),
        ringClock: document.getElementById('ring-clock'),
        ringLabel: document.getElementById('ring-label'),
        ringInfo: document.getElementById('ring-task-info'),
        ringProgress: document.getElementById('ring-progress-bar'),
        ringFeedback: document.getElementById('ring-feedback'),
        taskBody: document.getElementById('task-body')
    };

    const diffNames = ["", "Лёгкий", "Обычный", "Средний", "Сложный", "Хардкор"];

    async function init() {
        if (Capacitor.isNativePlatform()) {
            await LocalNotifications.requestPermissions();
            LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
                const alarmId = notificationAction.notification.extra.alarmId;
                const alarm = state.alarms.find(a => a.id === alarmId);
                if (alarm) startRinging(alarm);
            });
        }

        renderList();
        updateBanner();
        bindEvents();
        setInterval(tick, 1000);
    }

    function tick() {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        dom.topClock.textContent = timeStr;

        if (state.isRinging) {
            dom.ringClock.textContent = timeStr.substring(0, 5);
        }

        if (now.getSeconds() === 0 && !state.isRinging) {
            const current = timeStr.substring(0, 5);
            state.alarms.forEach(a => {
                if (a.enabled && a.time === current) scheduleOrTrigger(a);
            });
        }
    }

    function bindEvents() {
        dom.fab.onclick = () => openModal();
        dom.btnClose.onclick = () => closeModal();
        dom.mDiff.oninput = () => dom.mDiffLabel.textContent = diffNames[dom.mDiff.value];
        dom.mRounds.oninput = () => dom.mRoundsLabel.textContent = dom.mRounds.value;
        dom.btnSave.onclick = save;
        dom.btnDelete.onclick = del;

        document.querySelectorAll('.radio-card').forEach(c => {
            c.onclick = () => {
                c.querySelector('input').checked = true;
                updateRadioUI();
            };
        });
    }

    function updateRadioUI() {
        document.querySelectorAll('.radio-card').forEach(c => {
            c.classList.toggle('selected', c.querySelector('input').checked);
        });
    }

    function openModal(id = null) {
        state.editingId = id;
        const a = id ? state.alarms.find(x => x.id === id) : null;
        dom.mTime.value = a ? a.time : "07:30";
        dom.mLabel.value = a ? a.label : "";
        dom.mDiff.value = a ? a.difficulty : 3;
        dom.mRounds.value = a ? a.rounds : 5;
        dom.mDiffLabel.textContent = diffNames[dom.mDiff.value];
        dom.mRoundsLabel.textContent = dom.mRounds.value;
        const mode = a ? a.mode : 'math';
        document.querySelector(`input[name="edit-mode"][value="${mode}"]`).checked = true;
        updateRadioUI();
        dom.btnDelete.style.display = a ? "flex" : "none"; // Use flex for button
        dom.modal.classList.add('active');
    }

    function closeModal() { dom.modal.classList.remove('active'); }

    async function save() {
        const newAlarm = {
            id: state.editingId || Date.now().toString(),
            time: dom.mTime.value,
            label: dom.mLabel.value || "Будильник",
            difficulty: parseInt(dom.mDiff.value),
            rounds: parseInt(dom.mRounds.value),
            mode: document.querySelector('input[name="edit-mode"]:checked').value,
            enabled: true
        };

        if (state.editingId) {
            const i = state.alarms.findIndex(x => x.id === state.editingId);
            state.alarms[i] = newAlarm;
        } else {
            state.alarms.push(newAlarm);
        }

        await syncAndSchedule(newAlarm); // Schedule after save
        closeModal();
    }

    async function del() {
        if (!state.editingId) return;
        if (Capacitor.isNativePlatform()) {
            await LocalNotifications.cancel({ notifications: [{ id: parseInt(state.editingId) }] });
        }
        state.alarms = state.alarms.filter(x => x.id !== state.editingId);
        sync();
        closeModal();
    }

    async function syncAndSchedule(alarm) {
        localStorage.setItem('alarms_v4', JSON.stringify(state.alarms));
        renderList();
        updateBanner();

        if (Capacitor.isNativePlatform() && alarm.enabled) {
            await scheduleNotification(alarm);
        }
    }

    function sync() {
        localStorage.setItem('alarms_v4', JSON.stringify(state.alarms));
        renderList();
        updateBanner();
    }

    function renderList() {
        dom.alarmList.innerHTML = state.alarms.sort((a,b) => a.time.localeCompare(b.time)).map(a => `
            <div class="alarm-card ${a.enabled ? '' : 'disabled'}" onclick="window.alarmApp.edit('${a.id}')">
                <div class="alarm-card-left">
                    <div class="alarm-card-time">${a.time}</div>
                    <div class="alarm-card-label">${a.label}</div>
                    <div class="alarm-card-meta">
                        <span class="badge difficulty-${a.difficulty}">${diffNames[a.difficulty]}</span>
                        <span class="badge">${a.mode.toUpperCase()} × ${a.rounds}</span>
                    </div>
                </div>
                <label class="switch">
                    <input type="checkbox" ${a.enabled ? 'checked' : ''} onchange="window.alarmApp.toggle('${a.id}', event)">
                    <span class="slider"></span>
                </label>
            </div>
        `).join('');
    }

    function updateBanner() {
        const now = new Date();
        let min = Infinity;
        state.alarms.forEach(a => {
            if (!a.enabled) return;
            const [h, m] = a.time.split(':').map(Number);
            let t = new Date(now);
            t.setHours(h, m, 0, 0);
            if (t <= now) t.setDate(t.getDate() + 1);
            const d = t - now;
            if (d < min) min = d;
        });
        if (min === Infinity) dom.banner.innerHTML = "<span>💤 Нет активных будильников</span>";
        else {
            const h = Math.floor(min/3600000), m = Math.floor((min%3600000)/60000);
            dom.banner.innerHTML = `<span>🔔 Следующий через ${h} ч. ${m} мин.</span>`;
        }
    }

    // --- ALARM LOGIC (for native and web) ---
    async function scheduleOrTrigger(alarm) {
        if (Capacitor.isNativePlatform()) {
            await scheduleNotification(alarm);
        } else {
            startRinging(alarm);
        }
    }

    async function scheduleNotification(alarm) {
        const [h, m] = alarm.time.split(':').map(Number);
        let now = new Date();
        let fireDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);

        if (fireDate <= now) {
            fireDate.setDate(fireDate.getDate() + 1);
        }

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: alarm.label || "Будильник",
                    body: `Время: ${alarm.time}. Задание: ${diffNames[alarm.difficulty]} ${alarm.mode.toUpperCase()} (${alarm.rounds} раундов)`, // Using alarm.label here
                    id: parseInt(alarm.id), // Ensure ID is a number
                    schedule: { at: fireDate, repeats: 'every day' }, // for repeating alarms
                    sound: "res://platform_default", // Use default notification sound
                    wakeUpScreen: true,
                    foreground: true,
                    autoCancel: false,
                    extra: { alarmId: alarm.id }
                }
            ]
        });
        console.log('Scheduled notification for alarm:', alarm.id, fireDate);
    }

    async function startRinging(alarm) {
        state.isRinging = true;
        state.activeAlarm = alarm;

        dom.ringLabel.textContent = alarm.label || "Будильник";
        dom.ringingOverlay.classList.remove('hidden');

        startSound();
        taskState = { step: 0, total: alarm.rounds, difficulty: alarm.difficulty, mode: alarm.mode };
        nextTask();

        if (Capacitor.isNativePlatform()) {
            // Cancel the scheduled notification once it's acted upon
            await LocalNotifications.cancel({ notifications: [{ id: parseInt(alarm.id) }] });
            // Re-schedule for next day if repeating
            if (alarm.enabled) scheduleNotification(alarm);
        }
    }

    function startSound() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        sirenGain = audioCtx.createGain();
        sirenGain.connect(audioCtx.destination);
        sirenGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        sirenGain.gain.exponentialRampToValueAtTime(0.8, audioCtx.currentTime + 5);
        for(let i=0; i<2; i++) {
            const o = audioCtx.createOscillator();
            o.type = i===0 ? 'sawtooth' : 'square';
            o.frequency.value = i===0 ? 440 : 660;
            o.connect(sirenGain);
            o.start();
            sirenOsc.push(o);
        }
        let up = true;
        sirenTimer = setInterval(() => {
            const f1 = up ? 550 : 440, f2 = up ? 880 : 660;
            sirenOsc[0].frequency.exponentialRampToValueAtTime(f1, audioCtx.currentTime + 0.3);
            sirenOsc[1].frequency.exponentialRampToValueAtTime(f2, audioCtx.currentTime + 0.3);
            up = !up;
        }, 400);
        if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(l => wakeLock = l);
    }

    async function stopSound() {
        if (sirenTimer) clearInterval(sirenTimer);
        sirenOsc.forEach(o => { try{o.stop();}catch(e){} });
        sirenOsc = [];
        if (sirenGain) { sirenGain.gain.value = 0; sirenGain = null; }
        if (wakeLock) { await wakeLock.release(); wakeLock = null; }

        if (Capacitor.isNativePlatform() && state.activeAlarm && state.activeAlarm.enabled) {
            // Reschedule notification for next day if it's a repeating alarm
            await LocalNotifications.cancel({ notifications: [{ id: parseInt(state.activeAlarm.id) }] });
            await scheduleNotification(state.activeAlarm);
        }
    }

    function nextTask() {
        taskState.step++;
        if (taskState.step > taskState.total) {
            state.isRinging = false;
            stopSound();
            dom.ringOverlay.classList.add('hidden');
            return;
        }
        updateProgress();
        renderTask();
    }

    function updateProgress() {
        dom.ringInfo.textContent = `Уровень ${taskState.difficulty} • Задание ${taskState.step} из ${taskState.total}`;
        dom.ringProgress.style.width = `${(taskState.step-1)/taskState.total * 100}%`;
    }

    function renderTask() {
        dom.taskBody.innerHTML = "";
        dom.ringFeedback.textContent = "";
        const d = taskState.difficulty;
        if (taskState.mode === 'math') {
            const p = genMath(d);
            taskState.currentAnswer = p.ans;
            dom.taskBody.innerHTML = `
                <div style="font-size:1.8rem; text-align:center; margin-bottom:20px; font-weight:800;">${p.txt} = ?</div>
                <input type="number" id="ans-in" class="input-code" autofocus inputmode="numeric">
            `;
            const input = document.getElementById('ans-in');
            input.oninput = () => {
                if (parseInt(input.value) === taskState.currentAnswer) nextTask();
            };
        } else if (taskState.mode === 'memory') {
            const size = d <= 2 ? 3 : (d <= 4 ? 4 : 5);
            const count = 2 + d; // 3, 4, 5, 6, 7
            const seq = [];
            for(let i=0; i<count; i++) seq.push(Math.floor(Math.random() * size * size));
            taskState.memorySequence = seq;
            taskState.memoryUserIdx = 0;
            taskState.memoryPlaying = true;

            const gridClass = `grid-${size}`;
            const tileClass = size === 5 ? "tile-sm" : "";
            dom.taskBody.innerHTML = `<div class="memory-grid ${gridClass}" id="mem-grid"></div>`;
            const grid = document.getElementById('mem-grid');
            for(let i=0; i<size*size; i++) {
                const t = document.createElement('div');
                t.className = `memory-tile ${tileClass}`;
                t.dataset.idx = i;
                grid.appendChild(t);
            }

            let i = 0;
            const speed = 600 - (d * 50);
            const itv = setInterval(() => {
                if (i < seq.length) {
                    const t = grid.children[seq[i]];
                    t.classList.add('lit');
                    setTimeout(() => t.classList.remove('lit'), speed/2);
                    i++;
                } else {
                    clearInterval(itv);
                    taskState.memoryPlaying = false;
                    dom.ringFeedback.textContent = "Повторите!";
                }
            }, speed);

            grid.onclick = (e) => {
                if (taskState.memoryPlaying) return;
                const t = e.target.closest('.memory-tile');
                if (!t) return;
                const idx = parseInt(t.dataset.idx);
                t.classList.add('active'); setTimeout(() => t.classList.remove('active'), 100);
                if (idx === taskState.memorySequence[taskState.memoryUserIdx]) {
                    taskState.memoryUserIdx++;
                    if (taskState.memoryUserIdx === taskState.memorySequence.length) nextTask();
                } else {
                    dom.ringFeedback.textContent = "Ошибка!";
                    taskState.step = 0;
                    setTimeout(nextTask, 500);
                }
            };
        } else {
            const code = genCode(d);
            taskState.currentAnswer = code;
            dom.taskBody.innerHTML = `
                <div style="font-size:1.5rem; text-align:center; margin-bottom:15px; font-family:monospace; letter-spacing:4px; color:var(--accent-cyan);">${code}</div>
                <input type="text" id="code-in" class="input-code" placeholder="Введите код" autofocus style="text-transform:none;">
            `;
            const input = document.getElementById('code-in');
            input.oninput = () => {
                if (input.value === taskState.currentAnswer) nextTask();
            };
        }
    }

    function genMath(d) {
        if (d === 1) {
            const a = Math.floor(Math.random()*9)+1, b = Math.floor(Math.random()*9)+1;
            return { txt: `${a} + ${b}`, ans: a+b };
        }
        if (d === 2) {
            const a = Math.floor(Math.random()*90)+10, b = Math.floor(Math.random()*90)+10;
            return { txt: `${a} + ${b}`, ans: a+b };
        }
        if (d === 3) {
            const a = Math.floor(Math.random()*12)+2, b = Math.floor(Math.random()*10)+2, c = Math.floor(Math.random()*50)+10;
            return { txt: `${a} × ${b} + ${c}`, ans: a*b+c };
        }
        if (d === 4) {
            const a = Math.floor(Math.random()*20)+10, b = Math.floor(Math.random()*9)+2, c = Math.floor(Math.random()*100)+50;
            return { txt: `${a} × ${b} - ${c}`, ans: a*b-c };
        }
        const a = Math.floor(Math.random()*15)+10, b = Math.floor(Math.random()*15)+5, c = Math.floor(Math.random()*15)+10, d2 = Math.floor(Math.random()*10)+5;
        return { txt: `(${a} × ${b}) + (${c} × ${d2})`, ans: (a*b)+(c*d2) };
    }

    function genCode(d) {
        const c1 = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
        const c2 = "abcdefghijkmnopqrstuvwxyz";
        const c3 = "!@#$%^&*";
        let pool = c1, len = 5;
        if (d >= 3) { pool += c2; len = 10; }
        if (d === 5) { pool += c3; len = 16; }
        let res = "";
        for(let i=0; i<len; i++) res += pool[Math.floor(Math.random()*pool.length)];
        return res;
    }

    window.alarmApp = {
        edit: (id) => openModal(id),
        toggle: async (id, event) => {
            event.stopPropagation(); // Prevent card click event
            const a = state.alarms.find(x => x.id === id);
            if (a) {
                a.enabled = !a.enabled;
                await syncAndSchedule(a); // Reschedule/cancel notification
            }
        }
    };

    init();
})();