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

    let dom = {};

    function cacheDom() {
        dom.topClock = document.getElementById('top-clock');
        dom.banner = document.getElementById('next-alarm-banner');
        dom.alarmList = document.getElementById('alarm-list');
        dom.fab = document.getElementById('fab-add');
        dom.modal = document.getElementById('alarm-modal');
        dom.mTime = document.getElementById('edit-time');
        dom.mLabel = document.getElementById('edit-label');
        dom.mDiff = document.getElementById('edit-difficulty');
        dom.mRounds = document.getElementById('edit-rounds');
        dom.mDiffLabel = document.getElementById('val-diff-label');
        dom.mRoundsLabel = document.getElementById('val-rounds');
        dom.btnSave = document.getElementById('btn-save');
        dom.btnDelete = document.getElementById('btn-delete');
        dom.btnClose = document.getElementById('modal-close');
        dom.ringOverlay = document.getElementById('ringing-overlay');
        dom.ringClock = document.getElementById('ring-clock');
        dom.ringLabel = document.getElementById('ring-label');
        dom.ringInfo = document.getElementById('ring-task-info');
        dom.ringProgress = document.getElementById('ring-progress-bar');
        dom.ringFeedback = document.getElementById('ring-feedback');
        dom.taskBody = document.getElementById('task-body');
    }

    const diffNames = ["", "Лёгкий", "Обычный", "Средний", "Сложный", "Хардкор"];

    async function init() {
        cacheDom();

        if (Capacitor.isNativePlatform()) {
            try {
                await LocalNotifications.requestPermissions();
                LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
                    const alarmId = notificationAction.notification.extra.alarmId;
                    const alarm = state.alarms.find(a => a.id === alarmId);
                    if (alarm) startRinging(alarm);
                });
            } catch (e) {
                console.error("LocalNotifications init error:", e);
            }
        }

        renderList();
        updateBanner();
        bindEvents();
        setInterval(tick, 1000);
    }

    function tick() {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        if (dom.topClock) dom.topClock.textContent = timeStr;

        if (state.isRinging && dom.ringClock) {
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
        if (dom.fab) {
            dom.fab.addEventListener('click', () => openModal());
            dom.fab.addEventListener('touchstart', (e) => { e.preventDefault(); openModal(); });
        }
        if (dom.btnClose) {
            dom.btnClose.addEventListener('click', () => closeModal());
            dom.btnClose.addEventListener('touchstart', (e) => { e.preventDefault(); closeModal(); });
        }
        if (dom.mDiff) {
            dom.mDiff.addEventListener('input', () => {
                if (dom.mDiffLabel) dom.mDiffLabel.textContent = diffNames[dom.mDiff.value];
            });
        }
        if (dom.mRounds) {
            dom.mRounds.addEventListener('input', () => {
                if (dom.mRoundsLabel) dom.mRoundsLabel.textContent = dom.mRounds.value;
            });
        }
        if (dom.btnSave) {
            dom.btnSave.addEventListener('click', save);
            dom.btnSave.addEventListener('touchstart', (e) => { e.preventDefault(); save(); });
        }
        if (dom.btnDelete) {
            dom.btnDelete.addEventListener('click', del);
            dom.btnDelete.addEventListener('touchstart', (e) => { e.preventDefault(); del(); });
        }

        document.querySelectorAll('.radio-card').forEach(c => {
            const handleRadio = (e) => {
                e.preventDefault();
                const radio = c.querySelector('input');
                if (radio) {
                    radio.checked = true;
                    updateRadioUI();
                }
            };
            c.addEventListener('click', handleRadio);
            c.addEventListener('touchstart', handleRadio);
        });
    }

    function updateRadioUI() {
        document.querySelectorAll('.radio-card').forEach(c => {
            const radio = c.querySelector('input');
            c.classList.toggle('selected', radio && radio.checked);
        });
    }

    function openModal(id = null) {
        state.editingId = id;
        const a = id ? state.alarms.find(x => x.id === id) : null;
        if (dom.mTime) dom.mTime.value = a ? a.time : "07:30";
        if (dom.mLabel) dom.mLabel.value = a ? a.label : "";
        if (dom.mDiff) dom.mDiff.value = a ? a.difficulty : 3;
        if (dom.mRounds) dom.mRounds.value = a ? a.rounds : 5;
        if (dom.mDiffLabel) dom.mDiffLabel.textContent = diffNames[dom.mDiff.value];
        if (dom.mRoundsLabel) dom.mRoundsLabel.textContent = dom.mRounds.value;
        const mode = a ? a.mode : 'math';
        const modeInput = document.querySelector(`input[name="edit-mode"][value="${mode}"]`);
        if (modeInput) modeInput.checked = true;
        updateRadioUI();
        if (dom.btnDelete) dom.btnDelete.style.display = a ? "flex" : "none";
        if (dom.modal) dom.modal.classList.add('active');
    }

    function closeModal() {
        if (dom.modal) dom.modal.classList.remove('active');
    }

    async function save() {
        const newAlarm = {
            id: state.editingId || Date.now().toString(),
            time: dom.mTime ? dom.mTime.value : "07:30",
            label: dom.mLabel && dom.mLabel.value ? dom.mLabel.value : "Будильник",
            difficulty: dom.mDiff ? parseInt(dom.mDiff.value) : 3,
            rounds: dom.mRounds ? parseInt(dom.mRounds.value) : 5,
            mode: (document.querySelector('input[name="edit-mode"]:checked') || {}).value || 'math',
            enabled: true
        };

        if (state.editingId) {
            const i = state.alarms.findIndex(x => x.id === state.editingId);
            if (i !== -1) state.alarms[i] = newAlarm;
        } else {
            state.alarms.push(newAlarm);
        }

        await syncAndSchedule(newAlarm);
        closeModal();
    }

    async function del() {
        if (!state.editingId) return;
        if (Capacitor.isNativePlatform()) {
            try {
                await LocalNotifications.cancel({ notifications: [{ id: parseInt(state.editingId) }] });
            } catch (e) {
                console.error("Cancel notification error:", e);
            }
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
            try {
                await scheduleNotification(alarm);
            } catch (e) {
                console.error("Schedule notification error:", e);
            }
        }
    }

    function sync() {
        localStorage.setItem('alarms_v4', JSON.stringify(state.alarms));
        renderList();
        updateBanner();
    }

    function renderList() {
        if (!dom.alarmList) return;
        dom.alarmList.innerHTML = state.alarms.sort((a,b) => a.time.localeCompare(b.time)).map(a => `
            <div class="alarm-card ${a.enabled ? '' : 'disabled'}" data-alarm-id="${a.id}">
                <div class="alarm-card-left" data-action="edit" data-alarm-id="${a.id}">
                    <div class="alarm-card-time">${a.time}</div>
                    <div class="alarm-card-label">${a.label}</div>
                    <div class="alarm-card-meta">
                        <span class="badge difficulty-${a.difficulty}">${diffNames[a.difficulty]}</span>
                        <span class="badge">${a.mode.toUpperCase()} × ${a.rounds}</span>
                    </div>
                </div>
                <label class="switch" data-action="toggle" data-alarm-id="${a.id}">
                    <input type="checkbox" ${a.enabled ? 'checked' : ''} data-alarm-id="${a.id}">
                    <span class="slider"></span>
                </label>
            </div>
        `).join('');

        // Attach listeners securely via JS to ensure 100% click/touch responsiveness in WebView
        dom.alarmList.querySelectorAll('.alarm-card').forEach(card => {
            const alarmId = card.dataset.alarmId;
            const leftPart = card.querySelector('.alarm-card-left');
            const switchInput = card.querySelector('input[type="checkbox"]');

            const handleCardClick = (e) => {
                e.stopPropagation();
                openModal(alarmId);
            };

            const handleSwitchChange = async (e) => {
                e.stopPropagation();
                const a = state.alarms.find(x => x.id === alarmId);
                if (a) {
                    a.enabled = switchInput.checked;
                    await syncAndSchedule(a);
                }
            };

            if (leftPart) {
                leftPart.addEventListener('click', handleCardClick);
                leftPart.addEventListener('touchstart', (e) => { e.preventDefault(); handleCardClick(e); });
            }

            if (switchInput) {
                switchInput.addEventListener('change', handleSwitchChange);
                switchInput.addEventListener('click', (e) => e.stopPropagation());
            }
        });
    }

    function updateBanner() {
        if (!dom.banner) return;
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

    async function scheduleOrTrigger(alarm) {
        if (Capacitor.isNativePlatform()) {
            try {
                await scheduleNotification(alarm);
            } catch (e) {
                console.error("scheduleOrTrigger error:", e);
                startRinging(alarm);
            }
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
                    body: `Время: ${alarm.time}. Задание: ${diffNames[alarm.difficulty]} ${alarm.mode.toUpperCase()} (${alarm.rounds} раундов)`,
                    id: parseInt(alarm.id),
                    schedule: { at: fireDate, repeats: 'every day' },
                    sound: "res://platform_default",
                    wakeUpScreen: true,
                    foreground: true,
                    autoCancel: false,
                    extra: { alarmId: alarm.id }
                }
            ]
        });
    }

    function startRinging(alarm) {
        state.isRinging = true;
        state.activeAlarm = alarm;

        if (dom.ringLabel) dom.ringLabel.textContent = alarm.label || "Будильник";
        if (dom.ringOverlay) dom.ringOverlay.classList.remove('hidden');

        startSound();
        taskState = { step: 0, total: alarm.rounds, difficulty: alarm.difficulty, mode: alarm.mode };
        nextTask();

        if (Capacitor.isNativePlatform()) {
            LocalNotifications.cancel({ notifications: [{ id: parseInt(alarm.id) }] }).catch(() => {});
            if (alarm.enabled) scheduleNotification(alarm).catch(() => {});
        }
    }

    function startSound() {
        try {
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
                if (!sirenOsc[0] || !sirenOsc[1]) return;
                const f1 = up ? 550 : 440, f2 = up ? 880 : 660;
                sirenOsc[0].frequency.exponentialRampToValueAtTime(f1, audioCtx.currentTime + 0.3);
                sirenOsc[1].frequency.exponentialRampToValueAtTime(f2, audioCtx.currentTime + 0.3);
                up = !up;
            }, 400);
        } catch (e) {
            console.error("Audio start error:", e);
        }

        try {
            if ('wakeLock' in navigator) {
                navigator.wakeLock.request('screen').then(l => wakeLock = l).catch(() => {});
            }
        } catch (e) {
            console.error("WakeLock error:", e);
        }
    }

    async function stopSound() {
        if (sirenTimer) clearInterval(sirenTimer);
        sirenOsc.forEach(o => { try{o.stop();}catch(e){} });
        sirenOsc = [];
        if (sirenGain) { sirenGain.gain.value = 0; sirenGain = null; }
        if (wakeLock) { try { await wakeLock.release(); } catch(e){} wakeLock = null; }

        if (Capacitor.isNativePlatform() && state.activeAlarm && state.activeAlarm.enabled) {
            try {
                await LocalNotifications.cancel({ notifications: [{ id: parseInt(state.activeAlarm.id) }] });
                await scheduleNotification(state.activeAlarm);
            } catch (e) {}
        }
    }

    function nextTask() {
        taskState.step++;
        if (taskState.step > taskState.total) {
            state.isRinging = false;
            stopSound();
            if (dom.ringOverlay) dom.ringOverlay.classList.add('hidden');
            return;
        }
        updateProgress();
        renderTask();
    }

    function updateProgress() {
        if (dom.ringInfo) dom.ringInfo.textContent = `Уровень ${taskState.difficulty} • Задание ${taskState.step} из ${taskState.total}`;
        if (dom.ringProgress) dom.ringProgress.style.width = `${(taskState.step-1)/taskState.total * 100}%`;
    }

    function renderTask() {
        if (!dom.taskBody) return;
        dom.taskBody.innerHTML = "";
        if (dom.ringFeedback) dom.ringFeedback.textContent = "";
        const d = taskState.difficulty;

        if (taskState.mode === 'math') {
            const p = genMath(d);
            taskState.currentAnswer = p.ans;
            dom.taskBody.innerHTML = `
                <div style="font-size:1.8rem; text-align:center; margin-bottom:20px; font-weight:800;">${p.txt} = ?</div>
                <input type="number" id="ans-in" class="input-code" autofocus inputmode="numeric">
            `;
            const input = document.getElementById('ans-in');
            if (input) {
                const checkMath = () => {
                    if (parseInt(input.value) === taskState.currentAnswer) nextTask();
                };
                input.addEventListener('input', checkMath);
                input.addEventListener('keyup', checkMath);
            }
        } else if (taskState.mode === 'memory') {
            const size = d <= 2 ? 3 : (d <= 4 ? 4 : 5);
            const count = 2 + d;
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
                    if (t) {
                        t.classList.add('lit');
                        setTimeout(() => t.classList.remove('lit'), speed/2);
                    }
                    i++;
                } else {
                    clearInterval(itv);
                    taskState.memoryPlaying = false;
                    if (dom.ringFeedback) dom.ringFeedback.textContent = "Повторите!";
                }
            }, speed);

            const handleTileClick = (e) => {
                if (taskState.memoryPlaying) return;
                const t = e.target.closest('.memory-tile');
                if (!t) return;
                const idx = parseInt(t.dataset.idx);
                t.classList.add('active');
                setTimeout(() => t.classList.remove('active'), 100);

                if (idx === taskState.memorySequence[taskState.memoryUserIdx]) {
                    taskState.memoryUserIdx++;
                    if (taskState.memoryUserIdx === taskState.memorySequence.length) nextTask();
                } else {
                    if (dom.ringFeedback) dom.ringFeedback.textContent = "Ошибка!";
                    taskState.step = 0;
                    setTimeout(nextTask, 500);
                }
            };

            grid.addEventListener('click', handleTileClick);
            grid.addEventListener('touchstart', (e) => { e.preventDefault(); handleTileClick(e); });
        } else {
            const code = genCode(d);
            taskState.currentAnswer = code;
            dom.taskBody.innerHTML = `
                <div style="font-size:1.5rem; text-align:center; margin-bottom:15px; font-family:monospace; letter-spacing:4px; color:var(--accent-cyan);">${code}</div>
                <input type="text" id="code-in" class="input-code" placeholder="Введите код" autofocus style="text-transform:none;">
            `;
            const input = document.getElementById('code-in');
            if (input) {
                const checkCode = () => {
                    if (input.value.trim() === taskState.currentAnswer) nextTask();
                };
                input.addEventListener('input', checkCode);
                input.addEventListener('keyup', checkCode);
            }
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
            event.stopPropagation();
            const a = state.alarms.find(x => x.id === id);
            if (a) {
                a.enabled = !a.enabled;
                await syncAndSchedule(a);
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
